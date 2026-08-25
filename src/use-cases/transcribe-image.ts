import type { CapturedImage } from "@/domain/entities/captured-image";
import type { TranscriptionResult } from "@/domain/entities/transcription-result";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import type { RateLimiter } from "@/domain/ports/rate-limiter";
import { assertValidImagePayload } from "@/use-cases/validate-image-payload";

/**
 * Three independent quotas, checked narrowest first: a single abusive user
 * or IP is rejected before it can burn into the budget the whole server
 * shares. `global` guards total request volume (and therefore AI spend)
 * across every user and IP combined.
 */
export interface RateLimiters {
  perUser: RateLimiter;
  perIp: RateLimiter;
  global: RateLimiter;
}

export interface ClientIdentifiers {
  userId: string;
  ip: string;
}

interface Deps {
  transcription: TranscriptionService;
  rateLimiters: RateLimiters;
}

const GLOBAL_RATE_LIMIT_KEY = "global";

/**
 * Orchestrates one transcription request: validate the payload, enforce
 * the caller's quota, then delegate to whichever TranscriptionService the
 * composition root wired in. Knows nothing about Gemini, HTTP, or React.
 */
export const makeTranscribeImage =
  ({ transcription, rateLimiters }: Deps) =>
  async (image: CapturedImage, identifiers: ClientIdentifiers): Promise<TranscriptionResult> => {
    assertValidImagePayload(image);
    await rateLimiters.perUser.consume(identifiers.userId);
    await rateLimiters.perIp.consume(identifiers.ip);
    await rateLimiters.global.consume(GLOBAL_RATE_LIMIT_KEY);
    return transcription.transcribe(image);
  };
