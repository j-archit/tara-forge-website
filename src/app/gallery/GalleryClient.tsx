"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn, staggerChildren } from "@/lib/animations";
import { TestimonialMarquee } from "@/components/TestimonialMarquee";
import { MoveRight } from "lucide-react";

const galleryItems = [
  {
    title: "Project Artifact Alpha",
    category: "Prototyping",
    description: "Brief description of the mechanical or aesthetic validation process for this specific print.",
    tags: ["Material", "Layer Height"],
    gradient: "from-indigo-900 via-slate-950 to-slate-950",
    accent: "rgba(96,165,250,0.55)"
  },
  {
    title: "Project Artifact Beta",
    category: "Functional Parts",
    description: "Summary of how this part was optimized for strength, durability, and real-world application.",
    tags: ["Material", "Infill Setting"],
    gradient: "from-emerald-900 via-slate-950 to-slate-950",
    accent: "rgba(45,212,191,0.55)"
  },
  {
    title: "Project Artifact Gamma",
    category: "Batching",
    description: "Details regarding small-batch production consistency, turnaround time, and quality control.",
    tags: ["Material", "Batch Size"],
    gradient: "from-fuchsia-900 via-slate-950 to-slate-950",
    accent: "rgba(244,114,182,0.6)"
  },
  {
    title: "Project Artifact Delta",
    category: "Prototyping",
    description: "Overview of iterative design improvements and how 3D printing accelerated the development cycle.",
    tags: ["Material", "Feature Highlight"],
    gradient: "from-blue-900 via-slate-950 to-slate-950",
    accent: "rgba(59,130,246,0.5)"
  },
  {
    title: "Project Artifact Epsilon",
    category: "Functional Parts",
    description: "Technical breakdown of the part's performance characteristics under specific stress or environmental conditions.",
    tags: ["Material", "Custom Spec"],
    gradient: "from-amber-900 via-slate-950 to-slate-950",
    accent: "rgba(251,191,36,0.5)"
  },
  {
    title: "Project Artifact Zeta",
    category: "Design Validation",
    description: "Insights into how this physical model helped refine ergonomics or visual language before mass production.",
    tags: ["Material", "Iteration Phase"],
    gradient: "from-rose-900 via-slate-950 to-slate-950",
    accent: "rgba(244,63,94,0.5)"
  }
];


export default function GalleryClient() {
  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-950/80 via-slate-950 to-slate-950/95 text-slate-50">
      <Navbar />
      
      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-4 sm:pt-20 sm:pb-6 lg:pt-24 lg:pb-8">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
               <Logo size={64} className="drop-shadow-[var(--brand-glow-gold)]" />
               <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl text-center sm:text-left">
                The <span className="celestial-gradient-text">Gallery</span>
              </h1>
            </div>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Browse our portfolio of custom components and prototypes. From singular one-offs to small-batch production, every print reflects our commitment to quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-16 sm:pb-24 pt-4">
        <div className="section-max-width px-6 lg:px-4">
          <div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {galleryItems.map((item, idx) => (
              <motion.div 
                key={idx}
                {...fadeIn(idx * 0.1)}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br ${item.gradient} p-6 shadow-[0_20px_90px_rgba(15,23,42,0.95)] group`}
              >
                <div 
                  className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" 
                  style={{ background: `radial-gradient(circle at center, ${item.accent}, transparent 70%)` }}
                />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-200 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-900/60 text-[10px] text-slate-300 border border-slate-700/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative border-y border-slate-800/70 bg-slate-950/70 py-16 sm:py-24">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div className="text-center mb-12" {...fadeIn(0.05)}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-gold/80">
              Our Professional Commitment
            </h2>
            <p className="mt-4 text-2xl font-medium text-slate-50">
              Recent projects and <span className="celestial-gradient-text">client stories</span>
            </p>
          </motion.div>
        </div>
        
        <TestimonialMarquee />
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-max-width px-6 text-center">
          <motion.div {...fadeIn(0.1)}>
            <h2 className="text-3xl font-semibold text-slate-50 mb-6">Ready to start your next project?</h2>
            <a
              href="mailto:taraforgeindia@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-8 py-3 text-base font-semibold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-105"
            >
              Get a Quote Now
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
