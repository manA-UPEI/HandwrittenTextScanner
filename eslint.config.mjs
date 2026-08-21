import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // --- Clean Architecture dependency rule, enforced at build time. ---
  // domain: zero dependencies on anything outside itself.
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "next",
                "next/*",
                "@google/genai",
                "pdf-lib",
                "react-easy-crop",
                "@/use-cases/*",
                "@/infrastructure/*",
                "@/composition/*",
                "@/presentation/*",
              ],
              message:
                "src/domain must have zero dependencies on frameworks, libraries, or other layers.",
            },
          ],
        },
      ],
    },
  },

  // use-cases: may depend on domain only.
  {
    files: ["src/use-cases/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "next",
                "next/*",
                "@google/genai",
                "pdf-lib",
                "react-easy-crop",
                "@/infrastructure/*",
                "@/composition/*",
                "@/presentation/*",
              ],
              message:
                "src/use-cases may depend on @/domain only — inject infrastructure through ports instead.",
            },
          ],
        },
      ],
    },
  },

  // presentation + app: must go through composition, never reach into infrastructure directly.
  {
    files: ["src/presentation/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/infrastructure/*"],
              message:
                "Presentation code may not import infrastructure directly — wire concrete adapters in @/composition instead.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
