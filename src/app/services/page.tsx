import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our specialized 3D printing services, from rapid prototyping and custom functional parts to small-batch manufacturing and artistic prints.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
