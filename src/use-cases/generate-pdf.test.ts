import { describe, expect, it } from "vitest";
import { makeGeneratePdf } from "@/use-cases/generate-pdf";
import { makeFakeFileSaver, makeFakePdfGenerator } from "@/test/fakes";
import type { ScannedDocument } from "@/domain/entities/scanned-document";

const document: ScannedDocument = {
  title: "My Diary",
  pages: [{ id: "1", text: "Dear diary," }],
};

describe("makeGeneratePdf", () => {
  it("renders the document then saves the resulting bytes as a PDF", async () => {
    const pdfGenerator = makeFakePdfGenerator();
    const fileSaver = makeFakeFileSaver();
    const generatePdf = makeGeneratePdf({ pdfGenerator, fileSaver });

    await generatePdf(document);

    expect(pdfGenerator.calls).toEqual([document]);
    expect(fileSaver.saved).toHaveLength(1);
    expect(fileSaver.saved[0].fileName).toBe("My Diary.pdf");
    expect(fileSaver.saved[0].mimeType).toBe("application/pdf");
  });

  it("falls back to a default file name when the title is empty", async () => {
    const pdfGenerator = makeFakePdfGenerator();
    const fileSaver = makeFakeFileSaver();
    const generatePdf = makeGeneratePdf({ pdfGenerator, fileSaver });

    await generatePdf({ ...document, title: "" });

    expect(fileSaver.saved[0].fileName).toBe("scanned-document.pdf");
  });
});
