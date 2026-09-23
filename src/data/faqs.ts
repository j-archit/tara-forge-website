import { CONTACT, PAYMENT_TERMS, PRODUCTION_TIMING, QUOTE_RESPONSE_TIME } from "./siteContent";

export interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

export const faqs: readonly FAQItem[] = [
  {
    question: "Where is TaraForge3D located?",
    answer: "We are a 3D printing studio based in Bangalore, serving creators, engineers, and makers across India.",
  },
  {
    question: "What materials do you print with?",
    answer: "We focus on PLA for detailed prints and PETG for functional parts that need better heat resistance and durability.",
  },
  {
    question: "Do you offer small-batch manufacturing?",
    answer: "Yes. We make custom series and small batches. Tell us your quantity and requirements so we can confirm capacity and timing in the quote.",
  },
  {
    question: "How do I get a quote for my 3D printing project?",
    answer: `Email your 3D design file and project details to ${CONTACT.email}. We review printability, material, quantity, and complexity. ${QUOTE_RESPONSE_TIME}`,
  },
  {
    question: "How long does production take?",
    answer: PRODUCTION_TIMING,
  },
  {
    question: "What payment methods and terms do you offer?",
    answer: PAYMENT_TERMS,
  },
  {
    question: "Can you help optimize my design for 3D printing?",
    answer: "Yes. We can discuss wall thickness, supports, and print orientation while reviewing your project. Any design work and its cost should be agreed in the quote.",
  },
];
