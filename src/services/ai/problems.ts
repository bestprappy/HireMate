import { generateObject } from "ai";
import { google } from "./models/google";
import { z } from "zod";

const GeneratedProblemSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  inputDescription: z.string().min(1, "Input description is required."),
  outputDescription: z.string().min(1, "Output description is required."),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().optional(),
      })
    )
    .min(1, "At least one example is required."),
  constraints: z.string().min(1, "Constraints are required."),
  functionName: z.string().min(1, "Function name is required."),
  starterCode: z.object({
    javascript: z.string().min(1, "JavaScript starter code is required."),
    typescript: z.string().min(1, "TypeScript starter code is required."),
  }),
  referenceSolution: z.object({
    javascript: z.string().min(1, "JavaScript reference solution is required."),
    typescript: z.string().min(1, "TypeScript reference solution is required."),
  }),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean(),
      })
    )
    .min(1, "At least one test case is required."),
});

type GeneratedProblem = z.infer<typeof GeneratedProblemSchema>;

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export async function generateCodingProblem(
  jobTitle: string,
  jobDescription: string,
  difficulty: Difficulty
): Promise<GeneratedProblem> {
  const difficultyGuide = {
    EASY: "Basic problem that tests fundamental programming concepts like arrays, strings, or hash maps. Should be solvable in 10-15 minutes.",
    MEDIUM:
      "Intermediate problem requiring knowledge of data structures (stacks, queues, trees) or algorithms (two pointers, sliding window, BFS/DFS). Should take 20-30 minutes.",
    HARD: "Advanced problem involving complex algorithms, dynamic programming, or graph theory. Should take 30-45 minutes.",
  };

  const prompt = `Generate a LeetCode-style coding problem for this job:

Job: ${jobTitle}
Description: ${jobDescription}
Difficulty: ${difficulty} - ${difficultyGuide[difficulty]}

Requirements:
- Problem relevant to job skills
- Clear problem statement with 2-3 examples
- Constraints
- Descriptive camelCase function name
- Starter code in JavaScript and TypeScript
- Working solutions in both languages
- 4-5 test cases (last 2 hidden)
- Test inputs as JSON objects with parameter names
- Expected outputs as JSON strings`;

  try {
    const { object: problem } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: GeneratedProblemSchema,
      prompt,
      temperature: 0.5,
      maxTokens: 15000,
    });
    return problem;
  } catch (error) {
    console.error("=== AI Response Parsing Error ===");
    console.error("Error:", error);
    console.error("================================");
    throw new Error(
      `Failed to generate valid problem: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
