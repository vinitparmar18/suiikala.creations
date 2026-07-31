import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/admin.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => getSettings() });
  const [f, setF] = useState<any>(null);
  useEffect(() => { if (data) setF(data); }, [data]);
  const save = useMutation({
    mutationFn: (payload: any) => updateSettings({ data: payload }),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!f) return <p className="text-cream/60">Loading…</p>;
  const set = (k: string, v: any) => setF({ ...f, [k]: v });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Configuration</p>
          <h1 className="font-display italic text-4xl mt-2">Store Settings</h1>
        </div>
        <button onClick={() => { const { id, updated_at, ...rest } = f; save.mutate(rest); }} disabled={save.isPending}
          className="rounded-full bg-gold-brand px-6 py-2.5 text-xs uppercase tracking-widest font-semibold text-forest-brand hover:bg-gold-light disabled:opacity-50">
          {save.isPending ? "Saving…" : "Save Changes"}
        </button>
      </header>

      <Section title="Store Info">
        <F label="Store Name"><input value={f.store_name ?? ""} onChange={(e) => set("store_name", e.target.value)} className={inp} /></F>
        <F label="Contact Email"><input value={f.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} className={inp} /></F>
        <F label="Contact Phone"><input value={f.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} className={inp} /></F>
        <F label="WhatsApp Number"><input value={f.whatsapp_number ?? ""} onChange={(e) => set("whatsapp_number", e.target.value)} className={inp} /></F>
      </Section>

      <Section title="Tax & Shipping">
        <F label="GST Number"><input value={f.gst_number ?? ""} onChange={(e) => set("gst_number", e.target.value)} className={inp} /></F>
        <F label="GST Rate %"><input type="number" step="0.01" value={f.gst_rate ?? 0} onChange={(e) => set("gst_rate", +e.target.value)} className={inp} /></F>
        <F label="Standard Shipping (₹)"><input type="number" value={f.shipping_standard ?? 0} onChange={(e) => set("shipping_standard", +e.target.value)} className={inp} /></F>
        <F label="Express Shipping (₹)"><input type="number" value={f.shipping_express ?? 0} onChange={(e) => set("shipping_express", +e.target.value)} className={inp} /></F>
        <F label="Free Shipping Min (₹)"><input type="number" value={f.free_shipping_min ?? 0} onChange={(e) => set("free_shipping_min", +e.target.value)} className={inp} /></F>
        <F label="Currency"><input value={f.currency ?? "INR"} onChange={(e) => set("currency", e.target.value)} className={inp} /></F>
      </Section>

      <Section title="Payment Methods">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.payment_razorpay_enabled} onChange={(e) => set("payment_razorpay_enabled", e.target.checked)} /> Razorpay (UPI, Cards, Net Banking)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.payment_cod_enabled} onChange={(e) => set("payment_cod_enabled", e.target.checked)} /> Cash on Delivery</label>
      </Section>

      <Section title="Social Links">
        <F label="Instagram URL"><input value={f.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} className={inp} /></F>
        <F label="Facebook URL"><input value={f.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} className={inp} /></F>
        <F label="Twitter URL"><input value={f.twitter_url ?? ""} onChange={(e) => set("twitter_url", e.target.value)} className={inp} /></F>
      </Section>

      <Section title="SEO">
        <F label="SEO Title" full><input value={f.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} className={inp} /></F>
        <F label="SEO Description" full><textarea value={f.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} className={`${inp} min-h-20`} /></F>
      </Section>

      <Section title="Policies">
        <F label="Shipping Policy" full><textarea value={f.shipping_policy ?? ""} onChange={(e) => set("shipping_policy", e.target.value)} className={`${inp} min-h-24`} /></F>
        <F label="Return Policy" full><textarea value={f.return_policy ?? ""} onChange={(e) => set("return_policy", e.target.value)} className={`${inp} min-h-24`} /></F>
      </Section>

      <Section title="Notifications">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.notif_order_email} onChange={(e) => set("notif_order_email", e.target.checked)} /> Send order confirmation emails</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.notif_ship_email} onChange={(e) => set("notif_ship_email", e.target.checked)} /> Send shipping update emails</label>
      </Section>
    </div>
  );
}

const inp = "w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-brand";
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
      <h2 className="font-display italic text-2xl mb-4">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "md:col-span-2" : ""}><label className="block text-[10px] uppercase tracking-widest text-cream/60 mb-1.5">{label}</label>{children}</div>;
}
