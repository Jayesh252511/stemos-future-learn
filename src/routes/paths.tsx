import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Sigma, FlaskConical, Code2, CheckCircle2, Circle, Lock, Sparkles, ArrowRight, Zap, BookOpen, Trophy, Play, BrainCircuit, Cpu, Telescope, Dna, Wand2, Loader2, X } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePathsLanguage } from "@/lib/i18n-paths";
import { DoodleStar, DoodleRocket, DoodleScribble, DoodleLightbulb } from "@/components/site/Doodles";
import { TutorCloudModal } from "@/components/site/TutorCloudModal";
import { toast } from "sonner";

export const Route = createFileRoute("/paths")({
  head: () => ({
    meta: [
      { title: "Learning Paths — STEMOS" },
      { name: "description", content: "Roadmap-style learning paths from beginner to advanced in Math, Physics, Chemistry, and Programming." },
    ],
  }),
  component: PathsPage,
});

type Stage = "Beginner" | "Intermediate" | "Advanced";
type Node = { title: string; done?: boolean; locked?: boolean };
type PathDef = { name: string; icon: any; color: string; gradient: string; tagline: string; emoji: string; stages: Record<Stage, string[]> };

const defaultPathDefinitions: PathDef[] = [
  {
    name: "Mathematics", icon: Sigma, color: "from-violet-500 to-fuchsia-500", gradient: "violet", tagline: "From arithmetic to abstract algebra", emoji: "∑",
    stages: {
      Beginner: ["Numbers & operations", "Algebra basics", "Geometry foundations", "Functions & graphs"],
      Intermediate: ["Trigonometry", "Limits & continuity", "Derivatives", "Integrals"],
      Advanced: ["Multivariable calculus", "Linear algebra", "Differential equations", "Real analysis"],
    },
  },
  {
    name: "Physics", icon: Atom, color: "from-cyan-500 to-blue-500", gradient: "cyan", tagline: "From motion to quantum reality", emoji: "⚛",
    stages: {
      Beginner: ["Kinematics", "Newton's laws", "Energy & work", "Gravity"],
      Intermediate: ["Waves & sound", "Electricity", "Magnetism", "Optics"],
      Advanced: ["Thermodynamics", "Special relativity", "Quantum mechanics", "Astrophysics"],
    },
  },
  {
    name: "Chemistry", icon: FlaskConical, color: "from-pink-500 to-rose-500", gradient: "pink", tagline: "From atoms to organic synthesis", emoji: "⚗",
    stages: {
      Beginner: ["Atomic structure", "Periodic table", "Chemical bonding", "Gases"],
      Intermediate: ["Stoichiometry", "Acids & bases", "Thermochemistry", "Chemical kinetics"],
      Advanced: ["Organic reactions", "Electrochemistry", "Spectroscopy", "Quantum chemistry"],
    },
  },
  {
    name: "Programming", icon: Code2, color: "from-emerald-500 to-teal-500", gradient: "emerald", tagline: "From first script to system design", emoji: "</>",
    stages: {
      Beginner: ["Variables & types", "Control flow", "Functions", "Data structures"],
      Intermediate: ["OOP Basics", "Algorithms", "Recursion", "APIs & HTTP"],
      Advanced: ["System design", "Concurrency", "Compilers", "Cloud architectures"],
    },
  },
  {
    name: "Artificial Intelligence", icon: BrainCircuit, color: "from-indigo-500 to-purple-500", gradient: "indigo", tagline: "From logic gates to neural networks", emoji: "🧠",
    stages: {
      Beginner: ["Machine Learning Basics", "Data Preprocessing", "Regression & Classification", "Model Evaluation"],
      Intermediate: ["Neural Networks", "Deep Learning", "Computer Vision", "Natural Language Processing"],
      Advanced: ["Generative AI", "Reinforcement Learning", "Transformers", "AI Ethics & Safety"],
    },
  },
  {
    name: "Robotics", icon: Cpu, color: "from-zinc-500 to-slate-500", gradient: "zinc", tagline: "From simple circuits to autonomous systems", emoji: "🤖",
    stages: {
      Beginner: ["Basic Electronics", "Microcontrollers", "Sensors & Actuators", "Kinematics Basics"],
      Intermediate: ["Control Systems", "PID Controllers", "Computer Vision for Robots", "Path Planning"],
      Advanced: ["Robot Operating System (ROS)", "Swarm Robotics", "Autonomous Navigation", "Human-Robot Interaction"],
    },
  },
  {
    name: "Astronomy", icon: Telescope, color: "from-blue-600 to-indigo-600", gradient: "blue", tagline: "From the solar system to the multiverse", emoji: "🔭",
    stages: {
      Beginner: ["The Solar System", "Stellar Evolution", "Galaxies", "Observational Astronomy"],
      Intermediate: ["Orbital Mechanics", "Exoplanets", "Black Holes", "Cosmology"],
      Advanced: ["General Relativity", "Dark Matter & Energy", "Astrobiology", "Quantum Cosmology"],
    },
  },
  {
    name: "Bioengineering", icon: Dna, color: "from-emerald-600 to-lime-500", gradient: "lime", tagline: "From cell biology to synthetic life", emoji: "🧬",
    stages: {
      Beginner: ["Cell Biology", "Genetics Basics", "Biochemistry", "Molecular Biology"],
      Intermediate: ["Bioinformatics", "Genetic Engineering", "Biomaterials", "Biomechanics"],
      Advanced: ["Synthetic Biology", "Tissue Engineering", "CRISPR & Gene Editing", "Neuroengineering"],
    },
  },
];

