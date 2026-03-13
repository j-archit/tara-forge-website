"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useAnimationControls, PanInfo } from "framer-motion";
import { testimonials } from "@/data/testimonials";

export function TestimonialMarquee() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useState({ cardWidth: 380, gap: 24, offset: 404 });
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);

  // Triple testimonials for seamless looping
  const displayTestimonials = [...testimonials, ...testimonials, ...testimonials];

  // Update layout constants based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const cardWidth = isMobile ? 280 : 380;
      const gap = isMobile ? 16 : 24;
      setLayout({ cardWidth, gap, offset: cardWidth + gap });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToIndex = useCallback(async (newIndex: number, immediate = false) => {
    // Determine the target x position
    const targetX = -(newIndex * layout.offset);
    
    if (immediate) {
      controls.set({ x: targetX });
    } else {
      await controls.start({
        x: targetX,
        transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
      });
    }

    // Handle the infinite loop reset
    if (newIndex >= testimonials.length) {
      const resetIndex = newIndex % testimonials.length;
      controls.set({ x: -(resetIndex * layout.offset) });
      setIndex(resetIndex);
    } else if (newIndex < 0) {
      const resetIndex = testimonials.length + (newIndex % testimonials.length);
      controls.set({ x: -(resetIndex * layout.offset) });
      setIndex(resetIndex);
    } else {
      setIndex(newIndex);
    }
  }, [layout.offset, controls, testimonials.length]);

  const advance = useCallback(() => {
    if (isDragging) return;
    goToIndex(index + 1);
  }, [index, goToIndex, isDragging]);

  useEffect(() => {
    if (isHovered || isDragging) return;
    const timer = setInterval(() => advance(), 4000);
    return () => clearInterval(timer);
  }, [isHovered, isDragging, advance]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Calculate how many cards the user dragged
    const dragDistance = info.offset.x;
    const threshold = layout.offset / 4;
    
    let moveCards = 0;
    if (dragDistance < -threshold) moveCards = 1;
    if (dragDistance > threshold) moveCards = -1;

    // Use velocity for more "flippy" feel
    if (info.velocity.x < -500) moveCards = 1;
    if (info.velocity.x > 500) moveCards = -1;

    goToIndex(index + moveCards);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-slate-950/20 py-16 lg:py-24 border-y border-slate-800/40 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-24 lg:w-60 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 lg:w-60 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

      <div className="relative cursor-grab active:cursor-grabbing">
        <motion.div
          className="flex px-[10%] sm:px-[15%] lg:px-[25%]"
          drag="x"
          dragConstraints={{ left: -Infinity, right: Infinity }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0 }}
          style={{ gap: `${layout.gap}px` }}
        >
          {displayTestimonials.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              style={{ width: `${layout.cardWidth}px` }}
              className="flex-shrink-0 p-6 lg:p-10 rounded-[2rem] border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl transition-all hover:border-brand-gold/40 hover:bg-slate-900/60 group relative overflow-hidden select-none"
            >
              <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${t.accent} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`} />
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <div>
                  <span className="text-brand-gold text-4xl font-serif opacity-40 block mb-4">"</span>
                  <p className="text-slate-200 text-sm lg:text-base leading-relaxed font-light italic">
                    {t.quote}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-800/40 mt-8 flex items-center justify-between">
                  <div>
                    <p className="text-slate-100 font-semibold text-sm lg:text-base">{t.author}</p>
                    <p className="text-brand-gold/60 text-[9px] lg:text-[11px] uppercase tracking-[0.2em] font-medium mt-1">
                      {t.role}
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-brand-gold/40 shadow-[0_0_8px_var(--brand-gold)]" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Progress Sync - Clickable */}
      <div className="mt-12 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goToIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 hover:bg-brand-gold/40 ${
              i === index ? 'bg-brand-gold w-8' : 'bg-slate-800 w-2'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
