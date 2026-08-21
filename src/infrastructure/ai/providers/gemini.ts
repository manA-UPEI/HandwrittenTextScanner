import { GoogleGenAI } from "@google/genai";
import type { CapturedImage } from "@/domain/entities/captured-image";
import type { TranscriptionResult } from "@/domain/entities/transcription-result";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import { AppError } from "@/domain/errors/app-error";
import {
  TRANSCRIPTION_SYSTEM_PROMPT,
  TRANSCRIPTION_USER_INSTRUCTION,
} from "@/infrastructure/ai/transcription-prompt";

const MODEL = "gemini-2.5-flash";

interface GenerateContentParams {
  model: string;
  contents: Array<{
    role: "user";
    parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }>;
  }>;
  config: {
    temperature: number;
    systemInstruction: string;
    abortSignal?: AbortSignal;
  };
}

/**
 * The slice of the @google/genai client this adapter actually calls.
 * Depending on this narrow shape — instead of the full SDK class — is
 * what lets tests inject a stub without touching the network, the SDK,
 * or a mocking library.
 */
interface GenerateContentClient {
  models: {
    generateContent(params: GenerateContentParams): Promise<{ text?: string }>;
  };
}

interface Overrides {
  apiKey?: string;
  client?: GenerateContentClient;
}

const resolveApiKey = (apiKey?: string): string => {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new AppError(
      "CONFIG_MISSING",
      'GEMINI_API_KEY is not set. Add it to .env.local, or set AI_PROVIDER="mock" for offline development.',
    );
  }
  return key;
};

/**
 * TranscriptionService backed by Gemini 2.5 Flash. Reads its own
 * configuration lazily (on first transcribe call, not at import time) so
 * the composition root never needs to know Gemini requires an API key.
 */
export const makeGeminiTranscriptionService = (
  overrides: Overrides = {},
): TranscriptionService => ({
  async transcribe(image: CapturedImage, options): Promise<TranscriptionResult> {
    const client =
      overrides.client ?? (new GoogleGenAI({ apiKey: resolveApiKey(overrides.apiKey) }) as unknown as GenerateContentClient);

    const response = await client.models
      .generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: image.base64, mimeType: image.mimeType } },
              { text: TRANSCRIPTION_USER_INSTRUCTION },
            ],
          },
        ],
        config: {
          temperature: 0,
          systemInstruction: TRANSCRIPTION_SYSTEM_PROMPT,
          abortSignal: options?.signal,
        },
      })
      .catch((): never => {
        throw new AppError(
          "TRANSCRIPTION_FAILED",
          "Gemini could not transcribe this image. Please try again.",
        );
      });

    const text = response.text?.trim();
    if (!text) {
      throw new AppError(
        "TRANSCRIPTION_FAILED",
        "Gemini returned no transcribable text for this image.",
      );
    }

    return { text };
  },
});
