import "server-only";
import { resolveAiProvider } from "@/infrastructure/config/server-env";
import { transcriptionProviders } from "@/infrastructure/ai/registry";
import { makeMemoryRateLimiter } from "@/infrastructure/security/memory-rate-limiter";
import { makeTranscribeImage } from "@/use-cases/transcribe-image";

// A single limiter instance shared across requests to this server process
// — that's what makes the rate limit actually limit anything.
const rateLimiter = makeMemoryRateLimiter();

/**
 * The only place a concrete TranscriptionService meets the use case.
 * Resolves the provider from the registry (see @/infrastructure/ai/registry)
 * so swapping AI_PROVIDER never touches this function's body.
 */
export const createServerServices = () => {
  const transcription = transcriptionProviders[resolveAiProvider()]();

  return {
    transcribeImage: makeTranscribeImage({ transcription, rateLimiter }),
  };
};
