// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./admin-api";

describe("apiRequest", () => {
  beforeEach(() => {
    document.cookie = "tf_admin_csrf=csrf-token; path=/";
    vi.restoreAllMocks();
  });

  it("adds JSON and CSRF headers to mutations", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ ok: true }));
    await apiRequest("/api/admin/jobs/2/retry", { method: "POST", body: JSON.stringify({}) });

    const init = fetchMock.mock.calls[0][1]!;
    const headers = init.headers as Headers;
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-csrf-token")).toBe("csrf-token");
    expect(init.cache).toBe("no-store");
  });

  it("preserves the multipart boundary for media uploads", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ url: "/image.png" }));
    const body = new FormData();
    body.append("file", new File(["image"], "image.png", { type: "image/png" }));
    await apiRequest("/api/admin/content/media", { method: "POST", body });
    const headers = fetchMock.mock.calls[0][1]!.headers as Headers;
    expect(headers.has("content-type")).toBe(false);
    expect(headers.get("x-csrf-token")).toBe("csrf-token");
  });
});
