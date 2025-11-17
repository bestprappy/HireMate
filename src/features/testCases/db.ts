import { db } from "@/drizzle/db";
import { TestCaseTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function insertTestCases(
  testCases: Array<typeof TestCaseTable.$inferInsert>
) {
  return db.insert(TestCaseTable).values(testCases).returning();
}

export async function getTestCasesByProblemId(problemId: string) {
  return db.query.TestCaseTable.findMany({
    where: eq(TestCaseTable.problemId, problemId),
  });
}
