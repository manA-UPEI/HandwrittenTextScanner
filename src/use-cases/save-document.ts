import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { DocumentStore, SavedDocument } from "@/domain/ports/document-store";

interface Deps {
  documentStore: DocumentStore;
}

/**
 * Saves a scan session, creating a new document or updating an existing one
 * depending on whether `id` is supplied. A blank title would leave the
 * document unrecognizable in a list of saved scans, so it's defaulted here
 * — a real business rule, not incidental validation.
 */
export const makeSaveDocument =
  ({ documentStore }: Deps) =>
  (ownerId: string, document: ScannedDocument, id?: string): Promise<SavedDocument> =>
    documentStore.save(
      ownerId,
      { ...document, title: document.title.trim() || "Untitled scan" },
      id,
    );
