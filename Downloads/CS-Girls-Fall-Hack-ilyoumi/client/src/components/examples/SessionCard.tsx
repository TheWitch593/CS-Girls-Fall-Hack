import { useState } from "react";
import SessionCard from "../SessionCard";
import { type MoodType } from "../MoodBadge";

export default function SessionCardExample() {
  const [selected, setSelected] = useState("1");

  const sessions = [
    {
      id: "1",
      date: "Today, 2:30 PM",
      preview: "Studying calculus and feeling stressed about derivatives...",
      moods: ["anxious", "calm", "motivated"] as MoodType[],
    },
    {
      id: "2",
      date: "Yesterday, 4:15 PM",
      preview: "Working on my chemistry homework, feeling pretty good!",
      moods: ["motivated", "calm"] as MoodType[],
    },
    {
      id: "3",
      date: "Nov 12, 10:00 AM",
      preview: "Preparing for history exam, need motivation...",
      moods: ["tired", "frustrated", "motivated", "calm"] as MoodType[],
    },
  ];

  return (
    <div className="p-8 space-y-3 max-w-sm">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          {...session}
          selected={selected === session.id}
          onClick={() => setSelected(session.id)}
        />
      ))}
    </div>
  );
}
