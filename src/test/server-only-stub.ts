// Test-only stand-in for the "server-only" package. Next's own bundler
// swaps "server-only" for a no-op when compiling server code and keeps
// the real (throwing) module only in client bundles — Vitest has no such
// split, so vitest.config.ts aliases it to this file for every test run.
// Production behaviour is untouched: this file is never part of a build.
export {};
