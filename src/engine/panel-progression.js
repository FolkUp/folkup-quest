/**
 * Panel Progression System — FolkUp Quest
 * FQST-017 Phase 1B-Full Scope: 15+ Interactive Panels with Multiple Narrative Paths
 * Constitutional Framework Implementation with 3+ Major Choice Branches
 * Maps narrative beats to comic panel unlocks with branching paths
 */

/**
 * Phase 1B-Full Scope Panel Configuration
 * CONSTITUTIONAL IMPLEMENTATION: 28 panels available, targeting 15+ interactive with branching
 *
 * MAJOR CHOICE BRANCHES:
 * 1. FOLK vs DRAGON Path (Scene 7: Breus Proposal)
 * 2. TRUST vs BUSINESS Dynamics (Scene 8: Team Response)
 * 3. FINAL DESTINY Choice (Scene 10: Three Endings)
 *
 * Interactive Features:
 * - Real-time choice consequence visualization
 * - Multi-path narrative unlocks
 * - Micro-story integration with branching
 * - Hidden discovery paths based on choices
 */
export const PANEL_PROGRESSION = {
  // === ACT 1: DISCOVERY (panels 1.1-1.7) ===
  'panel-1.1': {
    scene: 'scene1',
    title: 'Берег Сетубал',
    description: 'Начало пути. Чайки, скамейка, ключ в кармане.',
    act: 1,
    required: true
  },

  'panel-1.2': {
    scene: 'scene2',
    title: 'Пустая библиотека',
    description: 'Дуб и латунь. Три двери. Лампа горит.',
    act: 1,
    required: true
  },

  'panel-1.3': {
    scene: 'scene3',
    title: 'Алиса в Барнсе',
    description: 'SW13. Пруд, утки, блокнот связей.',
    act: 1,
    required: true
  },

  'panel-1.4': {
    scene: 'scene4',
    title: 'КиберГонзо в лесу',
    description: 'Португальские грибы. Три экрана. Верификация.',
    act: 1,
    required: true
  },

  'panel-1.5': {
    scene: 'scene5',
    title: 'Дэн из Чикаго',
    description: 'Видеозвонок через экран. Гитара и блюз.',
    act: 1,
    required: true,
    condition: 'visited_retrotech'
  },

  'panel-1.6': {
    scene: 'scene2',
    title: 'Все двери пройдены',
    description: 'Три папки на стеллажах. Команда собрана.',
    act: 1,
    condition: 'visited_barnes && visited_cogumelos && visited_retrotech'
  },

  'panel-1.7': {
    scene: 'scene6',
    title: 'Память о Бреусе',
    description: 'Флешбек. Пластиковые стулья, горящие глаза.',
    act: 1,
    condition: 'saw_flashback_young_breus',
    optional: true
  },

  // === MICRO-STORY: LIBRARY SIDE-QUEST (panels 1.8-1.9) ===
  'panel-1.8': {
    scene: 'scene2_5',
    title: 'Угол библиотеки',
    description: 'Ниша в стеллажах, старый дневник, подпись: Dr. Folkup.',
    act: 1,
    condition: 'current_scene >= 2',
    optional: true,
    micro_story: true
  },

  'panel-1.9': {
    scene: 'scene2_5',
    title: 'Выбор в углу',
    description: 'Три пути с дневником: прочитать, оставить, забрать.',
    act: 1,
    condition: 'micro_story_active && diary_choice',
    optional: true,
    micro_story: true
  },

  // === MICRO-STORY: STUDY ROOM DISCOVERY (panels 1.10-1.12) ===
  'panel-1.10': {
    scene: 'scene2_7',
    title: 'Размышления о встрече',
    description: 'Study room reflection на предложение Бреуса.',
    act: 1,
    condition: 'current_scene >= 7 || choice_5_listened || choice_5_refused',
    optional: true,
    micro_story: true
  },

  'panel-1.11': {
    scene: 'scene2_7',
    title: 'Анализ мотивов',
    description: 'Проработка последствий business proposal.',
    act: 1,
    condition: 'micro_story_active && study_choice',
    optional: true,
    micro_story: true
  },

  'panel-1.12': {
    scene: 'scene2_7',
    title: 'Принятие решения',
    description: 'Clarity о независимом пути развития.',
    act: 1,
    condition: 'has_breus_analysis',
    optional: true,
    micro_story: true
  },

  // === MICRO-STORY: CHARACTER REFLECTION (panels 1.13-1.15) ===
  'panel-1.13': {
    scene: 'scene3_5',
    title: 'Внутренний голос',
    description: 'Момент честной self-reflection и personal insight.',
    act: 1,
    condition: 'folk_counter && (has_diary || has_breus_analysis)',
    optional: true,
    micro_story: true
  },

  'panel-1.14': {
    scene: 'scene3_5',
    title: 'Зеркало души',
    description: 'Character analysis через path, fears, или values.',
    act: 1,
    condition: 'micro_story_active && reflection_choice',
    optional: true,
    micro_story: true
  },

  'panel-1.15': {
    scene: 'scene3_5',
    title: 'Clarity достигнут',
    description: 'Synthesis of personal insights и direction forward.',
    act: 1,
    condition: 'has_reflection_journal',
    optional: true,
    micro_story: true
  },

  // === HIDDEN DISCOVERY: SYNTHESIS (panel 1.16) ===
  'panel-1.16': {
    scene: 'scene2',
    title: 'Master Synthesis',
    description: 'Скрытая история: integration всех micro-story insights.',
    act: 1,
    condition: 'discovery_unlocked && (has_master_understanding || has_integrated_understanding)',
    optional: true,
    micro_story: true,
    hidden: true
  },

  // === ACT 2: CHALLENGE (panels 2.1-2.10) - PHASE 1B-FULL EXPANSION ===
  'panel-2.1': {
    scene: 'scene7',
    title: 'Приход Бреуса',
    description: 'Дорогие джинсы, предложение, испытание.',
    act: 2,
    required: true
  },

  'panel-2.2': {
    scene: 'scene7',
    title: 'Отказ',
    description: 'Люди — не ресурс. Они — причина.',
    act: 2,
    condition: 'choice_5_refused',
    folk_path: true
  },

  'panel-2.3': {
    scene: 'scene7',
    title: 'Выслушать предложение',
    description: 'Контракт, мелкий шрифт, поводок.',
    act: 2,
    condition: 'choice_5_listened',
    dragon_path: true
  },

  'panel-2.4': {
    scene: 'scene8',
    title: 'Тишина после',
    description: 'Команда остается. Вместе, без гарантий.',
    act: 2,
    condition: 'alice_trust >= 55'
  },

  'panel-2.5': {
    scene: 'scene8',
    title: 'Нужен план',
    description: 'Цифры, дедлайны, деловой тон.',
    act: 2,
    condition: 'choice_8_dragon',
    dragon_path: true
  },

  'panel-2.6': {
    scene: 'scene7',
    title: 'Данные КиберГонзо',
    description: 'Тридцать процентов клиентов. Два иска.',
    act: 2,
    condition: 'gonzo_trust >= 55',
    optional: true
  },

  'panel-2.7': {
    scene: 'scene7',
    title: 'Совет Дэна',
    description: 'Man, та же речь. Не подписывай ничего.',
    act: 2,
    condition: 'dan_trust >= 55',
    optional: true
  },

  // === PHASE 1B-FULL: EXTENDED CHOICE CONSEQUENCES (panels 2.8-2.10) ===
  'panel-2.8': {
    scene: 'scene7_5',
    title: 'Анализ последствий',
    description: 'Команда обсуждает выслушанное предложение.',
    act: 2,
    condition: 'choice_5_listened',
    interactive: true,
    major_branch: 'breus_proposal'
  },

  'panel-2.9': {
    scene: 'scene8_5',
    title: 'Глубокий анализ команды',
    description: 'Детальное изучение командной динамики после решения.',
    act: 2,
    condition: 'current_scene >= 8',
    interactive: true,
    character_development: true
  },

  'panel-2.10': {
    scene: 'scene7_5',
    title: 'Независимый путь',
    description: 'Обсуждение альтернатив после отказа Бреусу.',
    act: 2,
    condition: 'choice_5_refused',
    interactive: true,
    major_branch: 'independence_path'
  },

  // === ACT 3: RESOLUTION (panels 3.1-3.10) - ENHANCED BRANCHING ===
  'panel-3.1': {
    scene: 'scene9',
    title: 'Зеркало дракона',
    description: 'Ночное отражение. Кресло в стекле.',
    act: 3,
    required: true
  },

  'panel-3.2': {
    scene: 'scene9',
    title: 'Разбить зеркало',
    description: 'Кулак в сантиметре от стекла.',
    act: 3,
    condition: 'scene9_broke_mirror',
    folk_path: true
  },

  'panel-3.3': {
    scene: 'scene9',
    title: 'Два будущих',
    description: 'Стекло, офис, библиотека. Выбор сделан.',
    act: 3,
    condition: 'scene9_listened',
    folk_path: true
  },

  'panel-3.4': {
    scene: 'scene10',
    title: 'Письма на столе',
    description: 'Бреус и Алиса. Два пути, два выбора.',
    act: 3,
    required: true
  },

  'panel-3.5': {
    scene: 'scene10',
    title: 'Принять предложение',
    description: 'Да. А. Одно слово, точка.',
    act: 3,
    condition: 'final_choice == "accept"',
    dragon_path: true
  },

  'panel-3.6': {
    scene: 'scene10',
    title: 'Отказать Бреусу',
    description: 'Спасибо. Нет. А. Три слова.',
    act: 3,
    condition: 'final_choice == "refuse"',
    folk_path: true
  },

  'panel-3.7': {
    scene: 'scene10',
    title: 'Встречное предложение',
    description: 'Открой свой код. Справедливая архитектура.',
    act: 3,
    condition: 'final_choice == "counter_offer"',
    folk_path: true
  },

  // === PHASE 1B-FULL: ENHANCED RESOLUTION PATHS (panels 3.8-3.10) ===
  'panel-3.8': {
    scene: 'scene9_5',
    title: 'Глубокое отражение',
    description: 'Расширенный анализ зеркального момента и внутренних противоречий.',
    act: 3,
    condition: 'current_scene >= 9',
    interactive: true,
    character_development: true,
    major_branch: 'self_reflection'
  },

  'panel-3.9': {
    scene: 'scene10_5',
    title: 'Последствия выбора',
    description: 'Детальное изучение результатов финального решения.',
    act: 3,
    condition: 'final_choice',
    interactive: true,
    major_branch: 'final_destiny'
  },

  'panel-3.10': {
    scene: 'scene10_5',
    title: 'Командная реакция',
    description: 'Реакция команды на принятое финальное решение.',
    act: 3,
    condition: 'final_choice && (team_loyalty >= 60 || has_team_clarity)',
    interactive: true,
    character_development: true
  },

  // === ACT 4: EPILOGUE (panels 4.1-4.7) ===
  'panel-4.1': {
    scene: 'scene11',
    title: 'Концовка Фонарь',
    description: 'Библиотека полна. Команданте пишет письмо.',
    act: 4,
    condition: 'ending_lantern',
    folk_path: true
  },

  'panel-4.2': {
    scene: 'scene11',
    title: 'Концовка Мост',
    description: 'Компромисс. Сто тысяч читателей.',
    act: 4,
    condition: 'ending_bridge'
  },

  'panel-4.3': {
    scene: 'scene11',
    title: 'Концовка Кресло',
    description: 'Стеклянный офис. Лампа не горит.',
    act: 4,
    condition: 'ending_chair',
    dragon_path: true
  },

  'panel-4.4': {
    scene: 'scene11',
    title: 'Алиса остается',
    description: 'Блокнот, связи, линия к библиотеке.',
    act: 4,
    condition: 'ending_lantern && alice_trust >= 55',
    bonus: true,
    folk_path: true
  },

  'panel-4.5': {
    scene: 'scene11',
    title: 'Дэн записывает джингл',
    description: 'E7, A7, B7. Блюзовая тройка.',
    act: 4,
    condition: 'ending_lantern && dan_trust >= 55',
    bonus: true,
    folk_path: true
  },

  'panel-4.6': {
    scene: 'scene12',
    title: 'Титры',
    description: 'FolkUp Quest. О фонарях, которые светят не выбирая.',
    act: 4,
    required: true
  },

  'panel-4.7': {
    scene: 'scene12',
    title: 'Полное прохождение',
    description: 'Все пути пройдены. Все истории рассказаны.',
    act: 4,
    condition: 'folk_counter >= 65 && all_paths_explored',
    bonus: true,
    achievement: true
  }
};

