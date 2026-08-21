import "server-only";
import { AppError } from "@/domain/errors/app-error";
import { isProviderId, type ProviderId, transcriptionProviders } from "@/infrastructure/ai/registry";

const DEFAULT_PROVIDER: ProviderId = "gemini";

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
