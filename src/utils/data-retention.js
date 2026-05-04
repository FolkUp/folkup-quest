/**
 * Data Retention Automation — FolkUp Quest
 *
 * GDPR Article 5(1)(e) compliance: Storage limitation principle
 * Automated cleanup of expired analytics data and sessions
 */

import { privacyAnalytics } from './privacy-analytics.js';

export class DataRetentionManager {
  constructor() {
    this.isRunning = false;
    this.cleanupInterval = null;
    this.lastCleanup = null;

    this.init();
  }

  /**
   * Initialize retention manager
   */
  init() {
    // Start immediate cleanup check
    this.performCleanup();

    // Schedule regular cleanup checks (every hour)
    this.scheduleCleanup();

    // Listen for page visibility changes to perform cleanup when user returns
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.shouldPerformCleanup()) {
          this.performCleanup();
        }
      });
    }

    console.log('[data-retention] Manager initialized');
  }

  /**
   * Schedule regular cleanup operations
   */
  scheduleCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Check if cleanup should be performed
   */
  shouldPerformCleanup() {
    if (!this.lastCleanup) return true;

    // Perform cleanup if more than 30 minutes since last cleanup
    const thirtyMinutes = 30 * 60 * 1000;
    return (Date.now() - this.lastCleanup) > thirtyMinutes;
  }

  /**
   * Perform comprehensive data cleanup
   */
  async performCleanup() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastCleanup = Date.now();

    try {
      const stats = {
        sessionsExpired: 0,
        consentExpired: 0,
        bufferCleaned: 0,
        storageReclaimed: 0
      };

      // Clean expired sessions
      stats.sessionsExpired += this.cleanupExpiredSessions();

      // Clean expired consent records
      stats.consentExpired += this.cleanupExpiredConsent();

      // Clean old localStorage entries
      stats.storageReclaimed += this.cleanupOldStorageEntries();

      // Trigger privacy analytics cleanup
      if (privacyAnalytics) {
        privacyAnalytics.cleanupExpiredData();
      }

      // Log cleanup results
      if (stats.sessionsExpired || stats.consentExpired || stats.storageReclaimed) {
        console.log('[data-retention] Cleanup completed:', stats);
      }

    } catch (error) {
      console.error('[data-retention] Cleanup failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up expired session data
   */
  cleanupExpiredSessions() {
    let cleaned = 0;

    try {
      const sessionData = localStorage.getItem('fqst.analytics.session');
      if (sessionData) {
        const session = JSON.parse(sessionData);

        // Check if session is expired
        if (session.expires && Date.now() >= session.expires) {
          localStorage.removeItem('fqst.analytics.session');
          cleaned = 1;
          console.log('[data-retention] Expired session removed');
        }
      }
    } catch (e) {
      console.warn('[data-retention] Session cleanup failed:', e);
      // Remove corrupted session data
      localStorage.removeItem('fqst.analytics.session');
      cleaned = 1;
    }

    return cleaned;
  }

  /**
   * Clean up expired consent records
   */
  cleanupExpiredConsent() {
    let cleaned = 0;

    try {
      const consentData = localStorage.getItem('fqst.privacy.consent');
      if (consentData) {
        const consent = JSON.parse(consentData);

        // Check if consent is expired (180 days)
        if (consent.expires && Date.now() >= consent.expires) {
          localStorage.removeItem('fqst.privacy.consent');
          cleaned = 1;
          console.log('[data-retention] Expired consent removed');
        }
      }
    } catch (e) {
      console.warn('[data-retention] Consent cleanup failed:', e);
      // Remove corrupted consent data
      localStorage.removeItem('fqst.privacy.consent');
      cleaned = 1;
    }

    return cleaned;
  }

  /**
   * Clean up old localStorage entries that may have accumulated
   */
  cleanupOldStorageEntries() {
    let cleaned = 0;

    try {
      const keysToCheck = [];

      // Find all localStorage keys related to our app
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fqst.')) {
          keysToCheck.push(key);
        }
      }

      // Check each key for cleanup criteria
      keysToCheck.forEach(key => {
        try {
          if (key.includes('temp.') || key.includes('cache.')) {
            // Remove temporary/cache entries older than 24 hours
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (parsed.timestamp &&
                  Date.now() - parsed.timestamp > (24 * 60 * 60 * 1000)) {
                localStorage.removeItem(key);
                cleaned++;
              }
            }
          }
        } catch (e) {
          // Remove corrupted entries
          localStorage.removeItem(key);
          cleaned++;
        }
      });

    } catch (e) {
      console.warn('[data-retention] Storage cleanup failed:', e);
    }

    return cleaned;
  }

  /**
   * Force immediate cleanup (for manual triggering)
   */
  forceCleanup() {
    return this.performCleanup();
  }

  /**
   * Get data retention summary for privacy dashboard
   */
  getRetentionSummary() {
    const now = Date.now();
    const summary = {
      lastCleanup: this.lastCleanup,
      nextCleanup: this.lastCleanup ? this.lastCleanup + (60 * 60 * 1000) : now,
      retentionPolicies: {
        sessions: '6 hours',
        consent: '180 days',
        gameData: 'Until manually deleted',
        analyticsBuffer: '6 hours (local), 90 days (aggregate)'
      },
      storageUsage: this.getStorageUsage()
    };

    return summary;
  }

  /**
   * Get current localStorage usage stats
   */
  getStorageUsage() {
    try {
      let totalSize = 0;
      let fqstSize = 0;
      let itemCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = (key.length + value.length) * 2; // Rough estimate in bytes
          totalSize += size;

          if (key.startsWith('fqst.')) {
            fqstSize += size;
            itemCount++;
          }
        }
      }

      return {
        totalBytes: totalSize,
        fqstBytes: fqstSize,
        fqstItems: itemCount,
        fqstPercentage: totalSize > 0 ? Math.round((fqstSize / totalSize) * 100) : 0
      };
    } catch (e) {
      return { error: 'Unable to calculate storage usage' };
    }
  }

  /**
   * Destroy retention manager (cleanup on app shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isRunning = false;
    console.log('[data-retention] Manager destroyed');
  }
}

// Global instance
export const dataRetentionManager = new DataRetentionManager();

// Export cleanup function for manual use
export function performDataCleanup() {
  return dataRetentionManager.forceCleanup();
}