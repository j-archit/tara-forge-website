import { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { createPageMetadata } from "@/lib/siteMetadata";
import { gallerySchema, serializeJsonLd } from "@/lib/structuredData";
import { galleryItems } from "@/data/gallery";

export const metadata: Metadata = createPageMetadata(
  "Custom 3D Print Gallery Bangalore & Across India",
  "Explore custom 3D prints from our Bangalore studio: prototypes, functional parts, display models and gifts. Made for customers locally and across India.",
  "/gallery"
);

export default function GalleryPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(gallerySchema(galleryItems)) }} /><GalleryClient /></>;
}
