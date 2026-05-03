/**
 * Comic Panel Modal System — FolkUp Quest
 * Based on declaration-guide CookieConsent pattern
 * WCAG 2.1 AA modal with focus trap + keyboard navigation
 */

export class PanelModal {
  constructor() {
    this.currentPanel = null;
    this.unlockedPanels = this.loadUnlockedPanels();
    this.modal = null;
    this.focusTrapElements = [];
    this.lastActiveElement = null;

    this.init();
  }

  /**
   * Initialize modal system
   */
  init() {
    this.createModalElement();
    this.bindEvents();
  }

  /**
   * Load unlocked panels from localStorage
   * @returns {Set} Set of unlocked panel IDs
   */
  loadUnlockedPanels() {
    try {
      const stored = localStorage.getItem('fqst.panels.unlocked');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.warn('Failed to load panel unlock state:', e);
      return new Set();
    }
  }

  /**
   * Save unlocked panels to localStorage
   */
  saveUnlockedPanels() {
    try {
      localStorage.setItem('fqst.panels.unlocked', JSON.stringify([...this.unlockedPanels]));
    } catch (e) {
      console.warn('Failed to save panel unlock state:', e);
    }
  }

  /**
   * Create modal DOM element
   */
  createModalElement() {
    this.modal = document.createElement('div');
    this.modal.className = 'panel-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-hidden', 'true');

    this.modal.innerHTML = `
      <div class="panel-content" tabindex="-1">
        <img class="panel-image" src="" alt="" />
        <div class="panel-info">
          <h3 class="panel-title"></h3>
          <p class="panel-description"></p>
          <div class="panel-controls">
            <button class="panel-nav panel-prev" type="button">← Предыдущая</button>
            <button class="panel-nav panel-next" type="button">Следующая →</button>
            <button class="panel-close" type="button">Закрыть</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.setupFocusTrap();
  }

  /**
   * Setup focus trap elements
   */
  setupFocusTrap() {
    this.focusTrapElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    this.modal.querySelector('.panel-close').addEventListener('click', () => {
      this.close();
    });

    // Navigation buttons
    this.modal.querySelector('.panel-prev').addEventListener('click', () => {
      this.navigateToPrevious();
    });

    this.modal.querySelector('.panel-next').addEventListener('click', () => {
      this.navigateToNext();
    });

    // Keyboard events
    this.modal.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e
   */
  handleKeydown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.close();
        break;

      case 'Tab':
        this.handleTabKey(e);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        this.navigateToPrevious();
        break;

      case 'ArrowRight':
        e.preventDefault();
        this.navigateToNext();
        break;
    }
  }

  /**
   * Handle Tab key for focus trap
   * @param {KeyboardEvent} e
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
   * Show panel modal
   * @param {string} panelId — e.g. "panel-1.1"
   */
  async show(panelId) {
    if (!this.isUnlocked(panelId)) {
      console.warn(`Panel ${panelId} is not unlocked yet`);
      return;
    }

    try {
      const panelData = await this.loadPanelData(panelId);
      if (!panelData) {
        console.error(`Failed to load panel data for ${panelId}`);
        return;
      }

      this.currentPanel = panelId;
      this.updateModalContent(panelData);
      this.open();
    } catch (error) {
      console.error('Error showing panel:', error);
    }
  }

  /**
   * Load panel data (image + metadata)
   * @param {string} panelId
   * @returns {Promise<Object|null>}
   */
  async loadPanelData(panelId) {
    try {
      // Load panel metadata
      const manifestResponse = await fetch(`/comic/panels/${panelId}-manifest.json`);
      if (!manifestResponse.ok) {
        throw new Error(`Manifest not found: ${panelId}-manifest.json`);
      }

      const manifest = await manifestResponse.json();

      // Construct panel data
      return {
        id: panelId,
        title: manifest.title || `Chapter ${panelId}`,
        description: manifest.description || 'Фрагмент истории из мира FolkUp Quest',
        imageSrc: `/comic/panels/${panelId}-generated.png`,
        altText: manifest.alt || manifest.description || `Comic panel ${panelId}`
      };
    } catch (error) {
      console.error(`Failed to load panel ${panelId}:`, error);
      return null;
    }
  }

  /**
   * Update modal content
   * @param {Object} panelData
   */
  updateModalContent(panelData) {
    const image = this.modal.querySelector('.panel-image');
    const title = this.modal.querySelector('.panel-title');
    const description = this.modal.querySelector('.panel-description');

    image.src = panelData.imageSrc;
    image.alt = panelData.altText;
    title.textContent = panelData.title;
    description.textContent = panelData.description;

    this.updateNavigationButtons();
  }

  /**
   * Update navigation button states
   */
  updateNavigationButtons() {
    const prevBtn = this.modal.querySelector('.panel-prev');
    const nextBtn = this.modal.querySelector('.panel-next');

    // For now, disable navigation (implement in Phase 3)
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }

  /**
   * Open modal with focus trap
   */
  open() {
    this.lastActiveElement = document.activeElement;

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');

    // Focus first interactive element
    const firstFocusable = this.focusTrapElements[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal and restore focus
   */
  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }

    this.currentPanel = null;
  }

  /**
   * Navigate to previous panel (placeholder)
   */
  navigateToPrevious() {
    // TODO: Implement in Phase 3
    console.log('Navigate to previous panel');
  }

  /**
   * Navigate to next panel (placeholder)
   */
  navigateToNext() {
    // TODO: Implement in Phase 3
    console.log('Navigate to next panel');
  }

  /**
   * Unlock a panel
   * @param {string} panelId
   */
  unlockPanel(panelId) {
    if (!this.unlockedPanels.has(panelId)) {
      this.unlockedPanels.add(panelId);
      this.saveUnlockedPanels();

      // Dispatch unlock event
      window.dispatchEvent(new CustomEvent('panelUnlocked', {
        detail: { panelId }
      }));

      console.log(`🎨 Panel unlocked: ${panelId}`);
    }
  }

  /**
   * Check if panel is unlocked
   * @param {string} panelId
   * @returns {boolean}
   */
  isUnlocked(panelId) {
    return this.unlockedPanels.has(panelId);
  }

  /**
   * Get all unlocked panels
   * @returns {string[]}
   */
  getUnlockedPanels() {
    return [...this.unlockedPanels];
  }
}

// Global instance
export const panelModal = new PanelModal();