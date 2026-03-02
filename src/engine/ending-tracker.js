/**
 * Ending Tracker — tracks which endings the player has seen
 * Uses localStorage (functional storage, GDPR-compliant)
 */

const ENDINGS_KEY = 'folkup-quest-endings';
const ALL_ENDINGS = ['lantern', 'bridge', 'chair'];

export class EndingTracker {
  /**
   * Record that the player has seen an ending
   * @param {'lantern' | 'bridge' | 'chair'} ending
   */
  static record(ending) {
    try {
      const seen = EndingTracker.getSeen();
      if (!seen.includes(ending)) {
        seen.push(ending);
        localStorage.setItem(ENDINGS_KEY, JSON.stringify(seen));
      }
    } catch {
      // localStorage unavailable
    }
  }

  /**
   * Get list of seen endings
   * @returns {string[]}
   */
  static getSeen() {
    try {
      const raw = localStorage.getItem(ENDINGS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((e) => ALL_ENDINGS.includes(e)) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get count of unique endings seen
   * @returns {number}
   */
  static getCount() {
    return EndingTracker.getSeen().length;
  }

  /**
   * Check if a specific ending has been seen
   * @param {string} ending
   * @returns {boolean}
   */
  static hasSeen(ending) {
    return EndingTracker.getSeen().includes(ending);
  }

  /** Total number of possible endings */
  static get total() {
    return ALL_ENDINGS.length;
  }

  /** Clear all ending records */
  static clear() {
    try {
      localStorage.removeItem(ENDINGS_KEY);
    } catch {
      // localStorage unavailable
    }
  }
}
