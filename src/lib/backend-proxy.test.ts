import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { proxyToBackend } from "./backend-proxy";

describe("proxyToBackend", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("forwards the method, query, body, and approved headers", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "submission-1" }), { status: 201, headers: { "content-type": "application/json" } }),
    );
    const request = new Request("http://site.test/api/intake?source=web", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "key-1", "x-forwarded-for": "203.0.113.10", authorization: "secret" },
      body: JSON.stringify({ name: "Ada" }),
    });

    const response = await proxyToBackend(request, "/api/intake");

    expect(response.status).toBe(201);
    const [target, init] = fetchMock.mock.calls[0];
    expect(String(target)).toBe("http://127.0.0.1:8000/api/intake?source=web");
    const headers = init?.headers as Headers;
    expect(headers.get("idempotency-key")).toBe("key-1");
    expect(headers.get("x-forwarded-for")).toBe("203.0.113.10");
    expect(headers.has("authorization")).toBe(false);
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toContain("Ada");
  });

  it("returns a service-unavailable response when the backend cannot be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    const response = await proxyToBackend(new Request("http://site.test/api/admin/jobs"), "/api/admin/jobs");

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ detail: "Application service is temporarily unavailable" });
  });
});
