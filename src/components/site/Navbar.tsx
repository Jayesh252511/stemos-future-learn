import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-soft"
          >
            Get started
          </Link>
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
              <Link to="/signin" onClick={() => setOpen(false)} className="py-2 text-sm">Sign in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="py-2 text-sm font-medium">Get started →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
