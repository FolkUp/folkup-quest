/**
 * Analytics abstraction — zero dependencies, opt-in, no-op by default.
 *
 * Events:
 *   game_start       — new game or continue
 *   choice_made      — player selects a choice (with index, scene)
 *   act_changed       — act transition (act number)
 *   ending_reached   — specific ending reached
 *   game_completed   — game finished (with ending, folk_counter)
 */

let enabled = false;

/**
 * Initialize analytics. Call once on page load.
 * Only enables if Cloudflare Web Analytics beacon is present.
 */
export function initAnalytics() {
  // Cloudflare Web Analytics sets __cfBeacon on window
  enabled = typeof window !== 'undefined' && !!window.__cfBeacon;

  if (import.meta.env?.DEV) {
    enabled = true; // Always log in dev mode
    console.log('[analytics] dev mode — logging to console');
  }
}

/**
 * Track an event.
 * @param {string} name — event name
 * @param {Record<string, string|number>} [params={}] — event parameters
 */
export function trackEvent(name, params = {}) {
  if (!enabled) return;

  if (import.meta.env?.DEV) {
    console.log(`[analytics] ${name}`, params);
    return;
  }

  // Cloudflare Web Analytics doesn't support custom events natively,
  // but we send them as page-view-like beacons with path encoding.
  // This is a common pattern: /events/{name}?{params}
  if (typeof navigator?.sendBeacon === 'function') {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, String(value));
    }
    const path = `/events/${name}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    // Use a zero-byte beacon to log the event path
    navigator.sendBeacon(path);
  }
}

// Convenience event functions

export function trackGameStart(isNewGame) {
  trackEvent('game_start', { type: isNewGame ? 'new' : 'continue' });
}

export function trackChoiceMade(choiceIndex, scene) {
  trackEvent('choice_made', { choice: choiceIndex, scene });
}

export function trackActChanged(act) {
  trackEvent('act_changed', { act });
}

export function trackEndingReached(ending) {
  trackEvent('ending_reached', { ending });
}

export function trackGameCompleted(ending, folkCounter) {
  trackEvent('game_completed', { ending, folk_counter: folkCounter });
}
