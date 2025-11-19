"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklesIcon, MapPinIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";
import { ExperienceLevel } from "@/drizzle/schema";

type JobCardProps = {
  job: {
    id: string;
    name: string;
    title: string | null;
    salary: string | null;
    location: string | null;
    description: string;
    aiSummary: string | null;
    tags: string[] | null;
    isAiProcessed: boolean | null;
    experienceLevel: ExperienceLevel;
    updatedAt: Date;
  };
};

export function JobCard({ job }: JobCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localJob, setLocalJob] = useState(job);

  const handleGenerateAI = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/job-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobInfoId: job.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job");
      }

      const result = await response.json();

      if (result.success && result.metadata) {
        // Update local state immediately
        setLocalJob({
          ...localJob,
          aiSummary: result.metadata.summary,
          tags: result.metadata.tags,
          location: result.metadata.location,
          salary: result.metadata.salary,
          isAiProcessed: true,
        });
        toast.success("AI analysis completed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze job. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card
      className="
        h-full transition 
        hover:shadow-md hover:-translate-y-0.5
        focus-within:ring-2 focus-within:ring-primary
        motion-reduce:hover:shadow-none motion-reduce:hover:translate-y-0
        flex flex-col
      "
    >
      <div className="flex items-stretch justify-between gap-2 p-4 flex-1">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold truncate">
                    {localJob.name}
                  </h3>
                  {localJob.salary && (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                      {localJob.salary}
                    </span>
                  )}
                </div>
                {localJob.title && (
                  <p className="text-sm text-primary truncate font-semibold mt-1">
                    {localJob.title}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {localJob.location && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 shrink-0"
                  >
                    <MapPinIcon className="size-3" />
                    {localJob.location}
                  </Badge>
                )}
                {localJob.isAiProcessed && (
                  <Button
                    onClick={handleGenerateAI}
                    disabled={isAnalyzing}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 cursor-pointer hover:scale-110"
                    title="Regenerate AI Summary"
                  >
                    <RefreshCwIcon
                      className={`size-4 ${isAnalyzing ? "animate-spin" : ""}`}
                    />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="text-muted-foreground flex-1">
            {localJob.isAiProcessed && localJob.aiSummary ? (
              <div className="space-y-2">
                <div className="text-sm whitespace-pre-line">
                  {localJob.aiSummary}
                </div>
                {localJob.tags && localJob.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {localJob.tags.slice(0, 6).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {localJob.tags.length > 6 && (
                      <Badge variant="outline" className="text-xs py-0">
                        +{localJob.tags.length - 6}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="line-clamp-3">{localJob.description}</p>
            )}
          </div>

          <div className="pt-3 flex justify-between items-center mt-auto gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge
                variant="outline"
                className={
                  localJob.experienceLevel === "junior"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : localJob.experienceLevel === "mid-level"
                    ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
                    : "border-red-500 text-red-600 dark:text-red-400"
                }
              >
                {formatExperienceLevel(localJob.experienceLevel)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const diff =
                    Date.now() - new Date(localJob.updatedAt).getTime();
                  const sec = Math.floor(diff / 1000);
                  const min = Math.floor(sec / 60);
                  const hr = Math.floor(min / 60);
                  const day = Math.floor(hr / 24);
                  if (day > 0)
                    return `Last updated ${day} day${day > 1 ? "s" : ""} ago`;
                  if (hr > 0)
                    return `Last updated ${hr} hour${hr > 1 ? "s" : ""} ago`;
                  if (min > 0)
                    return `Last updated ${min} minute${
                      min > 1 ? "s" : ""
                    } ago`;
                  return "Last updated just now";
                })()}
              </span>
            </div>
            {!localJob.isAiProcessed && (
              <Button
                onClick={handleGenerateAI}
                disabled={isAnalyzing}
                variant="secondary"
                size="sm"
                className="h-7 text-xs gap-1 ml-auto shrink-0 hover:scale-105"
              >
                <SparklesIcon className="size-3" />
                {isAnalyzing ? "Analyzing..." : "Generate AI Summary"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
