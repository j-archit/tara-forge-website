// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GalleryClient from "./gallery/GalleryClient";
import ShopClient from "./shop/ShopClient";

vi.mock("@/components/Navbar", () => ({ Navbar: () => <nav /> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer /> }));
vi.mock("@/components/TestimonialMarquee", () => ({ TestimonialMarquee: () => <div /> }));
vi.mock("@/components/Logo", () => ({ Logo: () => <svg /> }));
vi.mock("@/lib/analytics", () => ({ trackCTA: vi.fn(), trackEvent: vi.fn(), trackProductInterest: vi.fn() }));
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    article: ({ children }: { children: React.ReactNode }) => <article>{children}</article>,
  },
}));

describe("managed public content", () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("renders gallery records returned by the backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{
      id: 44, title: "Managed turbine", category: "Prior prints", description: "Backend copy",
      tags: ["PETG"], imageUrl: null, gradient: "from-slate-900", accent: "gold",
      published: true, sortOrder: 0,
    }]), { status: 200, headers: { "Content-Type": "application/json" } }));
    render(<GalleryClient />);
    expect(await screen.findByText("Managed turbine")).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/content/gallery", expect.objectContaining({ cache: "no-store" }));
  });

  it("renders backend store availability and pricing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{
      id: "managed-stand", title: "Managed stand", category: "Desk", description: "Backend listing",
      pricePaise: 129900, currency: "₹", imageUrl: null, gradient: "from-slate-900", accent: "gold",
      badge: "New", published: true, available: true, sortOrder: 0,
    }]), { status: 200, headers: { "Content-Type": "application/json" } }));
    render(<ShopClient />);
    expect(await screen.findByText("Managed stand")).toBeInTheDocument();
    expect(screen.getByText("₹1,299")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buy Now" })).toBeInTheDocument();
    expect(screen.getByText("Now Open")).toBeInTheDocument();
  });
});
