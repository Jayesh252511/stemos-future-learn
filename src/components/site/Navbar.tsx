import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Sparkles, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/tutor", label: "AI Tutor" },
  { to: "/quiz", label: "Quizzes" },
  { to: "/paths", label: "Learning Paths" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const initial = (user?.user_metadata?.display_name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 glass border-b" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">STEMOS</span>
          <span className="ml-1 hidden sm:inline-block text-[10px] uppercase tracking-widest text-muted-foreground px-1.5 py-0.5 rounded border">Beta</span>
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
          {user ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition">
                <span className="h-6 w-6 rounded-md bg-gradient-hero text-primary-foreground flex items-center justify-center text-[11px] font-semibold">{initial}</span>
                <span className="max-w-[120px] truncate">{user.user_metadata?.display_name || user.email}</span>
              </Link>
              <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-soft"
              >
                Get started
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
              {user ? (
                <button onClick={() => { setOpen(false); signOut(); }} className="text-left py-2 text-sm">Sign out</button>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setOpen(false)} className="py-2 text-sm">Sign in</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="py-2 text-sm font-medium">Get started →</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
