// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntakeForm } from "./IntakeForm";

vi.mock("@/lib/analytics", () => ({
  trackFormStep: vi.fn(),
  trackFileUpload: vi.fn(),
}));

describe("IntakeForm", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000001");
  });

  it("submits the project as multipart data with an idempotency key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 201 }));
    const user = userEvent.setup();
    render(<IntakeForm />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.selectOptions(screen.getByLabelText(/service type/i), "prototyping");
    await user.selectOptions(screen.getByLabelText(/preferred material/i), "pla");
    await user.type(screen.getByLabelText(/project description/i), "A test enclosure");
    await user.upload(document.querySelector<HTMLInputElement>("input[type=file]")!, new File(["solid model"], "case.stl"));
    await user.click(screen.getByRole("button", { name: /send to the forge/i }));

    await screen.findByText("Transmission Received");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/intake");
    expect(init?.headers).toEqual({ "Idempotency-Key": "00000000-0000-4000-8000-000000000001" });
    const body = init?.body as FormData;
    expect(body.get("name")).toBe("Ada Lovelace");
    expect((body.get("file") as File).name).toBe("case.stl");
  });

  it("rejects a model larger than 25 MB before submission", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<IntakeForm />);
    const input = document.querySelector<HTMLInputElement>("input[type=file]")!;
    const oversized = new File([new Uint8Array(25 * 1024 * 1024 + 1)], "huge.stl");

    fireEvent.change(input, { target: { files: [oversized] } });

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Please upload a model no larger than 25 MB."));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
