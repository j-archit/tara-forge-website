import { TeamClient } from "./TeamClient";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "The Team",
  "Meet the makers and engineers at TaraForge3D. Engineering rigor meeting additive manufacturing.",
  "/team"
);

export default function TeamPage() {
  return <TeamClient />;
}
