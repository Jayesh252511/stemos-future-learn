import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Code2, Atom, Sigma, FlaskConical, Play, Trophy, RotateCcw, Sparkles, ChevronRight, Loader2, Check, X, Clock, Zap, Flame, Award, Terminal, MessageSquare } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { useQuizLanguage } from "@/lib/i18n-quiz";
import { DoodleStar, DoodleAtom, DoodleRocket } from "@/components/site/Doodles";

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

const subjects = [
  { name: "Mathematics", icon: Sigma, color: "text-violet-500", border: "border-violet-500/20" },
  { name: "Physics", icon: Atom, color: "text-cyan-500", border: "border-cyan-500/20" },
  { name: "Chemistry", icon: FlaskConical, color: "text-pink-500", border: "border-pink-500/20" },
  { name: "Biology", icon: Sparkles, color: "text-emerald-500", border: "border-emerald-500/20" },
  { name: "Programming", icon: Code2, color: "text-amber-500", border: "border-amber-500/20" },
] as const;

const difficulties = ["Easy", "Medium", "Hard"] as const;

const languages = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "C++", "C", "Java", "SQL"];

const subtopicsMap: Record<string, string[]> = {
  Mathematics: ["Algebra", "Trigonometry", "Calculus", "Probability", "Geometry", "Statistics", "Linear Algebra"],
  Physics: ["Mechanics", "Motion", "Thermodynamics", "Electricity", "Magnetism", "Optics", "Modern Physics"],
  Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Chemical Bonding", "Periodic Table"],
  Biology: ["Genetics", "Human Body", "Cells", "Evolution", "Ecology", "Biotechnology"],
  Programming: ["loops", "functions", "lists", "OOP", "debugging", "memory", "recursion", "algorithms", "APIs", "SQL queries"],
};

function parseCodeQuestion(questionText: string) {
  if (!questionText.includes("```")) return { text: questionText, code: null, lang: "" };
  const parts = questionText.split("```");
  const firstPart = parts[0];
  const codeWithLang = parts[1];
  const lastPart = parts.slice(2).join("```");
  
  const firstLineBreak = codeWithLang.indexOf("\n");
  const lang = codeWithLang.substring(0, firstLineBreak).trim();
  const code = codeWithLang.substring(firstLineBreak + 1);
  return { text: firstPart, code, lang, suffix: lastPart };
}

