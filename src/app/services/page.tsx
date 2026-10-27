import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { createPageMetadata } from "@/lib/siteMetadata";
import { serviceCatalogSchema, serializeJsonLd } from "@/lib/structuredData";
import { detailedServices } from "@/data/services";

export const metadata: Metadata = createPageMetadata(
  "3D Printing Services Bangalore & Across India",
  "Custom 3D prints from Bangalore for prototypes, functional parts, figurines and small batches in PLA and PETG. Request a quote with shipping across India.",
  "/services"
);

export default function ServicesPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceCatalogSchema(detailedServices)) }} /><ServicesClient /></>;
}
