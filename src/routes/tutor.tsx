import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Sparkles, Send, Atom, Sigma, FlaskConical, Code2, Plus, MessageSquare,
  BrainCircuit, Lightbulb, ListChecks, Globe2, FileText, Square,
  BookOpen, Zap, Copy, Check, ChevronDown
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { streamChat, type ChatMsg } from "@/lib/ai-stream";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, AI_LANG_NAME } from "@/lib/i18n";
import { useTutorLanguage } from "@/lib/i18n-tutor";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "STEMOS AI Tutor" },
      { name: "description", content: "Ask any STEM question and get step-by-step explanations from the STEMOS Tutor." },
    ],
  }),
  component: TutorPage,
});

import { DoodleAtom, DoodleCode, DoodleFormula, DoodleStar } from "@/components/site/Doodles";

const topicStyles: Record<string, any> = {
  Physics: { icon: Atom, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  Math: { icon: Sigma, color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  Chemistry: { icon: FlaskConical, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10 border-fuchsia-500/20" },
  Coding: { icon: Code2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

const quickActions = [
  { key: "explainSimply" as const, icon: Lightbulb, prompt: "Explain that again, simply, like I'm a beginner. Use an everyday analogy." },
  { key: "realWorldEx" as const, icon: Globe2, prompt: "Give me a real-world example of that concept that I'd encounter in daily life." },
  { key: "createQuiz" as const, icon: ListChecks, prompt: "Create 3 multiple-choice questions to test my understanding of what you just explained. Show the answers at the end." },
  { key: "summarize" as const, icon: FileText, prompt: "Summarize everything we've discussed so far in 5 bullet points." },
  { key: "goDeeper" as const, icon: BookOpen, prompt: "Go deeper into the last concept. Explain it at an advanced level with more technical detail." },
  { key: "quickFlashcard" as const, icon: Zap, prompt: "Make a flashcard format: Q on top, A below, for the key concept we just discussed." },
];

type Conversation = { id: string; title: string; messages: ChatMsg[]; updatedAt: number };
const STORAGE_KEY = "stemos.chats.v2";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
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
  const { lang, t } = useLanguage();
  const { tt } = useTutorLanguage();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConversations(loadConversations());
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "";
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamed]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      // Clear the param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Wait briefly for states to initialize
      setTimeout(() => {
        const msg = t("helpMeWith") ? `${t("helpMeWith")} ${q}.` : `Help me learn about: ${q}. Let's start with the basics.`;
        send(msg);
      }, 300);
    }
  }, []);

  const persist = (msgs: ChatMsg[]) => {
    if (msgs.length === 0) return;
    const firstUser = msgs.find(m => m.role === "user")?.content ?? "New chat";
    const title = firstUser.slice(0, 60);
    const id = activeId ?? crypto.randomUUID();
    const next: Conversation = { id, title, messages: msgs, updatedAt: Date.now() };
    setActiveId(id);
    setConversations(prev => {
      const list = [next, ...prev.filter(c => c.id !== id)];
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

    // Build locale string: use full language name for non-English
    const localeStr = lang !== "en" ? AI_LANG_NAME[lang] : undefined;

    try {
      await streamChat({
        messages: next,
        signal: ctrl.signal,
        locale: localeStr,
        onDelta: chunk => { acc += chunk; setStreamed(acc); },
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
    setMessages([]); setActiveId(null); setStreamed("");
    setSuggestionIdx(i => i + 1);
  };
  const openChat = (c: Conversation) => {
    abortRef.current?.abort();
    setActiveId(c.id); setMessages(c.messages); setStreamed("");
  };
  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => { const list = prev.filter(c => c.id !== id); saveConversations(list); return list; });
    if (activeId === id) { setMessages([]); setActiveId(null); }
  };

  const allSuggestions = tt("suggestions") as unknown as string[][];
  const suggestions = allSuggestions[suggestionIdx % allSuggestions.length];
  const topics = tt("topics") as unknown as { name: string; key: string }[];

  return (
    <Layout hideFooter>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-65px)]">
        <aside className="hidden lg:flex flex-col rounded-2xl border bg-surface overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={newChat}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" /> {t("newChat")}
            </button>
          </div>
          <div className="flex-1 overflow-auto scrollbar-thin p-2">
            <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{t("recentChats")}</div>
            {conversations.length === 0 && (
              <div className="px-2.5 py-6 text-center text-xs text-muted-foreground">
                {tt("emptyChats")}
              </div>
            )}
            {conversations.map(c => (
              <button key={c.id} onClick={() => openChat(c)}
                className={`w-full text-left rounded-lg px-2.5 py-2 transition group ${activeId === c.id ? "bg-secondary" : "hover:bg-secondary"}`}>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(c.updatedAt)}</div>
                  </div>
                  <button onClick={e => deleteChat(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition text-[10px] px-1" title={tt("deleteL") as string}>✕</button>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t text-[11px] text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5" /> {t("poweredBy")}
          </div>
        </aside>

        <section className="flex flex-col rounded-2xl border bg-surface overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-mesh opacity-60 pointer-events-none" />
          {/* Subtle doodles */}
          <DoodleAtom className="absolute top-8 right-8 text-primary" size={48} opacity={0.08} />
          <DoodleCode className="absolute top-12 right-20 text-cyan-500" size={40} opacity={0.1} />

          <div className="relative border-b px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">{tt("stemosTutor")}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {tt("onlineRepliesIn")} {lang !== "en" ? AI_LANG_NAME[lang] : "Groq LLaMA"}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex gap-1.5">
              {topics.map(tp => {
                const style = topicStyles[tp.key];
                return (
                  <button key={tp.key} onClick={() => send(`${tt("helpMeWith")} ${tp.name}.`)}
                    disabled={streaming}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs hover:opacity-80 transition disabled:opacity-50 ${style.bg}`}>
                    <style.icon className={`h-3.5 w-3.5 ${style.color}`} /> {tp.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-4 md:px-8 py-6 space-y-6">
            {messages.length === 0 && !streaming && (
              <div className="h-full flex flex-col items-center justify-center text-center pt-12 relative">
                {/* Background doodles on empty state */}
                <DoodleStar className="absolute top-4 left-8 text-amber-500" size={36} opacity={0.12} />
                <DoodleFormula className="absolute bottom-16 right-4 text-violet-500" size={70} opacity={0.1} />

                <div className="h-14 w-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold">
                  {userName ? t("whatToLearn").replace("?", `, ${userName.split(" ")[0]}?`) : t("whatToLearn")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  {t("askAnything")}
                </p>
                <div className="mt-8 grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left rounded-xl border bg-card hover:bg-secondary transition p-3.5 text-sm shadow-soft group">
                      <span className="group-hover:text-primary transition-colors">{s}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSuggestionIdx(i => i + 1)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                  <ChevronDown className="h-3.5 w-3.5" /> {t("showDifferent")}
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            </AnimatePresence>
            {streaming && <Bubble msg={{ role: "assistant", content: streamed }} typing />}
          </div>

          {messages.length > 0 && !streaming && (
            <div className="relative border-t border-b bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Zap className="h-4 w-4 animate-pulse" /> Ready to test what you just learned?
              </div>
              <button 
                onClick={() => {
                  const chatContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\\n\\n");
                  sessionStorage.setItem("stemos_quiz_context", chatContext);
                  window.location.href = "/quiz";
                }} 
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-background text-xs font-bold rounded-lg hover:opacity-90 transition"
              >
                <ListChecks className="h-3.5 w-3.5" /> Generate Interactive Quiz
              </button>
            </div>
          )}

          {messages.length > 0 && messages[messages.length - 1].role === "assistant" && !streaming && (
            <div className="relative border-t px-4 py-2.5 flex flex-wrap gap-1.5 bg-surface">
              {quickActions.map(a => (
                <button key={a.key} onClick={() => send(a.prompt)}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary transition">
                  <a.icon className="h-3 w-3" /> {t(a.key)}
                </button>
              ))}
            </div>
          )}

          <div className="relative border-t bg-surface p-4">
            <form onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft focus-within:ring-glow transition">
              <textarea ref={textareaRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={t("askAnything")} rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none max-h-40" />
              {streaming ? (
                <button type="button" onClick={stop}
                  className="h-9 w-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition shrink-0" aria-label={t("stopGenerate")}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()}
                  className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition shrink-0" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">{t("tutorDisclaimer")}</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Bubble({ msg, typing }: { msg: ChatMsg; typing?: boolean }) {
  const { tt } = useTutorLanguage();
  const { t } = useLanguage();
  const isUser = msg.role === "user";
  const showLoader = typing && !msg.content;
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0 shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[80%] group relative rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-foreground text-background" : "bg-card border shadow-soft"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : showLoader ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
              ))}
            </div>
            <span className="text-xs">{t("thinking")}</span>
          </div>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_h2]:font-display [&_h3]:font-display">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {typing && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
            </div>
            {!typing && (
              <button onClick={copyText}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition rounded-md p-1 hover:bg-secondary text-muted-foreground" title="Copy">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-xs font-medium">
          {tt("youL")}
        </div>
      )}
    </motion.div>
  );
}
