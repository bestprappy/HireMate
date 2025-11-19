import { cn } from "@/lib/utils"

interface Metrics {
  englishProficiency: number
  communicationSkill: number
  designThinking?: number
  collaboration: number
  [key: string]: number | undefined
}

export function PerformanceMetrics({ metrics }: { metrics: Metrics }) {
  const metricLabels: Record<string, string> = {
    englishProficiency: "English Proficiency",
    communicationSkill: "Communication Skill",
    designThinking: "Design Thinking",
    collaboration: "Collaboration",
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Performance Metrics
      </h3>
      <div className="space-y-3">
        {Object.entries(metrics).map(([key, score]) => {
          if (score === undefined) return null
          const label = metricLabels[key] || key
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground">{label}</span>
                <span className="font-semibold text-muted-foreground">
                  {score.toFixed(1)}/10
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", getScoreColor(score))}
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

