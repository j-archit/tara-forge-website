export interface ContentImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly fit: "contain" | "cover";
}

export const contentThemes = {
  blue: { gallery: "from-indigo-900 via-slate-950 to-slate-950", shop: "from-blue-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(56,189,248,0.4)", accent: "rgba(96,165,250,0.55)" },
  green: { gallery: "from-emerald-900 via-slate-950 to-slate-950", shop: "from-emerald-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(16,185,129,0.4)", accent: "rgba(45,212,191,0.55)" },
  purple: { gallery: "from-fuchsia-900 via-slate-950 to-slate-950", shop: "from-purple-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(168,85,247,0.4)", accent: "rgba(244,114,182,0.6)" },
  cyan: { gallery: "from-blue-900 via-slate-950 to-slate-950", shop: "from-blue-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(56,189,248,0.4)", accent: "rgba(59,130,246,0.5)" },
  gold: { gallery: "from-amber-900 via-slate-950 to-slate-950", shop: "from-amber-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(251,191,36,0.4)", accent: "rgba(251,191,36,0.5)" },
  rose: { gallery: "from-rose-900 via-slate-950 to-slate-950", shop: "from-rose-900/40 via-slate-900 to-slate-950", shopAccent: "rgba(244,63,94,0.4)", accent: "rgba(244,63,94,0.5)" },
  slate: { gallery: "from-slate-800 via-slate-900 to-slate-950", shop: "from-slate-800 via-slate-900 to-slate-950", shopAccent: "rgba(148,163,184,0.4)", accent: "rgba(148,163,184,0.4)" },
} as const;

export type ContentTheme = keyof typeof contentThemes;
