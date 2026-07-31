import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { PLACEHOLDER_IMG } from "@/lib/catalog";
import { inr } from "@/lib/products";
import { useStore } from "@/lib/store";

export function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const wished = inWishlist(product.slug);
  const img = product.image || PLACEHOLDER_IMG;

  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden ring-1 ring-foreground/10 bg-muted">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            width={1000}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
        </Link>

        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-[9px] uppercase tracking-[0.18em] font-semibold ${
              product.badge === "New"
                ? "bg-gold-brand text-forest-brand"
                : product.badge === "Limited"
                  ? "bg-forest-brand text-cream"
                  : "glass text-forest-brand"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 grid place-items-center size-9 rounded-full glass hover:bg-cream transition-colors"
        >
          <Heart
            className={`size-4 transition-colors ${wished ? "fill-emerald-brand text-emerald-brand" : "text-forest-brand"}`}
          />
        </button>

        <button
          onClick={() => addToCart(product.slug)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-forest-brand pl-3 pr-4 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-cream translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-luxe hover:bg-emerald-brand"
        >
          <Plus className="size-3" /> Add
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`font-display text-[17px] leading-tight truncate ${dark ? "text-cream" : "text-forest-brand"}`}
          >
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-emerald-brand transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${dark ? "text-cream/50" : "text-muted-foreground"}`}>
            {product.category}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-mono text-sm ${dark ? "text-gold-brand" : "text-emerald-brand font-semibold"}`}>
            {inr(product.price)}
          </p>
          {product.compareAt && (
            <p className="text-[11px] line-through text-muted-foreground">{inr(product.compareAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
