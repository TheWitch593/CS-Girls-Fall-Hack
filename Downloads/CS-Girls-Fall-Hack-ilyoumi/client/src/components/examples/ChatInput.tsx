import ChatInput from "../ChatInput";

export default function ChatInputExample() {
  const handleSend = (message: string) => {
    console.log("Message sent:", message);
  };

  return (
    <div className="p-8">
      <ChatInput onSend={handleSend} />
    </div>
  );
}
