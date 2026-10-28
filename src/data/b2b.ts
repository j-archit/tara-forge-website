import { PAYMENT_TERMS, PRODUCTION_TIMING, QUOTE_RESPONSE_TIME } from "./siteContent.ts";
import type { ContentImage } from "./managedContent";

export type B2BCopy = string | null;

interface CopyBlock {
  title: B2BCopy;
  body: B2BCopy;
}

type B2BVisual =
  | { galleryId: string; image?: never }
  | { image: ContentImage; galleryId?: never };

interface B2BContent {
  hero: CopyBlock & B2BVisual & {
    eyebrow: B2BCopy;
    primaryAction: B2BCopy;
    secondaryAction: B2BCopy;
    caption: B2BCopy;
  };
  offerings: CopyBlock & { items: readonly (CopyBlock & { id: string })[] };
  projects: CopyBlock & {
    items: readonly (CopyBlock & B2BVisual & { id: string; testimonialId?: number })[];
  };
  process: CopyBlock & { steps: readonly (CopyBlock & { id: string })[] };
  faq: {
    title: B2BCopy;
    items: readonly { id: string; question: B2BCopy; answer: B2BCopy }[];
  };
  enquiry: CopyBlock & {
    emailAction: B2BCopy;
    whatsappAction: B2BCopy;
    terms: B2BCopy;
  };
}

// Keep page copy together; null or blank values render labelled placeholders.
// Gallery IDs select existing published photos; they do not create customer claims.
// The route stays noindex and outside site navigation until publication is approved.
export const b2bContent: B2BContent = {
  hero: {
    eyebrow: "For businesses, teams & communities",
    title: "Custom 3D prints for your business.",
    body: "Custom gifts, event pieces and small batches, made in Bangalore and shipped across India. Share your brief, quantity and required date, and we'll work through the print requirements with you.",
    primaryAction: "Discuss your project",
    secondaryAction: "Explore the possibilities",
    image: {
      src: "/images/b2b/bcc-bag-tag-cutout.webp",
      alt: "White Bangalore Chess Club bag tag with a black knight emblem and Chess World Cup Goa 2025 lettering, isolated from its background",
      width: 688,
      height: 1200,
      fit: "contain",
    },
    caption: "Bangalore Chess Club · Custom event bag tags",
  },
  offerings: {
    title: "What we can make for your business",
    body: "For a team gift, a community event or a short production run, we plan the material, finish and schedule around your brief.",
    items: [
      {
        id: "offering-1",
        title: "Gifts & branded pieces",
        body: "Custom keepsakes, desk pieces and display models for teams, communities and events. Share your design or branding requirements so we can discuss what is practical.",
      },
      {
        id: "offering-2",
        title: "Small-batch printing",
        body: "Short runs of parts or event items, with quantity, consistency and total print time considered together. Batch pricing is confirmed for your project.",
      },
      {
        id: "offering-3",
        title: "Prototypes & custom parts",
        body: "Fit-check models, enclosures, brackets and other custom components. We review the intended use and discuss PLA or PETG options before printing.",
      },
    ],
  },
  projects: {
    title: "Made for a club. Ready for an event.",
    body: "Custom event merchandise, decorative gifts and multi-part models from existing TaraForge3D projects.",
    items: [
      {
        id: "project-1",
        image: {
          src: "/images/b2b/bcc-bag-tag-photo.webp",
          alt: "Original photograph of a Bangalore Chess Club bag tag printed with the club's knight emblem and Chess World Cup Goa 2025 lettering",
          width: 720,
          height: 1280,
          fit: "cover",
        },
        title: "Bangalore Chess Club bag tags",
        body: "A custom-branded batch for the club's trip to the Chess World Cup 2025. The tags combine the club's knight emblem with event lettering: personalised merchandise made for a team and its event.",
        testimonialId: 2,
      },
      {
        id: "project-2",
        galleryId: "lotus-ring-holder",
        title: "Lotus ring holder",
        body: "A decorative ring holder with layered red petals in a dark, scalloped dish, printed for a customer in Delhi.",
      },
      {
        id: "project-3",
        galleryId: "upper-chest-anatomy-model",
        title: "Multi-part anatomy model",
        body: "An assembled upper-chest print showing ribs, part of a lung, a vein and an artery. An example of how several printed components come together.",
      },
    ],
  },
  process: {
    title: "From your brief to the finished batch",
    body: "We confirm the specifications, price and production schedule with you before printing starts.",
    steps: [
      {
        id: "step-1",
        title: "Share your brief",
        body: "Send a 3D file if you have one, along with the quantity, approximate size, intended use, delivery destination and required date.",
      },
      {
        id: "step-2",
        title: "Agree the details",
        body: `${QUOTE_RESPONSE_TIME} Together we confirm the files, material, finish, price and estimated production time. Any design or file-preparation work is discussed separately.`,
      },
      {
        id: "step-3",
        title: "Confirm & print",
        body: "Once the quote and 3D files are final, your 50% UPI advance confirms the project. We then begin production to the agreed schedule.",
      },
      {
        id: "step-4",
        title: "Review & dispatch",
        body: "We inspect the prints and share product and packing photos before dispatch. The balance is due before shipping; delivery is charged separately at actual cost.",
      },
    ],
  },
  faq: {
    title: "Planning a business order?",
    items: [
      {
        id: "faq-1",
        question: "Is there a minimum order quantity?",
        answer: "Tell us how many pieces you need. We assess the model, total print time and required date before confirming whether the order is a fit. Quantity pricing is quoted per project.",
      },
      {
        id: "faq-2",
        question: "Can you work with our design or branding?",
        answer: "Send your 3D files, reference images or branding brief. If you don't have a final 3D file yet, tell us what you have. We'll review what is needed and confirm any design, file-preparation or finishing work in the quote.",
      },
      {
        id: "faq-3",
        question: "What production timeline should we plan for?",
        answer: `${PRODUCTION_TIMING} Batch schedules are confirmed against the full quantity; shipping time is additional.`,
      },
    ],
  },
  enquiry: {
    title: "Tell us what you're planning",
    body: `Send your company or organisation name, a short brief, quantity, size, files or references, delivery city or PIN code, and any required date. ${QUOTE_RESPONSE_TIME}`,
    emailAction: "Email your brief",
    whatsappAction: "Discuss on WhatsApp",
    terms: `${PAYMENT_TERMS} Shipping is available across India and charged separately at actual cost.`,
  },
};
