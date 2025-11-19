import { JobInfoTable } from "@/drizzle/schema";
import { streamObject } from "ai";
import { google } from "../models/google";
import { aiAnalyzeSchema } from "./schemas";
import z from "zod";

// Retry configuration for handling model overload
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 120000; // 2 minutes

/**
 * Exponential backoff delay calculator
 */
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Check if error is retryable (rate limit, timeout, or server error)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || "";
  const errorStatus = error.status || error.statusCode;
  
  // Retry on rate limits, timeouts, and 5xx errors
  return (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("quota") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("overload") ||
    errorMessage.includes("service unavailable") ||
    errorStatus === 429 ||
    errorStatus === 503 ||
    errorStatus === 502 ||
    (errorStatus >= 500 && errorStatus < 600)
  );
}

/**
 * Execute with retry logic
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  attempt = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (attempt < MAX_RETRIES && isRetryableError(error)) {
      const delay = getRetryDelay(attempt);
      console.log(
        `Resume analysis retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`,
        error.message
      );
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      return executeWithRetry(fn, attempt + 1);
    }
    throw error;
  }
}

export async function analyzeResumeForJob({
  resumeFile,
  jobInfo,
  onFinish,
}: {
  resumeFile: File;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "experienceLevel" | "description"
  >;
  onFinish?: (
    analysis: z.infer<typeof aiAnalyzeSchema>
  ) => void | Promise<void>;
}) {
  // Truncate job description if too long to reduce token usage
  const maxDescriptionLength = 3000;
  const truncatedDescription =
    jobInfo.description.length > maxDescriptionLength
      ? jobInfo.description.substring(0, maxDescriptionLength) + "..."
      : jobInfo.description;

  return executeWithRetry(async () => {
    return streamObject({
      model: google("gemini-2.5-flash"),
      schema: aiAnalyzeSchema,
      onFinish: async ({ object }) => {
        if (onFinish && object) {
          await onFinish(object);
        }
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: await resumeFile.arrayBuffer(),
              mimeType: resumeFile.type,
            },
          ],
        },
      ],
      system: `You are an expert resume reviewer and hiring advisor.

You will receive a candidate's resume as a file in the user prompt. This resume is being used to apply for a job with the following information:

Job Description:
\`\`\`
${truncatedDescription}
\`\`\`
Experience Level: ${jobInfo.experienceLevel}
${jobInfo.title ? `\nJob Title: ${jobInfo.title}` : ""}

Your task is to evaluate the resume against the job requirements and provide structured feedback using the following categories:

1. **ats** - Analysis of how well the resume matches ATS (Applicant Tracking System) requirements.
   - Consider layout simplicity, use of standard section headings, avoidance of graphics or columns, consistent formatting, etc.

2. **jobMatch** - Analysis of how well the resume aligns with the job description and experience level.
   - Assess skills, technologies, achievements, and relevance.

3. **writingAndFormatting** - Analysis of the writing quality, tone, grammar, clarity, and formatting.
   - Comment on structure, readability, section organization, and consistency.
   - Be sure to consider the wording and formatting of the job description when evaluating the resume so you can recommend specific wording or formatting changes that would improve the resume's alignment with the job requirements.

4. **keywordCoverage** - Analysis of how well the resume includes keywords or terminology from the job description.
   - Highlight missing or well-used terms that might help with ATS matching and recruiter readability.
   - Be sure to consider the keywords used in the job description when evaluating the resume so you can recommend specific keywords that would improve the resume's alignment with the job requirements.

5. **other** - Any other relevant feedback not captured above.
   - This may include things like missing contact info, outdated technologies, major red flags, or career gaps.

For each category, return:
- \`score\` (1-10): A number rating the resume in that category.
- \`summary\`: A short, high-level summary of your evaluation.
- \`feedback\`: An array of structured feedback items:
  - \`type\`: One of \`"strength"\`, \`"minor-improvement"\`, or \`"major-improvement"\`
  - \`name\`: A label for the feedback item.
  - \`message\`: A specific and helpful explanation or recommendation.

Also return an overall score for the resume from 1-10 based on your analysis.

Only return the structured JSON response as defined by the schema. Do not include explanations, markdown, or extra commentary outside the defined format.

Other Guidelines:
- Tailor your analysis and feedback to the specific job description and experience level provided.
- Be clear, constructive, and actionable. The goal is to help the candidate improve their resume so it is ok to be critical.
- Refer to the candidate as "you" in your feedback. This feedback should be written as if you were speaking directly to the candidate.
- Stop generating output as soon you have provided the full feedback.
`,
    });
  });
}
