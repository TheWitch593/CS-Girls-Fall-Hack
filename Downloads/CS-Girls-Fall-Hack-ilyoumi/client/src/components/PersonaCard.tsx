import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export type PersonaType = "mentor" | "friendly" | "calm";

interface PersonaCardProps {
  persona: PersonaType;
  name: string;
  traits: string[];
  image: string;
  selected: boolean;
  onSelect: () => void;
}

export default function PersonaCard({
  persona,
  name,
  traits,
  image,
  selected,
  onSelect,
}: PersonaCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 backdrop-blur-xl bg-white/60 dark:bg-card/60 ${
        selected ? "border-2 border-primary ring-4 ring-primary/20 shadow-2xl scale-105" : "border border-white/30 dark:border-card-border/30"
      }`}
      onClick={onSelect}
      data-testid={`card-persona-${persona}`}
    >
      <div className="p-8 flex flex-col items-center text-center space-y-5">
        {selected && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full p-1.5 shadow-lg">
              <Check className="w-5 h-5" data-testid={`icon-selected-${persona}`} />
            </div>
          </div>
        )}
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-xl ring-4 ring-white/50">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-['Poppins'] mb-3">{name}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {traits.map((trait, idx) => (
              <span
                key={idx}
                className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full"
                data-testid={`text-trait-${idx}`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
