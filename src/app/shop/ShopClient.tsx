"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";
import { trackProductInterest, trackCTA } from "@/lib/analytics";
import { products } from "@/data/products";
import { CONTACT, SHOP_NOTICE } from "@/data/siteContent";
import { productInquiryHref } from "@/lib/contact";

export default function ShopClient() {
  return (
    <main className="relative flex min-h-screen flex-col text-slate-50">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-4 sm:pt-20 sm:pb-6 lg:pt-24 lg:pb-8">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)}>
            <h1 className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl mb-8">
              The <span className="celestial-gradient-text">Shop</span>
              <span className="inline-flex items-center rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-sm sm:text-base font-semibold text-brand-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]">
                Coming Soon
              </span>
            </h1>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Preview our upcoming collection. {SHOP_NOTICE}
            </p>
            <p className="mt-3 text-center text-sm sm:text-left">
              <Link href="/shipping-returns" className="text-brand-gold underline underline-offset-4 hover:text-brand-gold-bright">Read our shipping and returns policy</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-16 sm:pb-24 pt-4">
        <div className="section-max-width px-6 lg:px-4">
          <div 
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product, idx) => (
              <motion.article 
                key={product.id}
                {...fadeIn(idx * 0.1)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 transition-all hover:border-brand-gold/50 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${product.imageGradient}`}>
                  <div 
                    className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-70"
                    style={{ background: `radial-gradient(circle at center, ${product.accent}, transparent 70%)` }}
                  />
                  {product.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-brand-gold/90 px-3 py-1 text-[10px] font-bold text-slate-950 shadow-[var(--brand-glow-gold)]">
                      {product.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Logo size={120} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {product.category}
                    </span>
                    <span className="text-sm font-bold text-brand-gold">
                      Indicative: {product.currency}{product.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-brand-gold transition-colors">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <a
                      href={productInquiryHref(product)}
                      onClick={() => trackProductInterest(product.id, product.title, product.price, 'inquiry_click')}
                      className="block w-full rounded-xl bg-slate-800 py-3 text-center text-xs font-bold text-slate-100 transition-all hover:bg-brand-gold hover:text-slate-950 active:scale-95 shadow-lg group-hover:shadow-brand-gold/10"
                    >
                      Ask About Availability
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-slate-800/60 bg-slate-950/40 py-12">
        <div className="section-max-width px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">Custom Batches</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Quantity confirmed in quote</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-brand-gold">Custom Finishes</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Hand-inspected quality</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-brand-gold">Secure Packaging</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Stellar protection</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-brand-gold">Pan-India Shipping</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Direct from Bangalore to all India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Inquiry CTA */}
      <section className="py-20 lg:py-28">
        <div className="section-max-width px-6 text-center">
          <motion.div 
            className="glass-surface max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
            {...fadeIn(0.1)}
          >
            <h2 className="text-3xl font-semibold text-slate-50 mb-4">Bulk Orders & Custom Series</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">
              Planning a repeat run for a project or retail need? Tell us the quantity and requirements so we can quote the price, production time, and any custom branding.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              onClick={() => trackCTA('request_batch_quote', `mailto:${CONTACT.email}`)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-10 py-4 text-sm font-bold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-105 active:scale-95"
            >
              Request Batch Quote
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
