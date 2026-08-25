"use server";

import { auth } from "@/auth";
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

/**
 * The only place the Gemini API key is used — this Server Action never
 * runs in the browser, so the key never crosses the network to the
 * client. Every failure is mapped to the ok:false shape below; a raw SDK
 * or Node error is never allowed to cross this boundary.
 *
 * Treated like a public API endpoint per Next.js's own guidance: the UI
 * only shows this action to signed-in users, but that alone isn't a
 * security boundary, so the session is re-checked here regardless of what
 * the client sent.
 */
export async function transcribeImageAction(
  input: TranscribeImageActionInput,
): Promise<TranscribeImageActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "Please sign in to transcribe images.",
      };
    }

    const { transcribeImage } = createServerServices();
    const result = await transcribeImage(input, session.user.id);
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
