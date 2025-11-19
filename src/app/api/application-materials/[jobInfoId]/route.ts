import { getApplicationMaterialsByJobId } from "@/features/applicationMaterials/db";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobInfoId?: string }> }
) {
  try {
    const { userId } = await getCurrentUser();

    if (!userId) {
      return new Response("You are not logged in", { status: 401 });
    }

    const { jobInfoId } = await params;

    if (!jobInfoId) {
      return new Response("Job info ID is required", { status: 400 });
    }

    const materials = await getApplicationMaterialsByJobId(jobInfoId, userId);

    return Response.json({ suggestions: materials?.suggestions ?? null });
  } catch (error) {
    console.error(
      "[Application Materials] Failed to fetch suggestions:",
      error
    );
    return new Response("Failed to load application materials", {
      status: 500,
    });
  }
}
