import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { consumeAuthRedirect, isAuthenticatedUserAdmin, rememberAuthRedirect, resetAuthSessionReadiness, toSafeAuthRedirect } from "@/lib/auth-session";
import { toast } from "sonner";
import { Home, Sparkles } from "lucide-react";

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
        toast.success("Welcome! You can now sign in.");
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
    <div className="min-h-screen grid lg:grid-cols-2 gradient-emerald grain relative overflow-hidden">
      {/* Falling Magical Elements Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute animate-fall-slow text-gold-brand text-2xl left-[10%] top-[-10%]">🌸</div>
        <div className="absolute animate-fall-mid text-gold-brand text-xl left-[30%] top-[-15%]">✨</div>
        <div className="absolute animate-fall-fast text-gold-brand text-2xl left-[50%] top-[-10%]">🌿</div>
        <div className="absolute animate-fall-slow text-gold-brand text-xl left-[70%] top-[-20%]">🌸</div>
        <div className="absolute animate-fall-mid text-gold-brand text-2xl left-[90%] top-[-10%]">✨</div>
      </div>

      {/* Left Hero Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-cream relative z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/log.jpeg" alt="Suiikala Logo" className="w-10 h-10 rounded-full object-cover border border-gold-brand/40 shadow-md group-hover:scale-105 transition-transform" />
            <span className="font-display italic text-3xl tracking-wide">Suiikala</span>
          </Link>
        </div>
        
        <div className="my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-brand/10 border border-gold-brand/30 text-gold-brand text-[10px] uppercase tracking-[0.3em] mb-4">
            <Sparkles className="w-3 h-3" /> Heirloom by design
          </div>
          <h1 className="font-display italic text-6xl mt-2 leading-tight">Your atelier awaits.</h1>
          <p className="mt-6 text-cream/80 max-w-md text-base leading-relaxed">
            Sign in to track orders, save cherished pieces to your wishlist, and personalise every handcrafted gift.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-cream/60">
          <span>Handcrafted in Surat, India</span>
          <Link to="/" className="flex items-center gap-1 hover:text-gold-brand transition-colors">
            <Home className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-border/60">
          
          {/* Mobile Top Header with Logo & Home Button */}
          <div className="flex items-center justify-between lg:hidden mb-6 pb-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img src="/log.jpeg" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-emerald-brand/40" />
              <span className="font-display italic text-2xl text-forest-brand">Suiikala</span>
            </Link>
            <Link to="/" className="text-xs flex items-center gap-1 text-emerald-brand font-medium bg-secondary px-3 py-1.5 rounded-full hover:bg-emerald-brand hover:text-white transition-colors">
              <Home className="w-3 h-3" /> Home
            </Link>
          </div>

          <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand font-semibold">Members Portal</p>
            <h2 className="font-display italic text-3xl sm:text-4xl text-forest-brand mt-1">
              {tab === "signup" ? "Create account" : tab === "forgot" ? "Reset password" : "Welcome back"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-b border-border">
            <TabBtn active={tab === "signin"} onClick={() => setTab("signin")}>Sign In</TabBtn>
            <TabBtn active={tab === "signup"} onClick={() => setTab("signup")}>Sign Up</TabBtn>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === "signup" && (
              <Field label="Full name" value={name} onChange={setName} type="text" required placeholder="" />
            )}
            <Field label="Email Address" value={email} onChange={setEmail} type="email" required placeholder="name@example.com" />
            {tab !== "forgot" && (
              <Field label="Password" value={password} onChange={setPassword} type="password" required minLength={6} placeholder="••••••••" />
            )}

            {tab === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-xs text-emerald-brand hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-forest-brand text-cream py-4 rounded-xl text-[11px] uppercase tracking-[0.2em] font-bold shadow-lg hover:bg-emerald-brand transition-all disabled:opacity-60"
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
                type="button"
                onClick={google}
                disabled={busy}
                className="w-full border border-border py-3.5 rounded-xl text-[11px] uppercase tracking-[0.2em] text-forest-brand font-semibold hover:bg-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {tab === "forgot" && (
            <button type="button" onClick={() => setTab("signin")} className="mt-4 text-xs text-emerald-brand hover:underline block font-medium">
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
      className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors ${
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block text-left">
      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="mt-1 w-full border border-border rounded-xl bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand shadow-inner"
      />
    </label>
  );
}