import { Button } from "@/components/ui/button";
import { Coffee, X } from "lucide-react";

interface BreakSuggestionProps {
  message: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function BreakSuggestion({
  message,
  onAccept,
  onDismiss,
}: BreakSuggestionProps) {
  return (
    <div
      className="bg-white/50 dark:bg-mood-motivated/10 backdrop-blur-xl border border-mood-motivated/40 rounded-2xl p-5 my-6 shadow-md"
      data-testid="notification-break"
    >
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-mood-motivated to-mood-motivated/80 text-mood-motivated-foreground p-3 rounded-2xl shadow-md">
          <Coffee className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-base mb-4 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={onAccept}
              className="rounded-full shadow-sm"
              data-testid="button-accept-break"
            >
              Take a break
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="rounded-full"
              data-testid="button-dismiss-break"
            >
              Continue studying
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="h-9 w-9 rounded-full"
          data-testid="button-close-break"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
