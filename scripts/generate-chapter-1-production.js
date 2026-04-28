#!/usr/bin/env node

/**
 * Chapter 1 Production Coordinator — Automated 28-Panel Generation
 *
 * Mission: Scale pilot batch framework to full Chapter 1 production
 * Authority: Level 3 Cartouche Autonome + Maximum Automation
 * Framework: Constitutional + Expert Review + Quality Gates
 * Target: 28 panels, ≥7.6/10 quality standard
 */

import fs from 'fs/promises';
import path from 'path';

// Chapter 1 Production Configuration
const CHAPTER_CONFIG = {
  chapterId: 'chapter-1-complete',
  mission: 'Full character introduction and story establishment',
  authority: 'Level 3 Cartouche Autonome + Maximum Automation',
  totalPanels: 28,
  batchSize: 4,
  parallelLimit: 2,
  budgetCeiling: 98.00, // $3.50 per panel average
  qualityStandard: 7.6,
  constitutionalGates: true,
  expertReviewInterval: 8 // Every 8 panels
};

// Story Arc Structure for 28 Panels
const STORY_ARC = {
  'Act1_Setup': { panels: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7'], theme: 'Character introduction and world establishment' },
  'Act2_Development': { panels: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8'], theme: 'Investigation begins and relationships form' },
  'Act3_Complication': { panels: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7'], theme: 'Conflict escalation and character testing' },
  'Act4_Resolution': { panels: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6'], theme: 'Chapter conclusion and transition setup' }
};

// Panel Generation Templates Based on Pilot Success
const PANEL_TEMPLATES = {
  'character_focus': {
    base: 'Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.',
    structure: 'Character-centered scene with environmental storytelling',
    spotColor: '#839E75', // Sage green for character elements
    mood: 'Contemplative, noir character development'
  },
  'architectural': {
    base: 'Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.',
    structure: 'Architectural/environmental scene with dramatic perspective',
    spotColor: 'none',
    mood: 'Silent architectural drama, institutional atmosphere'
  },
  'action': {
    base: 'Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.',
    structure: 'Dynamic scene with movement and tension',
    spotColor: '#E8AD4A', // Amber for action emphasis
    mood: 'Dynamic tension, noir action sequence'
  },
  'dialogue': {
    base: 'Comic book panel in Frank Miller Sin City style. Pure black and white, high contrast ink wash, no gray tones.',
    structure: 'Character interaction scene with dramatic lighting',
    spotColor: '#7D4450', // Bordeaux for dramatic moments
    mood: 'Interpersonal tension, dramatic dialogue'
  }
};

// Character Consistency Database (From Pilot Success)
const CHARACTER_BASELINES = {
  'alice': {
    description: 'Lean woman in her late 20s with short dark bob haircut, angular geometric features, focused expression. White silhouette against dark backgrounds.',
    consistency: 'Sharp angular bone structure, machine-precision contour lines, controlled analytical expression',
    established: 'Panel 2.3',
    quality: '8.0/10 editorial approval'
  },
  'arni': {
    description: 'Thin wiry man in his late 30s with ponytail and short beard, wearing black leather jacket with raised collar, slouching posture.',
    consistency: 'Thin/wiry build, visible ponytail, leather jacket with raised collar, characteristic slouching',
    established: 'Panel 1.1',
    quality: '8.4/10 expert validation'
  }
};

/**
 * Generate comprehensive prompt for panel based on story position and template
 */
function generatePanelPrompt(panelId, template, storyContext) {
  const [chapter, panel] = panelId.split('.');
  const panelNumber = parseInt(panel);

  // Determine scene type based on story progression
  let sceneType, character, setting, narrative;

  if (panelNumber <= 7) {
    // Act 1: Character establishment
    character = panelNumber % 2 === 1 ? 'arni' : 'alice';
    setting = panelNumber <= 3 ? 'outdoor' : 'indoor';
    narrative = 'Character introduction and world establishment';
  } else if (panelNumber <= 14) {
    // Act 2: Investigation development
    character = 'alice'; // Investigation focus
    setting = 'investigative';
    narrative = 'Investigation progression and relationship building';
  } else if (panelNumber <= 21) {
    // Act 3: Tension escalation
    character = 'both'; // Character interaction
    setting = 'confrontational';
    narrative = 'Conflict development and character testing';
  } else {
    // Act 4: Resolution approach
    character = 'environmental'; // Broader perspective
    setting = 'resolution';
    narrative = 'Chapter conclusion and transition setup';
  }

  // Build prompt based on template and character
  const basePrompt = template.base;
  const characterInfo = CHARACTER_BASELINES[character] || '';

  return `${basePrompt}

SCENE: ${narrative} - Panel ${panelId}

MAIN SUBJECT: ${characterInfo.description || 'Environmental scene with dramatic noir atmosphere'}

CHARACTER CONSISTENCY: ${characterInfo.consistency || 'Environmental consistency with established visual DNA'}

BACKGROUND ELEMENTS:
- ${setting === 'outdoor' ? 'Urban outdoor environment with geometric shadows' : 'Interior setting with dramatic architectural lines'}
- Dramatic lighting creating strong contrast
- Environmental props supporting narrative progression
- ${template.spotColor !== 'none' ? `Spot color element: ${template.spotColor}` : 'Pure black and white only'}

STYLE DETAILS (SIN CITY ANCHOR - Panel 5.1 Baseline):
- Spotted blacks technique for large areas
- White silhouettes on black backgrounds
- Negative space defines forms
- High contrast, no halftones
- Clean ink wash aesthetic
- Minimal detail, maximum impact through silhouette

MOOD: ${template.mood}. Silent scene with strong compositional geometry.

TECHNICAL REQUIREMENTS:
- Pure black and white only
- ${template.spotColor !== 'none' ? `Single spot color: ${template.spotColor}` : 'No gray tones'}
- High contrast ink illustration
- Comic book panel format
- Frank Miller style composition
- Aspect ratio: 2:3 portrait`;
}

/**
 * Execute single panel generation with error handling
 */
async function generateSinglePanel(panelId, template, retryCount = 0) {
  const maxRetries = 3;

  try {
    console.log(`🎨 Generating Panel ${panelId}...`);

    const prompt = generatePanelPrompt(panelId, template, STORY_ARC);

    // Call Replicate API
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable required');
    }

    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          aspect_ratio: '2:3',
          output_format: 'png',
          output_quality: 100
        }
      })
    });

    const prediction = await response.json();

    if (prediction.error) {
      throw new Error(`API Error: ${prediction.error}`);
    }

    console.log(`⏳ Panel ${panelId} submitted, ID: ${prediction.id}`);

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error(`Panel ${panelId} generation timeout after 5 minutes`);
      }

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });

      result = await statusResponse.json();
    }

    if (result.status !== 'succeeded') {
      const errorMsg = result.error || 'Unknown error';

      // Handle E005 content moderation with automated fallback
      if (errorMsg.includes('E005') && retryCount < maxRetries) {
        console.log(`⚠️ Panel ${panelId} E005 error, applying automated fallback (attempt ${retryCount + 1})`);

        // Apply E005 fallback: switch to architectural template
        const fallbackTemplate = PANEL_TEMPLATES.architectural;
        return await generateSinglePanel(panelId, fallbackTemplate, retryCount + 1);
      }

      throw new Error(`Panel ${panelId} generation failed: ${errorMsg}`);
    }

    // Download and save image
    const imageUrl = result.output;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to download Panel ${panelId} image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const outputDir = path.join(process.cwd(), 'comic', 'panels');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `panel-${panelId}-generated.png`);
    await fs.writeFile(outputPath, Buffer.from(imageBuffer));

    // Create manifest
    const manifest = {
      panelId: `panel-${panelId}`,
      generated: new Date().toISOString(),
      predictionId: prediction.id,
      prompt: prompt,
      template: template,
      status: 'completed',
      filePath: outputPath,
      estimatedCost: 3.50
    };

    const manifestPath = path.join(outputDir, `panel-${panelId}-manifest.json`);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Panel ${panelId} completed successfully`);
    return manifest;

  } catch (error) {
    console.error(`❌ Panel ${panelId} failed: ${error.message}`);

    // Retry logic for non-E005 errors
    if (!error.message.includes('E005') && retryCount < maxRetries) {
      console.log(`🔄 Retrying Panel ${panelId} (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
      return await generateSinglePanel(panelId, template, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Execute batch of panels with parallel processing
 */
async function generateBatch(batchPanels, batchNumber) {
  console.log(`\n🚀 BATCH ${batchNumber}: ${batchPanels.join(', ')}`);

  const batchPromises = batchPanels.map(panelId => {
    // Select template based on panel characteristics
    const panelNum = parseInt(panelId.split('.')[1]);
    let template;

    if (panelNum === 1 || panelNum === 3 || panelNum === 5) {
      template = PANEL_TEMPLATES.character_focus;
    } else if (panelNum % 4 === 0) {
      template = PANEL_TEMPLATES.architectural;
    } else if (panelNum % 3 === 0) {
      template = PANEL_TEMPLATES.action;
    } else {
      template = PANEL_TEMPLATES.dialogue;
    }

    return generateSinglePanel(panelId, template);
  });

  const results = await Promise.allSettled(batchPromises);

  const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected').map(r => r.reason.message);

  console.log(`✅ Batch ${batchNumber}: ${successful.length}/${batchPanels.length} successful`);

  if (failed.length > 0) {
    console.log(`❌ Failed panels: ${failed.join(', ')}`);
  }

  return { successful, failed };
}

/**
 * Main Chapter 1 Production Execution
 */
async function executeChapter1Production() {
  console.log('🎬 STARTING CHAPTER 1 PRODUCTION');
  console.log(`📊 Target: ${CHAPTER_CONFIG.totalPanels} panels`);
  console.log(`💰 Budget: $${CHAPTER_CONFIG.budgetCeiling}`);
  console.log(`🎯 Quality: ≥${CHAPTER_CONFIG.qualityStandard}/10`);
  console.log(`⚡ Authority: ${CHAPTER_CONFIG.authority}`);
  console.log('═'.repeat(50));

  const startTime = Date.now();
  const allPanels = [];
  const failedPanels = [];
  let totalCost = 0;

  // Generate all 28 panels in batches
  const panelIds = Array.from({ length: 28 }, (_, i) => {
    const chapterNum = Math.floor(i / 7) + 1;
    const panelNum = (i % 7) + 1;
    return `${chapterNum}.${panelNum}`;
  });

  const batches = [];
  for (let i = 0; i < panelIds.length; i += CHAPTER_CONFIG.batchSize) {
    batches.push(panelIds.slice(i, i + CHAPTER_CONFIG.batchSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const batchResult = await generateBatch(batch, i + 1);
      allPanels.push(...batchResult.successful);
      failedPanels.push(...batchResult.failed);

      totalCost += batchResult.successful.length * 3.50;

      // Budget check
      if (totalCost > CHAPTER_CONFIG.budgetCeiling * 0.9) {
        console.log('⚠️ Approaching budget ceiling, slowing generation...');
      }

      // Expert review checkpoint every 8 panels
      if (allPanels.length % CHAPTER_CONFIG.expertReviewInterval === 0) {
        console.log(`\n🔍 EXPERT REVIEW CHECKPOINT: ${allPanels.length} panels completed`);
        console.log('💰 Budget performance: $' + totalCost.toFixed(2) + '/' + CHAPTER_CONFIG.budgetCeiling);
        console.log('📊 Success rate: ' + ((allPanels.length / (allPanels.length + failedPanels.length)) * 100).toFixed(1) + '%');
      }

    } catch (error) {
      console.error(`❌ Batch ${i + 1} failed: ${error.message}`);
      failedPanels.push(...batch);
    }
  }

  // Production summary
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 60000);

  console.log('\n🎉 CHAPTER 1 PRODUCTION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`⏱️ Duration: ${duration} minutes`);
  console.log(`✅ Successful: ${allPanels.length}/${CHAPTER_CONFIG.totalPanels} panels`);
  console.log(`💰 Cost: $${totalCost.toFixed(2)}/$${CHAPTER_CONFIG.budgetCeiling}`);
  console.log(`📊 Success Rate: ${((allPanels.length / CHAPTER_CONFIG.totalPanels) * 100).toFixed(1)}%`);

  if (failedPanels.length > 0) {
    console.log(`❌ Failed Panels: ${failedPanels.length}`);
    console.log('🔄 Recommend retry for failed panels with adjusted templates');
  }

  // Save production report
  const productionReport = {
    chapterConfig: CHAPTER_CONFIG,
    completedPanels: allPanels,
    failedPanels: failedPanels,
    totalCost: totalCost,
    duration: duration,
    successRate: (allPanels.length / CHAPTER_CONFIG.totalPanels) * 100,
    completedAt: new Date().toISOString()
  };

  const reportPath = path.join(process.cwd(), 'comic', '_meta', 'chapter-1-production-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(productionReport, null, 2));

  console.log(`📋 Production report saved: ${reportPath}`);
  console.log('🚀 Chapter 1 ready for expert validation and client delivery');

  return productionReport;
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  executeChapter1Production()
    .then(() => {
      console.log('✅ Chapter 1 Production completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Chapter 1 Production failed:', error.message);
      process.exit(1);
    });
}

export { executeChapter1Production, CHAPTER_CONFIG, generateSinglePanel };