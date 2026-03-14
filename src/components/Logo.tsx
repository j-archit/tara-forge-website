"use client";

import * as React from "react";

const GOLD = "#C9A84C";

// Ring dims: bottom 1.0, mid 0.75, top 0.5 — print-friendly, minimal fade
const RING_LAYERS = [
  { offsetY:  1,  dim: 1.0  },
  { offsetY:  0,  dim: 0.75 },
  { offsetY: -1,  dim: 0.50 },
];

interface RingSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeW: number;
  opacity: number;
  isFront: boolean;
}

function buildRingSegs(
  cx: number, 
  cy: number, 
  baseRx: number, 
  baseRy: number, 
  orbitRot: number, 
  orbitSW: number, 
  offsetYpx: number, 
  dimFactor: number,
  size: number
): RingSeg[] {
  // Use fewer segments for smaller logos to improve performance
  const SEGMENTS = size < 100 ? 50 : 120;
  const rotRad = (orbitRot * Math.PI) / 180;
  const r3 = (n: number) => Math.round(n * 1000) / 1000;

  function pt(a: number) {
    const ex = baseRx * Math.cos(a), ey = baseRy * Math.sin(a);
    return {
      x: r3(cx + ex * Math.cos(rotRad) - ey * Math.sin(rotRad)),
      y: r3(cy + offsetYpx + ex * Math.sin(rotRad) + ey * Math.cos(rotRad)),
    };
  }
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const a1 = (2 * Math.PI * i) / SEGMENTS;
    const a2 = (2 * Math.PI * (i + 1)) / SEGMENTS;
    const aMid = (a1 + a2) / 2;
    const p1 = pt(a1), p2 = pt(a2);
    const t = (Math.sin(aMid) + 1) / 2;
    return {
      x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
      strokeW: r3(orbitSW * (0.35 + t * 0.9) * dimFactor),
      opacity:  r3((0.30 + t * 0.70) * dimFactor),
      isFront: Math.sin(aMid) >= 0,
    };
  });
}

function RingSegs({ segs, ink }: { segs: RingSeg[], ink: string }) {
  const back  = segs.filter(s => !s.isFront);
  const front = segs.filter(s =>  s.isFront);
  return (
    <>
      {back.map((s, i)  => (
        <line 
          key={`b${i}`} 
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} 
          stroke={ink} strokeWidth={s.strokeW} 
          opacity={s.opacity} strokeLinecap="round"
        />
      ))}
      {front.map((s, i) => (
        <line 
          key={`f${i}`} 
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} 
          stroke={ink} strokeWidth={s.strokeW} 
          opacity={s.opacity} strokeLinecap="round"
        />
      ))}
    </>
  );
}

function CenterStar({ cx, cy, size, ink }: { cx: number, cy: number, size: number, ink: string }) {
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  const L = size * 0.085, S = size * 0.032, w = size * 0.012;
  const pts = [
    [cx,cy-L],[cx+w,cy-w],[cx+S*.707,cy-S*.707],[cx+w,cy+w],
    [cx+L,cy],[cx+w,cy+w],[cx+S*.707,cy+S*.707],[cx-w,cy+w],
    [cx,cy+L],[cx-w,cy+w],[cx-S*.707,cy+S*.707],[cx-w,cy-w],
    [cx-L,cy],[cx-w,cy-w],[cx-S*.707,cy-S*.707],[cx+w,cy-w],
  ].map(p => p.map(r3));
  return <polygon points={pts.map(p=>p.join(",")).join(" ")} fill={ink} opacity={1}/>;
}

export function Logo({ size = 200, className = "" }: { size?: number, className?: string }) {
  const cx = size/2, cy = size/2;
  const sw = size * 0.022;
  const ink = GOLD;
  const baseRx = size*0.46, baseRy = size*0.18;
  const orbitRot = -30, orbitSW = sw*0.42;
  const gap = size * 0.052;

  const allRings = React.useMemo(() => 
    RING_LAYERS.map(r =>
      buildRingSegs(cx, cy, baseRx, baseRy, orbitRot, orbitSW, r.offsetY * gap, r.dim, size)
    ), [cx, cy, baseRx, baseRy, orbitRot, orbitSW, gap, size]);

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {allRings.map((segs, i) => <RingSegs key={i} segs={segs} ink={ink}/>)}
      <CenterStar cx={cx} cy={cy} size={size} ink={ink}/>
    </svg>
  );
}
