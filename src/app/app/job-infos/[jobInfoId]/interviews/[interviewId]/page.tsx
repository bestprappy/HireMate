import { BackLink } from "@/components/BackLink"
import { Skeleton, SkeletonButton } from "@/components/Skeleton"
import { SuspendedItem } from "@/components/SuspendedItem"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import { InterviewTable } from "@/drizzle/schema"
import { getInterviewIdTag } from "@/features/interviews/dbCache"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatDateTime } from "@/lib/formatters"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import { Loader2Icon, SparklesIcon, RefreshCwIcon } from "lucide-react"
import { Suspense } from "react"
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages"
import { fetchChatMessages } from "@/services/hume/lib/api"
import { ActionButton } from "@/components/ui/action-button"
import { generateInterviewFeedback } from "@/features/interviews/actions"
import { InterviewLayout } from "@/components/interviews/InterviewLayout"
import type { ScorecardData } from "@/components/interviews/ScorecardSidebar"
import type { Question } from "@/components/interviews/QuestionList"
import type { InterviewFeedback } from "@/services/ai/interviews/schemas"

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>
}) {
  const { jobInfoId, interviewId } = await params

  const interview = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn()

      const interview = await getInterview(interviewId, userId)
      if (interview == null) return notFound()
      return interview
    }
  )

  return (
    <div className="container my-4 space-y-4">
      <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
        All Interviews
      </BackLink>
      <div className="space-y-6">
        <div className="flex gap-2 justify-between">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl">
              Interview:{" "}
              <SuspendedItem
                item={interview}
                fallback={<Skeleton className="w-48" />}
                result={i => formatDateTime(i.createdAt)}
              />
            </h1>
            <p className="text-muted-foreground">
              <SuspendedItem
                item={interview}
                fallback={<Skeleton className="w-24" />}
                result={i => i.duration}
              />
            </p>
          </div>
          <SuspendedItem
            item={interview}
            fallback={<SkeletonButton className="w-32" />}
            result={i =>
              i.feedback == null ? (
                <ActionButton
                  action={generateInterviewFeedback.bind(null, i.id)}
                >
                  <SparklesIcon className="size-4 mr-2" />
                  Generate Feedback
                </ActionButton>
              ) : (
                <ActionButton
                  action={generateInterviewFeedback.bind(null, i.id)}
                  variant="outline"
                >
                  <SparklesIcon className="size-4 mr-2" />
                  Regenerate Feedback
                </ActionButton>
              )
            }
          />
        </div>
        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}
        >
          <InterviewContent interview={interview} />
        </Suspense>
      </div>
    </div>
  )
}

async function InterviewContent({
  interview,
}: {
  interview: Promise<{
    id: string
    humeChatId: string | null
    feedback: any
    scorecard: any
    questions: any
  }>
}) {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true })
  if (user == null) return redirectToSignIn()
  const interviewData = await interview
  const { humeChatId } = interviewData
  if (humeChatId == null) return notFound()

  const messages = await fetchChatMessages(humeChatId)
  const condensedMessages = condenseChatMessages(messages)

  // Parse feedback from JSON string or object
  let feedback: InterviewFeedback | null = null
  if (interviewData.feedback) {
    try {
      feedback = typeof interviewData.feedback === "string" 
        ? JSON.parse(interviewData.feedback) 
        : interviewData.feedback
    } catch {
      feedback = null
    }
  }

  return (
    <InterviewLayout
      interviewId={interviewData.id}
      messages={condensedMessages}
      user={user}
      scorecard={interviewData.scorecard}
      questions={interviewData.questions}
      feedback={feedback}
    />
  )
}

async function getInterview(id: string, userId: string) {
  "use cache"
  cacheTag(getInterviewIdTag(id))

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    columns: {
      id: true,
      humeChatId: true,
      feedback: true,
      scorecard: true,
      questions: true,
      createdAt: true,
      duration: true,
    },
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  })

  if (interview == null) return null

  cacheTag(getJobInfoIdTag(interview.jobInfo.id))
  if (interview.jobInfo.userId !== userId) return null

  return interview
}
