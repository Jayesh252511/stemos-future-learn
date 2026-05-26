import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Atom, Sigma, FlaskConical, Code2, CheckCircle2, Circle, Lock, Sparkles } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";

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
type Path = { name: string; icon: any; color: string; tagline: string; stages: Record<Stage, Node[]>; pct: number };

const paths: Path[] = [
  {
    name: "Mathematics", icon: Sigma, color: "from-violet-500 to-fuchsia-500", tagline: "From arithmetic to abstract algebra",
    pct: 64,
    stages: {
      Beginner: [{ title: "Numbers & operations", done: true }, { title: "Algebra basics", done: true }, { title: "Geometry foundations", done: true }, { title: "Functions & graphs", done: true }],
      Intermediate: [{ title: "Trigonometry", done: true }, { title: "Limits & continuity", done: true }, { title: "Derivatives" }, { title: "Integrals" }],
      Advanced: [{ title: "Multivariable calculus", locked: true }, { title: "Linear algebra", locked: true }, { title: "Differential equations", locked: true }, { title: "Real analysis", locked: true }],
    },
  },
  {
    name: "Physics", icon: Atom, color: "from-cyan-500 to-blue-500", tagline: "From motion to quantum reality",
    pct: 48,
    stages: {
      Beginner: [{ title: "Kinematics", done: true }, { title: "Newton's laws", done: true }, { title: "Energy & work", done: true }],
      Intermediate: [{ title: "Waves & sound", done: true }, { title: "Electricity", done: true }, { title: "Magnetism" }, { title: "Optics" }],
      Advanced: [{ title: "Thermodynamics", locked: true }, { title: "Special relativity", locked: true }, { title: "Quantum mechanics", locked: true }],
    },
  },
  {
    name: "Chemistry", icon: FlaskConical, color: "from-pink-500 to-rose-500", tagline: "From atoms to organic synthesis",
    pct: 32,
    stages: {
      Beginner: [{ title: "Atomic structure", done: true }, { title: "Periodic table", done: true }, { title: "Chemical bonding" }],
      Intermediate: [{ title: "Stoichiometry" }, { title: "Acids & bases", locked: true }, { title: "Thermochemistry", locked: true }],
      Advanced: [{ title: "Organic reactions", locked: true }, { title: "Electrochemistry", locked: true }, { title: "Spectroscopy", locked: true }],
    },
  },
  {
    name: "Programming", icon: Code2, color: "from-emerald-500 to-teal-500", tagline: "From first script to system design",
    pct: 78,
    stages: {
      Beginner: [{ title: "Variables & types", done: true }, { title: "Control flow", done: true }, { title: "Functions", done: true }, { title: "Data structures", done: true }],
      Intermediate: [{ title: "OOP", done: true }, { title: "Algorithms", done: true }, { title: "Recursion", done: true }, { title: "APIs & HTTP" }],
      Advanced: [{ title: "System design", locked: true }, { title: "Concurrency", locked: true }, { title: "Compilers", locked: true }],
    },
  },
];

function PathsPage() {
  const [active, setActive] = useState(paths[0]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-xs font-medium text-primary uppercase tracking-widest">Learning Paths</div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Roadmaps to mastery</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Hand-crafted progressions from first principles to advanced topics. Each step builds on the last.</p>

        <div className="mt-10 grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Path selector */}
          <div className="space-y-3 lg:sticky lg:top-24 self-start">
            {paths.map((p) => {
              const isActive = active.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setActive(p)}
                  className={`w-full text-left rounded-2xl border p-5 transition shadow-soft ${isActive ? "ring-glow border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" : "bg-card hover:bg-secondary"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${p.color}`} style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{p.pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Roadmap */}
          <div className="space-y-8">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${active.color} flex items-center justify-center shadow-glow`}>
                  <active.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-semibold">{active.name}</h2>
                  <p className="text-sm text-muted-foreground">{active.tagline}</p>
                </div>
                <button className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-2 text-sm font-medium hover:opacity-90 transition">
                  <Sparkles className="h-3.5 w-3.5" /> Continue
                </button>
              </div>
            </div>

            {(["Beginner", "Intermediate", "Advanced"] as Stage[]).map((stage, sIdx) => (
              <motion.section
                key={stage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.05 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center text-white text-xs font-semibold`}>
                    {sIdx + 1}
                  </div>
                  <h3 className="font-display text-xl font-semibold">{stage}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3 ml-3 border-l-2 border-dashed border-border pl-6 relative">
                  {active.stages[stage].map((n, i) => (
                    <div
                      key={i}
                      className={`relative rounded-xl border p-4 transition ${n.locked ? "opacity-60 bg-secondary/40" : "bg-card hover:shadow-card hover:-translate-y-0.5"}`}
                    >
                      <div className="absolute -left-[34px] top-5 h-3 w-3 rounded-full bg-background border-2 border-border" />
                      <div className="flex items-start gap-2.5">
                        {n.done ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" /> :
                          n.locked ? <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /> :
                          <Circle className="h-4 w-4 mt-0.5 text-primary shrink-0" />}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{n.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {n.done ? "Completed" : n.locked ? "Locked" : "In progress"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
