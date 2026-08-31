"use server";

import { auth } from "@/auth";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { SavedDocument, SavedDocumentSummary } from "@/domain/ports/document-store";
import { isAppError, type ErrorCode } from "@/domain/errors/app-error";
import { createServerServices } from "@/composition/server-container";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; message: string };
export type SaveDocumentActionResult = ActionResult<SavedDocument>;
export type ListDocumentsActionResult = ActionResult<SavedDocumentSummary[]>;
export type LoadDocumentActionResult = ActionResult<SavedDocument>;
export type DeleteDocumentActionResult = ActionResult<void>;

/**
 * Treated like a public API endpoint per Next.js's own guidance, same as
 * transcribe-image.action.ts: the UI only shows these actions to
 * signed-in users, but that alone isn't a security boundary, so the
 * session is re-checked here regardless of what the client sent. Document
 * ownership is then enforced by DocumentStore's ownerId scoping — see
 * src/domain/ports/document-store.ts.
 */
const requireUserId = async (): Promise<
  { ok: true; userId: string } | { ok: false; code: ErrorCode; message: string }
> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, code: "UNAUTHORIZED", message: "Please sign in to manage your scans." };
  }
  return { ok: true, userId: session.user.id };
};

const toErrorResult = (error: unknown, fallbackMessage: string): { ok: false; code: ErrorCode; message: string } => {
  if (isAppError(error)) return { ok: false, code: error.code, message: error.message };
  return { ok: false, code: "UNEXPECTED", message: fallbackMessage };
};

export async function saveDocumentAction(
  document: ScannedDocument,
  id?: string,
): Promise<SaveDocumentActionResult> {
  const identity = await requireUserId();
  if (!identity.ok) return identity;

  try {
    const { saveDocument } = createServerServices();
    const saved = await saveDocument(identity.userId, document, id);
    return { ok: true, data: saved };
  } catch (error) {
    return toErrorResult(error, "Something went wrong while saving. Please try again.");
  }
}

export async function listDocumentsAction(): Promise<ListDocumentsActionResult> {
  const identity = await requireUserId();
  if (!identity.ok) return identity;

  try {
    const { listDocuments } = createServerServices();
    const documents = await listDocuments(identity.userId);
    return { ok: true, data: documents };
  } catch (error) {
    return toErrorResult(error, "Something went wrong while loading your scans.");
  }
}

export async function loadDocumentAction(id: string): Promise<LoadDocumentActionResult> {
  const identity = await requireUserId();
  if (!identity.ok) return identity;

  try {
    const { loadDocument } = createServerServices();
    const document = await loadDocument(identity.userId, id);
    return { ok: true, data: document };
  } catch (error) {
    return toErrorResult(error, "Something went wrong while opening this scan.");
  }
}

export async function deleteDocumentAction(id: string): Promise<DeleteDocumentActionResult> {
  const identity = await requireUserId();
  if (!identity.ok) return identity;

  try {
    const { deleteDocument } = createServerServices();
    await deleteDocument(identity.userId, id);
    return { ok: true, data: undefined };
  } catch (error) {
    return toErrorResult(error, "Something went wrong while deleting this scan.");
  }
}
