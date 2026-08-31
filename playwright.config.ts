import { defineConfig } from "@playwright/test";
import { E2E_BASE_URL, E2E_PORT, E2E_SERVER_ENV } from "./e2e/env";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- -p ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: E2E_SERVER_ENV,
  },
});
