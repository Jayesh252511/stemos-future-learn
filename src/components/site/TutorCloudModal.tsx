import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Sparkles, Send, Square, X, MessageSquare, ListChecks, Play, Loader2, Check, ChevronRight } from "lucide-react";
import { streamChat, type ChatMsg } from "@/lib/ai-stream";
import { supabase } from "@/integrations/supabase/client";

type Q = { question: string; options: string[]; correct_index: number; explanation: string };

interface TutorCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeTitle: string;
  subjectName: string;
  onPassed: (title: string, score: number) => void;
}

export function TutorCloudModal({ isOpen, onClose, nodeTitle, subjectName, onPassed }: TutorCloudModalProps) {
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  
  // Chat State
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Quiz State
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode("learn");
      setMessages([]);
      setInput("");
      setQuestions([]);
      setIdx(0);
      setScore(0);
      setSelected(null);
      // Auto-start chat
      setTimeout(() => {
        sendChat(`I want to master: ${nodeTitle}. Let's break it down step-by-step.`);
      }, 300);
    } else {
      abortRef.current?.abort();
    }
  }, [isOpen, nodeTitle]);

  useEffect(() => {
    if (mode === "learn") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streamed, mode]);

  const sendChat = async (text: string) => {
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
        onDelta: chunk => { acc += chunk; setStreamed(acc); },
      });
      setMessages([...next, { role: "assistant" as const, content: acc }]);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast.error(e?.message ?? "Failed to send message");
        setMessages(next);
      }
    } finally {
      setStreamed("");
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stopChat = () => abortRef.current?.abort();

  const startQuiz = async () => {
    setMode("quiz");
    setGenerating(true);
    try {
      const contextStr = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject: nodeTitle,
          difficulty: "Medium", 
          count: 3, // Short quiz to unlock
          context: contextStr,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setQuestions(data.questions as Q[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate quiz");
      setMode("learn"); // fallback
    } finally {
      setGenerating(false);
    }
  };

  const saveAttempt = async (finalScore: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from("quiz_attempts").insert({
      user_id: session.user.id,
      subject: nodeTitle, // Store node title instead of global subject
      difficulty: "Medium",
      score: finalScore,
      total_questions: questions.length,
      xp_earned: finalScore * 20,
    });

    if (finalScore >= 2) { // Pass criteria (2 out of 3)
      toast.success("Node Mastered! Next step unlocked.");
      onPassed(nodeTitle, finalScore);
    } else {
      toast.error("Not quite enough to pass. Keep reviewing!");
      setMode("learn");
    }
  };

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === questions[idx].correct_index;
    const nextScore = correct ? score + 1 : score;
    if (correct) setScore(nextScore);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        saveAttempt(nextScore);
      } else {
        setIdx(idx + 1);
        setSelected(null);
      }
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border shadow-card rounded-[2rem] overflow-hidden flex flex-col h-[85vh] max-h-[800px]"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b bg-surface">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
              {mode === "learn" ? <MessageSquare className="h-5 w-5 text-primary-foreground" /> : <ListChecks className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg leading-tight">{nodeTitle}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {subjectName} <ChevronRight className="h-3 w-3" /> {mode === "learn" ? "Learning" : "Testing"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden flex flex-col bg-background">
          {mode === "learn" ? (
            <>
              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-foreground text-background rounded-tr-sm" : "bg-surface border shadow-soft rounded-tl-sm"}`}>
                      {m.role === "user" ? m.content : (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {streaming && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-surface border shadow-soft rounded-tl-sm">
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1">
                        <ReactMarkdown>{streamed}</ReactMarkdown>
                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-surface border-t">
                {messages.length > 2 && !streaming && (
                  <button onClick={startQuiz} className="mb-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition">
                    <Check className="h-4 w-4" /> I'm Ready for the Quiz
                  </button>
                )}
                <form onSubmit={e => { e.preventDefault(); sendChat(input); }} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question about this topic..."
                    className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm shadow-inner focus:outline-none focus:border-primary transition"
                  />
                  {streaming ? (
                    <button type="button" onClick={stopChat} className="h-10 w-10 shrink-0 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition">
                      <Square className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <button type="submit" disabled={!input.trim()} className="h-10 w-10 shrink-0 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition">
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>
            </>
          ) : generating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-display font-semibold">Generating Your Quiz</h3>
              <p className="text-muted-foreground mt-2">Customizing questions based on what we just discussed...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-primary">Question {idx + 1} of {questions.length}</span>
                <span className="text-sm font-medium">Score: {score}</span>
              </div>
              <h3 className="text-xl font-display font-semibold mb-8 leading-snug">{questions[idx].question}</h3>
              <div className="grid gap-3 mt-auto">
                {questions[idx].options.map((opt, i) => {
                  const isCorrect = i === questions[idx].correct_index;
                  const isSelected = selected === i;
                  let btnClass = "bg-card hover:bg-secondary border-border";
                  if (selected !== null) {
                    if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300";
                    else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300";
                    else btnClass = "opacity-50 bg-card border-border";
                  }
                  return (
                    <button
                      key={i}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(i)}
                      className={`text-left p-4 rounded-xl border-2 transition-all font-medium ${btnClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-xl border ${selected === questions[idx].correct_index ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"}`}>
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    {selected === questions[idx].correct_index ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {selected === questions[idx].correct_index ? "Correct!" : "Incorrect"}
                  </div>
                  <p className="text-sm">{questions[idx].explanation}</p>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
