"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GenerateJobDescriptionButtonProps = {
  jobInfoId: string;
  isAiProcessed: boolean;
};

export function GenerateJobDescriptionButton({
  jobInfoId,
  isAiProcessed,
}: GenerateJobDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/job-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobInfoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate job description");
      }

      toast.success(
        isAiProcessed
          ? "Job description regenerated successfully!"
          : "Job description generated successfully!"
      );

      // Refresh the page to show new content
      window.location.reload();
    } catch (error) {
      console.error("Error generating job description:", error);
      toast.error("Failed to generate job description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant={isAiProcessed ? "outline" : "default"}
      size="sm"
    >
      {isGenerating ? (
        <>
          <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : isAiProcessed ? (
        <>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Regenerate
        </>
      ) : (
        <>
          <SparklesIcon className="h-4 w-4 mr-2" />
          Generate
        </>
      )}
    </Button>
  );
}
