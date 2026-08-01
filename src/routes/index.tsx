import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Sparkles, Truck, ShieldCheck, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CollectionGrid } from "@/components/collection-cards";
import { GIFT_HAMPERS } from "@/lib/collections";
import {
  fetchFeatured,
  fetchNewArrivals,
  fetchNewLaunches,
  fetchProductsByCollection,
  type Product,
} from "@/lib/catalog";

import hisFavImg from "@/assets/his-favourite.jpg";
import desiDivaImg from "@/assets/desi-diva.jpg";
import packGiftbox from "@/assets/pack-giftbox.jpg";
import packRibbon from "@/assets/pack-ribbon.jpg";
import packWrap from "@/assets/pack-wrap.jpg";
import packMessageCard from "@/assets/pack-message-card.jpg";
import packNameTag from "@/assets/pack-name-tag.jpg";
import packLuxury from "@/assets/pack-luxury.jpg";
import packElegant from "@/assets/pack-elegant.jpg";
import budgetPremium from "@/assets/budget-premium.jpg";
import budget999 from "@/assets/budget-999.jpg";
import budget699 from "@/assets/budget-699.jpg";
import budget499 from "@/assets/budget-499.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suiikala — Luxury Handcrafted Gifting & Jewellery, Surat" },
      {
        name: "description",
        content:
          "Suiikala— a luxury handmade gifting brand by Pushti B. Pandya. Emerald-and-gold jewellery, hampers, keepsakes and personalised gifts handcrafted in Surat.",
      },
      { property: "og:title", content: "Suiikala— Luxury Handmade Gifting" },
      { property: "og:type", content: "website" },
      {
        property: "og:description",
        content: "Handcrafted jewellery, hampers and keepsakes, made with love in Surat.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const packing = [
  { label: "Luxury Gift Box", img: packGiftbox },
  { label: "Premium Ribbon", img: packRibbon },
  { label: "Gift Wrap", img: packWrap },
  { label: "Message Card", img: packMessageCard },
  { label: "Name Tag", img: packNameTag },
  { label: "Luxury Packaging", img: packLuxury },
  { label: "Elegant Packaging", img: packElegant },
];

const budgets = [
  { label: "Premium Hampers", note: "The grand gesture", key: "2000-plus", img: budgetPremium },
  { label: "Under ₹999", note: "Thoughtful & complete", key: "under-999", img: budget999 },
  { label: "Under ₹699", note: "Small, sincere luxury", key: "under-699", img: budget699 },
  { label: "Under ₹499", note: "Little tokens of love", key: "under-499", img: budget499 },
];

