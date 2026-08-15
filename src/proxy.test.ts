import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("admin route guard", () => {
  it.each(["/admin/login", "/admin/login/"])("allows the login route %s", (path) => {
    const response = proxy(new NextRequest(`http://site.test${path}`));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an anonymous admin request to login", () => {
    const response = proxy(new NextRequest("http://site.test/admin/"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://site.test/admin/login?returnTo=%2Fadmin%2F");
  });
});
