"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { galleryPhotosFor } from "@/lib/galleryPhotos";

interface GalleryProjectModalProps {
  item: GalleryItem;
  initialPhotoIndex: number;
  returnFocusTo: HTMLElement;
  onClose: () => void;
}

export function GalleryProjectModal({ item, initialPhotoIndex, returnFocusTo, onClose }: GalleryProjectModalProps) {
  const photos = galleryPhotosFor(item);
  const [active, setActive] = React.useState(() => Math.max(0, Math.min(initialPhotoIndex, photos.length - 1)));
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const backdropDown = React.useRef(false);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const current = photos[active];
  const move = (direction: number) => {
    if (photos.length > 1) setActive(value => (value + direction + photos.length) % photos.length);
  };

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      width: body.style.width, overflow: body.style.overflow, paddingRight: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(window.getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.left = `${-scrollX}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      Object.assign(body.style, previous);
      window.scrollTo(scrollX, scrollY);
      if (returnFocusTo.isConnected) returnFocusTo.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
    if (event.key === "Tab") {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"));
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={handleKeyDown}
      onPointerDown={event => { backdropDown.current = event.target === event.currentTarget; }}
      onClick={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (backdropDown.current && outside) onClose();
        backdropDown.current = false;
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 p-0 text-slate-50 shadow-2xl backdrop:bg-slate-950/85 backdrop:backdrop-blur-md sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)] sm:rounded-3xl"
    >
      <div className="flex max-h-[calc(100dvh-1rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">From the gallery</p>
            <h2 id={titleId} className="break-words text-xl font-semibold text-slate-50 sm:text-2xl">{item.title}</h2>
          </div>
          <button ref={closeButtonRef} type="button" aria-label="Close project details" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain" data-gallery-modal-content>
          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
            <div className="min-w-0 border-b border-slate-800 bg-slate-900/30 lg:border-b-0 lg:border-r">
              <div
                className={`relative isolate h-[42dvh] min-h-[240px] overflow-hidden bg-gradient-to-br ${item.gradient} sm:h-[48dvh] lg:h-[min(60dvh,640px)]`}
                style={{ touchAction: "pan-y pinch-zoom" }}
                data-gallery-modal-image
                onPointerDown={event => {
                  if (event.pointerType === "touch") touchStart.current = { x: event.clientX, y: event.clientY };
                }}
                onPointerCancel={() => { touchStart.current = null; }}
                onPointerUp={event => {
                  const start = touchStart.current;
                  touchStart.current = null;
                  if (!start || event.pointerType !== "touch") return;
                  const dx = event.clientX - start.x;
                  const dy = event.clientY - start.y;
                  if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
                }}
              >
                <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse at center, ${item.accent}, transparent 75%)` }} />
                {current ? (
                  <Image key={current.src} src={current.src} alt={current.alt} fill sizes="(max-width: 1023px) 100vw, 700px" loading="eager" draggable={false} className="select-none object-contain p-5 sm:p-8" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
                    <ImageOff className="size-8" aria-hidden="true" />
                    <p>Project photos will be shared here soon.</p>
                  </div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="border-t border-slate-800 px-4 py-3 sm:px-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <button type="button" aria-label="Previous project photo" onClick={() => move(-1)} className="grid size-11 place-items-center rounded-full border border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">
                      <ChevronLeft className="size-5" aria-hidden="true" />
                    </button>
                    <p className="text-xs text-slate-300" role="status" aria-live="polite" aria-atomic="true">Photo {active + 1} of {photos.length}</p>
                    <button type="button" aria-label="Next project photo" onClick={() => move(1)} className="grid size-11 place-items-center rounded-full border border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">
                      <ChevronRight className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto p-1" aria-label="Project photo thumbnails">
                    {photos.map((photo, index) => (
                      <button key={`${photo.src}-${index}`} type="button" aria-label={`View project photo ${index + 1}`} aria-pressed={index === active} onClick={() => setActive(index)} className={`relative size-14 shrink-0 overflow-hidden rounded-lg border bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${index === active ? "border-brand-gold ring-1 ring-brand-gold" : "border-slate-700 hover:border-slate-400"}`}>
                        <Image src={photo.src} alt="" fill sizes="56px" className="object-contain p-1" draggable={false} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <section className="flex min-w-0 flex-col gap-6 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
              <div>
                <span className="inline-block rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">{item.category}</span>
                <h3 className="mb-3 mt-5 text-sm font-semibold text-slate-100">About this print</h3>
                <p id={descriptionId} className="break-words text-sm leading-relaxed text-slate-300">{item.description}</p>
              </div>
              {item.tags.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Project tags">{item.tags.map(tag => <span key={tag} className="max-w-full break-words rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">{tag}</span>)}</div>}
              <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <p className="text-sm font-semibold text-slate-100">Have a project in mind?</p>
                <p className="mb-4 mt-2 text-xs leading-relaxed text-slate-400">Share your idea or design files and we&apos;ll discuss the print requirements with you.</p>
                <Link href="/quote/" onClick={onClose} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-brand-gold-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold">
                  Discuss a similar project <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </dialog>
  );
}
