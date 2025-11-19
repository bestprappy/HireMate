"use client";

import { useState } from "react";
import { ChatTranscript } from "./ChatTranscript";
import { ScorecardSidebar, type ScorecardData } from "./ScorecardSidebar";
import type { InterviewFeedback } from "@/services/ai/interviews/schemas";
import { QuestionList, type Question } from "./QuestionList";
import {
  extractInterviewQuestions,
  generateQuestionAnswer,
} from "@/features/interviews/actions";
import { errorToast } from "@/lib/errorToast";
import { ActionButton } from "@/components/ui/action-button";
import { SparklesIcon } from "lucide-react";

interface InterviewLayoutProps {
  interviewId: string;
  messages: { isUser: boolean; content: string[] }[];
  user: { name: string; imageUrl: string };
  scorecard: ScorecardData | null;
  questions: Question[] | null;
  feedback: InterviewFeedback | null;
}

export function InterviewLayout({
  interviewId,
  messages,
  user,
  scorecard: initialScorecard,
  questions: initialQuestions,
  feedback,
}: InterviewLayoutProps) {
  // Handle JSON strings from database
  const parseScorecard = (data: any): ScorecardData | null => {
    if (!data) return null;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return data as ScorecardData;
  };

  const parseQuestions = (data: any): Question[] | null => {
    if (!data) return null;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return data as Question[];
  };

  const [scorecard] = useState<ScorecardData | null>(
    parseScorecard(initialScorecard)
  );
  const [questions, setQuestions] = useState<Question[] | null>(
    parseQuestions(initialQuestions)
  );

  const handleExtractQuestions = async () => {
    const result = await extractInterviewQuestions(interviewId);
    if (result.error) {
      errorToast(result.message || "An error occurred");
      return { error: true, message: result.message || "An error occurred" };
    } else {
      setQuestions(result.questions || []);
      return { error: false };
    }
  };

  const handleGenerateAnswer = async (questionId: string) => {
    const result = await generateQuestionAnswer(interviewId, questionId);
    if (result.error) {
      errorToast(result.message || "An error occurred");
    } else if (result.answer && questions) {
      // Update the question in local state
      setQuestions(
        questions.map((q) =>
          q.id === questionId ? { ...q, idealAnswer: result.answer } : q
        )
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] grid-rows-[1fr_auto] gap-6 h-[calc(100vh-8rem)]">
      {/* Top-Left: Chat Transcript */}
      <div className="border rounded-lg p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          <ChatTranscript messages={messages} user={user} />
        </div>
      </div>

      {/* Top-Right: Scorecard Sidebar */}
      <div>
        <ScorecardSidebar
          scorecard={scorecard}
          feedback={feedback}
          isLoading={false}
        />
      </div>

      {/* Bottom: Question List (spans full width under both) */}
      <div className="lg:col-span-2">
        {questions === null ? (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Question List</h3>
              <ActionButton action={handleExtractQuestions}>
                <SparklesIcon className="size-4 mr-2" />
                Extract Questions
              </ActionButton>
            </div>
            <p className="text-sm text-muted-foreground">
              Extract questions from the interview transcript to see what was
              asked.
            </p>
          </div>
        ) : (
          <QuestionList
            questions={questions}
            isLoading={false}
            onGenerateAnswer={handleGenerateAnswer}
          />
        )}
      </div>
    </div>
  );
}
