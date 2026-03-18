import { TeamClient } from "./TeamClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Team",
  description: "Meet the makers and engineers at TaraForge3D. Engineering rigor meeting additive manufacturing.",
};

export default function TeamPage() {
  return <TeamClient />;
}
