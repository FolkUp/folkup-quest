# FolkUp Quest

Interactive text adventure built with [Ink](https://www.inklestudios.com/ink/) engine. Atmospheric mystery exploring the folklore research process through a choice-driven narrative.

**Live:** [quest.folkup.app](https://quest.folkup.app)

[![Version](https://img.shields.io/badge/Version-1.1.2-orange.svg)](#)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE-CONTENT)
[![Brand Integration](https://img.shields.io/badge/Brand%20Integration-Phase%201a%20Complete-green.svg)](#brand-integration)

## Features

- **Interactive Narrative:** Choice-driven story exploring folklore research methodology
- **Atmospheric Design:** Dark gaming aesthetic with warm library soul integration
- **Progressive Web App:** Offline-capable, responsive design
- **Accessibility:** WCAG 2.1 AA compliant, screen reader support
- **Comic Integration:** 30 interactive comic panels with progressive unlock system and micro-stories
- **Panel Gallery:** Standalone reader interface with act-based categorization
- **Branching Paths:** Folk Path vs Dragon Path unlock different panel sets
- **Privacy-First Analytics:** GDPR-compliant engagement tracking with granular consent
- **User Privacy Controls:** Complete data rights dashboard with one-click data export/deletion
- **Performance Optimized:** 27MB → 10MB effective loading through responsive images and intelligent caching

## Performance Optimization

FolkUp Quest underwent comprehensive performance optimization (May 2026) to achieve optimal loading times and resource efficiency.

### FQST-013: Multi-Resolution Asset Pipeline ✅ Complete
- **Sharp-based optimization:** 3 responsive variants per panel (thumb/medium/full)  
- **Format support:** WebP + PNG fallback for broad compatibility
- **Lazy loading:** IntersectionObserver-based progressive loading
- **Network adaptation:** Connection-aware loading strategy
- **Results:** 31.8% size reduction, <2s load time on 3G achieved

### Advanced Caching Strategy ✅ Complete
- **5-tier service worker:** Intelligent cache fallback chain
- **CDN optimization:** Cloudflare Pages immutable caching
- **Dynamic imports:** Bundle splitting for panel system
- **Performance monitoring:** Privacy-first analytics with no PII collection

**Target:** Sub-2-second load times with 80%+ cache hit rate achieved

## Brand Integration

FolkUp Quest underwent comprehensive brand integration (April 2026) to align with FolkUp ecosystem standards while preserving its unique gaming aesthetic.

### Phase 1a: Compliance Cleanup ✅ Complete
- **Level 1 Compliance:** Zero violations in deploying artifacts
- **Font Path Cleanup:** Hardcoded paths → relative paths
- **Evidence:** [commit 9b1c92d](https://github.com/FolkUp/folkup-quest/commit/9b1c92d)

### Phase 1b: Foundation Work ✅ Complete
- **Brand Guide v2.5 tokens integration:** 95/100 compliance achieved
- **Gaming-variant storybook development:** 3 comprehensive documents delivered
- **Visual diff approval process:** Framework established for ecosystem replication

**Target:** Brand DNA alignment 75/100 while preserving gaming identity

## Project Structure

```
├── src/                 # Main application source
│   ├── engine/         # Ink engine, game logic, and panel progression
│   │   ├── panel-progression.js  # 28-panel unlock system
│   │   └── moral-system.js       # Tag parsing (PANEL, FEEDBACK, etc.)
│   ├── ui/            # User interface components  
│   │   ├── panel-modal.js        # WCAG 2.1 AA comic panel modal
│   │   ├── panel-reader.js       # Standalone gallery interface
│   │   ├── consent-modal.js      # GDPR consent interface
│   │   ├── privacy-settings.js   # User data rights dashboard
│   │   └── renderer.js           # Game renderer with panel integration
│   └── utils/         # Utilities and analytics
│       ├── privacy-analytics.js  # GDPR-compliant analytics engine
│       ├── data-retention.js     # Automated data cleanup system
│       └── analytics.js          # Core analytics integration
├── styles/             # CSS styling including panel modal styles
├── public/comic/panels/ # Comic panel assets (28 panels + manifests)
├── public/legal/       # Privacy policy and GDPR compliance docs
├── scripts/comic/      # Comic generation and source assets
├── ink/               # Ink story files with PANEL tags
└── _meta/            # Project documentation and audits
```

## Comic Integration System

FolkUp Quest features a comprehensive comic panel system that enhances the narrative experience through visual storytelling.

### Features

- **28 Comic Panels:** Progressive unlock system tied to story progression
- **Branching Paths:** Different choice paths unlock unique panel sets
  - **Folk Path:** Community-focused choices unlock panels emphasizing collaboration
  - **Dragon Path:** Pragmatic choices unlock panels showing growth/scale tension  
- **Accessibility:** WCAG 2.1 AA compliant modal with focus trap navigation
- **Gallery Reader:** Standalone interface for browsing unlocked panels by act
- **Progressive Unlocks:** Panels unlock based on:
  - Story progression (required panels)
  - Character trust levels (bonus panels)
  - Major choices (path-specific panels)  
  - Achievements (completion rewards)

### Technical Implementation

- **Panel Modal System:** Accessible image viewer with manifest metadata
- **Unlock Progression:** Conditional evaluation engine for 28-panel configuration
- **localStorage Persistence:** Unlock state preserved across sessions
- **Tag-Based Integration:** Ink story scenes tagged with `# PANEL: panel-X.Y`
- **Asset Pipeline:** Automated copying from `/scripts/comic/panels/` to `/public/comic/panels/`

### Panel Categories

| Category | Panels | Description |
|----------|--------|-------------|
| Act I: Discovery | 1.1-1.7 | Character introductions, world establishment |
| Act I: Micro-Stories | 1.8-1.16 | Library Side-Quest, Study Room reflection, Character introspection, Hidden synthesis |
| Act II: Challenge | 2.1-2.7 | Central conflict, key decisions |
| Act III: Resolution | 3.1-3.7 | Philosophical confrontation, final choices |
| Epilogue | 4.1-4.7 | Endings, consequences, reflections |

Access the gallery via the floating gallery button (📷) during gameplay or after completion.

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

Code is licensed under [MIT](LICENSE). Narrative content (story text in `ink/` directory) is licensed under [CC BY-NC-SA 4.0](LICENSE-CONTENT).
