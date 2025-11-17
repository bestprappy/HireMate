"use client";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProblemTable } from "@/drizzle/schema";
import Editor from "@monaco-editor/react";
import {
  PlayIcon,
  Loader2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  TerminalIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Problem = typeof ProblemTable.$inferSelect;

interface ProblemSolverProps {
  problem: Problem;
  userId: string;
}

const languageTemplates: Record<string, string> = {
  javascript: `function solution(input) {
  // Write your code here
  return null;
}`,
  typescript: `function solution(input: any): any {
  // Write your code here
  return null;
}`,
};

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
};

export function ProblemSolver({ problem, userId }: ProblemSolverProps) {
  const { theme } = useTheme();
  const supportedLanguages = (problem.supportedLanguages as string[]) || [
    "javascript",
  ];
  const [selectedLanguage, setSelectedLanguage] = useState(
    supportedLanguages[0]
  );

  // Get starter code from problem or use default template
  const getStarterCode = (lang: string) => {
    const starterCode = problem.starterCode as Record<string, string> | null;
    if (starterCode && starterCode[lang]) {
      // Replace escaped newlines with actual newlines
      return starterCode[lang].replace(/\\n/g, "\n");
    }
    return languageTemplates[lang] || "";
  };

  const [code, setCode] = useState(getStarterCode(supportedLanguages[0]));
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(getStarterCode(language));
    setTestResults(null);
    setConsoleOutput([]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTestResults(null);
    setConsoleOutput([]);

    try {
      console.log("Running code with:", { code, language: selectedLanguage });
      const response = await fetch(`/api/problems/${problem.id}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });
      console.log("Received response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server responded with an error:", errorText);
        throw new Error(`Failed to run code: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Parsed data:", data);
      setTestResults(data);

      // Add mock console output for MVP
      setConsoleOutput([
        "Code execution started...",
        `Language: ${languageLabels[selectedLanguage]}`,
        `Running ${data.totalTests || 0} test cases...`,
        data.status === "PASSED"
          ? "✓ All tests passed!"
          : "✗ Some tests failed",
      ]);
    } catch (error) {
      console.error("Error running code:", error);
      setTestResults({
        status: "ERROR",
        error: "Failed to execute code. Please try again.",
        results: [],
      });
      setConsoleOutput([
        "Error: Failed to execute code",
        "Please check your code and try again.",
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const examples = problem.examples
    ? (problem.examples as Array<{
        input: string;
        output: string;
      }>)
    : [];

  return (
    <div className="flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - Problem Description */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Title and Difficulty */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold break-words">
                    {problem.title}
                  </h1>
                  <Badge
                    variant={
                      problem.difficulty === "EASY"
                        ? "default"
                        : problem.difficulty === "MEDIUM"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {problem.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Description</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer>
                    {problem.description ?? ""}
                  </MarkdownRenderer>
                </div>
              </div>

              {/* Examples */}
              {examples.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Examples</h2>
                  {examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="bg-muted/50 rounded-lg p-4 space-y-2"
                    >
                      <div>
                        <span className="font-mono text-sm font-semibold">
                          Input:
                        </span>
                        <pre className="font-mono text-sm mt-1 whitespace-pre-wrap break-words overflow-x-auto">
                          {example.input.replace(/\\n/g, "\n")}
                        </pre>
                      </div>
                      <div>
                        <span className="font-mono text-sm font-semibold">
                          Output:
                        </span>
                        <pre className="font-mono text-sm mt-1 whitespace-pre-wrap break-words overflow-x-auto">
                          {example.output.replace(/\\n/g, "\n")}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Constraints</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer>{problem.constraints}</MarkdownRenderer>
                  </div>
                </div>
              )}

              {/* Input/Output Format */}
              {(problem.inputDescription || problem.outputDescription) && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Function Signature</h2>
                  {problem.inputDescription && (
                    <div>
                      <span className="text-sm font-semibold">Input:</span>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer className="text-muted-foreground break-words">
                          {problem.inputDescription}
                        </MarkdownRenderer>
                      </div>
                    </div>
                  )}
                  {problem.outputDescription && (
                    <div>
                      <span className="text-sm font-semibold">Output:</span>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer className="text-muted-foreground break-words">
                          {problem.outputDescription}
                        </MarkdownRenderer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Code Editor & Results */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="h-full flex flex-col">
                {/* Editor Header */}
                <div className="border-b px-4 py-3 flex items-center justify-between">
                  <Select
                    value={selectedLanguage}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {languageLabels[lang] || lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleRun}
                      disabled={isRunning}
                      variant="default"
                    >
                      {isRunning ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="size-4" />
                          Run Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={10}>
              {/* Console Output & Test Results Tabs */}
              <div className="h-full border-t bg-muted/30">
                <Tabs defaultValue="console" className="h-full flex flex-col">
                  <div className="px-4 py-2 border-b bg-background flex items-center justify-between flex-wrap gap-2">
                    <TabsList>
                      <TabsTrigger value="console" className="gap-2">
                        <TerminalIcon className="size-4" />
                        Console
                      </TabsTrigger>
                      <TabsTrigger value="tests" className="gap-2">
                        {testResults?.status === "PASSED" ? (
                          <CheckCircle2Icon className="size-4" />
                        ) : testResults?.status === "ERROR" ? (
                          <XCircleIcon className="size-4" />
                        ) : (
                          <PlayIcon className="size-4" />
                        )}
                        Test Results
                      </TabsTrigger>
                    </TabsList>
                    {testResults?.status && (
                      <Badge
                        variant={
                          testResults.status === "PASSED"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {testResults.passedTests || 0} /{" "}
                        {testResults.totalTests || 0} Passed
                      </Badge>
                    )}
                  </div>

                  <TabsContent
                    value="console"
                    className="m-0 flex-1 overflow-y-auto"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-4 font-mono text-sm space-y-1">
                        {consoleOutput.length > 0 ? (
                          consoleOutput.map((line, idx) => (
                            <div
                              key={idx}
                              className={`${
                                line.startsWith("Error") || line.startsWith("✗")
                                  ? "text-destructive"
                                  : line.startsWith("✓")
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground italic">
                            Run your code to see console output...
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent
                    value="tests"
                    className="m-0 flex-1 overflow-y-auto"
                  >
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-2">
                        {testResults?.error ? (
                          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive">
                              {testResults.error}
                            </p>
                          </div>
                        ) : testResults?.results ? (
                          testResults.results.map((test: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                            >
                              {test.passed ? (
                                <CheckCircle2Icon className="size-5 text-green-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircleIcon className="size-5 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">
                                    Test {idx + 1}
                                  </span>
                                  {test.executionTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {test.executionTime}ms
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-xs space-y-0.5 whitespace-pre-wrap break-words">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Input:
                                    </span>{" "}
                                    {test.input}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Expected:
                                    </span>{" "}
                                    {test.expected}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Got:
                                    </span>{" "}
                                    {test.actual}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground italic py-8">
                            Run your code to see test results...
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
