import type { RateLimiter } from "@/domain/ports/rate-limiter";
import { makeMemoryRateLimiter } from "@/infrastructure/security/memory-rate-limiter";
import { makeUpstashRateLimiter } from "@/infrastructure/security/upstash-rate-limiter";
import { composeRateLimiters } from "@/infrastructure/security/tiered-rate-limiter";

type RateLimiterFactory = () => RateLimiter;

/**
 * The entire swapping mechanism for the rate limiter backend. Swapping is
 * one env change, none of which touch application code:
 *   - "memory"  — single-instance, in-process. Fine for local dev and
 *                 tests; on serverless deployments each cold instance gets
 *                 its own empty counters, so it does not actually limit
 *                 anything across invocations.
 *   - "upstash" — shared Redis (free tier), so the limit holds across every
 *                 server instance. Required once this app runs on
 *                 serverless. Layers a per-minute burst check with a
 *                 per-day quota to also bound API spend.
 */
export const rateLimiterBackends = {
  memory: () => makeMemoryRateLimiter({ limit: 10, windowMs: 60_000 }),
  upstash: () =>
    composeRateLimiters([
      makeUpstashRateLimiter({ limit: 5, windowSeconds: 60, prefix: "burst" }),
      makeUpstashRateLimiter({ limit: 50, windowSeconds: 24 * 60 * 60, prefix: "daily" }),
    ]),
} satisfies Record<string, RateLimiterFactory>;

export type RateLimiterBackendId = keyof typeof rateLimiterBackends;

export const isRateLimiterBackendId = (value: string): value is RateLimiterBackendId =>
  value in rateLimiterBackends;
