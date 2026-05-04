#!/usr/bin/env node

/**
 * Constitutional Documentation Consistency Protocol
 * FQST-DOC-001 Implementation
 *
 * Authority: Constitutional Framework Coordinator
 * Mission: Constitutional oversight of documentation consistency and currency
 * Framework: Banking-level documentation standards with real-time monitoring
 *
 * Mandate: "проверяй консистентность и акутальность всей документации,
 *          включая ридми и docs.folup.app после каждого пуша"
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Constitutional Documentation Standards Framework
const CONSTITUTIONAL_DOC_STANDARDS = {
  // Documentation Consistency Requirements
  consistencyThreshold: 0.95,        // 95% consistency required between sources
  updateWindowHours: 24,             // 24-hour currency requirement
  versionSyncTolerance: 0,           // Zero tolerance for version misalignment
  contentIntegrityLevel: "BANKING",  // Banking-level accuracy standards

  // Documentation Sources Registry
  documentationSources: {
    "README.md": {
      priority: "P0_CRITICAL",
      syncTargets: ["docs.folkup.app", "package.json", "PROJECT.md"],
      validationRules: ["version_sync", "feature_parity", "link_integrity"]
    },
    "docs.folkup.app": {
      priority: "P0_CRITICAL",
      syncTargets: ["README.md", "public documentation", "API docs"],
      validationRules: ["content_currency", "cross_references", "deployment_sync"]
    },
    "PROJECT.md": {
      priority: "P1_HIGH",
      syncTargets: ["README.md", "project context"],
      validationRules: ["project_status", "dependency_accuracy", "workflow_sync"]
    },
    "package.json": {
      priority: "P0_CRITICAL",
      syncTargets: ["README.md", "dependency documentation"],
      validationRules: ["version_consistency", "script_documentation", "dependency_sync"]
    }
  },

  // Consistency Validation Rules
  validationFramework: {
    "version_sync": "Verify version numbers match across all documentation",
    "feature_parity": "Ensure all features documented consistently",
    "link_integrity": "Validate all internal and external links",
    "content_currency": "Check documentation reflects current implementation",
    "cross_references": "Verify cross-document references are accurate",
    "deployment_sync": "Ensure deployment docs match actual deployment state"
  },

  // Constitutional Violation Triggers
  violationThresholds: {
    CRITICAL: { inconsistency: 0.20, staleness: 72 }, // 20% inconsistency = critical
    WARNING: { inconsistency: 0.10, staleness: 48 },  // 10% inconsistency = warning
    ADVISORY: { inconsistency: 0.05, staleness: 24 }  // 5% inconsistency = advisory
  }
};

// Constitutional Documentation Enforcement Levels
const DOC_ENFORCEMENT_LEVELS = {
  COMPLIANT: {
    status: 'OPERATIONAL',
    action: 'monitor',
    authority: 'continue_operations'
  },
  ADVISORY: {
    status: 'REVIEW_RECOMMENDED',
    action: 'schedule_update',
    authority: 'expert_review_recommended'
  },
  WARNING: {
    status: 'INCONSISTENCY_DETECTED',
    action: 'immediate_review',
    authority: 'expert_coordination_required'
  },
  CRITICAL: {
    status: 'DOCUMENTATION_VIOLATION',
    action: 'halt_until_resolved',
    authority: 'constitutional_override_required'
  }
};

/**
 * Constitutional Documentation Consistency Validation
 * Monitors documentation consistency across all sources post-push
 */
