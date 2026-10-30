import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { businessOrderTerms } from "@/data/b2bTerms";
import { createPageMetadata } from "@/lib/siteMetadata";

// This review page is linked only from the end of the B2B page.
export const metadata: Metadata = createPageMetadata(
  "Business Order Terms",
  "Terms for TaraForge3D business orders: quotes, design work, samples, payments, changes, cancellations, timelines, shipping and design rights.",
  "/b2b/terms/",
  { index: false },
);

const linkClass = "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold";

export default function BusinessOrderTermsPage() {
  return (
    <div className="flex min-h-screen flex-col text-slate-50">
      <Navbar />
      <main id="b2b-terms-page" className="px-6 pb-20 pt-12 sm:pt-16 lg:px-4 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <Link href="/b2b/" className={linkClass}>
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />Back to business enquiries
          </Link>
          <header className="pb-10 pt-8 sm:pb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Business orders</p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Business <span className="celestial-gradient-text">order terms</span>
            </h1>
          </header>

          <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/40">
            {businessOrderTerms.map((section, index) => (
              <section key={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28 border-t border-slate-700/60 p-6 first:border-t-0 sm:p-8 lg:p-10">
                <p className="font-mono text-sm text-brand-gold" aria-hidden="true">{String(index + 1).padStart(2, "0")}</p>
                <h2 id={`${section.id}-heading`} className="mt-3 break-words text-xl font-semibold leading-snug sm:text-2xl">{section.title}</h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-300">
                  {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 border-t border-slate-800/70 pt-6 sm:flex-row sm:flex-wrap sm:justify-between">
            <Link href="/shipping-returns/" className={linkClass}>
              Shipping, returns & refunds<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link href="/b2b/#b2b-enquiry" className={linkClass}>
              Discuss your project<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
