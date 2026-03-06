/**
 * Cover Generator — GE-068 Phase 3.5
 *
 * Generates cover variants for Chapter 1 "Спуск / Descent" using Flux 2 Pro.
 * Concept: Arni from behind, standing before library door, amber light from inside.
 *
 * Usage:
 *   set REPLICATE_API_TOKEN=xxx
 *   node scripts/generate-cover.cjs [--variants N] [--dry-run]
 *
 * Output: ch1-panels/cover/variant-{N}.png
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'ch1-panels', 'cover');

const TOKEN = process.env.REPLICATE_API_TOKEN;
const DELAY_MS = 12000;
const MODEL = 'black-forest-labs/flux-2-pro';
const COST_PER_GEN = 0.045;

// --- Cover prompt ---
const STYLE = 'pure black and white, no gray tones, no halftones, no gradients, spotted blacks, toothbrush splatter texture, high contrast ink illustration, negative space, bold contour lines, dramatic chiaroscuro lighting, deep shadows with sharp edges';

const SUBJECT = 'thin man mid-30s seen from behind, long hair pulled back in ponytail, beard stubble visible on jaw edge, dark jacket with raised collar, hunched shoulders, hands at sides, standing motionless before a tall wooden door';

const ENVIRONMENT = 'dark corridor, old library interior glimpsed through partly open door, tall bookshelves visible inside, warm amber glow #E8AD4A spilling out through door crack and around doorframe onto floor and walls, dust particles caught in amber light beam, wooden floorboards';

const COMPOSITION = 'full body shot from behind, vertical portrait composition, character centered in lower two-thirds, door in upper half, dramatic perspective lines of corridor walls converging toward door, amber light as the only non-black-and-white element in the image, single spot color amber #E8AD4A';

const PROMPT = `${STYLE}, ${SUBJECT}, ${ENVIRONMENT}, ${COMPOSITION}, cinematic noir atmosphere, graphic novel cover art, no text, no title, no watermark, no border`;

// --- API helpers ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.replicate.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : require('http');
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function generate(seed, variantNum) {
  const input = {
    prompt: PROMPT,
    width: 1024,
    height: 1536,
    seed,
    guidance: 3.5,
    steps: 28,
    output_format: 'png',
  };

  console.log(`  [${variantNum}] Generating (seed ${seed})...`);

  const res = await apiRequest('POST', '/v1/models/' + MODEL + '/predictions', { input });

  if (res.status === 201 || res.status === 202) {
    // Async — need to poll
    let prediction = res.body;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await sleep(3000);
      const poll = await apiRequest('GET', `/v1/predictions/${prediction.id}`, null);
      prediction = poll.body;
    }
    if (prediction.status === 'failed') {
      console.error(`  [${variantNum}] FAILED: ${prediction.error}`);
      return null;
    }
    return prediction.output;
  }

  if (res.status === 200 && res.body.output) {
    return res.body.output;
  }

  console.error(`  [${variantNum}] API error ${res.status}:`, JSON.stringify(res.body).slice(0, 200));
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const variantsIdx = args.indexOf('--variants');
  const numVariants = variantsIdx >= 0 ? parseInt(args[variantsIdx + 1]) : 10;

  if (!TOKEN && !dryRun) {
    console.error('ERROR: Set REPLICATE_API_TOKEN environment variable');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('=== Cover Generation ===');
  console.log(`Variants: ${numVariants}`);
  console.log(`Estimated cost: $${(numVariants * COST_PER_GEN).toFixed(2)}`);
  console.log(`Aspect ratio: 2:3 (1024x1536) — will upscale to 1600x2400`);
  console.log('');
  console.log('Prompt:');
  console.log(PROMPT);
  console.log('');

  if (dryRun) {
    console.log('[DRY RUN] No API calls made.');
    return;
  }

  const seeds = [];
  for (let i = 0; i < numVariants; i++) {
    seeds.push(Math.floor(Math.random() * 999999) + 1);
  }

  let totalCost = 0;
  const results = [];

  for (let i = 0; i < numVariants; i++) {
    const outputUrl = await generate(seeds[i], i + 1);

    if (outputUrl) {
      const imgUrl = Array.isArray(outputUrl) ? outputUrl[0] : outputUrl;
      const dest = path.join(OUT_DIR, `variant-${i + 1}.png`);
      await downloadFile(imgUrl, dest);
      console.log(`  [${i + 1}] Saved: ${dest}`);
      totalCost += COST_PER_GEN;
      results.push({ variant: i + 1, seed: seeds[i], file: dest });
    }

    if (i < numVariants - 1) {
      console.log(`  Waiting ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
    }
  }

  console.log('');
  console.log(`=== Done: ${results.length}/${numVariants} variants ===`);
  console.log(`Total cost: ~$${totalCost.toFixed(2)}`);

  // Save results metadata
  const metaPath = path.join(OUT_DIR, 'cover-meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    prompt: PROMPT,
    model: MODEL,
    results,
    totalCost,
    timestamp: new Date().toISOString(),
  }, null, 2));
  console.log(`Metadata: ${metaPath}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
