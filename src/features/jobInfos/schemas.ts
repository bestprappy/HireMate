import { experienceLevels } from "@/drizzle/schema";
import z from "zod";

export const jobInfoSchema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string().min(1).nullable(),
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, "Required"),
  aiSummary: z.string().nullable().optional(),
  aiJobDescription: z.string().nullable().optional(),
  aiRequirements: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  location: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  isAiProcessed: z.boolean().optional(),
});
