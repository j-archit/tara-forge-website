import { Metadata } from "next";
import ShopClient from "./ShopClient";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "3D Printed Designs Bangalore & Across India",
  "Preview TaraForge3D's 3D printed designs from our Bangalore studio. Ask about availability, small-batch orders and shipping across India.",
  "/shop",
  { index: false }
);

export default function ShopPage() {
  return <ShopClient />;
}
