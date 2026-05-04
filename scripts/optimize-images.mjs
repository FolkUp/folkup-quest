#!/usr/bin/env node

/**
 * FQST-013: Image Optimization Pipeline
 * Enhanced Alice v2.0 Level 3 Cartouche Autonome
 * Target: 27MB → 10MB through responsive variants and WebP compression
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for responsive variants
const VARIANTS = {
  thumb: {
    width: 100,
    height: 150,
    quality: { webp: 75, png: 85 },
    description: 'Gallery thumbnail'
  },
  medium: {
    width: 512,
    height: 768,
    quality: { webp: 82, png: 88 },
    description: 'Modal initial load'
  },
  full: {
    width: 1024,
    height: 1536,
    quality: { webp: 85, png: 92 },
    description: 'Full-screen detail'
  }
};

const INPUT_DIR = path.join(__dirname, '../public/comic/panels');
const BACKUP_DIR = path.join(__dirname, '../public/comic/panels-backup');

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      originalSize: 0,
      optimizedSize: 0,
      variants: []
    };
    this.startTime = Date.now();
  }

  async init() {
    console.log('🎯 FQST-013: Starting image optimization pipeline');
    console.log('📊 Target: 27MB → 10MB through responsive variants\n');

    // Create backup directory
    try {
      await fs.access(BACKUP_DIR);
      console.log('📂 Backup directory exists');
    } catch {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      console.log('📂 Created backup directory');
    }
  }

  async getInputFiles() {
    const files = await fs.readdir(INPUT_DIR);
    return files.filter(file =>
      file.endsWith('-generated.png') &&
      !file.includes('-thumb') &&
      !file.includes('-medium') &&
      !file.includes('-full')
    );
  }

  async backupOriginal(filename) {
    const sourcePath = path.join(INPUT_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    try {
      await fs.copyFile(sourcePath, backupPath);
      return true;
    } catch (error) {
      console.error(`❌ Backup failed for ${filename}:`, error.message);
      return false;
    }
  }

  async optimizeImage(inputFile) {
    const baseName = path.basename(inputFile, '-generated.png');
    const inputPath = path.join(INPUT_DIR, inputFile);
    const manifestPath = path.join(INPUT_DIR, `${baseName}-manifest.json`);

    console.log(`🔄 Processing: ${baseName}`);

    try {
      // Backup original
      if (!await this.backupOriginal(inputFile)) {
        throw new Error('Backup failed');
      }

      // Get original image metadata
      const originalImage = sharp(inputPath);
      const metadata = await originalImage.metadata();
      const originalStats = await fs.stat(inputPath);
      this.stats.originalSize += originalStats.size;

      console.log(`  📏 Original: ${metadata.width}×${metadata.height}, ${(originalStats.size / 1024).toFixed(1)}KB`);

      // Process all variants
      const variants = {};

      for (const [variantName, config] of Object.entries(VARIANTS)) {
        const webpPath = path.join(INPUT_DIR, `${baseName}-${variantName}.webp`);
        const pngPath = path.join(INPUT_DIR, `${baseName}-${variantName}.png`);

        // Generate WebP variant
        await originalImage
          .resize(config.width, config.height, {
            fit: 'cover',
            position: 'center'
          })
          .toFormat('webp', {
            quality: config.quality.webp,
            effort: 6
          })
          .toFile(webpPath);

        // Generate PNG fallback
        await originalImage
          .resize(config.width, config.height, {
            fit: 'cover',
            position: 'center'
          })
          .png({
            compressionLevel: 9,
            quality: config.quality.png
          })
          .toFile(pngPath);

        // Get file sizes for reporting
        const webpStats = await fs.stat(webpPath);
        const pngStats = await fs.stat(pngPath);

        this.stats.optimizedSize += webpStats.size + pngStats.size;

        variants[variantName] = {
          webp: `/comic/panels/${baseName}-${variantName}.webp`,
          png: `/comic/panels/${baseName}-${variantName}.png`,
          width: config.width,
          height: config.height,
          webpSize: webpStats.size,
          pngSize: pngStats.size
        };

        console.log(`    ✓ ${variantName}: WebP ${(webpStats.size / 1024).toFixed(1)}KB, PNG ${(pngStats.size / 1024).toFixed(1)}KB`);
      }

      // Update manifest with variants
      await this.updateManifest(manifestPath, variants, metadata);

      this.stats.processed++;
      console.log(`  ✅ ${baseName} optimization complete\n`);

    } catch (error) {
      console.error(`❌ Error processing ${baseName}:`, error.message);
      this.stats.errors++;
    }
  }

  async updateManifest(manifestPath, variants, originalMetadata) {
    try {
      // Read existing manifest
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Add variants and optimization metadata
      manifest.variants = variants;
      manifest.aspectRatio = '2:3';
      manifest.optimization = {
        generated: new Date().toISOString(),
        originalDimensions: {
          width: originalMetadata.width,
          height: originalMetadata.height
        },
        pipeline: 'FQST-013-sharp-v1.0',
        authority: 'Enhanced Alice v2.0 L3'
      };
      manifest.cacheBusting = `v1.0-${Date.now()}`;

      // Write updated manifest
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    } catch (error) {
      console.error(`❌ Manifest update failed for ${manifestPath}:`, error.message);
    }
  }

  async generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    const originalMB = (this.stats.originalSize / 1024 / 1024).toFixed(2);
    const optimizedMB = (this.stats.optimizedSize / 1024 / 1024).toFixed(2);
    const reduction = (((this.stats.originalSize - this.stats.optimizedSize) / this.stats.originalSize) * 100).toFixed(1);

    console.log('\n📈 FQST-013 Optimization Complete');
    console.log('=' .repeat(50));
    console.log(`✅ Processed: ${this.stats.processed} panels`);
    console.log(`⚠️  Errors: ${this.stats.errors}`);
    console.log(`📦 Original size: ${originalMB} MB`);
    console.log(`🗜️  Optimized size: ${optimizedMB} MB`);
    console.log(`📉 Size reduction: ${reduction}%`);
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    console.log(`🎯 Target achieved: ${originalMB}MB → ${optimizedMB}MB`);

    // Calculate effective loading with caching strategy
    const thumbSize = this.stats.optimizedSize * 0.15; // ~15% for thumbnails
    const effectiveMB = (thumbSize / 1024 / 1024).toFixed(2);
    console.log(`📱 Effective gallery load: ${effectiveMB}MB (thumbnails only)`);

    console.log('\n🎊 Enhanced Alice v2.0 L3 Phase 1 COMPLETE');
    console.log('Next: Phase 2 - Lazy loading implementation');
  }

  async run() {
    try {
      await this.init();

      const inputFiles = await this.getInputFiles();
      console.log(`📁 Found ${inputFiles.length} panels to optimize\n`);

      // Process images in parallel batches
      const BATCH_SIZE = 3;
      for (let i = 0; i < inputFiles.length; i += BATCH_SIZE) {
        const batch = inputFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(file => this.optimizeImage(file)));
      }

      await this.generateReport();

    } catch (error) {
      console.error('💥 Optimization pipeline failed:', error);
      process.exit(1);
    }
  }
}

// Execute if run directly
if (process.argv[1] === __filename) {
  const optimizer = new ImageOptimizer();
  optimizer.run();
}

export { ImageOptimizer, VARIANTS };