"use client";

import React from "react";
import { motion } from "framer-motion";

export const CelestialBackground = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Delay non-critical background decor to prioritize LCP rendering
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stars = React.useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      top: `${Math.round(Math.random() * 1000) / 10}%`,
      left: `${Math.round(Math.random() * 1000) / 10}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      scale: 0.5 + Math.random() * 0.7
    })), []);

  const shootingStars = React.useMemo(() => 
    [...Array(3)].map((_, i) => ({
      id: i,
      top: `${Math.round(Math.random() * 500) / 10}%`,
      left: `${50 + Math.round(Math.random() * 500) / 10}%`,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 15
    })), []);

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

          {/* Shooting Stars */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px]">
            {shootingStars.map((star) => (
                <div 
                    key={star.id}
                    className="shooting-star"
                    style={{ 
                        top: star.top,
                        left: star.left,
                        animation: `shooting-star ${star.duration}s linear infinite`,
                        animationDelay: `${star.delay}s`
                    }}
                />
            ))}
          </div>
        </>
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};
