import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IntakeForm } from "@/components/IntakeForm";
import { ShieldCheck, Clock, Zap, MessageSquare } from "lucide-react";
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
              <div className="flex items-center gap-3 mb-6 group justify-start">
                <span className="h-px w-10 bg-brand-gold/50" />
                <span className="text-sm font-bold uppercase tracking-[0.4em] text-brand-gold">
                  Precision Printing for Everyone
                </span>
                <span className="h-px w-10 bg-brand-gold/50" />
              </div>
              
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Bring your <span className="celestial-gradient-text">ideas to life</span>
              </h1>
              
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-400 font-light">
                Whether it&apos;s a personal project, a community gift, or a custom component, we&apos;re here to help. Share your designs and we&apos;ll handle the rest.
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

            {/* Right Column: The Placeholder Form */}
            <div className="relative">
              {/* Greyed out existing form */}
              <div className="opacity-50 pointer-events-none filter blur-[1px] grayscale">
                <IntakeForm />
              </div>

              {/* Status Message Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/10 border border-brand-gold/20 mb-6">
                    <Clock className="w-6 h-6 text-brand-gold animate-pulse" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-slate-50 mb-3">Intake Portal <span className="text-brand-gold">Coming Soon</span></h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    We&apos;re putting final polish on our automated design review system. In the meantime, we are accepting project requests manually.
                  </p>

                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-gold/60">Ready to quote now?</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a 
                        href="mailto:taraforgeindia@gmail.com?subject=New Project Quote Request&body=Hi TaraForge3D Team,%0D%0AI have a project I'd like to get a quote for.%0D%0A%0D%0A(Attach STL/OBJ files to this email)"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-sm font-semibold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright hover:scale-[1.02]"
                      >
                        Email
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </a>
                      <a 
                        href="https://wa.me/917042337788?text=Hi TaraForge3D, I'd like to get a quote for a 3D printing project!"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-gold/50 hover:bg-slate-800 hover:scale-[1.02]"
                      >
                        WhatsApp
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Usual response: ~2-4 hours via WhatsApp </p>
                  </div>
                </div>
              </div>
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
