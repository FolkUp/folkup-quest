/**
 * GDPR-Compliant Privacy-First Analytics — FolkUp Quest
 *
 * Implements Cooper Security specification for comic panel analytics
 * with granular consent management and data minimization.
 *
 * Legal basis: Art. 6(1)(f) + Art. 6(1)(a) dual framework
 * Data retention: 6-hour session buffer, 90-day server maximum
 */

import { trackEvent } from './analytics.js';

/**
 * Generate temporary session ID for analytics correlation
 * Sessions expire after 6 hours to ensure privacy compliance
 */
function generateTemporarySessionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const expiry = timestamp + (6 * 60 * 60 * 1000); // 6 hours

  return {
    id: `session_${timestamp}_${random}`,
    created: timestamp,
    expires: expiry
  };
}

/**
 * Privacy-First Analytics Class
 * Implements GDPR compliance with minimal data collection
 */
export class PrivacyFirstAnalytics {
  constructor() {
    this.session = this.getOrCreateSession();
    this.consentLevel = this.getConsentLevel();
    this.dataBuffer = [];
    this.isEnabled = false;

    // Initialize based on consent
    this.initialize();

    // Setup periodic cleanup
    this.startCleanupSchedule();

    // Track initialization
    console.log('[privacy-analytics] Initialized with consent level:', this.consentLevel);
  }

  /**
   * Get or create a temporary session with automatic expiry
   */
  getOrCreateSession() {
    try {
      const stored = localStorage.getItem('fqst.analytics.session');
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is still valid
        if (session.expires && Date.now() < session.expires) {
          return session;
        }
      }
    } catch (e) {
      console.warn('[privacy-analytics] Failed to load session:', e);
    }

    // Create new session
    const session = generateTemporarySessionId();
    try {
      localStorage.setItem('fqst.analytics.session', JSON.stringify(session));
    } catch (e) {
      console.warn('[privacy-analytics] Failed to save session:', e);
    }

