import { afterEach, describe, expect, it } from "vitest";
import { makeGeminiTranscriptionService } from "@/infrastructure/ai/providers/gemini";
import { isAppError } from "@/domain/errors/app-error";
import { fixtureImage } from "@/test/fixtures";

describe("makeGeminiTranscriptionService (config resolution)", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  it("throws CONFIG_MISSING when no API key is available anywhere", async () => {
    delete process.env.GEMINI_API_KEY;
    const service = makeGeminiTranscriptionService();

    const error = await service.transcribe(fixtureImage()).catch((e) => e);

    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("CONFIG_MISSING");
    expect(error.message).toContain("GEMINI_API_KEY");
  });

  it("does not require an API key when a client override is supplied", async () => {
    delete process.env.GEMINI_API_KEY;
    const service = makeGeminiTranscriptionService({
      client: { models: { generateContent: async () => ({ text: "hello\nworld" }) } },
    });

    await expect(service.transcribe(fixtureImage())).resolves.toEqual({ text: "hello\nworld" });
  });
});
