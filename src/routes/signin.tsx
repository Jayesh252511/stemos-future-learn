import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, AuthInput, SocialButtons } from "@/components/site/AuthShell";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — STEMOS" },
      { name: "description", content: "Sign in to your STEMOS account to continue learning." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={<>Don't have an account? <Link to="/signup" className="text-foreground font-medium hover:underline">Sign up</Link></>}
    >
      <form className="space-y-4">
        <SocialButtons />
        <div className="relative my-2">
          <div className="h-px bg-border" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
        </div>
        <AuthInput label="Email" type="email" placeholder="you@university.edu" />
        <AuthInput label="Password" type="password" placeholder="••••••••" />
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-1.5 text-muted-foreground">
            <input type="checkbox" className="rounded border" /> Remember me
          </label>
          <a href="#" className="text-muted-foreground hover:text-foreground">Forgot password?</a>
        </div>
        <button type="submit" className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition shadow-soft">
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
