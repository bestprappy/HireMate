import { UserAvatar } from "@/features/users/components/UserAvatar"
import { cn } from "@/lib/utils"
import { Handshake } from "lucide-react"

export function ChatTranscript({
  messages,
  user,
  className,
}: {
  messages: { isUser: boolean; content: string[] }[]
  user: { name: string; imageUrl: string }
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 w-full overflow-y-auto", className)}>
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No messages yet
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4 border rounded-lg p-4 max-w-[85%]",
              message.isUser
                ? "self-end ml-auto bg-primary/10 border-primary/20"
                : "self-start bg-muted/50 border-border"
            )}
          >
            {message.isUser ? (
              <UserAvatar user={user} className="size-8 flex-shrink-0" />
            ) : (
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                  <Handshake className="size-4 text-primary" />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {message.isUser ? user.name : "AI Interviewer"}
              </div>
              <div className="flex flex-col gap-2">
                {message.content.map((text, i) => (
                  <p key={i} className="text-sm leading-relaxed break-words">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

