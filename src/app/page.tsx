"use client";

import { motion } from "framer-motion";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] },
});

const staggerChildren = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.6, staggerChildren: 0.07, ease: [0.22, 0.61, 0.36, 1] },
};

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl">
      <div className="section-max-width flex items-center justify-between px-4 py-3 sm:px-6 lg:px-4">
        <div className="flex items-center gap-2">
          <div className="forge-pill px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-100 shadow-[var(--celestial-glow-primary)]">
            Tara Forge
          </div>
          <span className="hidden text-xs text-slate-400 sm:inline">
            Forged in the stars
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 sm:flex">
          <a href="#services" className="hover:text-celestial-accent transition-colors">
            Services
          </a>
          <a href="#gallery" className="hover:text-celestial-accent transition-colors">
            Gallery
          </a>
          <a href="#about" className="hover:text-celestial-accent transition-colors">
            Why Tara
          </a>
          <a
            href="#contact"
            className="rounded-full bg-slate-50 px-4 py-1.5 text-[11px] font-semibold text-slate-900 shadow-[var(--celestial-glow-amber)] transition hover:bg-celestial-accent hover:text-slate-950"
          >
            Get a quote
          </a>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="celestial-grid" />

      <div className="section-max-width relative px-4 sm:px-6 lg:px-4">
        <motion.div
          className="mx-auto max-w-2xl text-center sm:text-left"
          {...fadeIn(0.05)}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 shadow-[var(--celestial-glow-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-celestial-amber shadow-[var(--celestial-glow-amber)]" />
            Forged in the stars
            <span className="h-px w-6 bg-slate-600/80" />
            3D Printing Studio
          </p>

          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Ideas{" "}
            <span className="celestial-gradient-text">forged into real parts</span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-slate-300 sm:text-base">
            Tara Forge is inspired by “Tara” — meaning <span className="text-slate-100 font-medium">Star</span> in multiple Indian languages.
            We 3D print prototypes, custom parts, and keepsakes with a finish that feels
            otherworldly.
          </p>

          <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-celestial-accent px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[var(--celestial-glow-primary)] transition hover:bg-celestial-accent-strong"
            >
              Get a quote
              <span className="text-xs text-slate-900/80">— send your file</span>
            </a>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/40 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-celestial-accent hover:text-celestial-accent"
            >
              See recent prints
              <span className="h-1.5 w-1.5 rounded-full bg-celestial-accent-soft" />
            </a>
          </div>

          <dl className="mt-7 grid grid-cols-3 gap-4 text-left text-xs text-slate-300 sm:max-w-md">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Prints
              </dt>
              <dd className="mt-1 font-medium text-slate-100">
                Prototypes, parts, props
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Materials
              </dt>
              <dd className="mt-1 font-medium text-slate-100">
                PLA, PETG, resin
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Promise
              </dt>
              <dd className="mt-1 font-medium text-slate-100">
                Forged in the stars ✶
              </dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCards() {
  const services = [
    {
      label: "Rapid prototyping",
      title: "Iterate fast. Hold it in your hands.",
      body: "From first sketch to functional form—tight tolerances, fit-checks, and iteration-friendly prints for teams and makers.",
      tag: "Fast turnaround",
    },
    {
      label: "Custom parts",
      title: "One-offs and small batches that just work",
      body: "Replacement parts, enclosures, brackets, jigs—designed (or refined) for strength, orientation, and real-world use.",
      tag: "Functional prints",
    },
    {
      label: "Miniatures & props",
      title: "Detail-first prints with stellar finishing",
      body: "Clean supports, crisp details, and optional finishing. Ideal for miniatures, cosplay props, and display pieces.",
      tag: "Resin & finishing",
    },
  ];

  return (
    <section
      id="services"
      className="relative border-y border-slate-800/70 bg-slate-950/70 py-12 sm:py-16"
    >
      <div className="section-max-width px-4 sm:px-6 lg:px-4">
        <motion.div
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          {...fadeIn(0.05)}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Services
            </h2>
            <p className="mt-2 max-w-md text-balance text-lg font-medium text-slate-50">
              We print with the same mindset we design with:{" "}
              <span className="celestial-gradient-text">precision, iteration, and care</span>.
            </p>
          </div>
          <p className="max-w-sm text-xs text-slate-400">
            Bring an STL/STEP, a sketch, or just an idea. We’ll help you pick material,
            orientation, and finish to match the job.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3"
          {...staggerChildren}
        >
          {services.map((service) => (
            <motion.article
              key={service.label}
              className="group glass-surface flex flex-col justify-between rounded-2xl p-4 shadow-[0_18px_60px_rgba(15,23,42,0.85)] transition hover:border-celestial-accent/70 hover:shadow-[0_20px_90px_rgba(15,23,42,0.95)]"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {service.label}
                </p>
                <h3 className="mt-3 text-sm font-semibold text-slate-50">
                  {service.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {service.body}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px]">
                <span className="rounded-full bg-slate-900/60 px-3 py-1 text-slate-200">
                  {service.tag}
                </span>
                <span className="text-slate-400 transition group-hover:text-celestial-accent">
                  Learn more →
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function GalleryShowcase() {
  return (
    <section id="gallery" className="relative py-12 sm:py-16 lg:py-20">
      <div className="section-max-width px-4 sm:px-6 lg:px-4">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          {...fadeIn(0.05)}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Gallery
            </h2>
            <p className="mt-2 max-w-lg text-balance text-lg font-medium text-slate-50">
              A small constellation of{" "}
              <span className="celestial-gradient-text">prints, prototypes, and custom parts</span>{" "}
              from the forge.
            </p>
          </div>
          <p className="max-w-xs text-xs text-slate-400">
            These are placeholder tiles for now—swap them with photos of your real prints
            as you add them to `public/`.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-4 sm:grid-cols-3"
          {...staggerChildren}
        >
          <motion.div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-indigo-900 via-slate-950 to-slate-950 p-4 shadow-[0_20px_90px_rgba(15,23,42,0.95)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.55),_transparent_55%)] opacity-80" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Fit-check prototype
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  Rapid iteration part printed to validate form, clearance, and assembly
                  before committing to final material.
                </p>
              </div>
              <p className="text-[11px] text-slate-300">Prototype • Dimensional checks</p>
            </div>
          </motion.div>

          <motion.div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-emerald-900 via-slate-950 to-slate-950 p-4 shadow-[0_20px_90px_rgba(15,23,42,0.95)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(45,212,191,0.55),_transparent_55%)] opacity-80" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Functional bracket
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  Strength-focused print tuned for layer direction, infill, and real-world
                  loads—built to be used, not just admired.
                </p>
              </div>
              <p className="text-[11px] text-slate-300">Parts • PETG/PLA+</p>
            </div>
          </motion.div>

          <motion.div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-fuchsia-900 via-slate-950 to-slate-950 p-4 shadow-[0_20px_90px_rgba(15,23,42,0.95)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,_rgba(244,114,182,0.6),_transparent_55%)] opacity-80" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Resin miniature
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  High-detail resin print with clean supports and optional finishing for a
                  crisp, display-ready surface.
                </p>
              </div>
              <p className="text-[11px] text-slate-300">Detail • Resin & finishing</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function AboutTara() {
  return (
    <section
      id="about"
      className="relative border-y border-slate-800/70 bg-slate-950/60 py-12 sm:py-16"
    >
      <div className="section-max-width px-4 sm:px-6 lg:px-4">
        <motion.div className="grid gap-6 sm:grid-cols-2" {...fadeIn(0.05)}>
          <div className="glass-surface rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Why “Tara”
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-50">
              “Tara” means <span className="celestial-gradient-text">Star</span> in
              multiple Indian languages.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              That’s the energy we bring to every print—bright ideas made tangible,
              refined through iteration, and delivered with care. The work may be small,
              but it should feel stellar.
            </p>
          </div>
          <div className="glass-surface rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-50">How we print</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-celestial-accent" />
                Material choice and orientation for strength + finish
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-celestial-amber" />
                Iteration-ready prototypes when you’re still dialing in fit
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                Optional cleanup / finishing for display pieces
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-slate-800/80 bg-slate-950/90 py-8 text-xs text-slate-400"
    >
      <div className="section-max-width flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tara Forge
          </p>
          <p className="mt-1 text-xs text-slate-300">
            A 3D printing studio inspired by “Tara” (Star) — prototypes, custom parts,
            miniatures, and keepsakes. Forged in the Stars.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-[11px] text-slate-400">
            Send an STL/STEP and a note about size, material, and finish.
          </p>
          <a
            href="mailto:hello@taraforge.studio"
            className="text-[11px] font-semibold text-celestial-accent hover:text-celestial-accent-strong"
          >
            hello@taraforge.studio
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-950/80 via-slate-950 to-slate-950/95 text-slate-50">
      <Navbar />
      <HeroSection />
      <ServiceCards />
      <GalleryShowcase />
      <AboutTara />
      <Footer />
    </main>
  );
}
