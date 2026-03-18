"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";
import { Cpu, Microchip as Chip, Rocket, Mail, Globe } from "lucide-react";

export function TeamClient() {
  return (
    <main className="relative flex min-h-screen flex-col selection:bg-brand-gold/20">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-20">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)} className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 group justify-center sm:justify-start">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-gold/50" />
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-gold">
                  Our Collective
                </span>
                <span className="h-px w-10 bg-brand-gold/50" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-7xl">
              The <span className="celestial-gradient-text">Team</span> <br className="hidden sm:block" />
              Behind the Forge
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 font-light mx-auto sm:mx-0">
              Meet the makers and engineers bringing a new precision to the world of additive manufacturing. 
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="pb-24 sm:pb-32">
        <div className="section-max-width px-6 lg:px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            
            {/* Founder Card */}
            <motion.div 
              {...fadeIn(0.1)}
              className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 transition-all hover:border-brand-gold/30 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                
                {/* Image Placeholder */}
                <div className="relative shrink-0">
                  <div className="h-48 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-800 group-hover:border-brand-gold/40 transition-all duration-500 shadow-2xl flex items-center justify-center">
                    <div className="text-slate-700 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Logo size={120} />
                    </div>
                    {/* Placeholder indicator */}
                    <div className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-brand-gold blur-[2px] animate-pulse" />
                  </div>
                  <div className="absolute -inset-4 bg-brand-gold/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1">
                  <header>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 px-2 py-0.5">
                      <Rocket className="h-3 w-3 text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                        Founder
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-50 mb-1">Archit</h2>
                    <p className="text-sm font-medium text-slate-400">Electronics Engineer</p>
                  </header>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300 font-light">
                    Electronics Engineer by Profession - in the semiconductor industry. Avid embedded systems enthusiast with a passion for precise manufacturing and technical excellence.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 group/link cursor-default">
                        <Chip className="w-4 h-4 text-brand-gold" />
                        <span>Hardware Engineering</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 group/link cursor-default">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span>Embedded Systems</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-gold/5 blur-[40px] pointer-events-none" />
            </motion.div>

            {/* Ethos/Mission Column */}
            <motion.div 
              {...fadeIn(0.2)}
              className="flex flex-col justify-center"
            >
              <h3 className="text-xl font-semibold text-slate-50 mb-4">Our Vision</h3>
              <p className="text-slate-400 font-light leading-relaxed mb-8">
                TaraForge3D was born from a desire to bridge the gap between hobbyist tinkering and industrial quality. We believe that professional-grade 3D printing should be accessible to anyone with an idea.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold mb-2">Technical Rigor</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Applying an engineer's attention to detail to every print and prototype we forge.</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold mb-2">Open Access</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">From students to engineers, we offer the same path to high-end additive manufacturing.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
      
      {/* Background Visual Components */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[1000px] h-[1000px] bg-brand-gold/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
    </main>
  );
}
