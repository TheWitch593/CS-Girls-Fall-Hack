import TypingIndicator from "../TypingIndicator";

export default function TypingIndicatorExample() {
  return (
    <div className="p-8">
      <div className="max-w-md">
        <div className="inline-block bg-card border border-card-border rounded-2xl rounded-tl-sm">
          <TypingIndicator />
        </div>
      </div>
    </div>
  );
}
