import { JobInfoTable } from "@/drizzle/schema";
import { streamText } from "ai";
import z from "zod";
import { google } from "./models/google";

export type JobMetadata = {
  summary: string;
  jobDescription: string;
  requirements: string;
  tags: string[];
  location: string | null;
  salary: string | null;
};

const jobMetadataSchema = z.object({
  summary: z.string().catch(""),
  jobDescription: z.string().catch(""),
  requirements: z.string().catch(""),
  tags: z.array(z.string()).catch([]),
  location: z.string().nullable().catch(null),
  salary: z.string().nullable().catch(null),
});

export function generateJobAnalysis({
  jobInfo,
  onFinish,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel" | "name"
  >;
  onFinish: (metadata: JobMetadata) => void;
}) {
  return streamText({
    model: google("gemini-2.5-flash"),
    onFinish: ({ text }) => {
      try {
        const metadata = parseJobMetadata(text);
        onFinish(metadata);
      } catch (error) {
        console.error("Failed to parse job metadata:", error);
        // Fallback to basic metadata
        onFinish({
          summary: jobInfo.description.substring(0, 200) + "...",
          jobDescription: "",
          requirements: "",
          tags: [],
          location: null,
          salary: null,
        });
      }
    },
    prompt: `Analyze the following job posting and extract structured information.

Job Information:
- Job Name: ${jobInfo.name}
${jobInfo.title ? `- Job Title: ${jobInfo.title}` : ""}
- Experience Level: ${jobInfo.experienceLevel}
- Description: ${jobInfo.description}

Your task is to:
1. Generate a concise AI summary with 3-5 bullet points highlighting key responsibilities and requirements
2. Generate a formatted Job Description section with detailed paragraphs about the role, company, and what they're looking for
3. Generate a Requirements section with bullet points for qualifications, skills, and experience needed
4. Extract relevant skill tags (technologies, frameworks, languages, tools, methodologies)
5. Detect the location if mentioned (city, country, or "Remote")
6. Extract salary information if mentioned (format as range or single value)

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
  "jobDescription": "Detailed paragraph about the role and company. Can be multiple paragraphs separated by \\n\\n",
  "requirements": "• Requirement 1\\n• Requirement 2\\n• Requirement 3",
  "tags": ["skill1", "skill2", "skill3", ...],
  "location": "location or null",
  "salary": "salary info or null"
}

Rules:
- Summary MUST be formatted as bullet points (use • or - as bullet markers)
- Each bullet point should be concise (one line)
- Include 3-5 bullet points covering key responsibilities, requirements, or highlights
- Job Description should be 2-3 paragraphs of detailed prose about the role
- Requirements should be formatted as bullet points
- Extract 5-10 most relevant skill tags (prioritize technical skills)
- Return null for location/salary if not found in the description
- Ensure valid JSON format with proper escaping of newlines (\\n)
- Do not include any markdown formatting or code blocks
- Return ONLY the JSON object, nothing else`,
  });
}

function parseJobMetadata(text: string): JobMetadata {
  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/```\n?/g, "");
  }

  // Some models prepend explanatory text before/after the JSON.
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.slice(firstBrace, lastBrace + 1);
  }

  // Normalize smart quotes or other unicode quotes that break JSON.parse
  cleanText = cleanText
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');

  const parsed = JSON.parse(cleanText);
  const validated = jobMetadataSchema.parse(parsed);

  return validated;
}
