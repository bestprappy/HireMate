"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AiAnalysisButton({ jobInfoId }: { jobInfoId: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/job-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobInfoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job");
      }

      toast.success("AI analysis completed! Refreshing page...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze job. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <SparklesIcon className="size-4" />
      {isAnalyzing ? "Analyzing..." : "Generate AI Analysis"}
    </Button>
  );
}
