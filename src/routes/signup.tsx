import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/site/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoadingSubmit(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: name },
      },
    });
    setLoadingSubmit(false);
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
      title={t("createAccount")}
      subtitle={t("signUpSubtitle")}
      footer={<>{t("alreadyHaveAccount")} <Link to="/signin" className="text-foreground font-medium hover:underline">{t("signIn")}</Link></>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <AuthInput label={t("nameLabel")} placeholder="Ada Lovelace" value={name} onChange={setName} required />
        <AuthInput label={t("emailLabel")} type="email" placeholder="you@university.edu" value={email} onChange={setEmail} required />
        <AuthInput label={t("passwordLabel")} type="password" placeholder="At least 6 characters" value={password} onChange={setPassword} required />
        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition shadow-soft disabled:opacity-60"
        >
          {loadingSubmit && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("createAccount")}
        </button>
      </form>
    </AuthShell>
  );
}
