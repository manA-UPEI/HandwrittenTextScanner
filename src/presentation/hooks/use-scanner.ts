"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { CapturedImage, CropArea, ImageMimeType } from "@/domain/entities/captured-image";
import type { DocumentPage } from "@/domain/entities/scanned-document";
import { isAppError } from "@/domain/errors/app-error";
import { createClientServices } from "@/composition/client-container";
import { initialScannerState, scannerReducer } from "@/presentation/state/scanner-reducer";
import type {
  TranscribeImageActionInput,
  TranscribeImageActionResult,
} from "@/presentation/actions/transcribe-image.action";

type TranscribeFn = (input: TranscribeImageActionInput) => Promise<TranscribeImageActionResult>;

interface Deps {
  /** Injected rather than imported, so tests can supply a fake — see
   *  scanner-screen.test.tsx — with no module mocking required. */
  transcribe: TranscribeFn;
  /** Defaults to the real client-side ports; tests override with fakes. */
  services?: ReturnType<typeof createClientServices>;
}

const ALLOWED_MIME_TYPES: ImageMimeType[] = ["image/jpeg", "image/png", "image/webp"];

const readFileAsCapturedImage = (file: File): Promise<CapturedImage> =>
  new Promise((resolve, reject) => {
    const mimeType = file.type as ImageMimeType;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      reject(new Error(`Unsupported file type "${file.type || "unknown"}".`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => {
      const base64 = String(reader.result).split(",").at(1) ?? "";
      resolve({ base64, mimeType });
    };
    reader.readAsDataURL(file);
  });

const errorMessage = (error: unknown, fallback: string): string => {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
};

/**
 * Orchestrates the scan flow: owns the reducer, wires the client-side
 * ports via createClientServices, and exposes intent-named callbacks so
 * components never see a raw dispatch or a setter — no prop drilling.
 */
export const useScanner = ({ transcribe, services: servicesOverride }: Deps) => {
  const [state, dispatch] = useReducer(scannerReducer, initialScannerState);
  const services = useMemo(() => servicesOverride ?? createClientServices(), [servicesOverride]);

  const selectFile = useCallback(async (file: File) => {
    try {
      const image = await readFileAsCapturedImage(file);
      dispatch({ type: "IMAGE_SELECTED", image });
    } catch (error) {
      dispatch({
        type: "TRANSCRIBE_FAILED",
        message: errorMessage(error, "Could not read the selected file."),
      });
    }
  }, []);

  const confirmCrop = useCallback(
    async (area: CropArea) => {
      if (!state.pendingImage) return;

      try {
        const cropped = await services.cropImage(state.pendingImage, area);
        dispatch({ type: "TRANSCRIBE_STARTED", image: cropped });

        const result = await transcribe(cropped);
        if (!result.ok) {
          dispatch({ type: "TRANSCRIBE_FAILED", message: result.message });
          return;
        }
        dispatch({ type: "TRANSCRIBE_SUCCEEDED", text: result.text });
      } catch (error) {
        dispatch({
          type: "TRANSCRIBE_FAILED",
          message: errorMessage(error, "Could not process this image."),
        });
      }
    },
    [services, state.pendingImage, transcribe],
  );

  const editText = useCallback((text: string) => {
    dispatch({ type: "TEXT_EDITED", text });
  }, []);

  const addAnotherPage = useCallback(() => {
    dispatch({ type: "PAGE_ADDED", id: crypto.randomUUID() });
  }, []);

  const downloadPdf = useCallback(async () => {
    // Opened synchronously, before any `await`, so it's still within the
    // click's user-activation window — see the FileSaver port doc for why
    // that matters (iOS Safari drops the save otherwise).
    const presentationWindow = window.open("", "_blank");
    presentationWindow?.document.write(
      "<title>Generating PDF…</title><body style='font-family:sans-serif;padding:2rem'>Generating your PDF…</body>",
    );

    dispatch({ type: "EXPORT_STARTED" });
    try {
      const draftPage: DocumentPage[] = state.draftText.trim()
        ? [{ id: crypto.randomUUID(), text: state.draftText }]
        : [];
      await services.generatePdf(
        { title: "Scanned Document", pages: [...state.pages, ...draftPage] },
        presentationWindow,
      );
      dispatch({ type: "EXPORT_SUCCEEDED" });
    } catch (error) {
      presentationWindow?.close();
      dispatch({
        type: "EXPORT_FAILED",
        message: errorMessage(error, "Could not generate the PDF."),
      });
    }
  }, [services, state.draftText, state.pages]);

  const dismissError = useCallback(() => dispatch({ type: "ERROR_DISMISSED" }), []);

  return { state, selectFile, confirmCrop, editText, addAnotherPage, downloadPdf, dismissError };
};
