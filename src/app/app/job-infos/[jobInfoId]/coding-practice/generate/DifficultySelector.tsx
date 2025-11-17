"use client";

import { Button } from "@/components/ui/button";
import { generateProblemsForJobAction } from "@/features/problems/actions";
import { Loader2Icon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const difficulties: {
  value: Difficulty;
  label: string;
  color: string;
  description: string;
}[] = [
  {
    value: "EASY",
    label: "Easy",
    color:
      "bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20",
    description: "Fundamental concepts, basic data structures",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color:
      "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    description: "Intermediate algorithms, multiple approaches",
  },
  {
    value: "HARD",
    label: "Hard",
    color:
      "bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20",
    description: "Advanced algorithms, optimization required",
  },
];

export function DifficultySelector({ jobInfoId }: { jobInfoId: string }) {
  const [generatingDifficulty, setGeneratingDifficulty] =
    useState<Difficulty | null>(null);
  const router = useRouter();

  const handleGenerate = async (difficulty: Difficulty) => {
    setGeneratingDifficulty(difficulty);
    try {
      const result = await generateProblemsForJobAction(jobInfoId, difficulty);
      if (result.success) {
        toast.success(
          `Successfully generated ${difficulty.toLowerCase()} problem!`
        );
        router.push(`/app/job-infos/${jobInfoId}/coding-practice`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate problem. Please try again.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setGeneratingDifficulty(null);
    }
  };

  return (
    <div className="space-y-4">
      {difficulties.map((difficulty) => {
        const isGenerating = generatingDifficulty === difficulty.value;
        const isAnyGenerating = generatingDifficulty !== null;

        return (
          <Button
            key={difficulty.value}
            onClick={() => handleGenerate(difficulty.value)}
            disabled={isAnyGenerating}
            size="lg"
            variant="outline"
            className={`w-full justify-between items-center h-auto py-4 ${difficulty.color}`}
          >
            <div className="text-left">
              <p className="font-semibold text-lg">{difficulty.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {difficulty.description}
              </p>
            </div>
            {isGenerating ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
