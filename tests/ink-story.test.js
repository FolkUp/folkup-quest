import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

/** Advance story to next choice or end, collecting all text and tags */
function advance(story) {
  const text = [];
  const tags = [];
  while (story.canContinue) {
    text.push(story.Continue());
    tags.push(...story.currentTags);
  }
  return { text: text.join(' '), tags, choices: story.currentChoices };
}

/** Choose first option whose text contains the search string */
function chooseByText(story, search) {
  const idx = story.currentChoices.findIndex((c) => c.text.includes(search));
  if (idx < 0) throw new Error(`Choice not found: "${search}" in [${story.currentChoices.map(c => c.text).join(', ')}]`);
  story.ChooseChoiceIndex(idx);
  return advance(story);
}

/** Play the canonical folk path to a specific scene */
function playCanonicalTo(story, targetScene) {
  advance(story); // Epigraph → Scene 1 transition

  if (targetScene <= 1) return;
  chooseByText(story, 'Войти'); // Skip flashback, enter library

  if (targetScene <= 2) return;
  chooseByText(story, 'дождь и кирпич'); // Barnes

  if (targetScene <= 3) return;
  chooseByText(story, 'Давай разберёмся'); // Folk with Alice
  chooseByText(story, 'земля и грибы'); // Cogumelos

  if (targetScene <= 4) return;
  chooseByText(story, 'Каждый факт'); // Folk with Gonzo
  // Right door (no flashback seen → nested choice)
  chooseByText(story, 'Правая дверь');
  chooseByText(story, 'Открыть'); // Skip flashback, go to Dan

  if (targetScene <= 5) return;
  chooseByText(story, 'Расскажи, как рассказывать'); // Folk with Dan
  chooseByText(story, 'Не сейчас'); // Skip Breus flashback → back to hub → Scene 7

  if (targetScene <= 7) return;
  chooseByText(story, 'Нет. Эти люди'); // Refuse Breus
  chooseByText(story, 'Я найду другой путь'); // Other way

  if (targetScene <= 8) return;
  // Now at Scene 8 choice
  chooseByText(story, 'Мы справимся'); // Folk

  if (targetScene <= 9) return;
  // Scene 9 choice
  chooseByText(story, 'Говори. Что ты видишь'); // Listen (folk)

  if (targetScene <= 10) return;
  // Scene 10 — final choice available
}

describe('Story Basics', () => {
  let story;
  beforeEach(() => { story = new Story(storyJson); });

  it('loads without errors', () => {
    expect(story).toBeDefined();
    expect(story.canContinue).toBe(true);
  });

  it('initial variables correct', () => {
    expect(story.variablesState['folk_counter']).toBe(50);
    expect(story.variablesState['current_scene']).toBe(0);
    expect(story.variablesState['alice_trust']).toBe(50);
    expect(story.variablesState['gonzo_trust']).toBe(50);
    expect(story.variablesState['dan_trust']).toBe(50);
    expect(story.variablesState['saw_flashback_stick']).toBe(false);
    expect(story.variablesState['saw_flashback_young_breus']).toBe(false);
  });

  it('starts with epigraph', () => {
    const { tags } = advance(story);
    expect(tags.some((t) => t.includes('SCENE: epigraph'))).toBe(true);
  });
});

describe('Hub Navigation', () => {
  it('library has door choices', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 2);
    expect(story.variablesState['current_scene']).toBe(2);
    expect(story.currentChoices.length).toBeGreaterThanOrEqual(2);
  });

  it('visiting Barnes sets flag', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 3);
    expect(story.variablesState['visited_barnes']).toBe(true);
  });

  it('visiting all areas triggers scene 7', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 7);
    expect(story.variablesState['visited_barnes']).toBe(true);
    expect(story.variablesState['visited_cogumelos']).toBe(true);
    expect(story.variablesState['visited_retrotech']).toBe(true);
    expect(story.variablesState['current_scene']).toBe(7);
  });
});

