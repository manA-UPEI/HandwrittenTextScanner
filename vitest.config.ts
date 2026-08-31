import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // See src/test/server-only-stub.ts for why this alias exists.
      "server-only": new URL("./src/test/server-only-stub.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    // e2e/ holds Playwright specs (run via `npm run test:e2e`), not Vitest ones.
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
