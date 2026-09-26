export function CelestialBackground() {
  return <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none design-sky" />;
}

// Decoration lives at the hero edge, never behind copy or across section seams.
export function HeroConstellation() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 400" className="design-constellation">
      <path d="M22 24 L120 70 L42 145 L130 205 L48 275 L108 360" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      {[[22, 24], [120, 70], [42, 145], [130, 205], [48, 275], [108, 360]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="2.5" />)}
    </svg>
  );
}
