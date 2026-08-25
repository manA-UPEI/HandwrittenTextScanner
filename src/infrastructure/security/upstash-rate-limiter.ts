import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimiter } from "@/domain/ports/rate-limiter";
import { AppError } from "@/domain/errors/app-error";

/**
 * The slice of @upstash/ratelimit this adapter actually calls. Depending on
 * this narrow shape — instead of the full Ratelimit class — is what lets
 * tests inject a stub without a real Redis instance, same convention as
 * GenerateContentClient in the Gemini provider.
 */
interface RateLimitClient {
  limit(identifier: string): Promise<{ success: boolean }>;
}

interface Overrides {
  url?: string;
  token?: string;
  limit?: number;
  windowSeconds?: number;
  /** Separates counters for multiple Ratelimit instances sharing one Redis. */
  prefix?: string;
  client?: RateLimitClient;
}

const resolveCredentials = (overrides: Overrides): { url: string; token: string } => {
  const url = overrides.url ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = overrides.token ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new AppError(
      "CONFIG_MISSING",
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for " +
        'RATE_LIMIT_BACKEND="upstash". Add them to .env.local, or set ' +
        'RATE_LIMIT_BACKEND="memory" for local development.',
    );
  }

  return { url, token };
};

/**
 * RateLimiter backed by Upstash Redis (sliding window) — shared across every
 * server instance, unlike the in-memory adapter, so it's the one that keeps
 * limiting anything once this app runs as more than one serverless
 * invocation. Reads its own configuration lazily (on first `consume` call,
 * not at import time), same convention as the Gemini provider.
 */
export const makeUpstashRateLimiter = (overrides: Overrides = {}): RateLimiter => {
  const limit = overrides.limit ?? 10;
  const windowSeconds = overrides.windowSeconds ?? 60;
  let client: RateLimitClient | undefined = overrides.client;

  const resolveClient = (): RateLimitClient => {
    if (!client) {
      const { url, token } = resolveCredentials(overrides);
      client = new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: overrides.prefix ?? "handwriting-scanner",
      });
    }
    return client;
  };

  return {
    async consume(clientId) {
      const { success } = await resolveClient().limit(clientId);
      if (!success) {
        throw new AppError(
          "RATE_LIMITED",
          "Too many requests. Please wait a moment and try again.",
        );
      }
    },
  };
};
