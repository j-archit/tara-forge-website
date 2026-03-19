"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, MessageSquare, Copy, Check } from "lucide-react";

export function ManualIntake() {
  const [copied, setCopied] = React.useState(false);
  const email = "taraforgeindia@gmail.com";

  const copyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <a 
                href={`mailto:${email}?subject=New Project Quote Request&body=Hi TaraForge3D Team,%0D%0AI have a project I'd like to get a quote for.%0D%0A%0D%0A(Attach STL/OBJ files to this email)`}
                className="flex-[3] inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-sm font-semibold text-slate-950 shadow-[var(--brand-glow-gold)] transition hover:bg-brand-gold-bright active:scale-95"
              >
                Send Email
                <Zap className="w-3.5 h-3.5 fill-current" />
              </a>
              <button 
                onClick={copyEmail}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-gold/50 hover:bg-slate-800 active:scale-95 group"
                title="Copy email address"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-brand-gold transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <a 
              href="https://wa.me/917042337788?text=Hi TaraForge3D, I'd like to get a quote for a 3D printing project!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-gold/50 hover:bg-slate-800 active:scale-[0.98]"
            >
              WhatsApp Us
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[10px] text-slate-500 italic">Usual response: ~2-4 hours via WhatsApp </p>
        </div>
      </div>
    </div>
  );
}
