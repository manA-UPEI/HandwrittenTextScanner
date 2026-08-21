/**
 * A4 page geometry, in PDF points (1pt = 1/72 inch). These are document
 * rules — where text sits on a page — not a pdf-lib concern, so they live
 * in the domain and get consumed by whatever renderer implements PdfGenerator.
 */
export const A4_LAYOUT = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  marginX: 56,
  marginY: 56,
  fontSize: 11,
  lineHeight: 16.5, // 11pt * 1.5 leading
} as const;

export const contentWidth = A4_LAYOUT.pageWidth - A4_LAYOUT.marginX * 2;
