import { generateText } from "ai"
import { google } from "../models/google"
import { JobInfoTable } from "@/drizzle/schema"

export async function generateIdealAnswer({
  question,
  jobInfo,
  context,
}: {
  question: string
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel"
  >
  context?: string
}) {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: question,
    system: `You are an expert interview coach. Your task is to provide an ideal answer to an interview question based on the job requirements.

Job Title: ${jobInfo.title}
Job Description: ${jobInfo.description}
Experience Level: ${jobInfo.experienceLevel}

${context ? `\nAdditional Context:\n${context}\n` : ""}

Question: ${question}

Instructions:
- Provide a comprehensive, well-structured answer that would impress an interviewer
- Tailor the answer to the specific job role and experience level
- Include specific examples and concrete details
- Structure the answer clearly (use bullet points or short paragraphs)
- Make it professional but authentic
- The answer should demonstrate expertise relevant to the role
- Keep it concise but thorough (aim for 2-4 paragraphs or equivalent in bullet points)
- Use markdown formatting for better readability

Output the ideal answer in markdown format. Do not include any meta-commentary or explanations about the answer itself.`,
  })

  return text.trim()
}

