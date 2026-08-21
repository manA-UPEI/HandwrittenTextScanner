/**
 * Guards a scarce or costly resource (here: transcription calls) against
 * abuse from a single client.
 *
 * Implementations MUST:
 *  - throw AppError("RATE_LIMITED") when `clientId` has exceeded its quota;
 *  - resolve normally otherwise, having recorded the attempt.
 *
 * A single-instance, in-memory implementation is a valid default — the
 * port makes swapping in a shared store (e.g. Redis) later a new adapter,
 * not a rewrite of every call site.
 */
export interface RateLimiter {
  consume(clientId: string): Promise<void>;
}
