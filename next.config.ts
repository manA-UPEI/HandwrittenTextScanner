import type { NextConfig } from "next";

// Camera capture goes through <input type="file" capture>, which hands off
// to the OS camera app rather than calling getUserMedia() on this page —
// so no Permissions-Policy allowance is needed for it.
//
// A nonce-based script-src would be stricter, but it requires every page
// (including the static /terms and /privacy) to render dynamically per
// request — Next.js only threads a nonce into its own hydration scripts
// when it can generate one from Proxy on that request. 'unsafe-inline' is
// Next's own documented fallback for apps that don't need that; it still
// blocks loading script/style/img from any origin but this one, which is
// the actual threat a dependency compromise or injected-content attack
// poses here.
const isDev = process.env.NODE_ENV === "development";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  // The Google sign-in redirect is a server-issued 302, not a page fetch,
  // but form-action still governs it since it originates from the <form>
  // in page.tsx.
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Handwriting photos arrive as base64; a few MB of overhead is expected.
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
