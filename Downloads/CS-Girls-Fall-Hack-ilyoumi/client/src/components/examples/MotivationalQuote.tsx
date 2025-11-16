import MotivationalQuote from "../MotivationalQuote";

export default function MotivationalQuoteExample() {
  return (
    <div className="p-8 max-w-2xl">
      <MotivationalQuote
        quote="The beautiful thing about learning is that no one can take it away from you."
        author="B.B. King"
      />
      <MotivationalQuote
        quote="Success is not final, failure is not fatal: it is the courage to continue that counts."
        author="Winston Churchill"
      />
    </div>
  );
}
