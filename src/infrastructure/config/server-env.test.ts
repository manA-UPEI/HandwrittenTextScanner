import { afterEach, describe, expect, it } from "vitest";
import { resolveAiProvider } from "@/infrastructure/config/server-env";
import { isAppError } from "@/domain/errors/app-error";

describe("resolveAiProvider", () => {
  const originalValue = process.env.AI_PROVIDER;

  afterEach(() => {
    process.env.AI_PROVIDER = originalValue;
  });

  it("defaults to gemini when AI_PROVIDER is unset", () => {
    delete process.env.AI_PROVIDER;
    expect(resolveAiProvider()).toBe("gemini");
  });

  it("accepts a registered provider id", () => {
    process.env.AI_PROVIDER = "mock";
    expect(resolveAiProvider()).toBe("mock");
  });

  it("fails fast with a helpful message for an unregistered provider id", () => {
    process.env.AI_PROVIDER = "nonsense";

    const error = ((): unknown => {
      try {
        resolveAiProvider();
        return undefined;
      } catch (e) {
        return e;
      }
    })();

    expect(isAppError(error)).toBe(true);
    expect((error as { code: string }).code).toBe("CONFIG_MISSING");
    expect((error as { message: string }).message).toContain("nonsense");
    expect((error as { message: string }).message).toContain("gemini");
    expect((error as { message: string }).message).toContain("mock");
  });
});
