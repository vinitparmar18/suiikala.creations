import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, Instagram, MapPin, ShieldCheck } from "lucide-react"; // 👈 ShieldCheck icon add kiya hai
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const PHONE_PRIMARY = "8155924930";
const PHONE_SECONDARY = "9638458144";
const EMAIL = "suiikala.creations@gmail.com";
const INSTAGRAM = "_.suii.kala";
const ADDRESS =
  "Kelly La Maison, Near Jahangirpura D-Mart, T.P.30, F.P.50, New Gauravpath Road, Vanakala, Surat – 395005";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
const WHATSAPP_URL = `https://wa.me/91${PHONE_PRIMARY}`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Suiikala — Get in Touch" },
      { name: "description", content: `Reach Suiikala in Surat — call ${PHONE_PRIMARY}, WhatsApp, or email ${EMAIL} for custom gifting orders.` },
      { property: "og:title", content: "Contact Suii Kala" },
      { property: "og:description", content: "Call, WhatsApp, or email Suiikala for handmade gifting in Surat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Suii Kala",
          telephone: `+91${PHONE_PRIMARY}`,
          email: EMAIL,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Kelly La Maison, Near Jahangirpura D-Mart, T.P.30, F.P.50, New Gauravpath Road, Vanakala",
            addressLocality: "Surat",
            postalCode: "395005",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />

      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">Say hello</p>
          <h1 className="font-display italic text-5xl md:text-6xl">Get in Touch</h1>
          <p className="mt-4 text-cream/70 max-w-md">
            Questions, custom orders, gifting concierge — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-16 flex-1 grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <ContactRow icon={Phone} label="Call us" primary={`+91 ${PHONE_PRIMARY}`} secondary={`+91 ${PHONE_SECONDARY}`} href={`tel:+91${PHONE_PRIMARY}`} />
          <ContactRow icon={MessageCircle} label="WhatsApp" primary={`+91 ${PHONE_PRIMARY}`} href={WHATSAPP_URL} external />
          <ContactRow icon={Mail} label="Email" primary={EMAIL} href={`mailto:${EMAIL}`} />
          <ContactRow icon={Instagram} label="Instagram" primary={`@${INSTAGRAM}`} href={`https://instagram.com/${INSTAGRAM}`} external />
          <ContactRow icon={MapPin} label="Visit us" primary={ADDRESS} href={MAPS_URL} external />
          
          
          <div className="border border-border/60 bg-secondary/20 p-5 mt-6 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-forest-brand font-medium text-xs uppercase tracking-wider">
              <ShieldCheck className="size-4 text-emerald-brand" />
              <span>Merchant Verification Details</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1.5 pt-1 border-t border-border/40">
              <p><strong>Merchant Legal Name:</strong> PUSHTI BHARATKUMAR PANDYA</p>
              <p><strong>Brand Name:</strong> Suiikala</p>
              <p><strong>Registered Address:</strong> {ADDRESS}</p>
            </div>
          </div>
        </div>

        <div className="border border-border p-8 bg-card">
          <h2 className="font-display italic text-3xl text-forest-brand">Send a note</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in your details and we'll reply within one business day.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const subject = encodeURIComponent(`Enquiry from ${fd.get("name") ?? ""}`);
              const body = encodeURIComponent(`${fd.get("message") ?? ""}\n\n— ${fd.get("name") ?? ""} (${fd.get("phone") ?? ""})`);
              window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
            }}
          >
            <Field label="Your name" name="name" required />
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Email" name="email" type="email" required />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Message</span>
              <textarea
                name="message"
                required
                rows={5}
                className="mt-1 w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand"
              />
            </label>
            <button className="w-full bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  primary,
  secondary,
  href,
  external,
}: {
  icon: typeof Phone;
  label: string;
  primary: string;
  secondary?: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-start gap-5 border border-border p-6 hover:border-emerald-brand hover:bg-secondary/40 transition-colors"
    >
      <span className="grid place-items-center size-12 rounded-full bg-gold-brand/15 text-gold-brand shrink-0">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-forest-brand font-medium group-hover:text-emerald-brand transition-colors break-words">{primary}</p>
        {secondary && <p className="text-sm text-muted-foreground">{secondary}</p>}
      </div>
    </a>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand"
      />
    </label>
  );
}