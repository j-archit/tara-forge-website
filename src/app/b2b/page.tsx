import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Boxes, Mail, MessageSquare, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { b2bContent, type B2BCopy } from "@/data/b2b";
import { galleryItems } from "@/data/gallery";
import type { ContentImage } from "@/data/managedContent";
import { CONTACT } from "@/data/siteContent";
import { testimonials } from "@/data/testimonials";
import { galleryPhotosFor } from "@/lib/galleryPhotos";
import { createPageMetadata } from "@/lib/siteMetadata";

// Keep the page out of search and navigation until the draft has been reviewed.
export const metadata: Metadata = createPageMetadata(
  "Business 3D Printing Bangalore & Across India",
  "Custom 3D prints for businesses, teams and communities. Discuss gifts, branded pieces, prototypes and small batches from Bangalore, with shipping across India.",
  "/b2b",
  { index: false },
);

function CopySlot({ value, label }: { value: B2BCopy; label: string }) {
  const empty = !value?.trim();
  return (
    <span data-content-slot={label} data-slot-empty={empty || undefined} className="break-words">
      {empty ? `[${label}]` : value}
    </span>
  );
}

function GalleryReference({ galleryId, image, priority = false }: { galleryId?: string; image?: ContentImage; priority?: boolean }) {
  const project = galleryItems.find(item => item.id === galleryId);
  const photo = image ?? (project ? galleryPhotosFor(project)[0] : undefined);

  if (!photo) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center p-6 text-sm text-slate-400" data-image-slot={galleryId}>
        [Gallery image]
      </div>
    );
  }

  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      priority={priority}
      sizes="(min-width: 1024px) 520px, (min-width: 640px) 50vw, 100vw"
      className={photo.fit === "cover" ? "h-full w-full object-cover" : "h-full w-full object-contain p-6 drop-shadow-[0_18px_20px_rgba(0,0,0,0.35)] sm:p-8"}
    />
  );
}

const actionClass = "inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold";

