import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { consumeAuthRedirect, isAuthenticatedUserAdmin, rememberAuthRedirect, resetAuthSessionReadiness, toSafeAuthRedirect } from "@/lib/auth-session";
import { toast } from "sonner";

type Search = { redirect?: string; mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign In — Suiikala" },
      { name: "description", content: "Access your Suiikala account, orders and wishlist." },
      { property: "og:title", content: "Sign In — Suiikala" },
      { property: "og:description", content: "Access your Suiikala account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { redirect, mode } = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">(mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const routeAuthenticatedUser = useCallback(async () => {
    consumeAuthRedirect(redirect);
    const admin = await isAuthenticatedUserAdmin();
    await nav({ to: admin ? "/admin" : "/account", replace: true });
  }, [redirect, nav]);

  useEffect(() => {
    if (!loading && user) void routeAuthenticatedUser();
  }, [user, loading, routeAuthenticatedUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signup") {
        const redirectTarget = toSafeAuthRedirect(redirect);
        rememberAuthRedirect(redirectTarget);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTarget)}`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to verify your email.");
      } else if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        resetAuthSessionReadiness();
        await supabase.auth.getSession();
        toast.success("Welcome back.");
        await routeAuthenticatedUser();
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setTab("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const redirectTarget = toSafeAuthRedirect(redirect);
    rememberAuthRedirect(redirectTarget);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTarget)}`,
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
    setBusy(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gradient-emerald grain">
      <div className="hidden lg:flex flex-col justify-between p-12 text-cream">
        <Link to="/" className="font-display italic text-3xl">Suiikala</Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Heirloom by design</p>
          <h1 className="font-display italic text-6xl mt-4">Your atelier awaits.</h1>
          <p className="mt-6 text-cream/70 max-w-md">
            Sign in to track orders, save cherished pieces to your wishlist, and personalise every gift.
          </p>
        </div>
        <p className="text-xs text-cream/50">Handcrafted in Surat, India</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand">Members</p>
          <h2 className="font-display italic text-4xl text-forest-brand mt-2">
            {tab === "signup" ? "Create account" : tab === "forgot" ? "Reset password" : "Welcome back"}
          </h2>

          <div className="mt-8 flex gap-2 border-b border-border">
            <TabBtn active={tab === "signin"} onClick={() => setTab("signin")}>Sign In</TabBtn>
            <TabBtn active={tab === "signup"} onClick={() => setTab("signup")}>Sign Up</TabBtn>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === "signup" && (
              <Field label="Full name" value={name} onChange={setName} type="text" required />
            )}
            <Field label="Email" value={email} onChange={setEmail} type="email" required />
            {tab !== "forgot" && (
              <Field label="Password" value={password} onChange={setPassword} type="password" required minLength={6} />
            )}

            {tab === "signin" && (
              <button
                type="button"
                onClick={() => setTab("forgot")}
                className="text-xs text-emerald-brand hover:underline"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-60"
            >
              {busy ? "Please wait…" : tab === "signup" ? "Create account" : tab === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          {tab !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={google}
                disabled={busy}
                className="w-full border border-border py-4 text-[11px] uppercase tracking-[0.2em] text-forest-brand hover:bg-secondary transition-colors disabled:opacity-60"
              >
                Continue with Google
              </button>
            </>
          )}

          {tab === "forgot" && (
            <button onClick={() => setTab("signin")} className="mt-4 text-xs text-emerald-brand hover:underline">
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
        active ? "text-emerald-brand border-b-2 border-emerald-brand -mb-px" : "text-muted-foreground hover:text-forest-brand"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="mt-1 w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand"
      />
    </label>
  );
}
