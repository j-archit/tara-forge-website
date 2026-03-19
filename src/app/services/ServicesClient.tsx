"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { fadeIn } from "@/lib/animations";
import { 
  Zap, 
  Settings, 
  Layers, 
  Brush, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Timer
} from "lucide-react";
import Link from "next/link";

const detailedServices = [
  {
    id: "prototyping",
    label: "Rapid Prototyping",
    title: "Iterate Fast. Hold it in your hands.",
    description: "Turn your digital concepts into physical reality overnight.",
    features: [
      "24-48 hour typical turnaround",
      "Multiple iteration cycles supported",
      "Fit-check and assembly validation",
      "Precision layer heights (0.12mm - 0.28mm)",
      "Process advisory & printability review"
    ],
    icon: Timer,
    gradient: "from-blue-600/20 to-indigo-600/20",
    accent: "text-blue-400"
  },
  {
    id: "parts",
    label: "Custom Functional Parts",
    title: "Build what you need. Parts that just work.",
    description: "Performance-oriented prints designed for real-world mechanical durability.",
    features: [
      "Performance materials: PETG, PLA+",
      "Optimized print orientation for strength",
      "High-density infill for mechanical integrity",
      "Chemical and heat resistant options",
      "Reinforced wall & shell structures"
    ],
    icon: Settings,
    gradient: "from-emerald-600/20 to-teal-600/20",
    accent: "text-emerald-400"
  },
  {
    id: "batching",
    label: "Component Batching",
    title: "Go Beyond One-Offs. Reliable Manufacturing.",
    description: "Bridge the gap between prototyping and mass-injection molding.",
    features: [
      "Tiered pricing for volume orders",
      "Strict quality control across the batch",
      "Custom branding integration",
      "Repeatable manufacturing accuracy",
      "India-wide shipping & fulfillment"
    ],
    icon: Layers,
    gradient: "from-amber-600/20 to-orange-600/20",
    accent: "text-amber-400"
  },
  {
    id: "artistic",
    label: "Artistic & Giftables",
    title: "Detail in every layer. Craft the otherworldly.",
    description: "High-resolution prints with a focus on visual excellence and premium finishes.",
    features: [
      "Ultra-fine resolution options",
      "Manual post-processing and cleanup",
      "Specialty aesthetic filaments",
      "Custom display bases and assemblies",
      "Premium textures & silk finishes"
    ],
    icon: Brush,
    gradient: "from-purple-600/20 to-pink-600/20",
    accent: "text-purple-400"
  }
];

const processSteps = [
  {
    step: "01",
    title: "Upload & Consult",
    body: "Send us your .STL or .STEP files. We review every model for printability and strength requirements."
  },
  {
    step: "02",
    title: "Optimization",
    body: "We adjust orientation, supports, and material settings to ensure your part is built for success."
  },
  {
    step: "03",
    title: "Precision Print",
    body: "Your project is queued on our professionally calibrated fleet using premium-grade materials."
  },
  {
    step: "04",
    title: "Final Inspection",
    body: "Every part is hand-checked for accuracy and shipped securely to your doorstep."
  }
];

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
              From individual makers to engineering teams, we provide a bridge between digital design and physical reality through high-precision 3D manufacturing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detailed List */}
      {detailedServices.map((service, idx) => (
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
                    <service.icon className={`w-16 h-16 ${service.accent}`} />
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
      ))}

      {/* Process Section - More targeted to general users */}
      <section className="py-16 border-y border-white/5 bg-slate-950/60">
        <div className="section-max-width px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-semibold mb-4">Our <span className="celestial-gradient-text">Streamlined Process</span></h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">How we transform your idea into a physical product, explained step-by-step.</p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div key={step.step} className="relative group">
                <span className="text-5xl font-bold text-white/5 absolute -top-8 -left-2 transition-colors group-hover:text-brand-gold/10">
                  {step.step}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
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
