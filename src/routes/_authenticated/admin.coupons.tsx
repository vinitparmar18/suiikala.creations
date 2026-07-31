import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCoupon, listCoupons, upsertCoupon } from "@/lib/admin.functions";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/coupons")({ component: CouponsPage });

const empty = { code: "", discount_percent: 10, min_subtotal: 0, active: true, original_code: undefined as string | undefined };

function CouponsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => listCoupons() });
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const save = useMutation({
    mutationFn: (p: typeof empty) => upsertCoupon({ data: p as any }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (code: string) => deleteCoupon({ data: { code } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Marketing</p>
          <h1 className="font-display italic text-4xl mt-2">Coupons</h1>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-full bg-gold-brand px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-forest-brand hover:bg-gold-light">
          <Plus className="size-4" /> New Coupon
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((c: any) => (
          <div key={c.code} className="rounded-2xl bg-black/30 border border-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display italic text-2xl text-gold-brand">{c.code}</p>
                <p className="text-sm text-cream/70 mt-1">{c.discount_percent}% off · Min ₹{c.min_subtotal}</p>
                <p className="text-[10px] uppercase tracking-widest text-cream/40 mt-2">{c.active ? "Active" : "Disabled"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...c, original_code: c.code })} className="p-1.5 text-cream/70 hover:text-gold-brand"><Pencil className="size-4" /></button>
                <button onClick={() => confirm("Delete?") && del.mutate(c.code)} className="p-1.5 text-cream/70 hover:text-red-400"><Trash2 className="size-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-cream/50">No coupons yet.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-forest-brand border border-gold-brand/30 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display italic text-2xl">{editing.original_code ? "Edit" : "New"} Coupon</h2><button onClick={() => setEditing(null)}><X className="size-5" /></button></div>
            <div className="space-y-3">
              <F label="Code (uppercase)"><input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className={inp} /></F>
              <F label="Discount %"><input type="number" value={editing.discount_percent} onChange={(e) => setEditing({ ...editing, discount_percent: +e.target.value })} className={inp} /></F>
              <F label="Min Subtotal (₹)"><input type="number" value={editing.min_subtotal} onChange={(e) => setEditing({ ...editing, min_subtotal: +e.target.value })} className={inp} /></F>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-cream/70">Cancel</button>
              <button disabled={save.isPending} onClick={() => save.mutate(editing)} className="px-6 py-2 rounded-full bg-gold-brand text-forest-brand text-xs uppercase tracking-widest font-semibold hover:bg-gold-light">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-brand";
function F({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-[10px] uppercase tracking-widest text-cream/60 mb-1">{label}</label>{children}</div>; }
