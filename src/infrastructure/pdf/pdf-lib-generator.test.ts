import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { makePdfLibGenerator } from "@/infrastructure/pdf/pdf-lib-generator";
import { A4_LAYOUT } from "@/domain/entities/page-layout";
import type { ScannedDocument } from "@/domain/entities/scanned-document";

describe("makePdfLibGenerator", () => {
  it("renders one PDF page per DocumentPage, sized to A4", async () => {
    const document: ScannedDocument = {
      title: "Two Pages",
      pages: [
        { id: "1", text: "First page." },
        { id: "2", text: "Second page." },
      ],
    };

    const bytes = await makePdfLibGenerator().generate(document);
    const pdf = await PDFDocument.load(bytes);

    expect(pdf.getPageCount()).toBe(2);
    const [firstPage] = pdf.getPages();
    expect(firstPage.getWidth()).toBeCloseTo(A4_LAYOUT.pageWidth, 1);
    expect(firstPage.getHeight()).toBeCloseTo(A4_LAYOUT.pageHeight, 1);
  });

  it("paginates a page whose text overflows a single sheet", async () => {
    const longText = Array.from({ length: 120 }, (_, i) => `Line number ${i}.`).join("\n");
    const document: ScannedDocument = { title: "Long", pages: [{ id: "1", text: longText }] };

    const bytes = await makePdfLibGenerator().generate(document);
    const pdf = await PDFDocument.load(bytes);

    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });

  it("produces a single blank page for a document with no pages", async () => {
    const bytes = await makePdfLibGenerator().generate({ title: "Empty", pages: [] });
    const pdf = await PDFDocument.load(bytes);

    expect(pdf.getPageCount()).toBe(1);
  });

  it("never throws on characters Helvetica cannot encode", async () => {
    const document: ScannedDocument = {
      title: "Emoji",
      pages: [{ id: "1", text: "Great job \u{1F389} — “nice”" }],
    };

    await expect(makePdfLibGenerator().generate(document)).resolves.toBeInstanceOf(Uint8Array);
  });
});
