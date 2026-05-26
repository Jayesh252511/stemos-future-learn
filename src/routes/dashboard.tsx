import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Flame, Trophy, BookOpen, Target, TrendingUp, Award, Zap, Clock,
  Atom, Sigma, FlaskConical, Code2, CheckCircle2, Loader2,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — STEMOS" },
      { name: "description", content: "Track your STEM learning progress, streaks, XP, and subject mastery analytics." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/signin" });
    }
  },
  component: Dashboard,
});

type Profile = {
  display_name: string | null;
  total_xp: number;
  current_streak: number;
  last_activity_date: string | null;
};

type Attempt = {
  id: string;
  subject: string;
  score: number;
  total_questions: number;
  xp_earned: number;
  created_at: string;
};

const subjectMeta: Record<string, { icon: any; color: string }> = {
  Physics: { icon: Atom, color: "from-cyan-500 to-blue-500" },
  Mathematics: { icon: Sigma, color: "from-violet-500 to-fuchsia-500" },
  Math: { icon: Sigma, color: "from-violet-500 to-fuchsia-500" },
  Chemistry: { icon: FlaskConical, color: "from-pink-500 to-rose-500" },
  Biology: { icon: FlaskConical, color: "from-emerald-500 to-teal-500" },
  Programming: { icon: Code2, color: "from-emerald-500 to-teal-500" },
  Coding: { icon: Code2, color: "from-emerald-500 to-teal-500" },
};

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [{ data: prof }, { data: atts }] = await Promise.all([
        supabase.from("profiles").select("display_name,total_xp,current_streak,last_activity_date").eq("id", session.user.id).maybeSingle(),
        supabase.from("quiz_attempts").select("id,subject,score,total_questions,xp_earned,created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(prof as Profile);
      setAttempts((atts ?? []) as Attempt[]);
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-6 py-20 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your dashboard…
        </div>
      </Layout>
    );
  }

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce((s, a) => s + a.score, 0);
  const totalAnswered = attempts.reduce((s, a) => s + a.total_questions, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const level = Math.max(1, Math.floor((profile?.total_xp ?? 0) / 500) + 1);
  const xpInLevel = (profile?.total_xp ?? 0) % 500;
  const levelPct = Math.round((xpInLevel / 500) * 100);

  // Subject mastery (derived from attempts)
  const subjectStats = new Map<string, { correct: number; total: number }>();
  attempts.forEach((a) => {
    const s = subjectStats.get(a.subject) ?? { correct: 0, total: 0 };
    s.correct += a.score; s.total += a.total_questions;
    subjectStats.set(a.subject, s);
  });
  const subjects = Array.from(subjectStats.entries()).map(([name, s]) => ({
    name,
    pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    meta: subjectMeta[name] ?? { icon: BookOpen, color: "from-slate-500 to-slate-700" },
  }));

  // Weekly activity (last 7 days)
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const count = attempts.filter((a) => a.created_at.slice(0, 10) === key).length;
    return { d: d.toLocaleDateString("en", { weekday: "short" }).slice(0, 3), h: Math.min(100, 20 + count * 25), n: count };
  });
  const max = Math.max(1, ...days.map((d) => d.h));

  const name = profile?.display_name ?? "there";
  const streak = profile?.current_streak ?? 0;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Welcome back</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">Hi, {name} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalAttempts === 0 ? "Take your first quiz to start tracking progress." : `You've completed ${totalAttempts} quiz${totalAttempts === 1 ? "" : "zes"}. Keep going!`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2.5">
              <Flame className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs text-muted-foreground">Current streak</div>
                <div className="font-display font-semibold">{streak} day{streak === 1 ? "" : "s"}</div>
              </div>
            </div>
            <button onClick={signOut} className="rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-secondary transition">
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Trophy} title="Total XP" value={profile?.total_xp ?? 0} suffix="" color="from-violet-500 to-fuchsia-500" />
          <Stat icon={BookOpen} title="Quizzes" value={totalAttempts} color="from-cyan-500 to-blue-500" />
          <Stat icon={Target} title="Accuracy" value={accuracy} suffix="%" color="from-emerald-500 to-teal-500" />
          <Stat icon={Award} title="Level" value={level} trend={`${levelPct}% to L${level + 1}`} color="from-amber-500 to-orange-500" />
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Weekly activity</h3>
                <p className="text-xs text-muted-foreground">Quizzes taken per day</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> {days.reduce((s, d) => s + d.n, 0)} this week
              </div>
            </div>
            <div className="flex items-end gap-3 h-56">
              {days.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition">{b.n}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(b.h / max) * 100}%` }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 80 }}
                    className="w-full rounded-lg bg-gradient-to-t from-primary/20 to-primary/90 hover:from-primary/30 hover:to-primary transition min-h-[8px]"
                  />
                  <span className="text-xs text-muted-foreground">{b.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Subject mastery</h3>
            <p className="text-xs text-muted-foreground">Based on your quiz accuracy</p>
            <div className="mt-5 space-y-4">
              {subjects.length === 0 && (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  No data yet. Take a quiz to see your mastery.
                </div>
              )}
              {subjects.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <s.meta.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.meta.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Recent activity</h3>
            <div className="mt-5 space-y-2">
              {attempts.length === 0 && (
                <div className="text-xs text-muted-foreground py-8 text-center">
                  No activity yet — try the AI Tutor or take a quiz.
                </div>
              )}
              {attempts.slice(0, 6).map((a) => {
                const meta = subjectMeta[a.subject] ?? { icon: CheckCircle2, color: "" };
                const pct = Math.round((a.score / a.total_questions) * 100);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary transition">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-emerald-500">
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        Quiz: {a.subject} ({a.score}/{a.total_questions})
                      </div>
                      <div className="text-xs text-muted-foreground">+{a.xp_earned} XP · {pct}% accuracy</div>
                    </div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {relTime(a.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-xs text-muted-foreground">Unlock badges as you learn</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "First Quiz", unlocked: totalAttempts >= 1, icon: Target },
                { label: "5 Quizzes", unlocked: totalAttempts >= 5, icon: Trophy },
                { label: "100 XP", unlocked: (profile?.total_xp ?? 0) >= 100, icon: Zap },
                { label: "500 XP", unlocked: (profile?.total_xp ?? 0) >= 500, icon: Award },
                { label: "Perfectionist", unlocked: attempts.some((a) => a.score === a.total_questions), icon: CheckCircle2 },
                { label: "Scholar", unlocked: totalAttempts >= 10, icon: BookOpen },
                { label: "Math Whiz", unlocked: attempts.some((a) => a.subject === "Mathematics" && a.score >= 4), icon: Sigma },
                { label: "Atomic", unlocked: attempts.some((a) => a.subject === "Physics"), icon: Atom },
                { label: "Lab Rat", unlocked: attempts.some((a) => a.subject === "Chemistry"), icon: FlaskConical },
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

function relTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.floor(v).toLocaleString() + suffix);
  useEffect(() => {
    const ctrl = animate(mv, to, { duration: 1.1, ease: "easeOut" });
    return () => ctrl.stop();
  }, [to, mv]);
  return <motion.span>{display}</motion.span>;
}

function Stat({ icon: Icon, title, value, trend, color, suffix }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">
        {typeof value === "number" ? <CountUp to={value} suffix={suffix ?? ""} /> : value}
      </div>
      {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
    </motion.div>
  );
}