/**
 * Panel unlock conditions evaluation
 */
export function evaluatePanelUnlock(panelId, gameState) {
  const config = PANEL_PROGRESSION[panelId];
  if (!config) return false;

  // Required panels unlock automatically when scene is reached
  if (config.required && gameState.current_scene >= getSceneNumber(config.scene)) {
    return true;
  }

  // Conditional panels need specific conditions
  if (config.condition) {
    return evaluateCondition(config.condition, gameState);
  }

  return false;
}

/**
 * Get all panels that should be unlocked for current game state
 */
export function getUnlockablePanels(gameState) {
  const unlockable = [];

  for (const [panelId, config] of Object.entries(PANEL_PROGRESSION)) {
    if (evaluatePanelUnlock(panelId, gameState)) {
      unlockable.push({
        id: panelId,
        ...config
      });
    }
  }

  return unlockable;
}

/**
 * Get panels by category for reader mode
 */
export function getPanelsByCategory() {
  const categories = {
    act1: [],
    act2: [],
    act3: [],
    epilogue: [],
    bonus: [],
    achievements: []
  };

  for (const [panelId, config] of Object.entries(PANEL_PROGRESSION)) {
    const panel = { id: panelId, ...config };

    if (config.achievement) {
      categories.achievements.push(panel);
    } else if (config.bonus) {
      categories.bonus.push(panel);
    } else if (config.act === 1) {
      categories.act1.push(panel);
    } else if (config.act === 2) {
      categories.act2.push(panel);
    } else if (config.act === 3) {
      categories.act3.push(panel);
    } else if (config.act === 4) {
      categories.epilogue.push(panel);
    }
  }

  return categories;
}

/**
 * Helper functions
 */
function getSceneNumber(sceneName) {
  const match = sceneName.match(/scene(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function evaluateCondition(condition, gameState) {
  try {
    // Simple condition evaluation
    // In production, use a proper expression evaluator
    const context = { ...gameState };

    // Handle common patterns
    if (condition.includes('&&')) {
      return condition.split('&&').every(c =>
        evaluateSimpleCondition(c.trim(), context)
      );
    }

    if (condition.includes('||')) {
      return condition.split('||').some(c =>
        evaluateSimpleCondition(c.trim(), context)
      );
    }

    return evaluateSimpleCondition(condition, context);
  } catch (e) {
    console.warn('Failed to evaluate condition:', condition, e);
    return false;
  }
}

function evaluateSimpleCondition(condition, context) {
  // Handle comparisons
  if (condition.includes('>=')) {
    const [variable, value] = condition.split('>=').map(s => s.trim());
    return (context[variable] || 0) >= parseInt(value);
  }

  if (condition.includes('==')) {
    const [variable, value] = condition.split('==').map(s => s.trim().replace(/['"]/g, ''));
    return context[variable] === value;
  }

  // Handle boolean variables
  return !!context[condition];
}