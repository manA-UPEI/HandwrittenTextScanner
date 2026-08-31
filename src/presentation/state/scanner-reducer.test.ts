import { describe, expect, it } from "vitest";
import {
  initialScannerState,
  scannerReducer,
  type ScannerState,
} from "@/presentation/state/scanner-reducer";
import { fixtureImage, fixtureSavedDocument } from "@/test/fixtures";

const reviewingState: ScannerState = {
  ...initialScannerState,
  status: "reviewing",
  draftText: "Dear diary,",
};

describe("scannerReducer", () => {
  it("moves idle -> cropping on IMAGE_SELECTED", () => {
    const image = fixtureImage();
    const next = scannerReducer(initialScannerState, { type: "IMAGE_SELECTED", image });

    expect(next.status).toBe("cropping");
    expect(next.pendingImage).toBe(image);
  });

  it("ignores IMAGE_SELECTED when not idle", () => {
    const next = scannerReducer(reviewingState, { type: "IMAGE_SELECTED", image: fixtureImage() });
    expect(next).toBe(reviewingState);
  });

  it("moves cropping -> transcribing on TRANSCRIBE_STARTED", () => {
    const croppingState: ScannerState = { ...initialScannerState, status: "cropping" };
    const image = fixtureImage();

    const next = scannerReducer(croppingState, { type: "TRANSCRIBE_STARTED", image });

    expect(next.status).toBe("transcribing");
    expect(next.pendingImage).toBe(image);
  });

  it("ignores TRANSCRIBE_STARTED when idle", () => {
    const next = scannerReducer(initialScannerState, {
      type: "TRANSCRIBE_STARTED",
      image: fixtureImage(),
    });
    expect(next).toBe(initialScannerState);
  });

  it("moves transcribing -> reviewing on TRANSCRIBE_SUCCEEDED", () => {
    const transcribingState: ScannerState = { ...initialScannerState, status: "transcribing" };

    const next = scannerReducer(transcribingState, {
      type: "TRANSCRIBE_SUCCEEDED",
      text: "hello world",
    });

    expect(next.status).toBe("reviewing");
    expect(next.draftText).toBe("hello world");
    expect(next.pendingImage).toBeNull();
  });

  it.each(["idle", "cropping", "transcribing"] as const)(
    "moves %s -> idle with an error on TRANSCRIBE_FAILED",
    (status) => {
      const state: ScannerState = { ...initialScannerState, status };

      const next = scannerReducer(state, { type: "TRANSCRIBE_FAILED", message: "boom" });

      expect(next.status).toBe("idle");
      expect(next.error).toBe("boom");
      expect(next.pendingImage).toBeNull();
    },
  );

  it("ignores TRANSCRIBE_FAILED when reviewing", () => {
    const next = scannerReducer(reviewingState, { type: "TRANSCRIBE_FAILED", message: "boom" });
    expect(next).toBe(reviewingState);
  });

  it("updates draftText on TEXT_EDITED while reviewing", () => {
    const next = scannerReducer(reviewingState, { type: "TEXT_EDITED", text: "edited" });
    expect(next.draftText).toBe("edited");
  });

  it("ignores TEXT_EDITED when idle", () => {
    const next = scannerReducer(initialScannerState, { type: "TEXT_EDITED", text: "edited" });
    expect(next).toBe(initialScannerState);
  });

  it("appends a page and returns to idle on PAGE_ADDED", () => {
    const next = scannerReducer(reviewingState, { type: "PAGE_ADDED", id: "page-1" });

    expect(next.status).toBe("idle");
    expect(next.pages).toEqual([{ id: "page-1", text: "Dear diary," }]);
    expect(next.draftText).toBe("");
  });

  it("ignores PAGE_ADDED when idle", () => {
    const next = scannerReducer(initialScannerState, { type: "PAGE_ADDED", id: "page-1" });
    expect(next).toBe(initialScannerState);
  });

  it("moves reviewing -> exporting on EXPORT_STARTED", () => {
    const next = scannerReducer(reviewingState, { type: "EXPORT_STARTED" });
    expect(next.status).toBe("exporting");
  });

  it("resets to the initial state on EXPORT_SUCCEEDED", () => {
    const exportingState: ScannerState = {
      ...reviewingState,
      status: "exporting",
      pages: [{ id: "1", text: "kept" }],
    };

    const next = scannerReducer(exportingState, { type: "EXPORT_SUCCEEDED" });

    expect(next).toEqual(initialScannerState);
  });

  it("returns exporting -> reviewing with an error on EXPORT_FAILED, keeping pages and draft", () => {
    const exportingState: ScannerState = { ...reviewingState, status: "exporting" };

    const next = scannerReducer(exportingState, { type: "EXPORT_FAILED", message: "disk full" });

    expect(next.status).toBe("reviewing");
    expect(next.error).toBe("disk full");
    expect(next.draftText).toBe(reviewingState.draftText);
  });

  it("loads a saved document into a fresh idle session", () => {
    const document = fixtureSavedDocument({ id: "doc-1", title: "Old Notes" });

    const next = scannerReducer(initialScannerState, { type: "DOCUMENT_LOADED", document });

    expect(next.status).toBe("idle");
    expect(next.title).toBe("Old Notes");
    expect(next.pages).toEqual(document.pages);
    expect(next.documentId).toBe("doc-1");
  });

  it("ignores DOCUMENT_LOADED when the session already has pages", () => {
    const withPages: ScannerState = {
      ...initialScannerState,
      pages: [{ id: "1", text: "kept" }],
    };

    const next = scannerReducer(withPages, {
      type: "DOCUMENT_LOADED",
      document: fixtureSavedDocument(),
    });

    expect(next).toBe(withPages);
  });

  it("ignores DOCUMENT_LOADED when not idle", () => {
    const next = scannerReducer(reviewingState, {
      type: "DOCUMENT_LOADED",
      document: fixtureSavedDocument(),
    });
    expect(next).toBe(reviewingState);
  });

  it("records the document id on DOCUMENT_SAVED", () => {
    const next = scannerReducer(reviewingState, { type: "DOCUMENT_SAVED", id: "doc-2" });
    expect(next.documentId).toBe("doc-2");
  });

  it("sets an error on OPERATION_FAILED", () => {
    const next = scannerReducer(reviewingState, {
      type: "OPERATION_FAILED",
      message: "network down",
    });
    expect(next.error).toBe("network down");
  });

  it("clears the error on ERROR_DISMISSED regardless of status", () => {
    const errored: ScannerState = { ...initialScannerState, error: "oops" };
    const next = scannerReducer(errored, { type: "ERROR_DISMISSED" });
    expect(next.error).toBeNull();
  });

  it("never mutates the state object it was given", () => {
    const before = JSON.stringify(reviewingState);
    scannerReducer(reviewingState, { type: "TEXT_EDITED", text: "changed" });
    expect(JSON.stringify(reviewingState)).toBe(before);
  });
});
