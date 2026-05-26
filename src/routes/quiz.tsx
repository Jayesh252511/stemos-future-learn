import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, X, Clock, Trophy, RotateCcw, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Generator — STEMOS" },
      { name: "description", content: "Generate AI-powered adaptive quizzes on any STEM topic. Test your knowledge with instant feedback." },
    ],
  }),
  component: QuizPage,
});

type Q = { question: string; options: string[]; correct_index: number; explanation: string };

const subjects = ["Physics", "Mathematics", "Chemistry", "Biology", "Programming"] as const;
const difficulties = ["Easy", "Medium", "Hard"] as const;

function QuizPage() {
  const [topic, setTopic] = useState<string>("");
  const [diff, setDiff] = useState<(typeof difficulties)[number]>("Medium");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(0);

  const current = questions[idx];

  useEffect(() => {
    if (!started || finished || selected !== null) return;
    if (time <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, started, finished, selected]);

  const generate = async () => {
    if (!topic) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: topic, difficulty: diff, count: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions returned");
      }
      setQuestions(data.questions as Q[]);
      setStarted(true);
      setIdx(0);
      setScore(0);
      setSelected(null);
      setTime(30);
      setFinished(false);
      setStartedAt(Date.now());
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const saveAttempt = async (finalScore: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const xp = finalScore * 20;
    await supabase.from("quiz_attempts").insert({
      user_id: session.user.id,
      subject: topic,
      difficulty: diff,
      score: finalScore,
      total_questions: questions.length,
      duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
      xp_earned: xp,
    });
    // increment xp on profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", session.user.id)
      .maybeSingle();
    if (prof) {
      await supabase
        .from("profiles")
        .update({
          total_xp: (prof.total_xp ?? 0) + xp,
          last_activity_date: new Date().toISOString().slice(0, 10),
        })
        .eq("id", session.user.id);
    }
  };

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === current.correct_index;
    const nextScore = correct ? score + 1 : score;
    if (correct) setScore(nextScore);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setFinished(true);
        saveAttempt(nextScore);
      } else {
        setIdx(idx + 1);
        setSelected(null);
        setTime(30);
      }
    }, 1600);
  };

  const reset = () => {
    setStarted(false); setTopic(""); setFinished(false); setQuestions([]);
  };
  const retry = () => {
    setIdx(0); setScore(0); setSelected(null); setTime(30); setFinished(false); setStartedAt(Date.now());
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {!started && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs font-medium text-primary uppercase tracking-widest">Quiz Generator</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Test your knowledge</h1>
            <p className="mt-3 text-muted-foreground">Pick a subject and difficulty. AI generates 5 fresh questions every time.</p>

            <div className="mt-10 space-y-8">
              <div>
                <div className="text-sm font-medium mb-3">Choose a subject</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {subjects.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`rounded-2xl border p-5 text-left transition shadow-soft ${topic === t ? "border-primary bg-gradient-to-br from-primary/10 to-transparent ring-glow" : "bg-card hover:bg-secondary"}`}
                    >
                      <Sparkles className="h-5 w-5 text-primary mb-3" />
                      <div className="font-medium">{t}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">AI-generated</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">Difficulty</div>
                <div className="flex gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiff(d)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${diff === d ? "bg-foreground text-background" : "bg-card hover:bg-secondary"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!topic || generating}
                onClick={generate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero text-primary-foreground px-5 py-3.5 text-sm font-medium shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating your quiz…
                  </>
                ) : (
                  <>
                    Generate quiz <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {started && !finished && current && (
          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                Question <span className="text-foreground font-medium">{idx + 1}</span> of {questions.length}
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono ${time < 10 ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"}`}>
                <Clock className="h-3.5 w-3.5" /> {time}s
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-gradient-hero"
                animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>

            <div className="mt-10 rounded-2xl border bg-card p-7 shadow-card">
              <div className="text-xs text-primary font-medium uppercase tracking-widest mb-3">{topic} · {diff}</div>
              <h2 className="font-display text-2xl font-semibold leading-snug">{current.question}</h2>

              <div className="mt-6 space-y-2.5">
                {current.options.map((opt, i) => {
                  const isCorrect = i === current.correct_index;
                  const isSelected = selected === i;
                  const showResult = selected !== null;
                  return (
                    <motion.button
                      key={i}
                      whileHover={selected === null ? { scale: 1.01 } : {}}
                      whileTap={selected === null ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition ${
                        showResult && isCorrect ? "border-emerald-500 bg-emerald-500/10" :
                        showResult && isSelected ? "border-destructive bg-destructive/10" :
                        "hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-lg border flex items-center justify-center text-xs font-medium ${showResult && isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : showResult && isSelected ? "border-destructive bg-destructive text-white" : "bg-surface"}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm">{opt}</span>
                      </div>
                      {showResult && isCorrect && <Check className="h-4 w-4 text-emerald-500" />}
                      {showResult && isSelected && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 rounded-xl bg-secondary p-4 text-sm">
                      <span className="font-medium">Explanation: </span>{current.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="mt-6 font-display text-4xl font-semibold">Quiz complete!</h2>
            <p className="mt-2 text-muted-foreground">You scored</p>
            <div className="mt-2 font-display text-6xl font-semibold text-gradient">{score}/{questions.length}</div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                ["Correct", score, "text-emerald-500"],
                ["Wrong", questions.length - score, "text-destructive"],
                ["Score", `${Math.round((score / questions.length) * 100)}%`, "text-primary"],
              ].map(([l, v, c]: any) => (
                <div key={l} className="rounded-xl border bg-card p-4">
                  <div className={`font-display text-2xl font-semibold ${c}`}>{v}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-2">
              <button onClick={retry} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition">
                <RotateCcw className="h-4 w-4" /> Retry
              </button>
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition">
                New quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
