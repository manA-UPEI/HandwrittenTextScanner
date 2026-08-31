import type { ScannedDocument } from "@/domain/entities/scanned-document";

/** Enough to list saved documents without loading every page's text. */
export interface SavedDocumentSummary {
  id: string;
  title: string;
  pageCount: number;
  updatedAt: string;
}

/** A `ScannedDocument` that has been persisted. */
export interface SavedDocument extends ScannedDocument {
  id: string;
  updatedAt: string;
}

/**
 * Persists scan sessions so a user can resume one after closing the tab, or
 * revisit one they scanned earlier.
 *
 * Implementations MUST:
 *  - scope every document to `ownerId`, so one owner's id can never resolve
 *    to another owner's document — this is the only access control this
 *    port has, and it's structural rather than a check that can be skipped;
 *  - throw AppError("NOT_FOUND") from `load`/`remove` when `id` doesn't
 *    resolve for that `ownerId` (whether because it never existed or
 *    because it belongs to someone else — the two cases are
 *    indistinguishable on purpose);
 *  - assign a fresh id when `save` is called without one, and update the
 *    existing document in place when called with one.
 *
 * A single-instance, in-memory implementation is a valid default — the port
 * makes swapping in a shared store (e.g. Redis) later a new adapter, not a
 * rewrite of every call site.
 */
export interface DocumentStore {
  save(ownerId: string, document: ScannedDocument, id?: string): Promise<SavedDocument>;
  list(ownerId: string): Promise<SavedDocumentSummary[]>;
  load(ownerId: string, id: string): Promise<SavedDocument>;
  remove(ownerId: string, id: string): Promise<void>;
}
