"use client"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { InterviewFeedback } from "@/services/ai/interviews/schemas"
import { CheckCircle2Icon, AlertCircleIcon, XCircleIcon } from "lucide-react"

interface FeedbackContentProps {
  feedback: InterviewFeedback
}

const categoryLabels: Record<keyof Omit<InterviewFeedback, "overallScore">, string> = {
  communicationClarity: "Communication Clarity",
  confidenceAndEmotionalState: "Confidence and Emotional State",
  responseQuality: "Response Quality",
  pacingAndTiming: "Pacing and Timing",
  engagementAndInteraction: "Engagement and Interaction",
  roleFitAndAlignment: "Role Fit & Alignment",
}

export function FeedbackContent({ feedback }: FeedbackContentProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getFeedbackIcon = (type: "strength" | "minor-improvement" | "major-improvement") => {
    switch (type) {
      case "strength":
        return <CheckCircle2Icon className="size-4 text-green-500" />
      case "minor-improvement":
        return <AlertCircleIcon className="size-4 text-yellow-500" />
      case "major-improvement":
        return <XCircleIcon className="size-4 text-red-500" />
    }
  }

  const categories = Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as keyof Omit<InterviewFeedback, "overallScore">,
    label,
    category: feedback[key as keyof Omit<InterviewFeedback, "overallScore">],
  }))

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Detailed Feedback
      </h3>
      <Accordion type="multiple" className="w-full">
        {categories.map(({ key, label, category }) => (
          <AccordionItem key={key} value={key} className="border-b">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex-1 flex items-center gap-3 pr-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground ml-2">
                      {category.score.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all", getScoreColor(category.score))}
                      style={{ width: `${(category.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.summary}
              </p>
              <div className="space-y-3">
                {category.feedback.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="mt-0.5">{getFeedbackIcon(item.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
