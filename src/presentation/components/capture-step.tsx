"use client";

import type { ChangeEvent } from "react";
import { Card } from "@/presentation/components/ui/card";

interface CaptureStepProps {
  onFileSelected: (file: File) => void;
}

interface FileButtonProps {
  label: string;
  ariaLabel: string;
  capture?: "environment";
  variant: "primary" | "secondary";
  onFileSelected: (file: File) => void;
}

const VARIANT_CLASSES = {
  primary: "bg-slate-900 text-white",
  secondary: "border border-slate-300 bg-white text-slate-900",
};

/**
 * One tappable file input, styled as a button. The input is layered over
 * the visible label with opacity instead of being clip-hidden (the usual
 * "sr-only" technique): iOS Safari silently refuses to open the picker
 * for an input clipped to 1px, so it has to remain part of the real
 * tappable area to work there.
 */
const FileButton = ({ label, ariaLabel, capture, variant, onFileSelected }: FileButtonProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelected(file);
    event.target.value = ""; // allow re-selecting the same file later
  };

  return (
    <div className="relative">
      <span
        className={`block min-h-12 rounded-lg px-5 py-3 text-center text-base font-medium ${VARIANT_CLASSES[variant]}`}
      >
        {label}
      </span>
      <input
        type="file"
        accept="image/*"
        capture={capture}
        aria-label={ariaLabel}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
};

/**
 * The entry point of the flow, with two explicit controls rather than
 * one: once `capture` is present, iOS Safari (and most mobile browsers)
 * skip straight to the camera and drop the photo-library option
 * entirely — that's spec behavior, not something fixable with markup —
 * so picking an existing photo needs a separate, capture-less input.
 */
export const CaptureStep = ({ onFileSelected }: CaptureStepProps) => (
  <Card>
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="text-lg font-medium text-slate-900">Scan a handwritten page</span>
      <span className="text-sm text-slate-500">Take a photo or choose an image to begin</span>

      <div className="mt-2 flex w-full flex-col gap-3 px-6 sm:flex-row sm:justify-center sm:px-0">
        <FileButton
          label="Take Photo"
          ariaLabel="Take a photo of your handwriting"
          capture="environment"
          variant="primary"
          onFileSelected={onFileSelected}
        />
        <FileButton
          label="Choose from Library"
          ariaLabel="Choose a photo from your library"
          variant="secondary"
          onFileSelected={onFileSelected}
        />
      </div>
    </div>
  </Card>
);
