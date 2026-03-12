import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Configure the app for static export so it can be deployed
   * to GitHub Pages or any static host.
   */
  output: "export",
  images: {
    /**
     * Static export does not support the default Image optimization.
     * This falls back to standard <img> behavior while keeping
     * the same API surface.
     */
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
