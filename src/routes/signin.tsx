import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/site/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
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
    setLoadingSubmit(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingSubmit(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell
      title={t("welcomeBack")}
      subtitle={t("signInSubtitle")}
      footer={<>{t("dontHaveAccount")} <Link to="/signup" className="text-foreground font-medium hover:underline">{t("createAccount")}</Link></>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <AuthInput label={t("emailLabel")} type="email" placeholder="you@university.edu" value={email} onChange={(v) => setEmail(v)} required />
        <AuthInput label={t("passwordLabel")} type="password" placeholder="••••••••" value={password} onChange={(v) => setPassword(v)} required />
        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 transition shadow-soft disabled:opacity-60"
        >
          {loadingSubmit && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("signIn")}
        </button>
      </form>
    </AuthShell>
  );
}
