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

  const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
  const resumeFileBase64 = resumeBuffer.toString("base64");
  const resumePlainText = await extractResumePlainText({
    buffer: resumeBuffer,
    mimeType: resumeFile.type,
  });

  try {
    const result = await analyzeResumeForJob({
      resumeFile,
      jobInfo,
      onFinish: async (analysis) => {
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
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    
    // Provide user-friendly error messages
    const errorMessage = error.message?.toLowerCase() || "";
    let userMessage = "Failed to analyze resume. Please try again.";
    
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      userMessage = "The AI service is currently busy. Please try again in a few moments.";
    } else if (errorMessage.includes("timeout")) {
      userMessage = "The analysis took too long. Please try again with a smaller file.";
    } else if (errorMessage.includes("overload") || errorMessage.includes("service unavailable")) {
      userMessage = "The AI service is temporarily unavailable. Please try again shortly.";
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
