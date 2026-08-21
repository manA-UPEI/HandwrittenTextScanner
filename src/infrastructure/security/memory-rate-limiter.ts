import type { RateLimiter } from "@/domain/ports/rate-limiter";
import { AppError } from "@/domain/errors/app-error";

interface Options {
  limit?: number;
  windowMs?: number;
  /** Injected clock, so tests can control time without real delays. */
  now?: () => number;
}

interface WindowState {
  windowStart: number;
  count: number;
}

/**
 * Fixed-window in-memory rate limiter: `limit` requests per `windowMs` per
 * client id. Per-instance only — a first line of defense against a single
 * runaway client, not a substitute for a shared store across multiple
 * server instances. Swapping in Redis later is a new RateLimiter adapter,
 * not a rewrite of any call site, since everything depends on the port.
 */
export const makeMemoryRateLimiter = (options: Options = {}): RateLimiter => {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;
  const now = options.now ?? Date.now;
  const windows = new Map<string, WindowState>();

  return {
    async consume(clientId) {
      const current = now();
      const existing = windows.get(clientId);
      const isNewWindow = !existing || current - existing.windowStart >= windowMs;
      const state = isNewWindow ? { windowStart: current, count: 0 } : existing;

      if (state.count >= limit) {
        throw new AppError(
          "RATE_LIMITED",
          "Too many requests. Please wait a moment and try again.",
        );
      }

      windows.set(clientId, { ...state, count: state.count + 1 });
    },
  };
};
