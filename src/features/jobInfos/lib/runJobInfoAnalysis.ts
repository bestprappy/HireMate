import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { JobMetadata, generateJobAnalysis } from "@/services/ai/jobInfos";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getJobInfoIdTag, getJobInfoUserTag } from "../dbCache";

export class JobInfoNotFoundError extends Error {
  constructor() {
    super("Job info not found");
    this.name = "JobInfoNotFoundError";
  }
}

export async function runJobInfoAnalysis(jobInfoId: string, userId: string) {
  const jobInfo = await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
  });

  if (!jobInfo) {
    throw new JobInfoNotFoundError();
  }

  let metadata: JobMetadata = {
    summary: "",
    jobDescription: "",
    requirements: "",
    tags: [],
    location: null,
    salary: null,
  };

  const stream = generateJobAnalysis({
    jobInfo,
    onFinish: (data) => {
      metadata = data;
    },
  });

  const reader = stream.toDataStream().getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }

  await db
    .update(JobInfoTable)
    .set({
      aiSummary: metadata.summary,
      aiJobDescription: metadata.jobDescription,
      aiRequirements: metadata.requirements,
      tags: metadata.tags,
      location: metadata.location,
      salary: metadata.salary,
      isAiProcessed: true,
    })
    .where(eq(JobInfoTable.id, jobInfoId));

  revalidateTag(getJobInfoIdTag(jobInfoId));
  revalidateTag(getJobInfoUserTag(userId));

  return metadata;
}
