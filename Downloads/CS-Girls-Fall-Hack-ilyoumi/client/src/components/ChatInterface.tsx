import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import MoodTimeline from "./MoodTimeline";
import SessionCard from "./SessionCard";
import ThemeToggle from "./ThemeToggle";
import MotivationalQuote from "./MotivationalQuote";
import BreakSuggestion from "./BreakSuggestion";
import { type MoodType } from "./MoodBadge";
import { Menu, Plus, X, Globe, BookOpen, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { generateAIResponse, getStudyModeTip } from "@/lib/studyModeUtils";
import type { Language } from "@/lib/translations";
import {
  getAllSessions,
  getSession,
  createNewSession,
  updateSessionMessages,
  deleteSession,
  getCurrentSessionId,
  setCurrentSessionId,
  type StudySession,
} from "@/lib/sessionManager";
import { sendChatMessage, uploadNotes, type ChatMessage } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  mood?: MoodType;
  timestamp: string;
}

interface ChatInterfaceProps {
  userName?: string;
}

export default function ChatInterface({ userName = "Student" }: ChatInterfaceProps) {
  const { language, setLanguage, studyMode, setStudyMode } = useLanguage();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBreak, setShowBreak] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [hasUploadedNotes, setHasUploadedNotes] = useState(false);

  // Initialize sessions on mount
  useEffect(() => {
    const allSessions = getAllSessions();
    setSessions(allSessions);
    
    let currentSessionId = getCurrentSessionId();
    
    // If no sessions exist, create one
    if (allSessions.length === 0) {
      const newSession = createNewSession();
      setSessions([newSession]);
      currentSessionId = newSession.id;
    } else if (!currentSessionId || !allSessions.find((s) => s.id === currentSessionId)) {
      currentSessionId = allSessions[0].id;
      setCurrentSessionId(currentSessionId);
    }
    
    setSelectedSession(currentSessionId || "");
    
    // Load messages for selected session
    if (currentSessionId) {
      const session = getSession(currentSessionId);
      if (session) {
        setMessages(session.messages);
        setIsFirstMessage(session.messages.length === 0);
      }
    }
  }, []);

  // Save messages to session when they change
  useEffect(() => {
    if (selectedSession) {
      updateSessionMessages(selectedSession, messages);
    }
  }, [messages, selectedSession]);

  const currentMoods: MoodType[] = messages
    .filter((m) => !m.isUser && m.mood)
    .map((m) => m.mood!);

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSession(newSession.id);
    setMessages([]);
    setIsFirstMessage(true);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSelectedSession(sessionId);
    
    const session = getSession(sessionId);
    if (session) {
      setMessages(session.messages);
      setIsFirstMessage(session.messages.length === 0);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      
      // If we deleted the current session, switch to another one
      if (selectedSession === sessionId) {
        if (updated.length > 0) {
          // Switch to the first remaining session
          const nextSessionId = updated[0].id;
          setCurrentSessionId(nextSessionId);
          setSelectedSession(nextSessionId);
          
          const session = getSession(nextSessionId);
          if (session) {
            setMessages(session.messages);
            setIsFirstMessage(session.messages.length === 0);
          }
        } else {
          // No sessions left, create a new one
          const newSession = createNewSession();
          setSelectedSession(newSession.id);
          setMessages([]);
          setIsFirstMessage(true);
          return [newSession];
        }
      }
      
      return updated;
    });
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);

    setIsTyping(true);
    
    try {
      // Map personality mode from study mode
      // 1 = Cheerleader (active), 2 = Peer (break), 3 = Mentor (focused/review)
      const personalityMap: Record<string, string> = {
        active: "1",
        break: "2",
        focused: "3",
        review: "3",
      };
      const personalityMode = personalityMap[studyMode] || "1";

      // Convert messages to backend format
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        text: msg.content,
        is_user: msg.isUser,
      }));

      // Send request to backend
      const response = await sendChatMessage({
        user_id: 1, // Default user ID, could be dynamic based on auth
        session_id: selectedSession,
        message: content,
        personality_mode: personalityMode,
        conversation: conversationHistory,
        use_notes: hasUploadedNotes, // Use notes if files have been uploaded
      });

      setIsTyping(false);

      // Map emotion to mood type
      // Available moods: "calm" | "frustrated" | "tired" | "motivated" | "anxious"
      const emotionToMood: Record<string, MoodType> = {
        joy: "motivated",
        sadness: "tired",
        anger: "frustrated",
        fear: "anxious",
        love: "calm",
        surprise: "anxious",
      };
      const mood = emotionToMood[response.emotion] || "calm";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.reply,
        isUser: false,
        mood: mood,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsFirstMessage(false);
    } catch (error) {
      setIsTyping(false);
      console.error("Error sending message:", error);
      
      // Show error message to user instead of fallback
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Unable to connect to AI. Please make sure the backend is running on http://localhost:8001. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        mood: "frustrated",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setIsFirstMessage(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsTyping(true);
    try {
      const response = await uploadNotes(1, file); // Default user ID
      setUploadedFiles((prev) => [...prev, file]);
      setHasUploadedNotes(true);
      
      // Show success message
      const successMessage: Message = {
        id: Date.now().toString(),
        content: `📄 Uploaded "${file.name}" successfully! ${response.num_chunks} chunks processed. You can now ask questions about your notes.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `❌ Failed to upload "${file.name}". Please try again.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div className="w-80 border-r border-white/20 dark:border-sidebar-border/30 bg-white/30 dark:bg-sidebar/30 backdrop-blur-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-['Poppins']">
              {t("sidebar.sessions", language)}
            </h2>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full hover:bg-primary/10"
              onClick={handleNewChat}
              title={t("sidebar.newSession", language)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative"
                >
                  <SessionCard
                    {...session}
                    selected={selectedSession === session.id}
                    onClick={() => handleSelectSession(session.id)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                    title="Delete session"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <header className="h-fit border-b border-white/20 dark:border-border/30 flex flex-col justify-center pt-5 pb-3 px-8 bg-white/60 dark:bg-card/30 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-full"
                data-testid="button-toggle-sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div>
                <h1 className="text-xl font-bold font-['Poppins'] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("header.title", language)}
                </h1>
                <p className="text-xs text-muted-foreground">{t("header.subtitle", language)}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 px-4">
            {/* Study Mode Selector */}
            <div className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              <Select value={studyMode} onValueChange={(value) => setStudyMode(value as any)}>
                <SelectTrigger className="w-28 bg-white/50 dark:bg-card/50 border-primary/20 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("studyMode.active", language)}</SelectItem>
                  <SelectItem value="break">{t("studyMode.break", language)}</SelectItem>
                  <SelectItem value="focused">{t("studyMode.focused", language)}</SelectItem>
                  <SelectItem value="review">{t("studyMode.review", language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-28 bg-white/50 dark:bg-card/50 border-primary/20 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("language.en", language)}</SelectItem>
                  <SelectItem value="es">{t("language.es", language)}</SelectItem>
                  <SelectItem value="fr">{t("language.fr", language)}</SelectItem>
                  <SelectItem value="de">{t("language.de", language)}</SelectItem>
                  <SelectItem value="zh">{t("language.zh", language)}</SelectItem>
                  <SelectItem value="ja">{t("language.ja", language)}</SelectItem>
                  <SelectItem value="hi">{t("language.hi", language)}</SelectItem>
                  <SelectItem value="ar">{t("language.ar", language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Study Mode Tip */}
            <div className="text-xs text-muted-foreground ml-auto">
              {getStudyModeTip(studyMode, language)}
            </div>
          </div>
        </header>

        {currentMoods.length > 0 && (
          <div className="shadow-sm">
            <MoodTimeline moods={currentMoods} />
          </div>
        )}

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm mb-2">{t("header.title", language)}</p>
                <p className="text-xs">{t("chat.placeholder", language)}</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} {...message} />
              ))
            )}
            {isTyping && <MessageBubble content="" isUser={false} isTyping={true} />}
            
            {showBreak && (
              <BreakSuggestion
                message={t("header.subtitle", language)}
                onAccept={() => {
                  console.log("Break accepted");
                  setShowBreak(false);
                }}
                onDismiss={() => setShowBreak(false)}
              />
            )}
            
            {messages.length > 0 && (
              <MotivationalQuote
                quote={t("message.motivation", language)}
                author="Study Buddy"
              />
            )}
          </div>
        </ScrollArea>

        <ChatInput 
          onSend={handleSendMessage}
          onFileUpload={handleFileUpload}
          disabled={isTyping}
          uploadedFiles={uploadedFiles}
        />
      </div>
    </div>
  );
}
