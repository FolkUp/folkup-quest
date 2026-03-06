import TextToSVG from 'text-to-svg';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, '..', '_variants', 'fonts', 'CormorantGaramond-SemiBold.ttf');

// Load font
const textToSVG = TextToSVG.loadSync(fontPath);

// Generate SVG path data for "FolkUp"
const text = 'FolkUp';
const options = {
  fontSize: 72,
  anchor: 'top',
  attributes: {
    fill: 'currentColor'
  }
};

// Get the path data
const svgPath = textToSVG.getD(text, options);
const metrics = textToSVG.getMetrics(text, options);

// Calculate tight viewBox
const viewBoxWidth = Math.ceil(metrics.width);
const viewBoxHeight = Math.ceil(metrics.height);

// Create SVG for dark background (amber color)
const svgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="${viewBoxWidth}" height="${viewBoxHeight}">
  <path d="${svgPath}" fill="#E8AD4A"/>
</svg>`;

// Create SVG for light background (dark color)
const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="${viewBoxWidth}" height="${viewBoxHeight}">
  <path d="${svgPath}" fill="#1a1714"/>
</svg>`;

// Save files
const outputDir = join(__dirname, '..', '_variants');
writeFileSync(join(outputDir, 'wordmark-dark.svg'), svgDark);
writeFileSync(join(outputDir, 'wordmark-light.svg'), svgLight);

console.log('✓ Wordmark SVG files generated:');
console.log(`  - wordmark-dark.svg (amber #E8AD4A, ${viewBoxWidth}×${viewBoxHeight})`);
console.log(`  - wordmark-light.svg (dark #1a1714, ${viewBoxWidth}×${viewBoxHeight})`);
console.log(`  - ViewBox: 0 0 ${viewBoxWidth} ${viewBoxHeight}`);
