"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import type { CapturedImage, CropArea } from "@/domain/entities/captured-image";
import { A4_LAYOUT } from "@/domain/entities/page-layout";
import { Button } from "@/presentation/components/ui/button";

interface CropStepProps {
  image: CapturedImage;
  onConfirm: (area: CropArea) => void;
}

const A4_ASPECT = A4_LAYOUT.pageWidth / A4_LAYOUT.pageHeight;

const toDataUrl = (image: CapturedImage): string => `data:${image.mimeType};base64,${image.base64}`;

/**
 * Isolates the crop selection to the handwritten paper. The sole
 * importer of react-easy-crop, so swapping croppers is a one-file change.
 */
export const CropStep = ({ image, onConfirm }: CropStepProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-96 w-full overflow-hidden rounded-xl bg-slate-900">
        <Cropper
          image={toDataUrl(image)}
          crop={crop}
          zoom={zoom}
          aspect={A4_ASPECT}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      <p className="text-sm text-slate-500">
        Drag to position, pinch or scroll to zoom, then confirm the crop.
      </p>
      <Button onClick={() => croppedArea && onConfirm(croppedArea)} disabled={!croppedArea}>
        Confirm Crop
      </Button>
    </div>
  );
};
