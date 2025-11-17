import assert from "assert";

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ExecutionResult {
  passed: boolean;
  output?: string;
  expectedOutput: string;
  error?: string;
  testCaseId?: string;
}

/**
 * Executes JavaScript/TypeScript code with test cases
 * Uses new Function() to evaluate user code in a controlled way
 */
export async function executeJavaScript(
  userCode: string,
  testCases: TestCase[],
  functionName: string
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const testCase of testCases) {
    try {
      // 1. Create a new scope for the user's code.
      // 2. The user's code is executed, defining the function (e.g., groupItemsByCategory).
      // 3. We then return a reference to that function.
      const userFunction = new Function(
        `${userCode}; return ${functionName};`
      )();

      // Parse the input (which is a JSON string)
      const inputs = parseTestCaseInput(testCase.input);

      // Execute user's function with test inputs
      const actualOutput = userFunction(...inputs);

      // Parse expected output
      const expectedOutput = parseTestCaseOutput(testCase.expectedOutput);

      // Compare outputs using deep equality
      try {
        assert.deepStrictEqual(actualOutput, expectedOutput);
        results.push({
          passed: true,
          output: JSON.stringify(actualOutput),
          expectedOutput: JSON.stringify(expectedOutput),
        });
      } catch (assertError) {
        results.push({
          passed: false,
          output: JSON.stringify(actualOutput),
          expectedOutput: JSON.stringify(expectedOutput),
          error: "Output doesn't match expected result",
        });
      }
    } catch (error: any) {
      results.push({
        passed: false,
        output: undefined,
        expectedOutput: testCase.expectedOutput,
        error: error.message || "Runtime error",
      });
    }
  }

  return results;
}

/**
 * Parse test case input from JSON string to actual values
 * Handles multiple arguments: '{"nums": [2,7,11,15], "target": 9}' or '[2,7,11,15], 9'
 */
function parseTestCaseInput(input: string): any[] {
  try {
    // First, try to parse as JSON object (e.g., {"nums": [2,7,11,15], "target": 9})
    const parsed = JSON.parse(input);

    // If it's an object, extract values in order
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.values(parsed);
    }

    // If it's an array, return as-is
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Otherwise, wrap single value in array
    return [parsed];
  } catch (error) {
    // If JSON parsing fails, try comma-separated format
    try {
      const wrappedInput = `[${input}]`;
      return JSON.parse(wrappedInput);
    } catch {
      // Last resort: evaluate as JavaScript
      try {
        return new Function(`return [${input}]`)();
      } catch {
        throw new Error(`Invalid input format: ${input}`);
      }
    }
  }
}

/**
 * Parse expected output from JSON string
 */
function parseTestCaseOutput(output: string): any {
  try {
    return JSON.parse(output);
  } catch (error) {
    // If it's a string without quotes, return as-is
    return output;
  }
}

/**
 * Main execution dispatcher
 */
export async function executeCode(
  language: string,
  userCode: string,
  testCases: TestCase[],
  functionName: string
): Promise<ExecutionResult[]> {
  // Add timeout wrapper
  const timeoutMs = 5000; // 5 second timeout

  // Only JavaScript and TypeScript are supported
  if (language !== "javascript" && language !== "typescript") {
    return testCases.map((tc) => ({
      passed: false,
      output: undefined,
      expectedOutput: tc.expectedOutput,
      error: `Language '${language}' is not supported. Please use JavaScript or TypeScript.`,
    }));
  }

  const executePromise = executeJavaScript(userCode, testCases, functionName);

  const timeoutPromise = new Promise<ExecutionResult[]>((_, reject) =>
    setTimeout(() => reject(new Error("Execution timeout")), timeoutMs)
  );

  try {
    return await Promise.race([executePromise, timeoutPromise]);
  } catch (error: any) {
    // Return error for all test cases
    return testCases.map((tc) => ({
      passed: false,
      output: undefined,
      expectedOutput: tc.expectedOutput,
      error: error.message || "Execution failed",
    }));
  }
}
