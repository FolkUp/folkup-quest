/**
 * FolkUp Quest — Cloudflare Pages Worker (Advanced Mode)
 *
 * - NO authentication (open access)
 * - Security headers on all responses
 * - Legal pages served at /legal/*
 */

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);

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
    const response = await env.ASSETS.fetch(request);
    return addSecurityHeaders(response);
  },
};
