import "server-only";
import { resolveAiProvider, resolveRateLimiterBackend } from "@/infrastructure/config/server-env";
import { transcriptionProviders } from "@/infrastructure/ai/registry";
import { rateLimiterBackends } from "@/infrastructure/security/registry";
import { makeTranscribeImage } from "@/use-cases/transcribe-image";

// A single set of limiter instances shared across requests to this server
// process. On the "memory" backend that's what makes the limits hold at
// all; on "upstash" every instance shares the same Redis-backed counters
// anyway.
const rateLimiters = rateLimiterBackends[resolveRateLimiterBackend()]();

/**
 * The only place a concrete TranscriptionService meets the use case.
 * Resolves the provider from the registry (see @/infrastructure/ai/registry)
 * so swapping AI_PROVIDER never touches this function's body.
 */
export const createServerServices = () => {
  const transcription = transcriptionProviders[resolveAiProvider()]();

  return {
    transcribeImage: makeTranscribeImage({ transcription, rateLimiters }),
  };
};
