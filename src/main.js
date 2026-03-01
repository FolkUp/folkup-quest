/**
 * FolkUp Quest — Main Application Entry Point
 */

import { Story } from 'inkjs';
import { InkEngine } from './engine/ink-engine.js';
import { SaveManager } from './engine/save-manager.js';
import { Renderer } from './ui/renderer.js';

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

  const storyJson = await response.text();
  const story = new Story(storyJson);
  engine = InkEngine.fromStory(story);
  renderer = new Renderer(document.getElementById('game'));

  // Loading complete — hide loading text
  loadingP.remove();

  // Check for saved game
  if (SaveManager.hasSave()) {
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
      startGame(startScreen, storyEl);
    });
  }

  newGameBtn.addEventListener('click', () => {
    engine.reset();
    SaveManager.clear();
    startGame(startScreen, storyEl);
  });

  renderer.showFooter();
}

function startGame(startScreen, storyEl) {
  startScreen.style.display = 'none';
  storyEl.style.display = '';
  advance();
}

function advance() {
  const result = engine.continueToBreak();

  if (result.paragraphs.length > 0) {
    renderer.showText(result.paragraphs, result.tags);
  }

  if (result.choices.length > 0) {
    renderer.showChoices(result.choices, (index) => {
      engine.choose(index);
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
    renderer.showEnd();
    saveGame();
  }
}

function saveGame() {
  const state = engine.getState();
  const meta = {
    scene: engine.getVariable('current_scene'),
    act: engine.getVariable('current_act'),
    folk_counter: engine.getVariable('folk_counter'),
  };
  SaveManager.save(state, meta);
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
