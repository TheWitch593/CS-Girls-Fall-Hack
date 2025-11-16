import { apiRequest } from "./queryClient";

export interface ChatMessage {
  text: string;
  is_user: boolean;
}

export interface ChatRequestPayload {
  user_id: number;
  session_id: string;
  message: string;
  personality_mode: string;
  conversation?: ChatMessage[];
  use_notes?: boolean;
}

export interface ChatResponsePayload {
  reply: string;
  emotion: string;
  session_id: string;
}

export interface NoteUploadResponse {
  message: string;
  num_chunks: number;
}

export interface PersonalityMode {
  name: string;
  prompt: string;
  emoji: string;
}

/**
 * Send a chat message to the backend and get an AI response
 */
export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const response = await apiRequest("POST", "/api/chat", payload);
  return response.json();
}

/**
 * Upload study notes to the backend
 */
export async function uploadNotes(userId: number, file: File): Promise<NoteUploadResponse> {
  const formData = new FormData();
  formData.append("user_id", userId.toString());
  formData.append("file", file);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8001";
  const response = await fetch(`${API_BASE}/api/notes/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload notes: ${text}`);
  }

  return response.json();
}

/**
 * Ask a question about uploaded notes
 */
export async function askAboutNotes(
  userId: number,
  sessionId: string,
  question: string,
  personalityMode: string = "1"
): Promise<ChatResponsePayload> {
  const response = await apiRequest("POST", "/api/notes/ask", {
    user_id: userId,
    session_id: sessionId,
    question,
    personality_mode: personalityMode,
  });
  return response.json();
}

/**
 * Get available personality modes from the backend
 */
export async function getPersonalityModes(): Promise<Record<string, PersonalityMode>> {
  const response = await apiRequest("GET", "/api/personality-modes");
  return response.json();
}

/**
 * Get a summary of uploaded notes
 */
export interface SummaryRequest {
  user_id: number;
  personality_mode?: string;
}

export interface SummaryResponse {
  summary: string;
  num_chunks: number;
}

export async function getNotesSummary(
  userId: number,
  personalityMode: string = "1"
): Promise<SummaryResponse> {
  const response = await apiRequest("POST", "/api/notes/summary", {
    user_id: userId,
    personality_mode: personalityMode,
  });
  return response.json();
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await apiRequest("GET", "/health");
  return response.json();
}
