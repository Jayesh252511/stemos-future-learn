import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Flame, Trophy, BookOpen, Target, TrendingUp, Award, Zap, Clock,
  Atom, Sigma, FlaskConical, Code2, CheckCircle2, Loader2, Sparkles, ArrowRight,
  Brain, MessageSquarePlus, Play, Lightbulb, BarChart2
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { useDashboardLanguage } from "@/lib/i18n-dashboard";
import { DoodleAtom, DoodleRocket, DoodleStar } from "@/components/site/Doodles";

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

const dailyTips = [
  { tip: "Study in 25-min sprints (Pomodoro method). It boosts retention by up to 40%.", icon: "⏱️" },
  { tip: "Teach what you've learned to someone else — the #1 way to identify gaps.", icon: "🎓" },
  { tip: "Sleep consolidates memory. Reviewing notes before bed enhances recall.", icon: "😴" },
  { tip: "Start with your weakest subject first — your willpower is highest early.", icon: "💪" },
  { tip: "Active recall beats passive reading. Quiz yourself after every topic.", icon: "🧠" },
  { tip: "Spaced repetition: review notes at day 1, 3, 7, 21. Science-backed.", icon: "📅" },
  { tip: "Mistakes are data. Review wrong answers — they reveal your blind spots.", icon: "🎯" },
];

const getDailyTip = (td: any) => {
  const day = new Date().getDate();
  const index = day % 7 + 1;
  return { tip: td(`tip${index}` as any), icon: ["⏱️", "🎓", "😴", "💪", "🧠", "📅", "🎯"][index - 1] };
}

function getGreeting(name: string, td: any) {
  const h = new Date().getHours();
  if (h < 12) return `${td("greetMorn")}, ${name} 🌅`;
  if (h < 17) return `${td("greetAft")}, ${name} ⚡`;
  if (h < 21) return `${td("greetEve")}, ${name} 🌙`;
  return `${td("greetLate")}, ${name} 🔥`;
}

function getWeaknessInsight(attempts: Attempt[], accuracy: number, td: any): string {
  if (attempts.length === 0) return td("wInit");
  const subjectAccuracy: Record<string, { c: number; t: number }> = {};
  attempts.forEach(a => {
    if (!subjectAccuracy[a.subject]) subjectAccuracy[a.subject] = { c: 0, t: 0 };
    subjectAccuracy[a.subject].c += a.score;
    subjectAccuracy[a.subject].t += a.total_questions;
  });
  const weakest = Object.entries(subjectAccuracy)
    .map(([s, d]) => ({ s, pct: d.t > 0 ? Math.round((d.c / d.t) * 100) : 100 }))
    .sort((a, b) => a.pct - b.pct)[0];
  if (!weakest || weakest.pct >= 80) return td("wNoCrit");
  return `${weakest.s} ${td("wBelow")}`;
}

function getStrengthInsight(attempts: Attempt[], td: any): string {
  if (attempts.length === 0) return td("sInit");
  const best = attempts.find(a => a.score === a.total_questions);
  if (best) return `Perfect score on ${best.subject}! ${td("sElite")}`;
  const totalXp = attempts.reduce((s, a) => s + (a.xp_earned || 0), 0);
  if (totalXp > 200) return `${td("sHigh")} ${totalXp} XP — accuracy improving every session.`;
  return td("sMom");
}

