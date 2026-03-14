import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroClient, ServiceCards, ShopHighlight, CoreValues, FAQSection } from "./HomeClient";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col selection:bg-brand-gold/20">
      <Navbar />

      {/* Hero Section - Optimized for LCP */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden py-20 lg:min-h-[calc(100dvh-5rem)]">
        <div className="section-max-width relative px-4 sm:px-6 lg:px-4">
          <HeroClient>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[var(--brand-glow-gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[var(--brand-glow-gold)]" />
              Precision in every layer
              <span className="h-px w-6 bg-slate-600/80" />
              3D Printing Studio
            </p>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Ideas{" "}
              <span className="celestial-gradient-text">engineered into reality</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 lg:text-lg">
              Tara Forge is inspired by “Tara” — meaning <span className="text-slate-100 font-medium">Star</span>.
              We 3D print prototypes, custom parts, and keepsakes with a finish that feels
              otherworldly.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-105"
              >
                Get a quote
                <span className="text-xs text-slate-900/80">— upload designs</span>
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/40 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-brand-gold hover:text-brand-gold hover:scale-105"
                aria-label="Explore our custom 3D print gallery and portfolio"
              >
                Explore Custom Print Gallery
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold opacity-50" />
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 text-left text-sm text-slate-300 sm:max-w-md">
              <div>
                <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Prints
                </dt>
                <dd className="mt-1 font-medium text-slate-100">
                  Prototypes, parts, props
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Materials
                </dt>
                <dd className="mt-1 font-medium text-slate-100">
                  PLA, PETG
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Promise
                </dt>
                <dd className="mt-1 font-medium text-slate-100">
                  Precision in every layer ✶
                </dd>
              </div>
            </dl>
          </HeroClient>
        </div>
      </section>

      <ServiceCards />
      <CoreValues />
      <section id="about" className="relative border-b border-slate-800/40 bg-slate-950/60 px-6 py-12 lg:px-4 lg:py-20">
        <div className="section-max-width">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Why <span className="celestial-gradient-text">Tara Forge?</span></h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-slate-400 font-light">
              We specialize in custom components and functional prototypes. We focus on the fine details—optimizing print orientation and material settings to deliver parts that are precise, durable, and ready for use.
            </p>
            <div className="mt-10 space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-gold">Precision Focus</h3>
                  <p className="mt-1 text-sm text-slate-500">Tight tolerances for mechanical parts.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-gold">Material Mastery</h3>
                  <p className="mt-1 text-sm text-slate-500">Optimized for PETG durability and PLA aesthetics.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-gold">Accessible Pricing</h3>
                  <p className="mt-1 text-sm text-slate-500">Best-in-class 3D printing with budget-friendly rates for every project.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden group">
            {/* The Model with CSS Mask for Background Removal */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <img 
                src="/images/jet-engine.png" 
                alt="3D Printed Jet Engine Model"
                className="h-full w-full object-contain"
                style={{
                  maskImage: 'linear-gradient(to top, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)',
                }}
              />
            </div>
            
            <div className="absolute bottom-6 left-6 z-30">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_var(--brand-gold)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Complex Assembly Print</span>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="absolute bottom-6 right-6 z-30">
              <p className="text-[10px] text-slate-500 font-light italic">
                *Featured model printed for personal use
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

      <FAQSection />
      <ShopHighlight />

      <Footer />
    </main>
  );
}
