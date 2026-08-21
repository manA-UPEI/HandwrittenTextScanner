import type { ReactNode } from "react";

/** A plain content container — the only layout primitive steps need. */
export const Card = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
);
