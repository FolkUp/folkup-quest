/**
 * Interactive Choice System — FQST-017 Phase 1B-Full Implementation
 * Constitutional Framework Authority: Multiple Narrative Paths with 3+ Major Branches
 *
 * BANKING-LEVEL STANDARDS:
 * - <100ms choice response time (constitutional requirement)
 * - Real-time consequence preview
 * - Branching path visualization
 * - Choice impact tracking
 */

import { performanceMonitor } from '../utils/performance-monitor.js';

export class InteractiveChoiceSystem {
  constructor(inkEngine) {
    this.inkEngine = inkEngine;
    this.choiceHistory = [];
    this.branchingPaths = new Map();
    this.consequencePreview = new Map();

    // Constitutional performance monitoring
    this.responseTimeTarget = 100; // <100ms constitutional requirement
    this.interactionMetrics = {
      choiceResponseTimes: [],
      averageResponseTime: 0,
      constitutionalCompliance: true
    };

    this.initializeBranchingSystem();
  }

  /**
   * Initialize the 3+ Major Choice Branches system
   * CONSTITUTIONAL FRAMEWORK: Folk vs Dragon, Trust vs Business, Final Destiny
   */
  initializeBranchingSystem() {
    // MAJOR CHOICE BRANCH 1: Folk vs Dragon Path (Scene 7)
    this.branchingPaths.set('breus_proposal', {
      id: 'breus_proposal',
      scene: 'scene7',
      title: 'The Breus Proposal',
      description: 'Corporate partnership vs independent path',
      branches: [
        {
          choice: 'choice_5_listened',
          path: 'dragon_path',
          consequence: 'Business integration, corporate structure',
          panels: ['panel-2.3', 'panel-2.5', 'panel-3.5'],
          folk_counter_impact: -15
        },
        {
          choice: 'choice_5_refused',
          path: 'folk_path',
          consequence: 'Independent development, team-first approach',
          panels: ['panel-2.2', 'panel-2.4', 'panel-3.6'],
          folk_counter_impact: +15
        }
      ]
    });

    // MAJOR CHOICE BRANCH 2: Trust vs Business Dynamics (Scene 8)
    this.branchingPaths.set('team_dynamics', {
      id: 'team_dynamics',
      scene: 'scene8',
      title: 'Team Response Strategy',
      description: 'How to maintain team cohesion after decision',
      branches: [
        {
          choice: 'choice_8_folk',
          path: 'trust_focus',
          consequence: 'Team solidarity, relationship-first approach',
          panels: ['panel-2.4', 'panel-4.4', 'panel-4.5'],
          trust_impact: { alice: +10, gonzo: +10, dan: +10 }
        },
        {
          choice: 'choice_8_dragon',
          path: 'business_focus',
          consequence: 'Strategic planning, metric-driven approach',
          panels: ['panel-2.5', 'panel-3.3', 'panel-4.2'],
          trust_impact: { alice: -5, gonzo: -5, dan: -5 }
        }
      ]
    });

    // MAJOR CHOICE BRANCH 3: Final Destiny Choice (Scene 10)
    this.branchingPaths.set('final_destiny', {
      id: 'final_destiny',
      scene: 'scene10',
      title: 'The Final Choice',
      description: 'Three paths to different futures',
      branches: [
        {
          choice: 'final_choice_accept',
          path: 'dragon_ending',
          consequence: 'Corporate success, glass office future',
          panels: ['panel-3.5', 'panel-4.3'],
          ending: 'ending_chair'
        },
        {
          choice: 'final_choice_refuse',
          path: 'folk_ending',
          consequence: 'Independent library, community-focused future',
          panels: ['panel-3.6', 'panel-4.1'],
          ending: 'ending_lantern'
        },
        {
          choice: 'final_choice_counter',
          path: 'bridge_ending',
          consequence: 'Compromise solution, balanced approach',
          panels: ['panel-3.7', 'panel-4.2'],
          ending: 'ending_bridge'
        }
      ]
    });

    // Initialize consequence previews
    this.generateConsequencePreviews();
  }

