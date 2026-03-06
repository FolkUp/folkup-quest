/**
 * Generate PNG icon set from approved SVG logo variants via ImageMagick
 * Usage: node scripts/generate-icons.js
 *
 * Input: _variants/logo/logo-c1r_v4*.svg (4 color variants)
 * Output: _variants/logo/icons/*.png + favicon.ico
 *
 * Requires: ImageMagick 7+ (magick.exe)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, '..', '_variants', 'logo');
const ICONS_DIR = join(LOGO_DIR, 'icons');
const MAGICK = 'magick';

// SVG source variants
const VARIANTS = {
  dark: join(LOGO_DIR, 'logo-c1r_v4-dark.svg'),      // dark tree → light backgrounds
  light: join(LOGO_DIR, 'logo-c1r_v4-light.svg'),     // cream tree → dark backgrounds
  monoBlack: join(LOGO_DIR, 'logo-c1r_v4-mono-black.svg'),
  monoWhite: join(LOGO_DIR, 'logo-c1r_v4-mono-white.svg'),
  original: join(LOGO_DIR, 'logo-c1r_v4.svg'),
};

// Brand colors
const BG_DARK = '#1a1714';
const BG_LIGHT = '#f5f0eb';
const BG_AMBER = '#E8AD4A';

// Icon specifications: [filename, size, svgVariant, background]
// background: null = transparent, string = hex color
const ICONS = [
  // --- Web favicons (transparent, dark variant for light browser chrome) ---
  ['favicon-16x16.png', 16, 'dark', null],
  ['favicon-32x32.png', 32, 'dark', null],

  // --- Apple Touch Icon (dark bg + light logo, iOS clips to rounded rect) ---
  ['apple-touch-icon.png', 180, 'light', BG_DARK],

  // --- Android Chrome / PWA (dark bg + light logo) ---
  ['android-chrome-192x192.png', 192, 'light', BG_DARK],
  ['android-chrome-512x512.png', 512, 'light', BG_DARK],

  // --- PWA maskable (needs safe zone — 40% padding, dark bg) ---
  ['maskable-icon-512.png', 512, 'light', BG_DARK],

  // --- General purpose sizes ---
  ['icon-48.png', 48, 'dark', null],
  ['icon-64.png', 64, 'light', BG_DARK],
  ['icon-128.png', 128, 'light', BG_DARK],
  ['icon-256.png', 256, 'light', BG_DARK],

  // --- Light background versions ---
  ['icon-128-light-bg.png', 128, 'dark', BG_LIGHT],
  ['icon-256-light-bg.png', 256, 'dark', BG_LIGHT],
  ['icon-512-light-bg.png', 512, 'dark', BG_LIGHT],

  // --- Monochrome ---
  ['icon-128-mono-black.png', 128, 'monoBlack', null],
  ['icon-128-mono-white.png', 128, 'monoWhite', BG_DARK],

  // --- Social / OG (square avatar) ---
  ['avatar-400.png', 400, 'light', BG_DARK],
];

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (e) {
    console.error(`  FAILED: ${cmd}`);
    console.error(`  ${e.stderr?.toString().trim()}`);
    return false;
  }
}

function generateIcon(filename, size, variantKey, bg) {
  const svg = VARIANTS[variantKey];
  if (!existsSync(svg)) {
    console.error(`  SVG not found: ${svg}`);
    return false;
  }

  const out = join(ICONS_DIR, filename);
  const isMaskable = filename.includes('maskable');

  // For maskable: render logo smaller (60% of canvas) centered on bg
  const logoSize = isMaskable ? Math.round(size * 0.6) : size;
  const padding = isMaskable ? Math.round(size * 0.2) : 0;

  let cmd;
  if (bg) {
    if (isMaskable) {
      // Render logo at smaller size, then composite onto bg canvas
      cmd = `${MAGICK} -background "${bg}" -size ${size}x${size} xc:"${bg}" ( "${svg}" -resize ${logoSize}x${logoSize} ) -gravity center -composite "${out}"`;
    } else {
      // Render with background, logo fills the icon with padding
      const pad = Math.round(size * 0.12);
      const innerSize = size - pad * 2;
      cmd = `${MAGICK} -background "${bg}" -size ${size}x${size} xc:"${bg}" ( "${svg}" -resize ${innerSize}x${innerSize} ) -gravity center -composite "${out}"`;
    }
  } else {
    // Transparent background
    cmd = `${MAGICK} -background none "${svg}" -resize ${size}x${size} "${out}"`;
  }

  return run(cmd);
}

function generateFavicon() {
  // Multi-resolution .ico from 16 + 32 PNGs
  const ico16 = join(ICONS_DIR, 'favicon-16x16.png');
  const ico32 = join(ICONS_DIR, 'favicon-32x32.png');
  const ico = join(ICONS_DIR, 'favicon.ico');

  if (!existsSync(ico16) || !existsSync(ico32)) {
    console.error('  favicon PNGs not found, skipping .ico');
    return false;
  }

  const cmd = `${MAGICK} "${ico16}" "${ico32}" "${ico}"`;
  return run(cmd);
}

async function main() {
  if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });

  // Verify ImageMagick
  try {
    execSync(`${MAGICK} -version`, { stdio: 'pipe' });
  } catch {
    console.error('Error: ImageMagick (magick) not found. Install from imagemagick.org');
    process.exit(1);
  }

  // Verify SVGs exist
  for (const [key, path] of Object.entries(VARIANTS)) {
    if (!existsSync(path)) {
      console.error(`Missing SVG variant: ${key} → ${path}`);
      process.exit(1);
    }
  }

  console.log(`Generating ${ICONS.length} icons + favicon.ico...\n`);

  let ok = 0;
  let fail = 0;

  for (const [filename, size, variant, bg] of ICONS) {
    process.stdout.write(`  ${filename} (${size}px, ${variant}${bg ? ', bg:' + bg : ''})...`);
    if (generateIcon(filename, size, variant, bg)) {
      console.log(' OK');
      ok++;
    } else {
      console.log(' FAIL');
      fail++;
    }
  }

  // Generate favicon.ico
  process.stdout.write('  favicon.ico (16+32 multi-res)...');
  if (generateFavicon()) {
    console.log(' OK');
    ok++;
  } else {
    console.log(' FAIL');
    fail++;
  }

  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`Icons saved to: ${ICONS_DIR}`);
}

main().catch(console.error);
