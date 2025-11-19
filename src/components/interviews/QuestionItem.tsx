"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IdealAnswer } from "./IdealAnswer";
import type { Question } from "./QuestionList";

export function QuestionItem({
  question,
  index,
  onGenerateAnswer,
}: {
  question: Question;
  index: number;
  onGenerateAnswer: (questionId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExpand = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Generate answer if not already generated
      if (!question.idealAnswer && !isGenerating) {
        setIsGenerating(true);
        try {
          await onGenerateAnswer(question.id);
        } finally {
          setIsGenerating(false);
        }
      }
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={handleExpand}
        className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isExpanded ? (
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Q{index}
            </span>
            {question.idealAnswer && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                Answer Available
              </span>
            )}
          </div>
          <p className="text-sm text-foreground">{question.question}</p>
          {question.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              {question.timestamp}
            </p>
          )}
        </div>
        {isGenerating && (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pl-11">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2Icon className="size-4 animate-spin" />
              <SparklesIcon className="size-4" />
              <span>Generating ideal answer...</span>
            </div>
          ) : (
            <IdealAnswer answer={question.idealAnswer} />
          )}
        </div>
      )}
    </div>
  );
}
