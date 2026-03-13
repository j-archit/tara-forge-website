"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { testimonials } from "@/data/testimonials";

export function TestimonialMarquee() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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

  const advance = useCallback(async () => {
    const nextIndex = index + 1;
    
    // Animate to the next position
    await controls.start({
      x: -(nextIndex * layout.offset),
      transition: { duration: 1, ease: [0.32, 0.72, 0, 1] }
    });

    // Reset loop point
    if (nextIndex >= testimonials.length) {
      controls.set({ x: 0 });
      setIndex(0);
    } else {
      setIndex(nextIndex);
    }
  }, [index, layout.offset, controls, testimonials.length]);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => advance(), 4000);
    return () => clearInterval(timer);
  }, [isHovered, advance]);

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

      <div className="relative">
        <motion.div
          className="flex px-[10%] sm:px-[15%] lg:px-[25%]"
          animate={controls}
          initial={{ x: 0 }}
          style={{ gap: `${layout.gap}px` }}
        >
          {displayTestimonials.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              style={{ width: `${layout.cardWidth}px` }}
              className="flex-shrink-0 p-6 lg:p-10 rounded-[2rem] border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl transition-all hover:border-brand-gold/40 hover:bg-slate-900/60 group relative overflow-hidden"
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

      {/* Progress Sync */}
      <div className="mt-12 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? 'bg-brand-gold w-8' : 'bg-slate-800 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
