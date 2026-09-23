export interface HomeService {
  readonly label: string;
  readonly title: string;
  readonly body: string;
  readonly tag: string;
}

export const homeServices: readonly HomeService[] = [
  {
    label: "Rapid prototyping",
    title: "Iterate fast. Hold it in your hands.",
    body: "From first sketch to functional form—fit checks and iteration-friendly prints for teams and makers.",
    tag: "Quote-based timing",
  },
  {
    label: "Custom parts",
    title: "Build what you need. Parts that just work.",
    body: "Replacement parts, enclosures, brackets, and jigs, printed with their intended use in mind.",
    tag: "Functional prints",
  },
  {
    label: "Component batching",
    title: "Go Beyond One-Offs. Reliable Batch Manufacturing.",
    body: "Ask about a repeatable batch run. We confirm quantity, print time, and requirements in your quote.",
    tag: "Small-batch printing",
  },
  {
    label: "Figurines & Giftables",
    title: "Craft the otherworldly. Detail in every layer.",
    body: "From tabletop miniatures to custom gifts, we focus on the detail and finish that matter to you.",
    tag: "Custom art",
  },
];

export type ServiceIcon = "timer" | "settings" | "layers" | "brush";

export interface DetailedService {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly icon: ServiceIcon;
  readonly gradient: string;
  readonly accent: string;
}

export const detailedServices: readonly DetailedService[] = [
  {
    id: "prototyping",
    label: "Rapid Prototyping",
    title: "Iterate Fast. Hold it in your hands.",
    description: "Turn digital concepts into physical parts with a production estimate tailored to the file and print time.",
    features: [
      "Typical projects completed within 48 hours after final files, quote, and advance",
      "Multiple iteration cycles can be quoted",
      "Fit-check and assembly validation",
      "Precision layer heights (0.12mm - 0.28mm)",
      "Printability review",
    ],
    icon: "timer",
    gradient: "from-blue-600/20 to-indigo-600/20",
    accent: "text-blue-400",
  },
  {
    id: "parts",
    label: "Custom Functional Parts",
    title: "Build what you need. Parts that just work.",
    description: "Functional prints planned around material, orientation, and intended use.",
    features: [
      "Performance materials: PETG, PLA+",
      "Print orientation considered for strength",
      "Infill and shell settings matched to the project",
      "Material options discussed during quoting",
      "Design requirements reviewed before printing",
    ],
    icon: "settings",
    gradient: "from-emerald-600/20 to-teal-600/20",
    accent: "text-emerald-400",
  },
  {
    id: "batching",
    label: "Component Batching",
    title: "Go Beyond One-Offs. Reliable Manufacturing.",
    description: "Small-run production with quantity, consistency, and timing confirmed for each batch.",
    features: [
      "Tiered pricing for volume orders",
      "Quality checks across the batch",
      "Custom branding can be discussed",
      "Production schedule based on total print time",
      "India-wide shipping options discussed in the quote",
    ],
    icon: "layers",
    gradient: "from-amber-600/20 to-orange-600/20",
    accent: "text-amber-400",
  },
  {
    id: "artistic",
    label: "Artistic & Giftables",
    title: "Detail in every layer. Craft the otherworldly.",
    description: "Custom decorative prints with resolution and finishing agreed for each project.",
    features: [
      "Fine-detail print settings available",
      "Manual post-processing options",
      "Specialty filament options",
      "Custom bases and assemblies can be quoted",
      "Surface finish discussed before production",
    ],
    icon: "brush",
    gradient: "from-purple-600/20 to-pink-600/20",
    accent: "text-purple-400",
  },
];
