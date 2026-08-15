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
});