describe('Folk/Dragon Choices', () => {
  it('folk choices increase folk_counter', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 7); // All folk choices
    // Alice +10, Gonzo +10, Dan +10 = 80
    expect(story.variablesState['folk_counter']).toBe(80);
  });

  it('dragon choices decrease folk_counter', () => {
    const story = new Story(storyJson);
    advance(story);
    chooseByText(story, 'Войти');
    chooseByText(story, 'дождь и кирпич');
    chooseByText(story, 'У меня мало времени'); // Dragon Alice
    chooseByText(story, 'земля и грибы');
    chooseByText(story, 'Всё проверять не получится'); // Dragon Gonzo
    chooseByText(story, 'Правая дверь');
    chooseByText(story, 'Открыть');
    chooseByText(story, 'Мне нужна аудитория'); // Dragon Dan
    chooseByText(story, 'Не сейчас');
    // Alice -10, Gonzo -10, Dan -10 = 20
    expect(story.variablesState['folk_counter']).toBe(20);
  });
});

describe('Scene 8', () => {
  it('scene 8 has 2 choices', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 8);
    expect(story.variablesState['current_scene']).toBe(8);
    expect(story.currentChoices.length).toBe(2);
    expect(story.currentChoices[0].text).toContain('Мы справимся');
    expect(story.currentChoices[1].text).toContain('план');
  });

  it('folk path +5, dragon path -5', () => {
    const s1 = new Story(storyJson);
    playCanonicalTo(s1, 8);
    const before = s1.variablesState['folk_counter'];
    chooseByText(s1, 'Мы справимся');
    expect(s1.variablesState['folk_counter']).toBe(before + 5);

    const s2 = new Story(storyJson);
    playCanonicalTo(s2, 8);
    chooseByText(s2, 'план');
    expect(s2.variablesState['folk_counter']).toBe(before - 5);
  });
});

describe('Endings', () => {
  it('story ends after credits', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 10);
    chooseByText(story, 'Отказать');
    // Run until complete end
    let safety = 0;
    while (story.canContinue || story.currentChoices.length > 0) {
      if (story.canContinue) story.Continue();
      else story.ChooseChoiceIndex(0);
      if (++safety > 500) break;
    }
    expect(story.canContinue).toBe(false);
    expect(story.currentChoices.length).toBe(0);
    expect(safety).toBeLessThan(500);
  });

  it('final_choice variable is set', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 10);
    chooseByText(story, 'Отказать');
    advance(story);
    expect(story.variablesState['final_choice']).toBe('refuse');
  });
});

describe('Flashbacks', () => {
  it('stick flashback sets flag', () => {
    const story = new Story(storyJson);
    advance(story);
    chooseByText(story, 'Вспомнить');
    expect(story.variablesState['saw_flashback_stick']).toBe(true);
  });

  it('young breus flashback sets flag', () => {
    const story = new Story(storyJson);
    advance(story);
    chooseByText(story, 'Войти');
    chooseByText(story, 'дождь и кирпич');
    chooseByText(story, 'Давай разберёмся');
    chooseByText(story, 'земля и грибы');
    chooseByText(story, 'Каждый факт');
    chooseByText(story, 'Правая дверь');
    chooseByText(story, 'Открыть');
    chooseByText(story, 'Расскажи, как рассказывать');
    chooseByText(story, 'Вспомнить');
    expect(story.variablesState['saw_flashback_young_breus']).toBe(true);
  });
});

describe('Trust System', () => {
  it('folk alice choice increases trust', () => {
    const story = new Story(storyJson);
    playCanonicalTo(story, 3);
    chooseByText(story, 'Давай разберёмся');
    expect(story.variablesState['alice_trust']).toBe(60);
  });

  it('dragon alice choice decreases trust', () => {
    const story = new Story(storyJson);
    advance(story);
    chooseByText(story, 'Войти');
    chooseByText(story, 'дождь и кирпич');
    chooseByText(story, 'У меня мало времени');
    expect(story.variablesState['alice_trust']).toBe(45);
  });
});
