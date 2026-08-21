"use server";

import { headers } from "next/headers";
import type { ImageMimeType } from "@/domain/entities/captured-image";
import { isAppError, type ErrorCode } from "@/domain/errors/app-error";
import { createServerServices } from "@/composition/server-container";

export interface TranscribeImageActionInput {
  base64: string;
  mimeType: ImageMimeType;
}

export type TranscribeImageActionResult =
  | { ok: true; text: string }
  | { ok: false; code: ErrorCode; message: string };

/** Best-effort per-client identifier for rate limiting — good enough for a
 *  single-instance in-memory limiter, not meant to identify a person. */
const resolveClientId = async (): Promise<string> => {
  const headerList = await headers();
  return headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? "anonymous";
};

/**
 * The only place the Gemini API key is used — this Server Action never
 * runs in the browser, so the key never crosses the network to the
 * client. Every failure is mapped to the ok:false shape below; a raw SDK
 * or Node error is never allowed to cross this boundary.
 */
export async function transcribeImageAction(
  input: TranscribeImageActionInput,
): Promise<TranscribeImageActionResult> {
  try {
    const clientId = await resolveClientId();
    const { transcribeImage } = createServerServices();
    const result = await transcribeImage(input, clientId);
    return { ok: true, text: result.text };
  } catch (error) {
    if (isAppError(error)) {
      return { ok: false, code: error.code, message: error.message };
    }
    return {
      ok: false,
      code: "TRANSCRIPTION_FAILED",
      message: "Something went wrong while transcribing. Please try again.",
    };
  }
}
