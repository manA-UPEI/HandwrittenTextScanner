import { describe, expect, it } from "vitest";
import { sanitizeForWinAnsi } from "@/infrastructure/pdf/winansi";

describe("sanitizeForWinAnsi", () => {
  it("leaves plain ASCII untouched", () => {
    expect(sanitizeForWinAnsi("Dear diary,\nToday was good.")).toBe(
      "Dear diary,\nToday was good.",
    );
  });

  it("maps smart quotes and dashes to plain equivalents", () => {
    expect(sanitizeForWinAnsi("“Hello” — it’s me")).toBe('"Hello" -- it\'s me');
  });

  it("maps an ellipsis and a bullet", () => {
    expect(sanitizeForWinAnsi("wait… • done")).toBe("wait... * done");
  });

  it("replaces an emoji with a placeholder character instead of throwing", () => {
    expect(() => sanitizeForWinAnsi("great job 🎉")).not.toThrow();
    expect(sanitizeForWinAnsi("great job 🎉")).toBe("great job ?");
  });

  it("preserves accented Latin-1 characters", () => {
    expect(sanitizeForWinAnsi("café naïve")).toBe("café naïve");
  });
});
