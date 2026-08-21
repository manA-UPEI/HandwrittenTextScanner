import { describe, expect, it } from "vitest";
import { makeTranscribeImage } from "@/use-cases/transcribe-image";
import { makeFakeRateLimiter, makeFakeTranscriptionService } from "@/test/fakes";
import { fixtureImage, SAMPLE_TRANSCRIPTION_TEXT } from "@/test/fixtures";
import { AppError, isAppError } from "@/domain/errors/app-error";

describe("makeTranscribeImage", () => {
  it("returns the transcription service's text unchanged", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiter: makeFakeRateLimiter(),
    });

    const result = await transcribeImage(fixtureImage(), "client-1");

    expect(result.text).toBe(SAMPLE_TRANSCRIPTION_TEXT);
  });

  it("rejects an invalid image before calling the transcription service", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiter: makeFakeRateLimiter(),
    });

    // @ts-expect-error deliberately invalid mime type for the guard test
    const badImage = fixtureImage({ mimeType: "image/gif" });

    await expect(transcribeImage(badImage, "client-1")).rejects.toSatisfy(isAppError);
    expect(transcription.calls).toHaveLength(0);
  });

  it("propagates RATE_LIMITED without calling the transcription service", async () => {
    const transcription = makeFakeTranscriptionService();
    const transcribeImage = makeTranscribeImage({
      transcription,
      rateLimiter: makeFakeRateLimiter({ rejectAfter: 0 }),
    });

    const error = await transcribeImage(fixtureImage(), "client-1").catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("RATE_LIMITED");
    expect(transcription.calls).toHaveLength(0);
  });
});
