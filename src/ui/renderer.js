/**
 * UI Renderer — displays story text, choices, and continue buttons
 */

import {
  parseFeedbackTag,
  parseLampTag,
  parseEndingTag,
  parseAudioTag,
  parsePanelTag,
  getEndingName,
} from '../engine/moral-system.js';
import {
  parseKnowledgeTag,
  parseDiscoveredTag,
  parseKnowledgeRichTag,
} from '../engine/knowledge-system.js';
import { EndingTracker } from '../engine/ending-tracker.js';
import { trackActChanged } from '../utils/analytics.js';
import { privacyAnalytics } from '../utils/privacy-analytics.js';
import {
  CHARACTER_IMAGES,
  SCENE_CHARACTER_MAP,
  ENDING_CHARACTER_MAP,
} from './character-images.js';
import { panelModal } from './panel-modal.js';
import { getUnlockablePanels, PANEL_PROGRESSION } from '../engine/panel-progression.js';

/** Escape HTML entities to prevent XSS */
function escapeHtml(text) {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}

export class Renderer {
  /**
   * @param {HTMLElement} container
   * @param {import('../engine/audio-manager.js').AudioManager} [audioManager]
   */
  constructor(container, audioManager = null) {
    this.container = container;
    this.storyEl = container.querySelector('#story');
    this.choicesEl = container.querySelector('#choices');
    this.continueEl = container.querySelector('#continue-btn');
    this.lampEl = container.querySelector('#lamp');
    this.footerEl = container.querySelector('#footer-nav');
    this.progressEl = container.querySelector('#progress');
    this.sidebarEl = container.querySelector('#sidebar');
    this.sidebarImgEl = container.querySelector('.sidebar-illustration');
    this.gameContentEl = container.querySelector('.game-content');
    this.audioManager = audioManager;
    this.currentCharacter = null;
    this._sidebarTimeout = null;
    this.currentEnding = null;
    this.knowledgeState = null;
  }

  /**
   * Set knowledge state reference
   * @param {import('../engine/knowledge-system.js').KnowledgeState} state
   */
  setKnowledgeState(state) {
    this.knowledgeState = state;
  }

  /**
   * Display text paragraphs with fade-in
   * @param {string[]} paragraphs
   * @param {string[]} tags
   */
  showText(paragraphs, tags) {
    // Process tags for scene/act info
    const sceneTag = tags.find((t) => t.startsWith('SCENE:'));
    const actTag = tags.find((t) => t.startsWith('ACT:'));

    if (sceneTag) {
      const scene = sceneTag.split(':')[1]?.trim();
      if (scene) this.storyEl.setAttribute('data-scene', scene);
    }
    // No else — keep previous data-scene until next SCENE tag

    if (actTag) {
      const act = actTag.split(':')[1]?.trim();
      if (act) {
        document.documentElement.setAttribute('data-act', act);
        this.updateProgress(act);
        trackActChanged(act);
      }
    }

    // Ending tag → data-ending attribute for compound CSS selectors
    const endingTag = tags.find((t) => t.startsWith('ENDING:'));
    if (endingTag) {
      const ending = endingTag.split(':')[1]?.trim();
      if (ending) this.storyEl.setAttribute('data-ending', ending);
    } else {
      this.storyEl.removeAttribute('data-ending');
    }

    // Clear previous content
    this.storyEl.innerHTML = '';
    this.choicesEl.innerHTML = '';
    this.hideChoices();

    // Render paragraphs
    const fragment = document.createDocumentFragment();
    paragraphs.forEach((text, i) => {
      const p = document.createElement('p');
      p.className = 'story-paragraph';
      p.innerHTML = this.formatText(text);
      p.style.animationDelay = `${i * 0.15}s`;
      fragment.appendChild(p);
    });
    this.storyEl.appendChild(fragment);

    // Focus management: focus first paragraph for screen readers
    const firstP = this.storyEl.querySelector('.story-paragraph');
    if (firstP) {
      firstP.setAttribute('tabindex', '-1');
      firstP.focus({ preventScroll: true });
    }

    // Process feedback/lamp tags
    tags.forEach((tag) => {
      const feedback = parseFeedbackTag(tag);
      if (feedback) {
        this.showFeedbackIndicator(feedback);
      }
      const lamp = parseLampTag(tag);
      if (lamp) {
        this.setLampState(lamp);
      }
      const audio = parseAudioTag(tag);
      if (audio && this.audioManager) {
        audio === 'stop' ? this.audioManager.stop() : this.audioManager.play(audio);
      }
      const panel = parsePanelTag(tag);
      if (panel) {
        this.handlePanelTrigger(panel);
      }
      if (parseKnowledgeRichTag(tag)) {
        this.setLampKnowledgeRich(true);
      }
    });

    // Handle discovered paragraphs
    const isDiscovered = tags.some(parseDiscoveredTag);
    if (isDiscovered) {
      this.storyEl.querySelectorAll('.story-paragraph').forEach((p) => {
        p.classList.add('discovered');
      });
      if (this.knowledgeState) {
        this.knowledgeState.recordDiscovery(this._currentPassageId());
      }
    }

    // Update sidebar illustration
    this.updateSidebar(tags);
  }

