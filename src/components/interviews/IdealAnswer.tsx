"use client"

import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { CopyIcon, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { errorToast } from "@/lib/errorToast"

export function IdealAnswer({ answer }: { answer: string | null | undefined }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!answer) return
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      errorToast("Failed to copy answer")
    }
  }

  if (!answer) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Click to generate the ideal answer for this question.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SparklesIcon className="size-4" />
          What You Should Answer
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2"
        >
          <CopyIcon className="size-3 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <MarkdownRenderer>{answer}</MarkdownRenderer>
      </div>
    </div>
  )
}

