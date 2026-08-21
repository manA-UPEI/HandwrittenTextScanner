import type { CapturedImage } from "@/domain/entities/captured-image";
import type { TranscriptionResult } from "@/domain/entities/transcription-result";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import type { RateLimiter } from "@/domain/ports/rate-limiter";
import { assertValidImagePayload } from "@/use-cases/validate-image-payload";

interface Deps {
  transcription: TranscriptionService;
  rateLimiter: RateLimiter;
}

/**
 * Orchestrates one transcription request: validate the payload, enforce
 * the caller's quota, then delegate to whichever TranscriptionService the
 * composition root wired in. Knows nothing about Gemini, HTTP, or React.
 */
export const makeTranscribeImage =
  ({ transcription, rateLimiter }: Deps) =>
  async (image: CapturedImage, clientId: string): Promise<TranscriptionResult> => {
    assertValidImagePayload(image);
    await rateLimiter.consume(clientId);
    return transcription.transcribe(image);
  };
