"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const scripts = React.useMemo(() => [
    { text: "Tara", lang: "en", label: "Latin" },
    { text: "तारा", lang: "hi", label: "Devanagari" },
    { text: "তারা", lang: "bn", label: "Bengali" },
    { text: "তৰা", lang: "as", label: "Assamese" },
    { text: "તારા", lang: "gu", label: "Gujarati" },
    { text: "ତାରା", lang: "or", label: "Odia" },
    { text: "ਤਾਰਾ", lang: "pa", label: "Gurmukhi" },
    { text: "తారా", lang: "te", label: "Telugu" },
    { text: "ತಾರಾ", lang: "kn", label: "Kannada" },
    { text: "தாரா", lang: "ta", label: "Tamil" },
    { text: "താര", lang: "ml", label: "Malayalam" },
    { text: "تارا", lang: "ur", label: "Perso-Arabic" },
    { text: "ꯇꯥꯔꯥ", lang: "mni", label: "Meetei Mayek" },
    { text: "ᱛᱟᱨᱟ", lang: "sat", label: "Ol Chiki" },
  ], []);

  const navLinks = React.useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/shop", label: "Shop" },
    { href: "/#about", label: "Why TaraForge3D" },
  ], []);

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
      <div className="section-max-width flex items-center justify-between px-6 py-4 lg:px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform hover:scale-105"
            aria-label="TaraForge3D"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Logo size={40} className="drop-shadow-[var(--brand-glow-gold)] sm:size-[42px]" />
            <div className="flex flex-col">
              <span className="text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.25em] text-slate-100 leading-none">
                <span lang={current.lang} className="inline-block min-w-[5ch] transition-all duration-500">
                  {current.text}
                </span>
              </span>
              <span className="text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.25em] text-brand-gold leading-none mt-1">
                Forge3D
              </span>
            </div>
          </Link>
          <span className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:inline ml-2 border-l border-slate-800 pl-4 py-1">
            Your Idea, in 3D
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`hover:text-celestial-accent transition-colors ${pathname === link.href ? 'text-celestial-accent' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="rounded-full bg-brand-gold px-6 py-2 text-xs font-bold text-slate-950 shadow-[var(--brand-glow-gold)] transition-all hover:scale-105 hover:bg-brand-gold-bright active:scale-95"
          >
            Get a quote
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className={`group flex h-11 w-11 items-center justify-center rounded-full border border-slate-700/50 bg-slate-900/60 text-slate-100 shadow-xl backdrop-blur-md transition-all duration-300 md:hidden hover:scale-105 active:scale-95 ${isMobileMenuOpen ? "bg-brand-gold border-brand-gold/40 text-slate-950" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full border-b border-slate-800 bg-slate-950/95 p-6 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col items-center gap-6 text-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`text-lg font-medium transition-colors ${pathname === link.href ? 'text-brand-gold' : 'text-slate-300'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="w-full pt-4 border-t border-slate-800">
                <Link
                  href="/quote"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-gold py-4 text-sm font-bold text-slate-950 shadow-[var(--brand-glow-gold)]"
                >
                  Get a quote
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
