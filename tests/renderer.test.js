// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock analytics and ending tracker before importing Renderer
vi.mock('../src/engine/moral-system.js', () => ({
  parseFeedbackTag: (tag) => {
    const m = tag.match(/^FEEDBACK:\s*(folk|dragon)$/i);
    return m ? m[1].toLowerCase() : null;
  },
  parseLampTag: (tag) => {
    const m = tag.match(/^LAMP:\s*(steady|bright|flicker)$/i);
    return m ? m[1].toLowerCase() : null;
  },
  parseEndingTag: (tag) => {
    const m = tag.match(/^ENDING:\s*(lantern|bridge|chair)$/i);
    return m ? m[1].toLowerCase() : null;
  },
  getEndingName: (e) => ({ lantern: 'Фонарь', bridge: 'Мост', chair: 'Кресло' }[e] || e),
}));

vi.mock('../src/utils/analytics.js', () => ({
  trackActChanged: vi.fn(),
}));

vi.mock('../src/engine/ending-tracker.js', () => ({
  EndingTracker: {
    record: vi.fn(),
    getSeen: vi.fn(() => []),
    getCount: vi.fn(() => 1),
    hasSeen: vi.fn(() => false),
    total: 3,
    clear: vi.fn(),
  },
}));

import { Renderer } from '../src/ui/renderer.js';
import { trackActChanged } from '../src/utils/analytics.js';
import { EndingTracker } from '../src/engine/ending-tracker.js';

/** Create a minimal DOM structure matching the game container */
function createGameDOM() {
  const game = document.createElement('div');
  game.id = 'game';
  game.innerHTML = `
    <div id="story"></div>
    <div id="choices"></div>
    <button id="continue-btn"></button>
    <div id="lamp"></div>
    <div id="footer-nav"></div>
    <div id="progress">
      <span class="progress-dot" data-dot="1"></span>
      <span class="progress-dot" data-dot="2"></span>
      <span class="progress-dot" data-dot="3"></span>
    </div>
  `;
  document.body.appendChild(game);
  return game;
}

