import { createFileRoute, Link } from "@tanstack/react-router"; 
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { collections } from "@/lib/collections";
import { Sparkles, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PLACEHOLDER_IMG } from "@/lib/catalog";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Collections — Suiikala" },
      { name: "description", content: "Explore handmade gifting, jewellery, resin art, frames and personalized collections from Suiikala." },
      { property: "og:title", content: "Shop Collections — Suiikala" },
      { property: "og:description", content: "Explore handmade collections, crafted in Surat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopHub,
});

function ShopHub() {
  // 🚀 MAGIC HAPPENS HERE: Database se Admin wali nayi categories fetch kar rahe hain
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["dynamic-categories"],
    queryFn: async () => {
      // Hum 'categories' table se data la rahe hain (Jo admin panel create karta hai)
      const { data, error } = await supabase.from("categories").select("*");
      
      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
      
      // Data ko format kar rahe hain taaki wo cards mein sahi se fit baithe
      return (data || []).map((c: any) => ({
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        name: c.name,
        tagline: c.description || c.tagline || "Discover our new collection",
        image: c.image || c.image_url || PLACEHOLDER_IMG
      }));
    }
  });

  // 🚀 HYBRID MERGE: Purani list aur Nayi admin list dono ko mila diya!
  // Isse hardcoded categories aur nayi DB categories dono dikhengi, aur duplicate bhi nahi hongi.
  const allCollections = [
    ...collections,
    ...dbCategories.filter(dbCat => !collections.some(staticCat => staticCat.slug === dbCat.slug))
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Header */}
      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display italic text-5xl md:text-6xl">Shop All</h1>
          <p className="mt-4 text-cream/70 max-w-md">
            Every piece, handcrafted with love at our Surat studio.
          </p>
        </div>
      </section>

      {/* Collection Image Cards Grid */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-6 font-semibold">Browse Collections</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          
          {/* 1. Custom Brand Signature "All Masterpieces" Card */}
          <Link
            to="/all-products"
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-gold-brand bg-forest-brand shadow-lg block text-left transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-forest-brand via-[#163024] to-emerald-950" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.25em] text-gold-brand font-medium bg-gold-brand/10 px-2 py-1 rounded border border-gold-brand/20">
                  <Sparkles className="size-2.5" /> Suiikala
                </span>
                <Layers className="size-4 text-gold-brand/60" />
              </div>
              
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.3em] text-cream/60">Complete Catalogue</p>
                <span className="font-display italic text-xl sm:text-2xl text-cream leading-tight block">
                  All Masterpieces
                </span>
              </div>
            </div>
            <span className="pointer-events-none absolute inset-1.5 border border-gold-brand/40 group-hover:border-gold-brand transition-colors duration-500 rounded-lg z-20" />
          </Link>

          {/* 2. Individual Category Image Cards (NOW FULLY DYNAMIC!) */}
          {allCollections.map((c, i) => (
            <Link
              key={c.slug}
              to="/collections/$slug" 
              params={{ slug: c.slug }} 
              className="group relative aspect-[4/5] overflow-hidden animate-fade-up text-left block rounded-xl border border-border/80 bg-secondary/40 hover:border-emerald-brand/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 shadow-sm"
              style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={600}
                height={750}
                className="h-full w-full object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-forest-brand/90 via-forest-brand/30 to-transparent pointer-events-none" />
              <span className="absolute inset-x-0 bottom-0 p-4 font-display text-base sm:text-lg text-cream leading-tight z-10">
                {c.name}
              </span>
              <span className="pointer-events-none absolute inset-1.5 border border-gold-brand/0 group-hover:border-gold-brand/40 transition-colors duration-500 rounded-lg z-20" />
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}