/**
 * FolkUp Quest — Main Application Entry Point
 */

import { Story } from 'inkjs';
import { InkEngine } from './engine/ink-engine.js';
import { SaveManager } from './engine/save-manager.js';
import { Renderer } from './ui/renderer.js';
import {
  initAnalytics,
  trackGameStart,
  trackChoiceMade,
  trackEndingReached,
  trackGameCompleted,
} from './utils/analytics.js';

let engine = null;
let renderer = null;

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

  // Load compiled story
  let response;
  try {
    response = await fetch('/story.json');
  } catch {
    loadingP.textContent = 'Не удалось загрузить. Проверьте интернет и обновите страницу.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  if (!response.ok) {
    loadingP.textContent = 'Не удалось загрузить историю. Обновите страницу.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  let storyJson;
  try {
    storyJson = await response.text();
  } catch {
    loadingP.textContent = 'Не удалось загрузить историю. Обновите страницу.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  let story;
  try {
    story = new Story(storyJson);
  } catch {
    loadingP.textContent = 'Ошибка данных. Очистите кеш и обновите страницу.';
    loadingP.style.color = 'var(--color-bordeaux)';
    return;
  }

  engine = InkEngine.fromStory(story);
  renderer = new Renderer(document.getElementById('game'));

  // Initialize analytics
  initAnalytics();

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
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
      trackGameStart(false);
      startGame(startScreen, storyEl);
    });
  }

  newGameBtn.addEventListener('click', () => {
    engine.reset();
    SaveManager.clear();
    trackGameStart(true);
    startGame(startScreen, storyEl);
  });

  renderer.showFooter();
}

function startGame(startScreen, storyEl) {
  startScreen.style.display = 'none';
  storyEl.style.display = '';

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
          trackChoiceMade(index, engine.getVariable('current_scene'));
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
        if (ending) {
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
      errorP.textContent = 'Произошла ошибка. Попробуйте начать заново.';
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
    errorP.textContent = 'Ошибка загрузки. Обновите страницу.';
    errorP.style.color = 'var(--color-bordeaux)';
    startScreen.appendChild(errorP);
  }
});
