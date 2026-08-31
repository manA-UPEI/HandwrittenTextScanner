import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScannerScreen } from "@/presentation/components/scanner-screen";
import { CONSENT_STORAGE_KEY } from "@/presentation/hooks/use-consent-gate";
import type { TranscribeImageActionResult } from "@/presentation/actions/transcribe-image.action";
import type {
  DeleteDocumentActionResult,
  ListDocumentsActionResult,
  LoadDocumentActionResult,
  SaveDocumentActionResult,
} from "@/presentation/actions/documents.action";

const transcribe = vi.fn(
  async (): Promise<TranscribeImageActionResult> => ({ ok: true, text: "irrelevant" }),
);

/** Idle by default — these tests exercise the consent gate, not persistence. */
const documentActions = {
  save: vi.fn<() => Promise<SaveDocumentActionResult>>(),
  list: vi.fn<() => Promise<ListDocumentsActionResult>>().mockResolvedValue({ ok: true, data: [] }),
  load: vi.fn<() => Promise<LoadDocumentActionResult>>(),
  remove: vi.fn<() => Promise<DeleteDocumentActionResult>>(),
};

afterEach(() => {
  window.localStorage.clear();
});

describe("ConsentGate (first-run disclaimer)", () => {
  it("blocks nothing having been accepted yet, and shows the disclaimer", async () => {
    render(<ScannerScreen transcribe={transcribe} documentActions={documentActions} />);

    expect(await screen.findByText(/before you start/i)).toBeInTheDocument();
    expect(screen.getByText(/don't scan sensitive documents/i)).toBeInTheDocument();
    expect(screen.getByText(/no warranty/i)).toBeInTheDocument();
  });

  it("keeps Continue disabled until the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<ScannerScreen transcribe={transcribe} documentActions={documentActions} />);

    await screen.findByText(/before you start/i);
    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(continueButton).toBeEnabled();
  });

  it("dismisses the gate and persists acceptance once confirmed", async () => {
    const user = userEvent.setup();
    render(<ScannerScreen transcribe={transcribe} documentActions={documentActions} />);

    await screen.findByText(/before you start/i);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(screen.queryByText(/before you start/i)).not.toBeInTheDocument());
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("true");
  });

  it("does not show the gate again once consent was already given", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");

    render(<ScannerScreen transcribe={transcribe} documentActions={documentActions} />);

    await screen.findByLabelText("Take a photo of your handwriting");
    expect(screen.queryByText(/before you start/i)).not.toBeInTheDocument();
  });
});
