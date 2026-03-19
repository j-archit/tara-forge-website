"use client";

import React from "react";
import { motion } from "framer-motion";

const constellationPoints = [
  // Threads Outline
  { id: 0, x: 42, y: 15, scale: 0.8, isGolden: true },
  { id: 1, x: 58, y: 15, scale: 0.9 },
  { id: 2, x: 42, y: 25, scale: 0.7 },
  { id: 3, x: 58, y: 25, scale: 1.1, isGolden: true },
  
  // Hex Body Outline
  { id: 4, x: 28, y: 35, scale: 1.2 },
  { id: 5, x: 72, y: 35, scale: 0.8 },
  { id: 6, x: 28, y: 55, scale: 0.9 },
  { id: 7, x: 72, y: 55, scale: 1.0, isGolden: true },

  // Cone Taper Outline
  { id: 8, x: 38, y: 70, scale: 0.8 },
  { id: 9, x: 62, y: 70, scale: 0.7 },
  { id: 10, x: 46, y: 85, scale: 1.1 },
  { id: 11, x: 54, y: 85, scale: 0.9 },

  // Tip Outline
  { id: 12, x: 48, y: 92, scale: 0.8, isGolden: true },
  { id: 13, x: 52, y: 92, scale: 0.8, isGolden: true },
];

const constellationLines = [
  // Threads outline
  [0, 1], [1, 3], [3, 2], [2, 0],
  
  // Hex outline
  [2, 4], [3, 5], [4, 6], [5, 7], [6, 7],
  
  // Cone outline
  [6, 8], [7, 9], [8, 10], [9, 11], [10, 11],
  
  // Tip outline
  [10, 12], [11, 13], [12, 13]
];

export const CelestialBackground = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Delay non-critical background decor to prioritize LCP rendering
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [stars, setStars] = React.useState<{id: number, top: string, left: string, duration: number, delay: number, scale: number, isGolden: boolean}[]>([]);

  React.useEffect(() => {
    // Generate static constellation stars with random twinkles
    setStars(constellationPoints.map((p) => ({
      id: p.id,
      top: `${p.y}%`,
      left: `${p.x}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      scale: p.scale,
      isGolden: (p as any).isGolden || false
    })));

    // Delay non-critical background decor to prioritize LCP rendering
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#020617]" />
      
      {/* Nebula Clouds */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/30 blur-[120px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/25 blur-[100px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[110px]"
      />

      {/* Forge Heat Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-amber-600/15 to-transparent blur-3xl opacity-30"
      />

      {/* Static Stars (Small) */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '70px 70px', backgroundPosition: '20px 20px' }} />
      
      {mounted && (
        <>
          {/* Constellation Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.55]">
            {constellationLines.map(([start, end], idx) => {
              const p1 = constellationPoints.find(p => p.id === start);
              const p2 = constellationPoints.find(p => p.id === end);
              if (!p1 || !p2) return null;
              return (
                <line 
                  key={idx}
                  x1={`${p1.x}%`} y1={`${p1.y}%`}
                  x2={`${p2.x}%`} y2={`${p2.y}%`}
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  className="text-slate-400/50"
                />
              )
            })}
          </svg>

          {/* Animated Stars (Twinkling) */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0.3, scale: star.scale * 1.5 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [star.scale * 1.5, star.scale * 1.8, star.scale * 1.5] }}
              transition={{ 
                duration: star.duration, 
                repeat: Infinity, 
                delay: star.delay 
              }}
              className={`absolute w-1 h-1 rounded-full ${
                star.isGolden 
                  ? "bg-brand-gold shadow-[0_0_15px_var(--brand-gold)]" 
                  : "bg-white shadow-[0_0_12px_white]"
              }`}
              style={{ 
                top: star.top, 
                left: star.left 
              }}
            />
          ))}
        </>
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};
