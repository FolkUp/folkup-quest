/**
 * Panel Reader — Standalone comic panel gallery
 * Allows browsing unlocked panels independently from game
 */

import { getPanelsByCategory, PANEL_PROGRESSION } from '../engine/panel-progression.js';
import { panelModal } from './panel-modal.js';

export class PanelReader {
  constructor() {
    this.isOpen = false;
    this.currentCategory = 'act1';
    this.categories = null;
    this.readerEl = null;
    this.backdropEl = null;

    this.init();
  }

  init() {
    this.createReaderInterface();
    this.bindEvents();
  }

  createReaderInterface() {
    // Create backdrop
    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'panel-reader-backdrop';
    this.backdropEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;

    // Create reader interface
    this.readerEl = document.createElement('div');
    this.readerEl.className = 'panel-reader';
    this.readerEl.innerHTML = `
      <div class="reader-header">
        <h2>FolkUp Quest Gallery</h2>
        <p class="reader-subtitle">Browse unlocked comic panels</p>
        <button class="reader-close" aria-label="Close gallery">×</button>
      </div>

      <nav class="reader-nav" role="tablist">
        <button class="nav-tab active" data-category="act1" role="tab" aria-selected="true">
          Act I: Discovery
        </button>
        <button class="nav-tab" data-category="act2" role="tab" aria-selected="false">
          Act II: Challenge
        </button>
        <button class="nav-tab" data-category="act3" role="tab" aria-selected="false">
          Act III: Resolution
        </button>
        <button class="nav-tab" data-category="epilogue" role="tab" aria-selected="false">
          Epilogue
        </button>
        <button class="nav-tab" data-category="bonus" role="tab" aria-selected="false">
          Bonus
        </button>
      </nav>

      <div class="reader-content" role="tabpanel">
        <div class="panels-grid" id="panels-grid">
          <!-- Panels will be populated here -->
        </div>
      </div>

      <div class="reader-footer">
        <div class="progress-info">
          <span id="unlocked-count">0</span> / <span id="total-count">28</span> panels unlocked
        </div>
        <div class="reader-actions">
          <button class="btn btn-secondary" id="reader-help">Help</button>
          <button class="btn btn-primary" id="return-to-game">Return to Game</button>
        </div>
      </div>
    `;

    // Add reader styles
    this.readerEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 90%;
      max-width: 1200px;
      height: 85vh;
      background: var(--folkup-ivory);
      border-radius: 12px;
      transform: translate(-50%, -50%) scale(0.95);
      z-index: 2001;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      font-family: 'Source Sans 3', sans-serif;
      color: var(--folkup-charcoal);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    `;

    this.backdropEl.appendChild(this.readerEl);
    document.body.appendChild(this.backdropEl);

    this.addReaderStyles();
  }

  addReaderStyles() {
    if (document.getElementById('panel-reader-styles')) return;

    const style = document.createElement('style');
    style.id = 'panel-reader-styles';
    style.textContent = `
      .reader-header {
        padding: 24px 32px;
        border-bottom: 1px solid var(--folkup-sage-light);
        position: relative;
      }

      .reader-header h2 {
        margin: 0 0 4px;
        font-family: 'Playfair Display', serif;
        font-size: 1.5rem;
        color: var(--folkup-charcoal);
      }

      .reader-subtitle {
        margin: 0;
        color: var(--folkup-sage);
        font-size: 0.9rem;
      }

      .reader-close {
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

      .reader-close:hover {
        color: var(--folkup-bordeaux);
      }

      .reader-nav {
        display: flex;
        border-bottom: 1px solid var(--folkup-sage-light);
        background: var(--folkup-parchment);
      }

      .nav-tab {
        flex: 1;
        padding: 16px;
        background: none;
        border: none;
        font-family: inherit;
        font-size: 0.9rem;
        color: var(--folkup-sage);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-tab:hover {
        background: var(--folkup-ivory);
        color: var(--folkup-charcoal);
      }

      .nav-tab.active {
        background: var(--folkup-ivory);
        color: var(--folkup-charcoal);
        font-weight: 500;
      }

      .nav-tab.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--folkup-sage);
      }

      .reader-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      .panels-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .panel-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
      }

