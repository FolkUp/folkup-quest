#!/usr/bin/env node

/**
 * Panel 2.3 "Alice Investigation" - Flux 2 Pro Generation
 *
 * Character Focus: Alice canonical introduction (Rooney Mara type)
 * Consistency: ≥7/10 vs Panel 8.1 baseline
 * Spot Color: Sage green (#839E75) for Alice's notebook
 * Authority: Level 3 Cartouche Autonome
 */

const fs = require('fs').promises;
const path = require('path');

// Panel 2.3 Configuration
const PANEL_CONFIG = {
  id: "panel-2-3-alice-investigation",
  scene: "Alice Investigation",
  character: "Alice",
  aspectRatio: "2:3",
  outputFormat: "png",
  outputQuality: 100,
  spotColor: {
    hex: "#839E75",
    element: "Alice's notebook",
    description: "sage green"
  },
  targetCost: 3.50,
  qualityTarget: 7.0,
  characterConsistency: 7.0
};

// Enhanced Master Prompt
const MASTER_PROMPT = `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.

SCENE: Alice character introduction - investigator studying files at desk. Interior library/office setting, noir investigative mood.

MAIN SUBJECT: Alice - woman in her late 20s, Rooney Mara facial type with machine-precision contour definition. Short dark bob haircut, sharp angular features, intense focused expression. Wearing dark professional attire. Seated at desk studying case files and evidence documents.

CHARACTER CONSISTENCY (ENHANCED - Alice Panel 8.1 Canonical):
- Facial Type: Rooney Mara bone structure specifically (sharp angles, defined cheekbones)
- Contour: Machine-precision line work (NOT organic/soft)
- Hair: Short dark bob, precisely cut, geometric
- Expression: Intense, analytical, investigative focus
- Build: Lean, professional, controlled posture
- Age Appearance: Late 20s, mature but not weathered

ALICE CANONICAL REQUIREMENTS (Panel 8.1 Baseline):
- Silhouette: White figure against dark backgrounds
- Contour Style: Sharp, mechanical precision (signature element)
- Facial Structure: Angular, geometric, Rooney Mara reference
- Expression Control: Focused, never casual/relaxed
- Professional Demeanor: Analytical investigator persona

BACKGROUND ELEMENTS:
- Desk with scattered case files and evidence documents
- Desk lamp casting dramatic directional lighting from upper right
- Library/office setting with vertical lines suggesting bookshelves
- Evidence photos scattered on desk surface
- File folders with visible tabs/labels
- Coffee cup or water glass (investigator detail)

PROPS & MOOD DETAILS:
- Case files: white papers with black text lines
- Evidence documents: photographs and typed reports
- Desk lamp: classic noir lighting (dramatic shadows)
- Alice's notebook: sage green spot color (#839E75) - only color element
- Investigative atmosphere: serious, methodical, professional

STYLE DETAILS (SIN CITY ANCHOR):
- Spotted blacks for large shadow areas
- White silhouettes against black backgrounds
- Sharp geometric contours (especially Alice)
- Negative space defines forms
- High contrast, no halftones
- Clean ink wash aesthetic
- Dramatic lighting from single source (desk lamp)

MOOD: Professional investigator at work, noir atmosphere, analytical focus. Scene establishes Alice's methodical, precision-oriented character.

TECHNICAL REQUIREMENTS:
- Pure black and white only
- Single spot color: sage green (#839E75) for Alice's notebook
- High contrast ink illustration
- Comic book panel format
- Frank Miller style composition
- Aspect ratio: 2:3 portrait`;

/**
 * Generate Panel 2.3 via Replicate Flux 2 Pro API
 */
