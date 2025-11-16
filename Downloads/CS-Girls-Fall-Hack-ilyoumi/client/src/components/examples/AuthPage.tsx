import AuthPage from "../AuthPage";

export default function AuthPageExample() {
  return (
    <AuthPage
      onStart={(persona) => console.log("Starting with persona:", persona)}
    />
  );
}
