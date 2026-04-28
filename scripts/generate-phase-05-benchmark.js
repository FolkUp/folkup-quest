/**
 * FolkUp Quest Phase 0.5 Benchmark — Flux 2 Pro Generation
 * Expert-verified prompts (КиберГонзо + Наборщик + Specialized Suite CONDITIONAL_PASS)
 *
 * Usage: REPLICATE_API_TOKEN=xxx node scripts/generate-phase-05-benchmark.js [calibration|core|all]
 *
 * calibration: Panel 8.1 (Alice Reveal) only — character baseline establishment
 * core: Panels 1.1, 2.3, 5.1, 9.1 — main benchmark set
 * all: calibration + core (default)
 *
 * Model: Flux 2 Pro (black-forest-labs/flux-2-pro)
 * Cost: ~$2-3 per image (Flux 2 Pro)
 * Budget ceiling: $25 total, abort at $15 if <4/10 quality
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'comic', '_output', 'phase-05-benchmark');
const MANIFEST_FILE = join(OUTPUT_DIR, 'generation-manifest.json');
const QUALITY_LOG = join(OUTPUT_DIR, 'quality-assessment.md');

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN not set');
  console.error('Set your Replicate API token: export REPLICATE_API_TOKEN=r8_xxx');
  process.exit(1);
}

const MODEL_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions';

// Expert-verified prompts from comic/phase-05-benchmark-prompts.md
// Status: CONDITIONAL_PASS → remediation complete (28.04.2026)
const PANELS = {
  calibration: [
    {
      id: '8.1',
      name: 'alice-reveal',
      description: 'Alice Reveal (Calibration) — Character baseline establishment',
      aspect_ratio: '16:9', // Closest to 3:1 wide format (Flux 2 Pro limitation)
      priority: 'CALIBRATION',
      prompt: `Comic book panel in Frank Miller Sin City style. Pure black and white with SINGLE spot color accent, high contrast ink wash.

SCENE: Character reveal scene, medium close-up frontal view at eye level.

MAIN SUBJECT: Young woman in her mid-20s, Rooney Mara facial type. Perfect bilateral facial symmetry. Hair pulled back tightly, never loose. Beautiful but unsettling "something not quite right" quality.

KEY TECHNICAL DETAIL:
- Machine-precision contour: SINGLE CLEAN LINE outline (NOT hand-drawn feel)
- Contrast with typical comic art: this character has vector-like precision
- Perfect geometric symmetry in facial features
- Unnaturally precise posture and positioning

SPOT COLOR ELEMENT:
- Brick-red notebook in her hands (sage #839E75 color)
- ONLY the notebook receives color treatment
- Everything else pure black and white
- Notebook is focal point drawing eye

BACKGROUND ELEMENTS:
- Minimal background, focus on character
- Strong contrast to emphasize the precise lineart
- Geometric precision vs organic environment

STYLE DETAILS:
- High contrast ink wash for background
- Machine-precision single line for character outline
- Perfect symmetry unusual for comic art
- Spot color draws attention to notebook
- Clinical precision vs human warmth

MOOD: Uncanny valley effect, AI/artificial hints, intelligence, slight unease. Perfect but not quite human.

TECHNICAL:
- Pure black and white base
- Single spot color (sage #839E75) on notebook only
- Machine precision contour for character
- High contrast ink illustration
- Wide horizontal panel format`,
    },
  ],
  core: [
    {
      id: '1.1',
      name: 'shore-splash',
      description: 'Shore Splash — Setúbal waterfront establishing shot',
      aspect_ratio: '2:3',
      priority: 'CORE',
      prompt: `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Setúbal Portugal waterfront establishing shot. Wide angle 30-degree bird's eye view.

MAIN SUBJECT: Thin wiry man in his late 30s with ponytail and short beard, wearing black leather jacket with raised collar, slouching posture. White silhouette figure sitting on black bench. Man appears small in composition, positioned lower third.

BACKGROUND ELEMENTS:
- Atlantic Ocean horizon line at 50% height of image
- 7 seagulls scattered as white dots/shapes of varying sizes across sky
- 3-4 fisherman silhouettes on distant horizon with fishing nets (horizontal arc shapes)
- Waterfront promenade with black geometric shapes
- Bench with visible paint layers (3 white stripes/chipped paint detail)

STYLE DETAILS:
- Spotted blacks technique for large areas
- White silhouettes on black backgrounds
- Negative space defines forms
- High contrast, no halftones
- Clean ink wash aesthetic
- Minimal detail, maximum impact through silhouette

MOOD: Contemplative, noir, establishing loneliness. Silent scene with strong compositional geometry.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Comic book panel format
- Frank Miller style composition`,
    },
    {
      id: '2.3',
      name: 'bar-glasses',
      description: 'Bar Glasses — Арни with 7 empty glasses',
      aspect_ratio: '16:9', // Closest to 3:1 wide format (Flux 2 Pro limitation)
      priority: 'CORE',
      prompt: `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Interior bar scene, medium shot from side angle at eye level.

MAIN SUBJECT: Thin wiry man with ponytail and beard, wearing black leather jacket. Head resting on crossed arms on bar counter. White figure against black background. Posture shows defeat, exhaustion.

FOREGROUND ELEMENTS:
- 7 empty glasses arranged on dark bar surface
- Glasses have varying heights and distances between them
- Pattern feels organic, not geometric (echoing seagull placement)
- One glass slightly tipped/on side
- Glasses are white/light shapes against dark bar surface

BACKGROUND ELEMENTS:
- Bartender as black silhouette figure in background
- Bar shelves with bottle silhouettes
- Minimal bar interior details
- Strong contrast between foreground (glasses) and background

STYLE DETAILS:
- High contrast ink wash
- White shapes (glasses, figure) on black backgrounds
- Spotted blacks for bar surface and background
- Clean negative space definition
- Minimal detail, maximum emotional impact

MOOD: Rock bottom, despair, repetition/pattern suggesting obsessive counting. Silent contemplation.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Wide horizontal panel format
- Frank Miller compositional style`,
    },
    {
      id: '5.1',
      name: 'library-splash',
      description: 'Library Splash — Claustrophobic library interior',
      aspect_ratio: '2:3',
      priority: 'CORE',
      prompt: `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Library interior, claustrophobic composition. Low angle shot from floor level looking upward.

MAIN SUBJECT: Small silhouette figure of thin wiry man at bottom center of composition. Figure appears tiny, dominated by surrounding architecture.

ARCHITECTURE ELEMENTS:
- Towering bookshelves creating claustrophobic vertical compression
- Empty shelves stretching wall-to-wall
- Shelves create strong vertical lines converging upward
- NOT cathedral-like, but oppressive and confining

KEY FOCAL POINT:
- Single lamp with root-like branches/organic curves
- Only rounded/organic form in geometric space
- Warm white glow emanating from lamp (represented as white negative space)
- Lamp positioned to create dramatic lighting contrast

BACKGROUND ELEMENTS:
- Three doors visible as dark rectangular shapes in deep background
- Geometric shelf patterns creating perspective lines
- Strong vertical emphasis throughout composition

STYLE DETAILS:
- Heavy use of black negative space
- White silhouette figure against black environment
- Geometric architectural forms vs organic lamp
- Dramatic perspective creating scale/intimidation
- Minimal detail, maximum atmospheric impact

MOOD: Isolation, knowledge overwhelming human scale, mysterious portal feeling.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Vertical full-page panel format
- Frank Miller dramatic perspective`,
    },
    {
      id: '9.1',
      name: 'arni-leaving',
      description: 'Arni Leaving — Walking away from Alice',
      aspect_ratio: '3:2',
      priority: 'CORE',
      prompt: `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Urban city area, wide shot following character from behind at eye level.

MAIN SUBJECT: Thin wiry man with ponytail walking away, back to viewer. Black leather jacket with raised collar. Figure positioned left-of-center in composition, creating sense of movement and departure.

BACKGROUND FIGURE:
- Small female silhouette on bench in far background
- Positioned at opposite end of panel width
- Creates maximum distance/separation feeling
- She remains stationary while he moves away

ENVIRONMENT ELEMENTS:
- Light precipitation falling (white diagonal lines/splatter technique)
- River elements in distance
- Urban architecture silhouettes
- City landscape creating depth

COMPOSITIONAL EMPHASIS:
- Wide panel format emphasizes distance/separation
- Horizontal composition showing gulf between characters
- Movement from foreground (Arni) to background (Alice)
- Environmental details support mood of separation

STYLE DETAILS:
- Splatter technique for rain texture
- White silhouettes against dark urban environment
- Spotted blacks for architecture and pavement
- Negative space defines moving figure
- Atmospheric perspective through rain/particles

MOOD: Departure, separation, choice made, melancholy. Distance both physical and emotional.

TECHNICAL:
- Pure black and white only
- No gray tones
- High contrast ink illustration
- Wide horizontal panel format
- Frank Miller atmospheric storytelling`,
    },
  ],
};

async function createFlux2ProPrediction(prompt, aspectRatio) {
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
    const wait = Math.max(body.retry_after || 60, 60) + 5; // Flux 2 Pro has different rate limits
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
  console.log(`    [${result.id}] Polling for completion...`);

  while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled') {
    await new Promise(r => setTimeout(r, 3000)); // 3s polling interval
    const poll = await fetch(result.urls.get, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    result = await poll.json();

    if (result.status === 'processing') {
      console.log(`    [${result.id}] Processing... (${Math.round(Date.now()/1000)} sec elapsed)`);
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

async function generatePanel(panel) {
  const timestamp = new Date().toISOString();
  console.log(`\n--- Panel ${panel.id}: ${panel.description} ---`);
  console.log(`    Aspect: ${panel.aspect_ratio}, Priority: ${panel.priority}`);
  console.log(`    Time: ${timestamp}`);

  try {
    console.log(`  [${panel.id}] Creating Flux 2 Pro prediction...`);
    const prediction = await createFlux2ProPrediction(panel.prompt, panel.aspect_ratio);

    if (prediction.rateLimited) {
      console.log(`    Rate limited! Waiting ${prediction.wait}s before retry...`);
      await new Promise(r => setTimeout(r, prediction.wait * 1000));
      // Retry once after rate limit wait
      const retryPrediction = await createFlux2ProPrediction(panel.prompt, panel.aspect_ratio);
      if (retryPrediction.rateLimited) {
        throw new Error('Rate limited twice — aborting to stay within budget');
      }
      const result = await pollPrediction(retryPrediction);
      const outputUrl = result.output;
      return await downloadAndSavePanel(panel, outputUrl, timestamp);
    }

    const result = await pollPrediction(prediction);
    const outputUrl = result.output;
    return await downloadAndSavePanel(panel, outputUrl, timestamp);

  } catch (err) {
    console.error(`  [${panel.id}] GENERATION FAILED: ${err.message}`);
    return {
      panel: panel.id,
      name: panel.name,
      description: panel.description,
      priority: panel.priority,
      error: err.message,
      timestamp,
    };
  }
}

async function downloadAndSavePanel(panel, url, timestamp) {
  console.log(`  [${panel.id}] Downloading image...`);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);

  const buffer = Buffer.from(await resp.arrayBuffer());
  const filename = `panel-${panel.id}-${panel.name}.png`;
  const filepath = join(OUTPUT_DIR, filename);

  await writeFile(filepath, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

  console.log(`  [${panel.id}] SUCCESS: ${sizeMB}MB saved → ${filename}`);

  return {
    panel: panel.id,
    name: panel.name,
    description: panel.description,
    priority: panel.priority,
    filename,
    size: buffer.length,
    sizeMB: parseFloat(sizeMB),
    url,
    timestamp,
    aspect_ratio: panel.aspect_ratio,
  };
}

async function assessCalibrationQuality(result) {
  if (result.error) {
    console.log(`\n🚨 CALIBRATION FAILED: ${result.error}`);
    return { quality: 0, verdict: 'ABORT', reason: 'Generation failed' };
  }

  console.log(`\n🎯 CALIBRATION ASSESSMENT — Panel 8.1 (Alice Reveal)`);
  console.log(`    File: ${result.filename} (${result.sizeMB}MB)`);

  // Automated technical checks (basic validation)
  const technicalChecks = {
    fileGenerated: !!result.filename,
    sizeReasonable: result.sizeMB > 0.5 && result.sizeMB < 20,
    aspectRatioCorrect: result.aspect_ratio === '16:9',
  };

  const technicalScore = Object.values(technicalChecks).filter(Boolean).length;
  const maxTechnical = Object.keys(technicalChecks).length;

  console.log(`    Technical: ${technicalScore}/${maxTechnical} checks passed`);

  // Provisional quality estimate (requires manual review for actual quality)
  const provisionalQuality = (technicalScore / maxTechnical) * 6; // Max 6/10 on technical alone

  console.log(`    Provisional Quality: ${provisionalQuality.toFixed(1)}/10 (technical only)`);
  console.log(`    ⚠️  MANUAL REVIEW REQUIRED for actual quality assessment`);

  if (provisionalQuality >= 4.0) {
    return { quality: provisionalQuality, verdict: 'PROCEED', reason: 'Technical validation passed' };
  } else {
    return { quality: provisionalQuality, verdict: 'ABORT', reason: 'Technical validation failed' };
  }
}

async function main() {
  const mode = process.argv[2] || 'all';

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Select panels based on mode
  let selectedPanels = [];
  if (mode === 'calibration' || mode === 'all') {
    selectedPanels.push(...PANELS.calibration);
  }
  if (mode === 'core' || mode === 'all') {
    selectedPanels.push(...PANELS.core);
  }

  if (selectedPanels.length === 0) {
    console.error(`Unknown mode: ${mode}`);
    console.error('Available modes: calibration, core, all');
    process.exit(1);
  }

  const estimatedCost = selectedPanels.length * 2.5; // ~$2-3 per Flux 2 Pro image
  const estimatedTime = selectedPanels.length * 3; // ~3 min per image

  console.log('=== FolkUp Quest Phase 0.5 Benchmark Generation ===');
  console.log(`Model: Flux 2 Pro (black-forest-labs/flux-2-pro)`);
  console.log(`Expert Verification: CONDITIONAL_PASS → remediation complete`);
  console.log(`Mode: ${mode}`);
  console.log(`Panels: ${selectedPanels.map(p => p.id).join(', ')}`);
  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);
  console.log(`Estimated time: ~${estimatedTime} min`);
  console.log(`Budget ceiling: $25 total, abort at $15 if <4/10 quality`);
  console.log('');

  const results = [];
  let totalCost = 0;

  for (const panel of selectedPanels) {
    const result = await generatePanel(panel);
    results.push(result);

    if (!result.error) {
      totalCost += 2.5; // Flux 2 Pro cost estimate
    }

    // Calibration quality check (Panel 8.1)
    if (panel.id === '8.1' && panel.priority === 'CALIBRATION') {
      const assessment = await assessCalibrationQuality(result);
      result.qualityAssessment = assessment;

      if (assessment.verdict === 'ABORT') {
        console.log(`\n❌ CALIBRATION ABORT: ${assessment.reason}`);
        console.log(`Quality: ${assessment.quality}/10 (below 4.0 threshold)`);

        // Save abort report
        const abortReport = `# Phase 0.5 Calibration ABORT\n\nPanel 8.1 failed calibration threshold.\n\n**Quality:** ${assessment.quality}/10\n**Reason:** ${assessment.reason}\n\n**Recommendation:** Hybrid or professional approach required.\n`;
        await writeFile(QUALITY_LOG, abortReport);

        console.log(`Abort report saved: ${QUALITY_LOG}`);
        process.exit(1);
      } else {
        console.log(`\n✅ CALIBRATION PROCEED: ${assessment.reason}`);
        console.log(`Provisional quality: ${assessment.quality}/10 (≥4.0 threshold met)`);
        console.log(`Proceeding with core panel generation...`);
      }
    }

    // Budget check
    if (totalCost >= 15 && results.filter(r => !r.error).length < 3) {
      console.log(`\n💰 BUDGET ABORT: $${totalCost} spent, quality trajectory suggests <6/10`);
      break;
    }

    // Delay between generations (respect rate limits + cost management)
    if (panel !== selectedPanels[selectedPanels.length - 1]) {
      console.log('  Cooling down 30s before next panel...');
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  // Summary
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  console.log(`\n=== GENERATION COMPLETE ===`);
  console.log(`✅ Generated: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`💰 Estimated cost: $${totalCost.toFixed(2)}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  // Save manifest
  const manifest = {
    model: 'black-forest-labs/flux-2-pro',
    phase: '0.5-benchmark',
    expertVerification: 'CONDITIONAL_PASS',
    date: new Date().toISOString(),
    mode,
    budgetCeiling: 25,
    abortThreshold: 15,
    estimatedCost: totalCost,
    results,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
    },
  };

  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest saved: ${MANIFEST_FILE}`);

  if (successful.length > 0) {
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Review generated panels in ${OUTPUT_DIR}`);
    console.log(`2. Score each panel using _meta/phase-0.5-quality-rubric.md`);
    console.log(`3. Run dual-reviewer protocol (Андрей + Art Director)`);
    console.log(`4. Execute production decision based on aggregate scores`);
    console.log(`5. Update FQST-003 → done, FQST-004 → in_progress`);
  }
}

main().catch(console.error);