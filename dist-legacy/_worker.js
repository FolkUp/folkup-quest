/**
 * FolkUp Quest — Cloudflare Pages Worker (Advanced Mode)
 *
 * - NO authentication (open access)
 * - Security headers on all responses
 * - Legal pages served at /legal/*
 */

function getCacheControl(pathname) {
  // Hashed by Vite — immutable forever
  if (pathname.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  // SW must always be revalidated
  if (pathname === "/sw.js") {
    return "no-cache";
  }
  // Fonts — stable, long cache
  if (pathname.startsWith("/fonts/")) {
    return "public, max-age=2592000, immutable";
  }
  // Audio — stable, long cache
  if (pathname.startsWith("/audio/")) {
    return "public, max-age=2592000, immutable";
  }
  // Images (scenes, characters) — stable
  if (pathname.startsWith("/images/")) {
    return "public, max-age=604800";
  }
  // Icons, manifest, OG — may change on branding updates
  if (
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webmanifest")
  ) {
    return "public, max-age=3600, must-revalidate";
  }
  // HTML — always revalidate
  if (pathname === "/" || pathname.endsWith(".html")) {
    return "no-cache";
  }
  // JSON (story.json) — revalidate
  if (pathname.endsWith(".json")) {
    return "public, max-age=3600, must-revalidate";
  }
  // Default
  return "public, max-age=3600";
}

function addHeaders(response, pathname) {
  const headers = new Headers(response.headers);

  // Cache-Control (browser + CDN)
  const cc = getCacheControl(pathname);
  headers.set("Cache-Control", cc);
  // Tell CF edge not to override our Cache-Control for no-cache resources
  if (cc === "no-cache") {
    headers.set("CDN-Cache-Control", "no-store");
  }

  // Security headers
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-XSS-Protection", "0");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data:",
      "media-src 'self'",
      "connect-src 'self' https://cloudflareinsights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    return addHeaders(response, url.pathname);
  },
};
