import { describe, expect, it } from "vitest";
import { composeRateLimiters } from "@/infrastructure/security/tiered-rate-limiter";
import { AppError, isAppError } from "@/domain/errors/app-error";
import type { RateLimiter } from "@/domain/ports/rate-limiter";

const allow = (): RateLimiter => ({ consume: async () => {} });
const deny = (): RateLimiter => ({
  consume: async () => {
    throw new AppError("RATE_LIMITED", "denied");
  },
});

describe("composeRateLimiters", () => {
  it("resolves when every limiter allows the request", async () => {
    const limiter = composeRateLimiters([allow(), allow()]);
    await expect(limiter.consume("client-1")).resolves.toBeUndefined();
  });

  it("rejects when any limiter denies the request", async () => {
    const limiter = composeRateLimiters([allow(), deny()]);
    const error = await limiter.consume("client-1").catch((e) => e);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("RATE_LIMITED");
  });

  it("short-circuits on the first denial, never consuming later limiters' budget", async () => {
    let secondConsumed = false;
    const second: RateLimiter = {
      consume: async () => {
        secondConsumed = true;
      },
    };
    const limiter = composeRateLimiters([deny(), second]);

    await limiter.consume("client-1").catch(() => {});

    expect(secondConsumed).toBe(false);
  });
});
