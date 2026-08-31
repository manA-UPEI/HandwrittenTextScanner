import type { TranscriptionService } from "@/domain/ports/transcription-service";
import { AppError } from "@/domain/errors/app-error";

/** Exported so e2e tests can assert against it without duplicating the literal. */
export const MOCK_TRANSCRIPTION_TEXT = [
  "This is a mock transcription.",
  "",
  "Set AI_PROVIDER=gemini and GEMINI_API_KEY in .env.local",
  "to transcribe real handwriting instead.",
].join("\n");

const SIMULATED_LATENCY_MS = 400;

const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const cancelled = () =>
      reject(new AppError("TRANSCRIPTION_FAILED", "Transcription was cancelled."));

    if (signal?.aborted) {
      cancelled();
      return;
    }

    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      cancelled();
    });
  });

/**
 * Offline TranscriptionService: no network call, no API key, deterministic
 * output. This is what AI_PROVIDER=mock selects, and it's the standing
 * proof that nothing above the TranscriptionService port depends on
 * Gemini — the whole capture-to-PDF flow works with this adapter alone.
 */
export const makeMockTranscriptionService = (): TranscriptionService => ({
  async transcribe(_image, options) {
    await delay(SIMULATED_LATENCY_MS, options?.signal);
    return { text: MOCK_TRANSCRIPTION_TEXT };
  },
});
