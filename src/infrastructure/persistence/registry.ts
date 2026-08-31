import type { DocumentStore } from "@/domain/ports/document-store";
import { makeMemoryDocumentStore } from "@/infrastructure/persistence/memory-document-store";
import { makeUpstashDocumentStore } from "@/infrastructure/persistence/upstash-document-store";

type DocumentStoreFactory = () => DocumentStore;

/**
 * The entire swapping mechanism for the document store backend. Adding a
 * backend is two steps, neither of which touches application code:
 *   1. write src/infrastructure/persistence/<name>.ts implementing DocumentStore;
 *   2. add one line to this object, then set DOCUMENT_STORE_BACKEND=<name>.
 *
 *   - "memory"  — single-instance, in-process. Fine for local dev and
 *                 tests; on serverless deployments each cold instance starts
 *                 with an empty store, so saved documents don't survive
 *                 across invocations.
 *   - "upstash" — shared Redis, so documents persist across every server
 *                 instance and across restarts. Required once this app runs
 *                 on serverless.
 */
export const documentStoreBackends = {
  memory: makeMemoryDocumentStore,
  upstash: makeUpstashDocumentStore,
} satisfies Record<string, DocumentStoreFactory>;

export type DocumentStoreBackendId = keyof typeof documentStoreBackends;

export const isDocumentStoreBackendId = (value: string): value is DocumentStoreBackendId =>
  value in documentStoreBackends;
