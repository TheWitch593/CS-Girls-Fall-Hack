import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PersonaCard, { type PersonaType } from "./PersonaCard";
import AuthForm from "./AuthForm";
import { Sparkles } from "lucide-react";
import mentorAvatar from "@assets/generated_images/Mentor_persona_avatar_fc1437a0.png";
import friendlyAvatar from "@assets/generated_images/Friendly_persona_avatar_cd49d4db.png";
import calmAvatar from "@assets/generated_images/Calm_persona_avatar_7fc83d1b.png";

interface AuthPageProps {
  onStart: (persona: PersonaType) => void;
}

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

type Step = "welcome" | "auth" | "persona";

export default function AuthPage({ onStart }: AuthPageProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("mentor");
  const [step, setStep] = useState<Step>("welcome");

if (step === "welcome") {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="max-w-lg w-full p-12 shadow-2xl backdrop-blur-xl bg-white/70 dark:bg-card/70 border border-white/20 dark:border-card-border/30">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-3xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-['Poppins'] mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Welcome to Study Buddy
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your emotionally intelligent AI learning companion that adapts to your mood
              and supports your mental well-being while you study.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => setStep("auth")}
              size="lg"
              className="w-full h-12 rounded-full shadow-lg text-base"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            
            {/* Google Sign In Option */}
            <Button
              variant="outline"
              onClick={() => {
                // Handle Google auth directly from welcome page
                console.log("Google auth from welcome page");
                setStep("persona");
              }}
              size="lg"
              className="w-full h-12 rounded-full text-base flex items-center justify-center gap-3"
              data-testid="button-google-welcome"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setStep("persona")}
              size="lg"
              className="w-full h-12 rounded-full text-base"
              data-testid="button-continue-without-auth"
            >
              Continue without account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

  if (step === "auth") {
    return (
      <AuthForm
        onAuthSuccess={() => setStep("persona")}
        onSwitchToPersona={() => setStep("persona")}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-['Poppins'] mb-3 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Choose Your Study Buddy
          </h2>
          <p className="text-muted-foreground text-lg">
            Select the personality that resonates with you
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {personas.map((p) => (
            <PersonaCard
              key={p.persona}
              {...p}
              selected={selectedPersona === p.persona}
              onSelect={() => setSelectedPersona(p.persona)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => onStart(selectedPersona)}
            size="lg"
            className="px-12 h-12 rounded-full shadow-xl text-base"
            data-testid="button-start-chat"
          >
            Start Chatting
          </Button>
        </div>
      </div>
    </div>
  );
}