import MoodBadge from "../MoodBadge";

export default function MoodBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3 p-8">
      <MoodBadge mood="calm" />
      <MoodBadge mood="frustrated" />
      <MoodBadge mood="tired" />
      <MoodBadge mood="motivated" />
      <MoodBadge mood="anxious" />
    </div>
  );
}
