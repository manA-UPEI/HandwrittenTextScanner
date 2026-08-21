import { describe, expect, it } from "vitest";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import { isAppError } from "@/domain/errors/app-error";
import { fixtureImage } from "@/test/fixtures";
import { makeGeminiTranscriptionService } from "@/infrastructure/ai/providers/gemini";
import { makeMockTranscriptionService } from "@/infrastructure/ai/providers/mock";

/**
 * Every TranscriptionService adapter must satisfy the same contract —
 * this suite runs once per provider so a new adapter is verified against
 * the port (see src/domain/ports/transcription-service.ts), not eyeballed.
 */
interface ContractHarness {
  name: string;
  makeSucceeding: () => TranscriptionService;
  /** Returns an instance whose backend call fails, or null if the
   *  provider has no injectable backend to fail (e.g. a fixed mock). */
  makeFailing: () => TranscriptionService | null;
}

const multilineStubResponse = "  Line one.\n\nLine two, indented.  ";

const harnesses: ContractHarness[] = [
  {
    name: "gemini",
    makeSucceeding: () =>
      makeGeminiTranscriptionService({
        client: {
          models: {
            async generateContent({ config }) {
              if (config.abortSignal?.aborted) throw new Error("aborted");
              return { text: multilineStubResponse };
            },
          },
        },
      }),
    makeFailing: () =>
      makeGeminiTranscriptionService({
        client: {
          models: {
            generateContent: () => Promise.reject(new Error("network exploded")),
          },
        },
      }),
  },
  {
    name: "mock",
    makeSucceeding: () => makeMockTranscriptionService(),
    makeFailing: () => null,
  },
];

describe.each(harnesses)("$name transcription contract", ({ makeSucceeding, makeFailing }) => {
  it("returns trimmed, non-empty text that preserves internal line breaks", async () => {
    const result = await makeSucceeding().transcribe(fixtureImage());

    expect(result.text.length).toBeGreaterThan(0);
    expect(result.text).toBe(result.text.trim());
    expect(result.text).toContain("\n");
  });

  it("throws AppError, never a raw error, when the backend call fails", async () => {
    const failing = makeFailing();
    if (!failing) return;

    const error = await failing.transcribe(fixtureImage()).catch((e) => e);

    expect(isAppError(error)).toBe(true);
  });

  it("rejects with AppError when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const error = await makeSucceeding()
      .transcribe(fixtureImage(), { signal: controller.signal })
      .catch((e) => e);

    expect(isAppError(error)).toBe(true);
  });
});
