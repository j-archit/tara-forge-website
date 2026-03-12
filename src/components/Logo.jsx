// Tara Forge — Brand Mark
// Transparent background, gold mark
// Use at any size via the `size` prop

const GOLD = "#C9A84C";

const RING_LAYERS = [
  { offsetY:  1, dim: 1.0  },
  { offsetY:  0, dim: 0.75 },
  { offsetY: -1, dim: 0.50 },
];

function buildSegs(cx, cy, baseRx, baseRy, orbitRot, orbitSW, offsetYpx, dimFactor) {
  const SEGMENTS = 120;
  const rotRad = (orbitRot * Math.PI) / 180;
  function pt(a) {
    const ex = baseRx * Math.cos(a), ey = baseRy * Math.sin(a);
    return {
      x: cx + ex * Math.cos(rotRad) - ey * Math.sin(rotRad),
      y: cy + offsetYpx + ex * Math.sin(rotRad) + ey * Math.cos(rotRad),
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
      strokeW: orbitSW * (0.35 + t * 0.9) * dimFactor,
      opacity:  (0.30 + t * 0.70) * dimFactor,
      isFront: Math.sin(aMid) >= 0,
    };
  });
}

export function TaraForgeMark({ size = 96, color = GOLD }) {
  const cx = size / 2, cy = size / 2;
  const sw = size * 0.022;
  const baseRx = size * 0.46, baseRy = size * 0.18;
  const orbitRot = -30, orbitSW = sw * 0.42;
  const gap = size * 0.052;

  const allSegs = RING_LAYERS.flatMap(r =>
    buildSegs(cx, cy, baseRx, baseRy, orbitRot, orbitSW, r.offsetY * gap, r.dim)
  );
  const back  = allSegs.filter(s => !s.isFront);
  const front = allSegs.filter(s =>  s.isFront);

  const L = size * 0.085, S = size * 0.032, w = size * 0.012;
  const starPts = [
    [cx, cy-L], [cx+w, cy-w],
    [cx+S*.707, cy-S*.707], [cx+w, cy+w],
    [cx+L, cy], [cx+w, cy+w],
    [cx+S*.707, cy+S*.707], [cx-w, cy+w],
    [cx, cy+L], [cx-w, cy+w],
    [cx-S*.707, cy+S*.707], [cx-w, cy-w],
    [cx-L, cy], [cx-w, cy-w],
    [cx-S*.707, cy-S*.707], [cx+w, cy-w],
  ].map(p => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {back.map((s, i) => (
        <line key={`b${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={color} strokeWidth={s.strokeW} opacity={s.opacity} strokeLinecap="round" />
      ))}
      <polygon points={starPts} fill={color} opacity={1} />
      {front.map((s, i) => (
        <line key={`f${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={color} strokeWidth={s.strokeW} opacity={s.opacity} strokeLinecap="round" />
      ))}
    </svg>
  );
}

// Preview on both dark and light backgrounds
export default function Preview() {
  return (
    <div style={{ display: "flex", gap: 32, padding: 40, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ background: "#06070F", padding: 20, borderRadius: 8 }}>
        <TaraForgeMark size={96} />
      </div>
      <div style={{ background: "#F0EBE0", padding: 20, borderRadius: 8 }}>
        <TaraForgeMark size={96} color="#1A0E00" />
      </div>
      <div style={{ background: "#06070F", padding: 20, borderRadius: 8 }}>
        <TaraForgeMark size={48} />
      </div>
      <div style={{ background: "#06070F", padding: 20, borderRadius: 8 }}>
        <TaraForgeMark size={200} />
      </div>
    </div>
  );
}
