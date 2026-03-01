/**
 * UI Renderer — displays story text, choices, and continue buttons
 */

import {
  parseFeedbackTag,
  parseLampTag,
  parseEndingTag,
  getEndingName,
} from '../engine/moral-system.js';

export class Renderer {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;
    this.storyEl = container.querySelector('#story');
    this.choicesEl = container.querySelector('#choices');
    this.continueEl = container.querySelector('#continue-btn');
    this.lampEl = container.querySelector('#lamp');
    this.footerEl = container.querySelector('#footer-nav');
    this.progressEl = container.querySelector('#progress');
    this.currentEnding = null;
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

    if (actTag) {
      const act = actTag.split(':')[1]?.trim();
      if (act) {
        document.documentElement.setAttribute('data-act', act);
        this.updateProgress(act);
      }
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
    });
  }

  /**
   * Format text — handle italics, em-dashes, etc.
   * @param {string} text
   * @returns {string}
   */
  formatText(text) {
    // Convert *text* to <em>text</em>
    return text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  /**
   * Show choices as buttons
   * @param {Array<{index: number, text: string}>} choices
   * @param {(index: number) => void} onChoose
   */
  showChoices(choices, onChoose) {
    this.choicesEl.innerHTML = '';
    this.choicesEl.classList.add('visible');
    this.hideContinue();

    choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.style.animationDelay = `${i * 0.1}s`;
      btn.addEventListener('click', () => {
        // Disable all buttons after click
        this.choicesEl.querySelectorAll('.choice-btn').forEach((b) => {
          b.disabled = true;
          b.classList.add('disabled');
        });
        btn.classList.add('selected');
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

    // Remove old listeners
    const newBtn = this.continueEl.cloneNode(true);
    this.continueEl.replaceWith(newBtn);
    this.continueEl = newBtn;

    newBtn.addEventListener('click', onContinue);
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
   * Show "end of story" screen
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

    const endingLabel = this.currentEnding
      ? `<p class="end-label">${getEndingName(this.currentEnding)}</p>`
      : '';

    const endEl = document.createElement('div');
    endEl.className = 'story-end';
    endEl.innerHTML = `
      <div class="end-divider"></div>
      ${endingLabel}
      <p class="end-text">Конец</p>
    `;
    this.storyEl.appendChild(endEl);
    this.showFooter();
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

  /** Scroll story container to bottom smoothly */
  scrollToBottom() {
    this.storyEl.scrollTo({
      top: this.storyEl.scrollHeight,
      behavior: 'smooth',
    });
  }
}