function QuizPage() {
  const { t } = useLanguage();
  const { tq } = useQuizLanguage();
  const [topic, setTopic] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("");
  const [diff, setDiff] = useState<(typeof difficulties)[number]>("Medium");
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [streakCount, setStreakCount] = useState(0); // dynamic combo streak count
  const [showCombo, setShowCombo] = useState(false);
  const [hasContext, setHasContext] = useState(false);

  const current = questions[idx];

  useEffect(() => {
    if (sessionStorage.getItem("stemos_quiz_context")) {
      setHasContext(true);
    }
  }, []);

  useEffect(() => {
    if (!started || finished || selected !== null) return;
    if (time <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time, started, finished, selected]);

  const selectSubject = (subjectName: string) => {
    setTopic(subjectName);
    setSelectedSubtopic("");
    if (subjectName === "Programming") {
      setShowLanguageModal(true);
    } else {
      setShowSubtopicModal(true);
    }
  };

  const generate = async (useContext: boolean = false) => {
    if (!topic && !useContext) return;
    setGenerating(true);
    try {
      let contextStr = undefined;
      let finalTopic = topic;
      if (useContext) {
        contextStr = sessionStorage.getItem("stemos_quiz_context") || "";
        finalTopic = "Recent Chat Session";
      }

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject: finalTopic, 
          difficulty: diff, 
          count: 5,
          language: selectedLanguage || undefined,
          subtopic: selectedSubtopic || undefined,
          context: contextStr,
        }),
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
      setStreakCount(0);
      setShowCombo(false);
      if (useContext) {
        sessionStorage.removeItem("stemos_quiz_context");
        setHasContext(false);
      }
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
    
    // Streak reward bonus
    const finalXp = finalScore === 5 ? xp + 50 : xp;

    await supabase.from("quiz_attempts").insert({
      user_id: session.user.id,
      subject: topic === "Programming" ? `${selectedLanguage || "Coding"}` : topic,
      difficulty: diff,
      score: finalScore,
      total_questions: questions.length,
      duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
      xp_earned: finalXp,
    });
    
    const { data: prof } = await supabase
      .from("profiles")
      .select("total_xp, current_streak")
      .eq("id", session.user.id)
      .maybeSingle();

    if (prof) {
      const nextStreak = (prof.current_streak ?? 0) + 1;
      await supabase
        .from("profiles")
        .update({
          total_xp: (prof.total_xp ?? 0) + finalXp,
          current_streak: nextStreak,
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
    
    if (correct) {
      setScore(nextScore);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      if (newStreak >= 2) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1200);
      }
    } else {
      setStreakCount(0);
    }

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setFinished(true);
        saveAttempt(nextScore);
      } else {
        setIdx(idx + 1);
        setSelected(null);
        setTime(30);
      }
    }, 1800);
  };

  const reset = () => {
    setStarted(false); 
    setTopic(""); 
    setSelectedLanguage("");
    setSelectedSubtopic("");
    setFinished(false); 
    setQuestions([]);
  };

  const retry = () => {
    setIdx(0); 
    setScore(0); 
    setSelected(null); 
    setTime(30); 
    setFinished(false); 
    setStartedAt(Date.now());
    setStreakCount(0);
    setShowCombo(false);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {!started && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse" /> {tq("quizGenTitle")}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              {tq("testIntell1")} <span className="text-gradient">{tq("testIntell2")}</span>
            </h1>
            <p className="mt-3 text-muted-foreground">{tq("customizeSession")}</p>

            {hasContext && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-5 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Recent Tutor Session Detected</h4>
                    <p className="text-xs text-muted-foreground">We found a recent chat. Test your knowledge based on what you just learned.</p>
                  </div>
                </div>
                <button onClick={() => generate(true)} disabled={generating} className="w-full md:w-auto px-5 py-2.5 bg-primary text-background text-sm font-semibold rounded-xl hover:opacity-90 shadow-sm transition disabled:opacity-50 flex items-center gap-2 justify-center">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Generate Quiz
                </button>
              </motion.div>
            )}

            <div className="mt-10 space-y-8">
              <div>
                <div className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  {tq("chooseSubject")}
                  {selectedSubtopic && (
                    <span className="text-xs font-normal text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border">
                      {tq("topicL")} {selectedLanguage ? `${selectedLanguage} > ` : ""}{selectedSubtopic}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {subjects.map((s) => {
                    const isSel = topic === s.name;
                    return (
                      <button
                        key={s.name}
                        onClick={() => selectSubject(s.name)}
                        className={`rounded-2xl border p-5 text-left transition shadow-soft hover:shadow-card hover:-translate-y-0.5 relative overflow-hidden group ${isSel ? "border-primary bg-gradient-to-br from-primary/10 to-transparent ring-glow" : "bg-card hover:bg-secondary border-border"}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <s.icon className={`h-5 w-5 ${s.color} mb-3 group-hover:scale-110 transition-transform`} />
                        <div className="font-medium font-display text-sm">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{tq("customizeBtn")}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selection Modal */}
              <AnimatePresence>
                {showLanguageModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-card"
                    >
                      <h3 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-amber-500" /> {tq("chooseCodingLang")}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">{tq("selectSyntax")}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {languages.map((l) => (
                          <button
                            key={l}
                            onClick={() => {
                              setSelectedLanguage(l);
                              setShowLanguageModal(false);
                              setShowSubtopicModal(true);
                            }}
                            className="p-3 text-center rounded-xl border bg-secondary/30 hover:bg-secondary font-mono text-xs transition font-semibold"
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowLanguageModal(false)}
                        className="w-full py-2 border rounded-xl hover:bg-secondary text-xs font-semibold"
                      >
                        {tq("cancel")}
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Subtopic Selection Modal */}
              <AnimatePresence>
                {showSubtopicModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-card"
                    >
                      <h3 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> {tq("selectSubtopic")} {topic}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">{tq("lockInSpecific")}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {(subtopicsMap[topic] || []).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setSelectedSubtopic(st);
                              setShowSubtopicModal(false);
                            }}
                            className="p-3 text-left rounded-xl border bg-secondary/30 hover:bg-secondary text-xs transition"
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedSubtopic("All Topics");
                            setShowSubtopicModal(false);
                          }}
                          className="flex-1 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
                        >
                          {tq("allTopics")}
                        </button>
                        <button 
                          onClick={() => setShowSubtopicModal(false)}
                          className="flex-1 py-2 border rounded-xl hover:bg-secondary text-xs font-semibold"
                        >
                          {tq("cancel")}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <div>
                <div className="text-sm font-medium mb-3">{tq("difficultyL")}</div>
                <div className="flex gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiff(d)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${diff === d ? "bg-foreground text-background" : "bg-card hover:bg-secondary border-border"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!topic || generating}
                onClick={generate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero text-primary-foreground px-5 py-3.5 text-sm font-medium shadow-glow disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {tq("generatingQuiz")}
                  </>
                ) : (
                  <>
                    {tq("genQuiz")} <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {started && !finished && current && (
          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative">
            {/* Combo Streak animation */}
            <AnimatePresence>
              {showCombo && (
                <motion.div 
                  initial={{ scale: 0.6, y: -20, opacity: 0 }}
                  animate={{ scale: 1.2, y: -50, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-sm font-bold px-4 py-2 rounded-full shadow-glow flex items-center gap-1.5"
                >
                  <Flame className="h-4 w-4 text-white animate-bounce" /> {streakCount} {tq("comboStreak")}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {tq("questionL")} <span className="text-foreground font-semibold font-mono">{idx + 1}</span> {tq("ofL")} {questions.length}
                {streakCount > 0 && (
                  <span className="text-[11px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5">
                    <Flame className="h-3 w-3" /> {streakCount}x
                  </span>
                )}
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono ${time < 10 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-secondary text-foreground"}`}>
                <Clock className="h-3.5 w-3.5" /> {time}s
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-8">
              <motion.div
                className="h-full bg-gradient-hero"
                animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>

            {/* Custom high-fidelity question card */}
            <div className="rounded-2xl border bg-card p-6 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-mesh opacity-20 pointer-events-none" />
              <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-3 flex items-center gap-1">
                {topic} {selectedLanguage ? `· ${selectedLanguage}` : ""} {selectedSubtopic ? `· ${selectedSubtopic}` : ""} · {diff}
              </div>

              {/* Check if question contains code snippet */}
              {(() => {
                const codeData = parseCodeQuestion(current.question);
                if (codeData.code) {
                  return (
                    <div className="space-y-4">
                      <h2 className="font-display text-xl font-semibold leading-snug">{codeData.text}</h2>
                      
                      {/* Premium IDE style Terminal Card */}
                      <div className="rounded-xl border bg-black/90 shadow-2xl overflow-hidden font-mono text-xs text-slate-300">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-slate-900">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Terminal className="h-3 w-3" /> main.{codeData.lang || "py"}
                          </span>
                        </div>
                        <div className="p-4 overflow-x-auto scrollbar-thin max-h-64 flex leading-normal">
                          <div className="text-slate-500 pr-4 select-none text-right border-r border-white/5 font-mono">
                            {codeData.code.split("\n").map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          <pre className="pl-4 text-emerald-400 font-mono">
                            <code>{codeData.code}</code>
                          </pre>
                        </div>
                      </div>

                      {codeData.suffix && (
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">{codeData.suffix}</p>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <h2 className="font-display text-xl font-semibold leading-snug">{current.question}</h2>
                  );
                }
              })()}

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
                        "hover:bg-secondary border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-lg border flex items-center justify-center text-xs font-semibold ${showResult && isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : showResult && isSelected ? "border-destructive bg-destructive text-white" : "bg-surface border-border text-muted-foreground"}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm font-medium">{opt}</span>
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
                    <div className="mt-5 rounded-xl bg-secondary p-4 text-xs leading-relaxed border flex items-start gap-2">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">{tq("explanationL")} </span>{current.explanation}
                      </div>
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
            className="text-center relative"
          >
            <DoodleStar className="absolute top-0 right-10 text-amber-500 animate-bounce" size={48} opacity={0.3} />
            <DoodleAtom className="absolute bottom-10 left-10 text-primary" size={60} opacity={0.2} />
            <DoodleRocket className="absolute -top-10 left-20 text-violet-500" size={50} opacity={0.25} />
            <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="mt-6 font-display text-4xl font-semibold">{tq("quizComplete")}</h2>
            <p className="mt-2 text-muted-foreground font-display font-medium px-4 max-w-md mx-auto text-sm">
              {score >= 4 
                ? (tq("genZPraises") as unknown as string[])[Math.floor(Math.random() * (tq("genZPraises") as unknown as string[]).length)]
                : (tq("genZFailures") as unknown as string[])[Math.floor(Math.random() * (tq("genZFailures") as unknown as string[]).length)]
              }
            </p>
            <div className="mt-3 font-display text-6xl font-bold text-gradient">{score}/{questions.length}</div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
              {[
                [tq("correctL"), score, "text-emerald-500"],
                [tq("wrongL"), questions.length - score, "text-destructive"],
                [tq("xpGained"), `+${score * 20}${score === 5 ? tq("bonusL") : ""}`, "text-primary"],
              ].map(([l, v, c]: any) => (
                <div key={l} className="rounded-xl border bg-card p-4 border-border">
                  <div className={`font-display text-xl font-bold ${c}`}>{v}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-2">
              <button onClick={retry} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-secondary border-border transition z-10">
                <RotateCcw className="h-4 w-4" /> {tq("retryFr")}
              </button>
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition z-10">
                {tq("newChallenge")}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
