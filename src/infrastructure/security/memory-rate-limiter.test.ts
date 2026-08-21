import { describe, expect, it } from "vitest";
import { makeMemoryRateLimiter } from "@/infrastructure/security/memory-rate-limiter";
import { isAppError } from "@/domain/errors/app-error";

describe("makeMemoryRateLimiter", () => {
  it("allows requests up to the limit, then rejects", async () => {
    const limiter = makeMemoryRateLimiter({ limit: 3, now: () => 0 });

    await limiter.consume("client-1");
    await limiter.consume("client-1");
    await limiter.consume("client-1");

    const error = await limiter.consume("client-1").catch((e) => e);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe("RATE_LIMITED");
  });

  it("tracks each client independently", async () => {
    const limiter = makeMemoryRateLimiter({ limit: 1, now: () => 0 });

    await limiter.consume("client-a");
    await expect(limiter.consume("client-b")).resolves.toBeUndefined();
  });

  it("resets the count once the window has elapsed", async () => {
    let time = 0;
    const limiter = makeMemoryRateLimiter({ limit: 1, windowMs: 1000, now: () => time });

    await limiter.consume("client-1");
    await expect(limiter.consume("client-1")).rejects.toSatisfy(isAppError);

    time = 1000;
    await expect(limiter.consume("client-1")).resolves.toBeUndefined();
  });
});
