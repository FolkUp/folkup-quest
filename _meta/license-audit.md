# License Audit — FolkUp Quest

> Last updated: 2026-03-02

## Project Licenses

| Scope | License | SPDX |
|-------|---------|------|
| Code (src/, scripts/, styles/) | MIT | MIT |
| Content (ink/) | CC BY-NC-SA 4.0 | CC-BY-NC-SA-4.0 |

## Dependencies

### Runtime

| Package | Version | License | Compatible | Notes |
|---------|---------|---------|------------|-------|
| inkjs | ^2.3.0 | MIT | Yes | Ink runtime for JavaScript |

### Dev Dependencies

| Package | Version | License | Compatible | Notes |
|---------|---------|---------|------------|-------|
| vite | ^6.2.0 | MIT | Yes | Build tool, not included in output |
| vitest | ^4.0.18 | MIT | Yes | Test runner, not included in output |
| node-id3 | ^0.2.6 | MIT | Yes | MP3 ID3 tagging, dev only |

## Fonts (self-hosted, GDPR compliant)

| Font | License | Compatible | Notes |
|------|---------|------------|-------|
| Playfair Display | OFL 1.1 | Yes | Heading font, self-hosted woff2 |
| Source Sans 3 | OFL 1.1 | Yes | Body text, self-hosted woff2 |

## Audio Assets

| Asset | Source | License | Compatible | Notes |
|-------|--------|---------|------------|-------|
| act1-dark.mp3 | Stable Audio 2.5 (Stability AI) via Replicate | Stability AI Community License — user owns outputs, commercial OK (<$1M revenue) | Yes | Act 1 dark ambient, 120s, trained on fully licensed dataset |
| act2-tension.mp3 | Stable Audio 2.5 (Stability AI) via Replicate | Stability AI Community License — user owns outputs, commercial OK (<$1M revenue) | Yes | Act 2 tension ambient, 120s, trained on fully licensed dataset |
| act3-resolution.mp3 | Stable Audio 2.5 (Stability AI) via Replicate | Stability AI Community License — user owns outputs, commercial OK (<$1M revenue) | Yes | Act 3 resolution ambient, 120s, trained on fully licensed dataset |

## Images

| Asset | Source | License | Compatible | Notes |
|-------|--------|---------|------------|-------|
| Favicon | FolkUp brand asset | Proprietary (FolkUp) | Yes | Own brand |
| OG image | FolkUp brand asset | Proprietary (FolkUp) | Yes | Own brand |
| PWA icon 192 | FolkUp brand asset | Proprietary (FolkUp) | Yes | Generated from favicon design |
| PWA icon 512 | FolkUp brand asset | Proprietary (FolkUp) | Yes | Generated from favicon design |
| Scene backgrounds (16 images) | FLUX.1 Schnell (Black Forest Labs) via Replicate | Apache 2.0 — user owns outputs | Yes | No attribution required; model outputs are freely usable |
| Character illustrations (10 images) | FLUX.1 Schnell (Black Forest Labs) via Replicate | Apache 2.0 — user owns outputs | Yes | Portrait 2:3, WebP format, same license as scene backgrounds |

## Analytics

| Service | License/Terms | GDPR | Notes |
|---------|--------------|------|-------|
| Cloudflare Web Analytics | Free, CF ToS | Yes — no cookies, no PII | Privacy-first, cookieless |

## Compliance Check

- [x] No GPL contamination in MIT code
- [x] No CC BY-NC content in commercial use context
- [x] No proprietary dependencies
- [x] All fonts self-hosted (GDPR)
- [x] Font OFL 1.1 license text included (public/fonts/OFL.txt)
- [x] Audio: Stable Audio 2.5, Stability AI Community License, user owns outputs, commercial OK (<$1M)
- [x] SPDX identifiers in README
- [x] LICENSE file present
- [x] LICENSE-CONTENT file present
- [x] Analytics: cookieless, GDPR compliant (Cloudflare Web Analytics)
- [x] Scene images: FLUX.1 Schnell Apache 2.0, user owns outputs, no attribution needed
