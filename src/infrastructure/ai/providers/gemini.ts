import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import type { CapturedImage } from "@/domain/entities/captured-image";
import type { TranscriptionResult } from "@/domain/entities/transcription-result";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import { AppError } from "@/domain/errors/app-error";
import {
  TRANSCRIPTION_SYSTEM_PROMPT,
  TRANSCRIPTION_USER_INSTRUCTION,
} from "@/infrastructure/ai/transcription-prompt";

const MODEL = "gemini-2.5-flash";

// A handwritten page transcribes to a few hundred to low thousands of
// tokens at most. Capping output here means a successful prompt injection
// (image text asking the model to generate something unrelated) can't turn
// this endpoint into an unbounded, free-form text generator on our API key.
const MAX_OUTPUT_TOKENS = 4096;

// Blocks outright harmful output categories, and specifically the
// JAILBREAK category — Gemini's own classifier for "this prompt is trying
// to bypass safety instructions" — as a second, model-side layer behind
// the anti-injection wording in TRANSCRIPTION_SYSTEM_PROMPT.
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  { category: HarmCategory.HARM_CATEGORY_JAILBREAK, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

interface GenerateContentParams {
  model: string;
  contents: Array<{
    role: "user";
    parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }>;
  }>;
  config: {
    temperature: number;
    systemInstruction: string;
    maxOutputTokens: number;
    safetySettings: Array<{ category: HarmCategory; threshold: HarmBlockThreshold }>;
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
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          safetySettings: SAFETY_SETTINGS,
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
