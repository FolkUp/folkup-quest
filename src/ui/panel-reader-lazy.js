/**
 * FQST-013 Phase 2: Lazy Loading System
 * Enhanced Alice v2.0 Level 3 Cartouche Autonome
 * Target: Gallery thumbnails with progressive enhancement
 */

export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.loadedImages = new Set();
    this.loadingImages = new Set();
    this.stats = {
      observed: 0,
      loaded: 0,
      errors: 0
    };
  }

  init() {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '100px', // Start loading 100px before viewport
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
        }
      });
    }, options);

    console.log('🔄 LazyImageLoader initialized');
  }

  observe(element) {
    if (!element || this.loadedImages.has(element) || this.loadingImages.has(element)) {
      return;
    }

    if (!this.observer) {
      this.init();
    }

    this.observer.observe(element);
    this.stats.observed++;
  }

  async loadImage(img) {
    if (this.loadedImages.has(img) || this.loadingImages.has(img)) return;

    this.loadingImages.add(img);

    try {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      const panelId = img.closest('[data-panel-id]')?.dataset.panelId;

      if (!src) {
        throw new Error('No data-src attribute found');
      }

      // Create loading indicator
      const loadingIndicator = this.createLoadingIndicator();
      img.parentElement.appendChild(loadingIndicator);

      // Preload image with animation
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in-out';

      // Set up load handlers
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          img.style.opacity = '1';
          loadingIndicator.remove();
          this.stats.loaded++;

          // Track performance
          if (window.performanceAnalytics) {
            window.performanceAnalytics.trackImageLoad(panelId, 'thumb', performance.now());
          }

          resolve();
        };

        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          this.showErrorPlaceholder(img);
          loadingIndicator.remove();
          this.stats.errors++;
          reject(new Error(`Image load failed: ${src}`));
        };

        // Timeout fallback
        setTimeout(() => {
          if (!this.loadedImages.has(img)) {
            console.warn(`Image load timeout: ${src}`);
            img.onerror();
          }
        }, 5000);
      });

      // Apply sources
      if (srcset) img.srcset = srcset;
      img.src = src;

      await loadPromise;

      this.observer.unobserve(img);
      this.loadedImages.add(img);
      this.loadingImages.delete(img);

    } catch (error) {
      console.error('LazyImageLoader error:', error);
      this.loadingImages.delete(img);
    }
  }

  createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'panel-loading-indicator';
    indicator.innerHTML = `
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading...</span>
    `;
    return indicator;
  }

  showErrorPlaceholder(img) {
    img.style.opacity = '1';
    img.alt = 'Failed to load panel';
    img.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#999">
          Panel Unavailable
        </text>
      </svg>
    `);
  }

  unobserveAll() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
    this.loadingImages.clear();
    console.log('🔄 LazyImageLoader cleaned up');
  }

  getStats() {
    return {
      ...this.stats,
      loading: this.loadingImages.size,
      cached: this.loadedImages.size
    };
  }

  // Network-aware loading optimization
  shouldUseWebP() {
    // Check WebP support
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) {
      return false;
    }
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  getOptimalVariant() {
    // Network-aware variant selection
    if (!navigator.connection) return 'thumb';

    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;

    // Conservative approach for gallery thumbnails
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'thumb';
    }

    // Use thumb for gallery, let modal handle medium/full
    return 'thumb';
  }

  // Performance monitoring integration
  reportPerformance() {
    const stats = this.getStats();
    console.log('📊 LazyImageLoader Performance:', {
      observed: stats.observed,
      loaded: stats.loaded,
      errors: stats.errors,
      successRate: `${((stats.loaded / stats.observed) * 100).toFixed(1)}%`
    });

    if (window.performanceAnalytics) {
      window.performanceAnalytics.trackEvent('lazy_loading_performance', {
        observed: stats.observed,
        loaded: stats.loaded,
        errors: stats.errors,
        success_rate: Math.round((stats.loaded / stats.observed) * 100)
      });
    }
  }
}

// Network-adaptive image utilities
export class NetworkAdaptiveLoader {
  static getEffectiveType() {
    if (!navigator.connection) return '4g';
    return navigator.connection.effectiveType;
  }

  static isSlowNetwork() {
    const type = this.getEffectiveType();
    return type === 'slow-2g' || type === '2g';
  }

  static supportsWebP() {
    if (this._webpSupport !== undefined) return this._webpSupport;

    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      const result = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      this._webpSupport = result;
      return result;
    }
    return false;
  }

  static getPanelVariant() {
    const type = this.getEffectiveType();

    // Network-aware image selection for modal
    const variants = {
      '4g': 'full',      // 195KB average
      '3g': 'medium',    // 78KB average
      '2g': 'thumb',     // 40KB average
      'slow-2g': 'thumb' // 40KB average
    };

    return variants[type] || 'medium';
  }

  static shouldPreloadFull() {
    return this.getEffectiveType() === '4g' &&
           navigator.connection?.saveData !== true;
  }

  static getImageFormat(panelId, variant) {
    const supportsWebP = this.supportsWebP();
    const format = supportsWebP ? 'webp' : 'png';
    return `/comic/panels/${panelId}-${variant}.${format}`;
  }
}

// CSS for loading indicators (to be added to styles)
export const LAZY_LOADING_STYLES = `
.panel-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--folkup-sage-dark);
  font-size: 0.75rem;
  z-index: 10;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--folkup-parchment);
  border-top: 2px solid var(--folkup-sage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-family: var(--font-body);
  opacity: 0.8;
}

/* Panel card positioning for loading indicator */
.panel-card .panel-preview {
  position: relative;
  overflow: hidden;
}
`;