/** A small inline loading indicator, paired with a status message by the caller. */
export const Spinner = ({ label }: { label: string }) => (
  <div role="status" className="flex items-center gap-3 text-slate-600">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
    <span>{label}</span>
  </div>
);
