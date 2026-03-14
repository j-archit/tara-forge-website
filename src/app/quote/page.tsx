import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IntakeForm } from "@/components/IntakeForm";
import { Sparkles, ShieldCheck, Clock, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Share your designs for a custom 3D print quote. We handle everything from personal keepsakes to community projects with care.",
};

export default function QuotePage() {
  return (
    <main className="relative flex min-h-screen flex-col selection:bg-brand-gold/20">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center overflow-hidden py-24 lg:py-32">
        <div className="section-max-width relative px-6 lg:px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            
            {/* Left Column: Context & Trust */}
            <div className="lg:sticky lg:top-32">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[var(--brand-glow-gold)]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold shadow-[var(--brand-glow-gold)]" />
                Precision Printing for Everyone
              </div>
              
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Bring your <span className="celestial-gradient-text">ideas to life</span>
              </h1>
              
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400 font-light">
                Whether it's a personal project, a community gift, or a custom component, we're here to help. Share your designs and we'll handle the rest.
              </p>

              <div className="mt-12 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
                    <Clock className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">Personalized Support</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">Receive a response within 24 hours with project feedback and a clear path forward.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
                    <ShieldCheck className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">Design Confidentiality</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">Your files are for production review only and never shared with external parties.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
                    <Zap className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">Attention to Detail</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">We optimize your design for the best finish and strength based on how you plan to use it.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 p-6 rounded-3xl border border-slate-800/40 bg-slate-900/20 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-full w-full rounded-full border-2 border-slate-900 bg-slate-800" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300">Join Over <span className="text-brand-gold font-bold">200+</span> Makers & Engineers</p>
                </div>
              </div>
            </div>

            {/* Right Column: The Form */}
            <div className="relative">
               <IntakeForm />
            </div>
            
          </div>
        </div>

        {/* Background Visual Components */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      <Footer />
    </main>
  );
}
