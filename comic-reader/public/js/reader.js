/**
 * Comic Reader — Vanilla JS
 * IntersectionObserver lazy loading, progress tracking, deep linking, keyboard nav.
 */

(function () {
  'use strict';

  const TOTAL_PAGES = 24;
  const SPECIAL_BEFORE = ['page-title']; // before page-01
  const SPECIAL_AFTER = ['page-credits', 'page-back']; // after page-24
  const ALL_PAGES = [...SPECIAL_BEFORE, ...Array.from({ length: TOTAL_PAGES }, (_, i) => `page-${String(i + 1).padStart(2, '0')}`), ...SPECIAL_AFTER];

  // DOM refs
  const progressBar = document.querySelector('.progress-bar');
  const pageCounter = document.querySelector('.page-counter');
  const pageCounterLive = document.querySelector('.page-counter-live');
  const thumbStrip = document.querySelector('.thumb-strip');
  const offlineBadge = document.querySelector('.offline-badge');
  const toast = document.querySelector('.toast');

  let currentPage = 0;
  let counterTimeout;

  // ===== LAZY LOADING =====
  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
          }
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          lazyObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200% 0px' }
  );

  document.querySelectorAll('.comic-page img[data-srcset], .comic-page img[data-src]').forEach((img) => {
    lazyObserver.observe(img);
  });

  // ===== PROGRESS TRACKING =====
  const pageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const pageEl = entry.target;
          const idx = parseInt(pageEl.dataset.pageIndex, 10);
          if (!isNaN(idx)) {
            updateProgress(idx);
          }
        }
      });
    },
    { threshold: [0.3, 0.6] }
  );

  document.querySelectorAll('.comic-page[data-page-index]').forEach((el) => {
    pageObserver.observe(el);
  });

  function updateProgress(idx) {
    if (idx === currentPage) return;
    currentPage = idx;

    // Progress bar
    const pct = ((idx + 1) / ALL_PAGES.length) * 100;
    progressBar.style.width = pct + '%';

    // Page counter — show number for regular pages only
    const pageId = ALL_PAGES[idx];
    const match = pageId.match(/^page-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const text = num + ' / ' + TOTAL_PAGES;
      pageCounter.textContent = text;
      pageCounterLive.textContent = text;
      pageCounter.classList.add('visible');

      clearTimeout(counterTimeout);
      counterTimeout = setTimeout(() => {
        pageCounter.classList.remove('visible');
      }, 2000);
    }

    // Thumb strip active state
    thumbStrip.querySelectorAll('a').forEach((a, i) => {
      a.classList.toggle('active', i === idx);
    });

    // Scroll thumb strip to active
    const activeThumb = thumbStrip.querySelector('.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // URL hash (only for regular pages, no pushState spam)
    if (match) {
      const num = parseInt(match[1], 10);
      history.replaceState(null, '', '#page-' + num);
    }
  }

  // ===== DEEP LINKING =====
  function scrollToHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const match = hash.match(/^#page-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= TOTAL_PAGES) {
        const target = document.getElementById('page-' + String(num).padStart(2, '0'));
        if (target) {
          // Small delay to let images start loading
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
          }, 100);
        }
      }
    }
  }

  scrollToHash();
  window.addEventListener('hashchange', scrollToHash);

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', (e) => {
    // Don't intercept when focus is on interactive elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    switch (e.key) {
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        scrollByPage(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        scrollByPage(-1);
        break;
      case 'Home':
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
    }
  });

  function scrollByPage(direction) {
    const nextIdx = Math.max(0, Math.min(ALL_PAGES.length - 1, currentPage + direction));
    const pages = document.querySelectorAll('.comic-page[data-page-index]');
    if (pages[nextIdx]) {
      pages[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ===== SHARE BUTTON =====
  document.querySelectorAll('.btn-share').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showToast(btn.dataset.copied || 'Copied!');
        });
      }
    });
  });

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ===== OFFLINE DETECTION =====
  function updateOnlineStatus() {
    if (offlineBadge) {
      offlineBadge.classList.toggle('show', !navigator.onLine);
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // ===== SERVICE WORKER =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();