export default function B2BPage() {
  const { hero, offerings, projects, process, faq, enquiry } = b2bContent;

  return (
    <div className="flex min-h-screen flex-col text-slate-50">
      <Navbar />
      <main id="b2b-page">
        <section className="relative overflow-hidden pb-16 pt-16 lg:pb-24 lg:pt-24" aria-labelledby="b2b-heading">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="section-max-width relative grid items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-4">
            <div className="min-w-0">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                <CopySlot value={hero.eyebrow} label="Audience / eyebrow" />
              </p>
              <h1 id="b2b-heading" className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="celestial-gradient-text"><CopySlot value={hero.title} label="Hero headline" /></span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-slate-300">
                <CopySlot value={hero.body} label="Hero supporting copy" />
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <a href="#b2b-enquiry" className={`${actionClass} bg-brand-gold text-slate-950 hover:bg-brand-gold-bright`}>
                  <CopySlot value={hero.primaryAction} label="Primary CTA label" /><ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
                <a href="#b2b-offerings" className={`${actionClass} border border-slate-600 bg-slate-900/50 text-slate-100 hover:border-celestial-accent`}>
                  <CopySlot value={hero.secondaryAction} label="Secondary CTA label" /><ArrowDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
            <figure className="relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-700/60 bg-gradient-to-br from-blue-500/15 via-slate-900/40 to-purple-500/10">
              <div aria-hidden="true" className="celestial-grid" />
              <div className="relative h-80 sm:h-[26rem] lg:h-[30rem]">
                <GalleryReference galleryId={hero.galleryId} image={hero.image} priority />
              </div>
              <figcaption className="relative border-t border-slate-700/50 px-6 py-4 text-center text-xs leading-relaxed text-slate-300">
                <CopySlot value={hero.caption} label="Featured project caption" />
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="b2b-offerings" aria-labelledby="b2b-offerings-heading" className="scroll-mt-28 border-y border-slate-800/60 bg-slate-950/25 py-16 lg:py-20">
          <div className="section-max-width px-6 lg:px-4">
            <h2 id="b2b-offerings-heading" className="text-3xl font-semibold tracking-tight"><CopySlot value={offerings.title} label="Offerings heading" /></h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-400"><CopySlot value={offerings.body} label="Offerings introduction" /></p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {offerings.items.map((item, index) => (
                <article key={item.id} className="min-w-0 rounded-3xl border border-slate-700/60 bg-gradient-to-br from-blue-500/10 to-slate-900/50 p-7">
                  <Boxes className="mb-8 h-7 w-7 text-celestial-accent" aria-hidden="true" />
                  <h3 className="text-xl font-semibold"><CopySlot value={item.title} label={`Offering ${index + 1} title`} /></h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400"><CopySlot value={item.body} label={`Offering ${index + 1} description`} /></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="b2b-projects" aria-labelledby="b2b-projects-heading" className="py-16 lg:py-20">
          <div className="section-max-width px-6 lg:px-4">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="b2b-projects-heading" className="text-3xl font-semibold tracking-tight"><CopySlot value={projects.title} label="Project examples heading" /></h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-slate-400"><CopySlot value={projects.body} label="Project examples introduction" /></p>
              </div>
              <Link href="/gallery" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-brand-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold">
                Gallery<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {projects.items.map((item, index) => {
                const review = testimonials.find(testimonial => testimonial.id === item.testimonialId);
                return (
                <article key={item.id} className={`min-w-0 overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/35 ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-2" : ""}`}>
                  <div className={`bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 ${index === 0 ? "h-96 sm:h-[34rem]" : "h-64 sm:h-72"}`}>
                    <GalleryReference galleryId={item.galleryId} image={item.image} />
                  </div>
                  <div className={`border-t border-slate-800/70 ${index === 0 ? "flex flex-col justify-center p-7 sm:p-10 md:border-l md:border-t-0" : "p-6"}`}>
                    <h3 className="text-xl font-semibold"><CopySlot value={item.title} label={`Project ${index + 1} title`} /></h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400"><CopySlot value={item.body} label={`Project ${index + 1} context / outcome`} /></p>
                    {review && (
                      <blockquote className="mt-7 border-l-2 border-brand-gold/60 pl-5 text-sm leading-relaxed text-slate-300">
                        <p>&ldquo;{review.quote}&rdquo;</p>
                        <cite className="mt-4 block text-xs font-semibold not-italic text-brand-gold">{review.author}</cite>
                      </blockquote>
                    )}
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="b2b-process" aria-labelledby="b2b-process-heading" className="border-y border-slate-800/60 bg-slate-950/25 py-16 lg:py-20">
          <div className="section-max-width px-6 lg:px-4">
            <h2 id="b2b-process-heading" className="text-3xl font-semibold tracking-tight"><CopySlot value={process.title} label="Process heading" /></h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-400"><CopySlot value={process.body} label="Process introduction" /></p>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {process.steps.map((step, index) => (
                <li key={step.id} className="min-w-0 border-t border-brand-gold/30 pt-6">
                  <span className="font-mono text-sm text-brand-gold" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-lg font-semibold"><CopySlot value={step.title} label={`Step ${index + 1} title`} /></h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400"><CopySlot value={step.body} label={`Step ${index + 1} details`} /></p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="b2b-faq" aria-labelledby="b2b-faq-heading" className="py-16 lg:py-20">
          <div className="section-max-width grid gap-8 px-6 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-4">
            <h2 id="b2b-faq-heading" className="text-3xl font-semibold tracking-tight"><CopySlot value={faq.title} label="FAQ heading" /></h2>
            <div className="min-w-0 space-y-3">
              {faq.items.map((item, index) => (
                <details key={item.id} className="group rounded-2xl border border-slate-700/60 bg-slate-900/40 open:border-brand-gold/40">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold [&::-webkit-details-marker]:hidden">
                    <CopySlot value={item.question} label={`FAQ ${index + 1} question`} />
                    <Plus className="h-4 w-4 shrink-0 text-brand-gold transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400"><CopySlot value={item.answer} label={`FAQ ${index + 1} answer`} /></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="b2b-enquiry" aria-labelledby="b2b-enquiry-heading" className="scroll-mt-28 px-6 pb-20 lg:px-4 lg:pb-24">
          <div className="section-max-width rounded-[2rem] border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 via-slate-900/70 to-blue-500/10 p-7 sm:p-10 lg:p-14">
            <h2 id="b2b-enquiry-heading" className="text-3xl font-semibold tracking-tight"><CopySlot value={enquiry.title} label="Enquiry heading" /></h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-300"><CopySlot value={enquiry.body} label="Enquiry instructions" /></p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={`${actionClass} bg-brand-gold text-slate-950 hover:bg-brand-gold-bright`}>
                <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" /><CopySlot value={enquiry.whatsappAction} label="WhatsApp action label" />
              </a>
              <a href={`mailto:${CONTACT.email}`} className={`${actionClass} border border-slate-600 bg-slate-900/50 text-slate-100 hover:border-brand-gold`}>
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /><CopySlot value={enquiry.emailAction} label="Email action label" />
              </a>
            </div>
            <p className="mt-5 text-sm">
              <Link href="/b2b/terms/" className="inline-flex min-h-11 items-center gap-2 text-brand-gold underline underline-offset-4 hover:text-brand-gold-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold">
                Business order terms<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
