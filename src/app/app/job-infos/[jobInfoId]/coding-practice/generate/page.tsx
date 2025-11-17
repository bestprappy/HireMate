import { BackLink } from "@/components/BackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { DifficultySelector } from "./DifficultySelector";


export default async function GenerateProblemPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return (
    <div className="container my-8 max-w-2xl space-y-6">
      <BackLink href={`/app/job-infos/${jobInfoId}/coding-practice`}>
        Back to coding practice
      </BackLink>

      <section className="space-y-3">
        <h1 className="text-4xl font-bold">Generate Coding Problem</h1>
        <p className="text-muted-foreground text-lg">
          Select a difficulty level to generate a tailored problem for{" "}
          <span className="font-semibold">{jobInfo.name}</span>
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Choose Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <DifficultySelector jobInfoId={jobInfoId} />
        </CardContent>
      </Card>
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
