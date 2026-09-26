"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { trackProductInterest, trackCTA } from "@/lib/analytics";
import { products } from "@/data/products";
import { CONTACT, SHOP_NOTICE } from "@/data/siteContent";
import { productInquiryHref } from "@/lib/contact";

export default function ShopClient() {
  return (
    <main className="design-page relative flex min-h-screen flex-col">
      <Navbar />

      {/* Header */}
      <section className="design-section relative overflow-hidden">
        <div className="section-max-width design-container">
          <div>
            <h1 className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl mb-8">
              The <span className="celestial-gradient-text">Shop</span>
              <span className="design-label rounded-full border border-line px-4 py-2">
                Coming Soon
              </span>
            </h1>
            <p className="max-w-2xl text-pretty text-base text-slate-300 text-center sm:text-left">
              Preview our upcoming collection. {SHOP_NOTICE}
            </p>
            <p className="mt-3 text-center text-sm sm:text-left">
              <Link href="/shipping-returns" className="design-link inline-flex min-h-11 items-center underline">Read our shipping and returns policy</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="design-section design-band">
        <div className="section-max-width design-container">
          {products.length === 0 && <p className="text-slate-300">New products will be shared here soon.</p>}
          <div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <article
                key={product.id}
                className="design-card design-product relative flex flex-col overflow-hidden"
              >
                <div className={`design-product-image relative aspect-square overflow-hidden ${product.image ? "bg-night" : "design-placeholder"}`}>
                  {product.tag && (
                    <span className="design-label absolute left-4 top-4 z-10 rounded-full border border-line bg-raised px-3 py-1">
                      {product.tag}
                    </span>
                  )}
                  {product.image ? (
                    <Image src={product.image.src} alt={product.image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={product.image.fit === "cover" ? "object-cover" : "object-contain"} />
                  ) : <div className="absolute inset-0 flex items-center justify-center opacity-15">
                    <Logo size={120} />
                  </div>}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="design-label break-words">
                      {product.category}
                    </span>
                    <span className="design-price">
                      Indicative: {product.currency}{product.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="break-words">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed break-words">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <a
                      href={productInquiryHref(product)}
                      onClick={() => trackProductInterest(product.id, product.title, product.price, 'inquiry_click')}
                      className="design-button design-secondary w-full text-center"
                    >
                      Ask About Availability
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="design-section border-y border-line">
        <div className="section-max-width design-container">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-sm font-bold text-brand-gold">Custom Batches</p>
              <p className="design-label mt-1">Quantity confirmed in quote</p>
            </div>
            <div className="text-center border-l border-line">
              <p className="text-sm font-bold text-brand-gold">Custom Finishes</p>
              <p className="design-label mt-1">Hand-inspected quality</p>
            </div>
            <div className="text-center border-l border-line">
              <p className="text-sm font-bold text-brand-gold">Secure Packaging</p>
              <p className="design-label mt-1">Stellar protection</p>
            </div>
            <div className="text-center border-l border-line">
              <p className="text-sm font-bold text-brand-gold">Pan-India Shipping</p>
              <p className="design-label mt-1">Direct from Bangalore to all India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Inquiry CTA */}
      <section className="design-section">
        <div className="section-max-width design-container text-center">
          <div
            className="design-card max-w-3xl mx-auto p-8 sm:p-12"
          >
            <h2 className="text-3xl font-semibold text-slate-50 mb-4">Bulk Orders & Custom Series</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">
              Planning a repeat run for a project or retail need? Tell us the quantity and requirements so we can quote the price, production time, and any custom branding.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              onClick={() => trackCTA('request_batch_quote', `mailto:${CONTACT.email}`)}
              className="design-button design-primary"
            >
              Request Batch Quote
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
