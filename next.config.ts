import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Baseline hardening headers applied to every route.
const baselineHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// CSP for the public site (everything except /admin and /api).
// NOTE: 'unsafe-inline' is required for script-src because Next.js streams
// inline RSC/hydration bootstrap scripts (self.__next_f...) that carry no
// nonce. A nonce-based CSP would force dynamic rendering on every request and
// break this site's static/ISR model, so we keep static rendering and rely on
// the other defenses instead: no external script origins are allowed,
// default-src/object-src are locked down, and the actual injection vectors are
// fixed at the source (SVG uploads blocked, rich-text link hrefs sanitized).
const publicCsp = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// Looser CSP for the Payload admin panel. The lexical/React admin bundle needs
// inline styles/scripts + eval, so a strict script CSP would break /admin.
const adminCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// next/image only renders an ABSOLUTE image src whose host is allow-listed.
// Payload serves media as absolute URLs off this same origin (serverURL =
// NEXT_PUBLIC_SITE_URL), so derive the allowed pattern from that env var —
// localhost in dev, the real domain in prod — instead of hardcoding a host.
const siteUrlForImages =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const {
  protocol: imgProtocol,
  hostname: imgHostname,
  port: imgPort,
} = new URL(siteUrlForImages);

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Remove the X-Powered-By: Next.js fingerprinting header.
  poweredByHeader: false,
  // Payload's admin uploads inline editor images through a Next.js Server
  // Action, whose request body defaults to a 1MB cap — far too small for
  // modern photos, and it fails before Payload's own file-size check. Raise it
  // above the Payload upload limit so normal-sized images go through.
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: imgProtocol.replace(":", "") as "http" | "https",
        hostname: imgHostname,
        ...(imgPort ? { port: imgPort } : {}),
      },
    ],
    qualities: [75, 88, 90],
  },
  async headers() {
    return [
      // Baseline hardening for every route, including /admin and /api.
      {
        source: "/:path*",
        headers: baselineHeaders,
      },
      // Strict CSP for the public site only — excludes /admin and /api via a
      // negative lookahead so the admin/API CSP rules below can win for those.
      {
        source: "/((?!admin|api).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
      // Looser CSP scoped to the Payload admin panel.
      {
        source: "/admin/:path*",
        headers: [{ key: "Content-Security-Policy", value: adminCsp }],
      },
      {
        source: "/admin",
        headers: [{ key: "Content-Security-Policy", value: adminCsp }],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
