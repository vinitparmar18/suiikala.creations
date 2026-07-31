import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Mail, Phone, MapPin, Heart } from "lucide-react";
import { collections } from "@/lib/collections";

const PHONE_PRIMARY = "8155924930";
const PHONE_SECONDARY = "9638458144";
const EMAIL = "suiikala.creations@gmail.com";
const INSTAGRAM = "_.suii.kala";
const ADDRESS_LINES = [
  "Kelly La Maison",
  "Near Jahangirpura D-Mart",
  "T.P.30, F.P.50, New Gauravpath Road",
  "Vanakala, Surat 395005",
];
const ADDRESS = ADDRESS_LINES.join(", ");
const WHATSAPP_URL = `https://wa.me/91${PHONE_PRIMARY}`;
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

export function SiteFooter() {
  return (
    <footer className="mt-16 sm:mt-24 gradient-emerald grain text-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 pt-14 sm:pt-20 pb-8">
        
        <div className="flex flex-col items-center pb-12 sm:pb-16 border-b border-cream/10">
          <Link to="/" className="flex flex-col items-center gap-3 group">
            <img 
              src="/log.jpeg" 
              alt="Suiikala Footer Logo"
              className="h-12 w-auto object-contain rounded-md transition-transform group-hover:scale-105" 
            />
            <p className="font-display italic text-3xl sm:text-4xl md:text-5xl text-gold-shimmer">
              Suiikala
            </p>
          </Link>
          <p className="mt-4 inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-cream/70">
            <Heart className="size-3.5 text-gold-brand" /> Handcrafted with Love
          </p>
        </div>

        <div className="py-12 sm:py-16 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <FooterCol
            title="Quick Links"
            links={[
              ["/shop", "Shop All"],
              ["/collections", "All Collections"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ]}
          />
          <FooterCol
            title="Collections"
            links={collections.slice(0, 6).map((c) => [`/collections/${c.slug}`, c.name] as [string, string])}
          />
          
          {/* 👇 Customer Care Section links updated explicitly */}
          <FooterCol
            title="Customer Care"
            links={[
              ["/account/orders", "Track Order"],
              ["/account", "My Account"],
              ["/account/wishlist", "Wishlist"],
              ["/cart", "Bag"],
              ["/privacy", "Privacy Policy"],
              ["/terms", "Terms & Conditions"],
              ["/returns", "Return & Cancellation"],
            ]}
          />

          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-gold-brand mb-5 sm:mb-6">
              Get in Touch
            </h4>
            <div className="space-y-3 text-[13px] text-cream/80">
              <a href={`tel:+91${PHONE_PRIMARY}`} className="flex items-start gap-3 hover:text-gold-brand transition-colors">
                <Phone className="size-4 text-gold-brand shrink-0 mt-0.5" />
                <span>
                  +91 {PHONE_PRIMARY}
                  <span className="block text-cream/55">+91 {PHONE_SECONDARY}</span>
                </span>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-gold-brand transition-colors"
              >
                <MessageCircle className="size-4 text-gold-brand shrink-0" />
                WhatsApp us
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 hover:text-gold-brand transition-colors">
                <Mail className="size-4 text-gold-brand shrink-0 mt-0.5" />
                <span className="break-all">{EMAIL}</span>
              </a>
              <a
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-gold-brand transition-colors"
              >
                <Instagram className="size-4 text-gold-brand shrink-0" />@{INSTAGRAM}
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-gold-brand transition-colors"
              >
                <MapPin className="size-4 text-gold-brand shrink-0 mt-0.5" />
                <span>
                  {ADDRESS_LINES.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cream/50 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Suiikala · Handmade in Surat, India
          </p>
          <div className="flex gap-3">
            <SocialIcon href={`https://instagram.com/${INSTAGRAM}`} label="Instagram">
              <Instagram className="size-4" />
            </SocialIcon>
            <SocialIcon href={WHATSAPP_URL} label="WhatsApp">
              <MessageCircle className="size-4" />
            </SocialIcon>
            <SocialIcon href={`tel:+91${PHONE_PRIMARY}`} label="Call">
              <Phone className="size-4" />
            </SocialIcon>
            <SocialIcon href={`mailto:${EMAIL}`} label="Email">
              <Mail className="size-4" />
            </SocialIcon>
            <SocialIcon href={MAPS_URL} label="Address">
              <MapPin className="size-4" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="grid place-items-center size-10 rounded-full border border-cream/20 text-cream/70 hover:text-forest-brand hover:bg-gold-brand hover:border-gold-brand transition-colors"
    >
      {children}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold text-gold-brand mb-5 sm:mb-6">{title}</h4>
      <ul className="space-y-2.5 text-[12px] sm:text-[13px] text-cream/70">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="hover:text-gold-brand transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}