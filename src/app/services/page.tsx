import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { createPageMetadata } from "@/lib/siteMetadata";
import { serviceCatalogSchema, serializeJsonLd } from "@/lib/structuredData";
import { detailedServices } from "@/data/services";

export const metadata: Metadata = createPageMetadata(
  "3D Printing Services in Bangalore",
  "Custom 3D printing in Bangalore for prototypes, functional parts, small batches and figurines in PLA and PETG, with shipping across India. Request a quote.",
  "/services"
);

export default function ServicesPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceCatalogSchema(detailedServices)) }} /><ServicesClient /></>;
}
