import { Badge } from "@/components/ui/badge";
import { Brain, Frown, Battery, Zap, AlertCircle } from "lucide-react";

export type MoodType = "calm" | "frustrated" | "tired" | "motivated" | "anxious";

interface MoodBadgeProps {
  mood: MoodType;
  className?: string;
}

const moodConfig = {
  calm: {
    label: "CALM",
    icon: Brain,
    className: "bg-mood-calm text-mood-calm-foreground",
  },
  frustrated: {
    label: "FRUSTRATED",
    icon: Frown,
    className: "bg-mood-frustrated text-mood-frustrated-foreground",
  },
  tired: {
    label: "TIRED",
    icon: Battery,
    className: "bg-mood-tired text-mood-tired-foreground",
  },
  motivated: {
    label: "MOTIVATED",
    icon: Zap,
    className: "bg-mood-motivated text-mood-motivated-foreground",
  },
  anxious: {
    label: "ANXIOUS",
    icon: AlertCircle,
    className: "bg-mood-anxious text-mood-anxious-foreground",
  },
};

export default function MoodBadge({ mood, className = "" }: MoodBadgeProps) {
  const config = moodConfig[mood];
  const Icon = config.icon;

  return (
    <Badge
      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full shadow-md ${config.className} ${className}`}
      data-testid={`badge-mood-${mood}`}
    >
      <Icon className="w-3.5 h-3.5 mr-2" />
      {config.label}
    </Badge>
  );
}
