"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FAQSection } from "@/components/FAQSection";
import { trackCTA } from "@/lib/analytics";
import { homeServices } from "@/data/services";

export { FAQSection };

export function HeroClient({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="max-w-2xl text-center sm:text-left"
    >
      {children}
    </div>
  );
}

export function ServiceCards() {
  return (
    <section id="services" className="design-section border-b border-line">
      <div className="section-max-width design-container">
      <div className="mb-16">
        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Specialized <span className="celestial-gradient-text">Services</span></h2>
        <p className="mt-4 text-slate-400 font-light max-w-2xl">Precision printing solutions optimized for your specific project needs.</p>
      </div>
      <div 
        className="grid gap-6 sm:grid-cols-2"
      >
        {homeServices.map((item, i) => (
          <div
            key={i}
            className="design-card relative h-full flex flex-col p-8"
          >
            
            <header className="mb-8">
              <span className="design-service-name">
                {item.label}
              </span>
              <h3 className="design-accent mt-4">
                {item.title}
              </h3>
            </header>
            
            <p className="mb-8 text-pretty leading-relaxed">
              {item.body}
            </p>
            
            <div className="mt-auto flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-line">
              <Link 
                href="/services"
                onClick={() => trackCTA('learn_more_service', item.label)}
                className="design-link inline-flex min-h-11 items-center gap-2"
              >
                Learn More
                <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
              <span className="design-label">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

export function ShopHighlight() {
  return (
    <section className="design-section design-band border-y border-line">
      <div className="section-max-width design-container text-center">
        <div>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">The <span className="celestial-gradient-text">Stellar Collection</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-400 lg:text-lg text-center">
            Every artifact in our collection is crafted with intention. We don&apos;t just print; we optimize for beauty, strength, and a professional finish you&apos;ll love to hold.
          </p>
          <div className="mt-10">
            <a
              href="/shop"
              onClick={() => trackCTA('browse_shop_home', '/shop')}
              className="design-button design-secondary"
            >
              Preview the Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CoreValues() {
  const values = [
    {
      title: "Precision & Interaction",
      description: "Tight tolerances meet best-in-class support. We don't just ship parts; we solve problems.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: false
    },
    {
      title: "Environment Forward",
      description: "We minimize waste through optimized supports and active material recycling.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: true
    },
    {
      title: "Radical Transparency",
      description: "Open communication on lead times and technical constraints. No surprises, ever.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: false
    },
    {
      title: "Unwavering Accountability",
      description: "If a part isn't right, we fix it. We take full ownership of our print quality.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: false
    },
    {
      title: "Iterative Excellence",
      description: "Refining our craft with every project, constantly benchmarking the latest additive tech.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: false
    },
    {
      title: "Maker Spirit",
      description: "A maker's curiosity meets professional discipline. We love what we do.",
      icon: <span className="spark" aria-hidden="true" />,
      highlight: false
    }
  ];

  return (
    <section className="design-section design-band border-b border-line">
      <div className="section-max-width design-container relative">
      <div className="max-w-2xl mb-16">
        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Our <span className="celestial-gradient-text">Craft & Ethos</span></h2>
        <p className="mt-4 text-slate-400 font-light">The values that guide every layer we print and every partnership we build.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v, i) => (
          <div
            key={i}
            className="design-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {v.icon}
              </div>
              <h3 className="font-semibold text-brand-gold">{v.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-light">
              {v.description}
            </p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
