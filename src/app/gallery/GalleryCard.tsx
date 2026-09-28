"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { trackEvent } from "@/lib/analytics";
import type { GalleryPhoto } from "@/data/gallery";

interface GalleryCardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: readonly string[];
  gradient: string;
  accent: string;
  image: { src: string; alt: string; width: number; height: number; fit: "contain" | "cover" } | null;
  presentation?: { widthSpan: 1 | 2 | 3; heightSpan: 1 | 2 | 3; autoplay: boolean; photos: readonly GalleryPhoto[] };
}

const widthClasses = { 1: "", 2: "lg:col-span-2", 3: "lg:col-span-3" };
const heightClasses = { 1: "", 2: "lg:row-span-2", 3: "lg:row-span-3" };

function photosFor(item: GalleryCardItem): readonly GalleryPhoto[] {
  if (item.presentation) return item.presentation.photos;
  return item.image ? [{ ...item.image, framed: true, focusX: 50, focusY: 50, zoom: 1, edgeFade: false }] : [];
}

export function GalleryCard({ item, index, fillTabletRow = false }: { item: GalleryCardItem; index: number; fillTabletRow?: boolean }) {
  const photos = photosFor(item);
  const [active, setActive] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const [pageVisible, setPageVisible] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const cardRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion(); media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);
  React.useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);
  React.useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    if (!item.presentation?.autoplay || photos.length < 2 || hovered || focusWithin || !inView || !pageVisible || reducedMotion) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % photos.length), 5000);
    return () => window.clearInterval(timer);
  }, [item.presentation?.autoplay, photos.length, hovered, focusWithin, inView, pageVisible, reducedMotion]);

  const current = photos[Math.min(active, photos.length - 1)];
  const width = item.presentation?.widthSpan ?? 1;
  const height = item.presentation?.heightSpan ?? 1;
  const horizontalAtTablet = fillTabletRow && width > 1;
  const move = (direction: number) => setActive(value => (value + direction + photos.length) % photos.length);

  return (
    <motion.article
      ref={cardRef}
      data-gallery-entry={item.id}
      {...fadeIn(index * 0.08)}
      onViewportEnter={() => trackEvent("gallery_item_view", "engagement", item.title, undefined, { category: item.category })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false); }}
      className={`group relative flex min-h-[390px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br ${item.gradient} p-6 shadow-[0_20px_90px_rgba(15,23,42,0.95)] ${horizontalAtTablet ? "sm:flex-row sm:items-stretch sm:gap-6" : width > 1 ? "lg:flex-row lg:items-stretch lg:gap-6" : ""} ${fillTabletRow ? `sm:col-span-2 ${width === 1 ? "lg:col-span-1" : ""}` : ""} ${widthClasses[width]} ${heightClasses[height]}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at center, ${item.accent}, transparent 70%)` }} />
      {current && (
        <div className={`relative mb-5 min-h-[210px] w-full flex-1 ${horizontalAtTablet ? "sm:mb-0 sm:min-h-0 sm:w-[55%] sm:flex-none" : width > 1 ? "lg:mb-0 lg:min-h-0 lg:w-[55%] lg:flex-none" : ""} ${current.framed ? "overflow-hidden rounded-lg border border-white/10 bg-slate-950/50" : "overflow-visible"}`}>
          <div className={`absolute inset-0 ${current.framed ? "overflow-hidden rounded-lg" : "overflow-visible"}`}>
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes={width === 3 ? "(max-width: 1024px) 100vw, 90vw" : width === 2 ? "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className={current.fit === "cover" ? "object-cover" : "object-contain"}
              style={{ objectPosition: `${current.focusX}% ${current.focusY}%`, transform: `scale(${current.zoom})`, transformOrigin: `${current.focusX}% ${current.focusY}%`, maskImage: current.edgeFade ? "radial-gradient(ellipse 74% 76% at center, black 58%, transparent 100%), linear-gradient(to bottom, black 75%, transparent 100%)" : undefined, maskComposite: current.edgeFade ? "intersect" : undefined }}
            />
          </div>
          {photos.length > 1 && (
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2" aria-label={`Photos of ${item.title}`}>
              <button type="button" aria-label={`Previous photo of ${item.title}`} onClick={() => move(-1)} className="grid size-9 place-items-center rounded-full border border-white/20 bg-slate-950/80 text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">‹</button>
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-slate-950/80 px-2 py-2" aria-label={`${active + 1} of ${photos.length} photos`}>
                {photos.map((photo, slideIndex) => (
                  <button key={`${photo.src}-${slideIndex}`} type="button" aria-label={`Show photo ${slideIndex + 1} of ${item.title}`} aria-pressed={slideIndex === active} onClick={() => setActive(slideIndex)} className={`size-2.5 shrink-0 rounded-full border border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${slideIndex === active ? "bg-brand-gold" : "bg-white/30 hover:bg-white/70"}`} />
                ))}
              </div>
              <button type="button" aria-label={`Next photo of ${item.title}`} onClick={() => move(1)} className="grid size-9 place-items-center rounded-full border border-white/20 bg-slate-950/80 text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">›</button>
            </div>
          )}
        </div>
      )}
      <div className={`relative flex flex-col gap-5 justify-between ${horizontalAtTablet ? "sm:min-w-0 sm:flex-1 sm:py-3" : width > 1 ? "lg:min-w-0 lg:flex-1 lg:py-3" : ""}`}>
        <div>
          <span className="mb-2 block break-words text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.category}</span>
          <h3 className="break-words text-lg font-semibold text-slate-100 transition-colors group-hover:text-white">{item.title}</h3>
          <p className="mt-2 break-words text-xs font-normal leading-relaxed text-slate-200">{item.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="max-w-full break-words rounded-full border border-slate-700/50 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-300">{tag}</span>)}</div>
      </div>
    </motion.article>
  );
}
