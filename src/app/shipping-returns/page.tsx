import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { CONTACT } from "@/data/siteContent";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "Shipping, Returns & Refunds",
  "How TaraForge3D handles pan-India shipping, delivery damage, custom-print returns, and verified refunds.",
  "/shipping-returns"
);

export default function ShippingReturnsPage() {
  return (
    <main className="relative flex min-h-screen flex-col text-slate-50">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-20 pt-20 lg:px-4 lg:pb-28 lg:pt-28">
        <div className="section-max-width relative max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand-gold">Order policies</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Shipping, <span className="celestial-gradient-text">returns & refunds</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
            We make and inspect each print with care. Here is what to expect before dispatch and how to reach us if something is wrong when your order arrives.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <section aria-labelledby="shipping-heading" className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
              <h2 id="shipping-heading" className="text-2xl font-semibold">Shipping across India</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                We ship pan-India. Shipping is charged separately at the actual carrier cost for your destination and parcel. We confirm that charge with you before dispatch.
              </p>
              <p className="mt-4 leading-relaxed text-slate-400">
                Delivery time depends on your location and the carrier. We share dispatch and tracking details once your parcel has been shipped.
              </p>
            </section>

            <section aria-labelledby="dispatch-heading" className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
              <h2 id="dispatch-heading" className="text-2xl font-semibold">Before we ship</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                We share images of the finished product and its shipping package before dispatch, so you can see what is being sent. The remaining 50% of the printing-project payment is due before shipping.
              </p>
            </section>

            <section aria-labelledby="returns-heading" className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
              <h2 id="returns-heading" className="text-2xl font-semibold">Returns and delivery problems</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                We do not accept change-of-mind returns for a custom print that arrives undamaged and matches the agreed specification.
              </p>
              <p className="mt-4 leading-relaxed text-slate-300">
                If your parcel or print arrives damaged, defective, or materially different from what we agreed, please contact us as soon as possible. Share your quote or order details, photos of the product and packaging, and, if possible, an unboxing video starting with the unopened shipping package. Please keep the packaging while we review the claim.
              </p>
              <p className="mt-4 leading-relaxed text-slate-400">
                An unboxing video helps us verify transit damage, but please contact us even if you could not record one. We review the available evidence and each claim on its facts. If a return is needed, we will confirm the return arrangements before you send anything back.
              </p>
            </section>

            <section aria-labelledby="refunds-heading" className="rounded-3xl border border-brand-gold/30 bg-brand-gold/5 p-6 sm:p-8">
              <h2 id="refunds-heading" className="text-2xl font-semibold">Verified claims and refunds</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                For a verified problem, we will discuss an appropriate resolution, which may include a correction, replacement, or refund. Refund claims are reviewed case by case.
              </p>
              <p className="mt-4 leading-relaxed text-slate-300">
                Once a refund claim is verified, we process the refund within 2–4 business days. The time for the credit to appear in your account may depend on your bank or payment provider.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Nothing on this page limits your rights under applicable consumer law.
              </p>
            </section>
          </div>

          <section aria-labelledby="help-heading" className="mt-6 rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-8">
            <h2 id="help-heading" className="text-2xl font-semibold">Need help with an order?</h2>
            <p className="mt-3 text-slate-300">Email us with your quote or order details and any photos or video you have.</p>
            <a className="mt-5 inline-flex rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-brand-gold-bright" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Shipping or return request")}`}>
              Email {CONTACT.email}
            </a>
            <p className="mt-5 text-sm text-slate-400">
              For payment milestones and how to start a project, see our <Link className="text-brand-gold underline underline-offset-4 hover:text-brand-gold-bright" href="/quote">quote page</Link>.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
