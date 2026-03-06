/**
 * Generate FolkUp lantern logo via Recraft V4 SVG on Replicate
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-logo.js [direction|all]
 * direction: c | all (default: all)
 *
 * Output: _variants/logo/logo-{id}_v{1-5}.svg
 * Cost: $0.08/image, ~$0.80 total (10 images)
 *
 * Directions v2 (panel + enemy reviewed, 03.03.2026):
 *   c — Tree + Hanging Lantern (10 imgs, $0.80)
 *       c1r: primary mark (tree silhouette + hanging lantern, 5 variants)
 *       c3r: favicon (simplified bold silhouette, 5 variants)
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VARIANTS_DIR = join(__dirname, '..', '_variants', 'logo');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  process.exit(1);
}

const MODEL = 'recraft-ai/recraft-v4-svg';
const API_URL = `https://api.replicate.com/v1/models/${MODEL}/predictions`;
const ASPECT_RATIO = '1:1';
const VARIANTS_PER_PROMPT = 5;
const DELAY_MS = 11000; // Rate limit: 6 req/min

// --- PROMPT DIRECTIONS v2 (panel + enemy reviewed, 03.03.2026) ---
//
// Key correction from Андрей: lantern HANGS from a thick tree branch,
// not a street lantern on a post. Tree dominates, lantern is an element.
//
// Panel consensus: c1 (primary) + c3 (favicon), skip c2 (4.3/10)
// Enemy fixes: removed semantic triggers (gnarled, wrought iron, glass, glow),
// added proportions, "no gradients/shadows/outlines/textures/text"
//
// Two-tier icon system: c1 for 48px+, c3 for favicon/16-32px

const DIRECTIONS = {
  c: {
    name: 'Tree + Hanging Lantern (PRIMARY)',
    prompts: [
      {
        id: 'c1r',
        text: 'Flat vector icon two-tone logo, simplified thick tree silhouette with three main branches spreading upward, iron lantern shape hanging from right branch, solid amber filled shape inside lantern for light, lantern glow occupies at least 15 percent of composition, minimal root shapes at base slightly asymmetric, tree fills 80 percent of frame, breathing room around lantern light, two colors only dark charcoal and warm amber, no gradients no shadows no outlines filled shapes only no textures, no text no letters no wordmark, compact square composition roots spread to frame edges, transparent background',
      },
      {
        id: 'c3r',
        text: 'Bold flat vector silhouette icon, stylized tree shape with character thick trunk with slightly asymmetric branches spreading upward, small lantern shape hanging below branches, single bright amber dot for lantern glow positioned in upper third, simplified contour no more than 6 major shape changes, maximum simplicity thick bold shapes, two colors only dark charcoal and warm amber, no gradients no shadows no outlines filled shapes only, no text no letters no wordmark, compact square composition fills frame edge to edge, transparent background',
      },
    ],
  },
};

// --- API FUNCTIONS ---

async function createPrediction(prompt, seed, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          size: '1024x1024',
        },
      }),
    });

    if (resp.status === 429) {
      const body = await resp.json().catch(() => ({}));
      const wait = (body.retry_after || 12) + 2;
      console.log(`    Rate limited, waiting ${wait}s (attempt ${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API error ${resp.status}: ${err}`);
    }

    const prediction = await resp.json();

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      result = await poll.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error}`);
    }

    // Recraft V4 SVG returns SVG URL (may be string or array)
    const output = Array.isArray(result.output) ? result.output[0] : result.output;
    return output;
  }
  throw new Error(`Rate limited after ${retries} retries`);
}

async function downloadSvg(url, path) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const svg = await resp.text();
  await writeFile(path, svg, 'utf-8');
  return svg.length;
}

async function generateVariant(promptObj, variantNum) {
  console.log(`  [${promptObj.id}] variant ${variantNum} - generating...`);
  const url = await createPrediction(promptObj.text);

  const filename = `logo-${promptObj.id}_v${variantNum}.svg`;
  const filepath = join(VARIANTS_DIR, filename);
  const size = await downloadSvg(url, filepath);
  console.log(`  [${promptObj.id}] variant ${variantNum} - ${(size / 1024).toFixed(1)}KB saved`);

  return { id: promptObj.id, variant: variantNum, file: filename, size, url };
}

async function runDirection(key, direction) {
  const total = direction.prompts.length * VARIANTS_PER_PROMPT;
  console.log(`\n=== Direction ${key.toUpperCase()}: ${direction.name} (${direction.prompts.length} prompts x ${VARIANTS_PER_PROMPT} variants = ${total}) ===\n`);

  const results = [];
  for (const prompt of direction.prompts) {
    for (let v = 1; v <= VARIANTS_PER_PROMPT; v++) {
      try {
        const r = await generateVariant(prompt, v);
        results.push(r);
      } catch (err) {
        console.error(`  [${prompt.id}] variant ${v} FAILED: ${err.message}`);
        results.push({ id: prompt.id, variant: v, error: err.message });
      }
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return results;
}

async function main() {
  const arg = (process.argv[2] || 'all').toLowerCase();

  if (!existsSync(VARIANTS_DIR)) await mkdir(VARIANTS_DIR, { recursive: true });

  const allResults = [];
  const keys = arg === 'all' ? Object.keys(DIRECTIONS) : [arg];

  for (const key of keys) {
    if (!DIRECTIONS[key]) {
      console.error(`Unknown direction: ${key}. Available: ${Object.keys(DIRECTIONS).join(', ')}, all`);
      process.exit(1);
    }
    allResults.push(...(await runDirection(key, DIRECTIONS[key])));
  }

  // Summary
  const ok = allResults.filter((r) => !r.error).length;
  const fail = allResults.filter((r) => r.error).length;
  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`SVGs saved to: ${VARIANTS_DIR}`);
  console.log(`Cost: ~$${(ok * 0.08).toFixed(2)}`);

  // Save manifest
  await writeFile(join(VARIANTS_DIR, 'logo-manifest.json'), JSON.stringify(allResults, null, 2));

  console.log('\nNext: open _variants/logo/pick-logo.html to review variants');
}

main().catch(console.error);
