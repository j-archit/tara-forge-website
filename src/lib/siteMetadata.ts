import type { Metadata } from "next";

export const SITE_URL = "https://taraforge3d.in";
export const SITE_NAME = "TaraForge3D";
export const HOME_PAGE_TITLE = "Custom 3D Prints Bangalore & Across India";
export const HOME_PAGE_DESCRIPTION = "Bangalore-based custom 3D prints in PLA and PETG for prototypes, functional parts, figurines and small batches. Quotes within 24 hours; shipping across India.";

export function canonicalUrl(path = "/"): string {
  const url = new URL(path, SITE_URL);
  if (url.origin !== SITE_URL) throw new Error("Canonical URLs must use the public site origin");
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function createPageMetadata(title: string, description: string, path: string, options: { index?: boolean } = {}): Metadata {
  const url = canonicalUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(options.index === false ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `${SITE_NAME} — custom 3D prints from Bangalore, shipping across India` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}
