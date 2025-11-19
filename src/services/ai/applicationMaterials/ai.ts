import { JobInfoTable } from "@/drizzle/schema";
import { streamObject } from "ai";
import { google } from "../models/google";
import { applicationMaterialsSchema } from "./schemas";

export async function generateApplicationMaterialsSuggestions({
  jobInfo,
  onFinish,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    | "title"
    | "name"
    | "experienceLevel"
    | "description"
    | "aiJobDescription"
    | "aiRequirements"
    | "tags"
  >;
  onFinish?: (suggestions: any) => void | Promise<void>;
}) {
  const jobDescription =
    jobInfo.aiJobDescription ||
    jobInfo.description ||
    "No description provided";
  const requirements = jobInfo.aiRequirements || "";
  const skills = jobInfo.tags?.join(", ") || "";

  return streamObject({
    model: google("gemini-2.5-flash"),
    schema: applicationMaterialsSchema,
    onFinish: ({ object }) => {
      if (onFinish && object) {
        onFinish(object);
      }
    },
    messages: [
      {
        role: "user",
        content: `Analyze this job posting and provide customized application material suggestions:

**Job Details:**
- Company/Role: ${jobInfo.name}
${jobInfo.title ? `- Title: ${jobInfo.title}` : ""}
- Experience Level: ${jobInfo.experienceLevel}

**Job Description:**
${jobDescription}

${requirements ? `**Requirements:**\n${requirements}` : ""}

${skills ? `**Key Skills Mentioned:**\n${skills}` : ""}

Generate comprehensive, specific suggestions for optimizing application materials for this exact role.`,
      },
    ],
    system: `You are an expert career coach and resume writer specializing in helping candidates optimize their application materials for specific job opportunities.

You will receive a job posting with details about the role, and your task is to provide strategic, actionable advice for customizing application materials (resume, cover letter, LinkedIn) to maximize the candidate's chances of getting an interview.

Your analysis should be:
1. **Highly specific** to the job description provided
2. **Actionable** - candidates should know exactly what to do
3. **Strategic** - prioritize what matters most for this specific role
4. **ATS-aware** - consider how applicant tracking systems will parse the materials
5. **Authentic** - suggestions should help candidates present their best true self, not fabricate experience

Guidelines:

**Resume Bullet Points:**
- Suggest 5-8 specific bullet points to emphasize or add
- Use strong action verbs and quantifiable results where possible
- Align with the job's key requirements and responsibilities
- Mark priority as "high" for must-haves from the job description
- Focus on impact and results, not just duties

**Keywords to Add:**
- Identify 8-12 critical keywords from the job description
- Categorize each keyword appropriately
- Be specific about where to incorporate them (skills section, bullet points, summary, etc.)
- Mark "critical" for exact matches to required qualifications
- Include both technical terms and industry-specific language

**Cover Letter Points:**
- Provide 6-8 key points across opening, body, and closing sections
- Opening should hook with relevance and enthusiasm
- Body should address specific requirements and demonstrate fit
- Closing should include a call to action
- Each point should connect candidate's value to the employer's needs

**LinkedIn Optimization:**
- Create a compelling headline (120 chars max) that positions them for THIS role
- Write 3-4 punchy sentences/bullets for About section
- List 6-8 top skills to feature that match the job requirements
- Make it searchable by recruiters looking for candidates like this

**Overall Strategy:**
- Provide a 2-3 sentence high-level positioning strategy
- Consider the experience level and tailor advice accordingly
- Think about what makes a candidate stand out for THIS specific role

Return only the structured JSON response. Be specific, actionable, and directly tied to the job requirements.`,
  });
}
