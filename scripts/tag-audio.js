/**
 * Tag MP3 files with ID3 metadata
 * Usage: node scripts/tag-audio.js
 */

import NodeID3 from 'node-id3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = join(__dirname, '..', 'public', 'audio');

const COMMON = {
  artist: 'FolkUp',
  album: 'FolkUp Quest — Original Soundtrack',
  year: '2026',
  genre: 'Ambient',
  copyright: '2026 FolkUp. Generated with Stable Audio 2.5 (Stability AI Community License).',
  url: { officialArtistWebpage: 'https://folkup.app' },
  comment: {
    language: 'eng',
    text: 'FolkUp Quest interactive fiction — https://quest.folkup.app',
  },
};

const TRACKS = [
  {
    file: 'act1-dark.mp3',
    title: 'Act I — Dark Shore',
    trackNumber: '1/3',
  },
  {
    file: 'act2-tension.mp3',
    title: 'Act II — Tension',
    trackNumber: '2/3',
  },
  {
    file: 'act3-resolution.mp3',
    title: 'Act III — Resolution',
    trackNumber: '3/3',
  },
];

for (const track of TRACKS) {
  const path = join(AUDIO_DIR, track.file);
  const tags = {
    ...COMMON,
    title: track.title,
    trackNumber: track.trackNumber,
  };

  const ok = NodeID3.write(tags, path);
  if (ok === true) {
    console.log(`  Tagged: ${track.file} → "${track.title}"`);
  } else {
    console.error(`  FAILED: ${track.file} — ${ok}`);
  }
}

console.log('\nDone. Verify: node scripts/tag-audio.js --read');

if (process.argv.includes('--read')) {
  console.log('\n=== Verification ===');
  for (const track of TRACKS) {
    const path = join(AUDIO_DIR, track.file);
    const read = NodeID3.read(path);
    console.log(`\n${track.file}:`);
    console.log(`  Title: ${read.title}`);
    console.log(`  Artist: ${read.artist}`);
    console.log(`  Album: ${read.album}`);
    console.log(`  Track: ${read.trackNumber}`);
    console.log(`  Year: ${read.year}`);
    console.log(`  Copyright: ${read.copyright}`);
  }
}
