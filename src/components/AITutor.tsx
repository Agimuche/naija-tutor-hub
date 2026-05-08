import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export function AITutor({ topicTitle }: { topicTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: `Hi! I'm your AI Chemistry tutor 👋\n\nAsk me anything about ${topicTitle ?? "SSS Chemistry"} — concepts, equations, worked examples, or exam tips.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    let acc = "";

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next, topicTitle }),
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Slow down — rate limit reached.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("AI tutor unavailable.");
        setLoading(false); return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const upsert = (chunk: string) => {
        acc += chunk;
        setMessages((p) => {
          const last = p[p.length - 1];
          if (last?.role === "assistant" && last !== next[next.length - 1]) {
            return p.map((m, i) => (i === p.length - 1 ? { ...m, content: acc } : m));
          }
          return [...p, { role: "assistant", content: acc }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { buf = ""; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Open AI Tutor"
        className="fixed bottom-6 right-6 z-40 grid place-items-center h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground shadow-elegant hover:scale-105 transition-transform">
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-40 w-[min(420px,calc(100vw-2rem))] h-[min(600px,calc(100vh-3rem))] flex flex-col shadow-elegant border-2 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-hero text-primary-foreground">
        <div className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5" /> AI Chemistry Tutor</div>
        <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              ) : m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground px-2">Thinking…</div>}
      </div>
      <form className="p-3 border-t flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about chemistry..." disabled={loading} />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-gradient-hero shrink-0"><Send className="h-4 w-4" /></Button>
      </form>
    </Card>
  );
}
