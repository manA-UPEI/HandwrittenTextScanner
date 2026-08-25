import "server-only";
import { AppError } from "@/domain/errors/app-error";
import { isProviderId, type ProviderId, transcriptionProviders } from "@/infrastructure/ai/registry";
import {
  isRateLimiterBackendId,
  type RateLimiterBackendId,
  rateLimiterBackends,
} from "@/infrastructure/security/registry";

const DEFAULT_PROVIDER: ProviderId = "gemini";
const DEFAULT_RATE_LIMITER_BACKEND: RateLimiterBackendId = "memory";

/**
 * Resolves which TranscriptionService provider to use. This is the only
 * thing server-env.ts knows about the AI layer — it validates the
 * provider id against the registry's keys, but never learns what
 * configuration any individual provider needs.
 */
export const resolveAiProvider = (): ProviderId => {
  const value = process.env.AI_PROVIDER?.trim() || DEFAULT_PROVIDER;

  if (!isProviderId(value)) {
    const valid = Object.keys(transcriptionProviders).join(", ");
    throw new AppError(
      "CONFIG_MISSING",
      `AI_PROVIDER="${value}" is not a registered provider. Valid values: ${valid}.`,
    );
  }

  return value;
};

/**
 * Resolves which RateLimiter backend to use. Defaults to the in-memory
 * adapter so local dev and tests need no extra setup; production on
 * serverless must opt in explicitly via RATE_LIMIT_BACKEND="upstash" since
 * that's the only backend that actually limits anything across instances.
 */
export const resolveRateLimiterBackend = (): RateLimiterBackendId => {
  const value = process.env.RATE_LIMIT_BACKEND?.trim() || DEFAULT_RATE_LIMITER_BACKEND;

  if (!isRateLimiterBackendId(value)) {
    const valid = Object.keys(rateLimiterBackends).join(", ");
    throw new AppError(
      "CONFIG_MISSING",
      `RATE_LIMIT_BACKEND="${value}" is not a registered backend. Valid values: ${valid}.`,
    );
  }

  return value;
};
