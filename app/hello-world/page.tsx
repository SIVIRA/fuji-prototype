import Chat from "./components/Chat";
import initialMessages from "./data/messages.json";

export default function HelloWorldPage() {
  return (
    <main>
      <Chat
        initialMessages={
          initialMessages as { role: "user" | "assistant"; content: string }[]
        }
      />
    </main>
  );
}
