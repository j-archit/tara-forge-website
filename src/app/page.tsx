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
            <div className="flex items-center gap-3 mb-6 group justify-center sm:justify-start">
              <span className="h-px w-12 bg-brand-gold/50" />
              <span className="text-sm sm:text-base font-bold uppercase tracking-[0.4em] text-brand-gold">
                3D Printing Studio
              </span>
              <span className="h-px w-12 bg-brand-gold/50" />
            </div>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl text-center sm:text-left">
              Your best ideas.{" "}
              <span className="celestial-gradient-text">Tangible and tough.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 lg:text-lg">
              <span className="text-slate-100 font-medium whitespace-nowrap">Tara</span> — inspired by the stars, crafted for your most ambitious ideas. From precision-engineered parts to unique custom creations, we bring your vision to life with a finish that feels otherworldly.
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
            <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Why <span className="celestial-gradient-text">TaraForge3D?</span></h2>
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
          <div className="flex flex-col items-center group">
            <div className="relative aspect-[4/3] w-[70%] overflow-hidden">
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
            </div>

            <div className="mt-2 flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/40 px-3 py-2 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold shadow-[0_0_8px_var(--brand-gold)]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200 leading-tight">Jet Engine Model</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-brand-gold/70 leading-tight">Complex Assembly</span>
                </div>
              </div>

              {/* Legal Disclaimer */}
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