function Home() {
  const { data: bestsellers = [] } = useQuery({ queryKey: ["home-best"], queryFn: () => fetchFeatured(8) });
  const { data: newArrivals = [] } = useQuery({ queryKey: ["home-new"], queryFn: () => fetchNewArrivals(8) });
  const { data: newLaunches = [] } = useQuery({ queryKey: ["home-launches"], queryFn: () => fetchNewLaunches(8) });
  const { data: hisFav = [] } = useQuery({
    queryKey: ["home-his"],
    queryFn: () => fetchProductsByCollection("his-favourites"),
  });
  const { data: desiDiva = [] } = useQuery({
    queryKey: ["home-desi"],
    queryFn: () => fetchProductsByCollection("desi-diva"),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Section */}
      <section className="relative gradient-emerald overflow-hidden flex items-center min-h-[520px] h-[78vh] max-h-[820px]">
        <div className="absolute inset-0 grain" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-[520px] rounded-full bg-gold-brand/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 size-[560px] rounded-full bg-emerald-brand/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 w-full animate-reveal">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="h-px w-10 bg-gold-brand/70" />
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-gold-brand">
              Handcrafted with Love · Surat
            </p>
          </div>
          <h1 className="font-display text-cream text-[2.6rem] sm:text-6xl lg:text-8xl leading-[1.05] max-w-4xl text-balance">
            Gifts that Feel
            <br />
            <span className="italic text-gold-shimmer">Like a Hug</span>
          </h1>
          <p className="mt-6 sm:mt-8 max-w-lg text-cream/80 text-sm sm:text-lg leading-relaxed">
            Handcrafted keepsakes, jewellery and hampers — designed to hold a feeling long after the moment has passed.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-3 bg-gold-brand text-forest-brand px-7 sm:px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
            >
              Shop the Collection
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-3 border border-cream/25 text-cream px-7 sm:px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-cream/10 transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-cream/60">
          <div className="w-px h-8 bg-cream/40" />
          <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {[
            [Sparkles, "Handmade in India"],
            [Gift, "Luxury gift packaging"],
            [ShieldCheck, "Secure checkout"],
            [Truck, "Free shipping over ₹999"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Sparkles;
            return (
              <div key={i} className="flex items-center gap-3 min-w-0">
                <I className="size-4 text-gold-brand shrink-0" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                  {label as string}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 1 — Best Sellers */}
      <SliderSection eyebrow="House Favourites" title="Best Sellers" items={bestsellers} cta={{ to: "/shop", label: "Shop all bestsellers" }} />

      {/* Section 2 — New Launches */}
      {newLaunches.length > 0 && (
        <SliderSection
          eyebrow="Fresh off the studio table"
          title="New Launches"
          items={newLaunches}
          cta={{ to: "/collections/$slug", params: { slug: "new-launches" }, label: "See all new launches" }}
          alt
        />
      )}

      {/* Section 3 — New Arrivals */}
      <SliderSection
        eyebrow="Just In"
        title="New Arrivals"
        items={newArrivals}
        cta={{ to: "/shop", label: "See what's new" }}
        alt={newLaunches.length === 0}
      />

      {/* Section 4 — Our Collections */}
      <section className="py-16 sm:py-24 px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10 sm:mb-12 gap-4 sm:gap-6 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">The Edit</p>
              <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-forest-brand">Our Collections</h2>
            </div>
            <div className="hidden md:block flex-1 gold-divider mb-4" />
            <Link
              to="/collections"
              className="text-[10px] uppercase tracking-[0.2em] font-semibold text-forest-brand hover:text-emerald-brand flex items-center gap-2"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <CollectionGrid />
        </div>
      </section>

      {/* Section 5 — Custom Packing */}
      <section className="gradient-emerald grain py-16 sm:py-24 px-5 sm:px-6 lg:px-10 text-cream">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-3">Signature Packaging</p>
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl">Custom Packing</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {packing.map((p, i) => (
              <div
                key={p.label}
                className="group relative aspect-square overflow-hidden border border-gold-brand/20 transition-all duration-500 hover:border-gold-brand animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              >
                <img
                  src={p.img}
                  alt={p.label}
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-brand/90 via-forest-brand/10 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 p-4 font-display text-base sm:text-xl text-cream">{p.label}</p>
                <span className="pointer-events-none absolute inset-2 border border-gold-brand/0 transition-colors duration-500 group-hover:border-gold-brand/60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Choose By Budget */}
      <section className="py-16 sm:py-24 px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">Something for everyone</p>
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-forest-brand">Choose By Budget</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {budgets.map((b, i) => (
              <Link
                key={b.key}
                to="/shop"
                search={{ budget: b.key } as never}
                className="group relative aspect-[4/5] overflow-hidden border border-forest-brand/15 transition-all duration-500 hover:border-gold-brand animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <img
                  src={b.img}
                  alt={b.label}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-brand/92 via-forest-brand/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <p className="font-display italic text-xl sm:text-3xl text-cream leading-tight">{b.label}</p>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-cream/70">{b.note}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold-brand">
                    Shop now <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <span className="pointer-events-none absolute inset-2 border border-gold-brand/0 transition-colors duration-500 group-hover:border-gold-brand/50" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — His Favourite */}
      <SliderSection
        eyebrow="Curated for him"
        title="His Favourite ❤️"
        items={hisFav}
        cta={{ to: "/collections/$slug", params: { slug: "his-favourites" }, label: "View All Collection" }}
        alt
      />

      {/* Section 8 — Desi Diva Collection */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="relative overflow-hidden bg-forest-brand grain text-cream min-h-[360px] sm:min-h-[460px] flex items-center p-8 sm:p-12 md:p-20 border border-gold-brand/30">
          <img
            src={desiDivaImg}
            alt=""
            loading="lazy"
            width={1600}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover opacity-70 md:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-brand via-forest-brand/80 to-forest-brand/20" />
          <div className="relative z-10 max-w-xl animate-reveal">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">Signature Edit</p>
            <h3 className="font-display italic text-3xl sm:text-5xl md:text-6xl leading-[1.05]">
              Desi Diva
              <br />
              <span className="text-gold-shimmer">Collection</span>
            </h3>
            <Link
              to="/collections/$slug"
              params={{ slug: "desi-diva" }}
              className="mt-8 sm:mt-10 inline-flex items-center gap-3 bg-gold-brand text-forest-brand px-7 sm:px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-gold-light transition-colors"
            >
              Discover the edit <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        {desiDiva.length > 0 && (
          <div className="mt-12 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
            {desiDiva.slice(0, 4).map((p) => (
              <div key={p.slug} className="border border-forest-brand/10 p-2 transition-all duration-300 hover:border-gold-brand">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function SliderSection({
  eyebrow,
  title,
  items,
  cta,
  alt,
}: {
  eyebrow: string;
  title: string;
  items: Product[];
  cta?: { to: string; label: string; params?: Record<string, string> };
  alt?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={`py-16 sm:py-24 px-5 sm:px-6 lg:px-10 relative ${alt ? "gradient-emerald grain text-cream" : ""}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.4em] mb-3 ${alt ? "text-gold-brand" : "text-emerald-brand"}`}>
              {eyebrow}
            </p>
            <h2 className={`font-display italic text-3xl sm:text-4xl md:text-5xl ${alt ? "text-cream" : "text-forest-brand"}`}>
              {title}
            </h2>
          </div>
          {cta && (
            <Link
              to={cta.to as never}
              params={cta.params as never}
              className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold border transition-all duration-300 w-fit ${
                alt
                  ? "bg-gold-brand/15 text-gold-brand border-gold-brand/40 hover:bg-gold-brand hover:text-forest-brand"
                  : "border-forest-brand/30 text-forest-brand hover:bg-forest-brand hover:text-cream"
              }`}
            >
              {cta.label} <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <p className={`py-8 text-sm ${alt ? "text-cream/60" : "text-muted-foreground"}`}>New pieces coming soon.</p>
        ) : (
          <div className="relative group">
            {/* Left Arrow Button */}
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll Left"
              type="button"
              className={`absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-110 cursor-pointer ${
                alt
                  ? "bg-forest-brand text-gold-brand border border-gold-brand/60 hover:bg-gold-brand hover:text-forest-brand"
                  : "bg-cream text-forest-brand border border-forest-brand/25 hover:bg-forest-brand hover:text-cream"
              }`}
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll Right"
              type="button"
              className={`absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-110 cursor-pointer ${
                alt
                  ? "bg-forest-brand text-gold-brand border border-gold-brand/60 hover:bg-gold-brand hover:text-forest-brand"
                  : "bg-cream text-forest-brand border border-forest-brand/25 hover:bg-forest-brand hover:text-cream"
              }`}
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Slider Track assigned with scrollRef */}
            <div className="relative -mx-5 sm:-mx-6 lg:-mx-10 overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory px-5 sm:px-6 lg:px-10 pb-6 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {items.map((p) => (
                  <div
                    key={p.slug}
                    className={`snap-start shrink-0 w-[220px] sm:w-[300px] lg:w-[320px] p-2.5 transition-all duration-500 border ${
                      alt
                        ? "border-gold-brand/20 bg-forest-brand/40 hover:border-gold-brand shadow-lg"
                        : "border-forest-brand/10 bg-background hover:border-gold-brand shadow-sm"
                    }`}
                  >
                    <ProductCard product={p} dark={alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}