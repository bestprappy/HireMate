import { generateText } from "ai"
import { google } from "../models/google"
import { ReturnChatEvent } from "hume/api/resources/empathicVoice"

export interface ExtractedQuestion {
  question: string
  timestamp?: string
}

export async function extractQuestionsFromTranscript(
  messages: ReturnChatEvent[]
): Promise<ExtractedQuestion[]> {
  // Filter to get only AI interviewer messages
  const interviewerMessages = messages
    .filter(
      (msg) =>
        msg.type === "AGENT_MESSAGE" &&
        msg.messageText != null &&
        msg.messageText.trim().length > 0
    )
    .map((msg) => ({
      text: msg.messageText!,
      timestamp: msg.createdTimestamp
        ? new Date(msg.createdTimestamp).toISOString()
        : undefined,
    }))

  if (interviewerMessages.length === 0) {
    return []
  }

  const transcript = interviewerMessages
    .map((msg, index) => `${index + 1}. ${msg.text}`)
    .join("\n")

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: transcript,
    system: `You are analyzing an interview transcript. Your task is to extract all questions asked by the interviewer (AI).

Instructions:
- Extract ONLY the questions asked by the interviewer
- Each question should be a complete, standalone question
- Remove any filler words or conversational elements that aren't part of the question itself
- Return the questions in the order they were asked
- Do NOT include answers or responses from the interviewee
- If a message contains multiple questions, extract each one separately

Output Format (JSON array):
\`\`\`json
[
  {
    "question": "What inspired you to become a UI/UX designer?",
    "index": 1
  },
  {
    "question": "What are some of the key UI principles you always follow?",
    "index": 2
  }
]
\`\`\`

Return ONLY the JSON array, no additional text or markdown formatting.`,
  })

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      question: string
      index: number
    }>

    // Map to include timestamps if available
    return parsed.map((item) => {
      const originalMessage = interviewerMessages[item.index - 1]
      return {
        question: item.question.trim(),
        timestamp: originalMessage?.timestamp,
      }
    })
  } catch (error) {
    console.error("Failed to parse extracted questions:", error)
    // Fallback: return interviewer messages as questions
    return interviewerMessages.map((msg) => ({
      question: msg.text,
      timestamp: msg.timestamp,
    }))
  }
}

