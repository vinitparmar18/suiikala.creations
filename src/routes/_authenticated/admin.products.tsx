import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProduct, listProducts, upsertProduct } from "@/lib/admin.functions";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: ProductsPage });

const empty = {
  id: undefined as string | undefined,
  slug: "", name: "", tagline: "", description: "", material: "",
  price: 0, compare_at: null as number | null, category: "", collection: "",
  image: "", images: [] as string[], badge: "", stock: 0, active: true, featured: false, new_launch: false,
  seo_title: "", seo_description: "",
};

// 📦 Aapke pure system ki exact categories (URL & Slugs ke sath mapping done)
const OFFICIAL_COLLECTIONS = [
  { slug: "bracelets", name: "Bracelets" },
  { slug: "anklets", name: "Anklets" },
  { slug: "wishing-cards", name: "Wishing Cards" },
  { slug: "neckpieces", name: "Neckpieces" },
  { slug: "nails", name: "Nails" },
  { slug: "waist-chain", name: "Waist Chain" },
  { slug: "scrunchies", name: "Scrunchies" },
  { slug: "chocolates", name: "Chocolates" },
  { slug: "claw", name: "Claw" },
  { slug: "earrings", name: "Earrings" },
  { slug: "rings", name: "Rings" },
  { slug: "keychains", name: "Keychains" },
  { slug: "bouquet", name: "Bouquet" },
  { slug: "cards-albums", name: "Cards & Albums" },
  { slug: "phone-cases", name: "Phone Cases" },
  { slug: "his-favourites", name: "His Favourites" }
];

function ProductsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => listProducts() });
  const [editing, setEditing] = useState<typeof empty | null>(null);
  
  const save = useMutation({
    mutationFn: (p: typeof empty) => upsertProduct({ data: p as any }),
    onSuccess: () => { toast.success("Product saved"); qc.invalidateQueries({ queryKey: ["admin-products"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  
  const del = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Catalog</p>
          <h1 className="font-display italic text-4xl mt-2">Products</h1>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-full bg-gold-brand px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-forest-brand hover:bg-gold-light">
          <Plus className="size-4" /> New Product
        </button>
      </header>

      <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden">
        {isLoading ? <p className="p-6 text-cream/60">Loading…</p> : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-cream/50 bg-black/20">
              <tr><th className="text-left p-4">Product</th><th className="text-left">Category</th><th className="text-right">Price</th><th className="text-right">Stock</th><th className="text-center">Status</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="size-10 rounded object-cover" />}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-cream/50 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-cream/70 font-mono text-xs">{p.category}</td>
                  <td className="text-right font-medium text-gold-brand">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className={`text-right ${p.stock < 5 ? "text-red-400" : ""}`}>{p.stock}</td>
                  <td className="text-center"><span className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-wider ${p.active ? "bg-emerald-brand/30 text-emerald-100" : "bg-white/10 text-cream/50"}`}>{p.active ? "Live" : "Draft"}</span></td>
                  <td className="text-right p-4 space-x-2">
                    <button onClick={() => setEditing({ ...empty, ...p, images: p.images ?? [] })} className="p-2 text-cream/70 hover:text-gold-brand"><Pencil className="size-4" /></button>
                    <button onClick={() => confirm("Delete product?") && del.mutate(p.id)} className="p-2 text-cream/70 hover:text-red-400"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-cream/50">No products yet. Add your first one.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* 🛠️ Fix: passing save.mutate instead of undefined onSave */}
      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={(p) => save.mutate(p)} saving={save.isPending} />}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, saving }: { product: typeof empty; onClose: () => void; onSave: (p: typeof empty) => void; saving: boolean }) {
  const [f, setF] = useState(product);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-forest-brand border border-gold-brand/30 rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-forest-brand">
          <h2 className="font-display italic text-2xl">{f.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose}><X className="size-5" /></button>
        </div>
        
        <div className="p-6 grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input 
              value={f.name} 
              onChange={(e) => {
                const val = e.target.value;
                set("name", val);
                if (!f.id) {
                  set("slug", val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"));
                }
              }} 
              className={input} 
            />
          </Field>
          <Field label="Slug"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={input} /></Field>
          <Field label="Tagline" full><input value={f.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} className={input} /></Field>
          <Field label="Description" full><textarea value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} className={`${input} min-h-24`} /></Field>
          <Field label="Material"><input value={f.material ?? ""} onChange={(e) => set("material", e.target.value)} className={input} /></Field>
          <Field label="Badge"><input value={f.badge ?? ""} onChange={(e) => set("badge", e.target.value)} className={input} placeholder="New / Bestseller / Limited" /></Field>
          <Field label="Price (₹)"><input type="number" value={f.price} onChange={(e) => set("price", +e.target.value)} className={input} /></Field>
          <Field label="Compare-at (₹)"><input type="number" value={f.compare_at ?? ""} onChange={(e) => set("compare_at", e.target.value ? +e.target.value : null)} className={input} /></Field>
          
          <Field label="Category & Collection">
            <select
              value={f.category ?? ""}
              onChange={(e) => {
                const selectedSlug = e.target.value;
                set("category", selectedSlug);
                set("collection", selectedSlug);
              }}
              className={`${input} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-forest-brand text-cream/40">Select Collection</option>
              {OFFICIAL_COLLECTIONS.map((col) => (
                <option key={col.slug} value={col.slug} className="bg-forest-brand text-cream">
                  {col.name} ({col.slug})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Stock"><input type="number" value={f.stock} onChange={(e) => set("stock", +e.target.value)} className={input} /></Field>
          
          <Field label="Product images" full>
            <ImageUploader
              value={f.images ?? []}
              onChange={(next: string[]) => {
                set("images", next);
                set("image", next[0] ?? "");
              }}
            />
          </Field>
          
          <Field label="SEO Title" full><input value={f.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} className={input} /></Field>
          <Field label="SEO Description" full><textarea value={f.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} className={input} /></Field>
          <div className="flex gap-4 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-sm select-none cursor-pointer"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Active</label>
            <label className="flex items-center gap-2 text-sm select-none cursor-pointer"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-2 text-sm select-none cursor-pointer"><input type="checkbox" checked={!!f.new_launch} onChange={(e) => set("new_launch", e.target.checked)} /> New Launch</label>
          </div>
        </div>
        
        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-white/10 bg-forest-brand z-10">
          <button onClick={onClose} className="px-5 py-2 text-sm text-cream/70">Cancel</button>
          <button disabled={saving} onClick={() => onSave(f)} className="px-6 py-2 rounded-full bg-gold-brand text-forest-brand text-xs uppercase tracking-widest font-semibold hover:bg-gold-light disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const input = "w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-brand";
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "md:col-span-2" : ""}><label className="block text-[10px] uppercase tracking-widest text-cream/60 mb-1.5">{label}</label>{children}</div>;
}