"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QuestionItem } from "./QuestionItem"
import { Skeleton } from "@/components/Skeleton"

export interface Question {
  id: string
  question: string
  timestamp?: string
  idealAnswer?: string | null
}

export function QuestionList({
  questions,
  isLoading,
  onGenerateAnswer,
}: {
  questions: Question[]
  isLoading: boolean
  onGenerateAnswer: (questionId: string) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="border rounded-lg p-4">
        <p className="text-muted-foreground text-center py-4">
          No questions detected yet. Questions will appear here after extraction.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-lg font-semibold">Question List</h3>
        {isExpanded ? (
          <ChevronDownIcon className="size-5 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-5 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="divide-y">
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index + 1}
              onGenerateAnswer={onGenerateAnswer}
            />
          ))}
        </div>
      )}
    </div>
  )
}

