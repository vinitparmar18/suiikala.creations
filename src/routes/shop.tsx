import { createFileRoute, Link } from "@tanstack/react-router"; 
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { collections } from "@/lib/collections";
import { fetchAllProducts } from "@/lib/catalog";

type SearchParams = { budget?: string; collection?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    budget: typeof s.budget === "string" ? s.budget : undefined,
    collection: typeof s.collection === "string" ? s.collection : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All — Suiikala" },
      { name: "description", content: "Browse the full Suiikala catalogue of handmade gifting, jewellery, resin art, frames and personalized gifts." },
      { property: "og:title", content: "Shop All — Suii Kala" },
      { property: "og:description", content: "The full Suiikala catalogue, handmade in Surat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const budgetRanges: Record<string, [number, number]> = {
  "under-499": [0, 499],
  "under-699": [0, 699],
  "under-999": [0, 999],
  "500-999": [500, 999],
  "1000-1999": [1000, 1999],
  "2000-plus": [2000, Number.MAX_SAFE_INTEGER],
};

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchAllProducts,
  });
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "new">("featured");
  const filter = search.collection ?? "all";

  const list = useMemo(() => {
    let l = [...products];
    if (filter !== "all") l = l.filter((p) => p.collection === filter);
    if (search.budget && budgetRanges[search.budget]) {
      const [lo, hi] = budgetRanges[search.budget];
      l = l.filter((p) => p.price >= lo && p.price <= hi);
    }
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    else if (sort === "new") l.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    else if (sort === "featured") l.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return l;
  }, [products, sort, filter, search.budget]);

  const clearBudget = () =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, budget: undefined }) });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">The Boutique</p>
          <h1 className="font-display italic text-5xl md:text-6xl">Shop All</h1>
          <p className="mt-4 text-cream/70 max-w-md">
            Every piece, handcrafted with love at our Surat studio.
          </p>
        </div>
      </section>

      {/* Collection image cards - Structured cleanly with boxed design & smooth hover */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pt-12 sm:pt-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-6">Browse by collection</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* "All" card */}
          <Link
            to="/shop"
            className={`group relative aspect-[4/5] overflow-hidden rounded-xl border transition-all duration-300 animate-fade-up grid place-items-center shadow-sm ${
              filter === "all" 
                ? "border-gold-brand bg-forest-brand shadow-md scale-[1.02]" 
                : "border-border/80 bg-secondary/60 hover:border-emerald-brand hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            <span
              className={`font-display italic text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-105 ${
                filter === "all" ? "text-cream" : "text-forest-brand"
              }`}
            >
              All
            </span>
          </Link>

          {collections.map((c, i) => {
            const isActive = filter === c.slug;
            return (
              <Link
                key={c.slug}
                to="/collections/$slug" 
                params={{ slug: c.slug }} 
                className={`group relative aspect-[4/5] overflow-hidden animate-fade-up text-left block rounded-xl border transition-all duration-500 shadow-sm ${
                  isActive 
                    ? "ring-2 ring-gold-brand border-gold-brand shadow-md scale-[1.02]" 
                    : "border-border/80 bg-secondary/40 hover:border-emerald-brand/70 hover:shadow-xl hover:-translate-y-1"
                }`}
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
                <span className="absolute inset-x-0 bottom-0 p-3 font-display text-sm sm:text-lg text-cream leading-tight z-10">
                  {c.name}
                </span>
                <span
                  className={`pointer-events-none absolute inset-1.5 border transition-colors duration-500 rounded-lg z-20 ${
                    isActive ? "border-gold-brand" : "border-gold-brand/0 group-hover:border-gold-brand/40"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-8 sm:py-10 flex flex-wrap items-center justify-between gap-4 border-b border-border">
        <div className="flex flex-wrap gap-2 items-center">
          {search.budget && (
            <button
              onClick={clearBudget}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] rounded-full border border-emerald-brand text-emerald-brand bg-emerald-brand/5 hover:bg-emerald-brand hover:text-cream transition-colors"
            >
              {search.budget.replace("-", " – ")} ✕
            </button>
          )}
        </div>
        <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-foreground/60">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-transparent border border-border rounded-full px-4 py-2 text-xs text-forest-brand focus:outline-none focus:border-emerald-brand cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </label>
      </div>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-24">Loading pieces…</p>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No pieces match this filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}