// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/engine/moral-system.js', () => ({
  parseFeedbackTag: () => null,
  parseLampTag: () => null,
  parseEndingTag: () => null,
  getEndingName: (e) => e,
}));

vi.mock('../src/utils/analytics.js', () => ({
  trackActChanged: vi.fn(),
}));

import { Renderer } from '../src/ui/renderer.js';

function createContainer() {
  const container = document.createElement('main');
  container.innerHTML = `
    <section id="story"></section>
    <div id="choices"></div>
    <button id="continue-btn"></button>
    <div id="lamp"></div>
    <footer id="footer-nav"></footer>
    <nav id="progress">
      <span class="progress-dot" data-dot="1"></span>
      <span class="progress-dot" data-dot="2"></span>
      <span class="progress-dot" data-dot="3"></span>
    </nav>
  `;
  document.body.appendChild(container);
  return container;
}

describe('Renderer — data-scene persistence', () => {
  let renderer;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = createContainer();
    renderer = new Renderer(container);
  });

  it('sets data-scene from SCENE tag', () => {
    renderer.showText(['Hello'], ['SCENE: shore']);
    expect(renderer.storyEl.getAttribute('data-scene')).toBe('shore');
  });

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

describe('Renderer — data-ending attribute', () => {
  let renderer;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = createContainer();
    renderer = new Renderer(container);
  });

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
    // Scene 11 sets SCENE: ending
    renderer.showText(['Scene 11'], ['SCENE: ending', 'ACT: 3']);
    expect(renderer.storyEl.getAttribute('data-scene')).toBe('ending');

    // Sub-knot ending_lantern has ENDING tag but no SCENE tag
    renderer.showText(['Lantern text'], ['ENDING: lantern']);
    expect(renderer.storyEl.getAttribute('data-scene')).toBe('ending');
    expect(renderer.storyEl.getAttribute('data-ending')).toBe('lantern');
  });
});
