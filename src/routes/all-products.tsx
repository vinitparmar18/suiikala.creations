import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { fetchAllProducts } from "@/lib/catalog";
import { collections } from "@/lib/collections";
import { SlidersHorizontal, X } from "lucide-react";

type SearchParams = { budget?: string; collection?: string };

export const Route = createFileRoute("/all-products")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    budget: typeof s.budget === "string" ? s.budget : undefined,
    collection: typeof s.collection === "string" ? s.collection : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Masterpieces — Suiikala" },
      { name: "description", content: "Explore the complete catalogue of handmade gifting, bespoke jewellery, and resin art crafted in Surat." },
    ],
  }),
  component: AllProductsPage,
});

const budgetRanges: Record<string, [number, number]> = {
  "under-499": [0, 499],
  "under-699": [0, 699],
  "under-999": [0, 999],
  "1000-1999": [1000, 1999],
  "2000-plus": [2000, Number.MAX_SAFE_INTEGER],
};

const budgetLabels: Record<string, string> = {
  "under-499": "Under ₹499",
  "under-699": "Under ₹699",
  "under-999": "Under ₹999",
  "1000-1999": "₹1,000 – ₹1,999",
  "2000-plus": "₹2,000 & Above",
};

function AllProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["all-shop-products"],
    queryFn: fetchAllProducts,
  });

  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "new">("featured");

  const list = useMemo(() => {
    let l = [...products];
    if (search.collection && search.collection !== "all") {
      l = l.filter((p) => p.collection === search.collection);
    }
    if (search.budget && budgetRanges[search.budget]) {
      const [lo, hi] = budgetRanges[search.budget];
      l = l.filter((p) => p.price >= lo && p.price <= hi);
    }
    if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
    else if (sort === "new") l.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    else if (sort === "featured") l.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return l;
  }, [products, sort, search.budget, search.collection]);

  const clearAllFilters = () => navigate({ search: {} });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Header */}
      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link to="/shop" className="text-[10px] uppercase tracking-[0.3em] text-gold-brand hover:text-cream transition-colors">
            ← Back to Collections
          </Link>
          <h1 className="mt-4 font-display italic text-5xl md:text-6xl">All Masterpieces</h1>
          <p className="mt-3 text-cream/70 max-w-md">
            The complete catalogue of handcrafted pieces, created with love at our Surat studio.
          </p>
        </div>
      </section>

      {/* Professional E-commerce Filter & Sort Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left: Filters (Collection & Budget) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="size-3.5 text-emerald-brand" /> Filters:
            </span>

            {/* Collection Dropdown Filter */}
            <select
              value={search.collection ?? "all"}
              onChange={(e) => navigate({ search: (prev: SearchParams) => ({ ...prev, collection: e.target.value === "all" ? undefined : e.target.value }) })}
              className="bg-secondary/50 border border-border rounded-full px-4 py-1.5 text-xs text-forest-brand font-medium focus:outline-none focus:border-emerald-brand cursor-pointer"
            >
              <option value="all">All Categories</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Budget Dropdown Filter */}
            <select
              value={search.budget ?? "all"}
              onChange={(e) => navigate({ search: (prev: SearchParams) => ({ ...prev, budget: e.target.value === "all" ? undefined : e.target.value }) })}
              className="bg-secondary/50 border border-border rounded-full px-4 py-1.5 text-xs text-forest-brand font-medium focus:outline-none focus:border-emerald-brand cursor-pointer"
            >
              <option value="all">All Budgets</option>
              {Object.keys(budgetRanges).map((bKey) => (
                <option key={bKey} value={bKey}>{budgetLabels[bKey]}</option>
              ))}
            </select>

            {(search.budget || search.collection) && (
              <button
                onClick={clearAllFilters}
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-destructive hover:bg-destructive/10 rounded-full font-semibold transition-colors"
              >
                Reset <X className="size-3" />
              </button>
            )}
          </div>

          {/* Right: Sorting */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-semibold">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-secondary/50 border border-border rounded-full px-4 py-1.5 text-xs text-forest-brand font-medium focus:outline-none focus:border-emerald-brand cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="new">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
          </div>

        </div>
      </div>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-24">Loading pieces…</p>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">No pieces match your selected filters.</p>
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