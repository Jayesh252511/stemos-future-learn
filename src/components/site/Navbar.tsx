import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Sparkles, Menu, X, LogOut, Flame, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [xp, setXp] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  const fetchXp = () => {
    if (!user) { setXp(null); setStreak(null); return; }
    supabase
      .from("profiles")
      .select("total_xp,current_streak")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setXp(data.total_xp ?? 0); setStreak(data.current_streak ?? 0); }
      });
  };

  useEffect(() => {
    fetchXp();
    window.addEventListener('stemos_xp_updated', fetchXp);
    return () => {
      window.removeEventListener('stemos_xp_updated', fetchXp);
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("seeYouTomorrow"));
    navigate({ to: "/" });
  };

  const initial = (user?.user_metadata?.display_name || user?.email || "?").slice(0, 1).toUpperCase();

  const authedLinks = [
    { to: "/tutor", label: t("tutor") },
    { to: "/lab", label: "Lab" },
    { to: "/paths", label: t("paths") },
    { to: "/arena", label: "Arena" },
    { to: "/garden", label: "Garden" },
    { to: "/shop", label: "Shop" },
    { to: "/dashboard", label: t("dashboard") },
  ];
  const publicLinks = [
    { to: "/", label: t("home") },
    { to: "/tutor", label: t("tutor") },
    { to: "/lab", label: "Lab" },
    { to: "/paths", label: t("paths") },
    { to: "/arena", label: "Arena" },
    { to: "/garden", label: "Garden" },
  ];
  const links = user ? authedLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 glass border-b" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">STEMOS</span>
          <span className="ml-1 hidden sm:inline-block text-[10px] uppercase tracking-widest text-muted-foreground px-1.5 py-0.5 rounded border">{t("beta")}</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-secondary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative ${active ? "text-foreground font-medium" : ""}`}>{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <>
              {xp !== null && streak !== null && (
                <div className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Flame className="h-3.5 w-3.5" />{streak} {t("dayStreak")}
                  </span>
                  <div className="h-3.5 w-px bg-border" />
                  <span className="flex items-center gap-1 text-violet-500 font-semibold">
                    <Trophy className="h-3.5 w-3.5" />{xp.toLocaleString()} XP
                  </span>
                </div>
              )}
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition">
                <span className="h-6 w-6 rounded-md bg-gradient-hero text-primary-foreground flex items-center justify-center text-[11px] font-semibold">{initial}</span>
                <span className="max-w-[100px] truncate">{user.user_metadata?.display_name || user.email}</span>
              </Link>
              <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2" aria-label={t("signOut")}>
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                {t("signIn")}
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-soft"
              >
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden relative glass-strong border-b overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm">
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />

              {/* Mobile language switcher */}
              <div className="py-1">
                <LanguageSwitcher />
              </div>

              {user ? (
                <>
                  {xp !== null && streak !== null && (
                    <div className="flex items-center gap-3 py-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold"><Flame className="h-3.5 w-3.5" />{streak} {t("dayStreak")}</span>
                      <span className="flex items-center gap-1 text-violet-500 font-semibold"><Trophy className="h-3.5 w-3.5" />{xp?.toLocaleString()} XP</span>
                    </div>
                  )}
                  <button onClick={() => { setOpen(false); signOut(); }} className="text-left py-2 text-sm">{t("signOut")}</button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setOpen(false)} className="py-2 text-sm">{t("signIn")}</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="py-2 text-sm font-medium">{t("getStarted")} →</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
