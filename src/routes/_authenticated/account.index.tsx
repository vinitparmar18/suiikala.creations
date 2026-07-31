import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
        setLoading(false);
      });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved.");
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;

  return (
    <div>
      <h2 className="font-display italic text-3xl text-forest-brand">My Profile</h2>
      <form onSubmit={save} className="mt-6 space-y-4 max-w-lg">
        <Field label="Email" value={user?.email ?? ""} onChange={() => {}} disabled />
        <Field label="Full name" value={fullName} onChange={setFullName} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <button
          disabled={busy}
          className="bg-forest-brand text-cream px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand disabled:opacity-60"
      />
    </label>
  );
}
