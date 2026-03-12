"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn, staggerChildren } from "@/lib/animations";

interface Product {
  id: string | number;
  title: string;
  category: string;
  description: string;
  price: number; // Numeric for calculation
  currency: string;
  imageGradient: string;
  accent: string;
  tag?: string;
  shopifyVariantId?: string; // Placeholder for Shopify
  razorpayPlanId?: string;    // Placeholder for Razorpay
}

const products: Product[] = [
  {
    id: "moon-lamp-01",
    title: "Celestial Moon Lamp",
    category: "Home Decor",
    description: "A lithophane moon lamp with incredible surface detail, printed in high-resolution starlight white PLA.",
    price: 1499,
    currency: "₹",
    imageGradient: "from-blue-900/40 via-slate-900 to-slate-950",
    accent: "rgba(56, 189, 248, 0.4)",
    tag: "Best Seller",
    shopifyVariantId: "gid://shopify/ProductVariant/123456789"
  },
  {
    id: "void-dragon-02",
    title: "Articulated Void Dragon",
    category: "Collectibles",
    description: "A fully flexible, 3D-printed dragon with shimmering silk finish. Perfect for desk therapy.",
    price: 899,
    currency: "₹",
    imageGradient: "from-purple-900/40 via-slate-900 to-slate-950",
    accent: "rgba(168, 85, 247, 0.4)",
    tag: "New Arrival"
  },
  {
    id: "dice-tower-03",
    title: "Starforge Dice Tower",
    category: "Tabletop",
    description: "Roll your fate through a twisting tower inspired by orbital mechanics. Durable and satisfying sound.",
    price: 1249,
    currency: "₹",
    imageGradient: "from-amber-900/40 via-slate-900 to-slate-950",
    accent: "rgba(251, 191, 36, 0.4)",
    tag: "Functional"
  },
  {
    id: "desk-orbit-04",
    title: "Modular Desk Orbit",
    category: "Functional",
    description: "A sleek, stackable organizer for makers. Keep your nozzles, SD cards, and tools in a gravitational lock.",
    price: 699,
    currency: "₹",
    imageGradient: "from-emerald-900/40 via-slate-900 to-slate-950",
    accent: "rgba(16, 185, 129, 0.4)",
    tag: "Maker Essential"
  },
  {
    id: "nebula-planter-05",
    title: "Nebula Planter",
    category: "Home Decor",
    description: "A futuristic self-watering planter with a dual-tone aesthetic. Designed for oxygen and style.",
    price: 1099,
    currency: "₹",
    imageGradient: "from-rose-900/40 via-slate-900 to-slate-950",
    accent: "rgba(244, 63, 94, 0.4)",
    tag: "Eco-Friendly"
  },
  {
    id: "keychain-pack-06",
    title: "Forge-Link Keychain",
    category: "Accessories",
    description: "A Batch of 10 high-strength PETG keychains. Rugged, light, and forged to last.",
    price: 450,
    currency: "₹",
    imageGradient: "from-slate-800 via-slate-900 to-slate-950",
    accent: "rgba(148, 163, 184, 0.4)",
    tag: "Fleet Pack"
  }
];

export default function ShopPage() {
  const handleCheckout = (product: Product) => {
    // LOGIC FOR FUTURE INTEGRATION:
    // 1. For Shopify: Use the shopifyVariantId to create a checkout session or add to cart.
    // 2. For Razorpay: Use the price to create a Razorpay Order ID via your backend,
    //    then open the Razorpay Checkout modal.
    
    console.log(`Starting checkout for: ${product.title} (ID: ${product.id})`);
    
    // Fallback: Open mailto for manual ordering until integration is live
    const subject = encodeURIComponent(`Order Inquiry: ${product.title}`);
    const body = encodeURIComponent(`Hello Tara Forge,\n\nI am interested in purchasing the ${product.title} (SKU: ${product.id}).\n\nPlease let me know the shipping process.\n\nThank you!`);
    window.location.href = `mailto:taraforgeindia@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-950/80 via-slate-950 to-slate-950/95 text-slate-50">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <Logo size={64} className="drop-shadow-[var(--brand-glow-gold)]" />
              <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl text-center sm:text-left">
                The <span className="celestial-gradient-text">Shop</span>
              </h1>
            </div>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Own a piece of the stars. Every item in our shop is designed in-house and 3D printed with the same precision we apply to industrial prototypes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 sm:py-16">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div 
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            {...staggerChildren}
          >
            {products.map((product) => (
              <motion.article 
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 transition-all hover:border-brand-gold/50 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.5)]"
              >
                {/* Product Image Placeholder */}
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

                {/* Content */}
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
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-slate-800/60 bg-slate-950/40 py-12">
        <div className="section-max-width px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-200">Precision Batches</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">High-volume reliability</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-slate-200">Custom Finishes</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Hand-inspected quality</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-slate-200">Secure Packaging</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Stellar protection</p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-sm font-bold text-slate-200">Pan-India Shipping</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">From the forge to you</p>
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
            <h2 className="text-3xl font-semibold text-slate-50 mb-4">Volume Partnerships & Fleet Orders</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">
              Looking for 100+ units for a gala, corporate mission, or retail? We offer specialized tiered pricing and can master-forge your own branding into our designs.
            </p>
            <a
              href="mailto:taraforgeindia@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-10 py-4 text-sm font-bold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-105 active:scale-95"
            >
              Request Fleet Quote
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
