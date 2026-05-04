/**
 * Privacy Settings Menu — FolkUp Quest
 *
 * In-game privacy controls and data management interface
 * GDPR Article 7 & 17 compliance implementation
 */

import { privacyAnalytics } from '../utils/privacy-analytics.js';
import { consentModal } from './consent-modal.js';

export class PrivacySettings {
  constructor() {
    this.isOpen = false;
    this.settingsEl = null;
    this.backdropEl = null;

    this.init();
  }

  init() {
    this.createSettingsInterface();
    this.bindEvents();
  }

  createSettingsInterface() {
    // Create backdrop
    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'privacy-settings-backdrop';
    this.backdropEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 5000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;

    // Create settings interface
    this.settingsEl = document.createElement('div');
    this.settingsEl.className = 'privacy-settings';
    this.settingsEl.innerHTML = `
      <div class="settings-header">
        <h2>Privacy Settings</h2>
        <p class="settings-subtitle">Manage your data and privacy preferences</p>
        <button class="settings-close" aria-label="Close privacy settings">×</button>
      </div>

      <div class="settings-content">
        <section class="settings-section">
          <h3>Current Privacy Level</h3>
          <div class="current-consent" id="current-consent">
            <div class="consent-badge" id="consent-badge">Loading...</div>
            <p class="consent-description" id="consent-description">Checking current settings...</p>
          </div>
          <button class="btn btn-secondary" id="change-consent">Change Privacy Preferences</button>
        </section>

        <section class="settings-section">
          <h3>Analytics Summary</h3>
          <div class="analytics-summary" id="analytics-summary">
            <div class="summary-item">
              <span class="summary-label">Session ID:</span>
              <span class="summary-value" id="session-id">Loading...</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Data Collection:</span>
              <span class="summary-value" id="data-collection">Loading...</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Data Retention:</span>
              <span class="summary-value" id="data-retention">6 hours (session), 90 days (aggregate)</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Buffered Events:</span>
              <span class="summary-value" id="buffered-events">Loading...</span>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h3>Your Rights</h3>
          <div class="rights-actions">
            <div class="rights-item">
              <div class="rights-info">
                <h4>Access Your Data</h4>
                <p>View a summary of data we've collected about your FolkUp Quest usage.</p>
              </div>
              <button class="btn btn-secondary" id="view-data">View Data Summary</button>
            </div>

            <div class="rights-item">
              <div class="rights-info">
                <h4>Download Your Data</h4>
                <p>Export your game progress and analytics data in JSON format.</p>
              </div>
              <button class="btn btn-secondary" id="export-data">Export Data</button>
            </div>

            <div class="rights-item">
              <div class="rights-info">
                <h4>Delete Your Data</h4>
                <p>Permanently remove all analytics data. Game saves will remain.</p>
              </div>
              <button class="btn btn-danger" id="delete-data">Delete Analytics Data</button>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h3>Legal Information</h3>
          <div class="legal-info">
            <p><strong>Data Controller:</strong> FolkUp Quest Development Team</p>
            <p><strong>Legal Basis:</strong> Legitimate Interest (Essential), Consent (Analytics)</p>
            <p><strong>Data Protection:</strong> GDPR Article 6(1)(f) & 6(1)(a)</p>
            <p><strong>Contact:</strong> anklemqq@gmail.com for privacy inquiries</p>
          </div>
        </section>
      </div>

      <div class="settings-footer">
        <button class="btn btn-primary" id="close-settings">Close</button>
      </div>
    `;

    // Add settings styles
    this.settingsEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 90%;
      max-width: 700px;
      height: 85vh;
      background: var(--folkup-ivory);
      border-radius: 12px;
      transform: translate(-50%, -50%) scale(0.95);
      z-index: 5001;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      font-family: 'Source Sans 3', sans-serif;
      color: var(--folkup-charcoal);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    `;

    this.backdropEl.appendChild(this.settingsEl);
    document.body.appendChild(this.backdropEl);

    this.addSettingsStyles();
  }

  addSettingsStyles() {
    if (document.getElementById('privacy-settings-styles')) return;

    const style = document.createElement('style');
    style.id = 'privacy-settings-styles';
    style.textContent = `
      .settings-header {
        padding: 24px 32px;
        border-bottom: 1px solid var(--folkup-sage-light);
        position: relative;
      }

      .settings-header h2 {
        margin: 0 0 4px;
        font-family: 'Playfair Display', serif;
        font-size: 1.4rem;
        color: var(--folkup-charcoal);
      }

      .settings-subtitle {
        margin: 0;
        color: var(--folkup-sage);
        font-size: 0.9rem;
      }

      .settings-close {
        position: absolute;
        top: 24px;
        right: 32px;
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--folkup-sage);
        cursor: pointer;
        line-height: 1;
        transition: color 0.2s ease;
      }

