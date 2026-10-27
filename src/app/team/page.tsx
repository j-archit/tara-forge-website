import { TeamClient } from "./TeamClient";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "Our Team — Bangalore Studio Serving India",
  "Meet the makers behind TaraForge3D, a Bangalore-based studio creating custom 3D prints for customers locally and across India.",
  "/team"
);

export default function TeamPage() {
  return <TeamClient />;
}
