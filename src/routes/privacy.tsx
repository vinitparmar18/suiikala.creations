import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground space-y-6">
        <h1 className="font-display italic text-3xl text-forest-brand">Privacy Policy</h1>
        <p className="text-sm leading-relaxed">This privacy policy sets out how Suiikala uses and protects any information that you give Suiikala when you use this website. We are committed to ensuring that your privacy is protected.</p>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Information We Collect</h3>
          <p className="text-sm">We may collect the following information: Customer Name, Contact Information including email address and phone number, and Demographic information such as postcode, address, and preferences.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Security</h3>
          <p className="text-sm">We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online. All payment transactions are securely processed through Razorpay, and we do not store any card or banking details.</p>
        </div>

        {/* 👇 Razorpay validation ke liye fully linked entity text */}
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground/80">
          <p>This privacy policy is managed by <strong>PUSHTI BHARATKUMAR PANDYA</strong> for the brand operations of <strong>Suiikala</strong>.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
});