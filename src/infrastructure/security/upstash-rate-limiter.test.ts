import { afterEach, describe, expect, it } from "vitest";
import { makeUpstashRateLimiter } from "@/infrastructure/security/upstash-rate-limiter";
import { isAppError } from "@/domain/errors/app-error";

describe("makeUpstashRateLimiter", () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  afterEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  });

  it("throws CONFIG_MISSING when no credentials are available anywhere", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const limiter = makeUpstashRateLimiter();

    const error = await limiter.consume("client-1").catch((e) => e);

    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("CONFIG_MISSING");
    expect(error.message).toContain("UPSTASH_REDIS_REST_URL");
  });

  it("does not require credentials when a client override is supplied", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const limiter = makeUpstashRateLimiter({
      client: { limit: async () => ({ success: true }) },
    });

    await expect(limiter.consume("client-1")).resolves.toBeUndefined();
  });

  it("throws RATE_LIMITED when the underlying client reports failure", async () => {
    const limiter = makeUpstashRateLimiter({
      client: { limit: async () => ({ success: false }) },
    });

    const error = await limiter.consume("client-1").catch((e) => e);

    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("RATE_LIMITED");
  });
});
