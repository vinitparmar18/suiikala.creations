import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/settings")({
  component: Settings,
});

function Settings() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated.");
      setPassword("");
    }
  };

  return (
    <div>
      <h2 className="font-display italic text-3xl text-forest-brand">Account Settings</h2>
      <div className="mt-8 max-w-md">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">Change password</h3>
        <form onSubmit={change} className="mt-4 space-y-4">
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
            className="bg-forest-brand text-cream px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-60"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
