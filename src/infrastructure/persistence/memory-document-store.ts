import type { DocumentStore, SavedDocument } from "@/domain/ports/document-store";
import { AppError } from "@/domain/errors/app-error";

interface Options {
  /** Injected clock, so tests can control ordering without real delays. */
  now?: () => number;
}

/**
 * Per-instance in-memory DocumentStore. Not shared across server instances
 * — a first-line default for local dev and tests, not a substitute for a
 * shared store in production. Swapping in Redis later is a new DocumentStore
 * adapter, not a rewrite of any call site, since everything depends on the
 * port.
 */
export const makeMemoryDocumentStore = (options: Options = {}): DocumentStore => {
  const now = options.now ?? Date.now;
  const byOwner = new Map<string, Map<string, SavedDocument>>();

  return {
    async save(ownerId, document, id) {
      const docs = byOwner.get(ownerId) ?? new Map<string, SavedDocument>();
      byOwner.set(ownerId, docs);

      const resolvedId = id ?? crypto.randomUUID();
      const saved: SavedDocument = {
        ...document,
        id: resolvedId,
        updatedAt: new Date(now()).toISOString(),
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
