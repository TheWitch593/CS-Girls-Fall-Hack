export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 px-5 py-4 bg-white/50 dark:bg-card/50 backdrop-blur-xl rounded-3xl rounded-tl-md border border-white/40 dark:border-card-border/40 shadow-md" data-testid="indicator-typing">
      <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce" />
    </div>
  );
}
