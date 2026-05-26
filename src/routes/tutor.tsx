import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Send, Atom, Sigma, FlaskConical, Code2, Plus, MessageSquare, BrainCircuit
} from "lucide-react";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — STEMOS" },
      { name: "description", content: "Ask any STEM question and get step-by-step explanations from STEMOS AI tutor." },
    ],
  }),
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const topics = [
  { name: "Physics", icon: Atom, color: "text-cyan-500" },
  { name: "Math", icon: Sigma, color: "text-violet-500" },
  { name: "Chemistry", icon: FlaskConical, color: "text-fuchsia-500" },
  { name: "Coding", icon: Code2, color: "text-emerald-500" },
];

const suggestions = [
  "Explain quantum entanglement like I'm 15",
  "Solve: ∫ x·sin(x) dx step by step",
  "Why does ice float on water?",
  "Write a Python function for binary search",
];

const history = [
  { title: "Newton's laws of motion", time: "2h ago" },
  { title: "Derivatives chain rule", time: "Yesterday" },
  { title: "Periodic trends explained", time: "2d ago" },
  { title: "Recursion in Python", time: "3d ago" },
  { title: "Electromagnetic induction", time: "1w ago" },
];

const sampleResponse = (q: string) => `Great question! Let me break this down.

**Core idea**
${q.length > 60 ? "This concept" : q} rests on a few first principles. Let's unpack them one at a time so the intuition sticks.

**Step 1 — Setup**
We start by identifying the variables in play. This is the part most students skip, and it's why the rest feels confusing.

**Step 2 — Reasoning**
Once we know what we're working with, we can apply the relevant law or equation. Notice the pattern: the unknown always sits opposite the operator.

**Step 3 — Result**
\`\`\`
answer = clean and simple
\`\`\`

Want me to drill in deeper on any step, or try a related problem?`;

function TutorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [streamed, setStreamed] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamed]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setStreamed("");

    const full = sampleResponse(text);
    let i = 0;
    const interval = setInterval(() => {
      i += 6;
      setStreamed(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(interval);
        setTyping(false);
        setStreamed("");
        setMessages((m) => [...m, { role: "assistant", content: full }]);
      }
    }, 18);
  };

  return (
    <Layout hideFooter>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col rounded-2xl border bg-surface overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={() => setMessages([])}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Recent</div>
            {history.map((h) => (
              <button key={h.title} className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-secondary transition group">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{h.title}</div>
                    <div className="text-[10px] text-muted-foreground">{h.time}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t text-[11px] text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5" />
            STEMOS Tutor · v2.0
          </div>
        </aside>

        {/* Chat */}
        <section className="flex flex-col rounded-2xl border bg-surface overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-mesh opacity-60 pointer-events-none" />

          <div className="relative border-b px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">STEMOS AI Tutor</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online · Responds instantly
                </div>
              </div>
            </div>
            <div className="hidden sm:flex gap-1.5">
              {topics.map((t) => (
                <button key={t.name} onClick={() => send(`Help me with ${t.name}`)} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-secondary transition">
                  <t.icon className={`h-3.5 w-3.5 ${t.color}`} /> {t.name}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-4 md:px-8 py-6 space-y-6">
            {messages.length === 0 && !typing && (
              <div className="h-full flex flex-col items-center justify-center text-center pt-12">
                <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold">What do you want to learn today?</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">Ask me anything in Math, Physics, Chemistry, or Programming. I'll explain it step by step.</p>
                <div className="mt-8 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left rounded-xl border bg-card hover:bg-secondary transition p-3.5 text-sm shadow-soft">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}
            </AnimatePresence>

            {typing && (
              <Bubble msg={{ role: "assistant", content: streamed || "▍" }} typing />
            )}
          </div>

          <div className="relative border-t bg-surface p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft focus-within:ring-glow transition"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask anything in STEM…"
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none max-h-40"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">STEMOS may produce inaccurate information. Always verify important answers.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Bubble({ msg, typing }: { msg: Msg; typing?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0 shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-foreground text-background" : "bg-card border shadow-soft"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {typing && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-xs font-medium">
          You
        </div>
      )}
    </motion.div>
  );
}
