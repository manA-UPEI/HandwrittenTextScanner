import type { CapturedImage, CropArea } from "@/domain/entities/captured-image";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { TranscriptionService } from "@/domain/ports/transcription-service";
import type { PdfGenerator } from "@/domain/ports/pdf-generator";
import type { ImageCropper } from "@/domain/ports/image-cropper";
import type { FileSaver } from "@/domain/ports/file-saver";
import type { RateLimiter } from "@/domain/ports/rate-limiter";
import type { DocumentStore, SavedDocument } from "@/domain/ports/document-store";
import { AppError } from "@/domain/errors/app-error";
import { SAMPLE_TRANSCRIPTION_TEXT } from "@/test/fixtures";

/**
 * In-memory port implementations used only in tests. Each fake records
 * what it was called with and can be configured to fail, so use-case and
 * component tests never need a mocking library.
 */

export const makeFakeTranscriptionService = (
  options: { text?: string; failWith?: AppError } = {},
): TranscriptionService & { calls: CapturedImage[] } => ({
  calls: [],
  async transcribe(image) {
    this.calls.push(image);
    if (options.failWith) throw options.failWith;
    return { text: options.text ?? SAMPLE_TRANSCRIPTION_TEXT };
  },
});

export const makeFakeRateLimiter = (
  options: { rejectAfter?: number } = {},
): RateLimiter & { consumedBy: string[] } => ({
  consumedBy: [],
  async consume(clientId) {
    if (options.rejectAfter !== undefined && this.consumedBy.length >= options.rejectAfter) {
      throw new AppError("RATE_LIMITED", "Too many requests. Please slow down.");
    }
    this.consumedBy.push(clientId);
  },
});

export const makeFakePdfGenerator = (): PdfGenerator & { calls: ScannedDocument[] } => ({
  calls: [],
  async generate(document) {
    this.calls.push(document);
    return new Uint8Array([1, 2, 3]);
  },
});

export const makeFakeImageCropper = (): ImageCropper & { calls: CropArea[] } => ({
  calls: [],
  async crop(source, area) {
    this.calls.push(area);
    return source;
  },
});

export const makeFakeFileSaver = (): FileSaver & {
  saved: { bytes: Uint8Array; fileName: string; mimeType: string }[];
} => ({
  saved: [],
  async save(bytes, fileName, mimeType) {
    this.saved.push({ bytes, fileName, mimeType });
  },
});

/** Keyed by ownerId, then by document id — same scoping real backends must enforce. */
export const makeFakeDocumentStore = (): DocumentStore & {
  byOwner: Map<string, Map<string, SavedDocument>>;
} => {
  const byOwner = new Map<string, Map<string, SavedDocument>>();
  let nextId = 1;

  return {
    byOwner,
    async save(ownerId, document, id) {
      const docs = byOwner.get(ownerId) ?? new Map<string, SavedDocument>();
      byOwner.set(ownerId, docs);
      const resolvedId = id ?? `fake-doc-${nextId++}`;
      const saved: SavedDocument = {
        ...document,
        id: resolvedId,
        updatedAt: new Date().toISOString(),
      };
      docs.set(resolvedId, saved);
      return saved;
    },
    async list(ownerId) {
      const docs = byOwner.get(ownerId);
      if (!docs) return [];
      return [...docs.values()]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          pageCount: doc.pages.length,
          updatedAt: doc.updatedAt,
        }));
    },
    async load(ownerId, id) {
      const doc = byOwner.get(ownerId)?.get(id);
      if (!doc) throw new AppError("NOT_FOUND", "This document could not be found.");
      return doc;
    },
    async remove(ownerId, id) {
      const docs = byOwner.get(ownerId);
      if (!docs?.has(id)) {
        throw new AppError("NOT_FOUND", "This document could not be found.");
      }
      docs.delete(id);
    },
  };
};
