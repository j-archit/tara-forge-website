"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";
import { 
  Settings, 
  Layers, 
  Brush, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Timer
} from "lucide-react";
import Link from "next/link";
import { detailedServices, type ServiceIcon } from "@/data/services";
import { CUSTOMER_JOURNEY, PRODUCTION_TIMING } from "@/data/siteContent";

const serviceIcons: Record<ServiceIcon, typeof Timer> = {
  timer: Timer,
  settings: Settings,
  layers: Layers,
  brush: Brush,
};

export default function ServicesClient() {
  return (
    <main className="relative flex min-h-screen flex-col text-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-20 bg-slate-950/20">
        <div className="section-max-width px-6 lg:px-4">
          <motion.div {...fadeIn(0.05)} className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl mb-6">
              Specialized <span className="celestial-gradient-text">Capabilities</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-light">
              Bridging the gap between digital design and physical reality through high-precision 3D printing, for any need
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detailed List */}
      {detailedServices.map((service, idx) => {
        const ServiceIcon = serviceIcons[service.icon];
        return (
        <section 
          key={service.id} 
          className={`py-8 lg:py-12 border-b border-white/5 ${idx % 2 === 1 ? 'bg-slate-950/60' : 'bg-slate-950/20'}`}
        >
          <div className="section-max-width px-6 lg:px-4">
            <motion.div 
              {...fadeIn(0.1)}
              className={`flex flex-col gap-12 lg:flex-row lg:items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Visual Representation (Icon + Gradient) */}
              <div className="flex-1">
                <div className={`relative aspect-square max-w-sm mx-auto overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br ${service.gradient} flex items-center justify-center group`}>
                  <div className="p-8 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 transition-transform duration-500 group-hover:scale-110 shadow-2xl">
                    <ServiceIcon className={`w-16 h-16 ${service.accent}`} />
                  </div>
                  {/* Subtle Brand Logo Watermark */}
                  <div className="absolute bottom-6 right-6 opacity-10">
                    <Logo size={80} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-[0.2em] ${service.accent}`}>
                    {service.label}
                  </span>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-50 uppercase tracking-tight">
                    {service.title.split('. ').map((part, i, arr) => (
                      <span key={i} className="block">
                        {part}{i < arr.length - 1 ? '.' : ''}
                      </span>
                    ))}
                  </h2>
                </div>
                
                <p className="text-base text-slate-400 leading-relaxed font-light">
                  {service.description}
                </p>

                <ul className="grid gap-4 sm:grid-cols-2">
                  {service.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${service.accent}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link 
                    href="/quote"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gold hover:text-brand-gold-bright transition-colors group"
                  >
                    Start your {service.label.toLowerCase()} project
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        );
      })}

      {/* Process Section - More targeted to general users */}
      <section className="py-16 border-y border-white/5 bg-slate-950/60">
        <div className="section-max-width px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-semibold mb-4">Our <span className="celestial-gradient-text">Streamlined Process</span></h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">How we transform your idea into a physical product, explained step-by-step.</p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {CUSTOMER_JOURNEY.map((step) => (
              <div key={step.number} className="relative group">
                <span className="text-5xl font-bold text-white/5 absolute -top-8 -left-2 transition-colors group-hover:text-brand-gold/10">
                  {step.number}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-sm leading-relaxed text-slate-400">{PRODUCTION_TIMING}</p>
        </div>
      </section>

      {/* Final Capabilities Bar */}
      <section className="py-16 bg-slate-950/30">
        <div className="section-max-width px-6">
          <div className="glass-surface p-12 rounded-[2rem] border-white/5 text-center">
             <ShieldCheck className="w-12 h-12 text-brand-gold mx-auto mb-6" />
             <h3 className="text-2xl font-semibold mb-4">Material Guarantee</h3>
             <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed mb-8">
               We use only professionally sourced filaments—PLA for high-detail aesthetics and PETG for rugged industrial parts. Every print is manually inspected and hand-finished to ensure it meets our standards for precision and surface quality before shipping.
             </p>
             <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <span className="px-4 py-2 rounded-full border border-white/5">PLA+ Precision</span>
               <span className="px-4 py-2 rounded-full border border-white/5">Industrial PETG</span>
               <span className="px-4 py-2 rounded-full border border-white/5">High-Stiffness PETG</span>
               <span className="px-4 py-2 rounded-full border border-white/5">Ultra-Fine Detail</span>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
