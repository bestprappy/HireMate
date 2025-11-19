import { db } from "@/drizzle/db";
import { ResumeVersionTable } from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas";

const MAX_HISTORY = 20;

const resumeAnalysisSchema = aiAnalyzeSchema.partial();

export type StoredResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export async function createResumeVersion({
  userId,
  jobInfoId,
  fileName,
  fileType,
  fileSize,
  resumeFileBase64,
  resumePlainText,
  analysis,
}: {
  userId: string;
  jobInfoId: string;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  resumeFileBase64: string;
  resumePlainText?: string | null;
  analysis: StoredResumeAnalysis;
}) {
  const scores = {
    overallScore: analysis.overallScore ?? null,
    atsScore: analysis.ats?.score ?? null,
    jobMatchScore: analysis.jobMatch?.score ?? null,
    writingAndFormattingScore: analysis.writingAndFormatting?.score ?? null,
    keywordCoverageScore: analysis.keywordCoverage?.score ?? null,
    otherScore: analysis.other?.score ?? null,
  };

  await db.insert(ResumeVersionTable).values({
    userId,
    jobInfoId,
    fileName: fileName ?? null,
    fileType: fileType ?? null,
    fileSize: fileSize ?? null,
    resumeFileBase64,
    resumePlainText: resumePlainText ?? null,
    analysis,
    ...scores,
  });
}

export async function listResumeVersions({
  jobInfoId,
  userId,
  limit = MAX_HISTORY,
}: {
  jobInfoId: string;
  userId: string;
  limit?: number;
}) {
  return db
    .select()
    .from(ResumeVersionTable)
    .where(
      and(
        eq(ResumeVersionTable.jobInfoId, jobInfoId),
        eq(ResumeVersionTable.userId, userId)
      )
    )
    .orderBy(desc(ResumeVersionTable.createdAt))
    .limit(limit);
}

export async function getResumeVersion({
  versionId,
  userId,
}: {
  versionId: string;
  userId: string;
}) {
  return db.query.ResumeVersionTable.findFirst({
    where: and(
      eq(ResumeVersionTable.id, versionId),
      eq(ResumeVersionTable.userId, userId)
    ),
  });
}

