"use client";

import type { DocumentPage } from "@/domain/entities/scanned-document";
import { Button } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";
import { PageList } from "@/presentation/components/page-list";

interface ReviewStepProps {
  draftText: string;
  pages: DocumentPage[];
  isExporting: boolean;
  onTextChange: (text: string) => void;
  onAddPage: () => void;
  onDownload: () => void;
  onSave: () => void;
}

/** Lets the user correct the transcription before it's added to the PDF. */
export const ReviewStep = ({
  draftText,
  pages,
  isExporting,
  onTextChange,
  onAddPage,
  onDownload,
  onSave,
}: ReviewStepProps) => (
  <div className="flex flex-col gap-4">
    <Card>
      <label htmlFor="transcription" className="mb-2 block text-sm font-medium text-slate-700">
        Transcription
      </label>
      <textarea
        id="transcription"
        value={draftText}
        onChange={(event) => onTextChange(event.target.value)}
        rows={10}
        className="w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm"
      />
    </Card>

    {pages.length > 0 && <PageList pages={pages} />}

    <div className="flex flex-col gap-3 sm:flex-row">
      <Button variant="secondary" onClick={onAddPage} className="flex-1">
        Add Another Page
      </Button>
      <Button variant="secondary" onClick={onSave} className="flex-1">
        Save Progress
      </Button>
      <Button onClick={onDownload} disabled={isExporting} className="flex-1">
        {isExporting ? "Generating PDF…" : "Download PDF"}
      </Button>
    </div>
  </div>
);
