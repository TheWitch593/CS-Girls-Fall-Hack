import BreakSuggestion from "../BreakSuggestion";

export default function BreakSuggestionExample() {
  return (
    <div className="p-8 max-w-2xl">
      <BreakSuggestion
        message="You've been studying for a while. How about a 5-minute break to recharge?"
        onAccept={() => console.log("Break accepted")}
        onDismiss={() => console.log("Break dismissed")}
      />
    </div>
  );
}
