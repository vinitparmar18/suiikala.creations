import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBanner, listBanners, upsertBanner } from "@/lib/admin.functions";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banners")({ component: BannersPage });

const empty = { id: undefined as string | undefined, title: "", subtitle: "", image: "", link: "", position: "hero", active: true, sort_order: 0 };

function BannersPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-banners"], queryFn: () => listBanners() });
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const save = useMutation({
    mutationFn: (p: typeof empty) => upsertBanner({ data: p as any }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-banners"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteBanner({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">CMS</p>
          <h1 className="font-display italic text-4xl mt-2">Banners & Homepage</h1>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-full bg-gold-brand px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-forest-brand hover:bg-gold-light">
          <Plus className="size-4" /> New Banner
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((b: any) => (
          <div key={b.id} className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden backdrop-blur-xl">
            {b.image && <img src={b.image} alt="" className="w-full h-40 object-cover" />}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold-brand">{b.position}</p>
                  <p className="font-display italic text-xl mt-1">{b.title}</p>
                  {b.subtitle && <p className="text-sm text-cream/60 mt-1">{b.subtitle}</p>}
                  {b.link && <p className="text-xs text-cream/50 mt-2 font-mono truncate">{b.link}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...b })} className="p-1.5 text-cream/70 hover:text-gold-brand"><Pencil className="size-4" /></button>
                  <button onClick={() => confirm("Delete?") && del.mutate(b.id)} className="p-1.5 text-cream/70 hover:text-red-400"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-cream/40 mt-3">{b.active ? "Active" : "Hidden"} · Order {b.sort_order}</p>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-cream/50">No banners yet.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-forest-brand border border-gold-brand/30 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display italic text-2xl">{editing.id ? "Edit" : "New"} Banner</h2><button onClick={() => setEditing(null)}><X className="size-5" /></button></div>
            <div className="space-y-3">
              <F label="Title"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inp} /></F>
              <F label="Subtitle"><input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className={inp} /></F>
              <F label="Image URL"><input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className={inp} /></F>
              <F label="Link"><input value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className={inp} placeholder="/shop or /collections/hampers" /></F>
              <F label="Position">
                <select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className={inp}>
                  <option value="hero">Hero</option>
                  <option value="strip">Announcement Strip</option>
                  <option value="mid">Mid-page</option>
                  <option value="footer">Footer</option>
                </select>
              </F>
              <F label="Sort Order"><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} className={inp} /></F>
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
