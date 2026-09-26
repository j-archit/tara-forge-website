"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { trackNavigation, trackCTA, trackMobileMenu } from "@/lib/analytics";
import { brandScripts, BRAND_INTERVAL_MS } from "@/lib/brandScripts";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/#about", label: "Why TaraForge3D" },
  { href: "/team", label: "Team" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scriptIndex, setScriptIndex] = React.useState(0);
  const headerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const slotRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval: number | undefined;
    const sync = () => {
      window.clearInterval(interval);
      if (media.matches) setScriptIndex(0);
      else interval = window.setInterval(() => setScriptIndex(prev => (prev + 1) % brandScripts.length), BRAND_INTERVAL_MS);
    };
    sync();
    media.addEventListener("change", sync);
    return () => { window.clearInterval(interval); media.removeEventListener("change", sync); };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled || !slotRef.current) return;
      const words = Array.from(slotRef.current.children);
      const widest = Math.max(...words.map(word => word.getBoundingClientRect().width));
      slotRef.current.style.width = `${Math.ceil(widest) + 4}px`;
    });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!isMobileMenuOpen || !headerRef.current) return;
    const header = headerRef.current;
    const menuButton = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(header.parentElement?.children ?? []).filter(element => element !== header) as HTMLElement[];
    const previousInert = background.map(element => element.inert);
    const previousHidden = background.map(element => element.getAttribute("aria-hidden"));
    background.forEach(element => { element.inert = true; element.setAttribute("aria-hidden", "true"); });
    const focusable = () => Array.from(header.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(element => element.getClientRects().length > 0);
    header.querySelector<HTMLElement>("#mobile-navigation a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        trackMobileMenu("close");
        setIsMobileMenuOpen(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => { if (desktop.matches) setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, i) => {
        element.inert = previousInert[i];
        const hidden = previousHidden[i];
        if (hidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", hidden);
      });
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      menuButton?.focus();
    };
  }, [isMobileMenuOpen]);

  return (
    <header ref={headerRef} className="design-header" role={isMobileMenuOpen ? "dialog" : undefined} aria-modal={isMobileMenuOpen ? true : undefined} aria-label={isMobileMenuOpen ? "Toggle navigation" : undefined}>
      <div className="section-max-width design-container design-header-inner flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="brand" aria-label="TaraForge3D home" onClick={() => setIsMobileMenuOpen(false)}>
            <Logo size={34} />
            <span className="brand__stack">
              <span ref={slotRef} className="brand__tara" aria-hidden="true">
                {brandScripts.map((word, index) => (
                  <span key={word.lang} lang={word.lang} dir={word.lang === "ur" ? "rtl" : undefined} className="brand__word" data-active={index === scriptIndex} style={{ fontFamily: word.family }}>{word.text}</span>
                ))}
              </span>
              <span className="brand__forge">Forge</span>
            </span>
            <span className="brand__3d">3D</span>
          </Link>
          <span className="brand__tagline hidden xl:inline">Your Idea, in 3D</span>
        </div>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => trackNavigation(link.label, pathname)} className="design-nav-link" aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>
          ))}
          <Link href="/quote" onClick={() => trackCTA("get_a_quote_nav", "/quote")} className="design-button design-primary">Get a quote</Link>
        </nav>
        <button ref={menuRef} className="design-menu-button flex items-center justify-center lg:hidden" onClick={() => {
          trackMobileMenu(isMobileMenuOpen ? "close" : "open");
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }} aria-label="Toggle navigation" aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav id="mobile-navigation" aria-hidden={!isMobileMenuOpen} hidden={!isMobileMenuOpen} className="design-mobile-nav lg:hidden">
        <ul className="flex flex-col items-center gap-4 text-center">
          {navLinks.map(link => (
            <li key={link.href}><Link href={link.href} className="design-nav-link text-lg" aria-current={pathname === link.href ? "page" : undefined} onClick={() => {
              trackNavigation(link.label, pathname);
              setIsMobileMenuOpen(false);
            }}>{link.label}</Link></li>
          ))}
          <li className="w-full pt-4"><Link href="/quote" onClick={() => {
            trackCTA("get_a_quote_nav_mobile", "/quote");
            setIsMobileMenuOpen(false);
          }} className="design-button design-primary w-full">Get a quote</Link></li>
        </ul>
      </nav>
    </header>
  );
}
