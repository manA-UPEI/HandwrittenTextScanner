import type { CapturedImage, CropArea } from "@/domain/entities/captured-image";

/**
 * Produces a new CapturedImage containing only the pixels inside `area`.
 *
 * Implementations MUST:
 *  - return an image no larger than necessary for legible transcription
 *    (downscaling is expected and encouraged);
 *  - strip any embedded metadata (EXIF, GPS) from the source image;
 *  - throw AppError("INVALID_IMAGE") if `source` cannot be decoded.
 */
export interface ImageCropper {
  crop(source: CapturedImage, area: CropArea): Promise<CapturedImage>;
}