const stageColors: Record<Stage, { text: string; bg: string; border: string; gradient: string }> = {
  Beginner: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500 to-teal-500" },
  Intermediate: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", gradient: "from-amber-500 to-orange-500" },
  Advanced: { text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", gradient: "from-red-500 to-pink-500" },
};

function PathsPage() {
  const { tp } = usePathsLanguage();
  const [passedNodes, setPassedNodes] = useState<string[]>([]);
  const [activeName, setActiveName] = useState("Mathematics");
  const [user, setUser] = useState<any>(null);
  const [activeNode, setActiveNode] = useState<{ title: string, subject: string } | null>(null);

  const [customPaths, setCustomPaths] = useState<PathDef[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSubject, setCustomSubject] = useState("");
  const [customLevel, setCustomLevel] = useState<Stage>("Beginner");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("stemos_custom_paths");
      if (stored) {
        const parsed = JSON.parse(stored).map((p: any) => ({ ...p, icon: Sparkles }));
        setCustomPaths(parsed);
      }
    } catch {}

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session) return;

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("subject, score")
        .eq("user_id", session.user.id);

      if (attempts) {
        const passed = attempts.filter(a => a.score >= 3).map(a => a.subject);
        setPassedNodes(passed);
      }
    })();
  }, []);

  // Compute dynamic paths based on database attempts
  const pathDefinitions = [...defaultPathDefinitions, ...customPaths];

  const paths = pathDefinitions.map((p) => {
    const allTitles = [...p.stages.Beginner, ...p.stages.Intermediate, ...p.stages.Advanced];
    let completedCount = 0;

    const buildStage = (titles: string[], startIndex: number) => {
      return titles.map((title, idx) => {
        const globalIdx = startIndex + idx;
        const done = passedNodes.includes(title);
        // Node is locked if the previous node exists and is not done
        const locked = globalIdx === 0 ? false : !passedNodes.includes(allTitles[globalIdx - 1]);
        if (done) completedCount++;
        return { title, done, locked };
      });
    };

    const Beginner = buildStage(p.stages.Beginner, 0);
    const Intermediate = buildStage(p.stages.Intermediate, p.stages.Beginner.length);
    const Advanced = buildStage(p.stages.Advanced, p.stages.Beginner.length + p.stages.Intermediate.length);

    const pct = Math.round((completedCount / allTitles.length) * 100);

    return {
      ...p,
      stages: { Beginner, Intermediate, Advanced },
      pct,
      attempts: completedCount, // map attempts to completed nodes for UI
    };
  });

  const active = paths.find((p) => p.name === activeName) ?? paths[0];
  const totalCompleted = paths.reduce((s, p) => s + p.attempts, 0);
  
  const handleGenerateCustomPath = async () => {
    if (!customSubject.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: customSubject, level: customLevel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newPath: PathDef = {
        name: data.roadmap.name,
        tagline: data.roadmap.tagline,
        emoji: data.roadmap.emoji,
        stages: data.roadmap.stages,
        color: "from-yellow-500 to-amber-500",
        gradient: "yellow",
        icon: Sparkles
      };

      const updated = [...customPaths, newPath];
      setCustomPaths(updated);
      localStorage.setItem("stemos_custom_paths", JSON.stringify(updated.map(p => ({ ...p, icon: undefined }))));
      setActiveName(newPath.name);
      setShowCustomModal(false);
      setCustomSubject("");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate path");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get next actionable node
  const getNextActionableNode = (p: typeof paths[0]) => {
    if (p.pct === 100) return null;
    const all = [...p.stages.Beginner, ...p.stages.Intermediate, ...p.stages.Advanced];
    return all.find(n => !n.locked && !n.done);
  };

  const actionableNode = getNextActionableNode(active);

  return (
    <Layout>
      <div className="relative mx-auto max-w-7xl px-6 py-12 overflow-hidden">
        {/* Background Doodles */}
        <DoodleScribble className="hidden md:block absolute top-10 right-10 text-primary" size={180} opacity={0.08} />
        <DoodleRocket className="hidden md:block absolute bottom-40 left-5 text-violet-500" size={120} opacity={0.1} />
        <DoodleStar className="hidden md:block absolute top-1/3 left-[15%] text-amber-500" size={60} opacity={0.12} />
        <DoodleLightbulb className="hidden md:block absolute bottom-1/4 right-[20%] text-yellow-500" size={80} opacity={0.08} />

        {/* Header */}
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> {tp("learningPaths")}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">{tp("roadmapsToMastery")}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground font-sans">
              {tp("roadmapsDesc")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm hover:opacity-90 transition shadow-glow"
            >
              <Wand2 className="h-4 w-4" /> Generate Custom Path ✨
            </button>
            {user && totalCompleted > 0 && (
              <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs text-muted-foreground">{tp("totalQuizzes")}</div>
                  <div className="font-display font-semibold">{totalCompleted} {tp("completedL")}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {paths.map((p) => (
              <button
                key={p.name}
                onClick={() => setActiveName(p.name)}
                className={`rounded-xl border p-3 text-left transition hover:shadow-card hover:-translate-y-0.5 ${activeName === p.name ? "ring-glow border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" : "bg-card"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                    <p.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs font-medium">{p.name}</span>
                </div>
                <div className="h-1 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{p.pct}% {tp("pctComplete")}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Path selector */}
          <div className="space-y-3 lg:sticky lg:top-24 self-start">
            {paths.map((p) => {
              const isActive = active.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setActiveName(p.name)}
                  className={`w-full text-left rounded-2xl border p-5 transition shadow-soft ${isActive ? "ring-glow border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" : "bg-card hover:bg-secondary"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-glow`}>
                      <p.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium font-display">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                    </div>
                    {p.pct === 100 && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{p.pct}%</span>
                  </div>
                  {p.attempts > 0 && (
                    <div className="mt-2 text-[10px] text-muted-foreground">{p.attempts} quiz{p.attempts === 1 ? "" : "zes"} {tp("quizzesCompleted")}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Roadmap */}
          <div className="space-y-8">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${active.color} flex items-center justify-center shadow-glow shrink-0`}>
                  <active.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-semibold">{active.name}</h2>
                  <p className="text-sm text-muted-foreground">{active.tagline}</p>
                  {active.pct > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {active.pct}% {tp("pctMastered")}
                    </div>
                  )}
                </div>
                {actionableNode ? (
                  <button
                    onClick={() => setActiveNode({ title: actionableNode.title, subject: active.name })}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-2 text-sm font-medium hover:opacity-90 transition shadow-glow"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> 
                    {active.attempts === 0 ? tp("startPath") : tp("continueL")}
                  </button>
                ) : (
                  <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2 text-sm font-medium">
                    <Trophy className="h-3.5 w-3.5" /> {tp("masteredL")} 
                  </div>
                )}
              </div>

              {/* Path-specific next action */}
              {actionableNode && (
                <div className="mt-4 rounded-xl p-3 flex items-center gap-3 border bg-primary/5 border-primary/20">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-primary">
                      Next up: {actionableNode.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Master this topic to unlock the next node!
                    </div>
                  </div>
                  <button onClick={() => setActiveNode({ title: actionableNode.title, subject: active.name })} className="text-xs font-semibold flex items-center gap-1 text-primary hover:underline">
                    Learn Now <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {(["Beginner", "Intermediate", "Advanced"] as Stage[]).map((stage, sIdx) => {
                const stageNodes = active.stages[stage];
                const isLocked = stageNodes.every(n => n.locked);
                const isDone = stageNodes.every(n => n.done);
                const colors = stageColors[stage];
                
                return (
                  <motion.section
                    key={stage}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: isLocked ? 0.5 : 1, y: 0 }}
                    transition={{ delay: sIdx * 0.07 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`h-8 px-3 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs font-bold gap-1.5`}>
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {stage}
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      {isDone && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {tp("completeL")}</span>}
                      {isLocked && <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> {tp("lockedL")}</span>}
                      {!isDone && !isLocked && <span className="text-[11px] text-primary font-semibold flex items-center gap-1"><Zap className="h-3 w-3" /> {tp("inProgressL")}</span>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 ml-3 border-l-2 border-dashed border-border pl-6 relative">
                      {stageNodes.map((n, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: sIdx * 0.07 + i * 0.04 }}
                          className={`relative rounded-xl border p-4 transition ${n.locked ? "opacity-50 bg-secondary/40" : n.done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card hover:shadow-card hover:-translate-y-0.5 cursor-pointer"}`}
                        >
                          <div className="absolute -left-[34px] top-5 h-3 w-3 rounded-full bg-background border-2 border-border" />
                          <div className="flex items-start gap-2.5">
                            {n.done ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" /> :
                              n.locked ? <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /> :
                              <Circle className="h-4 w-4 mt-0.5 text-primary shrink-0 animate-pulse" />}
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${n.done ? "line-through opacity-60" : ""}`}>{n.title}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {n.done ? tp("statusCompleted") : n.locked ? tp("statusLocked") : tp("statusAvailable")}
                              </div>
                            </div>
                          </div>
                          {!n.locked && !n.done && (
                            <button
                              onClick={() => setActiveNode({ title: n.title, subject: active.name })}
                              className="mt-3 inline-flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline"
                            >
                              <BookOpen className="h-3 w-3" /> {tp("studyWithAITutor")}
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
        
        <AnimatePresence>
          {showCustomModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-[2rem] border bg-card p-6 shadow-card relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                
                <div className="relative flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-display text-2xl font-semibold flex items-center gap-2">
                      <Wand2 className="h-6 w-6 text-primary" /> Create Path
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">What do you want to learn today?</p>
                  </div>
                  <button onClick={() => setShowCustomModal(false)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Subject or Topic</label>
                    <input 
                      type="text"
                      placeholder="e.g. Quantum Computing, Financial Math..."
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-inner focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Current Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Beginner", "Intermediate", "Advanced"] as Stage[]).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setCustomLevel(lvl)}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition ${customLevel === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary border-border"}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCustomPath}
                    disabled={isGenerating || !customSubject.trim()}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow-glow hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    {isGenerating ? "Generating Path..." : "Build My Roadmap"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <TutorCloudModal
          key={activeNode?.title || "empty"}
          isOpen={!!activeNode}
          onClose={() => setActiveNode(null)}
          nodeTitle={activeNode?.title ?? ""}
          subjectName={activeNode?.subject ?? ""}
          onPassed={(title, score) => {
            setPassedNodes(prev => [...prev, title]);
            setActiveNode(null);
          }}
        />
      </div>
    </Layout>
  );
}


