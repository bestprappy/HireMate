import { db } from "@/drizzle/db";
import { ApplicationMaterialsTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getApplicationMaterialsByJobId(
  jobInfoId: string,
  userId: string
) {
  return db.query.ApplicationMaterialsTable.findFirst({
    where: and(
      eq(ApplicationMaterialsTable.jobInfoId, jobInfoId),
      eq(ApplicationMaterialsTable.userId, userId)
    ),
  });
}

export async function saveApplicationMaterials({
  jobInfoId,
  userId,
  suggestions,
}: {
  jobInfoId: string;
  userId: string;
  suggestions: any;
}) {
  // Check if exists
  const existing = await getApplicationMaterialsByJobId(jobInfoId, userId);

  if (existing) {
    // Update existing
    return db
      .update(ApplicationMaterialsTable)
      .set({
        suggestions,
        updatedAt: new Date(),
      })
      .where(eq(ApplicationMaterialsTable.id, existing.id))
      .returning()
      .then((rows) => rows[0]);
  } else {
    // Insert new
    return db
      .insert(ApplicationMaterialsTable)
      .values({
        jobInfoId,
        userId,
        suggestions,
      })
      .returning()
      .then((rows) => rows[0]);
  }
}
