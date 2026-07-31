import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground space-y-6">
        <h1 className="font-display italic text-3xl text-forest-brand">Terms & Conditions</h1>
        <p className="text-sm leading-relaxed">Welcome to Suiikala. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use.</p>
        
        <div>
          <h3 className="font-semibold text-forest-brand text-base mb-2">Usage Terms</h3>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</li>
            <li>All products displayed are handcrafted jewellery pieces. Minor variations in shade, texture, or design may occur as part of the unique handmade process.</li>
            <li>Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.</li>
            <li>Your use of this website and any dispute arising out of such use of the website is subject to the laws of India.</li>
          </ul>
        </div>

      
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground/80">
          <p>These terms and conditions are governed by and operated under the legal entity name of <strong>PUSHTI BHARATKUMAR PANDYA</strong> for the brand <strong>Suiikala</strong>.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
});