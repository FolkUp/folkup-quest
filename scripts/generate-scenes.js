/**
 * Generate scene images via FLUX.1 Schnell on Replicate
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-scenes.js [batch]
 * batch: 1 | 2 | 3 | all (default: all)
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');
const VARIANTS_DIR = join(__dirname, '..', '_variants');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  process.exit(1);
}

const BASE_PROMPT = `Dark atmospheric digital art, psychedelic undertones, subtle fractal patterns in shadows, goa trance aesthetic, muted cinematic palette with bordeaux and sage accents, film grain texture, wide composition, no text, no people faces.`;

const SCENES = {
  // Batch 1: Epigraph + Act 1
  batch1: [
    { id: 'epigraph', file: 'epigraph-bg.jpg', suffix: 'Wrought iron lantern with root-shaped base igniting in complete darkness, warm amber glow, fractal sparks' },
    { id: 'shore', file: 'scene1-shore.jpg', suffix: 'Weathered wooden bench on Setubal coast at golden hour, Atlantic ocean, seagulls silhouettes, amber sunset bleeding into bordeaux sky' },
    { id: 'flashback_stick', file: 'scene1_5-flashback.jpg', suffix: 'Cramped coworking space above fish restaurant, MacBook with stickers, amber light through blinds, smell of sardines implied, warm chaos' },
    { id: 'library', file: 'scene2-library.jpg', suffix: 'Empty dark library, tall oak shelves reaching ceiling, single brass lamp with root base casting warm pool of light, three mysterious doors, dust motes' },
    { id: 'barnes_alice', file: 'scene3-barnes.jpg', suffix: 'Pond in Barnes park SW13 London at rainy dusk, Thames loop visible, park bench by water, English drizzle, sage green foliage, melancholic twilight' },
    { id: 'cogumelos_gonzo', file: 'scene4-mushrooms.jpg', suffix: 'Portuguese cork oak forest at night, stripped red bark trees, three glowing blue screens arranged on tree stump like altar, red earth, bioluminescent spores' },
  ],
  // Batch 2: Act 1-2 transition
  batch2: [
    { id: 'retrotech_dan', file: 'scene5-dan.jpg', suffix: 'Video call screen showing Chicago kitchen, vinyl records on wall, acoustic guitar, warm blue light, coffee mug, blues club intimate atmosphere' },
    { id: 'flashback_young_breus', file: 'scene6-flashback-breus.jpg', suffix: 'Conference room split: left warm (plastic chairs, 20 people, passion) vs right cold (leather chairs, 1000 people, corporate). Time passage diptych' },
    { id: 'breus_proposal', file: 'scene7-breus-office.jpg', suffix: 'Glass corporate office at night, expensive paper contract on dark oak table, cold blue-white light, menacing corporate atmosphere, city lights below' },
    { id: 'silence_after', file: 'scene8-silence.jpg', suffix: 'Dark library at night, single lamp flickering, four silhouettes reflected in window, wet palm print glistening on oak table, Setubal fishermen outside' },
  ],
  // Batch 3: Act 3 + endings
  batch3: [
    { id: 'mirror_zone', file: 'scene9-mirror.jpg', suffix: 'Dark window showing split reflection: library with oak chair on one side, glass office with leather chair on other, fractal crack between realities' },
    { id: 'final_choice', file: 'scene10-dawn.jpg', suffix: 'Aggressive pink dawn through library window, two letters on table (expensive envelope vs torn notebook page), fishermen pulling nets, decisive light' },
    { id: 'ending_lantern', file: 'scene11a-lantern.jpg', suffix: 'Library with half-filled shelves, brass lamp burning BRIGHT warm golden light, living folders, acoustic warmth, organic growth, hope' },
    { id: 'ending_bridge', file: 'scene11b-bridge.jpg', suffix: 'Bridge at dusk with people crossing, neutral tones, small gray logo at edge, steady lamp light, functional compromise, Tuesday evening mood' },
    { id: 'ending_chair', file: 'scene11c-chair.jpg', suffix: 'Glass corner office, leather chair, bay view at night, EXTINGUISHED lamp on shelf, closed notebook, upward line on graph, cold empty successful' },
    { id: 'credits', file: 'scene12-credits.jpg', suffix: 'Night sky with stars, subtle bordeaux and amber aurora fractals, cosmic calm, sacred geometry whispers, infinite depth' },
  ],
};

const VARIANTS_PER_SCENE = 3;

async function generateImage(prompt, seed, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const resp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          seed,
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_format: 'jpg',
          output_quality: 85,
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
      throw new Error(`Replicate API error ${resp.status}: ${err}`);
    }

    const prediction = await resp.json();

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 1000));
      const poll = await fetch(result.urls.get, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      });
      result = await poll.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error}`);
    }

    return result.output[0]; // URL of generated image
  }
  throw new Error(`Rate limited after ${retries} retries`);
}

async function downloadImage(url, path) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  await writeFile(path, buffer);
  return buffer.length;
}

async function generateScene(scene, variantNum) {
  const prompt = `${BASE_PROMPT} ${scene.suffix}`;
  const seed = scene.id.length * 1000 + variantNum * 137; // Deterministic but varied

  console.log(`  [${scene.id}] variant ${variantNum} — generating...`);
  const url = await generateImage(prompt, seed);

  const variantFile = `${scene.file.replace('.jpg', '')}_v${variantNum}.jpg`;
  const variantPath = join(VARIANTS_DIR, variantFile);
  const size = await downloadImage(url, variantPath);
  console.log(`  [${scene.id}] variant ${variantNum} — ${(size / 1024).toFixed(0)}KB saved to _variants/`);

  return { scene: scene.id, variant: variantNum, file: variantFile, size, url };
}

async function runBatch(batchName, scenes) {
  console.log(`\n=== ${batchName} (${scenes.length} scenes × ${VARIANTS_PER_SCENE} variants) ===\n`);

  const results = [];
  for (const scene of scenes) {
    for (let v = 1; v <= VARIANTS_PER_SCENE; v++) {
      try {
        const r = await generateScene(scene, v);
        results.push(r);
      } catch (err) {
        console.error(`  [${scene.id}] variant ${v} FAILED: ${err.message}`);
        results.push({ scene: scene.id, variant: v, error: err.message });
      }
      // Rate limit: 6 req/min → wait 11s between requests
      await new Promise((r) => setTimeout(r, 11000));
    }
  }

  return results;
}

async function main() {
  const batchArg = process.argv[2] || 'all';

  // Ensure directories exist
  if (!existsSync(VARIANTS_DIR)) await mkdir(VARIANTS_DIR, { recursive: true });
  if (!existsSync(IMAGES_DIR)) await mkdir(IMAGES_DIR, { recursive: true });

  let allResults = [];

  if (batchArg === '1' || batchArg === 'all') {
    allResults.push(...await runBatch('Batch 1: Epigraph + Act 1', SCENES.batch1));
  }
  if (batchArg === '2' || batchArg === 'all') {
    allResults.push(...await runBatch('Batch 2: Act 1-2 transition', SCENES.batch2));
  }
  if (batchArg === '3' || batchArg === 'all') {
    allResults.push(...await runBatch('Batch 3: Act 3 + endings', SCENES.batch3));
  }

  // Summary
  const ok = allResults.filter((r) => !r.error).length;
  const fail = allResults.filter((r) => r.error).length;
  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`Variants saved to: ${VARIANTS_DIR}`);
  console.log(`\nNext: review variants, pick best, copy to public/images/`);

  // Save manifest
  await writeFile(
    join(VARIANTS_DIR, 'manifest.json'),
    JSON.stringify(allResults, null, 2)
  );
}

main().catch(console.error);
