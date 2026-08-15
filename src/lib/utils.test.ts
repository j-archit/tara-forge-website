import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combines conditional class names", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("resolves conflicting Tailwind utilities", () => {
    expect(cn("px-2", "px-6")).toBe("px-6");
  });
});
