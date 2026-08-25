import type { RateLimiters } from "@/use-cases/transcribe-image";
import { makeMemoryRateLimiter } from "@/infrastructure/security/memory-rate-limiter";
import { makeUpstashRateLimiter } from "@/infrastructure/security/upstash-rate-limiter";
import { composeRateLimiters } from "@/infrastructure/security/tiered-rate-limiter";

type RateLimiterFactory = () => RateLimiters;

/**
 * The entire swapping mechanism for the rate limiter backend. Swapping is
 * one env change, none of which touch application code:
 *   - "memory"  — single-instance, in-process. Fine for local dev and
 *                 tests; on serverless deployments each cold instance gets
 *                 its own empty counters, so it does not actually limit
 *                 anything across invocations.
 *   - "upstash" — shared Redis (free tier), so the limit holds across every
 *                 server instance. Required once this app runs on
 *                 serverless.
 *
 * Each backend wires up three independent quotas (see RateLimiters):
 *   - perUser — layers a per-minute burst check with a per-day quota, to
 *               bound one signed-in account's spend.
 *   - perIp   — a looser burst check per IP address, since one IP can be
 *               several legitimate users (NAT, shared office network)
 *               behind it; mainly catches one machine hammering the
 *               endpoint across multiple accounts.
 *   - global  — one shared daily counter across every user and IP
 *               combined, capping total request volume (and therefore AI
 *               spend) for the whole server.
 */
export const rateLimiterBackends = {
  memory: () => ({
    perUser: makeMemoryRateLimiter({ limit: 10, windowMs: 60_000 }),
    perIp: makeMemoryRateLimiter({ limit: 30, windowMs: 60_000 }),
    global: makeMemoryRateLimiter({ limit: 200, windowMs: 60_000 }),
  }),
  upstash: () => ({
    perUser: composeRateLimiters([
      makeUpstashRateLimiter({ limit: 5, windowSeconds: 60, prefix: "user-burst" }),
      makeUpstashRateLimiter({ limit: 50, windowSeconds: 24 * 60 * 60, prefix: "user-daily" }),
    ]),
    perIp: makeUpstashRateLimiter({ limit: 20, windowSeconds: 60, prefix: "ip-burst" }),
    global: makeUpstashRateLimiter({
      limit: 500,
      windowSeconds: 24 * 60 * 60,
      prefix: "global-daily",
    }),
  }),
} satisfies Record<string, RateLimiterFactory>;

export type RateLimiterBackendId = keyof typeof rateLimiterBackends;

export const isRateLimiterBackendId = (value: string): value is RateLimiterBackendId =>
  value in rateLimiterBackends;
