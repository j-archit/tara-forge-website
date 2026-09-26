"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { fadeIn } from "@/lib/animations";
import { TestimonialMarquee } from "@/components/TestimonialMarquee";
import { trackCTA, trackEvent } from "@/lib/analytics";
import { CONTACT } from "@/data/siteContent";

import { galleryItems } from "@/data/gallery";


export default function GalleryClient() {
  return (
    <main className="relative flex min-h-screen flex-col text-slate-50">
      <Navbar />
      
      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-4 sm:pt-20 sm:pb-6 lg:pt-24 lg:pb-8">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)}>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl text-center sm:text-left mt-8">
              The <span className="celestial-gradient-text">Gallery</span>
            </h1>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Browse our portfolio of custom components and prototypes. From singular one-offs to small-batch production, every print reflects our commitment to quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-16 sm:pb-24 pt-4">
        <div className="section-max-width px-6 lg:px-4">
          {galleryItems.length === 0 && <p className="text-slate-300">New projects will be shared here soon.</p>}
          <div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {galleryItems.map((item, idx) => (
              <motion.div 
                key={item.id}
                {...fadeIn(idx * 0.1)}
                onViewportEnter={() => trackEvent('gallery_item_view', 'engagement', item.title, undefined, { category: item.category })}
                className={`relative min-h-80 overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br ${item.gradient} p-6 shadow-[0_20px_90px_rgba(15,23,42,0.95)] group`}
              >
                <div 
                  className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" 
                  style={{ background: `radial-gradient(circle at center, ${item.accent}, transparent 70%)` }}
                />
                {item.image && (
                  <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} className={`relative mb-5 aspect-[4/3] w-full rounded-lg bg-slate-950/50 ${item.image.fit === "cover" ? "object-cover" : "object-contain"}`} />
                )}
                <div className="relative flex flex-col gap-5 justify-between">
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
              href={`mailto:${CONTACT.email}`}
              onClick={() => trackCTA('get_quote_gallery', `mailto:${CONTACT.email}`)}
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
