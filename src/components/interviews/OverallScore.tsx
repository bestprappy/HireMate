import { cn } from "@/lib/utils"

export function OverallScore({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400"
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Overall Score
      </h3>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-5xl font-bold", getScoreColor(score))}>
          {score.toFixed(1)}
        </span>
        <span className="text-2xl text-muted-foreground">/10</span>
      </div>
    </div>
  )
}

