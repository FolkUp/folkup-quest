/**
 * FolkUp Quest — Main Application Entry Point (Standalone Version)
 */

import { Story } from 'inkjs';
import { InkEngine } from './engine/ink-engine.js';
import { SaveManager } from './engine/save-manager.js';
import { Renderer } from './ui/renderer.js';
import { AudioManager } from './engine/audio-manager.js';
import {
  initAnalytics,
  trackGameStart,
  trackChoiceMade,
  trackEndingReached,
  trackGameCompleted,
} from './utils/analytics.js';

let engine = null;
let renderer = null;
let audioManager = null;

async function init() {
  const startScreen = document.getElementById('start-screen');
  const storyEl = document.getElementById('story');
  const newGameBtn = document.getElementById('new-game-btn');
  const continueBtn = document.getElementById('continue-game-btn');

  // Show loading state
  const loadingP = document.createElement('p');
  loadingP.textContent = 'Загрузка...';
  loadingP.style.color = 'var(--color-text-muted)';
  startScreen.appendChild(loadingP);

  // Load compiled story (STANDALONE: relative path)
  let response;
  try {
    response = await fetch('./story.json');
  } catch {
    loadingP.textContent = 'Не удалось загрузить story.json. Проверьте файлы архива.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  if (!response.ok) {
    loadingP.textContent = 'Файл story.json не найден. Проверьте структуру архива.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  let storyJson;
  try {
    storyJson = await response.text();
  } catch {
    loadingP.textContent = 'Не удалось прочитать story.json. Файл поврежден.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  let story;
  try {
    story = new Story(storyJson);
  } catch {
    loadingP.textContent = 'Ошибка в данных квеста. story.json некорректен.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  engine = InkEngine.fromStory(story);
  if (AudioManager.isSupported()) {
    audioManager = new AudioManager();
  }
  renderer = new Renderer(document.getElementById('game'), audioManager);

  // Initialize analytics (STANDALONE: file:// safe)
  if (location.protocol === 'https:' || location.protocol === 'http:') {
    initAnalytics();
  }

  // Service Worker registration (STANDALONE: skip for file://)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Loading complete — hide loading text
  loadingP.remove();

  // Check for saved game
  if (SaveManager.hasSave()) {
    const meta = SaveManager.getMeta();
    const actNames = { 1: 'I', 2: 'II', 3: 'III' };
    const actLabel = meta?.act ? ` · Акт ${actNames[meta.act] || meta.act}` : '';
    continueBtn.textContent = `Продолжить${actLabel}`;
    continueBtn.style.display = '';
    continueBtn.addEventListener('click', () => {
      try {
        const save = SaveManager.load();
        if (save) {
          engine.loadState(save.state);
        }
      } catch {
        // Corrupted save — start fresh
        engine.reset();
        SaveManager.clear();
      }
      if (location.protocol === 'https:' || location.protocol === 'http:') {
        trackGameStart(false);
      }
      startGame(startScreen, storyEl);
    });
  }

  newGameBtn.addEventListener('click', () => {
    engine.reset();
    SaveManager.clear();
    if (location.protocol === 'https:' || location.protocol === 'http:') {
      trackGameStart(true);
    }
    startGame(startScreen, storyEl);
  });

  renderer.showFooter();
}

function startGame(startScreen, storyEl) {
  startScreen.style.display = 'none';
  storyEl.style.display = '';

  // Unlock audio on user gesture
  audioManager?.unlock();

  // Create mute button
  if (audioManager) {
    createMuteButton(document.getElementById('game'));
  }

  // Show restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.style.display = '';
    restartBtn.addEventListener('click', () => {
      if (confirm('Начать заново? Текущий прогресс будет потерян.')) {
        engine.reset();
        SaveManager.clear();
        location.reload();
      }
    });
  }

  advance();
}

function createMuteButton(container) {
  const btn = document.createElement('button');
  btn.className = 'mute-btn';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', audioManager.muted ? 'true' : 'false');
  btn.setAttribute('aria-label', audioManager.muted ? 'Включить звук' : 'Выключить звук');

  const iconOn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const iconOff = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  btn.innerHTML = audioManager.muted ? iconOff : iconOn;

  btn.addEventListener('click', () => {
    audioManager.toggleMute();
    const muted = audioManager.muted;
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btn.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
    btn.innerHTML = muted ? iconOff : iconOn;
  });

  container.appendChild(btn);
}

function advance() {
  try {
    const result = engine.continueToBreak();
    const hasSceneChange = result.tags.some((t) => t.startsWith('SCENE:'));

    const render = () => {
      if (result.paragraphs.length > 0) {
        renderer.showText(result.paragraphs, result.tags);
      }

      if (result.choices.length > 0) {
        renderer.showChoices(result.choices, (index) => {
          engine.choose(index);
          if (location.protocol === 'https:' || location.protocol === 'http:') {
            trackChoiceMade(index, engine.getVariable('current_scene'));
          }
          saveGame();
          setTimeout(() => {
            advance();
            renderer.scrollToBottom();
          }, 400);
        });
      } else if (engine.canContinue()) {
        renderer.showContinue(() => {
          advance();
          renderer.scrollToBottom();
        });
      } else {
        // Extract ending from tags
        const endingTag = result.tags.find((t) => t.startsWith('ENDING:'));
        const ending = endingTag ? endingTag.split(':')[1]?.trim() : null;
        if (ending && (location.protocol === 'https:' || location.protocol === 'http:')) {
          trackEndingReached(ending);
          trackGameCompleted(ending, engine.getVariable('folk_counter'));
        }
        renderer.showEnd(result.tags);
        saveGame();
      }
    };

    if (hasSceneChange) {
      renderer.transitionScene(render);
    } else {
      render();
    }
  } catch (err) {
    console.error('Story error:', err);
    const storyEl = document.getElementById('story');
    if (storyEl) {
      const errorP = document.createElement('p');
      errorP.textContent = 'Произошла ошибка в игровой логике. Попробуйте перезагрузить.';
      errorP.style.color = 'var(--color-bordeaux)';
      storyEl.appendChild(errorP);
    }
  }
}

function saveGame() {
  const state = engine.getState();
  const meta = {
    scene: engine.getVariable('current_scene'),
    act: engine.getVariable('current_act'),
    folk_counter: engine.getVariable('folk_counter'),
  };
  const saved = SaveManager.save(state, meta);
  if (!saved) {
    console.warn('Save failed — storage may be full or unavailable');
  }
}

// Boot
init().catch((err) => {
  console.error('Init error:', err);
  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    const errorP = document.createElement('p');
    errorP.textContent = 'Ошибка инициализации. Проверьте файлы архива.';
    errorP.style.color = 'var(--color-bordeaux)';
    startScreen.appendChild(errorP);
  }
});