function getNextRecommendation(attempts: Attempt[], td: any): string {
  if (attempts.length === 0) return td("rFirst");
  const subjects = [...new Set(attempts.map(a => a.subject))];
  const allSubjects = ["Physics", "Mathematics", "Chemistry", "Programming"];
  const untried = allSubjects.find(s => !subjects.some(a => a.toLowerCase().includes(s.toLowerCase())));
  if (untried) return `${td("rExp")} ${untried}`;
  const latest = attempts[0];
  if (latest.score < latest.total_questions * 0.7) return `${td("rRetry")} ${latest.subject}`;
  return td("rHard");
}

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { td } = useDashboardLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const dailyTip = getDailyTip(td);

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
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> {td("loading")}
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
  const nextRec = getNextRecommendation(attempts, td);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 py-10 relative">
        <DoodleStar className="absolute top-12 right-20 text-amber-500" size={48} opacity={0.15} />
        <DoodleAtom className="absolute bottom-40 left-10 text-primary" size={60} opacity={0.1} />
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">{td("welcomeBack")}</div>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-semibold tracking-tight">{getGreeting(name, td)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalAttempts === 0 ? td("firstQuizTracker") : `${td("quizCompleted")} ${totalAttempts} ${td(totalAttempts === 1 ? "quizCompleted" : "quizzesCompleted")}. ${td("keepGoing")}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2.5">
              <Flame className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-xs text-muted-foreground">{td("currentStreak")}</div>
                <div className="font-display font-semibold">{streak} {td(streak === 1 ? "day" : "days")}</div>
              </div>
            </div>
            <button onClick={signOut} className="rounded-xl border px-3 py-2.5 text-xs font-medium hover:bg-secondary transition">
              {td("signOut")}
            </button>
          </div>
        </div>

        {/* Daily Tip Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 p-4 flex items-start gap-3"
        >
          <div className="text-2xl leading-none mt-0.5">{dailyTip.icon}</div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">{td("dailyStudyTip")}</div>
            <p className="text-sm text-foreground leading-relaxed">{dailyTip.tip}</p>
          </div>
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        </motion.div>

        {/* Stat Cards */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Trophy} title={td("statTotalXP")} value={profile?.total_xp ?? 0} suffix="" color="from-violet-500 to-fuchsia-500" />
          <Stat icon={BookOpen} title={td("statQuizzes")} value={totalAttempts} color="from-cyan-500 to-blue-500" />
          <Stat icon={Target} title={td("statAccuracy")} value={accuracy} suffix="%" color="from-emerald-500 to-teal-500" />
          <Stat icon={Award} title={td("statLevel")} value={level} trend={`${levelPct}% ${td("toLevel")}${level + 1}`} color="from-amber-500 to-orange-500" />
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-3 rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="text-xs text-muted-foreground whitespace-nowrap">L{level}</div>
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">L{level + 1}</div>
          <div className="text-xs font-mono text-muted-foreground">{xpInLevel}/500 XP</div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Link to="/tutor" className="group rounded-xl border bg-card hover:bg-secondary p-4 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-glow">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{td("aiTutor")}</div>
              <div className="text-xs text-muted-foreground">{td("askAny")}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/quiz" className="group rounded-xl border bg-card hover:bg-secondary p-4 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-glow">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{nextRec}</div>
              <div className="text-xs text-muted-foreground">{td("aiQuiz")}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/paths" className="group rounded-xl border bg-card hover:bg-secondary p-4 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-glow">
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{td("learningPaths")}</div>
              <div className="text-xs text-muted-foreground">{td("contRoadmap")}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">{td("weeklyAct")}</h3>
                <p className="text-xs text-muted-foreground">{td("quizzesPerDay")}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> {days.reduce((s, d) => s + d.n, 0)} {td("thisWeek")}
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
            <h3 className="font-semibold">{td("subjMastery")}</h3>
            <p className="text-xs text-muted-foreground">{td("basedOnAcc")}</p>
            <div className="mt-5 space-y-4">
              {subjects.length === 0 && (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  {td("noData")}
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
          {/* Left Column: Recent Activity & AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h3 className="font-semibold text-base font-display">{td("recentAct")}</h3>
              <div className="mt-5 space-y-2">
                {attempts.length === 0 && (
                  <div className="text-xs text-muted-foreground py-8 text-center">
                    {td("noActYet")}
                  </div>
                )}
                {attempts.slice(0, 5).map((a) => {
                  const meta = subjectMeta[a.subject] ?? { icon: CheckCircle2, color: "" };
                  const pct = Math.round((a.score / a.total_questions) * 100);
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-secondary transition border border-transparent hover:border-border">
                      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                        <meta.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {td("quizL")} {a.subject} ({a.score}/{a.total_questions})
                        </div>
                        <div className="text-xs text-muted-foreground">+{a.xp_earned} XP · {pct}% {td("accuracyL")}</div>
                      </div>
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="h-3 w-3" /> {relTime(a.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Study Insights */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-mesh opacity-10 pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base font-display">{td("aiInsights")}</h3>
                  <p className="text-xs text-muted-foreground">{td("weakDetect")}</p>
                </div>
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50 border space-y-2">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider">🎯 {td("weakRadar")}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getWeaknessInsight(attempts, accuracy, td)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border space-y-2">
                  <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">💪 {td("strSignal")}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getStrengthInsight(attempts, td)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-2">
                  <span>{td("recNext")} <span className="text-foreground font-bold">{nextRec}</span></span>
                  <Link to="/quiz" className="text-primary hover:underline font-semibold flex items-center gap-1">{td("startL")} <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Achievements & Streak Leaderboard */}
          <div className="space-y-6">
            {/* Gamified Badges */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h3 className="font-semibold text-base font-display">{td("badgesShow")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{td("levelUp")}</p>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Quiz Grinder", unlocked: totalAttempts >= 3, icon: Trophy, desc: td("badge1D") },
                  { label: "Coding Warrior", unlocked: attempts.some((a) => [" Python", "JavaScript", "Go", "Rust", "TypeScript", "Java", "C++", "C", "SQL", "Programming", "Coding"].some(l => a.subject.toLowerCase().includes(l.toLowerCase()))), icon: Code2, desc: td("badge2D") },
                  { label: "Physics Pro", unlocked: attempts.some((a) => a.subject.toLowerCase().includes("physics")), icon: Atom, desc: td("badge3D") },
                  { label: "Math Master", unlocked: attempts.some((a) => a.subject.toLowerCase().includes("math")), icon: Sigma, desc: td("badge4D") },
                  { label: "Consistency King", unlocked: streak >= 3, icon: Flame, desc: td("badge5D") },
                  { label: "Locked In Learner", unlocked: totalAttempts >= 1, icon: Target, desc: td("badge6D") },
                ].map((b) => (
                  <div
                    key={b.label}
                    title={b.desc}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-center p-2 transition cursor-pointer hover:scale-[1.03] ${
                      b.unlocked 
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 ring-glow relative overflow-hidden" 
                        : "bg-secondary/40 border-border opacity-40"
                    }`}
                  >
                    {b.unlocked && <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />}
                    <b.icon className={`h-5 w-5 ${b.unlocked ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    <div className="mt-1.5 text-[10px] font-bold leading-tight relative z-10">{t(b.label === "Quiz Grinder" ? "badgeQuizGrinder" : b.label === "Coding Warrior" ? "badgeCodingWarrior" : b.label === "Math Master" ? "badgeMathMaster" : b.label === "Physics Pro" ? "badgePhysicsPro" : b.label === "Consistency King" ? "badgeConsistencyKing" : "badgeLockedInLearner")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gen-Z Streak Leaderboard Preview */}
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-base font-display">{td("topLearners")}</h3>
                  <p className="text-xs text-muted-foreground">{td("streakLeader")}</p>
                </div>
                <Flame className="h-4 w-4 text-amber-500 animate-bounce" />
              </div>

              <div className="space-y-3">
                {[
                  { rank: 1, name: "Lovelace 💻", streak: "15 days", xp: "4,820", tag: "Locked In", style: "bg-gradient-to-r from-amber-500 to-yellow-500" },
                  { rank: 2, name: "Alex fr 🔥", streak: "12 days", xp: "3,940", tag: "Farming XP", style: "bg-slate-400" },
                  { rank: 3, name: `${name} (You)`, streak: `${streak} days`, xp: `${(profile?.total_xp ?? 0).toLocaleString()}`, tag: "Cookin'", style: "bg-amber-600" },
                  { rank: 4, name: "Priya Sharma ✨", streak: "4 days", xp: "1,280", tag: "Streak Saver", style: "bg-secondary" },
                ].map((u) => {
                  const isUser = u.name.includes("(You)");
                  return (
                    <div 
                      key={u.name} 
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                        isUser 
                          ? "bg-gradient-to-r from-primary/10 to-transparent border-primary/30 ring-glow" 
                          : "bg-secondary/20 border-transparent hover:bg-secondary/40"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-md text-white text-xs font-bold flex items-center justify-center ${u.rank === 1 ? "bg-amber-500 shadow-glow" : "bg-secondary text-muted-foreground border border-border"}`}>
                        {u.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          {u.name}
                          {isUser && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">{td("youL")}</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{u.streak}</span>
                          <span>·</span>
                          <span>{u.xp} XP</span>
                        </div>
                      </div>
                      <div className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border font-mono">
                        {u.tag}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start New Chat CTA */}
            <Link to="/tutor" className="group w-full rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4 flex items-center gap-3 hover:ring-glow transition">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{td("askAiTutor")}</div>
                <div className="text-xs text-muted-foreground">{td("anyConcept")}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border bg-card p-5 shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-semibold">{title}</div>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-glow`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tracking-tight">
        {typeof value === "number" ? <CountUp to={value} suffix={suffix ?? ""} /> : value}
      </div>
      {trend && <div className="mt-1 text-xs text-muted-foreground font-mono">{trend}</div>}
    </motion.div>
  );
}
