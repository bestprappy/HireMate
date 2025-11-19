import { JobInfoTable } from "@/drizzle/schema";
import { fetchChatMessages } from "../hume/lib/api";
import { generateObject } from "ai";
import { google } from "./models/google";
import {
  interviewFeedbackSchema,
  type InterviewFeedback,
} from "./interviews/schemas";

export async function generateAiInterviewFeedback({
  humeChatId,
  jobInfo,
  userName,
}: {
  humeChatId: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel"
  >;
  userName: string;
}): Promise<InterviewFeedback> {
  const messages = await fetchChatMessages(humeChatId);

  const formattedMessages = messages
    .map((message) => {
      if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
        return null;
      }
      if (message.messageText == null) return null;

      return {
        speaker:
          message.type === "USER_MESSAGE" ? "interviewee" : "interviewer",
        text: message.messageText,
        emotionFeatures:
          message.role === "USER" ? message.emotionFeatures : undefined,
      };
    })
    .filter((f) => f != null);

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: interviewFeedbackSchema,
    prompt: JSON.stringify(formattedMessages),
    system: `You are an expert interview coach and evaluator. Your role is to analyze a mock job interview transcript and provide clear, detailed, and structured feedback on the interviewee's performance based on the job requirements.

Additional Context:
- Interviewee's name: ${userName}
- Job title: ${jobInfo.title}
- Job description: ${jobInfo.description}
- Job Experience level: ${jobInfo.experienceLevel}

Transcript JSON Format:
- speaker: "interviewee" or "interviewer"
- text: "The actual spoken text of the message"
- emotionFeatures: "An object of emotional features where the key is the emotion and the value is the intensity (0-1). This is only provided for interviewee messages."

Your Task:
Review the full transcript and evaluate the interviewee's performance in relation to the role. Provide structured feedback organized into the following categories:

1. **Communication Clarity**: Was the interviewee articulate and easy to understand? Did they use structured and appropriate language for this job and experience level?

2. **Confidence and Emotional State**: Based on the provided emotional cues and speech content, how confident did the interviewee appear? Highlight any nervous or hesitant moments.

3. **Response Quality**: Did the interviewee respond with relevant, well-reasoned answers aligned with the job requirements? Were answers appropriately scoped for their experience level?

4. **Pacing and Timing**: Analyze delays between interviewer questions and interviewee responses. Point out long or unnatural pauses.

5. **Engagement and Interaction**: Did the interviewee show curiosity or ask thoughtful questions? Did they engage with the conversation in a way that reflects interest in the role and company?

6. **Role Fit & Alignment**: Based on the job description and the candidate's answers, how well does the interviewee match the expectations for this role and level? Identify any gaps in technical or soft skills.

Guidelines:
- Reference specific moments from the transcript, including quotes where useful.
- Tailor your analysis to the specific job description and experience level provided.
- Be clear, constructive, and actionable. The goal is to help the interviewee grow.
- Refer to the interviewee as "you" in your feedback.
- For each category, provide a score (0-10), a summary, and specific feedback items categorized as strengths, minor improvements, or major improvements.`,
  });

  return object;
}
