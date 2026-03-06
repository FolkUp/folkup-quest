/**
 * Comic Image Optimization Pipeline
 *
 * Converts PNG comic pages to WebP in 3 sizes:
 * - full: 1600px wide (desktop)
 * - medium: 800px wide (tablet/mobile)
 * - thumb: 200px wide (progress strip)
 *
 * Usage: node comic-reader/scripts/optimize-images.cjs
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const COMIC_ROOT = path.resolve(__dirname, '../../..', 'comic-prototype');
const OUTPUT_ROOT = path.resolve(__dirname, '..', 'public/pages');

const SIZES = {
  full: 1600,
  medium: 800,
  thumb: 200,
};

const WEBP_QUALITY = {
  full: 82,
  medium: 78,
  thumb: 60,
};

const LANGS = ['ru', 'en'];
const TOTAL_PAGES = 24;

// Special pages from output/ directory (shared between languages)
const SPECIAL_PAGES = ['page-title', 'page-credits', 'page-back'];

async function optimizePage(inputPath, outputDir, name) {
  const results = {};

  for (const [sizeName, width] of Object.entries(SIZES)) {
    const outPath = path.join(outputDir, sizeName, `${name}.webp`);
    const quality = WEBP_QUALITY[sizeName];

    try {
      const info = await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toFile(outPath);

      results[sizeName] = {
        size: info.size,
        width: info.width,
        height: info.height,
      };
    } catch (err) {
      console.error(`  ERROR: ${name} @ ${sizeName}: ${err.message}`);
    }
  }

  return results;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

async function main() {
  console.log('Comic Image Optimization Pipeline');
  console.log('==================================\n');

  let totalOriginal = 0;
  let totalOptimized = 0;
  let fileCount = 0;

  for (const lang of LANGS) {
    console.log(`\n--- ${lang.toUpperCase()} ---\n`);
    const langOutDir = path.join(OUTPUT_ROOT, lang);

    // Ensure output dirs exist
    for (const size of Object.keys(SIZES)) {
      fs.mkdirSync(path.join(langOutDir, size), { recursive: true });
    }

    // Regular pages (page-01 to page-24)
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const pageName = `page-${String(i).padStart(2, '0')}`;
      const inputPath = path.join(COMIC_ROOT, 'pages', lang, `${pageName}.png`);

      if (!fs.existsSync(inputPath)) {
        console.warn(`  SKIP: ${inputPath} not found`);
        continue;
      }

      const originalSize = fs.statSync(inputPath).size;
      totalOriginal += originalSize;

      const results = await optimizePage(inputPath, langOutDir, pageName);
      const fullSize = results.full?.size || 0;
      totalOptimized += fullSize;
      fileCount++;

      console.log(
        `  ${pageName}: ${formatBytes(originalSize)} -> full: ${formatBytes(fullSize)}, ` +
        `med: ${formatBytes(results.medium?.size || 0)}, thumb: ${formatBytes(results.thumb?.size || 0)}`
      );
    }

    // Special pages (shared source, per-lang output)
    for (const name of SPECIAL_PAGES) {
      const inputPath = path.join(COMIC_ROOT, 'output', `${name}.png`);

      if (!fs.existsSync(inputPath)) {
        console.warn(`  SKIP: ${inputPath} not found`);
        continue;
      }

      const originalSize = fs.statSync(inputPath).size;
      totalOriginal += originalSize;

      const results = await optimizePage(inputPath, langOutDir, name);
      const fullSize = results.full?.size || 0;
      totalOptimized += fullSize;
      fileCount++;

      console.log(
        `  ${name}: ${formatBytes(originalSize)} -> full: ${formatBytes(fullSize)}, ` +
        `med: ${formatBytes(results.medium?.size || 0)}, thumb: ${formatBytes(results.thumb?.size || 0)}`
      );
    }
  }

  console.log('\n==================================');
  console.log(`Files processed: ${fileCount}`);
  console.log(`Original total (PNG): ${formatBytes(totalOriginal)}`);
  console.log(`Optimized full (WebP): ${formatBytes(totalOptimized)}`);
  console.log(`Savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
}

main().catch(console.error);
