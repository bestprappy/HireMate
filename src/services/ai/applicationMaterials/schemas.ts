import z from "zod";

export const applicationMaterialsSchema = z.object({
  resumeBulletPoints: z
    .array(
      z.object({
        suggestion: z
          .string()
          .describe("A specific resume bullet point to emphasize or add"),
        reasoning: z
          .string()
          .describe("Why this bullet point is important for this job"),
        priority: z
          .enum(["high", "medium", "low"])
          .describe("Priority level for this suggestion"),
      })
    )
    .describe("Suggested resume bullet points tailored to the job description"),

  keywordsToAdd: z
    .array(
      z.object({
        keyword: z
          .string()
          .describe("A keyword or phrase to add to the resume"),
        category: z
          .enum([
            "technical-skill",
            "soft-skill",
            "tool",
            "methodology",
            "certification",
            "industry-term",
          ])
          .describe("Category of the keyword"),
        whereToAdd: z
          .string()
          .describe("Suggestion for where to incorporate this keyword"),
        importance: z
          .enum(["critical", "important", "nice-to-have"])
          .describe("Importance level for ATS and recruiters"),
      })
    )
    .describe("Keywords that should be added to improve ATS match"),

  coverLetterPoints: z
    .array(
      z.object({
        point: z
          .string()
          .describe("A specific point to include in the cover letter"),
        section: z
          .enum(["opening", "body", "closing"])
          .describe("Which section of the cover letter this belongs to"),
        focus: z
          .string()
          .describe(
            "What this point addresses (e.g., specific requirement, company value)"
          ),
      })
    )
    .describe("Key points to include in a cover letter for this job"),

  linkedInOptimization: z.object({
    headline: z
      .string()
      .describe(
        "Optimized LinkedIn headline that positions candidate for this role"
      ),
    about: z
      .array(z.string())
      .describe(
        "3-4 key sentences or bullet points for LinkedIn About section"
      ),
    skillsToHighlight: z
      .array(z.string())
      .describe("Top skills to feature prominently on LinkedIn"),
  }),

  overallStrategy: z
    .string()
    .describe(
      "High-level strategy for positioning yourself for this specific role"
    ),
});

export type ApplicationMaterialsAnalysis = z.infer<
  typeof applicationMaterialsSchema
>;
