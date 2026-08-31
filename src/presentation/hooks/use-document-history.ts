"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedDocumentSummary } from "@/domain/ports/document-store";
import type {
  DeleteDocumentActionResult,
  ListDocumentsActionResult,
} from "@/presentation/actions/documents.action";

interface Deps {
  listDocuments: () => Promise<ListDocumentsActionResult>;
  deleteDocument: (id: string) => Promise<DeleteDocumentActionResult>;
}

/**
 * Owns the "My Scans" list: fetches it on mount, and keeps it in sync with
 * deletes without a full refetch. Kept separate from useScanner — browsing
 * saved documents and editing the active scan session are different
 * concerns that happen to interact only through `onOpen`.
 *
 * `refreshToken` — rather than the effect calling an exposed fetch
 * function directly — is what triggers a refetch, so the effect owns its
 * own fetch-then-setState logic instead of delegating to a callback a
 * consumer could also call outside an effect.
 */
export const useDocumentHistory = ({ listDocuments, deleteDocument }: Deps) => {
  const [documents, setDocuments] = useState<SavedDocumentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listDocuments().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setDocuments(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [listDocuments, refreshToken]);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteDocument(id);
      if (result.ok) {
        setDocuments((docs) => docs.filter((doc) => doc.id !== id));
        setError(null);
      } else {
        setError(result.message);
      }
    },
    [deleteDocument],
  );

  return { documents, error, refresh, remove };
};
