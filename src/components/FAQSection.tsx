"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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
    <section id="faq" className="design-section relative border-b border-line">
      <div className="section-max-width design-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <details
                key={idx}
                name="studio-faq"
                className="design-faq"
                onToggle={(event) => {
                  const opened = event.currentTarget.open;
                  setOpenIndex(previous => opened ? idx : previous === idx ? null : previous);
                  trackFAQInteraction(faq.question, opened ? 'open' : 'close');
                }}
              >
                <summary
                  id={`faq-question-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="text-left"
                >
                  <span>
                    {faq.question}
                  </span>
                  <Plus aria-hidden="true" className="h-5 w-5" />
                </summary>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  aria-hidden={!isOpen}
                  className="design-faq-answer"
                >
                  <div>
                    {faq.answer}
                  </div>
                </div>
              </details>
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
