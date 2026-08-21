/**
 * Every failure mode the app needs to distinguish, across every layer.
 * Keeping this as one flat union (rather than per-layer error types) is
 * what lets a Server Action map failures to a user-safe message without
 * knowing whether they came from Gemini, pdf-lib, or a validation guard.
 */
export type ErrorCode =
  | "INVALID_IMAGE"
  | "RATE_LIMITED"
  | "TRANSCRIPTION_FAILED"
  | "PDF_FAILED"
  | "CONFIG_MISSING";

/**
 * The only error type allowed to cross a layer boundary or the
 * server/client wire. Infrastructure adapters MUST catch SDK-specific
 * errors and rethrow as AppError — a raw fetch/SDK error escaping an
 * adapter is a bug, not an edge case.
 */
export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
