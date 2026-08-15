// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./AdminDashboard";
import { adminApi } from "@/lib/admin-api";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("@/lib/admin-api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/admin-api")>();
  return {
    ...original,
    adminApi: {
      session: vi.fn(), logout: vi.fn(), submissions: vi.fn(), clients: vi.fn(), gallery: vi.fn(), store: vi.fn(),
      profiles: vi.fn(), templates: vi.fn(), jobs: vi.fn(), createGallery: vi.fn(), saveGallery: vi.fn(),
      deleteGallery: vi.fn(), createStore: vi.fn(), saveStore: vi.fn(), deleteStore: vi.fn(),
      uploadMedia: vi.fn(), slice: vi.fn(), email: vi.fn(), saveProfile: vi.fn(), saveTemplate: vi.fn(), retryJob: vi.fn(),
    },
  };
});

const mocked = vi.mocked(adminApi);

describe("AdminDashboard", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.session.mockResolvedValue({ admin: { id: 1, email: "admin@example.com" } });
    mocked.submissions.mockResolvedValue([]);
    mocked.clients.mockResolvedValue([]);
    mocked.gallery.mockResolvedValue([]);
    mocked.store.mockResolvedValue([]);
    mocked.profiles.mockResolvedValue([]);
    mocked.templates.mockResolvedValue({});
    mocked.jobs.mockResolvedValue([]);
    mocked.createGallery.mockResolvedValue({ id: 1, title: "Gearbox", category: "Prior prints", description: "A finished print", tags: [], imageUrl: null, gradient: "from-slate-800", accent: "gold", published: true, sortOrder: 0 });
    mocked.createStore.mockResolvedValue({ id: "desk-stand", title: "Desk stand", category: "Desk", description: "A useful stand", pricePaise: 129900, currency: "₹", imageUrl: null, gradient: "from-slate-800", accent: "gold", badge: null, published: true, available: true, sortOrder: 0 });
    mocked.uploadMedia.mockResolvedValue({ url: "/api/content/media/example.png", fileName: "example.png", byteSize: 10 });
  });

  it("creates a managed gallery item", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);
    expect(await screen.findByText("Everything that needs your attention.")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /Prior prints/ })[0]);
    await user.click(screen.getByRole("button", { name: "Add print" }));
    await user.type(screen.getByLabelText("Title"), "Gearbox");
    await user.type(screen.getByLabelText("Description"), "A finished print");
    await user.click(screen.getByLabelText("Published on gallery"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocked.createGallery).toHaveBeenCalledWith(expect.objectContaining({ title: "Gearbox", published: true })));
  });

  it("creates a priced and available store listing", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);
    await screen.findByText("Everything that needs your attention.");
    await user.click(screen.getAllByRole("button", { name: /^Store$/ })[0]);
    await user.click(screen.getByRole("button", { name: "Add listing" }));
    fireEvent.change(screen.getByLabelText("Slug / SKU"), { target: { value: "desk-stand" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Desk stand" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Desk" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "A useful stand" } });
    fireEvent.change(screen.getByLabelText("Price (₹)"), { target: { value: "1299" } });
    await user.click(screen.getByLabelText("Published in store"));
    await user.click(screen.getByLabelText("Available to buy"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocked.createStore).toHaveBeenCalledWith(expect.objectContaining({ id: "desk-stand", pricePaise: 129900, available: true })));
  });

  it("uploads an image into the managed content vault", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);
    await screen.findByText("Everything that needs your attention.");
    await user.click(screen.getAllByRole("button", { name: /Prior prints/ })[0]);
    await user.click(screen.getByRole("button", { name: "Add print" }));
    const file = new File(["image"], "example.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Upload image"), file);
    await waitFor(() => expect(mocked.uploadMedia).toHaveBeenCalledWith(file));
    expect(screen.getByLabelText("Image URL")).toHaveValue("/api/content/media/example.png");
  });
});