describe('Renderer', () => {
  let game;
  let renderer;

  beforeEach(() => {
    document.body.innerHTML = '';
    game = createGameDOM();
    renderer = new Renderer(game);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Constructor ──────────────────────────────────────────────

  describe('constructor', () => {
    it('resolves all DOM elements', () => {
      expect(renderer.container).toBe(game);
      expect(renderer.storyEl).toBe(game.querySelector('#story'));
      expect(renderer.choicesEl).toBe(game.querySelector('#choices'));
      expect(renderer.continueEl).toBe(game.querySelector('#continue-btn'));
      expect(renderer.lampEl).toBe(game.querySelector('#lamp'));
      expect(renderer.footerEl).toBe(game.querySelector('#footer-nav'));
      expect(renderer.progressEl).toBe(game.querySelector('#progress'));
    });

    it('initializes currentEnding as null', () => {
      expect(renderer.currentEnding).toBeNull();
    });
  });

  // ── formatText ──────────────────────────────────────────────

  describe('formatText', () => {
    it('escapes HTML entities', () => {
      const result = renderer.formatText('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('converts *text* to <em>text</em>', () => {
      const result = renderer.formatText('Hello *world* there');
      expect(result).toBe('Hello <em>world</em> there');
    });

    it('handles multiple italic groups', () => {
      const result = renderer.formatText('*one* and *two*');
      expect(result).toBe('<em>one</em> and <em>two</em>');
    });

    it('returns plain text unchanged', () => {
      const result = renderer.formatText('No formatting here');
      expect(result).toBe('No formatting here');
    });

    it('handles empty string', () => {
      expect(renderer.formatText('')).toBe('');
    });

    it('escapes HTML inside italic markers', () => {
      const result = renderer.formatText('*<b>bold</b>*');
      expect(result).toContain('<em>');
      expect(result).not.toContain('<b>');
    });
  });

  // ── showText ────────────────────────────────────────────────

  describe('showText', () => {
    it('renders paragraphs with story-paragraph class', () => {
      renderer.showText(['Line 1', 'Line 2'], []);
      const paragraphs = renderer.storyEl.querySelectorAll('.story-paragraph');
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0].innerHTML).toBe('Line 1');
      expect(paragraphs[1].innerHTML).toBe('Line 2');
    });

    it('applies animation delays to paragraphs', () => {
      renderer.showText(['A', 'B', 'C'], []);
      const paragraphs = renderer.storyEl.querySelectorAll('.story-paragraph');
      expect(paragraphs[0].style.animationDelay).toBe('0s');
      expect(paragraphs[1].style.animationDelay).toBe('0.15s');
      expect(paragraphs[2].style.animationDelay).toBe('0.3s');
    });

    it('clears previous content', () => {
      renderer.showText(['First'], []);
      renderer.showText(['Second'], []);
      const paragraphs = renderer.storyEl.querySelectorAll('.story-paragraph');
      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].innerHTML).toBe('Second');
    });

    it('sets data-scene from SCENE tag', () => {
      renderer.showText(['Text'], ['SCENE: library']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('library');
    });

    it('preserves data-scene when no SCENE tag in batch', () => {
      renderer.storyEl.setAttribute('data-scene', 'library');
      renderer.showText(['Text'], []);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('library');
    });

    it('sets data-act on documentElement from ACT tag', () => {
      renderer.showText(['Text'], ['ACT: 2']);
      expect(document.documentElement.getAttribute('data-act')).toBe('2');
    });

    it('calls trackActChanged when ACT tag present', () => {
      renderer.showText(['Text'], ['ACT: 3']);
      expect(trackActChanged).toHaveBeenCalledWith('3');
    });

    it('does not call trackActChanged without ACT tag', () => {
      renderer.showText(['Text'], []);
      expect(trackActChanged).not.toHaveBeenCalled();
    });

    it('sets tabindex on first paragraph for screen reader focus', () => {
      renderer.showText(['Accessible text'], []);
      const first = renderer.storyEl.querySelector('.story-paragraph');
      expect(first.getAttribute('tabindex')).toBe('-1');
    });

    it('processes FEEDBACK tag', () => {
      const spy = vi.spyOn(renderer, 'showFeedbackIndicator');
      renderer.showText(['Text'], ['FEEDBACK: folk']);
      expect(spy).toHaveBeenCalledWith('folk');
    });

    it('processes LAMP tag', () => {
      const spy = vi.spyOn(renderer, 'setLampState');
      renderer.showText(['Text'], ['LAMP: bright']);
      expect(spy).toHaveBeenCalledWith('bright');
    });

    it('processes multiple tags simultaneously', () => {
      const feedbackSpy = vi.spyOn(renderer, 'showFeedbackIndicator');
      const lampSpy = vi.spyOn(renderer, 'setLampState');
      renderer.showText(['Text'], ['SCENE: office', 'ACT: 1', 'FEEDBACK: dragon', 'LAMP: flicker']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('office');
      expect(document.documentElement.getAttribute('data-act')).toBe('1');
      expect(feedbackSpy).toHaveBeenCalledWith('dragon');
      expect(lampSpy).toHaveBeenCalledWith('flicker');
    });

    it('clears choices container', () => {
      renderer.choicesEl.innerHTML = '<button>Old</button>';
      renderer.showText(['Text'], []);
      expect(renderer.choicesEl.innerHTML).toBe('');
    });

    it('hides choices on showText', () => {
      renderer.choicesEl.classList.add('visible');
      renderer.showText(['Text'], []);
      expect(renderer.choicesEl.classList.contains('visible')).toBe(false);
    });
  });

  // ── showChoices ─────────────────────────────────────────────

  describe('showChoices', () => {
    const choices = [
      { index: 0, text: 'Option A' },
      { index: 1, text: 'Option B' },
      { index: 2, text: 'Option C' },
    ];

    it('renders choice buttons', () => {
      renderer.showChoices(choices, vi.fn());
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      expect(buttons).toHaveLength(3);
      expect(buttons[0].textContent).toBe('Option A');
      expect(buttons[1].textContent).toBe('Option B');
      expect(buttons[2].textContent).toBe('Option C');
    });

    it('adds visible class to choices container', () => {
      renderer.showChoices(choices, vi.fn());
      expect(renderer.choicesEl.classList.contains('visible')).toBe(true);
    });

    it('hides continue button', () => {
      renderer.continueEl.classList.add('visible');
      renderer.showChoices(choices, vi.fn());
      expect(renderer.continueEl.classList.contains('visible')).toBe(false);
    });

    it('applies animation delays to buttons', () => {
      renderer.showChoices(choices, vi.fn());
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      expect(buttons[0].style.animationDelay).toBe('0s');
      expect(buttons[1].style.animationDelay).toBe('0.1s');
      expect(buttons[2].style.animationDelay).toBe('0.2s');
    });

    it('calls onChoose with correct index on click', () => {
      const onChoose = vi.fn();
      renderer.showChoices(choices, onChoose);
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      buttons[1].click();
      expect(onChoose).toHaveBeenCalledWith(1);
    });

    it('prevents double-click (chosen guard)', () => {
      const onChoose = vi.fn();
      renderer.showChoices(choices, onChoose);
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      buttons[0].click();
      buttons[0].click();
      buttons[1].click();
      expect(onChoose).toHaveBeenCalledTimes(1);
      expect(onChoose).toHaveBeenCalledWith(0);
    });

    it('disables all buttons after selection', () => {
      renderer.showChoices(choices, vi.fn());
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      buttons[0].click();
      buttons.forEach((btn) => {
        expect(btn.disabled).toBe(true);
        expect(btn.classList.contains('disabled')).toBe(true);
      });
    });

    it('marks selected button with selected class', () => {
      renderer.showChoices(choices, vi.fn());
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      buttons[2].click();
      expect(buttons[2].classList.contains('selected')).toBe(true);
      expect(buttons[0].classList.contains('selected')).toBe(false);
    });

    it('clears previous choices', () => {
      renderer.showChoices(choices, vi.fn());
      renderer.showChoices([{ index: 0, text: 'Only one' }], vi.fn());
      const buttons = renderer.choicesEl.querySelectorAll('.choice-btn');
      expect(buttons).toHaveLength(1);
    });
  });

  // ── showContinue ────────────────────────────────────────────

  describe('showContinue', () => {
    it('makes continue button visible', () => {
      renderer.showContinue(vi.fn());
      expect(renderer.continueEl.classList.contains('visible')).toBe(true);
    });

    it('hides choices', () => {
      renderer.choicesEl.classList.add('visible');
      renderer.showContinue(vi.fn());
      expect(renderer.choicesEl.classList.contains('visible')).toBe(false);
    });

    it('calls onContinue on click', () => {
      const onContinue = vi.fn();
      renderer.showContinue(onContinue);
      renderer.continueEl.click();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('prevents double-click', () => {
      const onContinue = vi.fn();
      renderer.showContinue(onContinue);
      renderer.continueEl.click();
      renderer.continueEl.click();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('disables button after click', () => {
      renderer.showContinue(vi.fn());
      renderer.continueEl.click();
      expect(renderer.continueEl.disabled).toBe(true);
    });

    it('removes old listeners via cloneNode', () => {
      const first = vi.fn();
      const second = vi.fn();
      renderer.showContinue(first);
      renderer.showContinue(second);
      renderer.continueEl.click();
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  // ── hideChoices / hideContinue ──────────────────────────────

  describe('hideChoices', () => {
    it('removes visible class', () => {
      renderer.choicesEl.classList.add('visible');
      renderer.hideChoices();
      expect(renderer.choicesEl.classList.contains('visible')).toBe(false);
    });
  });

  describe('hideContinue', () => {
    it('removes visible class', () => {
      renderer.continueEl.classList.add('visible');
      renderer.hideContinue();
      expect(renderer.continueEl.classList.contains('visible')).toBe(false);
    });
  });

  // ── setLampState ────────────────────────────────────────────

  describe('setLampState', () => {
    it('sets data-state attribute', () => {
      renderer.setLampState('bright');
      expect(renderer.lampEl.getAttribute('data-state')).toBe('bright');
    });

    it('updates state on subsequent calls', () => {
      renderer.setLampState('steady');
      renderer.setLampState('flicker');
      expect(renderer.lampEl.getAttribute('data-state')).toBe('flicker');
    });

    it('handles missing lamp element gracefully', () => {
      renderer.lampEl = null;
      expect(() => renderer.setLampState('bright')).not.toThrow();
    });
  });

  // ── showFeedbackIndicator ──────────────────────────────────

  describe('showFeedbackIndicator', () => {
    it('adds feedback-folk class to lamp', () => {
      renderer.showFeedbackIndicator('folk');
      expect(renderer.lampEl.classList.contains('feedback-folk')).toBe(true);
    });

    it('adds feedback-dragon class to lamp', () => {
      renderer.showFeedbackIndicator('dragon');
      expect(renderer.lampEl.classList.contains('feedback-dragon')).toBe(true);
    });

    it('removes feedback class after timeout', () => {
      vi.useFakeTimers();
      renderer.showFeedbackIndicator('folk');
      expect(renderer.lampEl.classList.contains('feedback-folk')).toBe(true);
      vi.advanceTimersByTime(2000);
      expect(renderer.lampEl.classList.contains('feedback-folk')).toBe(false);
      vi.useRealTimers();
    });

    it('handles missing lamp element', () => {
      renderer.lampEl = null;
      expect(() => renderer.showFeedbackIndicator('folk')).not.toThrow();
    });
  });

  // ── showEnd ─────────────────────────────────────────────────

  describe('showEnd', () => {
    it('creates end screen with "Конец" text', () => {
      renderer.showEnd([]);
      const endText = renderer.storyEl.querySelector('.end-text');
      expect(endText).not.toBeNull();
      expect(endText.textContent).toBe('Конец');
    });

    it('creates end divider', () => {
      renderer.showEnd([]);
      const divider = renderer.storyEl.querySelector('.end-divider');
      expect(divider).not.toBeNull();
    });

    it('shows ending name when ENDING tag present', () => {
      renderer.showEnd(['ENDING: lantern']);
      const label = renderer.storyEl.querySelector('.end-label');
      expect(label).not.toBeNull();
      expect(label.textContent).toBe('Фонарь');
    });

    it('shows correct name for bridge ending', () => {
      renderer.showEnd(['ENDING: bridge']);
      const label = renderer.storyEl.querySelector('.end-label');
      expect(label.textContent).toBe('Мост');
    });

    it('shows correct name for chair ending', () => {
      renderer.showEnd(['ENDING: chair']);
      const label = renderer.storyEl.querySelector('.end-label');
      expect(label.textContent).toBe('Кресло');
    });

    it('does not show ending label when no ENDING tag', () => {
      renderer.showEnd([]);
      const label = renderer.storyEl.querySelector('.end-label');
      expect(label).toBeNull();
    });

    it('hides continue and choices', () => {
      renderer.continueEl.classList.add('visible');
      renderer.choicesEl.classList.add('visible');
      renderer.showEnd([]);
      expect(renderer.continueEl.classList.contains('visible')).toBe(false);
      expect(renderer.choicesEl.classList.contains('visible')).toBe(false);
    });

    it('shows footer', () => {
      renderer.showEnd([]);
      expect(renderer.footerEl.classList.contains('visible')).toBe(true);
    });

    it('stores currentEnding', () => {
      renderer.showEnd(['ENDING: lantern']);
      expect(renderer.currentEnding).toBe('lantern');
    });

    it('records ending via EndingTracker', () => {
      renderer.showEnd(['ENDING: bridge']);
      expect(EndingTracker.record).toHaveBeenCalledWith('bridge');
    });

    it('does not record when no ending tag', () => {
      renderer.showEnd([]);
      expect(EndingTracker.record).not.toHaveBeenCalled();
    });

    it('shows ending counter', () => {
      renderer.showEnd(['ENDING: lantern']);
      const counter = renderer.storyEl.querySelector('.end-counter');
      expect(counter).not.toBeNull();
      expect(counter.textContent).toBe('Концовка 1 из 3');
    });

    it('creates replay button', () => {
      renderer.showEnd(['ENDING: lantern']);
      const replayBtn = renderer.storyEl.querySelector('.end-btn-replay');
      expect(replayBtn).not.toBeNull();
    });

    it('shows "Другие концовки" when not all seen', () => {
      EndingTracker.getCount.mockReturnValue(1);
      renderer.showEnd(['ENDING: lantern']);
      const replayBtn = renderer.storyEl.querySelector('.end-btn-replay');
      expect(replayBtn.textContent).toBe('Другие концовки');
    });

    it('shows "Начать заново" when all endings seen', () => {
      EndingTracker.getCount.mockReturnValue(3);
      renderer.showEnd(['ENDING: chair']);
      const replayBtn = renderer.storyEl.querySelector('.end-btn-replay');
      expect(replayBtn.textContent).toBe('Начать заново');
    });

    it('creates share button', () => {
      renderer.showEnd(['ENDING: lantern']);
      const shareBtn = renderer.storyEl.querySelector('.end-btn-share');
      expect(shareBtn).not.toBeNull();
      expect(shareBtn.textContent).toBe('Поделиться');
    });

    it('creates end-actions container', () => {
      renderer.showEnd(['ENDING: lantern']);
      const actions = renderer.storyEl.querySelector('.end-actions');
      expect(actions).not.toBeNull();
      expect(actions.querySelectorAll('.end-btn')).toHaveLength(2);
    });
  });

  // ── showFooter ──────────────────────────────────────────────

  describe('showFooter', () => {
    it('adds visible class to footer', () => {
      renderer.showFooter();
      expect(renderer.footerEl.classList.contains('visible')).toBe(true);
    });

    it('handles missing footer gracefully', () => {
      renderer.footerEl = null;
      expect(() => renderer.showFooter()).not.toThrow();
    });
  });

  // ── transitionScene ─────────────────────────────────────────

  describe('transitionScene', () => {
    it('adds fading-out class', () => {
      vi.useFakeTimers();
      renderer.transitionScene(vi.fn());
      expect(renderer.storyEl.classList.contains('fading-out')).toBe(true);
      vi.useRealTimers();
    });

    it('calls callback after transition', () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      renderer.transitionScene(callback);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('removes fading-out after callback', () => {
      vi.useFakeTimers();
      renderer.transitionScene(vi.fn());
      vi.advanceTimersByTime(500);
      expect(renderer.storyEl.classList.contains('fading-out')).toBe(false);
      vi.useRealTimers();
    });
  });

  // ── updateProgress ──────────────────────────────────────────

  describe('updateProgress', () => {
    it('marks act 1 as current', () => {
      renderer.updateProgress(1);
      const dots = renderer.progressEl.querySelectorAll('.progress-dot');
      expect(dots[0].classList.contains('current')).toBe(true);
      expect(dots[1].classList.contains('current')).toBe(false);
      expect(dots[2].classList.contains('current')).toBe(false);
    });

    it('marks act 2 as current and act 1 as completed', () => {
      renderer.updateProgress(2);
      const dots = renderer.progressEl.querySelectorAll('.progress-dot');
      expect(dots[0].classList.contains('completed')).toBe(true);
      expect(dots[1].classList.contains('current')).toBe(true);
      expect(dots[2].classList.contains('current')).toBe(false);
    });

    it('marks acts 1-2 as completed and act 3 as current', () => {
      renderer.updateProgress(3);
      const dots = renderer.progressEl.querySelectorAll('.progress-dot');
      expect(dots[0].classList.contains('completed')).toBe(true);
      expect(dots[1].classList.contains('completed')).toBe(true);
      expect(dots[2].classList.contains('current')).toBe(true);
    });

    it('accepts string act numbers', () => {
      renderer.updateProgress('2');
      const dots = renderer.progressEl.querySelectorAll('.progress-dot');
      expect(dots[0].classList.contains('completed')).toBe(true);
      expect(dots[1].classList.contains('current')).toBe(true);
    });

    it('clears previous state on update', () => {
      renderer.updateProgress(1);
      renderer.updateProgress(3);
      const dots = renderer.progressEl.querySelectorAll('.progress-dot');
      expect(dots[0].classList.contains('current')).toBe(false);
      expect(dots[0].classList.contains('completed')).toBe(true);
    });

    it('makes progress visible', () => {
      renderer.progressEl.style.display = 'none';
      renderer.updateProgress(1);
      expect(renderer.progressEl.style.display).toBe('');
    });

    it('handles missing progress element', () => {
      renderer.progressEl = null;
      expect(() => renderer.updateProgress(1)).not.toThrow();
    });
  });

  // ── scrollToBottom ──────────────────────────────────────────

  describe('scrollToBottom', () => {
    it('calls scrollTo on story element', () => {
      const scrollSpy = vi.spyOn(renderer.storyEl, 'scrollTo').mockImplementation(() => {});
      renderer.scrollToBottom();
      expect(scrollSpy).toHaveBeenCalledWith({
        top: renderer.storyEl.scrollHeight,
        behavior: 'smooth',
      });
    });
  });

  // ── data-scene persistence ────────────────────────────────

  describe('data-scene persistence', () => {
    it('keeps data-scene when no SCENE tag in batch', () => {
      renderer.showText(['First'], ['SCENE: library']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('library');

      renderer.showText(['Second'], ['CONTINUE']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('library');
    });

    it('updates data-scene when new SCENE tag appears', () => {
      renderer.showText(['First'], ['SCENE: shore']);
      renderer.showText(['Second'], ['SCENE: library']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('library');
    });
  });

  // ── data-ending attribute ─────────────────────────────────

  describe('data-ending attribute', () => {
    it('sets data-ending from ENDING tag', () => {
      renderer.showText(['Ending'], ['SCENE: ending', 'ENDING: lantern']);
      expect(renderer.storyEl.getAttribute('data-ending')).toBe('lantern');
    });

    it('removes data-ending when no ENDING tag', () => {
      renderer.showText(['Ending'], ['SCENE: ending', 'ENDING: bridge']);
      expect(renderer.storyEl.getAttribute('data-ending')).toBe('bridge');

      renderer.showText(['Next'], ['SCENE: credits']);
      expect(renderer.storyEl.hasAttribute('data-ending')).toBe(false);
    });

    it('compound selector: data-scene=ending + data-ending=chair', () => {
      renderer.showText(['Chair ending'], ['SCENE: ending', 'ENDING: chair']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('ending');
      expect(renderer.storyEl.getAttribute('data-ending')).toBe('chair');
    });

    it('data-scene persists through ending sub-knots', () => {
      renderer.showText(['Scene 11'], ['SCENE: ending', 'ACT: 3']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('ending');

      renderer.showText(['Lantern text'], ['ENDING: lantern']);
      expect(renderer.storyEl.getAttribute('data-scene')).toBe('ending');
      expect(renderer.storyEl.getAttribute('data-ending')).toBe('lantern');
    });
  });
});