  /**
   * Generate real-time consequence previews for choices
   * CONSTITUTIONAL REQUIREMENT: Immediate visual feedback <100ms
   */
  generateConsequencePreviews() {
    this.branchingPaths.forEach(branch => {
      branch.branches.forEach(option => {
        this.consequencePreview.set(option.choice, {
          immediate: option.consequence,
          panels_unlocked: option.panels,
          long_term: this.calculateLongTermConsequences(option),
          character_impact: option.trust_impact || {},
          narrative_impact: option.folk_counter_impact || 0
        });
      });
    });
  }

  /**
   * Handle choice selection with constitutional performance monitoring
   * BANKING-LEVEL STANDARD: <100ms response time guaranteed
   */
  async handleChoiceSelection(choiceId, gameState) {
    const startTime = performance.now();

    try {
      // Constitutional performance monitoring
      const choice = this.getChoiceById(choiceId);
      if (!choice) {
        throw new Error(`Choice not found: ${choiceId}`);
      }

      // Real-time consequence application
      const consequences = await this.applyChoiceConsequences(choice, gameState);

      // Update branching paths
      const affectedPanels = this.updatePanelUnlocks(choice, gameState);

      // Track choice for narrative coherence
      this.choiceHistory.push({
        choiceId,
        timestamp: Date.now(),
        consequences,
        gameState: { ...gameState }
      });

      const responseTime = performance.now() - startTime;
      this.trackPerformanceMetrics(responseTime);

      // Constitutional compliance check
      if (responseTime > this.responseTimeTarget) {
        console.warn(`Constitutional violation: Choice response time ${responseTime}ms > ${this.responseTimeTarget}ms`);
        this.interactionMetrics.constitutionalCompliance = false;
      }

      return {
        success: true,
        consequences,
        unlockedPanels: affectedPanels,
        responseTime,
        constitutionalCompliance: responseTime <= this.responseTimeTarget
      };

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.trackPerformanceMetrics(responseTime);

      console.error('Choice handling error:', error);
      return {
        success: false,
        error: error.message,
        responseTime
      };
    }
  }

  /**
   * Apply immediate consequences of choice selection
   */
  async applyChoiceConsequences(choice, gameState) {
    const consequences = this.consequencePreview.get(choice.id) || {};

    // Apply character trust changes
    if (consequences.character_impact) {
      Object.entries(consequences.character_impact).forEach(([character, change]) => {
        const trustKey = `${character}_trust`;
        gameState[trustKey] = Math.max(0, Math.min(100,
          (gameState[trustKey] || 50) + change
        ));
      });
    }

    // Apply narrative counter changes
    if (consequences.narrative_impact) {
      gameState.folk_counter = Math.max(0, Math.min(100,
        (gameState.folk_counter || 50) + consequences.narrative_impact
      ));
    }

    // Set choice flags for scene progression
    this.setChoiceFlags(choice, gameState);

    return consequences;
  }

  /**
   * Update panel unlocks based on choice
   */
  updatePanelUnlocks(choice, gameState) {
    const consequences = this.consequencePreview.get(choice.id);
    if (!consequences || !consequences.panels_unlocked) {
      return [];
    }

    // Constitutional framework: Immediate panel unlock feedback
    const unlockedPanels = [];
    consequences.panels_unlocked.forEach(panelId => {
      // Check if panel should be unlocked
      if (this.shouldUnlockPanel(panelId, gameState)) {
        unlockedPanels.push(panelId);
        // Trigger panel unlock animation/notification
        this.triggerPanelUnlock(panelId);
      }
    });

    return unlockedPanels;
  }

  /**
   * Check if panel should be unlocked based on choice
   */
  shouldUnlockPanel(panelId, gameState) {
    // Import panel progression logic
    const { evaluatePanelUnlock } = require('./panel-progression.js');
    return evaluatePanelUnlock(panelId, gameState);
  }

