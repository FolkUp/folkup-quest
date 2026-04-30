# FolkUp Quest

Interactive text adventure built with [Ink](https://www.inklestudios.com/ink/) engine. Atmospheric mystery exploring the folklore research process through a choice-driven narrative.

**Live:** [quest.folkup.app](https://quest.folkup.app)

[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE-CONTENT)
[![Brand Integration](https://img.shields.io/badge/Brand%20Integration-Phase%201a%20Complete-green.svg)](#brand-integration)

## Features

- **Interactive Narrative:** Choice-driven story exploring folklore research methodology
- **Atmospheric Design:** Dark gaming aesthetic with warm library soul integration
- **Progressive Web App:** Offline-capable, responsive design
- **Accessibility:** WCAG 2.1 AA compliant, screen reader support
- **Comic Integration:** Chapter 1 comic panels and generation system

## Brand Integration

FolkUp Quest underwent comprehensive brand integration (April 2026) to align with FolkUp ecosystem standards while preserving its unique gaming aesthetic.

### Phase 1a: Compliance Cleanup ✅ Complete
- **Level 1 Compliance:** Zero violations in deploying artifacts
- **Font Path Cleanup:** Hardcoded paths → relative paths
- **Evidence:** [commit 9b1c92d](https://github.com/FolkUp/folkup-quest/commit/9b1c92d)

### Phase 1b: Foundation Work (Pending)
- Brand Guide v2.5 tokens integration
- Gaming-variant storybook development
- Visual diff approval process

**Target:** Brand DNA alignment 75/100 while preserving gaming identity

## Project Structure

```
├── src/                 # Main application source
│   ├── engine/         # Ink engine and game logic
│   └── ui/            # User interface components
├── styles/             # CSS styling
├── comic/             # Chapter comic assets
│   ├── ch1/templates/ # HTML templates for panels
│   └── panels/        # Generated comic panels
├── scripts/           # Build and generation scripts
└── _meta/            # Project documentation and audits
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

Hosted on Cloudflare Pages with manual deployment:

```bash
npx wrangler pages deploy dist --project-name folkup-quest --branch master
```

## SPDX Licensing

- **Code:** `SPDX-License-Identifier: MIT`
- **Content (ink/ directory):** `SPDX-License-Identifier: CC-BY-NC-SA-4.0`
- **Fonts:** `SPDX-License-Identifier: OFL-1.1`

## Contributing

This project follows FolkUp ecosystem standards including:
- Banking-level compliance verification
- Constitutional workflow processes  
- Expert panel review requirements

See [`_meta/`](_meta/) for project documentation and audit reports.

## License

Code is licensed under [MIT](LICENSE). Narrative content (story text in `ink/` directory) is licensed under [CC BY-NC-SA 4.0](LICENSE-CONTENT). Fonts are licensed under [OFL 1.1](OFL.txt).
