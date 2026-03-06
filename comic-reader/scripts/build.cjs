/**
 * Comic Reader Build Script
 *
 * Copies src/ files into public/ for CF Pages deployment.
 * Images (from optimize-images.cjs) are already in public/pages/.
 *
 * Usage: node comic-reader/scripts/build.cjs
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const PUBLIC = path.resolve(__dirname, '..', 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy src/ -> public/ (HTML, CSS, JS, legal)
copyRecursive(SRC, PUBLIC);

console.log('Build complete. Files copied from src/ to public/.');

// Count files
let count = 0;
function countFiles(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      countFiles(full);
    } else {
      count++;
    }
  }
}
countFiles(PUBLIC);
console.log(`Total files in public/: ${count}`);
