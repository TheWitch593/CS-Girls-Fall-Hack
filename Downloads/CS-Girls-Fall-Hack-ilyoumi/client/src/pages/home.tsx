import { useState } from "react";
import { useLocation } from "wouter";
import AuthPage from "@/components/AuthPage";
import ChatInterface from "@/components/ChatInterface";
import { type PersonaType } from "@/components/PersonaCard";

export default function Home() {
  const [, setLocation] = useLocation();
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("mentor");

  const handleStart = (persona: PersonaType) => {
    setSelectedPersona(persona);
    setHasStarted(true);
    console.log("Started with persona:", persona);
  };

  if (!hasStarted) {
    return <AuthPage onStart={handleStart} />;
  }

  return <ChatInterface />;
}
