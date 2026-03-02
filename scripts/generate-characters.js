/**
 * Generate character illustrations via FLUX.1 Schnell on Replicate
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-characters.js [character|all]
 * Examples:
 *   node scripts/generate-characters.js all
 *   node scripts/generate-characters.js arni
 *   node scripts/generate-characters.js alice gonzo
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
  console.error('Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-characters.js [character|all]');
  process.exit(1);
}

const CHAR_STYLE = `Dark atmospheric portrait, Caravaggio lighting, Villeneuve color grading, muted cinematic palette with bordeaux and sage accents, film grain texture, moody, painterly, no text.`;

const CHARACTERS = [
  {
    id: 'arni',
    suffix: 'Thin wiry man mid-30s, long ponytail, short beard, worn leather jacket high collar, slouched posture, hands in pockets, warm amber lamplight on face, Setubal waterfront evening',
  },
  {
    id: 'alice',
    suffix: 'Young woman, dark hair pulled back smoothly, unnaturally perfect posture, symmetric face, fixed analytical gaze, holding notebook and pencil, sage green accent light on notebook, Barnes park twilight',
  },
  {
    id: 'gonzo',
    suffix: 'Thin nervous man in dark hooded coat, face hidden by hood and aviator sunglasses with white highlights, multiple screens glowing behind, Portuguese cork oak forest at night, bordeaux accent light',
  },
  {
    id: 'dan',
    suffix: 'Thin man with African features and light skin, wide-brim blues hat, acoustic guitar in hands, relaxed posture, Chicago kitchen background, vinyl records on wall, warm amber light',
  },
  {
    id: 'breus-young',
    suffix: 'Man early 30s, worn jeans and black turtleneck, open palms gesture, friendly smile, startup office with plastic chairs behind, warm artificial light, energetic',
  },
  {
    id: 'breus',
    suffix: 'Man mid-40s, expensive jacket that looks simple, straight back, distance in eyes, wet gleam on palms, dark office, cold blue-white accent, city lights through glass behind',
  },
  {
    id: 'arni-mirror',
    suffix: 'Same thin man as arni but in leather executive chair, glass office with bay view, different eyes — dead confident gaze, reflection in dark window, split warm/cold lighting',
  },
  {
    id: 'comandante',
    suffix: 'Same man as arni transformed: short haircut, clean-shaven, same leather jacket with collar down, brass key visible on cord over jacket, straight back, face in warm light, determined',
  },
  {
    id: 'team',
    suffix: 'Four silhouettes standing together against warm lamp glow, varied heights and postures, library shelves behind, warm amber and sage light, no faces, unity composition',
  },
  {
    id: 'chair',
    suffix: 'Empty expensive leather executive chair, glass office, bay view with city lights, cold blue-white light, the chair is center frame, ominous absence, no people',
  },
];

const VARIANTS_PER_CHAR = 3;

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
          aspect_ratio: '2:3',
          output_format: 'webp',
          output_quality: 80,
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

    return result.output[0];
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

async function generateCharacter(char, variantNum) {
  const prompt = `${CHAR_STYLE} ${char.suffix}`;
  const seed = char.id.length * 1000 + variantNum * 137;

  console.log(`  [${char.id}] variant ${variantNum} — generating...`);
  const url = await generateImage(prompt, seed);

  const variantFile = `char-${char.id}_v${variantNum}.webp`;
  const variantPath = join(VARIANTS_DIR, variantFile);
  const size = await downloadImage(url, variantPath);
  console.log(`  [${char.id}] variant ${variantNum} — ${(size / 1024).toFixed(0)}KB saved to _variants/`);

  return { character: char.id, variant: variantNum, file: variantFile, size, url };
}

async function main() {
  const args = process.argv.slice(2);
  const requested = args.length === 0 || args.includes('all')
    ? CHARACTERS
    : CHARACTERS.filter((c) => args.includes(c.id));

  if (requested.length === 0) {
    console.error(`No matching characters. Available: ${CHARACTERS.map((c) => c.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== Character Illustrations (${requested.length} characters x ${VARIANTS_PER_CHAR} variants) ===\n`);

  if (!existsSync(VARIANTS_DIR)) await mkdir(VARIANTS_DIR, { recursive: true });
  if (!existsSync(IMAGES_DIR)) await mkdir(IMAGES_DIR, { recursive: true });

  const results = [];
  for (const char of requested) {
    for (let v = 1; v <= VARIANTS_PER_CHAR; v++) {
      try {
        const r = await generateCharacter(char, v);
        results.push(r);
      } catch (err) {
        console.error(`  [${char.id}] variant ${v} FAILED: ${err.message}`);
        results.push({ character: char.id, variant: v, error: err.message });
      }
      // Rate limit: 6 req/min → wait 11s between requests
      await new Promise((r) => setTimeout(r, 11000));
    }
  }

  // Summary
  const ok = results.filter((r) => !r.error).length;
  const fail = results.filter((r) => r.error).length;
  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`Variants saved to: ${VARIANTS_DIR}`);
  console.log(`\nNext: review variants, pick best, copy to public/images/char-{name}.webp`);

  // Save manifest
  await writeFile(
    join(VARIANTS_DIR, 'char-manifest.json'),
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