  /**
   * Trigger visual panel unlock notification
   * CONSTITUTIONAL REQUIREMENT: Immediate visual feedback
   */
  triggerPanelUnlock(panelId) {
    // Dispatch event for UI to handle
    document.dispatchEvent(new CustomEvent('panelUnlocked', {
      detail: { panelId, timestamp: Date.now() }
    }));
  }

  /**
   * Set choice flags in game state for scene progression
   */
  setChoiceFlags(choice, gameState) {
    // Map choice IDs to game state flags
    const choiceFlagMapping = {
      'choice_5_listened': () => {
        gameState.choice_5_listened = true;
        gameState.choice_5_refused = false;
      },
      'choice_5_refused': () => {
        gameState.choice_5_refused = true;
        gameState.choice_5_listened = false;
      },
      'choice_8_folk': () => {
        gameState.choice_8_folk = true;
      },
      'choice_8_dragon': () => {
        gameState.choice_8_dragon = true;
      },
      'final_choice_accept': () => {
        gameState.final_choice = 'accept';
      },
      'final_choice_refuse': () => {
        gameState.final_choice = 'refuse';
      },
      'final_choice_counter': () => {
        gameState.final_choice = 'counter_offer';
      }
    };

    const flagSetter = choiceFlagMapping[choice.id];
    if (flagSetter) {
      flagSetter();
    }
  }

  /**
   * Get choice by ID from branching paths
   */
  getChoiceById(choiceId) {
    for (const branch of this.branchingPaths.values()) {
      for (const option of branch.branches) {
        if (option.choice === choiceId) {
          return { id: choiceId, ...option };
        }
      }
    }
    return null;
  }

  /**
   * Calculate long-term consequences of choice
   */
  calculateLongTermConsequences(option) {
    // Analyze choice impact on story progression
    const longTerm = [];

    if (option.path === 'folk_path') {
      longTerm.push('Independent development path');
      longTerm.push('Stronger team bonds');
      longTerm.push('Community-focused outcomes');
    } else if (option.path === 'dragon_path') {
      longTerm.push('Corporate integration benefits');
      longTerm.push('Business growth acceleration');
      longTerm.push('Professional structure advantages');
    }

    if (option.ending) {
      longTerm.push(`Leads to ${option.ending} conclusion`);
    }

    return longTerm;
  }

  /**
   * Track performance metrics for constitutional compliance
   */
  trackPerformanceMetrics(responseTime) {
    this.interactionMetrics.choiceResponseTimes.push(responseTime);

    // Calculate rolling average (last 10 interactions)
    const recentTimes = this.interactionMetrics.choiceResponseTimes.slice(-10);
    this.interactionMetrics.averageResponseTime =
      recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;

    // Update constitutional compliance status
    this.interactionMetrics.constitutionalCompliance =
      this.interactionMetrics.averageResponseTime <= this.responseTimeTarget;
  }

  /**
   * Get current performance metrics for monitoring
   */
  getPerformanceMetrics() {
    return {
      ...this.interactionMetrics,
      totalChoices: this.choiceHistory.length,
      branchingPathsActive: this.branchingPaths.size,
      constitutionalStatus: this.interactionMetrics.constitutionalCompliance ? 'COMPLIANT' : 'VIOLATION'
    };
  }

  /**
   * Get available choices for current scene
   */
  getAvailableChoices(currentScene, gameState) {
    const availableChoices = [];

    this.branchingPaths.forEach(branch => {
      if (branch.scene === currentScene) {
        branch.branches.forEach(option => {
          availableChoices.push({
            id: option.choice,
            text: option.consequence,
            preview: this.consequencePreview.get(option.choice),
            branchId: branch.id
          });
        });
      }
    });

    return availableChoices;
  }

  /**
   * Get choice history for narrative analysis
   */
  getChoiceHistory() {
    return this.choiceHistory.map(entry => ({
      choiceId: entry.choiceId,
      timestamp: entry.timestamp,
      consequences: entry.consequences.immediate
    }));
  }
}