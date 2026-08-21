import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { PdfGenerator } from "@/domain/ports/pdf-generator";
import type { FileSaver } from "@/domain/ports/file-saver";

interface Deps {
  pdfGenerator: PdfGenerator;
  fileSaver: FileSaver;
}

const toFileName = (title: string): string => `${title || "scanned-document"}.pdf`;

/**
 * Renders a ScannedDocument to PDF bytes and delivers them to the user.
 * Neither dependency knows about the other — swapping the renderer or the
 * delivery mechanism never touches this file.
 */
export const makeGeneratePdf =
  ({ pdfGenerator, fileSaver }: Deps) =>
  async (document: ScannedDocument, target?: Window | null): Promise<void> => {
    const bytes = await pdfGenerator.generate(document);
    await fileSaver.save(bytes, toFileName(document.title), "application/pdf", target);
  };
