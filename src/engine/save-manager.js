/**
 * Save Manager — localStorage auto-save for game state
 * GDPR: functional storage only, no tracking
 */

const SAVE_KEY = 'folkup-quest-save';
const META_KEY = 'folkup-quest-meta';

export class SaveManager {
  /**
   * Save game state
   * @param {string} stateJson — InkEngine state JSON
   * @param {object} meta — additional metadata (scene, act, folk_counter)
   */
  static save(stateJson, meta = {}) {
    try {
      localStorage.setItem(SAVE_KEY, stateJson);
      localStorage.setItem(
        META_KEY,
        JSON.stringify({
          ...meta,
          timestamp: Date.now(),
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load saved game state
   * @returns {{ state: string, meta: object } | null}
   */
  static load() {
    try {
      const state = localStorage.getItem(SAVE_KEY);
      const metaStr = localStorage.getItem(META_KEY);
      if (!state) return null;

      const meta = metaStr ? JSON.parse(metaStr) : {};
      return { state, meta };
    } catch {
      return null;
    }
  }

  /** Check if a save exists */
  static hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  /** Delete saved game */
  static clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(META_KEY);
      return true;
    } catch {
      return false;
    }
  }

  /** Get save metadata (scene, act, timestamp) without loading full state */
  static getMeta() {
    try {
      const metaStr = localStorage.getItem(META_KEY);
      return metaStr ? JSON.parse(metaStr) : null;
    } catch {
      return null;
    }
  }
}
