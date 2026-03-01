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
  // Load compiled story
  const response = await fetch('/story.json');
  if (!response.ok) {
    console.error('Failed to load story.json');
    return;
  }

  const storyJson = await response.text();
  const story = new Story(storyJson);
  engine = InkEngine.fromStory(story);
  renderer = new Renderer(document.getElementById('game'));

  // Setup start screen
  const startScreen = document.getElementById('start-screen');
  const storyEl = document.getElementById('story');
  const newGameBtn = document.getElementById('new-game-btn');
  const continueBtn = document.getElementById('continue-game-btn');

  // Check for saved game
  if (SaveManager.hasSave()) {
    continueBtn.style.display = '';
    continueBtn.addEventListener('click', () => {
      const save = SaveManager.load();
      if (save) {
        engine.loadState(save.state);
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
      // Auto-save after choice
      saveGame();
      // Small delay before advancing for UX
      setTimeout(() => advance(), 400);
    });
  } else if (engine.canContinue()) {
    renderer.showContinue(() => advance());
  } else {
    // Story ended
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
init().catch(console.error);
