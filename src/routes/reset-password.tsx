import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Suiikala" },
      { name: "description", content: "Set a new password for your Suiikala account." },
      { property: "og:title", content: "Reset Password — Suiikala" },
      { property: "og:description", content: "Set a new password." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    nav({ to: "/account" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display italic text-3xl text-emerald-brand">Suii Kala</Link>
        <h1 className="mt-8 font-display italic text-3xl text-forest-brand">Set new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="New password"
            className="w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand"
          />
          <button
            disabled={busy}
            className="w-full bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-60"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
