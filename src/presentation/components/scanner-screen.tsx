"use client";

import type {
  TranscribeImageActionInput,
  TranscribeImageActionResult,
} from "@/presentation/actions/transcribe-image.action";
import type {
  DeleteDocumentActionResult,
  ListDocumentsActionResult,
  LoadDocumentActionResult,
  SaveDocumentActionResult,
} from "@/presentation/actions/documents.action";
import type { DocumentPage } from "@/domain/entities/scanned-document";
import { createClientServices } from "@/composition/client-container";
import { useScanner } from "@/presentation/hooks/use-scanner";
import { useDocumentHistory } from "@/presentation/hooks/use-document-history";
import { useConsentGate } from "@/presentation/hooks/use-consent-gate";
import { CaptureStep } from "@/presentation/components/capture-step";
import { ConsentGate } from "@/presentation/components/consent-gate";
import { CropStep } from "@/presentation/components/crop-step";
import { DocumentHistory } from "@/presentation/components/document-history";
import { PageList } from "@/presentation/components/page-list";
import { PrivacyNotice } from "@/presentation/components/privacy-notice";
import { ReviewStep } from "@/presentation/components/review-step";
import { Button } from "@/presentation/components/ui/button";
import { Spinner } from "@/presentation/components/ui/spinner";
import { ErrorBanner } from "@/presentation/components/ui/error-banner";

interface DocumentActions {
  save: (
    document: { title: string; pages: DocumentPage[] },
    id?: string,
  ) => Promise<SaveDocumentActionResult>;
  list: () => Promise<ListDocumentsActionResult>;
  load: (id: string) => Promise<LoadDocumentActionResult>;
  remove: (id: string) => Promise<DeleteDocumentActionResult>;
}

interface ScannerScreenProps {
  /** Injected, not imported — see transcribe-image.action.ts and use-scanner.ts. */
  transcribe: (input: TranscribeImageActionInput) => Promise<TranscribeImageActionResult>;
  documentActions: DocumentActions;
  /** Defaults to the real client-side ports; tests override with fakes. */
  services?: ReturnType<typeof createClientServices>;
}

/**
 * The single orchestrating component: renders whichever step the reducer
 * says is active, and wires the hook's callbacks straight to props — no
 * intermediate state, no prop drilling past this point.
 */
export const ScannerScreen = ({ transcribe, documentActions, services }: ScannerScreenProps) => {
  const {
    state,
    selectFile,
    confirmCrop,
    editText,
    addAnotherPage,
    downloadPdf,
    saveCurrentDocument,
    openDocument,
    dismissError,
  } = useScanner({
    transcribe,
    saveDocument: documentActions.save,
    loadDocument: documentActions.load,
    services,
  });
  const { status: consentStatus, accept: acceptConsent } = useConsentGate();
  const documentHistory = useDocumentHistory({
    listDocuments: documentActions.list,
    deleteDocument: documentActions.remove,
  });

  const showDocumentHistory =
    state.status === "idle" && state.pages.length === 0 && !state.draftText;

  // The document-history list is fetched once; refresh it after a save so
  // a document saved this session shows up once the user gets back to a
  // fresh idle screen, without needing a page reload.
  const handleSave = async () => {
    await saveCurrentDocument();
    documentHistory.refresh();
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-slate-900">Handwriting Scanner</h1>

      {state.error && <ErrorBanner message={state.error} onDismiss={dismissError} />}

      {state.status === "idle" && (
        <>
          <CaptureStep onFileSelected={selectFile} />
          {state.pages.length > 0 && (
            <>
              <PageList pages={state.pages} />
              <Button variant="secondary" onClick={handleSave}>
                Save Progress
              </Button>
            </>
          )}
          {showDocumentHistory && (
            <DocumentHistory
              documents={documentHistory.documents}
              onOpen={openDocument}
              onDelete={documentHistory.remove}
            />
          )}
          <PrivacyNotice />
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
          onSave={handleSave}
        />
      )}
      {consentStatus === "needed" && <ConsentGate onAccept={acceptConsent} />}
    </div>
  );
};
