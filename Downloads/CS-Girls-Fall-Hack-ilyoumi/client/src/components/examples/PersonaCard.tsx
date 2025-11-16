import { useState } from "react";
import PersonaCard from "../PersonaCard";
import mentorAvatar from "@assets/generated_images/Mentor_persona_avatar_fc1437a0.png";
import friendlyAvatar from "@assets/generated_images/Friendly_persona_avatar_cd49d4db.png";
import calmAvatar from "@assets/generated_images/Calm_persona_avatar_7fc83d1b.png";

export default function PersonaCardExample() {
  const [selected, setSelected] = useState<string>("mentor");

  const personas = [
    {
      persona: "mentor" as const,
      name: "The Mentor",
      traits: ["Wise", "Supportive", "Encouraging"],
      image: mentorAvatar,
    },
    {
      persona: "friendly" as const,
      name: "The Friend",
      traits: ["Cheerful", "Energetic", "Fun"],
      image: friendlyAvatar,
    },
    {
      persona: "calm" as const,
      name: "The Calm",
      traits: ["Peaceful", "Gentle", "Patient"],
      image: calmAvatar,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-8 max-w-4xl">
      {personas.map((p) => (
        <PersonaCard
          key={p.persona}
          {...p}
          selected={selected === p.persona}
          onSelect={() => setSelected(p.persona)}
        />
      ))}
    </div>
  );
}
