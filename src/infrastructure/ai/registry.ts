import type { TranscriptionService } from "@/domain/ports/transcription-service";
import { makeGeminiTranscriptionService } from "@/infrastructure/ai/providers/gemini";
import { makeMockTranscriptionService } from "@/infrastructure/ai/providers/mock";

type TranscriptionFactory = () => TranscriptionService;

/**
 * The entire swapping mechanism for the AI provider. Adding a model
 * provider is three steps, none of which touch application code:
 *   1. write src/infrastructure/ai/providers/<name>.ts implementing TranscriptionService;
 *   2. add one line to this object;
 *   3. set AI_PROVIDER=<name>.
 *
 * Each factory reads its own configuration lazily — this registry never
 * needs to know that Gemini requires an API key, or what a future
 * provider might require instead.
 */
export const transcriptionProviders = {
  gemini: makeGeminiTranscriptionService,
  mock: makeMockTranscriptionService,
} satisfies Record<string, TranscriptionFactory>;

export type ProviderId = keyof typeof transcriptionProviders;

export const isProviderId = (value: string): value is ProviderId =>
  value in transcriptionProviders;
