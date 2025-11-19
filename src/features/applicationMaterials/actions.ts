"use server";

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { getApplicationMaterialsByJobId } from "./db";

export async function getApplicationMaterialsAction(jobInfoId: string) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return { error: true, message: "Not authenticated" };
  }

  const materials = await getApplicationMaterialsByJobId(jobInfoId, userId);

  if (!materials) {
    return { error: false, data: null };
  }

  return { error: false, data: materials };
}
