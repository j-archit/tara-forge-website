import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroClient, ServiceCards, ShopHighlight, CoreValues } from "./HomeClient";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col selection:bg-brand-gold/20">
      <Navbar />

      {/* Hero Section - Optimized for LCP */}
      <section className="relative overflow-hidden pt-12 pb-4 sm:pt-16 sm:pb-6 lg:pt-20 lg:pb-8">
        <div className="section-max-width relative px-4 sm:px-6 lg:px-4">
          <HeroClient>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 shadow-[var(--brand-glow-gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[var(--brand-glow-gold)]" />
              Precision in every layer
              <span className="h-px w-6 bg-slate-600/80" />
              3D Printing Studio
            </p>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Ideas{" "}
              <span className="celestial-gradient-text">engineered into reality</span>
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-slate-300 sm:text-base">
              Tara Forge is inspired by “Tara” — meaning <span className="text-slate-100 font-medium">Star</span> in multiple Indian languages.
              We 3D print prototypes, custom parts, and keepsakes with a finish that feels
              otherworldly.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
              <a
                href="mailto:taraforgeindia@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-105"
              >
                Get a quote
                <span className="text-xs text-slate-900/80">— send your file</span>
              </a>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/40 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-brand-gold hover:text-brand-gold hover:scale-105"
              >
                See recent prints
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold opacity-50" />
              </Link>
            </div>

            <dl className="mt-7 grid grid-cols-3 gap-4 text-left text-xs text-slate-300 sm:max-w-md">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Prints
                </dt>
                <dd className="mt-1 font-medium text-slate-100">
                  Prototypes, parts, props
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Materials
                </dt>
                <dd className="mt-1 font-medium text-slate-100">
                  PLA, PETG
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
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
      <ShopHighlight />

      {/* About / Why Section */}
      <section id="about" className="section-max-width px-6 py-20 lg:px-4 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Why Tara Forge?</h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-slate-400 font-light">
              We specialize in custom components and functional prototypes. We focus on the fine details—optimizing print orientation and material settings to deliver parts that are precise, durable, and ready for use.
            </p>
            <div className="mt-10 space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Precision Focus</h3>
                  <p className="mt-1 text-sm text-slate-500">Tight tolerances for mechanical parts.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Material Mastery</h3>
                  <p className="mt-1 text-sm text-slate-500">Optimized for PETG durability and PLA aesthetics.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-brand-gold">✶</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Accessible Pricing</h3>
                  <p className="mt-1 text-sm text-slate-500">Best-in-class 3D printing with budget-friendly rates for every project.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-transparent to-purple-500/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Visual Placeholder</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
