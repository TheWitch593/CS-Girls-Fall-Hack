import { type MoodType } from "./MoodBadge";

interface MoodTimelineProps {
  moods: MoodType[];
}

const moodColors = {
  calm: "bg-mood-calm",
  frustrated: "bg-mood-frustrated",
  tired: "bg-mood-tired",
  motivated: "bg-mood-motivated",
  anxious: "bg-mood-anxious",
};

export default function MoodTimeline({ moods }: MoodTimelineProps) {
  if (moods.length === 0) return null;

  return (
    <div className="h-2 w-full flex" data-testid="timeline-mood">
      {moods.map((mood, idx) => (
        <div
          key={idx}
          className={`flex-1 ${moodColors[mood]} transition-all`}
          data-testid={`timeline-segment-${idx}`}
        />
      ))}
    </div>
  );
}
