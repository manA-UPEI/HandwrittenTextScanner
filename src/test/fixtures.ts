import type { CapturedImage } from "@/domain/entities/captured-image";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { SavedDocument } from "@/domain/ports/document-store";

/** A real (if tiny) 1x1 red PNG, valid enough to pass through base64/mime checks. */
export const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export const fixtureImage = (
  overrides: Partial<CapturedImage> = {},
): CapturedImage => ({
  base64: ONE_PIXEL_PNG_BASE64,
  mimeType: "image/png",
  ...overrides,
});

export const SAMPLE_TRANSCRIPTION_TEXT = [
  "Dear diary,",
  "",
  "Today I learned that clean architecture",
  "keeps the important decisions independent",
  "of the framework they run in.",
].join("\n");

export const fixtureScannedDocument = (
  overrides: Partial<ScannedDocument> = {},
): ScannedDocument => ({
  title: "Scanned Document",
  pages: [{ id: "page-1", text: SAMPLE_TRANSCRIPTION_TEXT }],
  ...overrides,
});

export const fixtureSavedDocument = (
  overrides: Partial<SavedDocument> = {},
): SavedDocument => ({
  id: "doc-1",
  title: "Scanned Document",
  pages: [{ id: "page-1", text: SAMPLE_TRANSCRIPTION_TEXT }],
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});
