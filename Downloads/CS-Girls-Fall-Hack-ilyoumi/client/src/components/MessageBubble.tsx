import MoodBadge, { type MoodType } from "./MoodBadge";
import TypingIndicator from "./TypingIndicator";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  mood?: MoodType;
  isTyping?: boolean;
  timestamp?: string;
}

export default function MessageBubble({
  content,
  isUser,
  mood,
  isTyping = false,
  timestamp,
}: MessageBubbleProps) {
  if (isTyping && !isUser) {
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-2xl">
          <TypingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className="max-w-2xl">
        {!isUser && mood && (
          <div className="mb-3">
            <MoodBadge mood={mood} />
          </div>
        )}
        <div
          className={`px-5 py-4 rounded-3xl shadow-md ${
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md"
              : "bg-white/50 dark:bg-card/50 backdrop-blur-xl border border-white/40 dark:border-card-border/40 rounded-tl-md"
          }`}
          data-testid={isUser ? "bubble-user-message" : "bubble-ai-message"}
        >
          <p className="text-base whitespace-pre-wrap leading-relaxed">{content}</p>
          {timestamp && (
            <p className="text-xs mt-2 opacity-60" data-testid="text-timestamp">
              {timestamp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
