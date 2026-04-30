#!/usr/bin/env node

/**
 * Panel 5.1 "Library Dramatic Perspective" - Flux 2 Pro Generation
 *
 * Mission: Sin City baseline anchor for entire comic series
 * Quality: ≥8.0/10 reference standard
 * Style: Pure B&W, architectural precision, Frank Miller mastery
 * Authority: Level 3 Cartouche Autonome
 */

const fs = require('fs').promises;
const path = require('path');

// Panel 5.1 Configuration
const PANEL_CONFIG = {
  id: "panel-5-1-library-perspective",
  scene: "Library Dramatic Perspective",
  mission: "Sin City aesthetic anchor",
  aspectRatio: "2:3",
  outputFormat: "png",
  outputQuality: 100,
  baselineStatus: true,
  spotColor: "none",
  targetCost: 3.50,
  qualityTarget: 8.0,
  baselineRequirement: "Reference quality for entire series"
};

// Enhanced Master Prompt
const MASTER_PROMPT = `Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, absolutely no gray tones.

SCENE: Dramatic library interior establishing shot. High contrast noir atmosphere, architectural perspective anchor.

MAIN SUBJECT: Library interior with dramatic perspective composition. No human figures - pure architectural mood piece. Emphasis on geometric forms, dramatic lighting, and Sin City aesthetic foundation.

LIBRARY SETTING (DRAMATIC PERSPECTIVE):
- High-ceiling library interior with towering bookshelves
- Dramatic perspective lines converging to vanishing point
- Multiple levels of bookshelves creating depth
- Reading tables and chairs arranged geometrically
- Architectural details: columns, arches, structural elements
- Strategic lighting creating deep shadows and bright highlights

LIGHTING & ATMOSPHERE:
- Single dramatic light source (library windows or overhead lighting)
- Deep black shadows contrasting with bright white highlights
- Architectural elements silhouetted against light
- Negative space used to define forms
- Dramatic contrast between illuminated and shadow areas

STYLE DETAILS (SIN CITY BASELINE ANCHOR):
- Spotted blacks technique for large shadow areas
- Pure geometric architecture (no organic curves)
- Stark white highlights against deep blacks
- Negative space as primary design element
- High contrast ink wash aesthetic - NO GRAYS
- Sharp geometric lines defining architectural elements
- Dramatic perspective emphasizing depth and scale

ARCHITECTURAL COMPOSITION:
- Vertical emphasis: tall bookshelves reaching toward ceiling
- Horizontal layers: multiple shelf levels creating depth
- Perspective lines: strong vanishing point perspective
- Geometric patterns: regular spacing of shelves and furniture
- Structural elements: columns, beams, architectural framework
- Lighting geometry: dramatic shadows cast by structures

MOOD: Noir institutional atmosphere, dramatic architectural scale, contemplative scholarly environment. Silent, imposing, geometric precision.

TECHNICAL REQUIREMENTS:
- Pure black and white only - NO gray tones whatsoever
- High contrast ink illustration
- Comic book panel format
- Frank Miller style architectural composition
- Aspect ratio: 2:3 portrait
- Maximum contrast: pure blacks vs pure whites`;

/**
 * Generate Panel 5.1 via Replicate Flux 2 Pro API
 */
