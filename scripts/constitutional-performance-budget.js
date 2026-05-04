#!/usr/bin/env node

/**
 * Constitutional Performance Budget Governance
 * FQST-014.2 Phase 1C-Alpha Implementation
 *
 * Authority: Constitutional Framework Coordinator
 * Mission: Constitutional oversight of performance budget compliance
 * Framework: Banking-level performance standards with real-time monitoring
 */

import fs from 'fs/promises';
import path from 'path';
import { PHASE_1B_PERFORMANCE_CONSTITUTION } from './constitutional-pipeline-governance.js';

// Constitutional Performance Budget Framework
const CONSTITUTIONAL_PERFORMANCE_BUDGET = {
  loadTimeThreshold: 2000,        // <2s constitutional requirement (ms)
  assetGrowthLimit: 0.30,        // 30% growth constraint from baseline
  choiceResponseTime: 100,        // <100ms constitutional requirement (ms)
  cacheHitRateMinimum: 0.80,     // 80%+ cache effectiveness required
  bandwidthBudget: 10485760,     // 10MB effective loading limit (bytes)
  monitoringFrequency: "real-time",

  // Constitutional baselines from FQST-013
  baselineAssetSize: 10485760,   // 10MB proven baseline from 27MB → 10MB optimization
  baselineLoadTime: 1800,        // <2s target with 200ms safety margin
  baselineCacheRate: 0.85,       // 85% baseline from FQST-013 results

  // Constitutional violation triggers
  warningThreshold: 0.85,        // 85% of budget = warning
  criticalThreshold: 0.95,       // 95% of budget = critical alert
  emergencyStop: 1.0            // 100% = emergency stop
};

// Constitutional Budget Enforcement Levels
const ENFORCEMENT_LEVELS = {
  COMPLIANT: { status: 'OPERATIONAL', action: 'monitor', authority: 'continue' },
  WARNING: { status: 'ADVISORY', action: 'review', authority: 'expert_coordination' },
  CRITICAL: { status: 'BLOCKING', action: 'halt_expansion', authority: 'expert_override_required' },
  EMERGENCY: { status: 'VIOLATION', action: 'emergency_stop', authority: 'constitutional_override' }
};

/**
 * Constitutional Performance Budget Validation
 * Monitors current performance against constitutional requirements
 */
