import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Trophy, RotateCcw, Sparkles, ChevronRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Generator — STEMOS" },
      { name: "description", content: "Generate AI-powered adaptive quizzes on any STEM topic. Test your knowledge with instant feedback." },
    ],
  }),
  component: QuizPage,
});

type Q = { q: string; opts: string[]; answer: number; explain: string };

const banks: Record<string, Q[]> = {
  Physics: [
    { q: "Which law states that for every action there is an equal and opposite reaction?", opts: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"], answer: 2, explain: "Newton's 3rd Law describes action-reaction pairs." },
    { q: "The SI unit of electric current is:", opts: ["Volt", "Ampere", "Ohm", "Watt"], answer: 1, explain: "Current is measured in Amperes (A)." },
    { q: "Speed of light in vacuum is approximately:", opts: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁵ m/s"], answer: 1, explain: "c ≈ 299,792,458 m/s ≈ 3 × 10⁸ m/s." },
    { q: "What does E = mc² describe?", opts: ["Wave-particle duality", "Mass-energy equivalence", "Uncertainty principle", "Conservation of momentum"], answer: 1, explain: "Einstein's famous mass-energy equivalence." },
    { q: "Which particle has no electric charge?", opts: ["Proton", "Electron", "Neutron", "Positron"], answer: 2, explain: "Neutrons are electrically neutral." },
  ],
  Math: [
    { q: "What is the derivative of sin(x)?", opts: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"], answer: 0, explain: "d/dx sin(x) = cos(x)." },
    { q: "Value of π to 4 decimal places:", opts: ["3.1414", "3.1415", "3.1416", "3.1417"], answer: 2, explain: "π ≈ 3.14159… rounds to 3.1416." },
    { q: "Solve: 2x + 5 = 13", opts: ["x = 3", "x = 4", "x = 5", "x = 6"], answer: 1, explain: "2x = 8, x = 4." },
    { q: "log₁₀(1000) = ?", opts: ["2", "3", "10", "100"], answer: 1, explain: "10³ = 1000, so log = 3." },
    { q: "Area of a circle with r = 5:", opts: ["10π", "25π", "5π", "50π"], answer: 1, explain: "A = πr² = 25π." },
  ],
  Chemistry: [
    { q: "Atomic number of Carbon:", opts: ["4", "6", "8", "12"], answer: 1, explain: "Carbon has 6 protons." },
    { q: "pH of pure water at 25°C:", opts: ["0", "7", "14", "1"], answer: 1, explain: "Pure water is neutral, pH = 7." },
    { q: "Chemical symbol for Gold:", opts: ["Go", "Gd", "Au", "Ag"], answer: 2, explain: "Au from Latin 'aurum'." },
    { q: "Number of electrons in a neutral oxygen atom:", opts: ["6", "7", "8", "16"], answer: 2, explain: "Oxygen's atomic number is 8." },
    { q: "Which is a noble gas?", opts: ["Nitrogen", "Oxygen", "Argon", "Hydrogen"], answer: 2, explain: "Argon (group 18) is a noble gas." },
  ],
  Coding: [
    { q: "Which data structure uses LIFO?", opts: ["Queue", "Stack", "Tree", "Graph"], answer: 1, explain: "Stack = Last In, First Out." },
    { q: "Time complexity of binary search:", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, explain: "Halving the search space each step → log n." },
    { q: "Which is NOT a JavaScript primitive?", opts: ["string", "number", "object", "boolean"], answer: 2, explain: "Object is a reference type." },
    { q: "HTTP status 404 means:", opts: ["OK", "Not Found", "Server Error", "Redirect"], answer: 1, explain: "404 = resource not found." },
    { q: "Git command to create a new branch:", opts: ["git new", "git fork", "git branch", "git make"], answer: 2, explain: "git branch <name> creates a branch." },
  ],
};

const difficulties = ["Easy", "Medium", "Hard"] as const;

function QuizPage() {
  const [topic, setTopic] = useState<string>("");
  const [diff, setDiff] = useState<(typeof difficulties)[number]>("Medium");
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [finished, setFinished] = useState(false);

  const questions = topic ? banks[topic] : [];
  const current = questions[idx];

  useEffect(() => {
    if (!started || finished || selected !== null) return;
    if (time <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time, started, finished, selected]);

  const start = () => {
    setStarted(true); setIdx(0); setScore(0); setSelected(null); setTime(30); setFinished(false);
  };

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) setFinished(true);
      else { setIdx(idx + 1); setSelected(null); setTime(30); }
    }, 1400);
  };

  const reset = () => { setStarted(false); setTopic(""); setFinished(false); };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {!started && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs font-medium text-primary uppercase tracking-widest">Quiz Generator</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Test your knowledge</h1>
            <p className="mt-3 text-muted-foreground">Pick a subject and difficulty. Get 5 questions, 30 seconds each.</p>

            <div className="mt-10 space-y-8">
              <div>
                <div className="text-sm font-medium mb-3">Choose a subject</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(banks).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`rounded-2xl border p-5 text-left transition shadow-soft ${topic === t ? "border-primary bg-gradient-to-br from-primary/10 to-transparent ring-glow" : "bg-card hover:bg-secondary"}`}
                    >
                      <Sparkles className="h-5 w-5 text-primary mb-3" />
                      <div className="font-medium">{t}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{banks[t].length} questions</div>
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
                disabled={!topic}
                onClick={start}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero text-primary-foreground px-5 py-3.5 text-sm font-medium shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Generate quiz <ChevronRight className="h-4 w-4" />
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
              <h2 className="font-display text-2xl font-semibold leading-snug">{current.q}</h2>

              <div className="mt-6 space-y-2.5">
                {current.opts.map((opt, i) => {
                  const isCorrect = i === current.answer;
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
                      <span className="font-medium">Explanation: </span>{current.explain}
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
              <button onClick={start} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition">
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