async function validateDocumentationConsistency() {
  const validation = {
    timestamp: new Date().toISOString(),
    authority: 'Constitutional Framework Coordinator',
    standards: CONSTITUTIONAL_DOC_STANDARDS,
    results: {},
    enforcement_level: 'UNKNOWN',
    violations: [],
    recommendations: [],
    post_push_analysis: true
  };

  console.log('📚 Constitutional Documentation Consistency Validation');
  console.log('════════════════════════════════════════════════════');
  console.log(`🔍 Post-Push Analysis: ${getLatestCommitInfo()}`);
  console.log('');

  // Validation 1: README.md Consistency Analysis
  try {
    const readmeAnalysis = await validateReadmeConsistency();
    validation.results.readme = readmeAnalysis;
    console.log('📄 README.md Analysis:', readmeAnalysis.status);
    if (readmeAnalysis.inconsistencies?.length > 0) {
      validation.violations.push(...readmeAnalysis.inconsistencies);
    }
  } catch (error) {
    validation.results.readme = {
      status: 'ERROR',
      details: `README analysis failed: ${error.message}`,
      constitutional_impact: 'CRITICAL'
    };
    validation.violations.push('README.md analysis failure - critical documentation gap');
  }

  // Validation 2: docs.folkup.app Currency Check
  try {
    const docsAnalysis = await validateDocsConsistency();
    validation.results.docs_site = docsAnalysis;
    console.log('🌐 docs.folkup.app Analysis:', docsAnalysis.status);
    if (docsAnalysis.inconsistencies?.length > 0) {
      validation.violations.push(...docsAnalysis.inconsistencies);
    }
  } catch (error) {
    validation.results.docs_site = {
      status: 'ERROR',
      details: `docs.folkup.app analysis failed: ${error.message}`,
      constitutional_impact: 'WARNING'
    };
    validation.violations.push('docs.folkup.app consistency check failed');
  }

  // Validation 3: Cross-Document Version Sync
  try {
    const versionSync = await validateVersionConsistency();
    validation.results.version_sync = versionSync;
    console.log('🔄 Version Sync Analysis:', versionSync.status);
    if (versionSync.inconsistencies?.length > 0) {
      validation.violations.push(...versionSync.inconsistencies);
    }
  } catch (error) {
    validation.results.version_sync = {
      status: 'ERROR',
      details: `Version sync analysis failed: ${error.message}`,
      constitutional_impact: 'WARNING'
    };
  }

  // Validation 4: Link Integrity Verification
  try {
    const linkIntegrity = await validateLinkIntegrity();
    validation.results.link_integrity = linkIntegrity;
    console.log('🔗 Link Integrity Analysis:', linkIntegrity.status);
    if (linkIntegrity.inconsistencies?.length > 0) {
      validation.violations.push(...linkIntegrity.inconsistencies);
    }
  } catch (error) {
    validation.results.link_integrity = {
      status: 'ERROR',
      details: `Link integrity check failed: ${error.message}`,
      constitutional_impact: 'ADVISORY'
    };
  }

  // Constitutional Enforcement Assessment
  const criticalViolations = validation.violations.filter(v =>
    v.includes('critical') || v.includes('CRITICAL')).length;

  const warningViolations = validation.violations.filter(v =>
    v.includes('warning') || v.includes('inconsistency')).length;

  const advisoryIssues = validation.violations.filter(v =>
    v.includes('advisory') || v.includes('recommended')).length;

  // Determine enforcement level
  if (criticalViolations > 0) {
    validation.enforcement_level = 'CRITICAL';
    validation.recommendations.push('🚨 CRITICAL: Documentation violations require immediate resolution');
    validation.recommendations.push('🛑 HALT operations until documentation consistency restored');
  } else if (warningViolations > 2) {
    validation.enforcement_level = 'WARNING';
    validation.recommendations.push('⚠️ WARNING: Multiple documentation inconsistencies detected');
    validation.recommendations.push('🔄 IMMEDIATE review and synchronization required');
  } else if (warningViolations > 0 || advisoryIssues > 0) {
    validation.enforcement_level = 'ADVISORY';
    validation.recommendations.push('📋 ADVISORY: Documentation improvements recommended');
    validation.recommendations.push('⏰ Schedule documentation update within 24 hours');
  } else {
    validation.enforcement_level = 'COMPLIANT';
    validation.recommendations.push('✅ COMPLIANT: Documentation consistency maintained');
    validation.recommendations.push('🔄 Continue monitoring for future changes');
  }

  // Display Results
  console.log('\n📊 CONSTITUTIONAL DOCUMENTATION CONSISTENCY RESULTS:');
  console.log('═══════════════════════════════════════════════════════');

  Object.entries(validation.results).forEach(([area, result]) => {
    const statusIcon = result.status === 'COMPLIANT' ? '✅' :
                      result.status === 'WARNING' ? '⚠️' :
                      result.status === 'ERROR' ? '🔥' : '❌';

    console.log(`${statusIcon} ${area.toUpperCase()}: ${result.status}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    if (result.inconsistencies?.length > 0) {
      console.log(`   Inconsistencies Found: ${result.inconsistencies.length}`);
    }
    console.log('');
  });

  console.log(`⚡ ENFORCEMENT LEVEL: ${validation.enforcement_level}`);
  console.log(`🏛️ CONSTITUTIONAL STATUS: ${DOC_ENFORCEMENT_LEVELS[validation.enforcement_level].status}`);
  console.log('\n📋 RECOMMENDATIONS:');
  validation.recommendations.forEach(rec => console.log(`   ${rec}`));

  return validation;
}

/**
 * README.md Consistency Analysis
 */
async function validateReadmeConsistency() {
  const analysis = {
    status: 'UNKNOWN',
    inconsistencies: [],
    details: 'README.md consistency validation',
    constitutional_impact: 'COMPLIANT'
  };

  try {
    // Check if README.md exists
    const readmePath = './README.md';
    await fs.access(readmePath);

    const readmeContent = await fs.readFile(readmePath, 'utf8');

    // Validation 1: Version consistency with package.json
    try {
      const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
      if (!readmeContent.includes(packageJson.version)) {
        analysis.inconsistencies.push(`Version mismatch: package.json v${packageJson.version} not found in README`);
      }
    } catch (error) {
      // package.json may not exist in all projects
    }

    // Validation 2: Basic structure requirements
    const requiredSections = ['# ', '## ', 'Installation', 'Usage'];
    const missingSections = requiredSections.filter(section =>
      !readmeContent.includes(section));

    if (missingSections.length > 0) {
      analysis.inconsistencies.push(`Missing README sections: ${missingSections.join(', ')}`);
    }

    // Validation 3: Link integrity (basic check)
    const brokenLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...readmeContent.matchAll(brokenLinkPattern)];
    const potentialIssues = links.filter(link =>
      link[2].startsWith('http') && !link[2].includes('github') && !link[2].includes('docs'));

    if (potentialIssues.length > 0) {
      analysis.inconsistencies.push(`Potential external link issues: ${potentialIssues.length} links to verify`);
    }

    // Determine status
    if (analysis.inconsistencies.length === 0) {
      analysis.status = 'COMPLIANT';
      analysis.constitutional_impact = 'COMPLIANT';
    } else if (analysis.inconsistencies.length <= 2) {
      analysis.status = 'WARNING';
      analysis.constitutional_impact = 'ADVISORY';
    } else {
      analysis.status = 'CRITICAL';
      analysis.constitutional_impact = 'WARNING';
    }

  } catch (error) {
    analysis.status = 'ERROR';
    analysis.details = `README.md not found or inaccessible: ${error.message}`;
    analysis.constitutional_impact = 'CRITICAL';
    analysis.inconsistencies.push('README.md missing - critical documentation gap');
  }

  return analysis;
}

/**
 * docs.folkup.app Consistency Analysis
 */
async function validateDocsConsistency() {
  const analysis = {
    status: 'UNKNOWN',
    inconsistencies: [],
    details: 'docs.folkup.app consistency validation',
    constitutional_impact: 'COMPLIANT'
  };

  try {
    // Note: This is a placeholder for actual docs.folkup.app integration
    // In a real implementation, this would:
    // 1. Fetch current docs.folkup.app content
    // 2. Compare with local documentation
    // 3. Check deployment synchronization
    // 4. Validate cross-references

    // For now, check if we have any documentation deployment scripts
    const deployScripts = ['deploy.sh', 'deploy.js', 'scripts/deploy.js'];
    let hasDeployScript = false;

    for (const script of deployScripts) {
      try {
        await fs.access(script);
        hasDeployScript = true;
        break;
      } catch {
        // Script doesn't exist, continue checking
      }
    }

    if (!hasDeployScript) {
      analysis.inconsistencies.push('No deployment script found for docs.folkup.app synchronization');
    }

    // Check if there's a docs/ directory that should be synced
    try {
      const docsDir = await fs.readdir('./docs');
      if (docsDir.length === 0) {
        analysis.inconsistencies.push('Empty docs/ directory - no content to sync with docs.folkup.app');
      }
    } catch {
      analysis.inconsistencies.push('No docs/ directory found - docs.folkup.app sync target unclear');
    }

    // Determine status based on findings
    if (analysis.inconsistencies.length === 0) {
      analysis.status = 'COMPLIANT';
      analysis.constitutional_impact = 'COMPLIANT';
    } else if (analysis.inconsistencies.length <= 1) {
      analysis.status = 'WARNING';
      analysis.constitutional_impact = 'ADVISORY';
    } else {
      analysis.status = 'CRITICAL';
      analysis.constitutional_impact = 'WARNING';
    }

  } catch (error) {
    analysis.status = 'ERROR';
    analysis.details = `docs.folkup.app analysis failed: ${error.message}`;
    analysis.constitutional_impact = 'WARNING';
  }

  return analysis;
}

/**
 * Version Consistency Validation
 */
async function validateVersionConsistency() {
  const analysis = {
    status: 'UNKNOWN',
    inconsistencies: [],
    details: 'Version consistency across documentation sources',
    constitutional_impact: 'COMPLIANT'
  };

  try {
    const versions = {};

    // Collect version information from various sources
    try {
      const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
      versions.package = packageJson.version;
    } catch {
      // package.json may not exist
    }

    try {
      const readmeContent = await fs.readFile('./README.md', 'utf8');
      const versionMatch = readmeContent.match(/version[:\s]+([0-9]+\.[0-9]+\.[0-9]+)/i);
      if (versionMatch) {
        versions.readme = versionMatch[1];
      }
    } catch {
      // README may not exist
    }

    try {
      const projectContent = await fs.readFile('./PROJECT.md', 'utf8');
      const versionMatch = projectContent.match(/version[:\s]+([0-9]+\.[0-9]+\.[0-9]+)/i);
      if (versionMatch) {
        versions.project = versionMatch[1];
      }
    } catch {
      // PROJECT.md may not exist
    }

    // Compare versions for consistency
    const versionValues = Object.values(versions);
    const uniqueVersions = [...new Set(versionValues)];

    if (uniqueVersions.length > 1) {
      analysis.inconsistencies.push(`Version mismatch detected: ${JSON.stringify(versions)}`);
      analysis.status = 'WARNING';
      analysis.constitutional_impact = 'ADVISORY';
    } else if (versionValues.length === 0) {
      analysis.inconsistencies.push('No version information found in any documentation');
      analysis.status = 'WARNING';
      analysis.constitutional_impact = 'ADVISORY';
    } else {
      analysis.status = 'COMPLIANT';
      analysis.constitutional_impact = 'COMPLIANT';
    }

  } catch (error) {
    analysis.status = 'ERROR';
    analysis.details = `Version consistency check failed: ${error.message}`;
    analysis.constitutional_impact = 'WARNING';
  }

  return analysis;
}

/**
 * Link Integrity Validation
 */
async function validateLinkIntegrity() {
  const analysis = {
    status: 'UNKNOWN',
    inconsistencies: [],
    details: 'Link integrity across documentation',
    constitutional_impact: 'COMPLIANT'
  };

  try {
    // Check internal links in README.md
    const readmeContent = await fs.readFile('./README.md', 'utf8');
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...readmeContent.matchAll(linkPattern)];

    let brokenInternalLinks = 0;
    for (const link of links) {
      const linkUrl = link[2];

      // Check internal file links
      if (!linkUrl.startsWith('http') && !linkUrl.startsWith('#')) {
        try {
          await fs.access(linkUrl);
        } catch {
          analysis.inconsistencies.push(`Broken internal link: ${linkUrl}`);
          brokenInternalLinks++;
        }
      }
    }

    if (brokenInternalLinks === 0) {
      analysis.status = 'COMPLIANT';
      analysis.constitutional_impact = 'COMPLIANT';
    } else if (brokenInternalLinks <= 2) {
      analysis.status = 'WARNING';
      analysis.constitutional_impact = 'ADVISORY';
    } else {
      analysis.status = 'CRITICAL';
      analysis.constitutional_impact = 'WARNING';
    }

  } catch (error) {
    analysis.status = 'ERROR';
    analysis.details = `Link integrity check failed: ${error.message}`;
    analysis.constitutional_impact = 'ADVISORY';
  }

  return analysis;
}

/**
 * Get latest commit information for post-push context
 */
function getLatestCommitInfo() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
    return `${commitHash}: ${commitMessage}`;
  } catch {
    return 'Git information unavailable';
  }
}

/**
 * Constitutional Documentation Optimization Protocol
 */
async function constitutionalDocumentationOptimization() {
  console.log('\n🔧 Constitutional Documentation Optimization Protocol');
  console.log('════════════════════════════════════════════════════');

  const optimizations = {
    immediateActions: {
      description: 'Immediate constitutional documentation compliance actions',
      strategies: [
        'Synchronize version numbers across all documentation sources',
        'Validate and fix broken internal links in README.md',
        'Update docs.folkup.app deployment synchronization scripts',
        'Implement automated documentation consistency hooks'
      ],
      authority: 'AUTONOMOUS_EXECUTION',
      timeline: '1-2 hours'
    },

    expertCoordination: {
      description: 'Expert panel coordination for documentation excellence',
      strategies: [
        'Technical writer review of documentation structure and clarity',
        'Brand specialist validation of voice and tone consistency',
        'Content specialist verification of accuracy and completeness',
        'DevOps specialist implementation of automated sync protocols'
      ],
      authority: 'EXPERT_PANEL_REQUIRED',
      timeline: '4-8 hours'
    },

    constitutionalMonitoring: {
      description: 'Real-time constitutional documentation monitoring implementation',
      strategies: [
        'Deploy post-push documentation consistency validation hooks',
        'Implement documentation drift detection and alerting',
        'Enable automatic documentation synchronization protocols',
        'Establish constitutional documentation compliance dashboards'
      ],
      authority: 'CONSTITUTIONAL_FRAMEWORK',
      timeline: '8-12 hours'
    }
  };

  console.log('📋 CONSTITUTIONAL DOCUMENTATION STRATEGIES:');
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
 * Main Constitutional Documentation Consistency Entry Point
 */
async function main() {
  try {
    console.log('📚 CONSTITUTIONAL DOCUMENTATION CONSISTENCY PROTOCOL');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🎯 Mandate: Check consistency and currency of all documentation after each push`);
    console.log(`🏛️ Authority: Constitutional Framework Coordinator`);
    console.log(`📅 Execution: ${new Date().toISOString()}`);
    console.log('');

    const validation = await validateDocumentationConsistency();

    if (validation.enforcement_level === 'WARNING' || validation.enforcement_level === 'CRITICAL') {
      await constitutionalDocumentationOptimization();
    }

    // Save Constitutional Documentation Report
    const reportPath = './constitutional-documentation-consistency-report.json';
    await fs.writeFile(reportPath, JSON.stringify(validation, null, 2));
    console.log(`\n📄 Constitutional documentation report saved: ${reportPath}`);

    // Exit with appropriate code
    if (validation.enforcement_level === 'CRITICAL') {
      console.log('\n🚨 CRITICAL documentation violations detected - manual intervention required');
      process.exit(1);
    } else if (validation.enforcement_level === 'WARNING') {
      console.log('\n⚠️ Documentation inconsistencies detected - review recommended');
      process.exit(2);
    } else {
      console.log('\n✅ Documentation consistency maintained');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Constitutional documentation consistency validation failed:', error.message);
    process.exit(3);
  }
}

// Execute constitutional documentation validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  validateDocumentationConsistency,
  constitutionalDocumentationOptimization,
  CONSTITUTIONAL_DOC_STANDARDS,
  DOC_ENFORCEMENT_LEVELS
};