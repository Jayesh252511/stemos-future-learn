import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Sparkles, Send, Atom, Sigma, FlaskConical, Code2, Plus, MessageSquare,
  BrainCircuit, Lightbulb, ListChecks, Globe2, FileText, Loader2, Square,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { streamChat, type ChatMsg } from "@/lib/ai-stream";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — STEMOS" },
      { name: "description", content: "Ask any STEM question and get step-by-step explanations from STEMOS AI tutor." },
    ],
  }),
  component: TutorPage,
});

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

const quickActions = [
  { label: "Explain Simply", icon: Lightbulb, prompt: "Explain that again, simply, like I'm a beginner. Use an everyday analogy." },
  { label: "Real World Example", icon: Globe2, prompt: "Give me a real-world example of that concept that I'd encounter in daily life." },
  { label: "Create Quiz", icon: ListChecks, prompt: "Create 3 multiple-choice questions to test my understanding of what you just explained. Show the answers at the end." },
  { label: "Summarize", icon: FileText, prompt: "Summarize everything we've discussed so far in 5 bullet points." },
];

type Conversation = { id: string; title: string; messages: ChatMsg[]; updatedAt: number };
const STORAGE_KEY = "stemos.chats.v1";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch { return []; }
}

function saveConversations(list: Conversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30))); } catch {}
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function TutorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setConversations(loadConversations()); }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamed]);

  const persist = (msgs: ChatMsg[]) => {
    if (msgs.length === 0) return;
    const firstUser = msgs.find((m) => m.role === "user")?.content ?? "New chat";
    const title = firstUser.slice(0, 60);
    const id = activeId ?? crypto.randomUUID();
    const next: Conversation = { id, title, messages: msgs, updatedAt: Date.now() };
    setActiveId(id);
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== id);
      const list = [next, ...rest];
      saveConversations(list);
      return list;
    });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setStreamed("");

    let acc = "";
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamChat({
        messages: next,
        signal: ctrl.signal,
        onDelta: (chunk) => {
          acc += chunk;
          setStreamed(acc);
        },
      });
      const finalMsgs = [...next, { role: "assistant" as const, content: acc }];
      setMessages(finalMsgs);
      persist(finalMsgs);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        if (acc) {
          const finalMsgs = [...next, { role: "assistant" as const, content: acc + "\n\n_[stopped]_" }];
          setMessages(finalMsgs);
          persist(finalMsgs);
        }
      } else {
        toast.error(e?.message ?? "Something went wrong");
        setMessages(next);
      }
    } finally {
      setStreamed("");
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setActiveId(null);
    setStreamed("");
  };

  const openChat = (c: Conversation) => {
    abortRef.current?.abort();
    setActiveId(c.id);
    setMessages(c.messages);
    setStreamed("");
  };

  return (
    <Layout hideFooter>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-65px)]">
        <aside className="hidden lg:flex flex-col rounded-2xl border bg-surface overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={newChat}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> New chat
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Recent</div>
            {conversations.length === 0 && (
              <div className="px-2.5 py-6 text-center text-xs text-muted-foreground">
                Your chats will appear here.
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openChat(c)}
                className={`w-full text-left rounded-lg px-2.5 py-2 transition group ${activeId === c.id ? "bg-secondary" : "hover:bg-secondary"}`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(c.updatedAt)}</div>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online · Powered by Lovable AI
                </div>
              </div>
            </div>
            <div className="hidden sm:flex gap-1.5">
              {topics.map((t) => (
                <button
                  key={t.name}
                  onClick={() => send(`Help me with ${t.name}. Suggest a great starting topic for me.`)}
                  disabled={streaming}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-secondary transition disabled:opacity-50"
                >
                  <t.icon className={`h-3.5 w-3.5 ${t.color}`} /> {t.name}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-4 md:px-8 py-6 space-y-6">
            {messages.length === 0 && !streaming && (
              <div className="h-full flex flex-col items-center justify-center text-center pt-12">
                <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold">What do you want to learn today?</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">Ask me anything in Math, Physics, Chemistry, or Programming. I'll explain it step by step.</p>
                <div className="mt-8 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left rounded-xl border bg-card hover:bg-secondary transition p-3.5 text-sm shadow-soft"
                    >
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

            {streaming && (
              <Bubble msg={{ role: "assistant", content: streamed }} typing />
            )}
          </div>

          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && !streaming && (
            <div className="relative border-t px-4 py-2.5 flex flex-wrap gap-1.5 bg-surface">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                >
                  <a.icon className="h-3 w-3" /> {a.label}
                </button>
              ))}
            </div>
          )}

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
              {streaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="h-9 w-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition"
                  aria-label="Stop"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">STEMOS may produce inaccurate information. Always verify important answers.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Bubble({ msg, typing }: { msg: ChatMsg; typing?: boolean }) {
  const isUser = msg.role === "user";
  const showLoader = typing && !msg.content;
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
        ) : showLoader ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs">Thinking…</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
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
