"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Where is Tara Forge located?",
    answer: "We are a boutique 3D printing studio operating across Mumbai and Bangalore, serving creators and engineers across India with high-quality custom prints."
  },
  {
    question: "What materials do you print with?",
    answer: "We focus on high-reliability materials: PLA for high-detail prototypes and PETG for functional parts that require better heat resistance and durability."
  },
  {
    question: "Do you offer small-batch manufacturing?",
    answer: "Yes. We specialize in custom series and small batches (typically 1–100 units). We optimize our production process for consistency across every unit in your batch."
  },
  {
    question: "How do I get a quote for my 3D printing project?",
    answer: "Simply send your 3D design file (.stl, .obj, or .step) to taraforgeindia@gmail.com. We review every model for printability and provide a quote based on material, volume, and complexity."
  },
  {
    question: "Can you help optimize my design for 3D printing?",
    answer: "Absolutely. We provide process advisory to ensure your part is successful—adjusting wall thicknesses, supports, and orientation to deliver the best possible result."
  }
];

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
    <section id="faq" className="section-max-width px-6 py-20 lg:px-4 lg:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">Common Inquiries</h2>
          <p className="mt-6 text-slate-400 font-light max-w-lg leading-relaxed">
            Everything you need to know about our boutique 3D printing process, materials, and batch capabilities. Engineered for transparency.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/20 transition-all hover:border-slate-700/80"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-base font-medium text-slate-100">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-sm leading-relaxed text-slate-400 font-light border-t border-slate-800/40 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
