/**
 * Generate comic panels via FLUX 1.1 Pro on Replicate
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-panels.js [panel]
 * panel: 1.1 | 2.3 | 5.1 | 8.1 | 9.1 | all (default: all)
 *
 * Cost: ~$0.04/image (Flux 1.1 Pro)
 * Rate limit: 6 req/min at <$5 credit → 11s delay between requests
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '..', 'comic-prototype', 'ch1-panels');
const MANIFEST_FILE = join(OUTPUT_DIR, 'manifest.json');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  process.exit(1);
}

const MODEL_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions';

const STYLE_PREFIX = 'Black and white ink illustration, Frank Miller Sin City style, pure black and white, no gray tones, no halftones, no gradients, no soft edges, high contrast, spotted blacks, negative space, ink wash, wordless comic book art.';

const VARIANTS_PER_PANEL = 5;

const PANELS = [
  {
    id: '1.1',
    name: 'shore-splash',
    description: 'Shore splash — Setúbal waterfront',
    aspect_ratio: '2:3',
    prompt: `${STYLE_PREFIX} A man seen from behind sitting on a wooden bench at a coastal waterfront, looking out at the ocean at dusk. He has a ponytail and wears a leather jacket with the collar raised high, shoulders slouched forward, white silhouette against solid black. In the distance on the water, fishermen standing in shallow water pulling fishing nets, rendered as white silhouettes against dark ocean, nets creating a horizontal arc. Scattered seagulls across the dark sky as small white shapes. Atlantic ocean as a bold white horizontal line in the upper third. Massive areas of pure black sky, dramatic negative space. Ink splatter texture on dark areas. Comic book splash page composition. No text, no speech bubbles.`,
    seeds: [1100, 1137, 1150, 1200, 1250],
  },
  {
    id: '2.3',
    name: 'bar-glasses',
    description: 'Bar with 7 glasses — visual rhyme',
    aspect_ratio: '21:9',
    prompt: `${STYLE_PREFIX} Medium side shot at eye level of a bar interior at night. A thin man with ponytail slumped over a bar counter, forehead resting on crossed arms, leather jacket wrinkled on his back. Seven empty drinking glasses arranged along the polished bar surface with uneven spacing, varying heights, one glass tipped on its side. Bartender as a large dark silhouette looming in the background, only white shirt collar visible. Bar counter rendered as a single white horizontal line against black. Reflections of glasses as white vertical streaks on dark surface. Heavy spotted blacks in background, minimal detail, dramatic chiaroscuro lighting from above. Comic book panel. No text, no speech bubbles.`,
    seeds: [2001, 2137, 2274, 2411, 2548],
  },
  {
    id: '5.1',
    name: 'library-splash',
    description: 'Library splash — architecture + solitude',
    aspect_ratio: '2:3',
    prompt: `${STYLE_PREFIX} Dramatic low angle from floor looking upward. A claustrophobic library interior, tall dark bookshelves pressing inward from both sides like walls closing in, every shelf completely empty. A single ornate brass lamp with twisted root-shaped base standing in the center, casting a pool of white light, the only curved organic form in a world of sharp angles and straight lines. A small lone human silhouette standing at the bottom center of the composition, dwarfed by the towering shelves. Three dark rectangular doorways visible in the far back wall, evenly spaced, leading to unknown destinations. Oppressive vertical composition, massive black ceiling above, floors lost in shadow. Architectural claustrophobia, not grandeur. Comic book splash page. No text, no speech bubbles.`,
    seeds: [5001, 5137, 5274, 5411, 5548],
  },
  {
    id: '8.1',
    name: 'alice-reveal',
    description: 'Alice reveal — first spot color + uncanny valley',
    aspect_ratio: '3:2',
    prompt: `${STYLE_PREFIX} Medium close-up portrait, frontal view, eye level. A young woman with severe beauty looks directly at the viewer with an unnervingly fixed unblinking gaze. Face perfectly bilateral symmetric, sharp cheekbones, thin precise lips, resembling Rooney Mara. Hair pulled back tightly in a sleek style, not a single strand out of place. She holds a notebook rendered in sage green color, the ONLY color element in the entire image, everything else pure black and white. Her contour line is unnaturally clean and precise, like a vector illustration, unlike natural hand-drawn ink. Behind her, suggestion of a rainy park with bare trees. Rain as white diagonal streaks. Her posture is perfectly upright, almost mechanical. Comic book panel. No text, no speech bubbles.`,
    seeds: [8001, 8137, 8274, 8411, 8548],
  },
  {
    id: '9.1',
    name: 'arni-leaving',
    description: 'Arni leaving — pitch deck hero image',
    aspect_ratio: '3:2',
    prompt: `${STYLE_PREFIX} Wide establishing shot at eye level following a man walking away from the viewer. A thin man in leather jacket seen from behind, ponytail visible at the back of his head, walking into heavy rain toward a river. Far behind him on the right side, a small solitary female figure sits on a park bench, barely visible, tiny compared to the walking man. Thames river visible in the middle distance as a white horizontal band. London brick buildings as dark geometric shapes in the background. Heavy rain rendered as white ink splatter and diagonal streaks across the entire composition. Massive distance and empty space between the two figures spanning the full width of the image. Cinematic depth, atmospheric perspective through rain. The walking figure occupies the left third, the seated figure the far right edge. Comic book panel. No text, no speech bubbles.`,
    seeds: [9001, 9137, 9274, 9411, 9548],
  },
];

async function createPrediction(prompt, seed, aspectRatio) {
  const resp = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt,
        seed,
        aspect_ratio: aspectRatio,
        output_format: 'png',
        output_quality: 95,
        safety_tolerance: 5,
      },
    }),
  });

  if (resp.status === 429) {
    const body = await resp.json().catch(() => ({}));
    const wait = (body.retry_after || 12) + 2;
    return { rateLimited: true, wait };
  }

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Replicate API error ${resp.status}: ${err}`);
  }

  return await resp.json();
}

async function pollPrediction(prediction) {
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled') {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(result.urls.get, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    result = await poll.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Generation failed: ${result.error}`);
  }
  if (result.status === 'canceled') {
    throw new Error('Generation was canceled');
  }

  return result;
}

async function generateImage(prompt, seed, aspectRatio, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const prediction = await createPrediction(prompt, seed, aspectRatio);

    if (prediction.rateLimited) {
      console.log(`    Rate limited, waiting ${prediction.wait}s (attempt ${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, prediction.wait * 1000));
      continue;
    }

    const result = await pollPrediction(prediction);

    // Flux 1.1 Pro returns output as a string URL (not array)
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    return outputUrl;
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

async function generatePanel(panel) {
  console.log(`\n--- Panel ${panel.id}: ${panel.description} ---`);
  console.log(`    Aspect: ${panel.aspect_ratio}, Variants: ${panel.seeds.length}`);

  const results = [];

  for (let i = 0; i < panel.seeds.length; i++) {
    const seed = panel.seeds[i];
    const variantNum = i + 1;

    try {
      console.log(`  [${panel.id}] v${variantNum} (seed ${seed}) — generating...`);
      const url = await generateImage(panel.prompt, seed, panel.aspect_ratio);

      const filename = `panel-${panel.name}_v${variantNum}.png`;
      const filepath = join(OUTPUT_DIR, filename);
      const size = await downloadImage(url, filepath);

      console.log(`  [${panel.id}] v${variantNum} — ${(size / 1024).toFixed(0)}KB saved`);
      results.push({
        panel: panel.id,
        name: panel.name,
        variant: variantNum,
        seed,
        file: filename,
        size,
        aspect_ratio: panel.aspect_ratio,
      });
    } catch (err) {
      console.error(`  [${panel.id}] v${variantNum} FAILED: ${err.message}`);
      results.push({
        panel: panel.id,
        name: panel.name,
        variant: variantNum,
        seed,
        error: err.message,
      });
    }

    // Rate limit: 6 req/min → wait 11s between requests
    if (i < panel.seeds.length - 1) {
      await new Promise((r) => setTimeout(r, 11000));
    }
  }

  return results;
}

async function main() {
  const panelArg = process.argv[2] || 'all';

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Select panels to generate
  let selectedPanels;
  if (panelArg === 'all') {
    selectedPanels = PANELS;
  } else {
    selectedPanels = PANELS.filter((p) => p.id === panelArg);
    if (selectedPanels.length === 0) {
      console.error(`Unknown panel: ${panelArg}`);
      console.error(`Available: ${PANELS.map((p) => p.id).join(', ')}, all`);
      process.exit(1);
    }
  }

  const totalImages = selectedPanels.length * VARIANTS_PER_PANEL;
  const estimatedCost = (totalImages * 0.04).toFixed(2);
  const estimatedTime = Math.ceil(totalImages * 15 / 60);

  console.log('=== FolkUp Quest Comic — Panel Generation ===');
  console.log(`Model: FLUX 1.1 Pro`);
  console.log(`Panels: ${selectedPanels.map((p) => p.id).join(', ')}`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Estimated cost: $${estimatedCost}`);
  console.log(`Estimated time: ~${estimatedTime} min`);
  console.log('');

  let allResults = [];

  for (const panel of selectedPanels) {
    const results = await generatePanel(panel);
    allResults.push(...results);

    // Extra delay between panels
    if (panel !== selectedPanels[selectedPanels.length - 1]) {
      console.log('  Cooling down 5s before next panel...');
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Summary
  const ok = allResults.filter((r) => !r.error).length;
  const fail = allResults.filter((r) => r.error).length;

  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`Output: ${OUTPUT_DIR}`);

  if (ok > 0) {
    console.log(`\nNext steps:`);
    console.log(`1. Review variants in ${OUTPUT_DIR}`);
    console.log(`2. Pick best variant per panel`);
    console.log(`3. Note picks in ch1-panels/picks.md`);
    console.log(`4. Run Tier 2 panels if Tier 1 quality is acceptable`);
  }

  // Save manifest
  const manifest = {
    model: 'black-forest-labs/flux-1.1-pro',
    date: new Date().toISOString(),
    style: 'Sin City B&W',
    results: allResults,
  };
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved: ${MANIFEST_FILE}`);
}

main().catch(console.error);
