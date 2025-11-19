"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";
import {
  createInterview,
  updateInterview,
} from "@/features/interviews/actions";
import { errorToast } from "@/lib/errorToast";
import { CondensedMessages } from "@/services/hume/components/CondensedMessages";
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
export function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  accessToken: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: {
    name: string;
    imageUrl: string;
  };
}) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const durationRef = useRef(callDurationTimestamp);
  const router = useRouter();
  durationRef.current = callDurationTimestamp;

  // Sync chat ID
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId });
  }, [chatMetadata?.chatId, interviewId]);

  // Sync duration
  useEffect(() => {
    if (interviewId == null) return;
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;

      updateInterview(interviewId, { duration: durationRef.current });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  // Handle disconnect
  useEffect(() => {
    if (
      readyState !== VoiceReadyState.CLOSED ||
      (durationRef.current ?? "00:00:00") < "00:00:02"
    )
      return;
    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`);
    }

    if (durationRef.current != null) {
      updateInterview(interviewId, { duration: durationRef.current });
    }
    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`);
  }, [interviewId, readyState, router, jobInfo.id]);

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center h-screen-header px-4 py-8">
        <div className="relative w-full max-w-6xl rounded-lg overflow-hidden bg-gradient-to-br from-primary/80 to-primary/70 py-8 px-8 md:py-12 md:px-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Text content - appears first on mobile, left on desktop */}
            <div className="flex-1 flex flex-col gap-4 text-white z-10 order-1 md:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Get Interview-Ready with AI-Powered Practice & Feedback
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                Practice real interview questions & get instant feedback
              </p>
              <Button
                size="lg"
                className="w-fit mt-2 bg-white text-primary hover:bg-white/90"
                onClick={async () => {
                  const res = await createInterview({ jobInfoId: jobInfo.id });
                  if (res.error) {
                    return errorToast(res.message);
                  }
                  setInterviewId(res.id);

                  connect({
                    auth: { type: "accessToken", value: accessToken },
                    configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
                    sessionSettings: {
                      type: "session_settings",
                      variables: {
                        userName: user.name,
                        title: jobInfo.title || "Not Specified",
                        description: jobInfo.description,
                        experienceLevel: jobInfo.experienceLevel,
                      },
                    },
                  });
                }}
              >
                Start an Interview
              </Button>
            </div>

            {/* Image - appears below on mobile (order-2), right on desktop */}
            <div className="flex-shrink-0 w-full md:w-[300px] lg:w-[400px] flex items-center justify-center md:justify-end order-2 md:order-2">
              <div className="relative w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] h-[180px] sm:h-[200px] md:h-[300px] lg:h-[350px]">
                <Image
                  src="/ai-interview.png"
                  alt="AI Interview Assistant"
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(max-width: 640px) 250px, (max-width: 768px) 300px, (max-width: 1200px) 400px, 400px"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="h-screen-header flex items-center justify-center">
        <Loader2Icon className="animate-spin size-24" />
      </div>
    );
  }

  return (
    <div className="h-screen-header flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <CallView user={user} />
      </div>
      <div className="flex-shrink-0 pb-6 flex justify-center">
        <Controls />
      </div>
    </div>
  );
}

function CallView({ user }: { user: { name: string; imageUrl: string } }) {
  const { micFft, fft } = useVoice();
  const { messages } = useVoice();

  // Determine who is speaking based on FFT data
  const userSpeaking = useMemo(() => {
    const maxMicFft = Math.max(...micFft, 0);
    return maxMicFft > 0.5; // Threshold for user speaking
  }, [micFft]);

  const aiSpeaking = useMemo(() => {
    const maxFft = Math.max(...fft, 0);
    return maxFft > 0.5; // Threshold for AI speaking
  }, [fft]);

  // Get the last message to determine current speaker
  const lastMessage = useMemo(() => {
    const condensed = condenseChatMessages(messages);
    return condensed[condensed.length - 1];
  }, [messages]);

  const isUserCurrentlySpeaking = lastMessage?.isUser && userSpeaking;
  const isAiCurrentlySpeaking =
    lastMessage && !lastMessage.isUser && aiSpeaking;

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* AI Interviewer Box */}
      <div
        className={`relative rounded-xl border-2 p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 transition-all ${
          isAiCurrentlySpeaking
            ? "animate-pulse border-primary shadow-lg shadow-primary/50"
            : ""
        }`}
      >
        <div className="relative flex items-center justify-center mb-4 w-full">
          {isAiCurrentlySpeaking && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75" />
          )}
          <div className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 mx-auto">
            <MicIcon className="size-12 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          AI Interviewer
        </h3>
        {isAiCurrentlySpeaking && (
          <div className="mt-2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Box */}
      <div
        className={`relative rounded-xl border-2 p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] bg-card border-border transition-all ${
          isUserCurrentlySpeaking
            ? "animate-pulse border-primary shadow-lg shadow-primary/50"
            : ""
        }`}
      >
        <div className="relative mb-4">
          {isUserCurrentlySpeaking && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75" />
          )}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
            <UserAvatar user={user} className="size-full" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          {user.name} (You)
        </h3>
        {isUserCurrentlySpeaking && (
          <div className="mt-2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Controls() {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } =
    useVoice();

  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-muted-foreground tabular-nums">
        {callDurationTimestamp}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={disconnect}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100;
        return (
          <div
            key={index}
            className="min-h-0.5 bg-primary/75 w-0.5 rounded"
            style={{ height: `${percent < 10 ? 0 : percent}%` }}
          />
        );
      })}
    </div>
  );
}
