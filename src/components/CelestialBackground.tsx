"use client";

import React from "react";
import { motion } from "framer-motion";

const constellationPoints = [
  // Threads
  { id: 0, x: 42, y: 15, scale: 0.8 },
  { id: 1, x: 58, y: 15, scale: 0.9 },
  { id: 2, x: 42, y: 25, scale: 0.7 },
  { id: 3, x: 58, y: 25, scale: 1.1 },
  { id: 21, x: 42, y: 20, scale: 0.6 },
  { id: 22, x: 58, y: 20, scale: 0.8 },
  { id: 30, x: 50, y: 20, scale: 0.7 },
  
  // Hex body
  { id: 4, x: 28, y: 35, scale: 1.2 },
  { id: 5, x: 72, y: 35, scale: 0.8 },
  { id: 6, x: 28, y: 55, scale: 0.9 },
  { id: 7, x: 72, y: 55, scale: 1.0 },
  { id: 23, x: 28, y: 45, scale: 0.9 },
  { id: 24, x: 72, y: 45, scale: 1.0 },
  { id: 25, x: 40, y: 55, scale: 0.8 },
  { id: 26, x: 60, y: 55, scale: 0.8 },
  
  // Internal nexus
  { id: 14, x: 50, y: 45, scale: 1.3 },
  { id: 31, x: 50, y: 55, scale: 1.1 },
  { id: 32, x: 50, y: 35, scale: 0.9 },

  // Cone taper
  { id: 8, x: 38, y: 70, scale: 0.8 },
  { id: 9, x: 62, y: 70, scale: 0.7 },
  { id: 10, x: 46, y: 85, scale: 1.1 },
  { id: 11, x: 54, y: 85, scale: 0.9 },
  { id: 27, x: 42, y: 78, scale: 0.8 },
  { id: 28, x: 58, y: 78, scale: 0.7 },
  { id: 29, x: 50, y: 70, scale: 1.0 },
  { id: 33, x: 50, y: 78, scale: 0.9 },

  // Tip
  { id: 12, x: 48, y: 92, scale: 0.8 },
  { id: 13, x: 52, y: 92, scale: 0.8 },
  { id: 34, x: 50, y: 88, scale: 1.0 },

  // Stray background stars
  { id: 15, x: 12, y: 20, scale: 0.6 },
  { id: 16, x: 85, y: 15, scale: 0.5 },
  { id: 17, x: 15, y: 80, scale: 0.7 },
  { id: 18, x: 88, y: 75, scale: 0.9 },
  { id: 19, x: 8, y: 50, scale: 0.6 },
  { id: 20, x: 92, y: 45, scale: 0.5 },
  // Additional stray stars
  { id: 35, x: 22, y: 10, scale: 0.8 },
  { id: 36, x: 75, y: 90, scale: 0.7 },
  { id: 37, x: 8, y: 35, scale: 0.5 },
  { id: 38, x: 95, y: 25, scale: 0.9 },
];

const constellationLines = [
  // Threads outline
  [0, 1], [0, 21], [21, 2], [1, 22], [22, 3], [2, 3],
  // Threads internal
  [21, 22], [0, 30], [1, 30], [2, 30], [3, 30],
  
  // Hex outline
  [2, 4], [3, 5], 
  [4, 23], [23, 6], 
  [5, 24], [24, 7], 
  [6, 25], [25, 31], [31, 26], [26, 7],
  
  // Hex internal
  [4, 14], [5, 14], [6, 14], [7, 14], [23, 14], [24, 14],
  [14, 32], [14, 31], [32, 2], [32, 3], [32, 4], [32, 5],
  [31, 25], [31, 26], [25, 14], [26, 14],
  
  // Cone outline
  [6, 8], [7, 9], [25, 8], [26, 9],
  [8, 27], [27, 10], [9, 28], [28, 11], [10, 11],
  
  // Cone internal
  [8, 29], [9, 29], [31, 29], [25, 29], [26, 29],
  [27, 33], [28, 33], [29, 33], [10, 33], [11, 33],
  
  // Tip outline
  [10, 12], [11, 13], [12, 13],
  
  // Tip internal
  [10, 34], [11, 34], [12, 34], [13, 34], [33, 34]
];

export const CelestialBackground = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Delay non-critical background decor to prioritize LCP rendering
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [stars, setStars] = React.useState<{id: number, top: string, left: string, duration: number, delay: number, scale: number}[]>([]);

  React.useEffect(() => {
    // Generate static constellation stars with random twinkles
    setStars(constellationPoints.map((p) => ({
      id: p.id,
      top: `${p.y}%`,
      left: `${p.x}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      scale: p.scale
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
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/15 blur-[100px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[110px]"
      />

      {/* Forge Heat Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-amber-600/10 to-transparent blur-3xl opacity-20"
      />

      {/* Static Stars (Small) */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '70px 70px', backgroundPosition: '20px 20px' }} />
      
      {mounted && (
        <>
          {/* Constellation Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.25]">
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
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  className="text-brand-gold/60"
                />
              )
            })}
          </svg>

          {/* Animated Stars (Twinkling) */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0.2, scale: star.scale }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [star.scale, star.scale * 1.2, star.scale] }}
              transition={{ 
                duration: star.duration, 
                repeat: Infinity, 
                delay: star.delay 
              }}
              className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
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
