import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, BrainCircuit, Atom, FlaskConical, Code2, Sigma,
  Zap, Trophy, BarChart3, Check, Star, GraduationCap, BookOpen, Target
} from "lucide-react";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STEMOS — The Future of STEM Learning" },
      { name: "description", content: "AI-powered personalized learning platform for Physics, Math, Chemistry, and Programming. Built for the next generation of curious minds." },
      { property: "og:title", content: "STEMOS — The Future of STEM Learning" },
      { property: "og:description", content: "AI-powered personalized learning for Physics, Math, Chemistry, and Programming." },
    ],
  }),
  component: Index,
});

const subjects = [
  { icon: Sigma, name: "Mathematics", color: "from-indigo-500 to-violet-500" },
  { icon: Atom, name: "Physics", color: "from-cyan-500 to-blue-500" },
  { icon: FlaskConical, name: "Chemistry", color: "from-fuchsia-500 to-purple-500" },
  { icon: Code2, name: "Programming", color: "from-emerald-500 to-teal-500" },
];

function Index() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-surface/60 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground shadow-soft">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Introducing STEMOS 2.0 — Now with AI Tutor
              <ArrowRight className="h-3 w-3" />
            </div>

            <h1 className="mt-8 font-display text-5xl md:text-7xl font-semibold tracking-tight max-w-4xl leading-[1.05]">
              The Future of <span className="text-gradient">STEM Learning</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              An AI-powered learning operating system that adapts to how you think. Master Math, Physics,
              Chemistry, and Programming with personalized tutoring, smart quizzes, and roadmaps built for mastery.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-medium shadow-soft hover:opacity-90 transition">
                Start Learning
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/tutor" className="inline-flex items-center gap-2 rounded-xl border bg-surface px-5 py-3 text-sm font-medium hover:bg-secondary transition shadow-soft">
                <Sparkles className="h-4 w-4 text-primary" />
                Try AI Tutor
              </Link>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">No credit card required · Free for students</p>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mt-20 mx-auto max-w-5xl"
          >
            <div className="absolute -inset-x-8 -inset-y-6 bg-gradient-hero opacity-20 blur-3xl rounded-[3rem]" />
            <div className="relative rounded-2xl border bg-surface shadow-card overflow-hidden">
              <div className="flex items-center gap-2 border-b px-4 py-2.5 bg-surface-elevated">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="ml-3 text-[11px] text-muted-foreground">stemos.app/dashboard</div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 p-5">
                <DashCard title="Learning streak" value="42" suffix="days" icon={Zap} accent="from-amber-400 to-orange-500" />
                <DashCard title="XP earned" value="12,840" icon={Trophy} accent="from-violet-400 to-fuchsia-500" />
                <DashCard title="Lessons" value="187" suffix="completed" icon={BookOpen} accent="from-cyan-400 to-blue-500" />
                <div className="md:col-span-2 rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium">Weekly progress</div>
                      <div className="text-xs text-muted-foreground">Hours studied across subjects</div>
                    </div>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[55, 78, 42, 90, 65, 88, 72].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-md bg-gradient-to-t from-primary/30 to-primary/80" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-5">
                  <div className="text-sm font-medium mb-3">Up next</div>
                  <div className="space-y-2.5">
                    {[
                      { t: "Quantum mechanics", s: "Physics · 18 min" },
                      { t: "Linear algebra", s: "Math · 24 min" },
                      { t: "Organic reactions", s: "Chemistry · 12 min" },
                    ].map((x) => (
                      <div key={x.t} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{x.t}</div>
                          <div className="text-[10px] text-muted-foreground">{x.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 top-1/3 hidden md:flex items-center gap-2 glass-strong rounded-xl px-3 py-2 shadow-card"
            >
              <Atom className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-medium">F = ma</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 top-1/2 hidden md:flex items-center gap-2 glass-strong rounded-xl px-3 py-2 shadow-card"
            >
              <Sigma className="h-4 w-4 text-violet-500" />
              <span className="text-xs font-mono">∫ e^x dx</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* LOGOS / SUBJECTS STRIP */}
      <section className="border-y bg-surface-elevated">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by curious learners from 120+ universities</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <s.icon className="h-4 w-4" />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["120K+", "Active students"],
            ["3.2M", "Questions solved"],
            ["98%", "Pass rate"],
            ["45 min", "Avg. daily session"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border bg-card p-6">
              <div className="font-display text-3xl md:text-4xl font-semibold text-gradient">{v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-xs font-medium text-primary uppercase tracking-widest">Features</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Everything you need to master STEM</h2>
          <p className="mt-4 text-muted-foreground">From first principles to advanced topics — STEMOS adapts to your pace, finds your gaps, and builds the path forward.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: BrainCircuit, title: "AI Tutor", desc: "Ask anything. Get step-by-step explanations grounded in first principles, not just answers." },
            { icon: Target, title: "Smart Quizzes", desc: "Adaptive MCQs that target your weak spots and reinforce mastery via spaced repetition." },
            { icon: Trophy, title: "XP & Streaks", desc: "Earn XP, build streaks, unlock badges. Gamified for motivation that actually lasts." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Per-topic mastery, time-on-task, and predictive insights into where you'll struggle next." },
            { icon: Sparkles, title: "Personalized Paths", desc: "Roadmaps from beginner to expert, custom-tuned to your goals — exams, research, or curiosity." },
            { icon: GraduationCap, title: "Exam Prep", desc: "SAT, AP, IB, JEE, A-Levels. Curated content and realistic timed practice." },
          ].map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group rounded-2xl border bg-card p-6 shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-medium text-primary uppercase tracking-widest">Loved by students</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">A new way to learn</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {[
            { name: "Ananya Rao", role: "JEE Aspirant", q: "The AI tutor explains physics in a way my school never did. I jumped 40 percentile in 3 months." },
            { name: "Marcus Chen", role: "CS Undergrad", q: "STEMOS is what Khan Academy would look like if it was rebuilt today. Incredibly polished." },
            { name: "Priya Sharma", role: "High School Senior", q: "I'm addicted to my learning streak. Studying finally feels like a game I want to play." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.q}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  {t.name.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-medium text-primary uppercase tracking-widest">Pricing</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Simple, student-friendly pricing</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { name: "Free", price: "$0", desc: "For curious learners getting started.", features: ["Unlimited AI tutor (50 msgs/day)", "Basic quizzes", "1 learning path", "Community access"], cta: "Start free", featured: false },
            { name: "Pro", price: "$12", per: "/mo", desc: "For serious students.", features: ["Unlimited AI tutor", "Adaptive quiz engine", "All learning paths", "Advanced analytics", "Exam prep modules"], cta: "Go Pro", featured: true },
            { name: "Campus", price: "Custom", desc: "For schools and universities.", features: ["Everything in Pro", "Teacher dashboard", "Class analytics", "SSO & LMS integration", "Dedicated support"], cta: "Contact sales", featured: false },
          ].map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-7 ${p.featured ? "bg-gradient-to-b from-primary/5 to-transparent border-primary/30 ring-glow" : "bg-card"}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground text-background text-[10px] font-medium px-2.5 py-1 uppercase tracking-widest">Most popular</div>
              )}
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-3 font-display text-4xl font-semibold">
                {p.price}<span className="text-base font-normal text-muted-foreground">{p.per ?? ""}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{p.desc}</div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-7 w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${p.featured ? "bg-foreground text-background hover:opacity-90" : "border hover:bg-secondary"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-hero p-12 md:p-16 text-center">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-primary-foreground">Ready to think differently?</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">Join 120,000+ students transforming how they learn STEM with AI.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/tutor" className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition">
                Try AI Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function DashCard({ title, value, suffix, icon: Icon, accent }: { title: string; value: string; suffix?: string; icon: any; accent: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <div className="font-display text-2xl font-semibold">{value}</div>
        {suffix && <div className="text-xs text-muted-foreground">{suffix}</div>}
      </div>
    </div>
  );
}
