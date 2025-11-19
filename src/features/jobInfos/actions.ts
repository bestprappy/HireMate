"use server";

import z from "zod";
import { jobInfoSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "./dbCache";
import { runJobInfoAnalysis } from "./lib/runJobInfoAnalysis";

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  const jobInfo = await insertJobInfo({
    ...data,
    userId,
    isAiProcessed: false, // Mark as not processed yet
  });

  // Trigger AI analysis in the background
  runJobInfoAnalysis(jobInfo.id, userId).catch((error) => {
    console.error("AI analysis error:", error);
  });

  return { error: false, jobInfoId: jobInfo.id };
}

export async function updateJobInfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoSchema>
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  const existingJobInfo = await getJobInfo(id, userId);
  if (existingJobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  // Reset AI processing if description changed
  const shouldReprocess = data.description !== existingJobInfo.description;
  const jobInfo = await updateJobInfoDb(id, {
    ...data,
    isAiProcessed: shouldReprocess ? false : existingJobInfo.isAiProcessed,
  });

  // Trigger AI reanalysis if description changed
  if (shouldReprocess) {
    runJobInfoAnalysis(jobInfo.id, userId).catch((error) => {
      console.error("AI analysis error:", error);
    });
  }

  return { error: false, jobInfoId: jobInfo.id };
}

export async function triggerAiAnalysis(jobInfoId: string) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const existingJobInfo = await getJobInfo(jobInfoId, userId);
  if (existingJobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  // This will be called from client component
  return { success: true };
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
