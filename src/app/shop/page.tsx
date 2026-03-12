import { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "The Shop",
  description: "Browse the Stellar Collection—a curated selection of our signature 3D printed designs, available for individual purchase and small batches.",
};

export default function ShopPage() {
  return <ShopClient />;
}
