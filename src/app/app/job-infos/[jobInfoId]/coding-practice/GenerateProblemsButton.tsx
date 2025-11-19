"use client";

import { Button } from "@/components/ui/button";
import { generateProblemsForJobAction } from "@/features/problems/actions";

import { Loader2Icon, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GenerateProblemsButton({ jobInfoId }: { jobInfoId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProblemsForJobAction(jobInfoId, "EASY");
      if (result.success) {
        toast.success("Problem generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate problems. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
      {isGenerating ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="size-4" />
          Generate Problems
        </>
      )}
    </Button>
  );
}
