import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { listResumeVersions } from "@/features/resumeVersions/db";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobInfoId?: string }> }
) {
  try {
    const { jobInfoId } = await params;
    const { userId } = await getCurrentUser();
    if (!userId) {
      return new Response("You are not logged in", { status: 401 });
    }

    if (!jobInfoId) {
      return new Response("Job info ID is required", { status: 400 });
    }

    const jobInfo = await db.query.JobInfoTable.findFirst({
      where: and(
        eq(JobInfoTable.id, jobInfoId),
        eq(JobInfoTable.userId, userId)
      ),
    });

    if (!jobInfo) {
      return new Response("Job info not found", { status: 404 });
    }

    const versions = await listResumeVersions({ jobInfoId, userId });

    return Response.json({ versions });
  } catch (error) {
    console.error("Failed to fetch resume versions:", error);
    return new Response("Failed to load resume versions", { status: 500 });
  }
}

