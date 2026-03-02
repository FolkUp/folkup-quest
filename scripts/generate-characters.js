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
    suffix: 'Thin wiry man mid-30s, long hair tied in ponytail, short beard, worn leather jacket with high raised collar hiding his neck, slouched posture, hands in pockets, face partially in shadow only jaw and mouth lit, brass key on leather cord barely visible under jacket. Warm amber lamplight, Setubal waterfront evening',
  },
  {
    id: 'alice',
    suffix: 'Young woman Rooney Mara type, dark hair pulled back perfectly smooth not a single stray hair, unnaturally perfect rigid posture, perfectly symmetric face, fixed analytical gaze with something subtly uncanny about her perfection, holding wet-brick-red notebook and pencil with fingers in precise identical position, sage green accent light on notebook. Barnes park twilight',
  },
  {
    id: 'gonzo',
    suffix: 'Thin nervous man with wiry restless energy, dark hooded long coat over hoodie, face completely hidden by deep hood shadow and aviator sunglasses with two bright white highlight reflections, three glowing monitors behind him like a data cockpit, Portuguese cork oak forest at night, bordeaux accent light',
  },
  {
    id: 'dan',
    suffix: 'Slim man with long limbs, broad nose, full lips, strong jaw, tightly curled pale blond afro hair peeking under hat, very pale freckled pinkish-white skin like a redhead but with distinctly Black African bone structure and facial features, pale blue eyes, wide-brim blues hat always on, acoustic guitar in hands, relaxed loose posture in wrinkled matte clothes, Chicago kitchen background with vinyl records on wall and half-assembled robot on table, warm amber light, alive expressive eyes',
  },
  {
    id: 'breus-young',
    suffix: 'Man early 30s same thin build as arni but different face, deliberately worn jeans and black turtleneck like Steve Jobs calculated costume, open palms gesture leaning forward eagerly like we are friends, looking straight into eyes with white highlights in pupils, friendly but something calculated underneath, startup office with plastic chairs and twenty people behind, warm artificial light',
  },
  {
    id: 'breus',
    suffix: 'Man mid-40s same build as arni but drier harder sharper, face dry sharp groomed with cheekbones sharper than a blade, expensive jacket that looks deceptively simple over expensive unworn jeans, straight stiff back, eyes that glitter but do not burn with cold distance, hands in pockets with subtle wet sheen on palms, dark office shot from slightly below looking up at him, cold blue-white accent, city lights through glass behind',
  },
  {
    id: 'arni-mirror',
    suffix: 'Same thin wiry man as arni sitting in leather executive chair, glass corner office with bay view, same face same hands same mole on wrist but completely different dead confident corporate eyes, reflection in dark window showing city lights and luxury car below, split warm and cold lighting dividing his face, unsettling transformation',
  },
  {
    id: 'comandante',
    suffix: 'Same man as arni fully transformed: short neat haircut clean-shaven revealing full face in warm light with no shadows, same worn leather jacket but collar turned down and open, brass key on leather cord prominently visible hanging over jacket front, straight confident back, determined focused expression, earned authority not borrowed',
  },
  {
    id: 'team',
    suffix: 'Four diverse silhouettes standing together: one with ponytail and raised collar, one rigid with notebook, one in hood with sunglasses, one in wide-brim hat holding guitar, against warm lamp glow, library shelves behind, warm amber and sage light, no faces visible, unity composition',
  },
  {
    id: 'chair',
    suffix: 'Empty expensive leather executive chair, glass corner office, bay view with city lights far below, cold blue-white light, chair perfectly centered in frame, ominous absence suggesting someone powerful just left, no people, oppressive silence',
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
