"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, heroFadeIn } from "@/lib/animations";

export function HeroClient({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="mx-auto max-w-2xl text-center sm:text-left"
      {...heroFadeIn}
    >
      {children}
    </motion.div>
  );
}

export function ServiceCards() {
  const services = [
    {
      label: "Rapid prototyping",
      title: "Iterate fast. Hold it in your hands.",
      body: "From first sketch to functional form—tight tolerances, fit-checks, and iteration-friendly prints for teams and makers.",
      tag: "Fast turnaround",
    },
    {
      label: "Custom parts",
      title: "One-offs and small batches that just work",
      body: "Replacement parts, enclosures, brackets, jigs—designed (or refined) for strength, orientation, and real-world use.",
      tag: "Functional prints",
    },
    {
      label: "Component batching",
      title: "Reliable production for high-volume needs",
      body: "Need 100+ precision parts? We optimize for repeat consistency and mechanical integrity across large print runs.",
      tag: "Small-scale MFG",
    },
  ];

  return (
    <section id="services" className="section-max-width px-6 py-20 lg:px-4 lg:py-32">
      <h2 className="sr-only">Our 3D Printing Services</h2>
      <motion.div 
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        {...staggerChildren}
      >
        {services.map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -8 }}
            className="group relative h-full flex flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] transition-all hover:border-brand-gold/40 hover:bg-slate-900/40"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gold/5 blur-[40px] transition-all group-hover:bg-brand-gold/10" />
            
            <header className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                {item.label}
              </span>
              <h3 className="mt-3 text-2xl font-semibold leading-snug text-slate-100 group-hover:text-brand-gold transition-colors">
                {item.title}
              </h3>
            </header>
            
            <p className="mb-8 text-pretty text-sm leading-relaxed text-slate-400 font-light">
              {item.body}
            </p>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/50">
              <span className="text-[10px] font-medium text-slate-500 italic">
                {item.tag}
              </span>
              <div className="h-2 w-2 rounded-full bg-brand-gold/30 shadow-[0_0_8px_var(--brand-gold)]" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function ShopHighlight() {
  return (
    <section className="border-y border-slate-800/60 bg-slate-950/40 py-24 sm:py-32">
      <div className="section-max-width px-6 lg:px-4 text-center">
        <motion.div {...fadeIn(0.1)}>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">The Stellar Collection</h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-400 lg:text-lg">
            Every artifact in our collection is precision-forged. We don't just print; we obsess over geometry, layer adhesion, and otherworldly finishes.
          </p>
          <div className="mt-10">
            <a
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-8 py-3.5 text-sm font-semibold text-slate-100 shadow-xl transition-all hover:bg-brand-gold hover:text-slate-950 hover:scale-105"
            >
              Browse the Shop
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
