import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { getTestCasesByProblemId } from "@/features/testCases/db";
import { executeCode } from "@/services/codeExecution/executor";
import { db } from "@/drizzle/db";
import { ProblemTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { userId } = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemId } = await params;
    const body = await request.json();
    const { code, language } = body;
    console.log("RUN API: Received request", { problemId, code, language });

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Get problem details including function name
    const [problem] = await db
      .select()
      .from(ProblemTable)
      .where(eq(ProblemTable.id, problemId))
      .limit(1);
    console.log("RUN API: Fetched problem", problem);

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Get test cases for the problem
    const testCases = await getTestCasesByProblemId(problemId);

    // Filter only non-hidden test cases for "Run" (we'll add "Submit" later with all tests)
    const publicTestCases = testCases.filter((tc) => !tc.isHidden);
    console.log("RUN API: Filtered public test cases", publicTestCases);

    if (publicTestCases.length === 0) {
      return NextResponse.json(
        { error: "No test cases found for this problem" },
        { status: 404 }
      );
    }

    // Execute the code with actual test cases
    const functionName = problem.functionName || "function ";
    console.log("RUN API: Executing code with function name:", functionName);
    const executionResults = await executeCode(
      language,
      code,
      publicTestCases,
      functionName
    );
    console.log("RUN API: Code execution results", executionResults);

    // Format results for response
    const results = executionResults.map((result, index) => ({
      input: publicTestCases[index].input,
      expected: result.expectedOutput,
      actual: result.output || "Error",
      passed: result.passed,
      error: result.error,
    }));

    const passedTests = results.filter((r) => r.passed).length;
    const status = passedTests === results.length ? "PASSED" : "FAILED";

    const responsePayload = {
      status,
      results,
      totalTests: results.length,
      passedTests,
    };
    console.log("RUN API: Sending response payload", responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
