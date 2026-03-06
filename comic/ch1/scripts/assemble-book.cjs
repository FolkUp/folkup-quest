/**
 * Book Assembly — GE-068 Phase 3.5
 *
 * Renders title page, credits page, back cover from HTML templates,
 * then assembles all 28 pages into PDF and CBZ.
 *
 * Usage:
 *   node scripts/assemble-book.cjs [--render-templates] [--pdf] [--cbz] [--all]
 *
 * Options:
 *   --render-templates   Render HTML templates to PNG (title, credits, back)
 *   --pdf                Assemble PDF from all pages
 *   --cbz                Assemble CBZ (ZIP with ComicInfo.xml)
 *   --all                Do everything
 *   --cover N            Use cover variant N (default: 1)
 *
 * Prerequisites:
 *   - npm install puppeteer-core
 *   - Chrome installed at standard path
 *   - Cover variant PNG in ch1-panels/cover/
 *   - 24 inner pages in pages/ru/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'pages', 'ru');
const TEMPLATES_DIR = path.join(ROOT, 'pages', 'templates');
const OUTPUT_DIR = path.join(ROOT, 'output');
const COVER_DIR = path.join(ROOT, 'ch1-panels', 'cover');

const WIDTH = 1600;
const HEIGHT = 2400;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// --- Parse args ---
const args = process.argv.slice(2);
const doAll = args.includes('--all');
const doTemplates = doAll || args.includes('--render-templates');
const doPdf = doAll || args.includes('--pdf');
const doCbz = doAll || args.includes('--cbz');
const coverIdx = args.indexOf('--cover');
const coverVariant = coverIdx >= 0 ? parseInt(args[coverIdx + 1]) : 1;

if (!doTemplates && !doPdf && !doCbz) {
  console.log('Usage: node scripts/assemble-book.cjs [--render-templates] [--pdf] [--cbz] [--all] [--cover N]');
  process.exit(0);
}

async function renderTemplate(browser, templateFile, outputFile) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const htmlPath = path.join(TEMPLATES_DIR, templateFile);
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  await page.screenshot({
    path: outputFile,
    type: 'png',
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });
  await page.close();
  console.log(`  Rendered: ${path.basename(outputFile)}`);
}

async function renderTemplates() {
  console.log('=== Rendering Templates ===');
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-lcd-text',
      '--font-render-hinting=none',
      '--allow-file-access-from-files',
    ],
  });

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await renderTemplate(browser, 'title-page.html', path.join(OUTPUT_DIR, 'page-title.png'));
  await renderTemplate(browser, 'credits-page.html', path.join(OUTPUT_DIR, 'page-credits.png'));
  await renderTemplate(browser, 'back-cover.html', path.join(OUTPUT_DIR, 'page-back.png'));

  await browser.close();
  console.log('Templates done.\n');
}

function getPageList() {
  // 28 pages total:
  // 1. Cover (from cover variant)
  // 2. Title page
  // 3-26. Inner pages (page-01..page-24)
  // 27. Credits
  // 28. Back cover

  const pages = [];

  // 1. Cover (use cover-final.png if exists, else variant)
  const finalCover = path.join(COVER_DIR, 'cover-final.png');
  const coverFile = fs.existsSync(finalCover) ? finalCover : path.join(COVER_DIR, `variant-${coverVariant}.png`);
  if (!fs.existsSync(coverFile)) {
    console.error(`Cover not found: ${coverFile}`);
    process.exit(1);
  }
  pages.push({ num: 1, label: 'Cover', file: coverFile });

  // 2. Title
  pages.push({ num: 2, label: 'Title', file: path.join(OUTPUT_DIR, 'page-title.png') });

  // 3-26. Inner pages
  for (let i = 1; i <= 24; i++) {
    const pageFile = path.join(PAGES_DIR, `page-${String(i).padStart(2, '0')}.png`);
    pages.push({ num: i + 2, label: `Page ${i}`, file: pageFile });
  }

  // 27. Credits
  pages.push({ num: 27, label: 'Credits', file: path.join(OUTPUT_DIR, 'page-credits.png') });

  // 28. Back cover
  pages.push({ num: 28, label: 'Back', file: path.join(OUTPUT_DIR, 'page-back.png') });

  return pages;
}

async function assemblePdf(pages) {
  console.log('=== Assembling PDF ===');
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-lcd-text', '--font-render-hinting=none'],
  });

  // Create a single HTML with all pages as full-page images
  const imgTags = pages.map(p => {
    const absPath = p.file.replace(/\\/g, '/');
    return `<div class="page"><img src="file:///${absPath}" /></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; }
  @page { size: ${WIDTH}px ${HEIGHT}px; margin: 0; }
  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .page img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
</style>
</head>
<body>${imgTags}</body>
</html>`;

  const htmlPath = path.join(OUTPUT_DIR, '_pdf-assembly.html');
  fs.writeFileSync(htmlPath, html);

  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  const pdfPath = path.join(OUTPUT_DIR, 'folkup-quest-ch1-spusk-ru.pdf');
  await page.pdf({
    path: pdfPath,
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  fs.unlinkSync(htmlPath); // cleanup temp HTML

  const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`  PDF: ${pdfPath} (${sizeMB} MB)`);
  console.log(`  Pages: ${pages.length}\n`);
}

function assembleCbz(pages) {
  console.log('=== Assembling CBZ ===');

  const cbzDir = path.join(OUTPUT_DIR, '_cbz_staging');
  if (fs.existsSync(cbzDir)) fs.rmSync(cbzDir, { recursive: true });
  fs.mkdirSync(cbzDir, { recursive: true });

  // Copy pages with sequential naming
  pages.forEach(p => {
    const destName = `${String(p.num).padStart(2, '0')}-${p.label.toLowerCase().replace(/\s+/g, '-')}.png`;
    fs.copyFileSync(p.file, path.join(cbzDir, destName));
  });

  // Copy ComicInfo.xml
  const comicInfoSrc = path.join(ROOT, 'ComicInfo.xml');
  if (fs.existsSync(comicInfoSrc)) {
    fs.copyFileSync(comicInfoSrc, path.join(cbzDir, 'ComicInfo.xml'));
  }

  // Create ZIP using PowerShell
  const cbzPath = path.join(OUTPUT_DIR, 'folkup-quest-ch1-spusk-ru.cbz');
  if (fs.existsSync(cbzPath)) fs.unlinkSync(cbzPath);

  const zipCmd = `powershell.exe -NoProfile -Command "Compress-Archive -Path '${cbzDir}\\*' -DestinationPath '${cbzPath.replace('.cbz', '.zip')}'"`;
  execSync(zipCmd, { stdio: 'pipe' });

  // Rename .zip to .cbz
  const zipPath = cbzPath.replace('.cbz', '.zip');
  if (fs.existsSync(zipPath)) {
    fs.renameSync(zipPath, cbzPath);
  }

  // Cleanup staging
  fs.rmSync(cbzDir, { recursive: true });

  const sizeMB = (fs.statSync(cbzPath).size / 1024 / 1024).toFixed(1);
  console.log(`  CBZ: ${cbzPath} (${sizeMB} MB)`);
  console.log(`  Files: ${pages.length} pages + ComicInfo.xml\n`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (doTemplates) {
    await renderTemplates();
  }

  const pages = getPageList();

  // Verify all files exist
  let missing = 0;
  for (const p of pages) {
    if (!fs.existsSync(p.file)) {
      console.error(`  MISSING: ${p.label} -> ${p.file}`);
      missing++;
    }
  }
  if (missing > 0) {
    console.error(`\n${missing} files missing. Run --render-templates first or check cover variant.`);
    if (doPdf || doCbz) process.exit(1);
  }

  if (doPdf) await assemblePdf(pages);
  if (doCbz) assembleCbz(pages);

  console.log('=== Assembly Complete ===');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
