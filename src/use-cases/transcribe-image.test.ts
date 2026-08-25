import { describe, expect, it } from "vitest";
import { makeTranscribeImage, type RateLimiters } from "@/use-cases/transcribe-image";
import { makeFakeRateLimiter, makeFakeTranscriptionService } from "@/test/fakes";
import { fixtureImage, SAMPLE_TRANSCRIPTION_TEXT } from "@/test/fixtures";
import { AppError, isAppError } from "@/domain/errors/app-error";

const identifiers = { userId: "client-1", ip: "127.0.0.1" };

const allowAllRateLimiters = (): RateLimiters => ({
  perUser: makeFakeRateLimiter(),
  perIp: makeFakeRateLimiter(),
  global: makeFakeRateLimiter(),
});

describe("makeTranscribeImage", () => {
  it("returns the transcription service's text unchanged", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiters: allowAllRateLimiters(),
    });

    const result = await transcribeImage(fixtureImage(), identifiers);

    expect(result.text).toBe(SAMPLE_TRANSCRIPTION_TEXT);
  });

  it("rejects an invalid image before calling the transcription service", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiters: allowAllRateLimiters(),
    });

    // @ts-expect-error deliberately invalid mime type for the guard test
    const badImage = fixtureImage({ mimeType: "image/gif" });

    await expect(transcribeImage(badImage, identifiers)).rejects.toSatisfy(isAppError);
    expect(transcription.calls).toHaveLength(0);
  });

  it("propagates RATE_LIMITED from the per-user limiter without transcribing", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiters: { ...allowAllRateLimiters(), perUser: makeFakeRateLimiter({ rejectAfter: 0 }) },
    });

    const error = await transcribeImage(fixtureImage(), identifiers).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("RATE_LIMITED");
    expect(transcription.calls).toHaveLength(0);
  });

  it("propagates RATE_LIMITED from the per-IP limiter without transcribing", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiters: { ...allowAllRateLimiters(), perIp: makeFakeRateLimiter({ rejectAfter: 0 }) },
    });

    const error = await transcribeImage(fixtureImage(), identifiers).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("RATE_LIMITED");
    expect(transcription.calls).toHaveLength(0);
  });

  it("propagates RATE_LIMITED from the global limiter without transcribing", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiters: { ...allowAllRateLimiters(), global: makeFakeRateLimiter({ rejectAfter: 0 }) },
    });

    const error = await transcribeImage(fixtureImage(), identifiers).catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("RATE_LIMITED");
    expect(transcription.calls).toHaveLength(0);
  });
});
