import {
  pgTable,
  text,
  varchar,
  json,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt, id } from "../schemaHelpers";
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";
import { TestCaseTable } from "./testCase";
import { SubmissionTable } from "./submission";

export const problemDifficultyEnum = pgEnum("problem_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);

export const ProblemTable = pgTable("problems", {
  id,
  jobInfoId: uuid("job_info_id").references(() => JobInfoTable.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: problemDifficultyEnum("difficulty").notNull(),
  inputDescription: text("input_description"),
  outputDescription: text("output_description"),
  examples: json("examples"),
  constraints: text("constraints"),
  supportedLanguages: json("supported_languages").$type<string[]>(),
  starterCode: json("starter_code").$type<Record<string, string>>(),
  referenceSolution: json("reference_solution").$type<Record<string, string>>(),
  functionName: varchar("function_name", { length: 255 }),
  createdAt,
  updatedAt,
});

export const ProblemRelations = relations(ProblemTable, ({ one, many }) => ({
  jobInfo: one(JobInfoTable, {
    fields: [ProblemTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
  testCases: many(TestCaseTable),
  submissions: many(SubmissionTable),
}));
