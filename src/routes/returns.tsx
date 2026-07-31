import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/returns")({
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground space-y-6">
        <h1 className="font-display italic text-3xl text-forest-brand">Cancellation & Return Policy</h1>
        <p className="text-sm leading-relaxed">We believe in helping our customers as far as possible, and has therefore a liberal cancellation policy.</p>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Cancellations</h3>
          <p className="text-sm">Cancellations will be considered only if the request is made before the order has been dispatched. Once the order is shipped, cancellation requests will not be entertained.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Returns & Damage Policy</h3>
          <p className="text-sm">You can request a return within 48 hours of delivery if the product is unused and in its original packaging. **Please Note:** Due to the fragile and handmade nature of our jewellery, an unboxing video is strictly mandatory to claim any refunds or replacements for damaged or missing items.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Refund Timeline</h3>
          <p className="text-sm">Once your return is inspected and approved, the refund amount will be processed and automatically credited back to your original payment source within 5-7 working days via our payment gateway partner Razorpay.</p>
        </div>

        
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground/80">
          <p>This cancellation and return policy is issued and operated under the legal merchant name of <strong>PUSHTI BHARATKUMAR PANDYA</strong> for the brand <strong>Suiikala</strong>.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
});