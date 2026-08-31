/**
 * Shared between playwright.config.ts and e2e/global-setup.ts, so the
 * webServer and the process that mints the test session cookie always
 * agree on the port and the AUTH_SECRET a JWT is encrypted/decrypted with.
 */
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const E2E_AUTH_SECRET = "e2e-test-secret-never-used-outside-this-suite";

export const E2E_USER = {
  id: "e2e-test-user",
  email: "e2e@example.com",
  name: "E2E Test User",
};

export const STORAGE_STATE_PATH = "e2e/.auth/session.json";

/**
 * AI_PROVIDER=mock and the memory backends mean this suite never makes a
 * real Gemini or Redis call — see mock.ts and the memory adapters under
 * src/infrastructure/{ai,persistence,security}. AUTH_GOOGLE_ID/SECRET are
 * unused placeholders: real sign-in is bypassed entirely by seeding a
 * session cookie in global-setup.ts, never by touching src/auth.ts.
 */
export const E2E_SERVER_ENV: Record<string, string> = {
  AI_PROVIDER: "mock",
  DOCUMENT_STORE_BACKEND: "memory",
  RATE_LIMIT_BACKEND: "memory",
  AUTH_SECRET: E2E_AUTH_SECRET,
  AUTH_GOOGLE_ID: "e2e-unused-client-id",
  AUTH_GOOGLE_SECRET: "e2e-unused-client-secret",
};
