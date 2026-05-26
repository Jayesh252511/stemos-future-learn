import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/site/AuthShell";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Check your email to confirm your account.");
      navigate({ to: "/signin" });
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning STEM with your personal AI tutor."
      footer={<>Already have an account? <Link to="/signin" className="text-foreground font-medium hover:underline">Sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <AuthInput label="Name" placeholder="Ada Lovelace" value={name} onChange={setName} required />
        <AuthInput label="Email" type="email" placeholder="you@university.edu" value={email} onChange={setEmail} required />
        <AuthInput label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={setPassword} required />
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition shadow-soft disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
    </AuthShell>
  );
}
