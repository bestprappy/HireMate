import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { createResumeVersion } from "@/features/resumeVersions/db";
import { extractResumePlainText } from "@/lib/extractResumePlainText";
import { Buffer } from "node:buffer";

// Retry configuration for handling model overload
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds - much longer initial delay
const MAX_RETRY_DELAY = 60000; // 60 seconds - very long max delay
const BASE_DELAY = 3000; // 3 second base delay before first attempt to reduce load

// Simple in-memory rate limiter to prevent too many concurrent requests
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 2; // Only allow 2 concurrent analyses
const requestQueue: Array<() => void> = [];

/**
 * Exponential backoff with jitter
 */
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  // Add jitter (0-2 seconds) to prevent thundering herd
  return delay + Math.random() * 2000;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || "";
  const errorStatus = error.status || error.statusCode;
  const errorCode = error.code?.toLowerCase() || "";

  return (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("quota") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("overload") ||
    errorMessage.includes("service unavailable") ||
    errorMessage.includes("resource exhausted") ||
    errorMessage.includes("too many requests") ||
    errorCode.includes("rate_limit") ||
    errorCode.includes("quota") ||
    errorStatus === 429 ||
    errorStatus === 503 ||
    errorStatus === 502 ||
    errorStatus === 504 ||
    (errorStatus >= 500 && errorStatus < 600)
  );
}

/**
 * Wait for available slot in rate limiter
 */
async function waitForSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    return;
  }

  // Wait in queue
  return new Promise((resolve) => {
    requestQueue.push(() => {
      activeRequests++;
      resolve();
    });
  });
}

/**
 * Release slot in rate limiter
 */
function releaseSlot(): void {
  activeRequests--;
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

/**
 * Execute analysis with retry logic and rate limiting
 * Note: streamObject returns immediately, so we retry the entire function call
 */
async function executeAnalysisWithRetry(
  resumeFile: File,
  jobInfo: any,
  onFinish: (analysis: any) => Promise<void>,
  attempt = 0
): Promise<Response> {
  // Wait for rate limiter slot
  await waitForSlot();

  try {
    // Add delay before each attempt to reduce load
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1);
      console.log(
        `Waiting ${Math.round(delay)}ms before retry attempt ${attempt + 1}/${
          MAX_RETRIES + 1
        }`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      // Initial delay to reduce burst load
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY));
    }

    const result = await analyzeResumeForJob({
      resumeFile,
      jobInfo,
      onFinish,
    });

    // Note: We release the slot immediately after getting the stream
    // The actual API call happens asynchronously during streaming
    // This allows the next request to start while the previous one streams
    releaseSlot();

    return result.toTextStreamResponse();
  } catch (error: any) {
    releaseSlot();
    console.error(`Resume analysis attempt ${attempt + 1} failed:`, error);

    if (attempt < MAX_RETRIES && isRetryableError(error)) {
      // Retry with exponential backoff
      return executeAnalysisWithRetry(
        resumeFile,
        jobInfo,
        onFinish,
        attempt + 1
      );
    }

    throw error;
  }
}

export async function POST(req: Request) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  let resumeBuffer: Buffer;
  let resumeFileBase64: string;
  let resumePlainText: string | null;

  try {
    resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    resumeFileBase64 = resumeBuffer.toString("base64");
    resumePlainText = await extractResumePlainText({
      buffer: resumeBuffer,
      mimeType: resumeFile.type,
    });
  } catch (error) {
    console.error("Error processing resume file:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process resume file. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Execute analysis with retry logic
  try {
    return await executeAnalysisWithRetry(
      resumeFile,
      jobInfo,
      async (analysis) => {
        try {
          await createResumeVersion({
            userId,
            jobInfoId,
            fileName: resumeFile.name ?? null,
            fileType: resumeFile.type ?? null,
            fileSize: resumeFile.size ?? null,
            resumeFileBase64,
            resumePlainText,
            analysis,
          });
        } catch (error) {
          console.error("Failed to store resume version:", error);
          // Don't throw - analysis succeeded even if saving failed
        }
      }
    );
  } catch (error: any) {
    console.error("Resume analysis error:", error);

    // Provide user-friendly error messages
    const errorMessage = error.message?.toLowerCase() || "";
    let userMessage = "Failed to analyze resume. Please try again.";

    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      userMessage =
        "The AI service is currently busy. Please try again in a few moments.";
    } else if (errorMessage.includes("timeout")) {
      userMessage =
        "The analysis took too long. Please try again with a smaller file.";
    } else if (
      errorMessage.includes("overload") ||
      errorMessage.includes("service unavailable")
    ) {
      userMessage =
        "The AI service is temporarily unavailable. Please try again shortly.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
