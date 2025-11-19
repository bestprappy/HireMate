"use client";

import { Skeleton } from "@/components/Skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { cn } from "@/lib/utils";
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { DeepPartial } from "ai";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { toast } from "sonner";
import z from "zod";

type Keys = Exclude<keyof z.infer<typeof aiAnalyzeSchema>, "overallScore">;

type ResumeVersionRecord = {
  id: string;
  createdAt: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  overallScore: number | null;
  atsScore: number | null;
  jobMatchScore: number | null;
  writingAndFormattingScore: number | null;
  keywordCoverageScore: number | null;
  otherScore: number | null;
  analysis: DeepPartial<z.infer<typeof aiAnalyzeSchema>> | null;
  resumePlainText: string | null;
};

export function ResumePageClient({ jobInfoId }: { jobInfoId: string }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<File | null>(null);

  const [resumeVersions, setResumeVersions] = useState<ResumeVersionRecord[]>(
    []
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchResumeHistory = useCallback(async () => {
    setIsInitialLoading(true);
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`/api/resume-versions/${jobInfoId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          "Failed to load latest resume version:",
          response.status,
          response.statusText
        );
        setResumeVersions([]);
        setSelectedVersionId(null);
        return;
      }

      const data = await response.json();
      const versions = ((data?.versions ?? []) as ResumeVersionRecord[]).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setResumeVersions(versions);
      setSelectedVersionId((current) => {
        if (
          current != null &&
          versions.some((version) => version.id === current)
        )
          return current;
        return versions[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Failed to load latest resume version:", error);
      setResumeVersions([]);
      setSelectedVersionId(null);
    } finally {
      setIsInitialLoading(false);
      setIsHistoryLoading(false);
    }
  }, [jobInfoId]);

  useEffect(() => {
    // On first load, show last saved analysis (if any)
    fetchResumeHistory();
  }, [fetchResumeHistory]);

  const {
    object: aiAnalysis,
    isLoading,
    error: analysisError,
    submit: generateAnalysis,
  } = useObject({
    api: "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: async (url, options) => {
      const headers = new Headers(options?.headers);
      headers.delete("Content-Type");

      const formData = new FormData();
      if (fileRef.current) {
        formData.append("resumeFile", fileRef.current);
      }
      formData.append("jobInfoId", jobInfoId);

      const response = await fetch(url, {
        ...options,
        headers,
        body: formData,
      });

      // Check if response is an error (non-streaming JSON response)
      if (
        !response.ok &&
        !response.headers.get("content-type")?.includes("text/plain")
      ) {
        try {
          const errorData = await response.json();
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (e) {
          // If JSON parsing fails, use status text
          throw new Error(response.statusText || "Failed to analyze resume");
        }
      }

      return response;
    },
    onFinish: () => {
      // After analysis is done and saved server-side, refresh latest
      fetchResumeHistory();
    },
    onError: (error) => {
      console.error("Resume analysis error:", error);
      const errorMessage =
        error.message || "Failed to analyze resume. Please try again.";
      toast.error(errorMessage);
    },
  });

  function handleFileUpload(file: File | null) {
    fileRef.current = file;
    if (file == null) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, Word document, or text file");
      return;
    }

    try {
      generateAnalysis(null);
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis. Please try again.");
    }
  }

  // Show error toast if analysis fails
  useEffect(() => {
    if (analysisError) {
      const errorMessage =
        analysisError.message || "Failed to analyze resume. Please try again.";
      toast.error(errorMessage);
    }
  }, [analysisError]);

  function handleVersionSelect(versionId: string) {
    setSelectedVersionId(versionId);
  }

  const selectedVersion =
    resumeVersions.find((version) => version.id === selectedVersionId) ??
    resumeVersions[0];

  const fallbackAnalysis =
    resumeVersions.find((version) => version.analysis != null)?.analysis ??
    undefined;

  // While analyzing: show streaming aiAnalysis
  // Otherwise: show selected (or latest) saved analysis from backend
  const effectiveAnalysis =
    isLoading || isInitialLoading
      ? aiAnalysis
      : selectedVersion?.analysis ?? fallbackAnalysis ?? undefined;

  return (
    <div className="space-y-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Analyzing your resume" : "Upload your resume"}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "This may take a couple minutes"
              : "Get personalized feedback on your resume based on the job"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSwap loadingIconClassName="size-16" isLoading={isLoading}>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 transition-colors relative",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/50 bg-muted/10"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files[0] ?? null);
              }}
            >
              <label htmlFor="resume-upload" className="sr-only">
                Upload your resume
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="opacity-0 absolute inset-0 cursor-pointer"
                onChange={(e) => {
                  handleFileUpload(e.target.files?.[0] ?? null);
                }}
              />
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <UploadIcon className="size-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg">
                    Drag your resume here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, Word docs, and text files
                  </p>
                </div>
              </div>
            </div>
          </LoadingSwap>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
        <AnalysisResults
          aiAnalysis={effectiveAnalysis}
          isLoading={isLoading || isInitialLoading}
        />

        <ResumeHistoryRail
          versions={resumeVersions}
          isLoading={isHistoryLoading}
          selectedId={selectedVersionId}
          onSelectVersion={handleVersionSelect}
        />
      </div>
    </div>
  );
}

function AnalysisResults({
  aiAnalysis,
  isLoading,
}: {
  aiAnalysis: DeepPartial<z.infer<typeof aiAnalyzeSchema>> | undefined;
  isLoading: boolean;
}) {
  if (!isLoading && aiAnalysis == null) return null;

  const sections: Record<Keys, string> = {
    ats: "ATS Compatibility",
    jobMatch: "Job Match",
    writingAndFormatting: "Writing and Formatting",
    keywordCoverage: "Keyword Coverage",
    other: "Additional Insights",
  };

  return (
    <Card>
      <CardHeader>
        {/* Title, gauge, THEN description – all centered */}
        <div className="flex flex-col items-center gap-4 text-center">
          <CardTitle className="text-2xl">Analysis Results</CardTitle>

          <ScoreGauge score={aiAnalysis?.overallScore} isLoading={isLoading} />

          <CardDescription className="max-w-xl">
            {aiAnalysis?.overallScore == null
              ? "We’ll show your score and detailed feedback here after analysis."
              : "Here’s how well your resume matches this job."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple">
          {Object.entries(sections).map(([key, title]) => {
            const category = aiAnalysis?.[key as Keys];

            return (
              <AccordionItem value={title} key={key}>
                <AccordionTrigger>
                  <CategoryAccordionHeader
                    title={title}
                    score={category?.score}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      {category?.summary == null ? (
                        <span className="space-y-2">
                          <Skeleton />
                          <Skeleton className="w-3/4" />
                        </span>
                      ) : (
                        category.summary
                      )}
                    </div>
                    <div className="space-y-3">
                      {category?.feedback == null ? (
                        <>
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                          <Skeleton className="h-16" />
                        </>
                      ) : (
                        category.feedback.map((item, index) => {
                          if (item == null) return null;
                          return <FeedbackItem key={index} {...item} />;
                        })
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function ScoreGauge({
  score,
  isLoading,
}: {
  score: number | null | undefined;
  isLoading: boolean;
}) {
  // When we don't have a score yet, show skeleton
  if (score == null) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Skeleton className="w-56 h-28 rounded-b-none rounded-t-full" />
      </div>
    );
  }

  // Clamp score between 0 and 10
  const clamped = Math.max(0, Math.min(10, score));
  const percent = clamped / 10;

  let label = "Needs work";
  let labelColor = "text-red-600";
  let arcColor = "#dc2626";

  if (clamped >= 8) {
    label = "Excellent";
    labelColor = "text-emerald-600";
    arcColor = "#059669";
  } else if (clamped >= 6) {
    label = "Good";
    labelColor = "text-amber-600";
    arcColor = "#d97706";
  } else if (clamped >= 4) {
    label = "Fair";
    labelColor = "text-orange-600";
    arcColor = "#ea580c";
  }

  const displayScore = formatScoreValue(clamped);
  const activeLength = Math.max(percent, 0.001);
  const inactiveLength = Math.max(1 - percent, 0.001);
  const lengthTotal = activeLength + inactiveLength;
  const arcsLength = [activeLength / lengthTotal, inactiveLength / lengthTotal];

  return (
    <div className="flex flex-col items-center justify-center">
      <GaugeChart
        id="resume-score-gauge"
        nrOfLevels={120}
        arcsLength={arcsLength}
        colors={[arcColor, "#E4E4E7"]}
        percent={percent}
        textColor="currentColor"
        arcPadding={0.015}
        arcWidth={0.2}
        cornerRadius={3}
        needleColor="transparent"
        needleBaseColor="transparent"
        formatTextValue={() => displayScore + " / 10"}
        style={{ width: "18rem", maxWidth: "100%" }}
      />

      {isLoading && (
        <span className="mt-1 text-[10px] text-muted-foreground">
          Updating…
        </span>
      )}
    </div>
  );
}

function CategoryAccordionHeader({
  title,
  score,
}: {
  title: string;
  score: number | undefined | null;
}) {
  let badge: ReactNode;
  if (score == null) {
    badge = <Skeleton className="w-16" />;
  } else if (score >= 8) {
    badge = <Badge variant="success">Excellent</Badge>;
  } else if (score >= 6) {
    badge = (
      <Badge variant="warning" className="text-white">
        Ok
      </Badge>
    );
  } else {
    badge = <Badge variant="destructive">Needs Works</Badge>;
  }

  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex flex-col items-start gap-1">
        <span>{title}</span>
        <div className="no-underline">{badge}</div>
      </div>
      {score == null ? <Skeleton className="w-12" /> : `${score}/10`}
    </div>
  );
}

function FeedbackItem({
  message,
  name,
  type,
}: Partial<z.infer<typeof aiAnalyzeSchema>["ats"]["feedback"][number]>) {
  if (name == null || message == null || type == null) return null;

  const getColors = () => {
    switch (type) {
      case "strength":
        return "bg-primary/10 border border-primary/50";
      case "major-improvement":
        return "bg-destructive/10 dark:bg-destructive/10 border border-destructive/50 dark:border-destructive/70";
      case "minor-improvement":
        return "bg-warning/10 border border-warning/40";
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "strength":
        return <CheckCircleIcon className="size-4 text-primary" />;
      case "minor-improvement":
        return <AlertCircleIcon className="size-4 text-warning" />;
      case "major-improvement":
        return <XCircleIcon className="size-4 text-destructive" />;
      default:
        throw new Error(`Unknown feedback type: ${type satisfies never}`);
    }
  };

  return (
    <div
      className={cn(
        "flex items-baseline gap-3 pl-3 pr-5 py-5 rounded-lg",
        getColors()
      )}
    >
      <div>{getIcon()}</div>
      <div className="flex flex-col gap-1">
        <div className="text-base">{name}</div>
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  );
}

function ResumeHistoryRail({
  versions,
  isLoading,
  selectedId,
  onSelectVersion,
}: {
  versions: ResumeVersionRecord[];
  isLoading: boolean;
  selectedId: string | null;
  onSelectVersion: (id: string) => void;
}) {
  return (
    <Card className="h-full border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wide text-foreground">
          Resume Score History
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Latest uploads and how your score evolved.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Upload a resume to see your score history.
          </p>
        ) : (
          versions.map((version, index) => {
            const previous = versions[index + 1];
            const hasScore =
              typeof version.overallScore === "number" &&
              !Number.isNaN(version.overallScore);
            const prevHasScore =
              previous != null &&
              typeof previous.overallScore === "number" &&
              !Number.isNaN(previous.overallScore);
            const delta =
              hasScore && prevHasScore
                ? (version.overallScore as number) -
                  (previous?.overallScore as number)
                : null;
            const isSelected = version.id === selectedId;

            return (
              <button
                key={version.id}
                type="button"
                onClick={() => onSelectVersion(version.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-3 text-left flex items-center gap-3 border transition-all bg-muted/40 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "hover:bg-muted hover:border-primary/40",
                  isSelected
                    ? "border-primary bg-background ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : "border-border/60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="truncate font-semibold text-foreground">
                      {version.fileName ?? "Resume upload"}
                    </p>
                    {index === 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0.5 border border-primary/70 bg-primary/10 text-primary"
                      >
                        Latest
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatRelativeTimestamp(version.createdAt)} ·{" "}
                    {formatFileSize(version.fileSize)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {hasScore
                      ? `Overall score ${formatScoreValue(
                          version.overallScore
                        )}/10`
                      : "No score yet"}
                    {delta != null && delta !== 0 && (
                      <>
                        {" · "}
                        <span
                          className={cn(
                            "font-semibold",
                            delta > 0 ? "text-emerald-500" : "text-destructive"
                          )}
                        >
                          {delta > 0 ? "+" : ""}
                          {formatScoreValue(delta)}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <MiniScoreCircle score={version.overallScore} />
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function MiniScoreCircle({ score }: { score: number | null | undefined }) {
  if (score == null || Number.isNaN(score)) {
    return (
      <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground">
        —
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(10, score));
  const percent = (clamped / 10) * 100;

  let ringColor = "text-destructive";
  if (clamped >= 8) ringColor = "text-emerald-500";
  else if (clamped >= 6) ringColor = "text-amber-400";
  else if (clamped >= 4) ringColor = "text-orange-400";

  return (
    <div className="relative h-12 w-12 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <path
          className="text-border"
          stroke="currentColor"
          strokeWidth={3}
          fill="none"
          d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
        />
        <path
          className={cn("transition-all duration-500 ease-out", ringColor)}
          stroke="currentColor"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${percent}, 100`}
          d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">
        {formatScoreValue(clamped)}
      </div>
    </div>
  );
}

const RELATIVE_TIME_FORMATTER =
  typeof Intl !== "undefined"
    ? new Intl.RelativeTimeFormat("en", { numeric: "auto" })
    : null;

const RELATIVE_TIME_DIVISIONS: {
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
}[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

function formatRelativeTimestamp(value: string | null | undefined) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  if (RELATIVE_TIME_FORMATTER) {
    let duration = (date.getTime() - Date.now()) / 1000;
    for (const division of RELATIVE_TIME_DIVISIONS) {
      if (Math.abs(duration) < division.amount) {
        return RELATIVE_TIME_FORMATTER.format(
          Math.round(duration),
          division.unit
        );
      }
      duration /= division.amount;
    }
  }

  return date.toLocaleString();
}

function formatFileSize(bytes: number | null | undefined) {
  if (bytes == null || Number.isNaN(bytes)) return "Unknown size";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const precision = size >= 10 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

function formatScoreValue(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return "—";
  return Number(score).toFixed(1).replace(/\.0$/, "");
}
