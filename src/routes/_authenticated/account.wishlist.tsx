import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/lib/store";
import { fetchProductsBySlugs } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/account/wishlist")({
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const { data: items = [] } = useQuery({
    queryKey: ["wishlist-products", wishlist.slice().sort().join(",")],
    queryFn: () => fetchProductsBySlugs(wishlist),
    enabled: wishlist.length > 0,
  });

  return (
    <div>
      <h2 className="font-display italic text-3xl text-forest-brand">Wishlist</h2>
      {items.length === 0 ? (
        <div className="mt-8 text-center py-16 border border-dashed border-border">
          <p className="text-muted-foreground">Nothing saved yet — tap the heart on any piece.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-forest-brand text-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors"
          >
            Browse the shop <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
