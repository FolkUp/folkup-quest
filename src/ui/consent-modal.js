/**
 * GDPR Consent Management Modal — FolkUp Quest
 *
 * Implements granular consent collection with WCAG 2.1 AA compliance
 * and constitutional privacy design principles.
 */

import { privacyAnalytics } from '../utils/privacy-analytics.js';

export class ConsentModal {
  constructor() {
    this.modal = null;
    this.focusTrapElements = [];
    this.lastActiveElement = null;
    this.isShown = false;

    this.init();
  }

  /**
   * Initialize consent modal system
   */
  init() {
    this.createModalElement();
    this.bindEvents();
    this.checkConsentNeeded();
  }

  /**
   * Check if consent collection is needed
   */
  checkConsentNeeded() {
    const consentLevel = privacyAnalytics.getConsentLevel();

    // Show modal if no valid consent exists
    if (consentLevel === 'essential' && !this.hasValidConsent()) {
      // Delay to allow page to load
      setTimeout(() => this.show(), 1000);
    }
  }

  /**
   * Check if user has valid consent on file
   */
  hasValidConsent() {
    try {
      const stored = localStorage.getItem('fqst.privacy.consent');
      if (stored) {
        const consent = JSON.parse(stored);
        return consent.expires && Date.now() < consent.expires;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  /**
   * Create modal DOM element
   */
  createModalElement() {
    this.modal = document.createElement('div');
    this.modal.className = 'consent-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'consent-title');
    this.modal.setAttribute('aria-describedby', 'consent-description');
    this.modal.setAttribute('aria-hidden', 'true');

    this.modal.innerHTML = `
      <div class="consent-backdrop">
        <div class="consent-content" tabindex="-1">
          <div class="consent-header">
            <h2 id="consent-title">Privacy & Data Usage</h2>
            <p id="consent-description">
              FolkUp Quest respects your privacy. Please choose how we may use data to improve your experience.
            </p>
          </div>

          <div class="consent-body">
            <div class="consent-options">
              <div class="consent-option">
                <div class="consent-option-header">
                  <label class="consent-label">
                    <input type="radio" name="consent-level" value="essential" checked />
                    <span class="consent-title">Essential Only</span>
                    <span class="consent-status">Required</span>
                  </label>
                </div>
                <div class="consent-description">
                  <p>Game functionality, save data, and security. No tracking or analytics.</p>
                  <p class="legal-basis">Legal basis: Art. 6(1)(f) — Legitimate Interest</p>
                </div>
              </div>

              <div class="consent-option">
                <div class="consent-option-header">
                  <label class="consent-label">
                    <input type="radio" name="consent-level" value="analytics" />
                    <span class="consent-title">Essential + Analytics</span>
                    <span class="consent-status">Optional</span>
                  </label>
                </div>
                <div class="consent-description">
                  <p>Panel engagement tracking, navigation patterns, and reading behavior to improve storytelling.</p>
                  <ul>
                    <li>Panel viewing time and frequency</li>
                    <li>Navigation patterns between panels</li>
                    <li>Gallery usage statistics</li>
                    <li>Anonymous session data (6-hour retention)</li>
                  </ul>
                  <p class="legal-basis">Legal basis: Art. 6(1)(a) — Consent</p>
                </div>
              </div>

              <div class="consent-option">
                <div class="consent-option-header">
                  <label class="consent-label">
                    <input type="radio" name="consent-level" value="enhancements" />
                    <span class="consent-title">Full Experience</span>
                    <span class="consent-status">Optional</span>
                  </label>
                </div>
                <div class="consent-description">
                  <p>All analytics plus personalization features and enhanced recommendations.</p>
                  <ul>
                    <li>All analytics features</li>
                    <li>Personalized content suggestions</li>
                    <li>Enhanced achievement tracking</li>
                    <li>Cross-session preferences</li>
                  </ul>
                  <p class="legal-basis">Legal basis: Art. 6(1)(a) — Consent</p>
                </div>
              </div>
            </div>

            <div class="consent-details">
              <details class="privacy-details">
                <summary>Privacy Details</summary>
                <div class="privacy-content">
                  <h4>Data Retention</h4>
                  <ul>
                    <li><strong>Session data:</strong> 6 hours maximum</li>
                    <li><strong>Aggregate analytics:</strong> 90 days maximum</li>
                    <li><strong>Game saves:</strong> Until manually deleted</li>
                  </ul>

                  <h4>Your Rights</h4>
                  <ul>
                    <li>Withdraw consent at any time via Privacy Settings</li>
                    <li>Request data deletion (Right to be forgotten)</li>
                    <li>Access your data summary</li>
                    <li>Data portability upon request</li>
                  </ul>

                  <h4>Technical Implementation</h4>
                  <ul>
                    <li>No persistent user IDs or fingerprinting</li>
                    <li>Temporary session tokens only</li>
                    <li>Local processing first, minimal server communication</li>
                    <li>Automatic data expiry and cleanup</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>

          <div class="consent-actions">
            <button type="button" class="btn btn-secondary" id="consent-privacy-settings">
              Privacy Settings
            </button>
            <button type="button" class="btn btn-primary" id="consent-accept">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.setupFocusTrap();
    this.addStyles();
  }

  /**
   * Add consent modal styles
   */
  addStyles() {
    if (document.getElementById('consent-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'consent-modal-styles';
    style.textContent = `
      .consent-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .consent-modal.active {
        opacity: 1;
        visibility: visible;
      }

      .consent-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .consent-content {
        background: var(--folkup-ivory, #faf8f3);
        border-radius: 12px;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        transform: scale(0.95);
        transition: transform 0.3s ease;
        font-family: 'Source Sans 3', -apple-system, system-ui, sans-serif;
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .consent-modal.active .consent-content {
        transform: scale(1);
      }

      .consent-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid var(--folkup-sage-light, #e0ddd4);
      }

      .consent-header h2 {
        margin: 0 0 8px;
        font-family: 'Playfair Display', serif;
        font-size: 1.4rem;
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .consent-header p {
        margin: 0;
        color: var(--folkup-sage, #7a8471);
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .consent-body {
        padding: 20px 24px;
      }

      .consent-options {
        space-y: 16px;
      }

      .consent-option {
        border: 2px solid var(--folkup-sage-light, #e0ddd4);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        transition: border-color 0.2s ease;
      }

      .consent-option:hover {
        border-color: var(--folkup-sage, #7a8471);
      }

      .consent-option:has(input:checked) {
        border-color: var(--folkup-sage, #7a8471);
        background: var(--folkup-parchment, #f5f3ed);
      }

      .consent-option-header {
        margin-bottom: 8px;
      }

      .consent-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-weight: 500;
      }

      .consent-label input[type="radio"] {
        width: 18px;
        height: 18px;
        accent-color: var(--folkup-sage, #7a8471);
      }

      .consent-title {
        flex: 1;
        font-size: 1rem;
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .consent-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      .consent-status {
        background: var(--folkup-sage-light, #e0ddd4);
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .consent-description {
        font-size: 0.85rem;
        color: var(--folkup-sage, #7a8471);
        line-height: 1.4;
      }

      .consent-description p {
        margin: 0 0 8px;
      }

      .consent-description ul {
        margin: 8px 0;
        padding-left: 20px;
      }

      .consent-description li {
        margin: 4px 0;
      }

      .legal-basis {
        font-size: 0.75rem !important;
        color: var(--folkup-bordeaux, #8b4a6b) !important;
        font-style: italic;
        margin-top: 8px !important;
      }

      .consent-details {
        margin-top: 20px;
        border-top: 1px solid var(--folkup-sage-light, #e0ddd4);
        padding-top: 16px;
      }

      .privacy-details summary {
        cursor: pointer;
        font-weight: 500;
        color: var(--folkup-sage, #7a8471);
        font-size: 0.9rem;
      }

      .privacy-content {
        padding: 12px 0;
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--folkup-sage, #7a8471);
      }

      .privacy-content h4 {
        margin: 16px 0 8px;
        font-size: 0.9rem;
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .privacy-content ul {
        margin: 8px 0;
        padding-left: 20px;
      }

      .privacy-content li {
        margin: 4px 0;
      }

      .consent-actions {
        padding: 16px 24px;
        border-top: 1px solid var(--folkup-sage-light, #e0ddd4);
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        background: var(--folkup-parchment, #f5f3ed);
        border-radius: 0 0 12px 12px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .btn-secondary {
        background: transparent;
        color: var(--folkup-sage, #7a8471);
        border: 1px solid var(--folkup-sage-light, #e0ddd4);
      }

      .btn-secondary:hover {
        background: var(--folkup-sage-light, #e0ddd4);
        color: var(--folkup-charcoal, #2d2d2d);
      }

      .btn-primary {
        background: var(--folkup-sage, #7a8471);
        color: white;
      }

      .btn-primary:hover {
        background: var(--folkup-charcoal, #2d2d2d);
      }

      @media (max-width: 640px) {
        .consent-content {
          margin: 10px;
          max-height: 95vh;
        }

        .consent-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup focus trap
   */
  setupFocusTrap() {
    this.focusTrapElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), summary'
    );
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Accept button
    this.modal.querySelector('#consent-accept').addEventListener('click', () => {
      this.saveConsent();
    });

    // Privacy settings button
    this.modal.querySelector('#consent-privacy-settings').addEventListener('click', () => {
      this.showPrivacySettings();
    });

    // Keyboard navigation
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      } else if (e.key === 'Escape') {
        // Consent modal should not be escapable until choice is made
        e.preventDefault();
      }
    });

    // Prevent clicking outside to close
    this.modal.querySelector('.consent-backdrop').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  /**
   * Handle Tab key for focus trap
   */
  handleTabKey(e) {
    if (this.focusTrapElements.length === 0) return;

    const firstElement = this.focusTrapElements[0];
    const lastElement = this.focusTrapElements[this.focusTrapElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Show consent modal
   */
  show() {
    if (this.isShown) return;

    this.isShown = true;
    this.lastActiveElement = document.activeElement;

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');

    // Focus first interactive element
    const firstFocusable = this.focusTrapElements[0];
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Track modal shown
    privacyAnalytics.trackPrivacyAction('consent_modal_shown', {
      trigger: 'first_visit'
    });
  }

  /**
   * Hide consent modal
   */
  hide() {
    if (!this.isShown) return;

    this.isShown = false;

    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
  }

  /**
   * Save consent preferences
   */
  saveConsent() {
    const selectedLevel = this.modal.querySelector('input[name="consent-level"]:checked')?.value;

    if (!selectedLevel) {
      alert('Please select a privacy preference.');
      return;
    }

    // Update analytics consent
    privacyAnalytics.setConsentLevel(selectedLevel, true);

    // Track consent decision
    privacyAnalytics.trackPrivacyAction('consent_granted', {
      level: selectedLevel,
      source: 'modal'
    });

    // Show confirmation
    this.showConsentConfirmation(selectedLevel);

    // Hide modal after short delay
    setTimeout(() => {
      this.hide();
    }, 2000);
  }

  /**
   * Show consent confirmation
   */
  showConsentConfirmation(level) {
    const messages = {
      essential: 'Essential functions only. Your privacy is protected.',
      analytics: 'Analytics enabled. Help us improve FolkUp Quest!',
      enhancements: 'Full experience unlocked. Thank you for your trust!'
    };

    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--folkup-sage, #7a8471);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: 'Source Sans 3', sans-serif;
      font-size: 0.9rem;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    toast.textContent = messages[level];
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  /**
   * Show privacy settings (opens a separate interface)
   */
  showPrivacySettings() {
    // For now, show alert with privacy info
    alert(`Privacy Settings

Current consent level: ${privacyAnalytics.getConsentLevel()}

You can change your privacy preferences at any time via the game menu or by clearing your browser data.

For questions about data usage, contact: anklemqq@gmail.com`);
  }

  /**
   * Open consent modal for settings changes
   */
  openForSettings() {
    // Pre-select current consent level
    const currentLevel = privacyAnalytics.getConsentLevel();
    const radio = this.modal.querySelector(`input[name="consent-level"][value="${currentLevel}"]`);
    if (radio) {
      radio.checked = true;
    }

    this.show();
  }
}

// Global instance
export const consentModal = new ConsentModal();