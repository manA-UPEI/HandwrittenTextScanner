import type { ImageCropper } from "@/domain/ports/image-cropper";
import type { PdfGenerator } from "@/domain/ports/pdf-generator";
import type { FileSaver } from "@/domain/ports/file-saver";
import { makeCanvasImageCropper } from "@/infrastructure/browser/canvas-image-cropper";
import { makeBlobFileSaver } from "@/infrastructure/browser/blob-file-saver";
import { makeCropImage } from "@/use-cases/crop-image";
import { makeGeneratePdf } from "@/use-cases/generate-pdf";

interface ClientPorts {
  imageCropper: ImageCropper;
  pdfGenerator: PdfGenerator;
  fileSaver: FileSaver;
}

/**
 * pdf-lib is only needed once the user actually exports, so it's loaded
 * via a dynamic import inside `generate()` rather than at wiring time —
 * that keeps it code-split out of the bundle every visitor downloads just
 * to capture and crop a photo.
 */
const makeLazyPdfGenerator = (): PdfGenerator => ({
  async generate(document) {
    const { makePdfLibGenerator } = await import("@/infrastructure/pdf/pdf-lib-generator");
    return makePdfLibGenerator().generate(document);
  },
});

/**
 * Wires the client-side ports. Each one accepts an override, so a test —
 * or a future alternate implementation — can replace the cropper, the PDF
 * renderer, or the save mechanism independently, without a registry file
 * for ports that don't need runtime switching.
 */
export const createClientServices = (overrides: Partial<ClientPorts> = {}) => {
  const imageCropper = overrides.imageCropper ?? makeCanvasImageCropper();
  const pdfGenerator = overrides.pdfGenerator ?? makeLazyPdfGenerator();
  const fileSaver = overrides.fileSaver ?? makeBlobFileSaver();

  return {
    cropImage: makeCropImage({ imageCropper }),
    generatePdf: makeGeneratePdf({ pdfGenerator, fileSaver }),
  };
};