      .settings-close:hover {
        color: var(--folkup-bordeaux);
      }

      .settings-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px 32px;
      }

      .settings-section {
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--folkup-sage-light);
      }

      .settings-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .settings-section h3 {
        margin: 0 0 16px;
        font-size: 1.1rem;
        color: var(--folkup-charcoal);
        font-weight: 600;
      }

      .current-consent {
        background: var(--folkup-parchment);
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .consent-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .consent-badge.essential {
        background: var(--folkup-sage-light);
        color: var(--folkup-charcoal);
      }

      .consent-badge.analytics {
        background: var(--folkup-sage);
        color: white;
      }

      .consent-badge.enhancements {
        background: linear-gradient(135deg, var(--folkup-sage), var(--folkup-bordeaux));
        color: white;
      }

      .consent-description {
        margin: 0;
        font-size: 0.9rem;
        color: var(--folkup-sage);
        line-height: 1.4;
      }

      .analytics-summary {
        background: var(--folkup-parchment);
        padding: 16px;
        border-radius: 8px;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--folkup-sage-light);
      }

      .summary-item:last-child {
        border-bottom: none;
      }

      .summary-label {
        font-weight: 500;
        color: var(--folkup-charcoal);
      }

      .summary-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        color: var(--folkup-sage);
      }

      .rights-actions {
        space-y: 16px;
      }

      .rights-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--folkup-sage-light);
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .rights-info {
        flex: 1;
        margin-right: 16px;
      }

      .rights-info h4 {
        margin: 0 0 4px;
        font-size: 1rem;
        color: var(--folkup-charcoal);
      }

      .rights-info p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--folkup-sage);
        line-height: 1.4;
      }

      .legal-info {
        background: var(--folkup-parchment);
        padding: 16px;
        border-radius: 8px;
        font-size: 0.85rem;
        line-height: 1.6;
      }

      .legal-info p {
        margin: 8px 0;
        color: var(--folkup-sage);
      }

      .settings-footer {
        padding: 20px 32px;
        border-top: 1px solid var(--folkup-sage-light);
        background: var(--folkup-parchment);
        border-radius: 0 0 12px 12px;
        text-align: right;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .btn-secondary {
        background: transparent;
        color: var(--folkup-sage);
        border: 1px solid var(--folkup-sage-light);
      }

      .btn-secondary:hover {
        background: var(--folkup-sage-light);
        color: var(--folkup-charcoal);
      }

      .btn-primary {
        background: var(--folkup-sage);
        color: white;
      }

      .btn-primary:hover {
        background: var(--folkup-charcoal);
      }

      .btn-danger {
        background: transparent;
        color: var(--folkup-bordeaux);
        border: 1px solid var(--folkup-bordeaux);
      }

      .btn-danger:hover {
        background: var(--folkup-bordeaux);
        color: white;
      }

      @media (max-width: 768px) {
        .rights-item {
          flex-direction: column;
          text-align: center;
          gap: 12px;
        }

        .rights-info {
          margin-right: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  bindEvents() {
    // Close settings
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) {
        this.close();
      }
    });

    this.settingsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('settings-close') || e.target.id === 'close-settings') {
        this.close();
      }

      if (e.target.id === 'change-consent') {
        consentModal.openForSettings();
      }

      if (e.target.id === 'view-data') {
        this.showDataSummary();
      }

      if (e.target.id === 'export-data') {
        this.exportUserData();
      }

      if (e.target.id === 'delete-data') {
        this.deleteAnalyticsData();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.updateSettingsData();

    // Show interface
    this.backdropEl.style.visibility = 'visible';
    this.backdropEl.style.opacity = '1';
    this.settingsEl.style.visibility = 'visible';
    this.settingsEl.style.opacity = '1';
    this.settingsEl.style.transform = 'translate(-50%, -50%) scale(1)';

    document.body.style.overflow = 'hidden';

    // Track settings opened
    privacyAnalytics.trackPrivacyAction('settings_opened');
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.backdropEl.style.opacity = '0';
    this.backdropEl.style.visibility = 'hidden';
    this.settingsEl.style.opacity = '0';
    this.settingsEl.style.visibility = 'hidden';
    this.settingsEl.style.transform = 'translate(-50%, -50%) scale(0.95)';

    document.body.style.overflow = '';
  }

  updateSettingsData() {
    const summary = privacyAnalytics.getPrivacySummary();

    // Update consent badge
    const consentBadge = this.settingsEl.querySelector('#consent-badge');
    const consentDescription = this.settingsEl.querySelector('#consent-description');

    consentBadge.className = `consent-badge ${summary.consentLevel}`;
    consentBadge.textContent = {
      essential: 'Essential Only',
      analytics: 'Analytics Enabled',
      enhancements: 'Full Experience'
    }[summary.consentLevel] || 'Unknown';

    consentDescription.textContent = {
      essential: 'Only essential game functions. No tracking or analytics.',
      analytics: 'Basic analytics enabled to improve storytelling and user experience.',
      enhancements: 'Full analytics and personalization features enabled.'
    }[summary.consentLevel] || 'Unknown consent level';

    // Update analytics summary
    this.settingsEl.querySelector('#session-id').textContent =
      summary.sessionId || 'No active session';

    this.settingsEl.querySelector('#data-collection').textContent =
      summary.canTrackAnalytics ? 'Enabled' : 'Disabled';

    this.settingsEl.querySelector('#buffered-events').textContent =
      `${summary.bufferSize} events`;

    // Show session expiry if available
    if (summary.sessionExpires) {
      const expiryDate = new Date(summary.sessionExpires);
      const timeLeft = Math.max(0, summary.sessionExpires - Date.now());
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

      this.settingsEl.querySelector('#data-retention').textContent =
        `Session expires in ${hoursLeft}h ${minutesLeft}m`;
    }
  }

  showDataSummary() {
    const summary = privacyAnalytics.getPrivacySummary();

    const dataDetails = {
      sessionInfo: {
        sessionId: summary.sessionId,
        created: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        expires: summary.sessionExpires ? new Date(summary.sessionExpires).toISOString() : null
      },
      consentInfo: {
        level: summary.consentLevel,
        canTrackAnalytics: summary.canTrackAnalytics,
        canTrackEnhancements: summary.canTrackEnhancements
      },
      dataBuffer: {
        eventCount: summary.bufferSize,
        enabled: summary.isEnabled
      }
    };

    // Show in a formatted alert (in production, use a proper modal)
    const formattedData = JSON.stringify(dataDetails, null, 2);
    alert(`Your FolkUp Quest Data Summary:\n\n${formattedData}`);

    // Track data access
    privacyAnalytics.trackPrivacyAction('data_accessed', {
      method: 'summary_view'
    });
  }

  exportUserData() {
    try {
      // Gather all user data for export
      const exportData = {
        analytics: privacyAnalytics.getPrivacySummary(),
        gameData: {
          unlockedPanels: JSON.parse(localStorage.getItem('fqst.panels.unlocked') || '[]'),
          gameProgress: localStorage.getItem('fqst.save') ? 'present' : 'none'
        },
        privacy: {
          consent: JSON.parse(localStorage.getItem('fqst.privacy.consent') || 'null'),
          session: JSON.parse(localStorage.getItem('fqst.analytics.session') || 'null')
        },
        exportInfo: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          format: 'JSON'
        }
      };

      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `folkup-quest-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      // Track export
      privacyAnalytics.trackPrivacyAction('data_exported', {
        format: 'json',
        size_kb: Math.round(dataBlob.size / 1024)
      });

      alert('Your data has been exported successfully!');
    } catch (e) {
      console.error('Export failed:', e);
      alert('Failed to export data. Please try again.');
    }
  }

  deleteAnalyticsData() {
    const confirmation = confirm(
      'Are you sure you want to delete all analytics data?\n\n' +
      'This will:\n' +
      '• Remove your analytics session\n' +
      '• Clear all tracking preferences\n' +
      '• Reset to essential-only mode\n' +
      '• Keep your game saves\n\n' +
      'This action cannot be undone.'
    );

    if (confirmation) {
      const success = privacyAnalytics.deleteAllData();

      if (success) {
        alert('Analytics data deleted successfully. Privacy reset to essential-only mode.');
        this.updateSettingsData();
      } else {
        alert('Failed to delete some data. Please clear browser storage manually.');
      }
    }
  }
}

// Global instance
export const privacySettings = new PrivacySettings();