    return session;
  }

  /**
   * Get current consent level from localStorage
   */
  getConsentLevel() {
    try {
      const stored = localStorage.getItem('fqst.privacy.consent');
      if (stored) {
        const consent = JSON.parse(stored);
        // Check consent expiry (180 days)
        if (consent.expires && Date.now() < consent.expires) {
          return consent.level;
        }
      }
    } catch (e) {
      console.warn('[privacy-analytics] Failed to load consent:', e);
    }

    return 'essential'; // Default to essential-only
  }

  /**
   * Set consent level with legal basis tracking
   */
  setConsentLevel(level, userInitiated = true) {
    const validLevels = ['essential', 'analytics', 'enhancements'];
    if (!validLevels.includes(level)) {
      throw new Error(`Invalid consent level: ${level}`);
    }

    const consent = {
      level: level,
      granted: Date.now(),
      expires: Date.now() + (180 * 24 * 60 * 60 * 1000), // 180 days
      userInitiated: userInitiated,
      legalBasis: level === 'essential' ? 'Art. 6(1)(f)' : 'Art. 6(1)(a)',
      version: '1.0'
    };

    try {
      localStorage.setItem('fqst.privacy.consent', JSON.stringify(consent));
      this.consentLevel = level;
      this.reinitialize();

      console.log(`[privacy-analytics] Consent updated to '${level}' (${consent.legalBasis})`);

      // Track consent change (always allowed under legitimate interest)
      this.trackConsentChange(level, userInitiated);
    } catch (e) {
      console.error('[privacy-analytics] Failed to save consent:', e);
    }
  }

  /**
   * Initialize analytics based on current consent level
   */
  initialize() {
    this.isEnabled = this.consentLevel !== 'none';

    // Clear data buffer if consent withdrawn
    if (this.consentLevel === 'essential') {
      this.dataBuffer = this.dataBuffer.filter(event =>
        event.category === 'essential' || event.category === 'security'
      );
    }
  }

  /**
   * Reinitialize after consent change
   */
  reinitialize() {
    this.initialize();
  }

  /**
   * Track panel viewing event
   */
  trackPanelViewed(panelId, source = 'unknown', unlockMethod = null) {
    if (!this.canTrackAnalytics()) return;

    const event = {
      type: 'panel_viewed',
      category: 'analytics',
      panelId: panelId,
      source: source, // 'game', 'gallery', 'direct'
      unlockMethod: unlockMethod, // 'story_progress', 'choice_path', etc.
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.bufferEvent(event);

    // Send to existing analytics system with privacy wrapper
    trackEvent('panel_viewed', {
      panel_id: panelId,
      source: source,
      session: this.session.id
    });
  }

  /**
   * Track time spent on panel
   */
  trackPanelTimeSpent(panelId, durationMs, exitMethod = 'unknown') {
    if (!this.canTrackAnalytics()) return;

    // Only track meaningful durations (>1s, <10min)
    if (durationMs < 1000 || durationMs > 600000) return;

    const event = {
      type: 'panel_time_spent',
      category: 'analytics',
      panelId: panelId,
      duration: Math.round(durationMs / 1000), // Convert to seconds
      exitMethod: exitMethod, // 'close_button', 'navigation', 'escape_key'
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.bufferEvent(event);

    trackEvent('panel_engagement', {
      panel_id: panelId,
      duration_seconds: event.duration,
      exit_method: exitMethod
    });
  }

  /**
   * Track panel navigation patterns
   */
  trackPanelSequenceNavigation(fromPanel, toPanel, navigationMethod = 'unknown') {
    if (!this.canTrackAnalytics()) return;

    const event = {
      type: 'panel_navigation',
      category: 'analytics',
      fromPanel: fromPanel,
      toPanel: toPanel,
      navigationMethod: navigationMethod, // 'next_button', 'prev_button', 'direct_click'
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.bufferEvent(event);

    trackEvent('panel_navigation', {
      from_panel: fromPanel,
      to_panel: toPanel,
      method: navigationMethod
    });
  }

  /**
   * Track reader mode usage
   */
  trackReaderModeUsage(mode, panelCount = 0, sessionTime = 0) {
    if (!this.canTrackAnalytics()) return;

    const event = {
      type: 'reader_mode',
      category: 'analytics',
      mode: mode, // 'opened', 'closed', 'category_switched'
      panelCount: panelCount,
      sessionTime: Math.round(sessionTime / 1000),
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.bufferEvent(event);

    trackEvent('reader_mode', {
      mode: mode,
      panels_viewed: panelCount,
      session_time: event.sessionTime
    });
  }

  /**
   * Track privacy-relevant actions (always allowed under legitimate interest)
   */
  trackPrivacyAction(action, details = {}) {
    const event = {
      type: 'privacy_action',
      category: 'essential',
      action: action, // 'consent_shown', 'consent_granted', 'data_deleted'
      details: details,
      timestamp: Date.now(),
      sessionId: this.session.id
    };

    this.bufferEvent(event);

    // Always track privacy actions for compliance
    trackEvent('privacy_action', {
      action: action,
      ...details
    });
  }

  /**
   * Track consent changes
   */
  trackConsentChange(newLevel, userInitiated) {
    this.trackPrivacyAction('consent_changed', {
      new_level: newLevel,
      user_initiated: userInitiated,
      previous_level: this.consentLevel
    });
  }

  /**
   * Check if analytics tracking is allowed
   */
  canTrackAnalytics() {
    return this.isEnabled &&
           (this.consentLevel === 'analytics' || this.consentLevel === 'enhancements') &&
           this.session && Date.now() < this.session.expires;
  }

  /**
   * Check if enhancements are allowed
   */
  canTrackEnhancements() {
    return this.isEnabled &&
           this.consentLevel === 'enhancements' &&
           this.session && Date.now() < this.session.expires;
  }

  /**
   * Buffer event for batch processing
   */
  bufferEvent(event) {
    this.dataBuffer.push(event);

    // Limit buffer size (100 events max)
    if (this.dataBuffer.length > 100) {
      this.dataBuffer = this.dataBuffer.slice(-100);
    }

    // Auto-flush buffer periodically
    if (this.dataBuffer.length >= 10) {
      setTimeout(() => this.flushBuffer(), 5000);
    }
  }

  /**
   * Flush buffered events (placeholder for server integration)
   */
  flushBuffer() {
    if (this.dataBuffer.length === 0) return;

    // In production, send to privacy-compliant analytics endpoint
    if (import.meta.env?.DEV) {
      console.log(`[privacy-analytics] Flushing ${this.dataBuffer.length} events:`,
                  this.dataBuffer);
    }

    // Clear buffer after processing
    this.dataBuffer = [];
  }

  /**
   * Start cleanup schedule for data retention compliance
   */
  startCleanupSchedule() {
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60 * 60 * 1000);
  }

  /**
   * Clean up expired data to meet retention requirements
   */
  cleanupExpiredData() {
    const now = Date.now();

    // Check session expiry
    if (this.session && now >= this.session.expires) {
      console.log('[privacy-analytics] Session expired, generating new session');
      this.session = this.getOrCreateSession();
    }

    // Clean buffer of old events (>6 hours)
    const sixHoursAgo = now - (6 * 60 * 60 * 1000);
    this.dataBuffer = this.dataBuffer.filter(event =>
      event.timestamp > sixHoursAgo
    );

    // Check consent expiry
    const consentLevel = this.getConsentLevel();
    if (consentLevel !== this.consentLevel) {
      console.log('[privacy-analytics] Consent expired, reverting to essential');
      this.consentLevel = consentLevel;
      this.reinitialize();
    }
  }

  /**
   * Get analytics summary for privacy dashboard
   */
  getPrivacySummary() {
    return {
      sessionId: this.session?.id || 'none',
      sessionExpires: this.session?.expires || null,
      consentLevel: this.consentLevel,
      bufferSize: this.dataBuffer.length,
      isEnabled: this.isEnabled,
      canTrackAnalytics: this.canTrackAnalytics(),
      canTrackEnhancements: this.canTrackEnhancements()
    };
  }

  /**
   * Delete all stored analytics data (GDPR Article 17)
   */
  deleteAllData() {
    try {
      // Clear localStorage
      localStorage.removeItem('fqst.analytics.session');
      localStorage.removeItem('fqst.privacy.consent');

      // Clear buffer
      this.dataBuffer = [];

      // Reset state
      this.session = null;
      this.consentLevel = 'essential';
      this.isEnabled = false;

      console.log('[privacy-analytics] All analytics data deleted');

      // Track deletion (legitimate interest)
      this.trackPrivacyAction('data_deleted', {
        reason: 'user_request',
        deleted_at: Date.now()
      });

      return true;
    } catch (e) {
      console.error('[privacy-analytics] Failed to delete data:', e);
      return false;
    }
  }
}

// Global instance
export const privacyAnalytics = new PrivacyFirstAnalytics();