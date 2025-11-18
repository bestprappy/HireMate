import { z } from "zod";

const categorySchema = z.object({
  score: z.number().int().min(1).max(10),
  summary: z.string(),
  feedback: z.array(z.string()),
});

export const aiAnalyzeSchema = z.object({
  ATS: categorySchema.optional(),
  ats: categorySchema.optional(),
  jobMatch: categorySchema.optional(),
  job_match: categorySchema.optional(),
  writing: categorySchema.optional(),
  keywords: categorySchema.optional(),
  overall: categorySchema,
});

export type AiAnalyze = z.infer<typeof aiAnalyzeSchema>;
