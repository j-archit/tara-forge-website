import { useState } from "react";

const BG = "#06070F";
const GOLD = "#C9A84C";
const GOLD_DIM = "#3A2A0C";

// Ring dims: bottom 1.0, mid 0.75, top 0.5 — print-friendly, minimal fade
const RING_LAYERS = [
  { offsetY:  1,  dim: 1.0  },
  { offsetY:  0,  dim: 0.75 },
  { offsetY: -1,  dim: 0.50 },
];

function buildRingSegs(cx, cy, baseRx, baseRy, orbitRot, orbitSW, offsetYpx, dimFactor) {
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

function RingSegs({ segs, ink }) {
  const back  = segs.filter(s => !s.isFront);
  const front = segs.filter(s =>  s.isFront);
  return <>
    {back.map((s,i)  => <line key={`b${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={ink} strokeWidth={s.strokeW} opacity={s.opacity} strokeLinecap="round"/>)}
    {front.map((s,i) => <line key={`f${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={ink} strokeWidth={s.strokeW} opacity={s.opacity} strokeLinecap="round"/>)}
  </>;
}

function CenterStar({ cx, cy, size, ink }) {
  const L = size * 0.085, S = size * 0.032, w = size * 0.012;
  const pts = [
    [cx,cy-L],[cx+w,cy-w],[cx+S*.707,cy-S*.707],[cx+w,cy+w],
    [cx+L,cy],[cx+w,cy+w],[cx+S*.707,cy+S*.707],[cx-w,cy+w],
    [cx,cy+L],[cx-w,cy+w],[cx-S*.707,cy+S*.707],[cx-w,cy-w],
    [cx-L,cy],[cx-w,cy-w],[cx-S*.707,cy-S*.707],[cx+w,cy-w],
  ];
  return <polygon points={pts.map(p=>p.join(",")).join(" ")} fill={ink} opacity={1}/>;
}

function TaraMark({ size = 200, darkBg = true }) {
  const cx = size/2, cy = size/2;
  const sw = size * 0.022;
  const ink = darkBg ? GOLD : "#1A0E00";
  const baseRx = size*0.46, baseRy = size*0.18;
  const orbitRot = -30, orbitSW = sw*0.42;
  const gap = size * 0.052;

  const allRings = RING_LAYERS.map(r =>
    buildRingSegs(cx, cy, baseRx, baseRy, orbitRot, orbitSW, r.offsetY * gap, r.dim)
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {allRings.map((segs, i) => <RingSegs key={i} segs={segs} ink={ink}/>)}
      <CenterStar cx={cx} cy={cy} size={size} ink={ink}/>
    </svg>
  );
}

// ── SVG string builder for download ──────────────────────────────────────────
function buildSVGString(size = 500) {
  const cx = size/2, cy = size/2;
  const sw = size*0.022;
  const ink = GOLD;
  const baseRx = size*0.46, baseRy = size*0.18;
  const orbitRot = -30, orbitSW = sw*0.42;
  const gap = size*0.052;
  const SEGMENTS = 120;
  const rotRad = (orbitRot * Math.PI) / 180;

  function pt(a, oy) {
    const ex = baseRx*Math.cos(a), ey = baseRy*Math.sin(a);
    return {
      x: cx + ex*Math.cos(rotRad) - ey*Math.sin(rotRad),
      y: cy + oy + ex*Math.sin(rotRad) + ey*Math.cos(rotRad),
    };
  }

  let lines = "";
  RING_LAYERS.forEach(r => {
    const oy = r.offsetY * gap;
    for (let i = 0; i < SEGMENTS; i++) {
      const a1 = (2*Math.PI*i)/SEGMENTS, a2 = (2*Math.PI*(i+1))/SEGMENTS;
      const aMid = (a1+a2)/2;
      const p1 = pt(a1,oy), p2 = pt(a2,oy);
      const t = (Math.sin(aMid)+1)/2;
      const sw2 = (orbitSW*(0.35+t*0.9)*r.dim).toFixed(3);
      const op  = ((0.30+t*0.70)*r.dim).toFixed(3);
      lines += `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="${ink}" stroke-width="${sw2}" opacity="${op}" stroke-linecap="round"/>\n`;
    }
  });

  // Center star
  const L=size*0.085, S=size*0.032, w=size*0.012;
  const pts=[
    [cx,cy-L],[cx+w,cy-w],[cx+S*.707,cy-S*.707],[cx+w,cy+w],
    [cx+L,cy],[cx+w,cy+w],[cx+S*.707,cy+S*.707],[cx-w,cy+w],
    [cx,cy+L],[cx-w,cy+w],[cx-S*.707,cy+S*.707],[cx-w,cy-w],
    [cx-L,cy],[cx-w,cy-w],[cx-S*.707,cy-S*.707],[cx+w,cy-w],
  ].map(p=>p.map(n=>n.toFixed(2)).join(",")).join(" ");
  lines += `<polygon points="${pts}" fill="${ink}" opacity="1"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="background:${BG}">
${lines}
</svg>`;
}

// ── Color scheme palette ──────────────────────────────────────────────────────
const palette = [
  { name: "Void",        hex: "#06070F", role: "Page background" },
  { name: "Deep Space",  hex: "#0C0D1A", role: "Card / surface background" },
  { name: "Nebula",      hex: "#161828", role: "Border / subtle divider" },
  { name: "Gold Star",   hex: "#C9A84C", role: "Primary brand / CTA" },
  { name: "Gold Bright", hex: "#E8C46A", role: "Hover state / highlight" },
  { name: "Stardust",    hex: "#D4C9A8", role: "Body text" },
  { name: "Moonlight",   hex: "#8A8070", role: "Secondary / muted text" },
  { name: "Forge White", hex: "#F0EBE0", role: "Light background / print" },
];

export default function TaraBrand() {
  const [showLockup, setShowLockup] = useState(false);
  const [copied, setCopied] = useState(null);

  function downloadSVG() {
    const svg = buildSVGString(500);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tara-forge-mark.svg"; a.click();
    URL.revokeObjectURL(url);
  }

  function copyHex(hex) {
    navigator.clipboard.writeText(hex).then(() => { setCopied(hex); setTimeout(()=>setCopied(null),1500); });
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", fontFamily:"'Georgia', serif", color:"#D4C9A8" }}>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:44 }}>
        <div style={{ fontSize:9, letterSpacing:"0.45em", color:GOLD, marginBottom:12, textTransform:"uppercase", fontFamily:"'Courier New', monospace" }}>Tara Forge · Brand Mark</div>
        <div style={{ width:28, height:1, background:GOLD_DIM, margin:"0 auto" }}/>
      </div>

      {/* Primary mark */}
      <TaraMark size={300}/>

      {/* Actions */}
      <div style={{ display:"flex", gap:16, marginTop:32 }}>
        <button onClick={downloadSVG} style={{ background:"none", border:`1px solid ${GOLD}`, color:GOLD, fontSize:9, letterSpacing:"0.25em", padding:"8px 18px", cursor:"pointer", fontFamily:"'Courier New', monospace", textTransform:"uppercase" }}>
          ↓ Download SVG
        </button>
        <button onClick={()=>setShowLockup(s=>!s)} style={{ background:"none", border:"1px solid #1A1206", color:"#3A2A0A", fontSize:9, letterSpacing:"0.25em", padding:"8px 18px", cursor:"pointer", fontFamily:"'Courier New', monospace", textTransform:"uppercase" }}>
          {showLockup ? "Hide Lockup" : "Show Lockup →"}
        </button>
      </div>

      {/* Lockup */}
      {showLockup && (
        <div style={{ marginTop:48, borderTop:"1px solid #0E0C06", paddingTop:44, display:"flex", flexDirection:"column", alignItems:"center", gap:36, width:"100%", maxWidth:540 }}>

          <div style={{ display:"flex", alignItems:"center", gap:26 }}>
            <TaraMark size={88}/>
            <div style={{ borderLeft:"1px solid #1A1206", paddingLeft:26 }}>
              <div style={{ fontSize:24, letterSpacing:"0.35em", color:GOLD, lineHeight:1.05, fontWeight:400 }}>TARA</div>
              <div style={{ fontSize:24, letterSpacing:"0.35em", color:"#E8E0CC", lineHeight:1.05, fontWeight:400 }}>FORGE</div>
              <div style={{ fontSize:8, color:"#2A2010", letterSpacing:"0.3em", marginTop:9, fontStyle:"italic", fontFamily:"'Courier New', monospace" }}>forged in stars</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:24, alignItems:"flex-end" }}>
            {[44,64,96].map(s=>(
              <div key={s} style={{ textAlign:"center" }}>
                <TaraMark size={s}/>
                <div style={{ fontSize:7, color:"#1A1206", letterSpacing:"0.12em", marginTop:6, fontFamily:"'Courier New', monospace" }}>{s}px</div>
              </div>
            ))}
          </div>

          <div style={{ background:"#F0EBE0", borderRadius:3, padding:"22px 32px", display:"flex", alignItems:"center", gap:22 }}>
            <TaraMark size={72} darkBg={false}/>
            <div>
              <div style={{ fontSize:16, letterSpacing:"0.32em", color:"#1A0E00", lineHeight:1.05 }}>TARA FORGE</div>
              <div style={{ fontSize:7, color:"#8A7050", letterSpacing:"0.25em", marginTop:6, fontStyle:"italic", fontFamily:"'Courier New', monospace" }}>forged in stars</div>
            </div>
          </div>
          <div style={{ fontSize:7, color:"#1A1208", letterSpacing:"0.15em", fontFamily:"'Courier New', monospace" }}>↑ light / print background</div>
        </div>
      )}

      {/* Color palette */}
      <div style={{ marginTop:64, borderTop:"1px solid #0E0C06", paddingTop:44, width:"100%", maxWidth:540 }}>
        <div style={{ fontSize:9, letterSpacing:"0.35em", color:GOLD, marginBottom:28, textTransform:"uppercase", fontFamily:"'Courier New', monospace", textAlign:"center" }}>
          Website Color Scheme
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {palette.map(c => (
            <div key={c.hex} onClick={()=>copyHex(c.hex)} style={{ display:"flex", alignItems:"center", gap:16, cursor:"pointer" }}>
              <div style={{ width:44, height:26, background:c.hex, border:"1px solid #1A1608", borderRadius:2, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:10, color:"#D4C9A8", fontFamily:"'Courier New', monospace", letterSpacing:"0.1em" }}>{c.name}</span>
                <span style={{ fontSize:9, color:"#3A2E10", fontFamily:"'Courier New', monospace", marginLeft:12 }}>{c.role}</span>
              </div>
              <div style={{ fontSize:9, color: copied===c.hex ? GOLD : "#2A2010", fontFamily:"'Courier New', monospace", letterSpacing:"0.08em", minWidth:72, textAlign:"right" }}>
                {copied===c.hex ? "copied ✓" : c.hex}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, fontSize:8, color:"#1A1608", fontFamily:"'Courier New', monospace", letterSpacing:"0.12em", textAlign:"center" }}>
          click any swatch to copy hex
        </div>
      </div>

    </div>
  );
}
