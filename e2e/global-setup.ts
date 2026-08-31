import { chromium } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { CONSENT_STORAGE_KEY } from "../src/presentation/hooks/use-consent-gate";
import { E2E_AUTH_SECRET, E2E_BASE_URL, E2E_USER, STORAGE_STATE_PATH } from "./env";

/** Auth.js's default JWT session cookie name for an http (non-secure) origin. */
const SESSION_COOKIE_NAME = "authjs.session-token";

/**
 * Mints a signed-in session without ever touching src/auth.ts or a real
 * Google OAuth flow: encodes a JWT with the same AUTH_SECRET the webServer
 * uses (see e2e/env.ts) and drops it in as a cookie. Also seeds the
 * first-run consent flag, since a fresh browser context would otherwise
 * show the consent gate before every single spec. Both are saved as
 * Playwright storageState for specs that opt in via
 * `test.use({ storageState: STORAGE_STATE_PATH })`.
 */
export default async function globalSetup() {
  const token = await encode({
    secret: E2E_AUTH_SECRET,
    salt: SESSION_COOKIE_NAME,
    token: { sub: E2E_USER.id, email: E2E_USER.email, name: E2E_USER.name },
  });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      url: E2E_BASE_URL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();
  await page.goto(E2E_BASE_URL);
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [CONSENT_STORAGE_KEY, "true"],
  );

  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
}
