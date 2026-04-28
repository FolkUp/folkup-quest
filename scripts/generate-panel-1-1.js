/**
 * FolkUp Quest Phase 2 — Panel 1.1 "Shore Splash" Generation
 * Pilot Batch Validation: Single panel generation for workflow testing
 *
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-panel-1-1.js
 *
 * Model: Flux 2 Pro (black-forest-labs/flux-2-pro)
 * Cost: ~$3.50 (Flux 2 Pro rate)
 * Output: comic/panels/panel-1-1-shore-splash.png
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'comic', 'panels');
const PANEL_FILE = join(OUTPUT_DIR, 'panel-1-1-shore-splash.png');
const MANIFEST_FILE = join(OUTPUT_DIR, 'panel-1-1-manifest.json');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  console.error('Set your Replicate API token: export REPLICATE_API_TOKEN=r8_xxx');
  process.exit(1);
}

const MODEL_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions';

// Enhanced Panel 1.1 prompt with character consistency emphasis
const PANEL_1_1_PROMPT = `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Setúbal Portugal waterfront establishing shot. Wide angle 30-degree bird's eye view.

MAIN SUBJECT: Thin wiry man in his late 30s with ponytail and short beard, wearing black leather jacket with raised collar, slouching posture. White silhouette figure sitting on black bench. Man appears small in composition, positioned lower third.

CHARACTER CONSISTENCY (ENHANCED):
- Build: Thin/wiry specifically (NOT muscular or heavy)
- Ponytail: visible and consistent positioning
- Jacket: black leather with raised collar (signature element)
- Posture: characteristic slouching/defeated baseline
- Silhouette: white figure against dark backgrounds (Sin City standard)

BACKGROUND ELEMENTS:
- Atlantic Ocean horizon line at 50% height of image
- 7 seagulls scattered as white dots/shapes of varying sizes across sky
- 3-4 fisherman silhouettes on distant horizon with fishing nets (horizontal arc shapes)
- Waterfront promenade with black geometric shapes
- Bench with visible paint layers (3 white stripes/chipped paint detail)

STYLE DETAILS (SIN CITY ANCHOR):
- Spotted blacks technique for large areas
- White silhouettes on black backgrounds
- Negative space defines forms
- High contrast, no halftones
- Clean ink wash aesthetic
- Minimal detail, maximum impact through silhouette

MOOD: Contemplative, noir, establishing loneliness. Silent scene with strong compositional geometry.

TECHNICAL REQUIREMENTS:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Comic book panel format
- Frank Miller style composition
- Aspect ratio: 2:3 portrait`;

async function createFlux2ProPrediction(prompt, aspectRatio) {
  console.log('Creating Flux 2 Pro prediction...');

  const resp = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: 'png',
        output_quality: 100,
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety testing
      },
    }),
  });

  if (resp.status === 429) {
    const body = await resp.json().catch(() => ({}));
    const wait = Math.max(body.retry_after || 60, 60) + 5;
    console.log(`Rate limited! Waiting ${wait}s before retry...`);
    await new Promise(r => setTimeout(r, wait * 1000));

    // Retry once
    const retryResp = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { prompt, aspect_ratio: aspectRatio, output_format: 'png', output_quality: 100 },
      }),
    });

    if (!retryResp.ok) {
      const err = await retryResp.text();
      throw new Error(`Replicate API error after retry ${retryResp.status}: ${err}`);
    }

    return await retryResp.json();
  }

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Replicate API error ${resp.status}: ${err}`);
  }

  return await resp.json();
}

async function pollPrediction(prediction) {
  let result = prediction;
  console.log(`[${result.id}] Polling for completion...`);

  while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled') {
    await new Promise(r => setTimeout(r, 3000)); // 3s polling interval

    const poll = await fetch(result.urls.get, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    result = await poll.json();

    if (result.status === 'processing') {
      const elapsed = Math.round((Date.now() - new Date(result.created_at)) / 1000);
      console.log(`[${result.id}] Processing... (${elapsed}s elapsed)`);
    }
  }

  if (result.status === 'failed') {
    throw new Error(`Generation failed: ${result.error}`);
  }
  if (result.status === 'canceled') {
    throw new Error('Generation was canceled');
  }

  return result;
}

async function downloadAndSavePanel(url, timestamp) {
  console.log('Downloading image...');

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);

  const buffer = Buffer.from(await resp.arrayBuffer());

  await writeFile(PANEL_FILE, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

  console.log(`SUCCESS: ${sizeMB}MB saved → ${PANEL_FILE}`);

  return {
    filename: 'panel-1-1-shore-splash.png',
    filepath: PANEL_FILE,
    size: buffer.length,
    sizeMB: parseFloat(sizeMB),
    url,
    timestamp,
  };
}

async function main() {
  const timestamp = new Date().toISOString();

  console.log('=== FolkUp Quest Phase 2 — Panel 1.1 Generation ===');
  console.log(`Model: Flux 2 Pro (black-forest-labs/flux-2-pro)`);
  console.log(`Panel: 1.1 "Shore Splash" (Setúbal waterfront establishing shot)`);
  console.log(`Aspect Ratio: 2:3 (portrait)`);
  console.log(`Estimated Cost: $3.50`);
  console.log(`Time: ${timestamp}`);
  console.log('');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  try {
    // Generate panel
    const prediction = await createFlux2ProPrediction(PANEL_1_1_PROMPT, '2:3');
    const result = await pollPrediction(prediction);
    const downloadResult = await downloadAndSavePanel(result.output, timestamp);

    // Create generation manifest
    const manifest = {
      panel: '1.1',
      name: 'shore-splash',
      description: 'Shore Splash — Setúbal waterfront establishing shot',
      phase: '2-pilot-batch',
      model: 'black-forest-labs/flux-2-pro',
      timestamp,
      prediction_id: result.id,
      aspect_ratio: '2:3',
      estimated_cost: 3.50, // Flux 2 Pro rate
      generation: downloadResult,
      prompt: PANEL_1_1_PROMPT,
      status: 'completed',
    };

    await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

    console.log('');
    console.log('=== GENERATION COMPLETE ===');
    console.log(`✅ Panel 1.1 generated successfully`);
    console.log(`📁 Output: ${PANEL_FILE}`);
    console.log(`📋 Manifest: ${MANIFEST_FILE}`);
    console.log(`💰 Estimated cost: $3.50`);
    console.log('');
    console.log('Next Steps:');
    console.log('1. Review panel quality vs Phase 0.5 benchmark');
    console.log('2. Score using 5-dimension rubric (≥7.0/10 target)');
    console.log('3. Execute 3-Expert Review Cycle');
    console.log('4. Document results in pilot batch execution log');
    console.log('5. Proceed to Panel 2.3 if approved');

  } catch (error) {
    console.error('GENERATION FAILED:', error.message);

    // Save error manifest
    const errorManifest = {
      panel: '1.1',
      name: 'shore-splash',
      phase: '2-pilot-batch',
      timestamp,
      status: 'failed',
      error: error.message,
      estimated_cost: 0,
    };

    await writeFile(MANIFEST_FILE, JSON.stringify(errorManifest, null, 2));

    process.exit(1);
  }
}

main().catch(console.error);