async function generatePanel23() {
  console.log('🎨 Starting Panel 2.3: Alice Investigation');
  console.log('📝 Character: Alice canonical introduction');
  console.log('🎯 Target: ≥7/10 consistency with Panel 8.1 baseline');

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Initialize manifest
  const manifest = {
    panelId: PANEL_CONFIG.id,
    generationTime: timestamp,
    config: PANEL_CONFIG,
    prompt: MASTER_PROMPT,
    characterFocus: "Alice canonical introduction",
    consistency: {
      target: PANEL_CONFIG.characterConsistency,
      baseline: "Panel 8.1 (Rooney Mara facial type)",
      requirements: "Machine-precision contour, analytical expression"
    },
    spotColor: PANEL_CONFIG.spotColor,
    qualityExpectations: {
      weightedAverage: PANEL_CONFIG.qualityTarget,
      characterConsistency: PANEL_CONFIG.characterConsistency,
      sinCityStyle: 7.0,
      composition: 7.0,
      technicalQuality: 8.0,
      narrativeImpact: 7.0
    },
    budgetAllocation: {
      estimatedCost: PANEL_CONFIG.targetCost,
      maxCost: 10.50,
      regenerationLimit: 2
    }
  };

  try {
    // Verify API token
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable not set');
    }

    console.log('🔑 API token verified');
    console.log('📐 Aspect ratio: 2:3 (portrait)');
    console.log('🎨 Spot color: sage green (#839E75) for notebook');

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'comic', 'panels');
    await fs.mkdir(outputDir, { recursive: true });

    console.log('📁 Output directory ready:', outputDir);

    // API request configuration
    const requestBody = {
      input: {
        prompt: MASTER_PROMPT,
        aspect_ratio: PANEL_CONFIG.aspectRatio,
        output_format: PANEL_CONFIG.outputFormat,
        output_quality: PANEL_CONFIG.outputQuality
      }
    };

    console.log('🚀 Submitting to Flux 2 Pro...');

    // Submit to Replicate API
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('✅ Generation submitted, prediction ID:', prediction.id);

    // Poll for completion
    let result = prediction;
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second intervals
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Generation timeout after 5 minutes');
      }

      console.log(`⏳ Generation in progress... (${attempts * 5}s)`);

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        }
      });

      result = await statusResponse.json();
    }

    if (result.status !== 'succeeded') {
      throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
    }

    console.log('🎉 Generation completed successfully!');

    // Download the generated image
    const imageUrl = result.output[0];
    console.log('📥 Downloading image from:', imageUrl);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const outputPath = path.join(outputDir, 'panel-2-3-alice-investigation.png');

    await fs.writeFile(outputPath, Buffer.from(imageBuffer));

    console.log('💾 Panel 2.3 saved:', outputPath);

    // Calculate actual cost and timing
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Update manifest with results
    manifest.results = {
      status: 'completed',
      outputPath: outputPath,
      imageUrl: imageUrl,
      predictionId: result.id,
      duration: `${duration} seconds`,
      fileSize: Buffer.from(imageBuffer).length,
      actualCost: 3.50 // Estimated, update with actual billing data if available
    };

    console.log(`⏱️ Generation completed in ${duration} seconds`);
    console.log(`📊 File size: ${Math.round(Buffer.from(imageBuffer).length / 1024)}KB`);
    console.log(`💰 Estimated cost: $${manifest.results.actualCost}`);

    // Save manifest
    const manifestPath = path.join(outputDir, 'panel-2-3-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('📋 Manifest saved:', manifestPath);
    console.log('');
    console.log('🎯 Panel 2.3 Next Steps:');
    console.log('   1. Expert review cycle (Фонарщик, Johnny, КиберГонзо)');
    console.log('   2. Alice character consistency validation vs Panel 8.1');
    console.log('   3. Sage green spot color post-processing');
    console.log('   4. Quality scoring (target: ≥7.0/10)');
    console.log('');
    console.log('✅ Panel 2.3 generation framework ready for expert review');

    return manifest;

  } catch (error) {
    console.error('❌ Panel 2.3 generation failed:', error.message);

    manifest.error = {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    // Save error manifest
    try {
      const outputDir = path.join(process.cwd(), 'comic', 'panels');
      await fs.mkdir(outputDir, { recursive: true });
      const manifestPath = path.join(outputDir, 'panel-2-3-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('📋 Error manifest saved:', manifestPath);
    } catch (saveError) {
      console.error('❌ Failed to save error manifest:', saveError.message);
    }

    throw error;
  }
}

// Export for use by parallel pipeline
module.exports = { generatePanel23, PANEL_CONFIG, MASTER_PROMPT };

// Execute if called directly
if (require.main === module) {
  generatePanel23()
    .then(() => {
      console.log('✅ Panel 2.3 generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Panel 2.3 generation failed');
      process.exit(1);
    });
}