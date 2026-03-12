import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore our collection of 3D printed prototypes, functional parts, and small-batch manufacturing projects.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
