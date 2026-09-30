import { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { createPageMetadata } from "@/lib/siteMetadata";
import { gallerySchema, serializeJsonLd } from "@/lib/structuredData";
import { galleryItems } from "@/data/gallery";

export const metadata: Metadata = createPageMetadata(
  "Gallery",
  "Explore our collection of 3D printed prototypes, functional parts, and small-batch manufacturing projects.",
  "/gallery"
);

export default function GalleryPage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(gallerySchema(galleryItems)) }} /><GalleryClient /></>;
}
