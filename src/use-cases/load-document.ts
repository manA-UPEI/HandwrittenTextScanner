import type { DocumentStore, SavedDocument } from "@/domain/ports/document-store";

interface Deps {
  documentStore: DocumentStore;
}

/** Loads one saved document. Throws AppError("NOT_FOUND") if `id` doesn't resolve for `ownerId`. */
export const makeLoadDocument =
  ({ documentStore }: Deps) =>
  (ownerId: string, id: string): Promise<SavedDocument> =>
    documentStore.load(ownerId, id);
