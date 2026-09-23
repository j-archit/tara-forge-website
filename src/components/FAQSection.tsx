"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { trackFAQInteraction } from "@/lib/analytics";
import { faqs } from "@/data/faqs";

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Schema.org FAQ Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="relative border-b border-slate-800/40 bg-slate-950/60 px-6 py-12 lg:px-4 lg:py-20">
      <div className="section-max-width">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? "border-brand-gold/40 bg-slate-900/40 shadow-[var(--brand-glow-gold)]" 
                    : "border-slate-800/60 bg-slate-900/20 hover:border-slate-700/80"
                }`}
              >
                <button
                  id={`faq-question-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => {
                    setOpenIndex(isOpen ? null : idx);
                    trackFAQInteraction(faq.question, isOpen ? 'close' : 'open');
                  }}
                  className="flex w-full items-center justify-between p-6 text-left group"
                >
                  <span className={`text-base font-medium transition-colors duration-300 ${isOpen ? "text-brand-gold" : "text-slate-100 group-hover:text-slate-50"}`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-all duration-300 ${isOpen ? "rotate-180 text-brand-gold" : "text-slate-500 group-hover:text-slate-300"}`} />
                </button>
                <motion.div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  aria-hidden={!isOpen}
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-sm leading-relaxed text-slate-400 font-light border-t border-brand-gold/10 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="order-1 lg:order-2 text-right">
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl leading-tight">
            Frequently Asked <span className="celestial-gradient-text">Questions</span>
          </h2>
          <p className="mt-6 text-slate-400 font-light max-w-lg leading-relaxed ml-auto">
            Everything you need to know about our boutique 3D printing process, materials and batch capabilities. Engineered for transparency.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
