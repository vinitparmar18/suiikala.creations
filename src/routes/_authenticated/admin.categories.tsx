import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { deleteCategory, listCategories, upsertCategory } from "@/lib/admin.functions";
import { listProducts } from "@/lib/admin.functions"; 
import { Pencil, Plus, Trash2, X, FolderOpen, Loader2, Upload, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({ component: CategoriesPage });

const empty = { id: undefined as string | undefined, slug: "", name: "", description: "", image: "", sort_order: 0, active: true };

const OFFICIAL_COLLECTIONS = [
  { slug: "bracelets", name: "Bracelets", tagline: "Wrist poetry", imagePath: "../../assets/col-bracelets.jpg" },
  { slug: "anklets", name: "Anklets", tagline: "Soft chimes of gold", imagePath: "../../assets/col-anklets.jpg" },
  { slug: "wishing-cards", name: "Wishing Cards", tagline: "Words in gold foil", imagePath: "../../assets/col-wishing-cards.jpg" },
  { slug: "neckpieces", name: "Neckpieces", tagline: "Layered luxury", imagePath: "../../assets/col-neckpieces.jpg" },
  { slug: "nails", name: "Nails", tagline: "Hand-painted artistry", imagePath: "../../assets/col-nails.jpg" },
  { slug: "waist-chain", name: "Waist Chain", tagline: "Heritage at the waist", imagePath: "../../assets/col-waist-chain.jpg" },
  { slug: "scrunchies", name: "Scrunchies", tagline: "Everyday softness", imagePath: "../../assets/col-scrunchies.jpg" },
  { slug: "chocolates", name: "Chocolates", tagline: "Sweet indulgence", imagePath: "../../assets/col-chocolates.jpg" },
  { slug: "claw", name: "Claw", tagline: "Elegance, clipped", imagePath: "../../assets/col-claw.jpg" },
  { slug: "earrings", name: "Earrings", tagline: "Framed in light", imagePath: "../../assets/col-earrings.jpg" },
  { slug: "rings", name: "Rings", tagline: "Quiet statements", imagePath: "../../assets/col-rings.jpg" },
  { slug: "keychains", name: "Keychains", tagline: "Little keepsakes", imagePath: "../../assets/col-keychains.jpg" },
  { slug: "bouquet", name: "Bouquet", tagline: "Blooms that stay", imagePath: "../../assets/col-bouquet.jpg" },
  { slug: "cards-albums", name: "Cards & Albums", tagline: "Handwritten warmth & memories, bound", imagePath: "../../assets/col-albums.jpg" },
  { slug: "phone-cases", name: "Phone Cases", tagline: "Art in your palm", imagePath: "../../assets/col-phone-cases.jpg" }
];

function CategoriesPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: rawCats, isLoading: isLoadingCats } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listCategories() });
  const { data: rawProducts, isLoading: isLoadingProducts } = useQuery({ queryKey: ["admin-all-products"], queryFn: () => listProducts() });

  const dbCategories = Array.isArray(rawCats) ? rawCats : [];
  const allProducts = Array.isArray(rawProducts) ? rawProducts : [];

  const save = useMutation({
    mutationFn: (p: typeof empty) => upsertCategory({ data: p as any }),
    onSuccess: () => { 
      toast.success("Saved successfully"); 
      qc.invalidateQueries({ queryKey: ["admin-categories"] }); 
      setEditing(null); 
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => { 
      toast.success("Deleted successfully"); 
      qc.invalidateQueries({ queryKey: ["admin-categories"] }); 
    },
    onError: (e: any) => toast.error(e.message),
  });

  const mergedList: any[] = [];
  dbCategories.forEach((dc: any) => {
    if (dc && dc.slug) mergedList.push(dc);
  });

  OFFICIAL_COLLECTIONS.forEach((sc) => {
    if (!mergedList.some((c) => c.slug === sc.slug)) {
      const resolvedImg = new URL(sc.imagePath, import.meta.url).href;
      mergedList.push({
        id: `static-${sc.slug}`,
        slug: sc.slug,
        name: sc.name,
        description: sc.tagline,
        image: resolvedImg,
        sort_order: 10,
        active: true
      });
    }
  });

  const filteredProducts = allProducts.filter((p: any) => p?.category === selectedCategorySlug);

  // Securely update state with file data representation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditing((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            image: event.target!.result as string
          };
        });
        toast.success("Image updated in editor");
      }
      setUploading(false);
    };

    reader.onerror = () => {
      toast.error("Failed to read image file");
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  if (isLoadingCats || isLoadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-gold-brand size-8" />
        <p className="text-sm text-cream/60 tracking-wider">Loading Layout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Catalog</p>
          <h1 className="font-display italic text-4xl mt-2">Categories</h1>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 rounded-full bg-gold-brand px-5 py-2.5 text-xs uppercase tracking-widest font-semibold text-forest-brand hover:bg-gold-light">
          <Plus className="size-4" /> New Category
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mergedList.map((c: any) => {
          const productCount = allProducts.filter((p: any) => p?.category === c.slug).length;

          return (
            <div 
              key={c.id} 
              onClick={() => setSelectedCategorySlug(c.slug)}
              className={`rounded-2xl bg-black/30 border p-5 backdrop-blur-xl cursor-pointer transition-all hover:border-gold-brand/50 ${selectedCategorySlug === c.slug ? "border-gold-brand ring-1 ring-gold-brand/40" : "border-white/10"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {c.image && <img src={c.image} alt="" className="size-14 rounded object-cover border border-white/5" />}
                  <div>
                    <p className="font-display italic text-xl">{c.name}</p>
                    <p className="text-xs text-cream/50 font-mono">{c.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setEditing({ ...c, id: c.id?.startsWith("static-") ? undefined : c.id })} className="p-1.5 text-cream/70 hover:text-gold-brand"><Pencil className="size-4" /></button>
                  <button onClick={() => confirm("Delete this category?") && del.mutate(c.id)} className="p-1.5 text-cream/70 hover:text-red-400"><Trash2 className="size-4" /></button>
                </div>
              </div>
              
              {c.description && <p className="text-sm text-cream/60 mt-3">{c.description}</p>}
              
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 justify-between">
                <span className="text-[10px] uppercase tracking-wider text-cream/40">
                  {c.active ? "Active" : "Hidden"}
                </span>
                <span className="bg-gold-brand/10 text-gold-brand text-[10px] px-2 py-0.5 rounded-md font-mono font-medium">
                  {productCount} Items
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCategorySlug && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
            <h3 className="font-display italic text-2xl flex items-center gap-2 text-gold-brand">
              <FolderOpen className="size-5" /> Live products inside: "{selectedCategorySlug}"
            </h3>
            <button onClick={() => setSelectedCategorySlug(null)} className="text-xs text-cream/40 hover:text-cream flex items-center gap-1">
              Close <X className="size-3" />
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-sm text-cream/40 italic py-2">No products linked to this category yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p: any) => (
                <div key={p?.id} className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 text-sm">
                  <span className="font-medium text-cream">{p?.name}</span>
                  <span className="font-mono text-gold-brand font-semibold">₹{p?.price || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-forest-brand border border-gold-brand/30 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display italic text-2xl">{editing.id ? "Edit" : "New"} Category</h2><button onClick={() => setEditing(null)}><X className="size-5" /></button></div>
            <div className="space-y-4">
              <F label="Name">
                <input 
                  value={editing.name} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditing({ 
                      ...editing, 
                      name: val, 
                      slug: editing.id ? editing.slug : val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") 
                    });
                  }} 
                  className={inp} 
                />
              </F>
              <F label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inp} /></F>
              <F label="Description"><textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inp} /></F>
              
              <F label="Collection Banner Image">
                <div className="flex items-center gap-4 mt-1">
                  <div className="size-20 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {editing.image ? (
                      <img src={editing.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="size-6 text-cream/20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-gold-brand/50 bg-black/20 px-4 py-5 text-xs text-cream/70 hover:text-cream transition-all group"
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin text-gold-brand" />
                      ) : (
                        <Upload className="size-4 text-cream/40 group-hover:text-gold-brand" />
                      )}
                      <span>{uploading ? "Uploading..." : editing.image ? "Change Image File" : "Upload Image File"}</span>
                    </button>
                  </div>
                </div>
              </F>

              <F label="Sort Order"><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: +e.target.value })} className={inp} /></F>
              <label className="flex items-center gap-2 text-sm select-none cursor-pointer"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-cream/70">Cancel</button>
              <button disabled={save.isPending || uploading} onClick={() => save.mutate(editing)} className="px-6 py-2 rounded-full bg-gold-brand text-forest-brand text-xs uppercase tracking-widest font-semibold hover:bg-gold-light">{save.isPending ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold-brand";
function F({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-[10px] uppercase tracking-widest text-cream/60 mb-1.5">{label}</label>{children}</div>; }