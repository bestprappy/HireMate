import { BackLink } from "@/components/BackLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/drizzle/db";
import { JobInfoTable, ProblemTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { getProblemJobInfoTag } from "@/features/problems/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SparklesIcon } from "lucide-react";

export default async function CodingPracticePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  const problems = await getProblems(jobInfoId);

  return (
    <div className="container my-6 space-y-6">
      <BackLink href={`/app/job-infos/${jobInfoId}`}>
        Back to job overview
      </BackLink>

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Coding Practice</h1>
            <p className="text-muted-foreground text-lg">
              Algorithm-focused drills tailored for{" "}
              <span className="font-semibold">{jobInfo.name}</span>
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={`/app/job-infos/${jobInfoId}/coding-practice/generate`}>
              <SparklesIcon className="mr-2 h-5 w-5" />
              Generate Problem
            </Link>
          </Button>
        </div>
      </section>

      {problems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center space-y-3">
            <p className="text-lg font-medium">No problems generated yet</p>
            <p className="text-muted-foreground">
              Click "Generate Problem" to create coding challenges tailored to
              this job description using AI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/app/job-infos/${jobInfoId}/coding-practice/${problem.id}`}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <Badge
                      variant={
                        problem.difficulty === "EASY"
                          ? "default"
                          : problem.difficulty === "MEDIUM"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {problem.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getProblems(jobInfoId: string) {
  "use cache";
  cacheTag(getProblemJobInfoTag(jobInfoId));

  return db.query.ProblemTable.findMany({
    where: eq(ProblemTable.jobInfoId, jobInfoId),
    orderBy: (problems, { asc }) => [asc(problems.createdAt)],
  });
}
