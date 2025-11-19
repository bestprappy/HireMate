"use server";

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "../jobInfos/dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { insertInterview, updateInterview as updateInterviewDb } from "./db";
import { getInterviewIdTag } from "./dbCache";
import { canCreateInterview } from "./permissions";
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/errorToast";
import { env } from "@/data/env/server";
import arcjet, { tokenBucket, request } from "@arcjet/next";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";
import { extractQuestionsFromTranscript } from "@/services/ai/interviews/extractQuestions";
import { generateIdealAnswer } from "@/services/ai/interviews/generateAnswer";
import { fetchChatMessages } from "@/services/hume/lib/api";
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages";
import type { ScorecardData } from "@/components/interviews/ScorecardSidebar";
import type { InterviewFeedback } from "@/services/ai/interviews/schemas";

const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 100,
      refillRate: 40,
      interval: "1d",
      mode: "LIVE",
    }),
  ],
});

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    };
  }

  const decision = await aj.protect(await request(), {
    userId,
    requested: 1,
  });

  if (decision.isDenied()) {
    return {
      error: true,
      message: RATE_LIMIT_MESSAGE,
    };
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await insertInterview({ jobInfoId, duration: "00:00:00" });

  return { error: false, id: interview.id };
}

export async function updateInterview(
  id: string,
  data: {
    humeChatId?: string;
    duration?: string;
  }
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await updateInterviewDb(id, data);

  return { error: false };
}

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    };
  }

  // Generate scorecard from structured feedback
  const scorecard = generateScorecardFromFeedback(feedback);

  await updateInterviewDb(interviewId, {
    feedback: JSON.stringify(feedback),
    scorecard: JSON.stringify(scorecard),
  });

  return { error: false };
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}

export async function extractInterviewQuestions(interviewId: string) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const messages = await fetchChatMessages(interview.humeChatId);
  const questions = await extractQuestionsFromTranscript(messages);

  // Store questions with IDs
  const questionsWithIds = questions.map((q, index) => ({
    id: `q-${index + 1}`,
    question: q.question,
    timestamp: q.timestamp,
    idealAnswer: null,
  }));

  await updateInterviewDb(interviewId, { questions: questionsWithIds });

  return { error: false, questions: questionsWithIds };
}

export async function generateQuestionAnswer(
  interviewId: string,
  questionId: string
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const questions = (interview.questions as any) || [];
  const question = questions.find((q: any) => q.id === questionId);

  if (!question) {
    return {
      error: true,
      message: "Question not found",
    };
  }

  if (question.idealAnswer) {
    return { error: false, answer: question.idealAnswer };
  }

  const answer = await generateIdealAnswer({
    question: question.question,
    jobInfo: interview.jobInfo,
  });

  // Update the question with the answer
  const updatedQuestions = questions.map((q: any) =>
    q.id === questionId ? { ...q, idealAnswer: answer } : q
  );

  await updateInterviewDb(interviewId, { questions: updatedQuestions });

  return { error: false, answer };
}

function generateScorecardFromFeedback(
  feedback: InterviewFeedback
): ScorecardData {
  return {
    overallScore: feedback.overallScore,
    metrics: {
      englishProficiency: feedback.communicationClarity.score,
      communicationSkill: feedback.communicationClarity.score,
      collaboration: feedback.engagementAndInteraction.score,
      designThinking: feedback.roleFitAndAlignment.score,
    },
    radarChart: {
      categories: [
        {
          label: "Communication",
          value: feedback.communicationClarity.score,
        },
        {
          label: "Problem Solving",
          value: feedback.responseQuality.score,
        },
        {
          label: "Confidence",
          value: feedback.confidenceAndEmotionalState.score,
        },
        {
          label: "Collaboration",
          value: feedback.engagementAndInteraction.score,
        },
        {
          label: "Role Fit",
          value: feedback.roleFitAndAlignment.score,
        },
        {
          label: "Pacing",
          value: feedback.pacingAndTiming.score,
        },
      ],
    },
  };
}
