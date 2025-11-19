import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { saveApplicationMaterials } from "@/features/applicationMaterials/db";
import { generateApplicationMaterialsSuggestions } from "@/services/ai/applicationMaterials/ai";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function POST(req: Request) {
  const { userId } = await getCurrentUser();

  console.log("[Application Materials] Request received, userId:", userId);

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const { jobInfoId } = await req.json();
  console.log("[Application Materials] jobInfoId:", jobInfoId);

  if (!jobInfoId) {
    return new Response("Job info ID is required", { status: 400 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  console.log("[Application Materials] jobInfo found:", !!jobInfo);

  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  console.log("[Application Materials] Generating suggestions...");
  const streamResult = await generateApplicationMaterialsSuggestions({
    jobInfo,
    onFinish: async (suggestions) => {
      console.log("[Application Materials] Saving to database...");
      try {
        await saveApplicationMaterials({
          jobInfoId,
          userId,
          suggestions,
        });
        console.log("[Application Materials] Saved successfully");
      } catch (error) {
        console.error("[Application Materials] Error saving:", error);
      }
    },
  });

  return streamResult.toTextStreamResponse();
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
