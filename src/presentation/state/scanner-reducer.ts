import type { CapturedImage } from "@/domain/entities/captured-image";
import type { DocumentPage } from "@/domain/entities/scanned-document";

export type ScannerStatus = "idle" | "cropping" | "transcribing" | "reviewing" | "exporting";

export interface ScannerState {
  status: ScannerStatus;
  pages: DocumentPage[];
  /** The image currently being cropped or transcribed, if any. */
  pendingImage: CapturedImage | null;
  /** Editable transcription text while status is "reviewing". */
  draftText: string;
  error: string | null;
}

export const initialScannerState: ScannerState = {
  status: "idle",
  pages: [],
  pendingImage: null,
  draftText: "",
  error: null,
};

export type ScannerAction =
  | { type: "IMAGE_SELECTED"; image: CapturedImage }
  | { type: "TRANSCRIBE_STARTED"; image: CapturedImage }
  | { type: "TRANSCRIBE_SUCCEEDED"; text: string }
  | { type: "TRANSCRIBE_FAILED"; message: string }
  | { type: "TEXT_EDITED"; text: string }
  | { type: "PAGE_ADDED"; id: string }
  | { type: "EXPORT_STARTED" }
  | { type: "EXPORT_SUCCEEDED" }
  | { type: "EXPORT_FAILED"; message: string }
  | { type: "ERROR_DISMISSED" };

/**
 * The scanner's state machine: idle -> cropping -> transcribing ->
 * reviewing -> (PAGE_ADDED -> idle | EXPORT_SUCCEEDED -> idle). Every
 * branch returns a fresh object; nothing here ever mutates `state`. An
 * action that doesn't apply to the current status is a no-op — it
 * returns `state` unchanged rather than throwing, so a stray or
 * out-of-order dispatch can never corrupt the flow.
 */
export const scannerReducer = (state: ScannerState, action: ScannerAction): ScannerState => {
  switch (action.type) {
    case "IMAGE_SELECTED":
      if (state.status !== "idle") return state;
      return { ...state, status: "cropping", pendingImage: action.image, error: null };

    case "TRANSCRIBE_STARTED":
      if (state.status !== "cropping") return state;
      return { ...state, status: "transcribing", pendingImage: action.image };

    case "TRANSCRIBE_SUCCEEDED":
      if (state.status !== "transcribing") return state;
      return {
        ...state,
        status: "reviewing",
        draftText: action.text,
        pendingImage: null,
        error: null,
      };

    case "TRANSCRIBE_FAILED":
      // Also valid from "idle": selecting a file can fail to even become a
      // CapturedImage (unreadable file) before any transition happens.
      if (state.status === "reviewing" || state.status === "exporting") return state;
      return { ...state, status: "idle", pendingImage: null, error: action.message };

    case "TEXT_EDITED":
      if (state.status !== "reviewing") return state;
      return { ...state, draftText: action.text };

    case "PAGE_ADDED": {
      if (state.status !== "reviewing") return state;
      const newPage: DocumentPage = { id: action.id, text: state.draftText };
      return {
        ...state,
        status: "idle",
        pages: [...state.pages, newPage],
        draftText: "",
        error: null,
      };
    }

    case "EXPORT_STARTED":
      if (state.status !== "reviewing") return state;
      return { ...state, status: "exporting", error: null };

    case "EXPORT_SUCCEEDED":
      if (state.status !== "exporting") return state;
      return { ...initialScannerState };

    case "EXPORT_FAILED":
      if (state.status !== "exporting") return state;
      return { ...state, status: "reviewing", error: action.message };

    case "ERROR_DISMISSED":
      return { ...state, error: null };

    default:
      return state;
  }
};
