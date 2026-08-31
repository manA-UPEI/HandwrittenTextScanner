import type { SavedDocumentSummary } from "@/domain/ports/document-store";
import { Button } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";

interface DocumentHistoryProps {
  documents: SavedDocumentSummary[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Lists previously saved scans, letting the user reopen or discard one. */
export const DocumentHistory = ({ documents, onOpen, onDelete }: DocumentHistoryProps) => {
  if (documents.length === 0) return null;

  return (
    <Card>
      <p className="mb-2 text-sm font-medium text-slate-700">My Scans</p>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
              {doc.title} · {doc.pageCount} page{doc.pageCount === 1 ? "" : "s"}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                className="min-h-0 px-3 py-1.5 text-sm"
                aria-label={`Open ${doc.title}`}
                onClick={() => onOpen(doc.id)}
              >
                Open
              </Button>
              <Button
                variant="secondary"
                className="min-h-0 px-3 py-1.5 text-sm"
                aria-label={`Delete ${doc.title}`}
                onClick={() => onDelete(doc.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
