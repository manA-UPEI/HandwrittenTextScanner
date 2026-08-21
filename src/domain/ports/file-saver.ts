/**
 * Delivers finished bytes to the user, however that means on the current
 * platform (a browser download, a native share sheet, a temp file, ...).
 *
 * Implementations MUST:
 *  - not throw for a user-cancelled save/share — resolve normally instead;
 *  - throw AppError("PDF_FAILED") only for a genuine I/O failure.
 *
 * `target`, when given, is a window opened synchronously by the caller at
 * the moment of the user's tap — before any `await` — for implementations
 * that need to preserve browser "user activation" across an async gap.
 * iOS Safari in particular will silently refuse to trigger a blob
 * download once activation has expired, which it does well before a PDF
 * finishes generating; opening the destination tab up front and
 * navigating it later keeps the save attached to the original gesture.
 */
export interface FileSaver {
  save(bytes: Uint8Array, fileName: string, mimeType: string, target?: Window | null): Promise<void>;
}
