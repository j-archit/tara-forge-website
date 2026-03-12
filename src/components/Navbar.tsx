"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function Navbar() {
  const pathname = usePathname();
  const scripts: Array<{ text: string; lang: string; label: string }> = [
    { text: "Tara", lang: "en", label: "Latin" },
    { text: "तारा", lang: "hi", label: "Devanagari" },
    { text: "তারা", lang: "bn", label: "Bangla" },
    { text: "તારા", lang: "gu", label: "Gujarati" },
    { text: "ତାରା", lang: "or", label: "Odia" },
    { text: "ਤਾੜਾ", lang: "pa", label: "Gurmukhi" },
    { text: "తారా", lang: "te", label: "Telugu" },
    { text: "ತಾರಾ", lang: "kn", label: "Kannada" },
  ];

  const [scriptIndex, setScriptIndex] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const interval = window.setInterval(() => {
      setScriptIndex((prev) => (prev + 1) % scripts.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [scripts.length]);

  const current = scripts[scriptIndex] ?? scripts[0]!;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-2xl">
      <div className="section-max-width flex items-center justify-between px-6 py-5 lg:px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform hover:scale-105"
            aria-label="Tara Forge"
          >
            <Logo size={42} className="drop-shadow-[var(--brand-glow-gold)]" />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold uppercase tracking-[0.25em] text-slate-100 leading-none">
                <span lang={current.lang} className="inline-block min-w-[5ch] transition-all duration-500">
                  {current.text}
                </span>
              </span>
              <span className="text-[14px] font-bold uppercase tracking-[0.25em] text-brand-gold leading-none mt-1">
                Forge
              </span>
            </div>
          </Link>
          <span className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:inline ml-2 border-l border-slate-800 pl-4 py-1">
            Forged in the stars
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 sm:flex">
          <Link 
            href="/#services" 
            className={`hover:text-celestial-accent transition-colors ${pathname === '/' ? 'text-slate-300' : ''}`}
          >
            Services
          </Link>
          <Link 
            href="/gallery" 
            className={`hover:text-celestial-accent transition-colors ${pathname === '/gallery' ? 'text-celestial-accent' : ''}`}
          >
            Gallery
          </Link>
          <Link 
            href="/#about" 
            className="hover:text-celestial-accent transition-colors"
          >
            Why Tara
          </Link>
          <a
            href="mailto:taraforgeindia@gmail.com"
            className="rounded-full bg-brand-gold px-6 py-2 text-xs font-bold text-slate-950 shadow-[var(--brand-glow-gold)] transition-all hover:scale-105 hover:bg-brand-gold-bright active:scale-95"
          >
            Get a quote
          </a>
        </nav>
      </div>
    </header>
  );
}
