export interface Product {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly price: number;
  readonly currency: string;
  readonly imageGradient: string;
  readonly accent: string;
  readonly tag?: string;
}

// Preview catalogue only. Availability and final prices are confirmed by inquiry.
export const products: readonly Product[] = [
  {
    id: "tf-desk-organizer",
    title: "Minimalist Desk Set",
    category: "Living",
    description: "A geometric 3-piece set for your workspace. Designed for modularity and a clean aesthetic finish.",
    price: 1249,
    currency: "₹",
    imageGradient: "from-blue-900/40 via-slate-900 to-slate-950",
    accent: "rgba(56, 189, 248, 0.4)",
  },
  {
    id: "tf-planter-stellar",
    title: "Celestial Planter",
    category: "Living",
    description: "Self-watering geometric planter with a celestial pattern. Durable PETG construction for indoor/outdoor use.",
    price: 899,
    currency: "₹",
    imageGradient: "from-purple-900/40 via-slate-900 to-slate-950",
    accent: "rgba(168, 85, 247, 0.4)",
  },
  {
    id: "tf-lamp-nebula",
    title: "Nebula Ambient Lamp",
    category: "Decor",
    description: "Lithophane-style light cover that projects cosmic shadows. Includes custom base and LED fitting.",
    price: 2499,
    currency: "₹",
    imageGradient: "from-amber-900/40 via-slate-900 to-slate-950",
    accent: "rgba(251, 191, 36, 0.4)",
    tag: "Premium",
  },
  {
    id: "tf-keycap-forge",
    title: "Forge Edition Keycaps",
    category: "Customs",
    description: "Set of 4 artisan keycaps featuring the TaraForge3D logo. High-detail precision prints for mechanical keyboards.",
    price: 599,
    currency: "₹",
    imageGradient: "from-emerald-900/40 via-slate-900 to-slate-950",
    accent: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "tf-headphone-stand",
    title: "Aero Headphone Stand",
    category: "Living",
    description: "Ergonomic stand designed for weight balance and minimalistic profile. Printed in reinforced PLA.",
    price: 1599,
    currency: "₹",
    imageGradient: "from-rose-900/40 via-slate-900 to-slate-950",
    accent: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: "tf-swatch-pack",
    title: "Material Swatch Pack",
    category: "Makers",
    description: "Complete set of 12 material swatches including PLA, PETG, and Specialty filaments for tactile review.",
    price: 450,
    currency: "₹",
    imageGradient: "from-slate-800 via-slate-900 to-slate-950",
    accent: "rgba(148, 163, 184, 0.4)",
    tag: "Sample Kit",
  },
];
