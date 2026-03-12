import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tara Forge • 3D Printing Studio",
  description:
    "Tara Forge is a 3D printing studio inspired by “Tara” (Star). We turn ideas into real parts, prototypes, and keepsakes — Forged in the Stars.",
  keywords: [
    "Tara Forge",
    "3D printing",
    "3D printed parts",
    "3D printed prototypes",
    "custom 3D prints",
    "miniatures",
    "cosplay props",
  ],
  openGraph: {
    title: "Tara Forge • 3D Printing Studio",
    description:
      "A 3D printing studio inspired by “Tara” (Star). Prototypes, custom parts, and prints — Forged in the Stars.",
    siteName: "Tara Forge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tara Forge • 3D Printing Studio",
    description:
      "3D printed prototypes, custom parts, and miniatures inspired by “Tara” (Star). Forged in the Stars.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="celestial-stars" />
        {children}
      </body>
    </html>
  );
}
