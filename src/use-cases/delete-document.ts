import type { DocumentStore } from "@/domain/ports/document-store";

interface Deps {
  documentStore: DocumentStore;
}

/** Deletes one saved document. Throws AppError("NOT_FOUND") if `id` doesn't resolve for `ownerId`. */
export const makeDeleteDocument =
  ({ documentStore }: Deps) =>
  (ownerId: string, id: string): Promise<void> =>
    documentStore.remove(ownerId, id);
