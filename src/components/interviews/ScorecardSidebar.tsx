"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverallScore } from "./OverallScore"
import { PerformanceMetrics } from "./PerformanceMetrics"
import { RadarChart } from "./RadarChart"
import { FeedbackContent } from "./FeedbackContent"
import type { InterviewFeedback } from "@/services/ai/interviews/schemas"
import { Skeleton } from "@/components/Skeleton"

import type { RadarChartData } from "./RadarChart"

export interface ScorecardData {
  overallScore: number
  metrics: {
    englishProficiency: number
    communicationSkill: number
    designThinking?: number
    collaboration: number
    [key: string]: number | undefined
  }
  radarChart: RadarChartData
}

export function ScorecardSidebar({
  scorecard,
  feedback,
  isLoading,
}: {
  scorecard: ScorecardData | null
  feedback: InterviewFeedback | null
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="w-80 border rounded-lg p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!feedback && !scorecard) {
    return (
      <div className="w-80 border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-8">
          Generate feedback to see detailed analysis and scores.
        </p>
      </div>
    )
  }

  return (
    <div className="w-80 border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      <Tabs defaultValue="scorecard" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b flex-shrink-0">
          <TabsTrigger value="scorecard" className="flex-1">
            Scorecard
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex-1">
            Feedback
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scorecard" className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6 m-0 min-h-0">
          {scorecard && (
            <>
              <OverallScore score={scorecard.overallScore} />
              <PerformanceMetrics metrics={scorecard.metrics} />
              <RadarChart data={scorecard.radarChart} />
            </>
          )}
          {!scorecard && (
            <p className="text-muted-foreground text-center py-8">
              No scorecard data available.
            </p>
          )}
        </TabsContent>
        <TabsContent value="feedback" className="flex-1 overflow-y-auto scrollbar-hide p-6 m-0 min-h-0">
          {feedback ? (
            <FeedbackContent feedback={feedback} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No feedback available yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

