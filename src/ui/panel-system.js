/**
 * FQST-013 Phase 2: Dynamic Panel System Entry Point
 * Enhanced Alice v2.0 Level 3 Cartouche Autonome
 * Target: Bundle optimization through code splitting
 */

// Dynamic imports for code splitting
export async function initPanelSystem() {
  try {
    console.log('🔄 Loading panel system...');

    // Dynamic import panel modal and reader
    const [
      { panelModal },
      { PanelReader }
    ] = await Promise.all([
      import('./panel-modal.js'),
      import('./panel-reader.js')
    ]);

    // Initialize panel reader if not already done
    if (!window.panelReader) {
      window.panelReader = new PanelReader();
    }

    console.log('✅ Panel system loaded');

    return {
      panelModal,
      panelReader: window.panelReader
    };

  } catch (error) {
    console.error('❌ Failed to load panel system:', error);
    throw error;
  }
}

// Preload panel system for better UX (optional)
export async function preloadPanelSystem() {
  if (window.__panelSystemPreloaded) return;

  try {
    // Preload modules without executing
    await Promise.all([
      import('./panel-modal.js'),
      import('./panel-reader.js'),
      import('./panel-reader-lazy.js')
    ]);

    window.__panelSystemPreloaded = true;
    console.log('✅ Panel system preloaded');

  } catch (error) {
    console.warn('⚠️ Panel system preload failed:', error);
  }
}

// Network-aware preloading
export function conditionalPreload() {
  // Only preload on good connections
  if (navigator.connection?.effectiveType === '4g' && !navigator.connection?.saveData) {
    // Delay preload to not block critical resources
    setTimeout(preloadPanelSystem, 2000);
  }
}

// Performance tracking for dynamic imports
let loadStartTime = null;

export function trackPanelSystemLoad() {
  loadStartTime = performance.now();
}

export function reportPanelSystemLoadTime() {
  if (loadStartTime && window.performanceAnalytics) {
    const loadTime = performance.now() - loadStartTime;
    window.performanceAnalytics.trackEvent('panel_system_load', {
      load_time: Math.round(loadTime),
      network: navigator.connection?.effectiveType || 'unknown'
    });
  }
}