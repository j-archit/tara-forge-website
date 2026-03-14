"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";

interface Product {
  id: string | number;
  title: string;
  category: string;
  description: string;
  price: number; 
  currency: string;
  imageGradient: string;
  accent: string;
  tag?: string;
}

const products: Product[] = [
  {
    id: "tf-desk-organizer",
    title: "Minimalist Desk Set",
    category: "Living",
    description: "A geometric 3-piece set for your workspace. Designed for modularity and a clean aesthetic finish.",
    price: 1249,
    currency: "₹",
    imageGradient: "from-blue-900/40 via-slate-900 to-slate-950",
    accent: "rgba(56, 189, 248, 0.4)",
    tag: "Popular",
  },
  {
    id: "tf-planter-stellar",
    title: "Celestial Planter",
    category: "Living",
    description: "Self-watering geometric planter with a celestial pattern. Durable PETG construction for indoor/outdoor use.",
    price: 899,
    currency: "₹",
    imageGradient: "from-purple-900/40 via-slate-900 to-slate-950",
    accent: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "tf-lamp-nebula",
    title: "Nebula Ambient Lamp",
    category: "Decor",
    description: "Lithophane-style light cover that projects cosmic shadows. Includes custom base and LED fitting.",
    price: 2499,
    currency: "₹",
    imageGradient: "from-amber-900/40 via-slate-900 to-slate-950",
    accent: "rgba(251, 191, 36, 0.4)",
    tag: "Premium",
  },
  {
    id: "tf-keycap-forge",
    title: "Forge Edition Keycaps",
    category: "Customs",
    description: "Set of 4 artisan keycaps featuring the TaraForge logo. High-detail SLA prints for mechanical keyboards.",
    price: 599,
    currency: "₹",
    imageGradient: "from-emerald-900/40 via-slate-900 to-slate-950",
    accent: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "tf-headphone-stand",
    title: "Aero Headphone Stand",
    category: "Living",
    description: "Ergonomic stand designed for weight balance and minimalistic profile. Printed in reinforced PLA.",
    price: 1599,
    currency: "₹",
    imageGradient: "from-rose-900/40 via-slate-900 to-slate-950",
    accent: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: "tf-swatch-pack",
    title: "Material Swatch Pack",
    category: "Makers",
    description: "Complete set of 12 material swatches including PLA, PETG, and Specialty filaments for tactile review.",
    price: 450,
    currency: "₹",
    imageGradient: "from-slate-800 via-slate-900 to-slate-950",
    accent: "rgba(148, 163, 184, 0.4)",
    tag: "Sample Kit"
  }
];

export default function ShopClient() {
  const handleCheckout = (product: Product) => {
    console.log(`Starting checkout for: ${product.title} (ID: ${product.id})`);
    
    const subject = encodeURIComponent(`Order Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hello TaraForge,\n\nI am interested in purchasing the ${product.title} (SKU: ${product.id}).\n\nPlease let me know the shipping process.\n\nThank you!`);
    window.location.assign(`mailto:taraforgeindia@gmail.com?subject=${subject}&body=${body}`);
  };

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
                The <span className="celestial-gradient-text">Shop</span>
              </h1>
            </div>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Own a piece of the stars. Every item in our shop is designed in-house and 3D printed with the same attention to detail we apply to professional prototypes.
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
                      {product.currency}{product.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-brand-gold transition-colors">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 font-light">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <button 
                      onClick={() => handleCheckout(product)}
                      className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-100 transition-all hover:bg-brand-gold hover:text-slate-950 active:scale-95 shadow-lg group-hover:shadow-brand-gold/10"
                    >
                      Buy Now
                    </button>
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
              <p className="text-sm font-bold text-brand-gold">Precision Batches</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">High-volume reliability</p>
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
              Looking for 100+ units for a specific project or retail need? We offer competitive tiered pricing and can integrate your own branding into our designs.
            </p>
            <a
              href="mailto:taraforgeindia@gmail.com"
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
