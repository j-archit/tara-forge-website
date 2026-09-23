export interface ContactDetails {
  readonly email: string;
  readonly whatsappNumber: string;
}

export const CONTACT = {
  email: "taraforge3d@gmail.com",
  whatsappNumber: "917042337788",
} satisfies ContactDetails;

export const PAYMENT_TERMS =
  "We currently accept UPI only. For printing projects, 50% is due when you confirm the project, and the remaining 50% is due before shipping.";

export const QUOTE_RESPONSE_TIME = "We respond to quote requests within 24 hours.";

export const PRODUCTION_TIMING =
  "Typical projects are completed within 48 hours after the quote and 3D files are finalised and the 50% advance is received. Timing depends on the print time and project requirements.";

export const SHOP_NOTICE =
  "Prices shown are indicative. Please ask about availability, final pricing, and shipping before confirming an order or making a payment.";

export interface JourneyStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

export const CUSTOMER_JOURNEY: readonly JourneyStep[] = [
  {
    number: "01",
    title: "Send your project",
    description: "Email your design files and tell us the material, quantity, size, and intended use. If you do not have a final file yet, tell us what you have.",
  },
  {
    number: "02",
    title: "Finalise the quote",
    description: "We respond within 24 hours. Together we confirm the 3D files, print requirements, price, and estimated production time.",
  },
  {
    number: "03",
    title: "Confirm and print",
    description: "Pay 50% by UPI to confirm your project. We begin production once the quote and 3D files are final and the advance is received.",
  },
  {
    number: "04",
    title: "Final payment and shipping",
    description: "We inspect the finished print. The remaining 50% is due before shipping, then we arrange dispatch and share the details with you.",
  },
];
