interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/** A dismissible banner for surfacing an AppError-derived message to the user. */
export const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
  >
    <p>{message}</p>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss error"
      className="shrink-0 font-medium text-red-800 hover:text-red-950"
    >
      Dismiss
    </button>
  </div>
);
