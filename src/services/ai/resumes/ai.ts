import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { aiAnalyzeSchema } from "./schemas";
import { JobInfoTable } from "@/drizzle/schema";

export async function analyzeResumeForJob({
  resumeFile,
  jobInfo,
}: {
  resumeFile: File;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "experienceLevel" | "description"
  >;
}) {
  return streamObject({
    model: google("gemini-2.5-flash"),
    schema: aiAnalyzeSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: await resumeFile.arrayBuffer(),
            mimeType: resumeFile.type,
          },
          {
            type: "text",
            text: `Please analyze this resume for the following job position:\n\nJob Title: ${
              jobInfo.title || "Not specified"
            }\nExperience Level: ${
              jobInfo.experienceLevel
            }\n\nJob Description:\n${jobInfo.description}`,
          },
        ],
      },
    ],
    system: `You are an expert resume reviewer specializing in job-specific evaluation.

Analyze the resume for this specific job posting and provide detailed feedback across multiple dimensions.

For each category (ATS, jobMatch, writing, keywords, overall), provide:
- score (1-10): Rating in that category
- summary: Brief high-level assessment
- feedback: Array of specific, actionable feedback items

Focus on how well the resume matches THIS specific job description.`,
  });
}

export async function refineResumeWithInterviewFeedback({
  resumeFile,
  jobInfo,
  interviewFeedback,
}: {
  resumeFile: File;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "experienceLevel" | "description"
  >;
  interviewFeedback: string;
}) {
  return streamObject({
    model: google("gemini-2.5-flash"),
    schema: aiAnalyzeSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: await resumeFile.arrayBuffer(),
            mimeType: resumeFile.type,
          },
          {
            type: "text",
            text: `Interview Feedback:\n\n${interviewFeedback}\n\n---\n\nPlease analyze this resume considering the interview feedback above.`,
          },
        ],
      },
    ],
    system: `You are an expert resume reviewer and hiring advisor with deep experience in interview preparation.

You have received:
1. A candidate's resume
2. Detailed feedback from a recent interview

Your task is to analyze the resume and provide recommendations that SPECIFICALLY ADDRESS the interview feedback.

Job Information:
- Title: ${jobInfo.title || "Not specified"}
- Experience Level: ${jobInfo.experienceLevel}
- Description: ${jobInfo.description}

---

CRITICAL ANALYSIS PRIORITIES:

1. Interview Performance Alignment
   - Identify skills the candidate demonstrated well in the interview that should be more prominent in the resume
   - Identify areas where the candidate struggled, indicating gaps or missing clarity that should be addressed
   - Highlight technical knowledge shown in the interview that isn't clearly represented in the resume

2. Communication Gaps
   - Note any areas where the resume wording was unclear or misrepresented what the candidate can do
   - Suggest resume improvements to better communicate demonstrated expertise

3. Missing Experience Documentation
   - Identify experiences or skills mentioned in the interview that should be added to the resume
   - Recommend restructuring or reordering to better highlight strengths shown in the interview

For each category (ATS, jobMatch, writing, keywords, overall), provide:
- score (1-10): Rating considering BOTH resume quality and interview feedback alignment
- summary: Brief assessment focusing on interview-informed recommendations
- feedback: Array of specific feedback items, PRIORITIZING items that address interview performance gaps

Be direct, constructive, and actionable. Frame recommendations as opportunities to better reflect the candidate's demonstrated capabilities.`,
  });
}
