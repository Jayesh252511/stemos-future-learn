import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, AuthInput, SocialButtons } from "@/components/site/AuthShell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — STEMOS" },
      { name: "description", content: "Create your free STEMOS account and start learning STEM with AI." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join 120,000+ students learning STEM the smart way."
      footer={<>Already have an account? <Link to="/signin" className="text-foreground font-medium hover:underline">Sign in</Link></>}
    >
      <form className="space-y-4">
        <SocialButtons />
        <div className="relative my-2">
          <div className="h-px bg-border" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
        </div>
        <AuthInput label="Full name" placeholder="Ananya Rao" />
        <AuthInput label="Email" type="email" placeholder="you@university.edu" />
        <AuthInput label="Password" type="password" placeholder="At least 8 characters" />
        <p className="text-[11px] text-muted-foreground">
          By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
        <button type="submit" className="w-full rounded-xl bg-gradient-hero text-primary-foreground py-2.5 text-sm font-medium hover:opacity-95 transition shadow-glow">
          Create free account
        </button>
      </form>
    </AuthShell>
  );
}
