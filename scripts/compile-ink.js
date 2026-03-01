/**
 * Compile .ink files to story.json using inkjs Compiler
 * Pure Node.js — no external inklecate binary needed
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INK_DIR = resolve(ROOT, 'ink');
const OUT_DIR = resolve(ROOT, 'public');

async function compile() {
  // Dynamic import — inkjs/full includes the Compiler
  const inkModule = await import('inkjs/full');
  const Compiler = inkModule.Compiler;

  const mainInk = resolve(INK_DIR, 'main.ink');
  if (!existsSync(mainInk)) {
    console.error('ERROR: ink/main.ink not found');
    process.exit(1);
  }

  const mainSource = readFileSync(mainInk, 'utf-8');

  // Provide file handler for INCLUDEs and error handler
  const compilerOptions = {
    sourceFilename: 'main.ink',
    fileHandler: {
      ResolveInkFilename(filename) {
        return filename;
      },
      LoadInkFileContents(filename) {
        const filePath = resolve(INK_DIR, filename);
        if (!existsSync(filePath)) {
          console.error(`ERROR: Cannot find included file: ${filename}`);
          return null;
        }
        return readFileSync(filePath, 'utf-8');
      },
    },
    errorHandler: (message, type) => {
      if (type === 0) { // ErrorType.Author
        console.error(`INK ERROR: ${message}`);
      } else if (type === 1) { // ErrorType.Warning
        console.warn(`INK WARNING: ${message}`);
      } else {
        console.error(`INK: ${message}`);
      }
    },
  };
  const compiler = new Compiler(mainSource, compilerOptions);

  const story = compiler.Compile();

  if (!story) {
    console.error('ERROR: Compilation failed');
    process.exit(1);
  }

  const json = story.ToJson();

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  writeFileSync(resolve(OUT_DIR, 'story.json'), json, 'utf-8');
  console.log('OK: ink/main.ink → public/story.json');
}

compile().catch((err) => {
  console.error('Compilation error:', err.message);
  process.exit(1);
});
