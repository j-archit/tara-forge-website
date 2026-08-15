"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";
import { trackProductInterest, trackCTA } from "@/lib/analytics";
import type { StoreItem } from "@/lib/admin-api";

const fallbackProducts: StoreItem[] = [
  {
    id: "tf-desk-organizer",
    title: "Minimalist Desk Set",
    category: "Living",
    description: "A geometric 3-piece set for your workspace. Designed for modularity and a clean aesthetic finish.",
    pricePaise: 124900,
    currency: "₹",
    gradient: "from-blue-900/40 via-slate-900 to-slate-950",
    accent: "rgba(56, 189, 248, 0.4)",
    badge: "Popular", imageUrl: null, published: true, available: false, sortOrder: 0,
  },
  {
    id: "tf-planter-stellar",
    title: "Celestial Planter",
    category: "Living",
    description: "Self-watering geometric planter with a celestial pattern. Durable PETG construction for indoor/outdoor use.",
    pricePaise: 89900,
    currency: "₹",
    gradient: "from-purple-900/40 via-slate-900 to-slate-950",
    accent: "rgba(168, 85, 247, 0.4)", badge: null, imageUrl: null, published: true, available: false, sortOrder: 1,
  },
  {
    id: "tf-lamp-nebula",
    title: "Nebula Ambient Lamp",
    category: "Decor",
    description: "Lithophane-style light cover that projects cosmic shadows. Includes custom base and LED fitting.",
    pricePaise: 249900,
    currency: "₹",
    gradient: "from-amber-900/40 via-slate-900 to-slate-950",
    accent: "rgba(251, 191, 36, 0.4)",
    badge: "Premium", imageUrl: null, published: true, available: false, sortOrder: 2,
  },
  {
    id: "tf-keycap-forge",
    title: "Forge Edition Keycaps",
    category: "Customs",
    description: "Set of 4 artisan keycaps featuring the TaraForge3D logo. High-detail precision prints for mechanical keyboards.",
    pricePaise: 59900,
    currency: "₹",
    gradient: "from-emerald-900/40 via-slate-900 to-slate-950",
    accent: "rgba(16, 185, 129, 0.4)", badge: null, imageUrl: null, published: true, available: false, sortOrder: 3,
  },
  {
    id: "tf-headphone-stand",
    title: "Aero Headphone Stand",
    category: "Living",
    description: "Ergonomic stand designed for weight balance and minimalistic profile. Printed in reinforced PLA.",
    pricePaise: 159900,
    currency: "₹",
    gradient: "from-rose-900/40 via-slate-900 to-slate-950",
    accent: "rgba(244, 63, 94, 0.4)", badge: null, imageUrl: null, published: true, available: false, sortOrder: 4,
  },
  {
    id: "tf-swatch-pack",
    title: "Material Swatch Pack",
    category: "Makers",
    description: "Complete set of 12 material swatches including PLA, PETG, and Specialty filaments for tactile review.",
    pricePaise: 45000,
    currency: "₹",
    gradient: "from-slate-800 via-slate-900 to-slate-950",
    accent: "rgba(148, 163, 184, 0.4)",
    badge: "Sample Kit", imageUrl: null, published: true, available: false, sortOrder: 5,
  }
];

export default function ShopClient() {
  const [products, setProducts] = React.useState(fallbackProducts);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content/store", { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<StoreItem[]> : Promise.reject())
      .then(setProducts)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const handleCheckout = (product: StoreItem) => {
    const price = product.pricePaise / 100;
    console.log(`Starting checkout for: ${product.title} (ID: ${product.id})`);
    trackProductInterest(product.id, product.title, price, product.available ? 'buy_click' : 'inquiry_click');
    
    const subject = encodeURIComponent(`Order Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hello TaraForge3D,\n\nI am interested in purchasing the ${product.title} (SKU: ${product.id}).\n\nPlease let me know the shipping process.\n\nThank you!`);
    window.location.assign(`mailto:taraforge3d@gmail.com?subject=${subject}&body=${body}`);
  };

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
                {products.some((product) => product.available) ? "Now Open" : "Coming Soon"}
              </span>
            </h1>
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
                <div className={`relative aspect-square overflow-hidden bg-gradient-to-br bg-cover bg-center ${product.gradient}`} style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}>
                  <div 
                    className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-70"
                    style={{ background: `radial-gradient(circle at center, ${product.accent}, transparent 70%)` }}
                  />
                  {product.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-brand-gold/90 px-3 py-1 text-[10px] font-bold text-slate-950 shadow-[var(--brand-glow-gold)]">
                      {product.badge}
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
                      {product.currency}{(product.pricePaise / 100).toLocaleString()}
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
                      {product.available ? "Buy Now" : "Enquire"}
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
              href="mailto:taraforge3d@gmail.com"
              onClick={() => trackCTA('request_batch_quote', 'mailto:taraforge3d@gmail.com')}
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
