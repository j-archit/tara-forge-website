"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeIn, heroFadeIn } from "@/lib/animations";
import { ShieldCheck, Leaf, Eye, UserCheck, Zap, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FAQSection } from "@/components/FAQSection";

export { FAQSection };

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
      title: "Build what you need. Parts that just work.",
      body: "Replacement parts, enclosures, brackets, jigs—designed (or refined) for strength, orientation, and real-world use.",
      tag: "Functional prints",
    },
    {
      label: "Component batching",
      title: "Go Beyond One-Offs. Reliable Batch Manufacturing.",
      body: "Need 100+ precision parts? We optimize for repeat consistency and mechanical integrity across small print runs.",
      tag: "Small-batch printing",
    },
    {
      label: "Figurines & Giftables",
      title: "Craft the otherworldly. Detail in every layer.",
      body: "From custom tabletop miniatures to unique corporate gifts—we provide high-resolution prints that highlight every fine detail.",
      tag: "Custom Art",
    },
  ];

  return (
    <section id="services" className="relative border-b border-slate-800/40 bg-slate-950/20 px-6 pb-12 pt-4 lg:px-4 lg:pb-20 lg:pt-8">
      <div className="section-max-width">
      <div className="mb-16">
        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Specialized <span className="celestial-gradient-text">Services</span></h2>
        <p className="mt-4 text-slate-400 font-light max-w-2xl">Precision printing solutions optimized for your specific project needs.</p>
      </div>
      <div 
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2"
      >
        {services.map((item, i) => (
          <motion.div 
            key={i}
            {...fadeIn(i * 0.1)}
            whileHover={{ y: -8 }}
            className="group relative h-full flex flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] transition-all hover:border-brand-gold/40 hover:bg-slate-900/40"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gold/5 blur-[40px] transition-all group-hover:bg-brand-gold/10" />
            
            <header className="mb-8">
              <span className="text-[14px] font-bold uppercase tracking-[0.3em] text-slate-100">
                {item.label}
              </span>
              <h3 className="mt-4 text-2xl font-semibold leading-snug text-brand-gold transition-colors">
                {item.title}
              </h3>
            </header>
            
            <p className="mb-8 text-pretty text-sm leading-relaxed text-slate-400 font-light">
              {item.body}
            </p>
            
            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
              <Link 
                href="/services"
                className="text-[11px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold-bright transition-colors flex items-center gap-1.5 group/link"
              >
                Learn More
                <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
              <span className="text-[10px] font-medium text-slate-500 italic">
                {item.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}

export function ShopHighlight() {
  return (
    <section className="border-y border-slate-800/60 bg-slate-950/40 py-16 sm:py-24">
      <div className="section-max-width px-6 lg:px-4 text-center">
        <motion.div {...fadeIn(0.1)}>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">The <span className="celestial-gradient-text">Stellar Collection</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-400 lg:text-lg text-center">
            Every artifact in our collection is crafted with intention. We don&apos;t just print; we optimize for beauty, strength, and a professional finish you&apos;ll love to hold.
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
      description: "We approach every project with a maker's curiosity and a professional's discipline. We love what we do.",
      icon: <Heart className="w-5 h-5 text-red-400" />,
      highlight: false
    }
  ];

  return (
    <section className="relative border-b border-slate-800/40 px-6 py-12 lg:px-4 lg:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-gold/[0.01] to-transparent pointer-events-none" />
      <div className="section-max-width relative">
      <div className="max-w-2xl mb-16 ml-auto text-right">
        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Our <span className="celestial-gradient-text">Craft & Ethos</span></h2>
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
              <h3 className="font-semibold text-brand-gold">{v.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-light">
              {v.description}
            </p>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}
