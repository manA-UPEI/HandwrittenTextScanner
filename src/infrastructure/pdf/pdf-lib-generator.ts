import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { PdfGenerator } from "@/domain/ports/pdf-generator";
import { A4_LAYOUT, contentWidth } from "@/domain/entities/page-layout";
import { AppError } from "@/domain/errors/app-error";
import { wrapLines } from "@/infrastructure/pdf/text-layout";
import { sanitizeForWinAnsi } from "@/infrastructure/pdf/winansi";

const { pageWidth, pageHeight, marginX, marginY, fontSize, lineHeight } = A4_LAYOUT;

/**
 * Draws one DocumentPage's text onto a fresh PDF page, adding further PDF
 * pages as needed when the text overflows the first. A plain forEach (not
 * reduce) is used here because the loop's whole job is the side effect of
 * drawing — there's no accumulated value to hand back.
 */
const drawDocumentPage = (pdfDoc: PDFDocument, font: PDFFont, text: string): void => {
  const lines = wrapLines(text, (line) => font.widthOfTextAtSize(line, fontSize), contentWidth);

  let page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginY;

  lines.forEach((line) => {
    if (y < marginY) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - marginY;
    }
    page.drawText(line, { x: marginX, y, size: fontSize, font });
    y -= lineHeight;
  });
};

/** Renders a ScannedDocument to standard A4 PDF bytes using pdf-lib's built-in Helvetica. */
export const makePdfLibGenerator = (): PdfGenerator => ({
  async generate(document: ScannedDocument): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = document.pages.length > 0 ? document.pages : [{ id: "blank", text: "" }];

      pages.forEach(({ text }) => drawDocumentPage(pdfDoc, font, sanitizeForWinAnsi(text)));

      return await pdfDoc.save();
    } catch {
      throw new AppError("PDF_FAILED", "The PDF could not be generated.");
    }
  },
});
