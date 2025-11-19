import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import {
  JobInfoNotFoundError,
  runJobInfoAnalysis,
} from "@/features/jobInfos/lib/runJobInfoAnalysis";

export async function POST(request: NextRequest) {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobInfoId } = await request.json();

  if (!jobInfoId) {
    return NextResponse.json(
      { error: "Job info ID is required" },
      { status: 400 }
    );
  }

  try {
    const metadata = await runJobInfoAnalysis(jobInfoId, userId);

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error) {
    if (error instanceof JobInfoNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job" },
      { status: 500 }
    );
  }
}
