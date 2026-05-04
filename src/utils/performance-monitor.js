/**
 * FQST-013 Performance Monitoring Integration
 * Enhanced Alice v2.0 Level 3 Cartouche Autonome
 * Privacy-first performance analytics without PII
 */

import { privacyAnalytics } from './privacy-analytics.js';

export class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      imageLoads: [],
      cacheHits: 0,
      cacheMisses: 0,
      networkFallbacks: 0,
      bundleLoadTimes: new Map()
    };

    this.initializeServiceWorkerListener();
    this.initializeNavigationTracking();
  }

  // Track individual image loading performance
  trackImageLoad(panelId, variant, loadTime, fromCache = false) {
    const connection = navigator.connection?.effectiveType || 'unknown';

    this.metrics.imageLoads.push({
      variant,
      loadTime: Math.round(loadTime),
      fromCache,
      connection,
      timestamp: Date.now()
    });

    // Track with privacy analytics (no PII)
    privacyAnalytics.trackEvent('image_performance', {
      variant,
      load_time: Math.round(loadTime),
      from_cache: fromCache,
      connection
    });

    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  // Track cache effectiveness
  trackCachePerformance(resource, hit, fallbackUsed = false) {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    if (fallbackUsed) {
      this.metrics.networkFallbacks++;
    }

    const resourceType = resource.split('/').pop()?.split('-')[0] || 'unknown';

    privacyAnalytics.trackEvent('cache_performance', {
      resource_type: resourceType,
      hit: hit,
      fallback_used: fallbackUsed
    });
  }

  // Track dynamic import performance
  trackBundleLoad(bundleName, loadTime) {
    this.metrics.bundleLoadTimes.set(bundleName, loadTime);

    privacyAnalytics.trackEvent('bundle_performance', {
      bundle: bundleName,
      load_time: Math.round(loadTime),
      connection: navigator.connection?.effectiveType || 'unknown'
    });
  }

  // Service worker message integration
  initializeServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;

        if (type === 'sw-performance') {
          this.handleServiceWorkerMetric(data);
        }
      });
    }
  }

  handleServiceWorkerMetric(data) {
    switch (data.type) {
      case 'cache-hit':
        this.trackCachePerformance(data.resource, true);
        break;

      case 'cache-miss':
        this.trackCachePerformance(data.resource, false);
        break;

      case 'cache-fallback':
        this.trackCachePerformance(data.resource, true, true);
        break;

      case 'fallback':
        this.metrics.networkFallbacks++;
        privacyAnalytics.trackEvent('image_fallback', {
          from: data.from,
          to: data.to
        });
        break;
    }
  }

  // Navigation performance tracking
  initializeNavigationTracking() {
    // Track page load performance
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.trackNavigationMetrics(navigation);
      }
    }

    // Track Largest Contentful Paint
    if ('LargestContentfulPaint' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        privacyAnalytics.trackEvent('lcp_performance', {
          lcp_time: Math.round(lastEntry.startTime),
          element_type: lastEntry.element?.tagName?.toLowerCase() || 'unknown'
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Track First Input Delay
    if ('FirstInputDelay' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          privacyAnalytics.trackEvent('fid_performance', {
            fid_time: Math.round(entry.processingStart - entry.startTime),
            input_type: entry.name
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    }
  }

  trackNavigationMetrics(navigation) {
    privacyAnalytics.trackEvent('navigation_performance', {
      dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      load_complete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      first_paint: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      connection: navigator.connection?.effectiveType || 'unknown'
    });
  }

  // FQST-013 specific optimization tracking
  measureOptimizationImpact() {
    const now = Date.now();
    const sessionDuration = now - this.startTime;

    const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
      ? Math.round((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100)
      : 0;

    const avgImageLoadTime = this.metrics.imageLoads.length > 0
      ? Math.round(this.metrics.imageLoads.reduce((sum, load) => sum + load.loadTime, 0) / this.metrics.imageLoads.length)
      : 0;

    // Calculate estimated bandwidth savings
    const bandwidthSaved = this.calculateBandwidthSavings();

    const optimizationMetrics = {
      cache_hit_rate: cacheHitRate,
      avg_image_load_time: avgImageLoadTime,
      bandwidth_saved_mb: bandwidthSaved,
      network_fallbacks: this.metrics.networkFallbacks,
      session_duration: Math.round(sessionDuration / 1000),
      variant: 'optimized'
    };

    privacyAnalytics.trackEvent('optimization_impact', optimizationMetrics);

    return optimizationMetrics;
  }

  calculateBandwidthSavings() {
    // Estimate bandwidth savings from responsive images
    const thumbnailLoads = this.metrics.imageLoads.filter(load => load.variant === 'thumb').length;
    const mediumLoads = this.metrics.imageLoads.filter(load => load.variant === 'medium').length;

    // Assume original images averaged 1MB, optimized variants much smaller
    const originalSize = (thumbnailLoads + mediumLoads) * 1024; // KB
    const optimizedSize = (thumbnailLoads * 40) + (mediumLoads * 78); // KB

    const savings = originalSize - optimizedSize;
    return Math.round(savings / 1024 * 100) / 100; // Convert to MB with 2 decimals
  }

  // Performance summary for debugging
  getPerformanceSummary() {
    return {
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? Math.round((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100)
        : 0,
      totalImageLoads: this.metrics.imageLoads.length,
      avgLoadTime: this.metrics.imageLoads.length > 0
        ? Math.round(this.metrics.imageLoads.reduce((sum, load) => sum + load.loadTime, 0) / this.metrics.imageLoads.length)
        : 0,
      networkFallbacks: this.metrics.networkFallbacks,
      bundleLoads: Object.fromEntries(this.metrics.bundleLoadTimes)
    };
  }

  // Service worker cache management
  async getCacheStats() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(
        { action: 'get-cache-stats' },
        [channel.port2]
      );
    });
  }

  async clearAssetCache() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return false;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      navigator.serviceWorker.controller.postMessage(
        { action: 'clear-asset-cache' },
        [channel.port2]
      );
    });
  }
}

// Global instance for easy access
export const performanceMonitor = new PerformanceMonitor();

// Expose to window for debugging and integration
window.performanceMonitor = performanceMonitor;
window.performanceAnalytics = {
  trackImageLoad: (...args) => performanceMonitor.trackImageLoad(...args),
  trackEvent: (...args) => privacyAnalytics.trackEvent(...args),
  getCacheStats: () => performanceMonitor.getCacheStats(),
  getPerformanceSummary: () => performanceMonitor.getPerformanceSummary()
};