import { db } from "@/drizzle/db";
import { ProblemTable } from "@/drizzle/schema";
import { revalidateProblemCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertProblem(problem: typeof ProblemTable.$inferInsert) {
  const [newProblem] = await db.insert(ProblemTable).values(problem).returning({
    id: ProblemTable.id,
    jobInfoId: ProblemTable.jobInfoId,
  });

  if (newProblem.jobInfoId) {
    revalidateProblemCache(newProblem);
  }

  return newProblem;
}

export async function deleteProblem(id: string) {
  const [deletedProblem] = await db
    .delete(ProblemTable)
    .where(eq(ProblemTable.id, id))
    .returning({
      id: ProblemTable.id,
      jobInfoId: ProblemTable.jobInfoId,
    });

  if (deletedProblem?.jobInfoId) {
    revalidateProblemCache(deletedProblem);
  }

  return deletedProblem;
}

export async function getExistingProblemTitles(jobInfoId: string) {
  const problems = await db.query.ProblemTable.findMany({
    where: eq(ProblemTable.jobInfoId, jobInfoId),
    columns: {
      title: true,
    },
  });

  return problems.map((p) => p.title);
}
