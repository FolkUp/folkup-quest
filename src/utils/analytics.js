/**
 * Analytics abstraction — zero dependencies, opt-in, no-op by default.
 * Enhanced with GDPR-compliant privacy controls.
 *
 * Events:
 *   game_start       — new game or continue
 *   choice_made      — player selects a choice (with index, scene)
 *   act_changed       — act transition (act number)
 *   ending_reached   — specific ending reached
 *   game_completed   — game finished (with ending, folk_counter)
 *   panel_viewed     — comic panel opened
 *   panel_engagement — time spent on panel
 *   panel_navigation — navigation between panels
 *   reader_mode      — gallery usage
 *   privacy_action   — privacy-related actions
 */

let enabled = false;
let privacyAnalytics = null;

/**
 * Initialize analytics. Call once on page load.
 * Only enables if Cloudflare Web Analytics beacon is present.
 * Respects privacy-first analytics consent levels.
 */
export function initAnalytics() {
  // Cloudflare Web Analytics sets __cfBeacon on window
  enabled = typeof window !== 'undefined' && !!window.__cfBeacon;

  if (import.meta.env?.DEV) {
    enabled = true; // Always log in dev mode
    console.log('[analytics] dev mode — logging to console');
  }

  // Lazy load privacy analytics to avoid circular imports
  setTimeout(async () => {
    try {
      const module = await import('./privacy-analytics.js');
      privacyAnalytics = module.privacyAnalytics;
      console.log('[analytics] Privacy-first analytics integrated');
    } catch (e) {
      console.warn('[analytics] Failed to load privacy analytics:', e);
    }
  }, 0);
}

/**
 * Track an event.
 * @param {string} name — event name
 * @param {Record<string, string|number>} [params={}] — event parameters
 */
export function trackEvent(name, params = {}) {
  if (!enabled) return;

  // Check privacy consent for analytics events
  if (privacyAnalytics && !privacyAnalytics.canTrackAnalytics() &&
      !['privacy_action', 'consent_changed'].includes(name)) {
    return; // Block non-essential tracking
  }

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
