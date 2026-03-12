"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, heroFadeIn } from "@/lib/animations";
import { ShieldCheck, Leaf, Eye, UserCheck, Zap, Heart } from "lucide-react";

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
      title: "Reliable production for batch needs",
      body: "Need 100+ precision parts? We optimize for repeat consistency and mechanical integrity across small print runs.",
      tag: "Small-scale MFG",
    },
  ];

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-4 lg:pb-32 lg:pt-12">
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
            Every artifact in our collection is precision-engineered. We don't just print; we optimize for geometric accuracy, layer adhesion, and professional-grade finishes.
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

export function CoreValues() {
  const values = [
    {
      title: "Precision & Interaction",
      description: "Tight tolerances meet best-in-class customer support. We don't just ship parts; we ensure they solve your problems.",
      icon: <UserCheck className="w-5 h-5 text-brand-gold" />,
      highlight: false
    },
    {
      title: "Environment Forward",
      description: "We take every step to combat waste that comes with 3D printing—from optimizing supports to material recycling.",
      icon: <Leaf className="w-5 h-5 text-emerald-400" />,
      highlight: true
    },
    {
      title: "Radical Transparency",
      description: "Open communication about lead times, material capabilities, and technical constraints. No surprises, ever.",
      icon: <Eye className="w-5 h-5 text-blue-400" />,
      highlight: false
    },
    {
      title: "Unwavering Accountability",
      description: "If a part isn't right, we fix it. We take full ownership of the quality that leaves our print studio.",
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      highlight: false
    },
    {
      title: "Iterative Excellence",
      description: "We treat every project as a chance to refine our craft, constantly benchmarking the latest additive tech.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      highlight: false
    },
    {
      title: "Maker Spirit",
      description: "We approach industrial problems with a maker's curiosity and a pro's discipline. We love what we do.",
      icon: <Heart className="w-5 h-5 text-red-400" />,
      highlight: false
    }
  ];

  return (
    <section className="section-max-width px-6 py-20 lg:px-4 lg:py-32 border-t border-slate-800/40">
      <div className="max-w-2xl mb-16">
        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Our Craft & Ethos</h2>
        <p className="mt-4 text-slate-400 font-light">The values that guide every layer we print and every partnership we build.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v, i) => (
          <motion.div
            key={i}
            {...fadeIn(i * 0.05)}
            className={`p-6 rounded-2xl border ${
              v.highlight 
                ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]' 
                : 'border-slate-800/60 bg-slate-900/20'
            } transition-colors hover:border-slate-700/80`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-800/50">
                {v.icon}
              </div>
              <h3 className="font-semibold text-slate-100">{v.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-light">
              {v.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
