import { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/siteMetadata";
import { galleryItems } from "@/data/gallery";
import { galleryImageUrls } from "@/lib/structuredData";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // No build timestamps: lastmod should describe a real content update.
  // The coming-soon catalogue is intentionally noindex until it is ready.
  return ["/", "/services/", "/gallery/", "/team/", "/quote/", "/shipping-returns/"]
    .map(path => ({ url: canonicalUrl(path), ...(path === "/gallery/" ? { images: galleryImageUrls(galleryItems) } : {}) }));
}
