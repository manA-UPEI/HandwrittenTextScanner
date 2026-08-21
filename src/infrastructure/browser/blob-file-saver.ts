import type { FileSaver } from "@/domain/ports/file-saver";

/**
 * Triggers a browser download using a Blob URL. When a pre-opened
 * `target` window is given (see the FileSaver port doc), it's navigated
 * to the blob directly — the reliable path on iOS Safari, which silently
 * drops an `<a download>` click once the async PDF generation has burned
 * through the user-gesture window. Without a target (desktop browsers,
 * or a blocked popup), it falls back to a transient anchor click.
 */
export const makeBlobFileSaver = (): FileSaver => ({
  async save(bytes, fileName, mimeType, target) {
    // TypeScript's Uint8Array<ArrayBufferLike> isn't structurally assignable
    // to BlobPart's stricter ArrayBuffer-only view type, even though Blob
    // accepts any Uint8Array at runtime — hence the explicit cast.
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);

    if (target) {
      // Left un-revoked deliberately: the target window needs time to
      // load the blob, and the URL stays valid for the lifetime of this
      // page anyway (its lifetime is tied to this document, not target).
      target.location.href = url;
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },
});
