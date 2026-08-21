import { describe, expect, it } from "vitest";
import { isProviderId, transcriptionProviders } from "@/infrastructure/ai/registry";

describe("transcriptionProviders registry", () => {
  it("includes gemini and mock", () => {
    expect(Object.keys(transcriptionProviders).sort()).toEqual(["gemini", "mock"]);
  });

  it("builds a TranscriptionService for every registered provider without reading env", () => {
    // Building a provider must not require its configuration — only
    // calling transcribe() should. This keeps AI_PROVIDER=nonsense
    // detectable before any adapter is even constructed.
    for (const factory of Object.values(transcriptionProviders)) {
      expect(factory()).toHaveProperty("transcribe");
    }
  });
});

describe("isProviderId", () => {
  it("accepts a registered provider id", () => {
    expect(isProviderId("mock")).toBe(true);
    expect(isProviderId("gemini")).toBe(true);
  });

  it("rejects an unregistered provider id", () => {
    expect(isProviderId("openai")).toBe(false);
  });
});