  /**
   * Format text — handle italics, em-dashes, etc.
   * @param {string} text
   * @returns {string}
   */
  formatText(text) {
    // Escape HTML first, then convert *text* to <em>text</em>
    const escaped = escapeHtml(text);
    return escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  /**
   * Show choices as buttons
   * @param {Array<{index: number, text: string, tags?: string[]}>} choices
   * @param {(index: number) => void} onChoose
   */
  showChoices(choices, onChoose) {
    this.choicesEl.innerHTML = '';
    this.choicesEl.classList.add('visible');
    this.hideContinue();

    let chosen = false;

    choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;

      // Knowledge categorization
      const knowledgeTag = (choice.tags || [])
        .map(parseKnowledgeTag)
        .find(Boolean);
      if (knowledgeTag) {
        btn.dataset.knowledge = knowledgeTag;
        btn.setAttribute('aria-describedby', `knowledge-${knowledgeTag}`);
      }

      btn.style.animationDelay = `${i * 0.1}s`;
      btn.addEventListener('click', () => {
        if (chosen) return;
        chosen = true;
        if (knowledgeTag && this.knowledgeState) {
          this.knowledgeState.recordChoice(knowledgeTag);
          this.updateLampState();
        }
        this.choicesEl.querySelectorAll('.choice-btn').forEach((b) => {
          b.disabled = true;
          b.classList.add('disabled');
        });
        btn.classList.add('selected');
        // Apply discovered class for knowledge choices
        if (knowledgeTag) {
          btn.classList.add('discovered');
        }
        onChoose(choice.index);
      });
      this.choicesEl.appendChild(btn);
    });

