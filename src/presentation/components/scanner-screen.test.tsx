import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScannerScreen } from "@/presentation/components/scanner-screen";
import { CONSENT_STORAGE_KEY } from "@/presentation/hooks/use-consent-gate";
import type { CapturedImage } from "@/domain/entities/captured-image";
import type { ScannedDocument } from "@/domain/entities/scanned-document";
import type { TranscribeImageActionResult } from "@/presentation/actions/transcribe-image.action";
import type {
  DeleteDocumentActionResult,
  ListDocumentsActionResult,
  LoadDocumentActionResult,
  SaveDocumentActionResult,
} from "@/presentation/actions/documents.action";

const RAW_TRANSCRIPTION = "Raw transcription text.";

// These tests exercise the scan flow itself, not the first-run consent
// gate (see consent-gate.test.tsx) — seed consent as already given so
// the gate never renders here.
beforeEach(() => {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");
});

const buildFakeServices = () => ({
  cropImage: vi.fn(async (source: CapturedImage) => source),
  generatePdf: vi.fn<(document: ScannedDocument) => Promise<void>>().mockResolvedValue(undefined),
});

/** Idle by default (empty list, no-op writes) — tests override individual
 *  calls when they need to exercise the save/load/delete flow itself. */
const buildFakeDocumentActions = () => ({
  save: vi.fn<() => Promise<SaveDocumentActionResult>>(),
  list: vi.fn<() => Promise<ListDocumentsActionResult>>().mockResolvedValue({ ok: true, data: [] }),
  load: vi.fn<() => Promise<LoadDocumentActionResult>>(),
  remove: vi.fn<() => Promise<DeleteDocumentActionResult>>(),
});

const pngFile = () => new File(["dummy-bytes"], "note.png", { type: "image/png" });

/**
 * Drives the capture -> crop -> review cycle once: uploads a file, fires
 * the underlying <img>'s load event (jsdom never fires this on its own
 * for a data URL, so this is the one manual nudge the real, unmodified
 * react-easy-crop needs to compute a crop area and enable "Confirm Crop"),
 * confirms the crop, and waits for the transcription to arrive.
 */
const scanOnePage = async () => {
  const user = userEvent.setup();
  await user.upload(screen.getByLabelText("Take a photo of your handwriting"), pngFile());

  const image = await waitFor(() => {
    const el = document.querySelector("img");
    if (!el) throw new Error("crop image not rendered yet");
    return el;
  });
  fireEvent.load(image);

  const confirmButton = await screen.findByRole("button", { name: /confirm crop/i });
  await waitFor(() => expect(confirmButton).toBeEnabled());
  await user.click(confirmButton);

  return screen.findByLabelText(/transcription/i, {}, { timeout: 2000 });
};

describe("ScannerScreen (full flow)", () => {
  it("carries edited transcriptions for two pages through to the exported PDF", async () => {
    const user = userEvent.setup();
    const transcribe = vi.fn(
      async (): Promise<TranscribeImageActionResult> => ({ ok: true, text: RAW_TRANSCRIPTION }),
    );
    const services = buildFakeServices();

    render(
      <ScannerScreen
        transcribe={transcribe}
        documentActions={buildFakeDocumentActions()}
        services={services}
      />,
    );

    // --- page one ---
    let textarea = await scanOnePage();
    expect(textarea).toHaveValue(RAW_TRANSCRIPTION);
    await user.clear(textarea);
    await user.type(textarea, "Edited page one");
    await user.click(screen.getByRole("button", { name: /add another page/i }));

    // back to the capture step, one page saved
    await screen.findByLabelText("Take a photo of your handwriting");
    expect(screen.getByText(/1 page saved/i)).toBeInTheDocument();

    // --- page two, exported instead of added ---
    textarea = await scanOnePage();
    expect(textarea).toHaveValue(RAW_TRANSCRIPTION);
    await user.clear(textarea);
    await user.type(textarea, "Edited page two");
    await user.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => expect(services.generatePdf).toHaveBeenCalledTimes(1));
    const [exportedDocument] = services.generatePdf.mock.calls[0];
    expect(exportedDocument.pages.map((page) => page.text)).toEqual([
      "Edited page one",
      "Edited page two",
    ]);

    // a successful export resets the flow back to the capture step
    await screen.findByLabelText("Take a photo of your handwriting");
  });

  it("surfaces a transcription failure as a dismissible error and returns to capture", async () => {
    const user = userEvent.setup();
    const transcribe = vi.fn(
      async (): Promise<TranscribeImageActionResult> => ({
        ok: false,
        code: "TRANSCRIPTION_FAILED",
        message: "Gemini could not transcribe this image.",
      }),
    );
    const services = buildFakeServices();

    render(
      <ScannerScreen
        transcribe={transcribe}
        documentActions={buildFakeDocumentActions()}
        services={services}
      />,
    );
    await scanOnePage().catch(() => {
      // scanOnePage waits for the textarea, which never appears on
      // failure — that rejection is expected here.
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/could not transcribe/i);

    await user.click(screen.getByRole("button", { name: /dismiss error/i }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Take a photo of your handwriting")).toBeInTheDocument();
  });
});
