export interface BusinessOrderTermsSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
}

// Customer-facing sections only; internal implementation notes stay in the draft.
export const businessOrderTerms = [
  {
    id: "quotes-and-payment",
    title: "Quotes, confirmation and payment",
    paragraphs: [
      "Your quote records the project scope, specifications, charges, payment milestones and timeline. Orders require acceptance of the quote by email. Advance amounts are agreed per project. Where you supply a usable model, the production advance is payable after the quote is accepted. Production begins once specifications are finalised and the required advance is received; we confirm commencement by email. Full payment is required before dispatch. We do not offer credit terms.",
    ],
  },
  {
    id: "design-and-model-preparation",
    title: "Design and model preparation",
    paragraphs: [
      "Where CAD development or substantial model preparation is needed, we assess feasibility and quote that work separately. Its scope, charges, advance, included revisions and deliverables are agreed before work begins. The design advance is payable before design work starts. Final production pricing and timelines are confirmed once the model is finalised and approved. Design charges do not include CAD-file delivery unless expressly quoted.",
    ],
  },
  {
    id: "samples",
    title: "Samples",
    paragraphs: [
      "Sampling depends on project requirements and technical feasibility. Customers bear the sample cost unless a discount is agreed in the quote. Samples are priced separately and may cost more per piece than a production batch. Customer-requested changes may require a revised quote and another paid sample. If a sample fails the agreed specification because of our error, we bear the cost of correcting or remaking it.",
    ],
  },
  {
    id: "order-changes",
    title: "Changes to confirmed orders",
    paragraphs: [
      "Changes require a revised quote and may affect payment milestones and timelines. Any additional advance must be received before production proceeds. If the revised price is lower, the existing advance is adjusted against the revised amount. A scope reduction does not remove charges for approved work or project costs already incurred. Any eligible surplus is refunded after those amounts are accounted for. No refund is due while charges for approved work or project costs exceeding the advance remain unpaid.",
    ],
  },
  {
    id: "cancellation-and-refunds",
    title: "Cancellation and refunds",
    paragraphs: [
      "Advances for confirmed projects or samples are not automatically refundable when the customer cancels. We review reasonable cancellation requests individually and may offer a partial refund after considering completed work and project costs already incurred or irreversibly committed. Approved third-party model purchases, licence fees and other project costs that cannot be recovered remain chargeable for customer-initiated cancellations.",
      "If TaraForge3D cancels for technical or business reasons unrelated to the customer, payments for the cancelled project are refunded in full, including approved model or licence fees. Quality claims are assessed separately under section 7.",
    ],
  },
  {
    id: "timelines-and-deadlines",
    title: "Timelines and deadlines",
    paragraphs: [
      "Timelines and known scheduling constraints are agreed by email before work begins. We communicate any further anticipated delay as soon as it is identified. Urgent requirements may attract higher pricing. Any compensation for missing an agreed deadline must be expressly defined in the quote, including the deadline concerned, the circumstances covered, the calculation and the maximum amount.",
    ],
  },
  {
    id: "quality-and-shipping",
    title: "Quality, shipping and order problems",
    paragraphs: [
      "Intended use, finish expectations, critical dimensions and inherent printing variations are discussed in advance and recorded in the quote. We inspect orders and share product and packing photos before dispatch. Shipping across India is charged separately at actual carrier cost and confirmed before dispatch.",
      "Please retain an unboxing video, photographs and packaging to support claims involving delivery damage or shortages. Defects or specification concerns should be reported with order details and supporting evidence. We review problems individually and consider correction, replacement or refund as appropriate; the absence of an unboxing video does not automatically exclude a claim. Any required return and verified refund are handled under our shipping and returns policy. Applicable legal rights remain unaffected.",
    ],
  },
  {
    id: "design-rights-and-files",
    title: "Design rights, files and third-party models",
    paragraphs: [
      "TaraForge3D retains rights in its original designs. Rights in customer-supplied and third-party material remain with their respective owners. Customers must have permission for artwork, branding and models they supply.",
      "CAD files are excluded from standard deliverables and may be supplied for an additional quoted charge. File supply does not itself transfer ownership; permitted uses are specified in the quote. Third-party model purchases and commercial-use licence fees are charged to the customer and approved before purchase. The relevant licence must permit the proposed production and intended sale. Finished products may be purchased for onward sale where the applicable design and artwork licences permit.",
    ],
  },
] as const satisfies readonly BusinessOrderTermsSection[];
