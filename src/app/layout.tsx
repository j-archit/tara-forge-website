import type { Metadata } from "next";
import "./globals.css";
import { CelestialBackground } from "@/components/CelestialBackground";
import { Analytics } from "@/components/Analytics";
import { createPageMetadata, SITE_NAME, SITE_URL } from "@/lib/siteMetadata";
import { businessSchema, serializeJsonLd } from "@/lib/structuredData";

export const metadata: Metadata = {
  ...createPageMetadata(
    "Custom 3D Printing in Bangalore",
    "Bangalore-based 3D printing for prototypes, functional parts, figurines and small batches in PLA and PETG. Quotes within 24 hours; shipping across India.",
    "/"
  ),
  metadataBase: new URL(SITE_URL),
  title: { default: `Custom 3D Printing in Bangalore | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  authors: [{ name: SITE_NAME }], creator: SITE_NAME, publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [{ url: "/brand/app-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    apple: [{ url: "/brand/app-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/archivo-5.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(businessSchema()) }} />
      </head>
      <body className="relative isolate antialiased bg-background text-foreground">
        <CelestialBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
