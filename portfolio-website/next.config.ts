import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Static Content Security Policy. A nonce-based CSP would force every page into
 * dynamic rendering, so inline scripts and styles (Next's RSC payload, Motion's
 * style attributes) are allowed instead. Dev adds eval and websockets for HMR. Umami Cloud
 * (6.2) loads from cloud.umami.is and sends to gateway.umami.is.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cloud.umami.is${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://github.com https://*.githubusercontent.com",
  "font-src 'self'",
  `connect-src 'self' https://vitals.vercel-insights.com https://gateway.umami.is${isDev ? " ws: http://localhost:*" : ""}`,
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
  // The guide embeds questions with Transformers.js on onnxruntime-node (native binaries), so neither is bundled.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  // Transformers.js loads onnxruntime-node dynamically, so file tracing misses it. The package ships
  // every platform (288 MB); Vercel runs Linux x64 (45 MB), so only that binary goes in.
  outputFileTracingIncludes: {
    "/api/guide": [
      "node_modules/onnxruntime-node/package.json",
      "node_modules/onnxruntime-node/dist/**",
      "node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**",
      "node_modules/onnxruntime-common/**",
    ],
  },
  // The web runtime isn't used on the server.
  outputFileTracingExcludes: {
    "/api/guide": ["node_modules/onnxruntime-web/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
