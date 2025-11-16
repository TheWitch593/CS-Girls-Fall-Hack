import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/lib/translations";

type StudyMode = "active" | "break" | "focused" | "review";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  studyMode: StudyMode;
  setStudyMode: (mode: StudyMode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studyBuddy_language") as Language | null;
      return saved || "en";
    }
    return "en";
  });

  const [studyMode, setStudyMode] = useState<StudyMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studyBuddy_studyMode") as StudyMode | null;
      return saved || "active";
    }
    return "active";
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem("studyBuddy_language", language);
  }, [language]);

  // Save to localStorage whenever study mode changes
  useEffect(() => {
    localStorage.setItem("studyBuddy_studyMode", studyMode);
  }, [studyMode]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, studyMode, setStudyMode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
