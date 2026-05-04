/**
 * FolkUp Quest — Main Application Entry Point
 */

import { Story } from 'inkjs';

// Import CSS styles
import '../styles/panel-modal.css';
import { InkEngine } from './engine/ink-engine.js';
import { SaveManager } from './engine/save-manager.js';
import { Renderer } from './ui/renderer.js';
import { AudioManager } from './engine/audio-manager.js';
import { KnowledgeState } from './engine/knowledge-system.js';
import {
  initAnalytics,
  trackGameStart,
  trackChoiceMade,
  trackEndingReached,
  trackGameCompleted,
} from './utils/analytics.js';
import { privacyAnalytics } from './utils/privacy-analytics.js';
import { consentModal } from './ui/consent-modal.js';
import { privacySettings } from './ui/privacy-settings.js';
import { dataRetentionManager } from './utils/data-retention.js';
import { performanceMonitor } from './utils/performance-monitor.js';
// Panel system will be dynamically imported when needed

let engine = null;
let renderer = null;
let audioManager = null;
let knowledgeState = null;

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
  if (AudioManager.isSupported()) {
    audioManager = new AudioManager();
  }
  renderer = new Renderer(document.getElementById('game'), audioManager);
  knowledgeState = new KnowledgeState();
  renderer.setKnowledgeState(knowledgeState);

  // Initialize analytics and privacy system
  initAnalytics();
  // Privacy analytics and data retention are auto-initialized via import

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
          knowledgeState = KnowledgeState.deserialize(save.meta?.knowledge);
          renderer.setKnowledgeState(knowledgeState);
          // Sync lamp state after load
          if (knowledgeState.lampKnowledgeRich) {
            renderer.setLampKnowledgeRich(true);
          }
        }
      } catch {
        // Corrupted save — start fresh
        engine.reset();
        SaveManager.clear();
        knowledgeState = new KnowledgeState();
        renderer.setKnowledgeState(knowledgeState);
      }
      trackGameStart(false);
      startGame(startScreen, storyEl);
    });
  }

  newGameBtn.addEventListener('click', () => {
    engine.reset();
    SaveManager.clear();
    knowledgeState = new KnowledgeState();
    renderer.setKnowledgeState(knowledgeState);
    trackGameStart(true);
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

  // Show gallery button
  createGalleryButton(document.getElementById('game'));

  // Show privacy settings button
  createPrivacyButton(document.getElementById('game'));

  // Conditional preload panel system on good connections
  if (navigator.connection?.effectiveType === '4g' && !navigator.connection?.saveData) {
    setTimeout(async () => {
      const { conditionalPreload } = await import('./ui/panel-system.js');
      conditionalPreload();
    }, 2000);
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

function createGalleryButton(container) {
  const btn = document.createElement('button');
  btn.className = 'gallery-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open comic panel gallery');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';

  // Style the gallery button
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--folkup-sage)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '1000',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  btn.addEventListener('click', async () => {
    try {
      // Show loading state
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // Dynamic import panel system
      const { initPanelSystem, trackPanelSystemLoad } = await import('./ui/panel-system.js');

      trackPanelSystemLoad();
      const { panelReader } = await initPanelSystem();

      // Open gallery
      panelReader.open();

    } catch (error) {
      console.error('Failed to open gallery:', error);
    } finally {
      // Restore button state
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.background = 'var(--folkup-charcoal)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.background = 'var(--folkup-sage)';
  });

  container.appendChild(btn);
}

function createPrivacyButton(container) {
  const btn = document.createElement('button');
  btn.className = 'privacy-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Privacy Settings');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

  // Style the privacy button
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '140px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--folkup-bordeaux)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    zIndex: '999',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    opacity: '0.8'
  });

  btn.addEventListener('click', () => {
    privacySettings.open();
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.opacity = '1';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.opacity = '0.8';
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
          trackChoiceMade(index, engine.getVariable('current_scene'));

          // Lamp state now handled automatically by renderer

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
    knowledge: knowledgeState ? knowledgeState.serialize() : null,
  };
  const saved = SaveManager.save(state, meta);
  if (!saved) {
    console.warn('Save failed — storage may be full or unavailable');
  }

  // Check for panel unlocks based on current game state
  const gameState = {
    current_scene: engine.getVariable('current_scene'),
    current_act: engine.getVariable('current_act'),
    folk_counter: engine.getVariable('folk_counter'),
    alice_trust: engine.getVariable('alice_trust') || 0,
    dan_trust: engine.getVariable('dan_trust') || 0,
    gonzo_trust: engine.getVariable('gonzo_trust') || 0,
    visited_barnes: engine.getVariable('visited_barnes') || false,
    visited_cogumelos: engine.getVariable('visited_cogumelos') || false,
    visited_retrotech: engine.getVariable('visited_retrotech') || false,
    saw_flashback_young_breus: engine.getVariable('saw_flashback_young_breus') || false,
    scene9_broke_mirror: engine.getVariable('scene9_broke_mirror') || false,
    final_choice: engine.getVariable('final_choice') || null,
    choice_5_listened: engine.getVariable('choice_5_listened') || false,
    choice_6_read_contract: engine.getVariable('choice_6_read_contract') || false
  };

  // Check for new panel unlocks
  renderer.checkPanelUnlocks(gameState);
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
