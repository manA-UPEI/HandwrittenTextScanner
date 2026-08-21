/** Mime types the whole pipeline (capture, validation, Gemini) agrees to accept. */
export type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

/** A single image, already base64-encoded, ready to cross a network boundary. */
export interface CapturedImage {
  base64: string;
  mimeType: ImageMimeType;
}

/** A crop selection in the coordinate space react-easy-crop reports. */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