async function generatePanel51() {
  console.log('🏛️ Starting Panel 5.1: Library Dramatic Perspective');
  console.log('📐 Mission: Sin City baseline anchor for entire series');
  console.log('🎯 Target: ≥8.0/10 reference quality standard');

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Initialize manifest
  const manifest = {
    panelId: PANEL_CONFIG.id,
    generationTime: timestamp,
    config: PANEL_CONFIG,
    prompt: MASTER_PROMPT,
    missionCritical: "Sin City aesthetic baseline anchor",
    baselineRequirements: {
      purityTarget: "Zero gray pixels - pure B&W only",
      contrastLevel: "Maximum contrast between black and white",
      architecturalPrecision: "Mathematical perspective accuracy",
      referenceStatus: "Quality template for entire comic series"
    },
    qualityExpectations: {
      weightedAverage: PANEL_CONFIG.qualityTarget,
      sinCityStyle: 9.0,
      architecturalPrecision: 8.0,
      composition: 8.0,
      technicalQuality: 9.0,
      baselineEstablishment: 9.0
    },
    budgetAllocation: {
      estimatedCost: PANEL_CONFIG.targetCost,
      maxCost: 10.50,
      regenerationLimit: 2,
      baselinePriority: "Quality over cost for reference panel"
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
    console.log('⚫⚪ Style: Pure B&W only - zero gray tolerance');
    console.log('🏗️ Focus: Architectural precision + perspective mastery');

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
    const imageUrl = result.output;
    console.log('📥 Downloading image from:', imageUrl);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const outputPath = path.join(outputDir, 'panel-5-1-library-perspective.png');

    await fs.writeFile(outputPath, Buffer.from(imageBuffer));

    console.log('💾 Panel 5.1 saved:', outputPath);

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
      actualCost: 3.50, // Estimated, update with actual billing data if available
      baselineCandidate: true
    };

    console.log(`⏱️ Generation completed in ${duration} seconds`);
    console.log(`📊 File size: ${Math.round(Buffer.from(imageBuffer).length / 1024)}KB`);
    console.log(`💰 Estimated cost: $${manifest.results.actualCost}`);

    // Save manifest
    const manifestPath = path.join(outputDir, 'panel-5-1-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('📋 Manifest saved:', manifestPath);
    console.log('');
    console.log('🎯 Panel 5.1 Next Steps:');
    console.log('   1. Extended expert review cycle (baseline verification)');
    console.log('   2. Pure B&W pixel analysis (zero gray tolerance)');
    console.log('   3. Architectural precision assessment');
    console.log('   4. Baseline quality scoring (target: ≥8.0/10)');
    console.log('   5. Series reference status confirmation');
    console.log('');
    console.log('✅ Panel 5.1 baseline anchor ready for expert validation');

    return manifest;

  } catch (error) {
    console.error('❌ Panel 5.1 generation failed:', error.message);

    manifest.error = {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    // Save error manifest
    try {
      const outputDir = path.join(process.cwd(), 'comic', 'panels');
      await fs.mkdir(outputDir, { recursive: true });
      const manifestPath = path.join(outputDir, 'panel-5-1-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('📋 Error manifest saved:', manifestPath);
    } catch (saveError) {
      console.error('❌ Failed to save error manifest:', saveError.message);
    }

    throw error;
  }
}

/**
 * Enhanced B&W purity verification
 * Analyzes generated image for gray pixels
 */
async function verifyBWPurity(imagePath) {
  console.log('🔍 Verifying B&W purity...');

  try {
    // This would require ImageMagick integration
    // For now, return placeholder verification
    console.log('⚪⚫ B&W purity verification: REQUIRES IMAGEMAGICK');
    console.log('   Manual verification required for baseline status');

    return {
      verified: false,
      reason: "Automated verification not available - manual review required",
      recommendation: "Use ImageMagick: magick identify -unique-colors image.png"
    };
  } catch (error) {
    console.error('❌ B&W verification failed:', error.message);
    return {
      verified: false,
      error: error.message
    };
  }
}

// Export for use by parallel pipeline
module.exports = { generatePanel51, PANEL_CONFIG, MASTER_PROMPT, verifyBWPurity };

// Execute if called directly
if (require.main === module) {
  generatePanel51()
    .then(async (manifest) => {
      // Attempt B&W purity verification
      if (manifest.results && manifest.results.outputPath) {
        const purityCheck = await verifyBWPurity(manifest.results.outputPath);
        console.log('🔍 B&W Purity Check:', purityCheck);
      }

      console.log('✅ Panel 5.1 generation completed successfully');
      console.log('📐 Baseline anchor ready for expert validation');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Panel 5.1 generation failed');
      process.exit(1);
    });
}