import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "Services",
  "Explore our specialized 3D printing services, from rapid prototyping and custom functional parts to small-batch manufacturing and artistic prints.",
  "/services"
);

export default function ServicesPage() {
  return <ServicesClient />;
}
