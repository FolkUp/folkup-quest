/**
 * Knowledge State System for FolkUp Quest
 * Tracks player's research methodology choices and discovery progress
 */

// Knowledge categories for choice categorization
export const KNOWLEDGE_CATEGORIES = ['research', 'intuition', 'analysis'];

/**
 * Core knowledge state management
 */
export class KnowledgeState {
  constructor() {
    this.discovered = new Set(); // Discovered passage IDs
    this.choicesByCategory = {
      research: 0,
      intuition: 0,
      analysis: 0
    };
    this.lampKnowledgeRich = false; // Scholar's lamp state
  }

  /**
   * Record a knowledge choice (research/intuition/analysis)
   * @param {string} category - One of KNOWLEDGE_CATEGORIES
   */
  recordChoice(category) {
    if (KNOWLEDGE_CATEGORIES.includes(category)) {
      this.choicesByCategory[category]++;
    }
  }

  /**
   * Record discovered passage for exploration tracking
   * @param {string} passageId - Unique passage identifier
   */
  recordDiscovery(passageId) {
    this.discovered.add(passageId);
  }

  /**
   * Check if lamp should activate based on knowledge threshold
   * @returns {boolean} True if threshold reached (3+ total choices)
   */
  shouldActivateKnowledgeRichLamp() {
    const totalChoices = Object.values(this.choicesByCategory).reduce((sum, count) => sum + count, 0);
    return totalChoices >= 3;
  }

  /**
   * Serialize state for save/load persistence
   * @returns {Object} Serialized knowledge state
   */
  serialize() {
    return {
      discovered: Array.from(this.discovered),
      choicesByCategory: { ...this.choicesByCategory },
      lampKnowledgeRich: this.lampKnowledgeRich
    };
  }

  /**
   * Deserialize state from save data
   * @param {Object} data - Saved knowledge state data
   * @returns {KnowledgeState} New instance with restored state
   */
  static deserialize(data) {
    const state = new KnowledgeState();

    if (data) {
      if (data.discovered) {
        state.discovered = new Set(data.discovered);
      }
      if (data.choicesByCategory) {
        state.choicesByCategory = { ...state.choicesByCategory, ...data.choicesByCategory };
      }
      if (data.lampKnowledgeRich !== undefined) {
        state.lampKnowledgeRich = data.lampKnowledgeRich;
      }
    }

    return state;
  }
}

/**
 * Parse KNOWLEDGE tag from Ink choice tags
 * @param {string} tag - Ink tag string
 * @returns {string|null} Knowledge category or null
 */
export function parseKnowledgeTag(tag) {
  if (typeof tag !== 'string') return null;

  const match = tag.match(/^KNOWLEDGE:\s*(research|intuition|analysis)$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Parse DISCOVERED tag from Ink passage tags
 * @param {string} tag - Ink tag string
 * @returns {boolean} True if discovery marker found
 */
export function parseDiscoveredTag(tag) {
  if (typeof tag !== 'string') return false;
  return tag.toUpperCase() === 'DISCOVERED';
}

/**
 * Parse LAMP: knowledge-rich extension tag
 * @param {string} tag - Ink tag string
 * @returns {boolean} True if lamp knowledge-rich marker found
 */
export function parseKnowledgeRichTag(tag) {
  if (typeof tag !== 'string') return false;
  return tag.toUpperCase() === 'LAMP: KNOWLEDGE-RICH';
}