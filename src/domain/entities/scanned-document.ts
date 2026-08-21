/** One transcribed sheet, in the order it was scanned. */
export interface DocumentPage {
  id: string;
  text: string;
}

/** A complete scan session: every page the user has captured so far. */
export interface ScannedDocument {
  title: string;
  pages: DocumentPage[];
}
