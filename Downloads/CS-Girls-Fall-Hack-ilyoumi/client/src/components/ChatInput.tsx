import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  uploadedFiles?: File[];
}

export default function ChatInput({ onSend, onFileUpload, disabled = false, uploadedFiles = [] }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      // Validate file type
      const validTypes = [".pdf", ".docx", ".doc", ".txt"];
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      if (validTypes.includes(ext)) {
        onFileUpload(file);
      } else {
        alert("Please upload a PDF, DOCX, or TXT file");
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-white/20 dark:border-border/30 bg-white/30 dark:bg-card/30 backdrop-blur-2xl">
      {uploadedFiles.length > 0 && (
        <div className="px-6 pt-4 pb-2 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full text-xs"
              >
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            disabled={disabled}
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full"
            title="Upload notes (PDF, DOCX, TXT)"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind or ask about your notes..."
            className="resize-none min-h-[48px] max-h-32 rounded-3xl shadow-sm border bg-white/60 dark:bg-card/60 backdrop-blur-xl border-white/40 dark:border-card-border/40"
            rows={1}
            disabled={disabled}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            data-testid="button-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
