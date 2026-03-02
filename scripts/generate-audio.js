/**
 * Generate ambient audio tracks via Stable Audio 2.5 on Replicate
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-audio.js [track|all]
 * Examples:
 *   node scripts/generate-audio.js all
 *   node scripts/generate-audio.js act1-dark
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = join(__dirname, '..', 'public', 'audio');
const VARIANTS_DIR = join(__dirname, '..', '_variants', 'audio');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  console.error('Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-audio.js [track|all]');
  process.exit(1);
}

const TRACKS = [
  {
    id: 'act1-dark',
    duration: 120,
    prompt: 'Dark ambient soundscape, deep drones, distant ocean waves, melancholic minimal textures, Portuguese coastal night atmosphere, warm analog synth pad, subtle crackling, no melody, no drums, no vocals, cinematic, introspective, loopable, 60 BPM',
  },
  {
    id: 'act2-tension',
    duration: 120,
    prompt: 'Tense atmospheric ambient, low frequency pulsing drone, uneasy suspense, corporate cold undertones mixed with warm resistance, subtle dissonant strings, growing pressure, no melody, no drums, no vocals, psychological thriller mood, dark cinematic, loopable, 70 BPM',
  },
  {
    id: 'act3-resolution',
    duration: 120,
    prompt: 'Ambient resolution, dawn atmosphere, slowly building warmth from darkness, gentle analog synth pads, distant church bells hint, fishing boats creaking, hope emerging through melancholy, bittersweet, no drums, no vocals, contemplative, Portuguese morning light feeling, loopable, 55 BPM',
  },
];

const VARIANTS_PER_TRACK = 3;

async function generateAudio(prompt, duration, seed, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const resp = await fetch('https://api.replicate.com/v1/models/stability-ai/stable-audio-2.5/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          duration,
          seed,
          steps: 8,
          cfg_scale: 1,
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

    // Poll for completion (audio generation takes ~6s per track)
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(result.urls.get, {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      });
      result = await poll.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error}`);
    }

    return result.output; // URL of generated MP3
  }
  throw new Error(`Rate limited after ${retries} retries`);
}

async function downloadFile(url, path) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  await writeFile(path, buffer);
  return buffer.length;
}

async function generateTrack(track, variantNum) {
  const seed = track.id.length * 1000 + variantNum * 137;

  console.log(`  [${track.id}] variant ${variantNum} — generating (${track.duration}s)...`);
  const url = await generateAudio(track.prompt, track.duration, seed);

  const variantFile = `${track.id}_v${variantNum}.mp3`;
  const variantPath = join(VARIANTS_DIR, variantFile);
  const size = await downloadFile(url, variantPath);
  const sizeMB = (size / 1024 / 1024).toFixed(1);
  console.log(`  [${track.id}] variant ${variantNum} — ${sizeMB}MB saved to _variants/audio/`);

  return { track: track.id, variant: variantNum, file: variantFile, size, url };
}

async function main() {
  const args = process.argv.slice(2);
  const requested = args.length === 0 || args.includes('all')
    ? TRACKS
    : TRACKS.filter((t) => args.includes(t.id));

  if (requested.length === 0) {
    console.error(`No matching tracks. Available: ${TRACKS.map((t) => t.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== Audio Generation: Stable Audio 2.5 (${requested.length} tracks x ${VARIANTS_PER_TRACK} variants) ===\n`);

  if (!existsSync(VARIANTS_DIR)) await mkdir(VARIANTS_DIR, { recursive: true });
  if (!existsSync(AUDIO_DIR)) await mkdir(AUDIO_DIR, { recursive: true });

  const results = [];
  for (const track of requested) {
    for (let v = 1; v <= VARIANTS_PER_TRACK; v++) {
      try {
        const r = await generateTrack(track, v);
        results.push(r);
      } catch (err) {
        console.error(`  [${track.id}] variant ${v} FAILED: ${err.message}`);
        results.push({ track: track.id, variant: v, error: err.message });
      }
      // Rate limit: wait between requests
      await new Promise((r) => setTimeout(r, 11000));
    }
  }

  // Summary
  const ok = results.filter((r) => !r.error).length;
  const fail = results.filter((r) => r.error).length;
  console.log(`\n=== DONE: ${ok} generated, ${fail} failed ===`);
  console.log(`Variants saved to: ${VARIANTS_DIR}`);
  console.log(`\nNext: review variants, pick best, copy to public/audio/{track}.mp3`);

  // Save manifest with URLs for Telegram sharing
  const manifestPath = join(VARIANTS_DIR, 'audio-manifest.json');
  await writeFile(manifestPath, JSON.stringify(results, null, 2));
  console.log(`Manifest: ${manifestPath}`);

  // Print URLs for quick access
  console.log('\n=== Download URLs ===');
  results.filter((r) => !r.error).forEach((r) => {
    console.log(`  ${r.track} v${r.variant}: ${r.url}`);
  });
}

main().catch(console.error);
