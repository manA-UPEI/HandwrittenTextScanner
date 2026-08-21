import type { CapturedImage } from "@/domain/entities/captured-image";
import type { TranscriptionResult } from "@/domain/entities/transcription-result";

/**
 * Transcribes handwritten text from a single image. This is the seam
 * behind which any model provider lives — the port carries no provider
 * vocabulary (no "model", "temperature", or SDK types) so a new adapter
 * never leaks its own shape into application code.
 *
 * Implementations MUST:
 *  - preserve the source's line breaks and paragraph structure verbatim;
 *  - return plain text only — no markdown, no commentary, no code fences;
 *  - throw AppError("TRANSCRIPTION_FAILED") on empty, blocked, or failed responses;
 *  - throw AppError("CONFIG_MISSING") when their own configuration is absent;
 *  - never let a provider-specific type or error escape this boundary.
 */
export interface TranscriptionService {
  transcribe(
    image: CapturedImage,
    options?: { signal?: AbortSignal },
  ): Promise<TranscriptionResult>;
}
