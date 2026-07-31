import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Minus, Plus, ShieldCheck, Truck, Gift, Star } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { fetchProductBySlug, fetchAllProducts, PLACEHOLDER_IMG } from "@/lib/catalog";
import { inr } from "@/lib/products";
import { useStore } from "@/lib/store";

import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product not found — Suii Kala" }, { name: "robots", content: "noindex" }] };
    const { product } = loaderData;
    const title = product.seoTitle || `${product.name} — Suiikala`;
    const desc = product.seoDescription || product.tagline || product.description.slice(0, 155);
    const img = product.image;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(img && !img.startsWith("data:") ? [
          { property: "og:image", content: img },
          { name: "twitter:image", content: img },
          { name: "twitter:card", content: "summary_large_image" },
        ] : [{ name: "twitter:card", content: "summary" }]),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: desc,
            image: img && !img.startsWith("data:") ? [img] : undefined,
            brand: { "@type": "Brand", name: "Suii Kala" },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
            aggregateRating: product.reviewCount > 0 ? {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            } : undefined,
          }),
        },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h1 className="font-display italic text-4xl text-forest-brand">Piece not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-emerald-brand underline">Back to shop</Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h1 className="font-display italic text-3xl text-forest-brand">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground text-sm">{error?.message ?? "Please try again."}</p>
      </div>
      <SiteFooter />
    </div>
  ),
});

interface DBReview {
  id: string;
  product_slug: string;
  rating: number;
  title: string;  
  body: string;   
  created_at: string;
}

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const [qty, setQty] = useState(1);
  const wished = inWishlist(product.slug);
  const images = product.images && product.images.length > 0 ? product.images : [product.image || PLACEHOLDER_IMG];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [userRating, setUserRating] = useState(5);

  const queryClient = useQueryClient();

  const { data: dbReviews = [], refetch: refetchReviews } = useQuery<DBReview[]>({
    queryKey: ["product-reviews", product.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_slug", product.slug)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (newReview: { title: string; rating: number; body: string; product_slug: string; approved: boolean }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([newReview]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchReviews(); 
      setReviewName("");
      setReviewComment("");
      setUserRating(5);
      setShowReviewForm(false);
      alert("Review submitted successfully!");
    },
    onError: (error) => {
      alert("Error saving review: " + error.message);
    }
  });

  const { data: allProducts = [] } = useQuery({ queryKey: ["shop-products"], queryFn: fetchAllProducts });
  const related = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  const activeImg = images[active] || PLACEHOLDER_IMG;

  const totalReviewsCount = dbReviews.length;
  const currentDisplayRating = 
    totalReviewsCount > 0 
      ? dbReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount
      : (product.rating || 0);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    submitReviewMutation.mutate({
      product_slug: product.slug, 
      title: reviewName,          
      body: reviewComment,        
      rating: userRating,
      approved: true              
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Link to="/" className="hover:text-emerald-brand">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-emerald-brand">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-forest-brand">{product.name}</span>
      </div>

      {/* Main Content Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Product Images (Zoom & Gallery) */}
        <div className="space-y-4">
          <div
            className="relative aspect-square overflow-hidden ring-1 ring-border bg-muted cursor-zoom-in"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={activeImg}
              alt={product.name}
              width={1000}
              height={1000}
              style={
                zoom
                  ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.8)", transition: "transform 0.05s linear" }
                  : { transform: "scale(1)", transition: "transform 0.25s ease" }
              }
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 8).map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-square ring-1 overflow-hidden bg-muted transition-opacity ${
                    i === active ? "ring-emerald-brand opacity-100" : "ring-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="flex flex-col justify-center">
          {product.badge && (
            <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-brand mb-3">
              {product.badge}
            </span>
          )}
          <h1 className="font-display italic text-4xl md:text-5xl text-forest-brand leading-tight">{product.name}</h1>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{product.tagline}</p>

          {/* Ratings & Write Review Toggle Link */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="flex text-gold-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4" fill={i < Math.round(currentDisplayRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {currentDisplayRating.toFixed(1)} · {totalReviewsCount} reviews
              </span>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-[10px] font-semibold text-emerald-brand underline tracking-wider uppercase hover:text-forest-brand transition-colors"
            >
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </button>
          </div>

          {/* Write a Review Block form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mt-4 border border-border p-4 bg-card/40 rounded space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest-brand">Give your Rating:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setUserRating(star)}
                    className="text-gold-brand"
                  >
                    <Star className="size-4" fill={star <= userRating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                placeholder="Your Name" 
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full border border-border p-2 text-xs bg-background focus:outline-none focus:border-emerald-brand rounded-sm"
                required
              />

              <textarea 
                placeholder="Write your review details..." 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-border p-2 text-xs bg-background focus:outline-none focus:border-emerald-brand rounded-sm"
                rows={3}
                required
              />

              <button 
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="bg-forest-brand text-cream px-4 py-2 text-[10px] uppercase tracking-wider font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-50"
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {/* Pricing */}
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-mono text-3xl text-emerald-brand font-semibold">{inr(product.price)}</span>
            {product.compareAt && (
              <span className="text-lg line-through text-muted-foreground">{inr(product.compareAt)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <div className="mt-6 gold-divider" />

          {/* Quantity Selector */}
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-forest-brand mb-3">Quantity</p>
            <div className="inline-flex items-center border border-border rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-emerald-brand" aria-label="Decrease">
                <Minus className="size-3" />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                className="p-3 hover:text-emerald-brand"
                aria-label="Increase"
              >
                <Plus className="size-3" />
              </button>
            </div>
            <span className={`ml-4 text-xs ${product.stock > 0 ? "text-emerald-brand" : "text-destructive"}`}>
              {product.stock === 0 ? "Out of stock" : product.stock > 5 ? "In stock" : `Only ${product.stock} left`}
            </span>
          </div>

          {/* Add to Bag / Wishlist CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => addToCart(product.slug, qty)}
              disabled={product.stock === 0}
              className="flex-1 bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-50"
            >
              {product.stock === 0 ? "Out of Stock" : `Add to Bag · ${inr(product.price * qty)}`}
            </button>
            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label="Wishlist"
              className={`grid place-items-center px-5 border transition-colors ${
                wished ? "border-emerald-brand bg-emerald-brand text-cream" : "border-border hover:border-emerald-brand"
              }`}
            >
              <Heart className={`size-5 ${wished ? "fill-cream" : ""}`} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              [Truck, "Free ship ₹999+"],
              [Gift, "Gift ready"],
              [ShieldCheck, "Easy returns"],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof Truck;
              return (
                <div key={i} className="border border-border p-4 bg-card/30">
                  <I className="size-4 text-gold-brand mx-auto" />
                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-forest-brand">{label as string}</p>
                </div>
              );
            })}
          </div>

          {/* Dynamic Specifications & Supabase Reviews Loop */}
          <div className="mt-8 space-y-4">
            {product.material && <Section title="Materials">{product.material}</Section>}
            
            {/* Supabase Dynamic Layout Review Feedbacks */}
            {dbReviews.length > 0 && (
              <Section title={`Customer Feedbacks (${dbReviews.length})`}>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {dbReviews.map((rev) => (
                    <div key={rev.id} className="border-b border-border/60 pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-forest-brand">{rev.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rev.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex text-gold-brand my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-3" fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{rev.body}"</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 border-t border-border">
          <h2 className="font-display italic text-3xl text-forest-brand mb-10">You may also love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border py-4" open>
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-forest-brand">{title}</span>
        <Plus className="size-4 group-open:rotate-45 transition-transform" />
      </summary>
      <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{children}</div>
    </details>
  );
}