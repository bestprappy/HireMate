import { BackLink } from "@/components/BackLink";
import { db } from "@/drizzle/db";
import { ProblemTable } from "@/drizzle/schema";
import { getProblemIdTag } from "@/features/problems/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { ProblemSolver } from "./ProblemSolver";

export default async function ProblemSolverPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; problemId: string }>;
}) {
  const { jobInfoId, problemId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const problem = await getProblem(problemId);
  if (problem == null) return notFound();

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-4 py-3">
        <BackLink href={`/app/job-infos/${jobInfoId}/coding-practice`}>
          Back to problems
        </BackLink>
      </div>
      <ProblemSolver problem={problem} userId={userId} />
    </div>
  );
}

async function getProblem(id: string) {
  "use cache";
  cacheTag(getProblemIdTag(id));

  return db.query.ProblemTable.findFirst({
    where: eq(ProblemTable.id, id),
  });
}
