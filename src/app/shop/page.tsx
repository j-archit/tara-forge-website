import { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "The Shop",
  description: "Browse the Stellar Collection—our signature 3D printed designs, ready for your fleet or collection.",
};

export default function ShopPage() {
  return <ShopClient />;
}
