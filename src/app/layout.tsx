import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://taraforge.in"),
  title: {
    default: "Tara Forge • 3D Printing Studio",
    template: "%s | Tara Forge"
  },
  description:
    "Tara Forge is a 3D printing studio providing refined prototypes, functional parts, and custom components with a premium quality finish.",
  keywords: [
    "Tara Forge",
    "3D printing India",
    "3D printing Bangalore",
    "custom 3D parts",
    "functional prototyping",
    "PETG batch manufacturing",
    "PLA printing services",
    "industrial 3D printing India",
  ],
  authors: [{ name: "Tara Forge" }],
  creator: "Tara Forge",
  publisher: "Tara Forge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://taraforge.in/",
  },
  icons: {
    icon: [
      { url: "/Logo.svg", type: "image/svg+xml" },
      { url: "/Logo.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    shortcut: "/Logo.svg",
    apple: "/Logo.svg",
  },
  openGraph: {
    title: "Tara Forge • 3D Printing Studio",
    description:
      "Tara Forge is a 3D printing studio providing refined prototypes, functional parts, and custom components with a premium quality finish.",
    url: "https://taraforge.in/",
    siteName: "Tara Forge",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tara Forge • 3D Printing Studio Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tara Forge • 3D Printing Studio",
    description:
      "Tara Forge is a 3D printing studio providing refined prototypes, functional parts, and custom components with a premium quality finish.",
    images: ["/og-image.png"],
  },
};

import { CelestialBackground } from "@/components/CelestialBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:            JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://taraforge.in/#organization",
                  "name": "Tara Forge",
                  "url": "https://taraforge.in",
                  "logo": "https://taraforge.in/Logo.svg",
                  "image": "https://taraforge.in/Logo.svg",
                  "description": "Boutique 3D printing studio specializing in refined prototypes, functional parts, and small-batch manufacturing.",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Bangalore",
                    "addressRegion": "Karnataka",
                    "addressCountry": "IN"
                  },
                  "sameAs": [
                    "https://www.instagram.com/taraforge"
                  ]
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://taraforge.in/#localbusiness",
                  "name": "Tara Forge",
                  "description": "Specialized 3D printing services in Mumbai and Bangalore.",
                  "url": "https://taraforge.in",
                  "telephone": "+91-XXXXXXXXXX",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Bangalore",
                    "addressRegion": "Karnataka",
                    "addressCountry": "IN"
                  },
                  "areaServed": [
                    { "@type": "City", "name": "Mumbai" },
                    { "@type": "City", "name": "Bangalore" }
                  ]
                },
                {
                  "@type": "Service",
                  "name": "Custom 3D Printing & Prototyping",
                  "provider": { "@id": "https://taraforge.in/#organization" },
                  "description": "Functional prototypes, custom parts, and small batch 3D printing in PLA and PETG.",
                  "areaServed": "IN"
                }
              ]
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CelestialBackground />
        {children}
      </body>
    </html>
  );
}
