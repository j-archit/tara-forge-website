// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLogin } from "./AdminLogin";

const replace = vi.fn();
const refresh = vi.fn();
const getSearchParam = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => ({ get: getSearchParam }),
}));

vi.mock("@/components/Logo", () => ({
  Logo: () => <svg aria-label="Tara Forge" />,
}));

describe("AdminLogin", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    getSearchParam.mockReturnValue(null);
  });

  it("signs in and opens the admin console", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "correct horse battery staple");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({ method: "POST" }));
    expect(replace).toHaveBeenCalledWith("/admin");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("shows rejected credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The email or password was not accepted.");
    expect(replace).not.toHaveBeenCalled();
  });
});
