# Handwriting Scanner

Scan handwritten pages with your phone or webcam, transcribe them with Gemini, review/edit the text, and export the pages as a PDF. Signed-in users can also save a scan session and come back to it later.

Built as a Next.js App Router project following Clean Architecture: domain entities/ports, use cases, infrastructure adapters, and presentation are kept in separate layers under `src/`, wired together in `src/composition/`.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and fill in what you need:

   ```bash
   cp .env.local.example .env.local
   ```

   The defaults (`AI_PROVIDER=mock`, `DOCUMENT_STORE_BACKEND=memory`, `RATE_LIMIT_BACKEND=memory`) run entirely offline with no API keys. To use the real Gemini provider, Upstash Redis, or Google sign-in, fill in the corresponding variables — see the comments in `.env.local.example` for what each one does.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run a production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit` |
| `npm test` | Unit/contract tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | End-to-end tests (Playwright) — runs against a dev server with `AI_PROVIDER=mock` and in-memory backends, so it makes no external calls |

## Architecture

- `src/domain/` — entities, ports (interfaces), and error types. No framework or infrastructure code.
- `src/use-cases/` — application logic, depending only on domain ports.
- `src/infrastructure/` — concrete adapters (Gemini, pdf-lib, Upstash Redis, in-memory stores) implementing those ports. Swappable backends (AI provider, rate limiter, document store) are selected at runtime via env vars through a registry file per concern.
- `src/presentation/` — React components, hooks, and Server Actions.
- `src/composition/` — the only place concrete adapters meet the use cases they're injected into.

## Deploying

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying). If deploying to a serverless platform (e.g. Vercel), set `RATE_LIMIT_BACKEND=upstash` and `DOCUMENT_STORE_BACKEND=upstash` with real Upstash Redis credentials — the in-memory backends don't share state across instances or survive a restart.
