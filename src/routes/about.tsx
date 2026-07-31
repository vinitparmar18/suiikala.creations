import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HandHeart } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import founderImg from "@/assets/founder.jpg";
import heroImg from "@/assets/hero-luxe.jpg";
import packLuxury from "@/assets/pack-luxury.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Suiikala — Founded by Pushti B. Pandya, Surat" },
      {
        name: "description",
        content:
          "Suiikala is a luxury handmade gifting brand founded by Pushti B. Pandya in Surat. The story behind every handcrafted keepsake, and why families across India choose Suii Kala.",
      },
      { property: "og:title", content: "About Suiikala — Made with Love" },
      { property: "og:description", content: "The story behind Suii Kala, founded by Pushti B. Pandya in Surat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const why = [
  "100% handmade, never mass produced",
  "Personalisation on almost every piece",
  "Signature emerald-and-gold luxury packaging",
  "Made in Surat, shipped across India",
  "Direct concierge on WhatsApp for custom gifting",
  "Small-batch craft, honest pricing",
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative h-[58vh] min-h-[400px] overflow-hidden flex items-end">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-brand via-forest-brand/60 to-transparent" />
        <div className="absolute inset-0 grain" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pb-14 sm:pb-16 text-cream animate-reveal">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">Our Story</p>
          <h1 className="font-display italic text-4xl sm:text-5xl md:text-7xl leading-[1.05]">
            Made with love,
            <br />
            <span className="text-gold-shimmer">for the ones you love.</span>
          </h1>
        </div>
      </section>

      {/* Founder Story */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative animate-fade-up">
          <img
            src={founderImg}
            alt="Pushti B. Pandya — Founder of Suii Kala"
            loading="lazy"
            width={1000}
            height={1250}
            className="w-full aspect-[4/5] object-cover shadow-luxe"
          />
          <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 bg-gold-brand text-forest-brand p-5 sm:p-6 max-w-[240px] shadow-luxe">
            <p className="font-display italic text-xl sm:text-2xl leading-none">Pushti B. Pandya</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] font-semibold">Founder · Suii Kala</p>
          </div>
        </div>
        <div className="animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">Founder Story</p>
          <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-forest-brand leading-tight">
            The hands behind Suii Kala
          </h2>
          <div className="mt-7 space-y-5 text-muted-foreground leading-relaxed">
            <p>Suiikala was born from a simple belief — that the most meaningful gifts are the ones made with love.</p>
            <p>
              Founded by Pushti B. Pandya, Suiikala is a handmade gifting brand where every creation is thoughtfully
              designed to celebrate emotions, memories and special moments. From personalised keepsakes to handcrafted
              jewellery, each piece is made with care, creativity and attention to detail.
            </p>
            <p>
              At Suiikala we believe a gift is more than a product — it's a feeling. Whether it's for birthdays,
              anniversaries, Raksha Bandhan, weddings, or just because, our mission is to help you express your love in
              the most beautiful way.
            </p>
            <p>Every order is handcrafted with passion, packed with love, and created to leave a lasting impression.</p>
            <p className="font-display italic text-2xl text-forest-brand">This is just the beginning.</p>
            <p>Thank you for being a part of the Suiikala journey. </p>
          </div>
        </div>
      </section>

      {/* Why Choose Suiikala */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">The Difference</p>
          <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-forest-brand leading-tight">
            Why Choose Suiikala
          </h2>
          <ul className="mt-8 space-y-4">
            {why.map((w) => (
              <li key={w} className="flex items-start gap-3 text-muted-foreground">
                <HandHeart className="size-4 text-gold-brand shrink-0 mt-1" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 bg-forest-brand text-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors"
          >
            Explore the shop <ArrowRight className="size-4" />
          </Link>
        </div>
        <img
          src={packLuxury}
          alt="Suiikala luxury emerald and gold gift packaging"
          loading="lazy"
          width={1000}
          height={1250}
          className="w-full aspect-[4/5] object-cover shadow-luxe animate-fade-up"
        />
      </section>

      <SiteFooter />
    </div>
  );
}