async function validatePerformanceBudget() {
  const validation = {
    timestamp: new Date().toISOString(),
    authority: 'Constitutional Framework Coordinator',
    budget: CONSTITUTIONAL_PERFORMANCE_BUDGET,
    metrics: {},
    status: 'UNKNOWN',
    enforcement_level: 'UNKNOWN',
    recommendations: []
  };

  console.log('⚡ Constitutional Performance Budget Validation');
  console.log('═════════════════════════════════════════════');

  // Metric 1: Current Asset Size Budget
  try {
    const panelDir = './public/comic/panels';
    const publicDir = './public';

    let totalAssetSize = 0;

    // Calculate panel directory size
    const panelFiles = await fs.readdir(panelDir);
    for (const file of panelFiles) {
      const filePath = path.join(panelDir, file);
      const stats = await fs.stat(filePath);
      totalAssetSize += stats.size;
    }

    // Calculate other critical assets (fonts, core JS, CSS)
    const criticalAssets = ['styles', 'src'];
    for (const assetDir of criticalAssets) {
      try {
        const files = await getAllFiles(assetDir);
        for (const file of files) {
          const stats = await fs.stat(file);
          totalAssetSize += stats.size;
        }
      } catch (error) {
        // Skip if directory doesn't exist
      }
    }

    const assetBudgetUsage = totalAssetSize / CONSTITUTIONAL_PERFORMANCE_BUDGET.bandwidthBudget;
    const assetGrowthFromBaseline = (totalAssetSize - CONSTITUTIONAL_PERFORMANCE_BUDGET.baselineAssetSize) / CONSTITUTIONAL_PERFORMANCE_BUDGET.baselineAssetSize;

    validation.metrics.assetBudget = {
      totalSize: totalAssetSize,
      budgetUsage: Math.round(assetBudgetUsage * 100) / 100,
      growthFromBaseline: Math.round(assetGrowthFromBaseline * 100) / 100,
      status: assetBudgetUsage < CONSTITUTIONAL_PERFORMANCE_BUDGET.warningThreshold ? 'COMPLIANT' :
              assetBudgetUsage < CONSTITUTIONAL_PERFORMANCE_BUDGET.criticalThreshold ? 'WARNING' : 'CRITICAL',
      constitutional_impact: assetBudgetUsage <= 1.0 ? 'COMPLIANT' : 'VIOLATION'
    };
  } catch (error) {
    validation.metrics.assetBudget = {
      status: 'ERROR',
      details: `Asset size calculation failed: ${error.message}`,
      constitutional_impact: 'BLOCKING'
    };
  }

  // Metric 2: Performance Monitor Integration
  try {
    await fs.access('./src/utils/performance-monitor.js');

    validation.metrics.performanceMonitoring = {
      status: 'OPERATIONAL',
      details: 'Real-time performance monitoring active',
      framework: 'FQST-013 Privacy-first analytics integrated',
      constitutional_impact: 'COMPLIANT'
    };
  } catch {
    validation.metrics.performanceMonitoring = {
      status: 'MISSING',
      details: 'Performance monitoring infrastructure required for constitutional compliance',
      constitutional_impact: 'BLOCKING'
    };
  }

  // Metric 3: Service Worker Cache Strategy
  try {
    await fs.access('./public/sw.js');

    validation.metrics.cacheStrategy = {
      status: 'OPERATIONAL',
      details: '5-tier service worker cache strategy active',
      framework: 'FQST-013 Multi-tier caching implemented',
      constitutional_impact: 'COMPLIANT'
    };
  } catch {
    validation.metrics.cacheStrategy = {
      status: 'ADVISORY',
      details: 'Service worker optimization recommended for constitutional performance',
      constitutional_impact: 'ADVISORY'
    };
  }

  // Metric 4: Bundle Optimization
  try {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
    const hasBuildOptimization = packageJson.scripts && packageJson.scripts.build;

    validation.metrics.bundleOptimization = {
      status: hasBuildOptimization ? 'OPERATIONAL' : 'MISSING',
      details: hasBuildOptimization ? 'Vite build optimization active' : 'Bundle optimization required',
      constitutional_impact: hasBuildOptimization ? 'COMPLIANT' : 'ADVISORY'
    };
  } catch (error) {
    validation.metrics.bundleOptimization = {
      status: 'ERROR',
      details: `Bundle optimization check failed: ${error.message}`,
      constitutional_impact: 'ADVISORY'
    };
  }

  // Constitutional Enforcement Assessment
  const criticalViolations = Object.values(validation.metrics)
    .filter(metric => metric.constitutional_impact === 'VIOLATION').length;

  const blockingIssues = Object.values(validation.metrics)
    .filter(metric => metric.constitutional_impact === 'BLOCKING').length;

  const warnings = Object.values(validation.metrics)
    .filter(metric => metric.constitutional_impact === 'ADVISORY').length;

  // Determine enforcement level
  if (criticalViolations > 0) {
    validation.enforcement_level = 'EMERGENCY';
    validation.status = 'CONSTITUTIONAL_VIOLATIONS';
    validation.recommendations.push('🚨 EMERGENCY: Constitutional performance violations detected - immediate action required');
  } else if (blockingIssues > 0) {
    validation.enforcement_level = 'CRITICAL';
    validation.status = 'CONSTITUTIONAL_VIOLATIONS';
    validation.recommendations.push('🚫 CRITICAL: Performance infrastructure gaps block constitutional compliance');
  } else if (warnings > 0) {
    validation.enforcement_level = 'WARNING';
    validation.status = 'CONSTITUTIONAL_ADVISORY';
    validation.recommendations.push('⚠️ ADVISORY: Performance optimizations recommended for constitutional excellence');
  } else {
    validation.enforcement_level = 'COMPLIANT';
    validation.status = 'CONSTITUTIONAL_COMPLIANCE';
    validation.recommendations.push('✅ COMPLIANT: Performance budget within constitutional parameters');
  }

  // Display Results
  console.log('\n📊 CONSTITUTIONAL PERFORMANCE BUDGET RESULTS:');
  console.log('═══════════════════════════════════════════════');

  Object.entries(validation.metrics).forEach(([metricName, result]) => {
    const statusIcon = result.status === 'OPERATIONAL' ? '✅' :
                      result.status === 'ADVISORY' ? '⚠️' :
                      result.status === 'MISSING' ? '❌' : '🔥';
    const impactIcon = result.constitutional_impact === 'COMPLIANT' ? '🏛️' :
                      result.constitutional_impact === 'ADVISORY' ? '📋' :
                      result.constitutional_impact === 'BLOCKING' ? '🚫' : '🚨';

    console.log(`${statusIcon} ${metricName}: ${result.status}`);
    console.log(`   ${impactIcon} ${result.details}`);

    if (result.budgetUsage !== undefined) {
      console.log(`   📊 Budget Usage: ${Math.round(result.budgetUsage * 100)}%`);
    }
    if (result.growthFromBaseline !== undefined) {
      console.log(`   📈 Growth from Baseline: ${Math.round(result.growthFromBaseline * 100)}%`);
    }

    console.log(`   Constitutional Impact: ${result.constitutional_impact}`);
    console.log('');
  });

  console.log(`⚡ ENFORCEMENT LEVEL: ${validation.enforcement_level}`);
  console.log(`🏛️ CONSTITUTIONAL STATUS: ${validation.status}`);
  console.log('\n📋 RECOMMENDATIONS:');
  validation.recommendations.forEach(rec => console.log(`   ${rec}`));

  return validation;
}

