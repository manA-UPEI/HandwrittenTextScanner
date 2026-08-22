import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  children: ReactNode;
  /** The other legal page, linked at the bottom so a reader on one finds the other. */
  seeAlso: { href: "/terms" | "/privacy"; label: string };
}

/** Shared chrome for the Terms and Privacy pages: a back link and a comfortable reading width. */
export const LegalPageLayout = ({ children, seeAlso }: LegalPageLayoutProps) => (
  <div className="mx-auto max-w-2xl p-4">
    <Link href="/" className="mb-4 inline-block text-sm text-sky-700 hover:underline">
      ← Back to Handwriting Scanner
    </Link>
    <div className="rounded-xl border border-slate-200 bg-white p-6">{children}</div>
    <p className="mt-4 text-xs text-slate-400">
      Also read:{" "}
      <Link href={seeAlso.href} className="text-sky-700 hover:underline">
        {seeAlso.label}
      </Link>
    </p>
  </div>
);
