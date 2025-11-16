import MessageBubble from "../MessageBubble";

export default function MessageBubbleExample() {
  return (
    <div className="p-8 space-y-4 max-w-4xl">
      <MessageBubble
        content="Hi! I'm feeling really stressed about my upcoming exam."
        isUser={true}
        timestamp="2:30 PM"
      />
      <MessageBubble
        content="I hear you - exam stress is completely normal. Let's take a moment to breathe together. What subject are you studying?"
        isUser={false}
        mood="anxious"
        timestamp="2:31 PM"
      />
      <MessageBubble
        content="It's calculus. I just don't understand derivatives."
        isUser={true}
      />
      <MessageBubble content="" isUser={false} isTyping={true} />
    </div>
  );
}
