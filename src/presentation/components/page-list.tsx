import type { DocumentPage } from "@/domain/entities/scanned-document";
import { Card } from "@/presentation/components/ui/card";

/** A compact summary of pages already saved in this scan session. */
export const PageList = ({ pages }: { pages: DocumentPage[] }) => (
  <Card>
    <p className="mb-2 text-sm font-medium text-slate-700">
      {pages.length} page{pages.length === 1 ? "" : "s"} saved
    </p>
    <ul className="space-y-1 text-sm text-slate-500">
      {pages.map((page, index) => (
        <li key={page.id} className="truncate">
          {index + 1}. {page.text.split("\n")[0] || "(blank page)"}
        </li>
      ))}
    </ul>
  </Card>
);
