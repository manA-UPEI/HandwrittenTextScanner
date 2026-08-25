import type { RateLimiter } from "@/domain/ports/rate-limiter";

/**
 * Combines multiple RateLimiter checks — e.g. a tight per-minute burst
 * limit and a looser per-day quota — into one. Checks run in order and
 * short-circuit on the first rejection, so a request that fails the burst
 * check never consumes budget from the daily one.
 */
export const composeRateLimiters = (limiters: RateLimiter[]): RateLimiter => ({
  async consume(clientId) {
    for (const limiter of limiters) {
      await limiter.consume(clientId);
    }
  },
});