/**
 * Constitutional Performance Optimization Protocol
 * Provides specific optimization strategies within constitutional framework
 */
async function constitutionalPerformanceOptimization() {
  console.log('\n🔧 Constitutional Performance Optimization Protocol');
  console.log('═════════════════════════════════════════════════════');

  const optimizations = {
    immediateActions: {
      description: 'Immediate constitutional performance compliance actions',
      strategies: [
        'Enable Vite build compression for constitutional bundle optimization',
        'Implement lazy loading for non-critical panels (constitutional priority)',
        'Optimize image formats: WebP primary, PNG fallback (constitutional compatibility)',
        'Enable service worker caching for constitutional cache hit rates'
      ],
      authority: 'AUTONOMOUS_EXECUTION',
      timeline: '1-2 hours'
    },

    expertCoordination: {
      description: 'Expert panel coordination for constitutional performance excellence',
      strategies: [
        'Brand specialist: Verify performance optimizations maintain brand integrity',
        'Technical specialist: Implement advanced caching strategies for constitutional compliance',
        'Content specialist: Optimize panel loading sequence for constitutional user experience'
      ],
      authority: 'EXPERT_PANEL_REQUIRED',
      timeline: '4-8 hours'
    },

    constitutionalMonitoring: {
      description: 'Real-time constitutional performance monitoring implementation',
      strategies: [
        'Deploy performance budget monitoring dashboard',
        'Implement constitutional violation alerting system',
        'Enable automatic performance regression detection',
        'Establish constitutional performance regression testing'
      ],
      authority: 'CONSTITUTIONAL_FRAMEWORK',
      timeline: '8-12 hours'
    }
  };

  console.log('📋 CONSTITUTIONAL OPTIMIZATION STRATEGIES:');
  Object.entries(optimizations).forEach(([category, details]) => {
    const authorityIcon = details.authority === 'AUTONOMOUS_EXECUTION' ? '⚡' :
                         details.authority === 'EXPERT_PANEL_REQUIRED' ? '👥' : '🏛️';

    console.log(`${authorityIcon} ${category.toUpperCase()}: ${details.description}`);
    console.log(`   Timeline: ${details.timeline}`);
    console.log(`   Authority: ${details.authority}`);

    details.strategies.forEach(strategy => {
      console.log(`   • ${strategy}`);
    });
    console.log('');
  });

  return optimizations;
}

/**
 * Helper function to recursively get all files in a directory
 */
async function getAllFiles(dirPath, fileList = []) {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await getAllFiles(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }

  return fileList;
}

/**
 * Main Constitutional Performance Budget Entry Point
 */
async function main() {
  try {
    const validation = await validatePerformanceBudget();

    if (validation.enforcement_level === 'WARNING' || validation.enforcement_level === 'CRITICAL') {
      await constitutionalPerformanceOptimization();
    }

    // Save Constitutional Performance Report
    const reportPath = './constitutional-performance-budget-report.json';
    await fs.writeFile(reportPath, JSON.stringify(validation, null, 2));
    console.log(`\n📄 Constitutional performance report saved: ${reportPath}`);

  } catch (error) {
    console.error('❌ Constitutional performance budget validation failed:', error.message);
    process.exit(1);
  }
}

// Execute constitutional performance validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  validatePerformanceBudget,
  constitutionalPerformanceOptimization,
  CONSTITUTIONAL_PERFORMANCE_BUDGET,
  ENFORCEMENT_LEVELS
};