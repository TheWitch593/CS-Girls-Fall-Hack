import type { MoodType } from "@/components/MoodBadge";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  mood?: MoodType;
  timestamp: string;
}

export interface StudySession {
  id: string;
  date: string;
  preview: string;
  messages: ChatMessage[];
  moods: MoodType[];
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = "studyBuddy_sessions";
const CURRENT_SESSION_KEY = "studyBuddy_currentSession";

export function getAllSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getSession(id: string): StudySession | null {
  const sessions = getAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function createNewSession(): StudySession {
  const now = Date.now();
  const session: StudySession = {
    id: `session_${now}`,
    date: new Date().toLocaleString(),
    preview: "New conversation...",
    messages: [],
    moods: [],
    createdAt: now,
    updatedAt: now,
  };
  
  const sessions = getAllSessions();
  sessions.unshift(session); // Add to beginning
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  localStorage.setItem(CURRENT_SESSION_KEY, session.id);
  
  return session;
}

function extractChatTitle(userMessage: string): string {
  // Remove common question words and get the core topic
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Common starting phrases to remove
  const prefixes = [
    "how can i", "how do i", "how to", "how",
    "what is", "what are", "what", 
    "explain", "why", "where",
    "i'm confused about", "i'm struggling with", "help with",
    "tell me about", "describe", "define"
  ];
  
  let title = lowerMessage;
  for (const prefix of prefixes) {
    if (title.startsWith(prefix)) {
      title = title.replace(prefix, "").trim();
      break;
    }
  }
  
  // Remove question mark and extra spaces
  title = title.replace(/\?+$/, "").trim();
  
  // Take up to 3-4 words or until a natural break
  const words = title.split(/\s+/);
  let result = words.slice(0, 3).join(" ");
  
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  // Add ellipsis if original was longer
  if (words.length > 3 || lowerMessage.length > 30) {
    result += "...";
  }
  
  return result || "New conversation...";
}

export function updateSessionMessages(
  sessionId: string,
  messages: ChatMessage[]
): void {
  if (typeof window === "undefined") return;
  
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
  
  if (sessionIndex !== -1) {
    // Update messages
    sessions[sessionIndex].messages = messages;
    sessions[sessionIndex].updatedAt = Date.now();
    
    // Update preview - extract title from first user message
    let titleText = "New conversation...";
    const firstUserMessage = messages.find((m) => m.isUser);
    if (firstUserMessage) {
      titleText = extractChatTitle(firstUserMessage.content);
    }
    sessions[sessionIndex].preview = titleText;
    
    // Extract moods from AI responses
    sessions[sessionIndex].moods = messages
      .filter((m) => !m.isUser && m.mood)
      .map((m) => m.mood!)
      .filter((mood, i, arr) => arr.indexOf(mood) === i); // Remove duplicates
    
    // Move to top (most recent first)
    sessions.unshift(sessions.splice(sessionIndex, 1)[0]);
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function deleteSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  
  const sessions = getAllSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  
  // If we deleted the current session, create a new one
  const current = localStorage.getItem(CURRENT_SESSION_KEY);
  if (current === sessionId) {
    if (filtered.length > 0) {
      localStorage.setItem(CURRENT_SESSION_KEY, filtered[0].id);
    } else {
      const newSession = createNewSession();
      localStorage.setItem(CURRENT_SESSION_KEY, newSession.id);
    }
  }
}

export function getCurrentSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_SESSION_KEY, id);
}
