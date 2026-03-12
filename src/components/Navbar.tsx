"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="forge-pill px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-100 shadow-[var(--celestial-glow-primary)]"
            aria-label="Tara Forge"
            title={`${current.text} (${current.label})`}
          >
            <span lang={current.lang} className="inline-block min-w-[5ch] transition-all duration-500">
              {current.text}
            </span>{" "}
            Forge
          </Link>
          <span className="hidden text-sm font-medium text-slate-400 sm:inline">
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
            className="rounded-full bg-slate-50 px-6 py-2 text-xs font-bold text-slate-900 shadow-[var(--celestial-glow-amber)] transition-all hover:scale-105 hover:bg-celestial-accent hover:text-slate-950 active:scale-95"
          >
            Get a quote
          </a>
        </nav>
      </div>
    </header>
  );
}
