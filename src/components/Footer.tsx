"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { Mail, Instagram, Twitter, MoveUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: "Services", href: "/services" },
      { label: "Gallery", href: "/gallery" },
      { label: "Shop", href: "/shop" },
      { label: "Team", href: "/team" },
      { label: "Why TaraForge3D", href: "/#about" },
    ],
    connect: [
      { label: "Email", href: "mailto:taraforgeindia@gmail.com", icon: <Mail className="w-3.5 h-3.5" /> },
      { label: "Instagram", href: "#", icon: <Instagram className="w-3.5 h-3.5" /> },
      { label: "Twitter", href: "#", icon: <Twitter className="w-3.5 h-3.5" /> },
    ]
  };

  return (
    <footer
      id="contact"
      className="relative border-t border-slate-800/60 bg-slate-950/40 py-20 backdrop-blur-md overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-gold/5 blur-[100px]" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="section-max-width px-6 lg:px-4">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <Logo size={64} className="drop-shadow-[var(--brand-glow-gold)]" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-brand-gold">
                  TaraForge3D
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500 tracking-wider">
                  Your Idea, in 3D ✶
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400 font-light">
              A 3D printing studio for everyone—from complex prototypes to custom keepsakes. We help you bring your ideas to life with high-detail prints and a personal touch.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold/80 mb-6">
              Explore
            </h3>
            <ul className="space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="group flex items-center text-sm text-slate-400 hover:text-brand-gold transition-colors"
                  >
                    <span>{link.label}</span>
                    <MoveUpRight className="ml-1 w-2.5 h-2.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold/80 mb-6">
              Connect
            </h3>
            <ul className="space-y-4">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-800/40 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 font-light">
            © {currentYear} TaraForge3D. Crafted in India.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            <span className="hover:text-slate-400 cursor-default transition-colors">Privacy</span>
            <span className="hover:text-slate-400 cursor-default transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
