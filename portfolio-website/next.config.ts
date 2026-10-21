import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Static Content Security Policy. A nonce-based CSP would force every page into
 * dynamic rendering, so inline scripts and styles (Next's RSC payload, Motion's
 * style attributes) are allowed instead. Dev adds eval and websockets for HMR.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://github.com https://*.githubusercontent.com",
  "font-src 'self'",
  `connect-src 'self' https://vitals.vercel-insights.com${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://www.youtube-nocookie.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
