import { pgTable, text, boolean, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "../schemaHelpers";
import { ProblemTable } from "./problem";
import { relations } from "drizzle-orm";

export const TestCaseTable = pgTable("test_cases", {
  id,
  problemId: uuid("problem_id")
    .notNull()
    .references(() => ProblemTable.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt,
});

export const TestCaseRelations = relations(TestCaseTable, ({ one }) => ({
  problem: one(ProblemTable, {
    fields: [TestCaseTable.problemId],
    references: [ProblemTable.id],
  }),
}));
