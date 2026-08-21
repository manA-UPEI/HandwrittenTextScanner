import type { CapturedImage, CropArea } from "@/domain/entities/captured-image";
import type { ImageCropper } from "@/domain/ports/image-cropper";

interface Deps {
  imageCropper: ImageCropper;
}

/** Delegates cropping to whichever ImageCropper the composition root wired in. */
export const makeCropImage =
  ({ imageCropper }: Deps) =>
  (source: CapturedImage, area: CropArea): Promise<CapturedImage> =>
    imageCropper.crop(source, area);
