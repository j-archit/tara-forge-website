"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MessageSquare, MoveUpRight } from "lucide-react";
import { trackNavigation, trackSocialClick } from "@/lib/analytics";
import { CONTACT } from "@/data/siteContent";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: "Services", href: "/services" },
      { label: "Gallery", href: "/gallery" },
      { label: "Shop", href: "/shop" },
      { label: "Team", href: "/team" },
      { label: "Why TaraForge3D", href: "/#about" },
      { label: "FAQs", href: "/#faq" },
      { label: "Shipping & returns", href: "/shipping-returns" },
    ],
    connect: [
      { label: "Email", href: `mailto:${CONTACT.email}`, icon: <Mail className="w-3.5 h-3.5" /> },
      { label: "WhatsApp", href: `https://wa.me/${CONTACT.whatsappNumber}`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    ]
  };

  return (
    <footer
      id="contact"
      className="design-footer relative overflow-hidden"
    >
      <div className="section-max-width design-container">
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="design-footer-brand">
              <Image src="/brand/lockup/svg/taraforge3d-lockup-stacked-on-dark.svg" alt="" width={148} height={151} />
              <div>
                <h2 className="sr-only">
                  TaraForge3D
                </h2>
                <p className="design-footer-tagline">
                  Your Idea, in 3D ✶
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed">
              A 3D printing studio for everyone... from custom keepsakes to complex prototypes. Adding a personal touch to your high-detail prints, and giving shape to your ideas
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold/80 mb-6">
              Explore
            </h3>
            <ul>
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    onClick={() => trackNavigation(link.label, 'footer')}
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
            <ul>
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target={link.href.startsWith("https://") ? "_blank" : undefined}
                    rel={link.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                    onClick={() => trackSocialClick(link.label.toLowerCase())}
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
        <div className="design-footer-bottom mt-16 pt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs">
            © {currentYear} TaraForge3D. Crafted in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
