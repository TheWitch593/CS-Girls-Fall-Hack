import MoodTimeline from "../MoodTimeline";
import { type MoodType } from "../MoodBadge";

export default function MoodTimelineExample() {
  const moods: MoodType[] = ["calm", "motivated", "frustrated", "tired", "calm", "motivated"];

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Current session mood progression</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <MoodTimeline moods={moods} />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Short session</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <MoodTimeline moods={["anxious", "calm"]} />
          </div>
        </div>
      </div>
    </div>
  );
}