    // Focus first choice for keyboard navigation
    const firstBtn = this.choicesEl.querySelector('.choice-btn');
    if (firstBtn) firstBtn.focus({ preventScroll: true });
  }

  /** Hide choices container */
  hideChoices() {
    this.choicesEl.classList.remove('visible');
  }

  /**
   * Show continue button
   * @param {() => void} onContinue
   */
  showContinue(onContinue) {
    this.continueEl.classList.add('visible');
    this.hideChoices();

    // Remove old listeners via cloneNode
    const newBtn = this.continueEl.cloneNode(true);
    this.continueEl.replaceWith(newBtn);
    this.continueEl = newBtn;

    newBtn.disabled = false;
    let clicked = false;
    newBtn.addEventListener('click', () => {
      if (clicked) return;
      clicked = true;
      newBtn.disabled = true;
      onContinue();
    });
  }

  /** Hide continue button */
  hideContinue() {
    this.continueEl.classList.remove('visible');
  }

  /**
   * Set lamp visual state
   * @param {'steady' | 'bright' | 'flicker'} state
   */
  setLampState(state) {
    if (!this.lampEl) return;
    this.lampEl.setAttribute('data-state', state);
  }

  /**
   * Set knowledge-rich lamp state
   * @param {boolean} on
   */
  setLampKnowledgeRich(on) {
    if (!this.lampEl) return;
    this.lampEl.classList.toggle('knowledge-rich', !!on);
    if (this.knowledgeState) this.knowledgeState.lampKnowledgeRich = !!on;
  }

  /**
   * Update lamp state based on knowledge threshold
   */
  updateLampState() {
    if (this.knowledgeState && this.knowledgeState.shouldActivateKnowledgeRichLamp()) {
      this.setLampKnowledgeRich(true);
    }
  }

  /** Get current passage ID for discovery tracking */
  _currentPassageId() {
    const scene = this.storyEl.getAttribute('data-scene') || 'unknown';
    const timestamp = Date.now();
    return `${scene}_${timestamp}`;
  }

  /**
   * Brief visual indicator for folk/dragon feedback (subtle, not a counter)
   * @param {'folk' | 'dragon'} type
   */
  showFeedbackIndicator(type) {
    // Subtle color pulse on lamp
    if (this.lampEl) {
      this.lampEl.classList.add(`feedback-${type}`);
      setTimeout(() => {
        this.lampEl.classList.remove(`feedback-${type}`);
      }, 2000);
    }
  }

  /**
   * Show "end of story" screen with replay encouragement and share
   * @param {string[]} [tags=[]] — tags from the final passage
   */
  showEnd(tags = []) {
    this.hideContinue();
    this.hideChoices();

    // Check for ending tag
    for (const tag of tags) {
      const ending = parseEndingTag(tag);
      if (ending) this.currentEnding = ending;
    }

    // Record ending
    if (this.currentEnding) {
      EndingTracker.record(this.currentEnding);
    }

    const endEl = document.createElement('div');
    endEl.className = 'story-end';

    const divider = document.createElement('div');
    divider.className = 'end-divider';
    endEl.appendChild(divider);

    if (this.currentEnding) {
      const label = document.createElement('p');
      label.className = 'end-label';
      label.textContent = getEndingName(this.currentEnding);
      endEl.appendChild(label);
    }

    const endText = document.createElement('p');
    endText.className = 'end-text';
    endText.textContent = 'Конец';
    endEl.appendChild(endText);

    // Ending counter
    const seenCount = EndingTracker.getCount();
    const totalCount = EndingTracker.total;
    const counter = document.createElement('p');
    counter.className = 'end-counter';
    counter.textContent = `Концовка ${seenCount} из ${totalCount}`;
    endEl.appendChild(counter);

    // Action buttons container
    const actions = document.createElement('div');
    actions.className = 'end-actions';

    // Replay button
    const replayBtn = document.createElement('button');
    replayBtn.className = 'end-btn end-btn-replay';
    replayBtn.textContent = seenCount < totalCount ? 'Другие концовки' : 'Начать заново';
    replayBtn.addEventListener('click', () => {
      location.reload();
    });
    actions.appendChild(replayBtn);

    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'end-btn end-btn-share';
    shareBtn.textContent = 'Поделиться';
    shareBtn.addEventListener('click', () => {
      const endingName = this.currentEnding ? getEndingName(this.currentEnding) : '';
      const text = endingName
        ? `Я прошёл FolkUp Quest. Концовка: ${endingName}. quest.folkup.app`
        : 'Я прошёл FolkUp Quest! quest.folkup.app';

      if (navigator.share) {
        navigator.share({ text }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          shareBtn.textContent = 'Скопировано!';
          setTimeout(() => { shareBtn.textContent = 'Поделиться'; }, 2000);
        }).catch(() => {});
      }
    });
    actions.appendChild(shareBtn);

    endEl.appendChild(actions);
    this.storyEl.appendChild(endEl);
    this.showFooter();

    // Update sidebar for ending illustration
    this.updateSidebar(tags);
  }

  /** Show footer navigation */
  showFooter() {
    if (this.footerEl) {
      this.footerEl.classList.add('visible');
    }
  }

  /**
   * Fade-out, run callback, fade-in. Only for scene changes.
   * @param {() => void} callback
   */
  transitionScene(callback) {
    const duration = parseFloat(getComputedStyle(this.storyEl).transitionDuration) * 1000 || 300;
    this.storyEl.classList.add('fading-out');
    setTimeout(() => {
      callback();
      this.storyEl.classList.remove('fading-out');
    }, duration);
  }

  /**
   * Update progress dots for current act
   * @param {number|string} act — 1, 2, or 3
   */
  updateProgress(act) {
    if (!this.progressEl) return;
    this.progressEl.style.display = '';
    const actNum = parseInt(act, 10);
    this.progressEl.querySelectorAll('.progress-dot').forEach((dot) => {
      const dotNum = parseInt(dot.dataset.dot, 10);
      dot.classList.remove('completed', 'current');
      if (dotNum < actNum) dot.classList.add('completed');
      else if (dotNum === actNum) dot.classList.add('current');
    });
  }

  /**
   * Update sidebar illustration based on tags
   * Priority: CHARACTER: tag > ENDING map > SCENE map
   * @param {string[]} tags
   */
  updateSidebar(tags) {
    if (!this.sidebarEl || !this.sidebarImgEl) return;

    // 1. Check for explicit CHARACTER: tag (highest priority)
    const charTag = tags.find((t) => t.startsWith('CHARACTER:'));
    let character = null;

    if (charTag) {
      character = charTag.split(':')[1]?.trim() || null;
    } else {
      // 2. Check ENDING map
      const endingTag = tags.find((t) => t.startsWith('ENDING:'));
      if (endingTag) {
        const ending = endingTag.split(':')[1]?.trim();
        if (ending && ending in ENDING_CHARACTER_MAP) {
          character = ENDING_CHARACTER_MAP[ending];
        }
      }
      // 3. Fallback to SCENE map
      if (character === null) {
        const scene = this.storyEl.getAttribute('data-scene');
        if (scene && scene in SCENE_CHARACTER_MAP) {
          character = SCENE_CHARACTER_MAP[scene];
        }
      }
    }

    // Same character — do nothing
    if (character === this.currentCharacter) return;
    this.currentCharacter = character;

    // Cancel pending crossfade (race condition prevention)
    if (this._sidebarTimeout) {
      clearTimeout(this._sidebarTimeout);
      this._sidebarTimeout = null;
    }

    // Hide sidebar if no character
    if (!character || !(character in CHARACTER_IMAGES)) {
      this.gameContentEl?.classList.remove('has-illustration');
      this.container.classList.remove('has-sidebar');
      this.sidebarEl.setAttribute('aria-hidden', 'true');
      this.sidebarImgEl?.classList.remove('fading');
      return;
    }

    const img = CHARACTER_IMAGES[character];

    // Respect prefers-reduced-motion: skip animation
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this._applySidebarImage(img);
      return;
    }

    // Crossfade: fade out → swap → fade in
    this.sidebarImgEl.classList.add('fading');
    const fadeDuration = parseFloat(getComputedStyle(this.sidebarImgEl).transitionDuration) * 1000 || 300;

    this._sidebarTimeout = setTimeout(() => {
      this._sidebarTimeout = null;
      this._applySidebarImage(img);
    }, fadeDuration);
  }

  /** Apply sidebar image and show sidebar */
  _applySidebarImage(img) {
    if (!this.sidebarImgEl) return;
    this.sidebarImgEl.src = img.src;
    this.sidebarImgEl.alt = img.alt;
    this.sidebarImgEl.onerror = () => {
      this.gameContentEl?.classList.remove('has-illustration');
      this.container.classList.remove('has-sidebar');
      this.sidebarEl?.setAttribute('aria-hidden', 'true');
    };
    this.gameContentEl?.classList.add('has-illustration');
    this.container.classList.add('has-sidebar');
    this.sidebarEl?.removeAttribute('aria-hidden');
    this.sidebarImgEl.classList.remove('fading');
  }

  /** Handle panel trigger from Ink tag */
  handlePanelTrigger(panelId) {
    const config = PANEL_PROGRESSION[panelId];
    if (!config) {
      console.warn('Unknown panel ID:', panelId);
      return;
    }

    // Unlock the panel
    panelModal.unlockPanel(panelId);

    // Show unlock notification with contextual title
    this.showPanelUnlockNotification(panelId, config.title);

    // Auto-show panel after brief delay (optional, only for required panels)
    if (config.required) {
      setTimeout(() => {
        panelModal.show(panelId);
      }, 1000);
    }
  }

  /** Determine how a panel was unlocked for analytics */
  getUnlockMethod(panel, gameState) {
    if (panel.required) {
      return 'story_progress';
    }

    if (panel.condition) {
      if (panel.condition.includes('choice_')) {
        return 'story_choice';
      }
      if (panel.condition.includes('trust')) {
        return 'character_trust';
      }
      if (panel.condition.includes('folk_counter')) {
        return 'folk_path_progression';
      }
      if (panel.condition.includes('ending_')) {
        return 'ending_achieved';
      }
    }

    if (panel.folk_path) {
      return 'folk_path';
    }

    if (panel.dragon_path) {
      return 'dragon_path';
    }

    if (panel.bonus) {
      return 'bonus_condition';
    }

    return 'unknown';
  }

  /** Check for multiple panel unlocks based on current game state */
  checkPanelUnlocks(gameState) {
    const unlockable = getUnlockablePanels(gameState);
    let newUnlocks = 0;

    for (const panel of unlockable) {
      if (!panelModal.unlockedPanels.has(panel.id)) {
        // Determine unlock method based on panel configuration
        const unlockMethod = this.getUnlockMethod(panel, gameState);

        panelModal.unlockPanel(panel.id);

        // Track panel unlock (essential function, always allowed)
        privacyAnalytics.trackPrivacyAction('panel_unlocked', {
          panel_id: panel.id,
          unlock_method: unlockMethod,
          act: panel.act,
          required: panel.required,
          folk_path: panel.folk_path,
          dragon_path: panel.dragon_path
        });

        // Show notification for new unlocks (but don't auto-show)
        this.showPanelUnlockNotification(panel.id, panel.title);
        newUnlocks++;
      }
    }

    // If multiple panels unlocked, show summary notification
    if (newUnlocks > 1) {
      this.showMultiPanelNotification(newUnlocks);
    }
  }

  /** Show panel unlock notification */
  showPanelUnlockNotification(panelId, title = null) {
    const config = PANEL_PROGRESSION[panelId];
    const displayTitle = title || config?.title || 'New illustration';

    // Create temporary notification element
    const notification = document.createElement('div');
    notification.className = 'panel-unlock-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🎨</span>
        <span class="notification-text">Unlocked: ${escapeHtml(displayTitle)}</span>
      </div>
    `;

    // Add notification styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'var(--folkup-sage)',
      color: 'var(--folkup-ivory)',
      padding: '12px 16px',
      borderRadius: '8px',
      fontFamily: 'Source Sans 3, sans-serif',
      fontSize: '0.9rem',
      zIndex: '1001',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    });

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /** Show notification for multiple panel unlocks */
  showMultiPanelNotification(count) {
    const notification = document.createElement('div');
    notification.className = 'panel-unlock-notification multi-unlock';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🎨</span>
        <span class="notification-text">${count} new illustrations unlocked!</span>
        <small class="notification-subtitle">Check the gallery to view them</small>
      </div>
    `;

    // Enhanced styles for multi-unlock notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, var(--folkup-sage), var(--folkup-bordeaux))',
      color: 'var(--folkup-ivory)',
      padding: '16px 20px',
      borderRadius: '12px',
      fontFamily: 'Source Sans 3, sans-serif',
      fontSize: '0.9rem',
      zIndex: '1001',
      opacity: '0',
      transform: 'translateY(-20px) scale(0.95)',
      transition: 'all 0.4s ease',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    });

    // Style the subtitle
    const subtitle = notification.querySelector('.notification-subtitle');
    if (subtitle) {
      Object.assign(subtitle.style, {
        display: 'block',
        fontSize: '0.75rem',
        opacity: '0.8',
        marginTop: '4px'
      });
    }

    document.body.appendChild(notification);

    // Enhanced animation
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0) scale(1)';
    });

    // Auto-remove after 4 seconds (longer for multi-unlock)
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px) scale(0.95)';
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  }

  /** Scroll story container to bottom smoothly */
  scrollToBottom() {
    this.storyEl.scrollTo({
      top: this.storyEl.scrollHeight,
      behavior: 'smooth',
    });
  }
}
