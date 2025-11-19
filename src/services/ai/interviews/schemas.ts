import z from "zod"

const feedbackItemSchema = z.object({
  type: z.enum(["strength", "minor-improvement", "major-improvement"]),
  name: z.string().describe("Name of the feedback point"),
  message: z.string().describe("Description of the feedback"),
})

const categorySchema = z.object({
  score: z.number().min(0).max(10).describe("Score of the category from 0-10"),
  summary: z.string().describe("Short summary of the category performance"),
  feedback: z
    .array(feedbackItemSchema)
    .describe("Specific feedback on positives and negatives"),
})

export const interviewFeedbackSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(10)
    .describe("Overall interview performance score"),
  communicationClarity: categorySchema.describe(
    "Analysis of communication clarity and articulation"
  ),
  confidenceAndEmotionalState: categorySchema.describe(
    "Analysis of confidence level and emotional state during the interview"
  ),
  responseQuality: categorySchema.describe(
    "Analysis of the quality and relevance of responses"
  ),
  pacingAndTiming: categorySchema.describe(
    "Analysis of response timing and pacing"
  ),
  engagementAndInteraction: categorySchema.describe(
    "Analysis of engagement level and interaction with the interviewer"
  ),
  roleFitAndAlignment: categorySchema.describe(
    "Analysis of how well the candidate fits the role requirements"
  ),
})

export type InterviewFeedback = z.infer<typeof interviewFeedbackSchema>

