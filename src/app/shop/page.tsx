import { Metadata } from "next";
import ShopClient from "./ShopClient";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = createPageMetadata(
  "The Shop",
  "Preview the Stellar Collection and ask about availability of our signature 3D printed designs and small-batch orders.",
  "/shop"
);

export default function ShopPage() {
  return <ShopClient />;
}
