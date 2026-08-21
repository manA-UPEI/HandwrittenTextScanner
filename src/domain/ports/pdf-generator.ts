import type { ScannedDocument } from "@/domain/entities/scanned-document";

/**
 * Renders a ScannedDocument into a standard A4 PDF.
 *
 * Implementations MUST:
 *  - lay out pages per src/domain/entities/page-layout.ts (A4 size, margins);
 *  - start each DocumentPage on its own PDF page;
 *  - word-wrap and paginate long text automatically — never truncate it;
 *  - throw AppError("PDF_FAILED") if rendering cannot complete.
 *
 * Implementations MUST NOT perform the download themselves — that is
 * FileSaver's job, so a server-side renderer is a drop-in replacement.
 */
export interface PdfGenerator {
  generate(document: ScannedDocument): Promise<Uint8Array>;
}
