import {
  pgTable,
  varchar,
  text,
  json,
  integer,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id } from "../schemaHelpers";
import { ProblemTable } from "./problem";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";

export const submissionStatusEnum = pgEnum("submission_status", [
  "PENDING",
  "RUNNING",
  "PASSED",
  "FAILED",
  "RUNTIME_ERROR",
]);

export const SubmissionTable = pgTable("submissions", {
  id,
  userId: varchar("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => ProblemTable.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 50 }).notNull(),
  sourceCode: text("source_code").notNull(),
  status: submissionStatusEnum("status").notNull().default("PENDING"),
  results: json("results"),
  runtimeMs: integer("runtime_ms"),
  memoryMb: integer("memory_mb"),
  createdAt,
});

export const SubmissionRelations = relations(SubmissionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [SubmissionTable.userId],
    references: [UserTable.id],
  }),
  problem: one(ProblemTable, {
    fields: [SubmissionTable.problemId],
    references: [ProblemTable.id],
  }),
}));
