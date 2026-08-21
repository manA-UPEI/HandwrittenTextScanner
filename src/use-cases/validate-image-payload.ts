import type { CapturedImage, ImageMimeType } from "@/domain/entities/captured-image";
import { AppError } from "@/domain/errors/app-error";

const ALLOWED_MIME_TYPES: ImageMimeType[] = ["image/jpeg", "image/png", "image/webp"];
const MAX_DECODED_BYTES = 5 * 1024 * 1024; // 5MB

const decodedByteLength = (base64: string): number => {
  const padding = (base64.match(/=+$/) ?? [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
};

/**
 * The single guard both the Server Action and the client-side use cases
 * run before touching an image — one implementation, both sides, so the
 * rules can never drift apart. Pure: no I/O, no ports, just validation.
 */
export const assertValidImagePayload = (image: CapturedImage): void => {
  if (!ALLOWED_MIME_TYPES.includes(image.mimeType)) {
    throw new AppError(
      "INVALID_IMAGE",
      `Unsupported image type "${image.mimeType}". Use JPEG, PNG, or WebP.`,
    );
  }

  if (!image.base64 || !/^[A-Za-z0-9+/]+=*$/.test(image.base64)) {
    throw new AppError("INVALID_IMAGE", "The image data is empty or malformed.");
  }

  if (decodedByteLength(image.base64) > MAX_DECODED_BYTES) {
    throw new AppError("INVALID_IMAGE", "The image is larger than the 5MB limit.");
  }
};