      .panel-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .panel-card.locked {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--folkup-parchment);
      }

      .panel-card.locked:hover {
        transform: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .panel-preview {
        width: 100%;
        height: 180px;
        background: var(--folkup-sage-light);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .panel-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .panel-locked-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        backdrop-filter: blur(2px);
      }

      .panel-locked-text {
        font-size: 0.9rem;
        margin-top: 8px;
        opacity: 0.8;
      }

      .panel-info {
        padding: 16px;
      }

      .panel-title {
        margin: 0 0 8px;
        font-weight: 600;
        color: var(--folkup-charcoal);
        font-size: 1rem;
      }

      .panel-description {
        margin: 0;
        color: var(--folkup-sage);
        font-size: 0.85rem;
        line-height: 1.4;
      }

      .panel-badges {
        display: flex;
        gap: 6px;
        margin-top: 12px;
      }

      .panel-badge {
        background: var(--folkup-sage-light);
        color: var(--folkup-charcoal);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .panel-badge.folk {
        background: var(--folkup-sage);
        color: white;
      }

      .panel-badge.dragon {
        background: var(--folkup-bordeaux);
        color: white;
      }

      .panel-badge.bonus {
        background: linear-gradient(135deg, var(--folkup-sage), var(--folkup-bordeaux));
        color: white;
      }

      .reader-footer {
        padding: 20px 32px;
        border-top: 1px solid var(--folkup-sage-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--folkup-parchment);
      }

      .progress-info {
        font-size: 0.9rem;
        color: var(--folkup-sage);
      }

      .reader-actions {
        display: flex;
        gap: 12px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-secondary {
        background: transparent;
        color: var(--folkup-sage);
        border: 1px solid var(--folkup-sage-light);
      }

      .btn-secondary:hover {
        background: var(--folkup-sage-light);
      }

      .btn-primary {
        background: var(--folkup-sage);
        color: white;
      }

      .btn-primary:hover {
        background: var(--folkup-charcoal);
      }

      @media (max-width: 768px) {
        .panels-grid {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .reader-nav {
          flex-wrap: wrap;
        }

        .nav-tab {
          flex: 1 1 45%;
          font-size: 0.8rem;
        }

        .reader-footer {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(style);
  }

  bindEvents() {
    // Close reader
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) {
        this.close();
      }
    });

    this.readerEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('reader-close')) {
        this.close();
      }

      if (e.target.classList.contains('nav-tab')) {
        this.switchCategory(e.target.dataset.category);
      }

      if (e.target.closest('.panel-card:not(.locked)')) {
        const card = e.target.closest('.panel-card');
        const panelId = card.dataset.panelId;
        if (panelId) {
          panelModal.show(panelId);
        }
      }

      if (e.target.id === 'return-to-game') {
        this.close();
      }

      if (e.target.id === 'reader-help') {
        this.showHelp();
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
    this.loadPanels();

    // Show interface
    this.backdropEl.style.visibility = 'visible';
    this.backdropEl.style.opacity = '1';
    this.readerEl.style.visibility = 'visible';
    this.readerEl.style.opacity = '1';
    this.readerEl.style.transform = 'translate(-50%, -50%) scale(1)';

    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.backdropEl.style.opacity = '0';
    this.backdropEl.style.visibility = 'hidden';
    this.readerEl.style.opacity = '0';
    this.readerEl.style.visibility = 'hidden';
    this.readerEl.style.transform = 'translate(-50%, -50%) scale(0.95)';

    document.body.style.overflow = '';
  }

  switchCategory(categoryName) {
    if (this.currentCategory === categoryName) return;

    this.currentCategory = categoryName;

    // Update nav tabs
    this.readerEl.querySelectorAll('.nav-tab').forEach(tab => {
      const isActive = tab.dataset.category === categoryName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Load panels for new category
    this.renderPanelsGrid();
  }

  loadPanels() {
    this.categories = getPanelsByCategory();
    this.renderPanelsGrid();
    this.updateProgressInfo();
  }

  renderPanelsGrid() {
    const grid = this.readerEl.querySelector('#panels-grid');
    const panels = this.categories[this.currentCategory] || [];

    if (panels.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--folkup-sage);">
          <p>No panels in this category yet.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = panels.map(panel => {
      const isUnlocked = panelModal.unlockedPanels.has(panel.id);
      const badges = this.getPanelBadges(panel);

      return `
        <div class="panel-card ${isUnlocked ? '' : 'locked'}" data-panel-id="${panel.id}">
          <div class="panel-preview">
            ${isUnlocked
              ? `<img src="/comic/panels/${panel.id}-generated.png" alt="${panel.title}" />`
              : `<div class="panel-locked-overlay">
                   <div>🔒</div>
                   <div class="panel-locked-text">Locked</div>
                 </div>`
            }
          </div>
          <div class="panel-info">
            <h3 class="panel-title">${panel.title}</h3>
            <p class="panel-description">${panel.description}</p>
            ${badges.length > 0 ? `<div class="panel-badges">${badges.join('')}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  getPanelBadges(panel) {
    const badges = [];

    if (panel.required) {
      badges.push('<span class="panel-badge">Story</span>');
    }

    if (panel.folk_path) {
      badges.push('<span class="panel-badge folk">Folk Path</span>');
    }

    if (panel.dragon_path) {
      badges.push('<span class="panel-badge dragon">Dragon Path</span>');
    }

    if (panel.bonus) {
      badges.push('<span class="panel-badge bonus">Bonus</span>');
    }

    if (panel.achievement) {
      badges.push('<span class="panel-badge bonus">Achievement</span>');
    }

    return badges;
  }

  updateProgressInfo() {
    const totalPanels = Object.keys(PANEL_PROGRESSION).length;
    const unlockedCount = panelModal.unlockedPanels.size;

    const unlockedEl = this.readerEl.querySelector('#unlocked-count');
    const totalEl = this.readerEl.querySelector('#total-count');

    if (unlockedEl) unlockedEl.textContent = unlockedCount;
    if (totalEl) totalEl.textContent = totalPanels;
  }

  showHelp() {
    alert(`FolkUp Quest Gallery

Unlock comic panels by playing through the story. Different choices unlock different paths:

• Story panels: Unlock as you progress through main scenes
• Folk Path: Choose community and principles
• Dragon Path: Choose pragmatism and growth
• Bonus panels: High trust with characters
• Achievements: Special combinations and completions

Click any unlocked panel to view it full-screen.`);
  }
}

// Create global instance
export const panelReader = new PanelReader();