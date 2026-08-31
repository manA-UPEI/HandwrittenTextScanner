import type { DocumentStore, SavedDocumentSummary } from "@/domain/ports/document-store";

interface Deps {
  documentStore: DocumentStore;
}

/** Lists the documents an owner has saved, most recent first. */
export const makeListDocuments =
  ({ documentStore }: Deps) =>
  (ownerId: string): Promise<SavedDocumentSummary[]> =>
    documentStore.list(ownerId);
