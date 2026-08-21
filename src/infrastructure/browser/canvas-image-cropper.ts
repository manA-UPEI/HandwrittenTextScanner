import type { CapturedImage, CropArea } from "@/domain/entities/captured-image";
import type { ImageCropper } from "@/domain/ports/image-cropper";
import { AppError } from "@/domain/errors/app-error";

const MAX_EDGE_PX = 2000;
const JPEG_QUALITY = 0.85;

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new AppError("INVALID_IMAGE", "The selected file could not be read as an image."));
    image.src = dataUrl;
  });

const toDataUrl = (image: CapturedImage): string => `data:${image.mimeType};base64,${image.base64}`;

const scaleToFit = (width: number, height: number, maxEdge: number) => {
  const longestEdge = Math.max(width, height);
  const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

/**
 * Applies a crop selection to the source image on an offscreen canvas,
 * downscaling the result to a 2000px max edge and re-encoding as JPEG.
 * Re-encoding through canvas also strips any embedded metadata — EXIF,
 * including GPS — before the image ever leaves the device.
 */
export const makeCanvasImageCropper = (): ImageCropper => ({
  async crop(source, area: CropArea): Promise<CapturedImage> {
    const image = await loadImage(toDataUrl(source));
    const { width, height } = scaleToFit(area.width, area.height, MAX_EDGE_PX);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new AppError("INVALID_IMAGE", "This browser cannot process images.");
    }

    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = dataUrl.split(",").at(1) ?? "";

    return { base64, mimeType: "image/jpeg" };
  },
});
