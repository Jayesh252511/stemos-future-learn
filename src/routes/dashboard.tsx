import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Flame, Trophy, BookOpen, Target, TrendingUp, Award, Zap, Clock,
  Atom, Sigma, FlaskConical, Code2, CheckCircle2
} from "lucide-react";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — STEMOS" },
      { name: "description", content: "Track your STEM learning progress, streaks, XP, and subject mastery analytics." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Welcome back</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">Hi, Ananya 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">You're on a 42-day streak. Keep the momentum going.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2.5">
            <Flame className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-xs text-muted-foreground">Current streak</div>
              <div className="font-display font-semibold">42 days</div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Trophy} title="Total XP" value="12,840" trend="+320 this week" color="from-violet-500 to-fuchsia-500" />
          <Stat icon={BookOpen} title="Lessons" value="187" trend="12 this week" color="from-cyan-500 to-blue-500" />
          <Stat icon={Target} title="Accuracy" value="92%" trend="+4% vs last week" color="from-emerald-500 to-teal-500" />
          <Stat icon={Award} title="Level" value="24" trend="76% to L25" color="from-amber-500 to-orange-500" />
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Weekly graph */}
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Weekly learning</h3>
                <p className="text-xs text-muted-foreground">Hours studied per day</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> +18% vs last week
              </div>
            </div>
            <div className="flex items-end gap-3 h-56">
              {[
                { d: "Mon", h: 60, hrs: "1.8h" },
                { d: "Tue", h: 85, hrs: "2.5h" },
                { d: "Wed", h: 45, hrs: "1.3h" },
                { d: "Thu", h: 95, hrs: "2.8h" },
                { d: "Fri", h: 70, hrs: "2.1h" },
                { d: "Sat", h: 100, hrs: "3.0h" },
                { d: "Sun", h: 80, hrs: "2.4h" },
              ].map((b, i) => (
                <div key={b.d} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition">{b.hrs}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${b.h}%` }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 80 }}
                    className="w-full rounded-lg bg-gradient-to-t from-primary/20 to-primary/90 hover:from-primary/30 hover:to-primary transition"
                  />
                  <span className="text-xs text-muted-foreground">{b.d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Subject mastery</h3>
            <p className="text-xs text-muted-foreground">Progress across your tracks</p>
            <div className="mt-5 space-y-4">
              {[
                { name: "Physics", icon: Atom, pct: 78, color: "from-cyan-500 to-blue-500" },
                { name: "Mathematics", icon: Sigma, pct: 92, color: "from-violet-500 to-fuchsia-500" },
                { name: "Chemistry", icon: FlaskConical, pct: 64, color: "from-pink-500 to-rose-500" },
                { name: "Programming", icon: Code2, pct: 86, color: "from-emerald-500 to-teal-500" },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity + Achievements */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Recent activity</h3>
            <div className="mt-5 space-y-2">
              {[
                { t: "Completed: Quantum mechanics intro", s: "Physics · +120 XP", time: "2h ago", icon: CheckCircle2, c: "text-emerald-500" },
                { t: "Quiz: Derivatives (8/10)", s: "Math · +85 XP", time: "5h ago", icon: Target, c: "text-violet-500" },
                { t: "AI Tutor session: Organic chemistry", s: "Chemistry · 22 min", time: "Yesterday", icon: Zap, c: "text-amber-500" },
                { t: "Unlocked badge: Code Sprint", s: "Programming achievement", time: "Yesterday", icon: Award, c: "text-fuchsia-500" },
                { t: "Completed: Binary search trees", s: "Programming · +95 XP", time: "2d ago", icon: CheckCircle2, c: "text-emerald-500" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary transition">
                  <div className={`h-9 w-9 rounded-lg bg-secondary flex items-center justify-center ${a.c}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.s}</div>
                  </div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" /> {a.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-xs text-muted-foreground">8 of 24 unlocked</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "First Quiz", unlocked: true, icon: Target },
                { label: "7-Day Streak", unlocked: true, icon: Flame },
                { label: "Math Whiz", unlocked: true, icon: Sigma },
                { label: "Code Sprint", unlocked: true, icon: Code2 },
                { label: "100 XP", unlocked: true, icon: Trophy },
                { label: "Speed Run", unlocked: false, icon: Zap },
                { label: "Atomic", unlocked: false, icon: Atom },
                { label: "Lab Rat", unlocked: false, icon: FlaskConical },
                { label: "Scholar", unlocked: false, icon: Award },
              ].map((b) => (
                <div
                  key={b.label}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-center p-2 ${
                    b.unlocked ? "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30" : "bg-secondary/50 opacity-50"
                  }`}
                >
                  <b.icon className={`h-5 w-5 ${b.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="mt-1.5 text-[10px] font-medium leading-tight">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ icon: Icon, title, value, trend, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{trend}</div>
    </motion.div>
  );
}
