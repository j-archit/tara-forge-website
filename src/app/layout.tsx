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
    "Tara Forge is a 3D printing studio inspired by “Tara” (Star). We turn ideas into real parts, prototypes, and keepsakes — Forged in the Stars.",
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
    icon: "/Logo.svg",
    apple: "/Logo.svg",
  },
  openGraph: {
    title: "Tara Forge • 3D Printing Studio",
    description:
      "Tara Forge is a 3D printing studio inspired by “Tara” (Star). We turn ideas into real parts, prototypes, and keepsakes — Forged in the Stars.",
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
      "Tara Forge is a 3D printing studio inspired by “Tara” (Star). We turn ideas into real parts, prototypes, and keepsakes — Forged in the Stars.",
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
