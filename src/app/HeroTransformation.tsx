"use client";

import * as React from "react";
import Image from "next/image";
import styles from "./HeroTransformation.module.css";

const SLANT = 9;
const MIN = 0;
const MAX = 100;
const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

export function HeroTransformation() {
  const [reveal, setReveal] = React.useState(50);
  const [playing, setPlaying] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const draggingNow = React.useRef(false);
  const direction = React.useRef(1);
  const scene = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!preference.matches);
    const change = () => { if (preference.matches) setPlaying(false); };
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);

  React.useEffect(() => {
    if (!scene.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(scene.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!playing || !visible || hovered || focused || dragging) return;
    let frame = 0;
    let previous = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min(now - previous, 60);
      previous = now;
      setReveal(current => {
        if (current >= 82 && direction.current > 0) direction.current = -1;
        if (current <= 18 && direction.current < 0) direction.current = 1;
        const next = current + direction.current * elapsed * 0.012;
        if (next >= 82) { direction.current = -1; return 82; }
        if (next <= 18) { direction.current = 1; return 18; }
        return next;
      });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, visible, hovered, focused, dragging]);

  const moveToPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!scene.current) return;
    const bounds = scene.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 100;
    const y = (event.clientY - bounds.top) / bounds.height;
    // Account for the slanted seam, so the point touched stays on the divider.
    setReveal(clamp(x - SLANT + 2 * SLANT * y));
  };
  const top = Math.min(100, reveal + SLANT);
  const bottom = Math.max(0, reveal - SLANT);
  const modelClip = reveal <= 0 ? "inset(0)" : reveal >= 100 ? "inset(0 100% 0 0)" : `polygon(0 0, ${top}% 0, ${bottom}% 100%, 0 100%)`;
  const printClip = reveal <= 0 ? "inset(0 0 0 100%)" : reveal >= 100 ? "inset(0)" : `polygon(${top}% 0, 100% 0, 100% 100%, ${bottom}% 100%)`;

  return (
    <figure className={styles.figure} aria-label="Generated 3D model render compared with the finished Sith Lord print">
      <div className={styles.labels} aria-hidden="true">
        <span><i className={styles.modelDot} /> 3D MODEL</span>
        <span><i className={styles.printDot} /> FINISHED PRINT</span>
      </div>
      <div className={styles.scene} ref={scene} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={styles.imageLayer} style={{ clipPath: modelClip }} data-testid="hero-model-layer" aria-hidden="true">
          <Image
            src="/images/sith-lord-model-generated.png"
            alt=""
            width={941}
            height={1672}
            priority
            className={styles.modelImage}
          />
        </div>
        <div className={styles.imageLayer} style={{ clipPath: printClip }} data-testid="hero-print-layer" aria-hidden="true">
          <Image
            src="/images/sith-lord-print-hero.png"
            alt=""
            width={375}
            height={666}
            priority
            className={styles.printImage}
          />
        </div>
        <svg className={styles.divider} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ opacity: reveal <= 0 || reveal >= 100 ? 0 : 1 }}>
          <line x1={top} y1="0" x2={bottom} y2="100" />
        </svg>
        <div
          className={styles.dragSurface}
          role="slider"
          tabIndex={0}
          aria-label="Reveal finished 3D print"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={Math.round(reveal)}
          aria-valuetext={`${Math.round(reveal)} percent finished print visible`}
          aria-describedby="hero-transform-hint"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPointerDown={event => {
            if (event.button !== 0) return;
            setPlaying(false);
            draggingNow.current = true;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
            moveToPointer(event);
          }}
          onPointerMove={event => { if (draggingNow.current) moveToPointer(event); }}
          onPointerUp={event => {
            draggingNow.current = false;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { draggingNow.current = false; setDragging(false); }}
          onKeyDown={event => {
            const step = event.shiftKey ? 10 : 5;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") setReveal(value => clamp(value - step));
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") setReveal(value => clamp(value + step));
            else if (event.key === "Home") setReveal(MIN);
            else if (event.key === "End") setReveal(MAX);
            else return;
            event.preventDefault();
            setPlaying(false);
          }}
        >
          <span className={styles.handle} style={{ left: `clamp(21px, ${reveal}%, calc(100% - 21px))` }} aria-hidden="true">↔</span>
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span id="hero-transform-hint">Drag to compare the generated model render with the finished print.</span>
        <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? "Pause reveal animation" : "Play reveal animation"} aria-pressed={playing}>
          {playing ? "Pause" : "Play"} <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        </button>
      </figcaption>
    </figure>
  );
}
