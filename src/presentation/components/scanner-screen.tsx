"use client";

import type {
  TranscribeImageActionInput,
  TranscribeImageActionResult,
} from "@/presentation/actions/transcribe-image.action";
import { createClientServices } from "@/composition/client-container";
import { useScanner } from "@/presentation/hooks/use-scanner";
import { DebugPanel } from "@/presentation/components/debug-panel"; // TEMPORARY — see debug-log.ts
import { CaptureStep } from "@/presentation/components/capture-step";
import { CropStep } from "@/presentation/components/crop-step";
import { PageList } from "@/presentation/components/page-list";
import { ReviewStep } from "@/presentation/components/review-step";
import { Spinner } from "@/presentation/components/ui/spinner";
import { ErrorBanner } from "@/presentation/components/ui/error-banner";

interface ScannerScreenProps {
  /** Injected, not imported — see transcribe-image.action.ts and use-scanner.ts. */
  transcribe: (input: TranscribeImageActionInput) => Promise<TranscribeImageActionResult>;
  /** Defaults to the real client-side ports; tests override with fakes. */
  services?: ReturnType<typeof createClientServices>;
}

/**
 * The single orchestrating component: renders whichever step the reducer
 * says is active, and wires the hook's callbacks straight to props — no
 * intermediate state, no prop drilling past this point.
 */
export const ScannerScreen = ({ transcribe, services }: ScannerScreenProps) => {
  const { state, selectFile, confirmCrop, editText, addAnotherPage, downloadPdf, dismissError } =
    useScanner({ transcribe, services });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-slate-900">Handwriting Scanner</h1>

      {state.error && <ErrorBanner message={state.error} onDismiss={dismissError} />}

      {state.status === "idle" && (
        <>
          <CaptureStep onFileSelected={selectFile} />
          {state.pages.length > 0 && <PageList pages={state.pages} />}
        </>
      )}

      {state.status === "cropping" && state.pendingImage && (
        <CropStep image={state.pendingImage} onConfirm={confirmCrop} />
      )}

      {state.status === "transcribing" && <Spinner label="Transcribing your handwriting…" />}

      {(state.status === "reviewing" || state.status === "exporting") && (
        <ReviewStep
          draftText={state.draftText}
          pages={state.pages}
          isExporting={state.status === "exporting"}
          onTextChange={editText}
          onAddPage={addAnotherPage}
          onDownload={downloadPdf}
        />
      )}
      <DebugPanel />
    </div>
  );
};
