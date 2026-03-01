import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Story } from 'inkjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storyJson = readFileSync(resolve(__dirname, '../public/story.json'), 'utf-8');

describe('Scene 8 Ink Story', () => {
  let story;

  beforeEach(() => {
    story = new Story(storyJson);
  });

  it('loads story without errors', () => {
    expect(story).toBeDefined();
    expect(story.canContinue).toBe(true);
  });

  it('has initial variables set correctly', () => {
    expect(story.variablesState['folk_counter']).toBe(50);
    expect(story.variablesState['current_scene']).toBe(0);
    expect(story.variablesState['alice_trust']).toBe(50);
  });

  it('starts at scene 8', () => {
    // Continue until first CONTINUE tag
    while (story.canContinue) {
      story.Continue();
      if (story.currentTags.includes('CONTINUE')) break;
    }
    expect(story.variablesState['current_scene']).toBe(8);
    expect(story.variablesState['current_act']).toBe(2);
  });

  it('has SCENE tag', () => {
    story.Continue();
    const allTags = [...story.currentTags];
    expect(allTags.some((t) => t.startsWith('SCENE:'))).toBe(true);
  });

  it('reaches choice point with 2 options', () => {
    while (story.canContinue) {
      story.Continue();
    }
    expect(story.currentChoices.length).toBe(2);
    expect(story.currentChoices[0].text).toContain('Мы справимся');
    expect(story.currentChoices[1].text).toContain('план');
  });

  it('folk path increases folk_counter by 5', () => {
    while (story.canContinue) {
      story.Continue();
    }
    // Choose "Мы справимся. Вместе."
    story.ChooseChoiceIndex(0);
    while (story.canContinue) {
      story.Continue();
    }
    expect(story.variablesState['folk_counter']).toBe(55);
  });

  it('dragon path increases folk_counter by 5', () => {
    while (story.canContinue) {
      story.Continue();
    }
    // Choose "План с цифрами"
    story.ChooseChoiceIndex(1);
    while (story.canContinue) {
      story.Continue();
    }
    // Dragon path also +5 (constructive dragon)
    expect(story.variablesState['folk_counter']).toBe(55);
  });

  it('folk path has FEEDBACK: folk tag', () => {
    while (story.canContinue) {
      story.Continue();
    }
    story.ChooseChoiceIndex(0);
    const allTags = [];
    while (story.canContinue) {
      story.Continue();
      allTags.push(...story.currentTags);
    }
    expect(allTags.some((t) => t.includes('FEEDBACK: folk'))).toBe(true);
  });

  it('dragon path has FEEDBACK: dragon tag', () => {
    while (story.canContinue) {
      story.Continue();
    }
    story.ChooseChoiceIndex(1);
    const allTags = [];
    while (story.canContinue) {
      story.Continue();
      allTags.push(...story.currentTags);
    }
    expect(allTags.some((t) => t.includes('FEEDBACK: dragon'))).toBe(true);
  });

  it('both paths have LAMP tag', () => {
    // Folk path
    const storyFolk = new Story(storyJson);
    while (storyFolk.canContinue) { storyFolk.Continue(); }
    storyFolk.ChooseChoiceIndex(0);
    const folkTags = [];
    while (storyFolk.canContinue) {
      storyFolk.Continue();
      folkTags.push(...storyFolk.currentTags);
    }
    expect(folkTags.some((t) => t.startsWith('LAMP:'))).toBe(true);

    // Dragon path
    const storyDragon = new Story(storyJson);
    while (storyDragon.canContinue) { storyDragon.Continue(); }
    storyDragon.ChooseChoiceIndex(1);
    const dragonTags = [];
    while (storyDragon.canContinue) {
      storyDragon.Continue();
      dragonTags.push(...storyDragon.currentTags);
    }
    expect(dragonTags.some((t) => t.startsWith('LAMP:'))).toBe(true);
  });

  it('both paths reach SCENE_END: 8', () => {
    // Folk path
    const storyFolk = new Story(storyJson);
    while (storyFolk.canContinue) { storyFolk.Continue(); }
    storyFolk.ChooseChoiceIndex(0);
    const folkTags = [];
    while (storyFolk.canContinue) {
      storyFolk.Continue();
      folkTags.push(...storyFolk.currentTags);
    }
    expect(folkTags.some((t) => t === 'SCENE_END: 8')).toBe(true);

    // Dragon path
    const storyDragon = new Story(storyJson);
    while (storyDragon.canContinue) { storyDragon.Continue(); }
    storyDragon.ChooseChoiceIndex(1);
    const dragonTags = [];
    while (storyDragon.canContinue) {
      storyDragon.Continue();
      dragonTags.push(...storyDragon.currentTags);
    }
    expect(dragonTags.some((t) => t === 'SCENE_END: 8')).toBe(true);
  });

  it('story ends (no infinite loops)', () => {
    while (story.canContinue) {
      story.Continue();
    }
    story.ChooseChoiceIndex(0);
    while (story.canContinue) {
      story.Continue();
    }
    expect(story.canContinue).toBe(false);
    expect(story.currentChoices.length).toBe(0);
  });

  describe('with high alice_trust', () => {
    it('shows Alice speaking in folk path', () => {
      story.variablesState['alice_trust'] = 60;
      const allText = [];
      while (story.canContinue) {
        allText.push(story.Continue());
      }
      story.ChooseChoiceIndex(0);
      while (story.canContinue) {
        allText.push(story.Continue());
      }
      const fullText = allText.join(' ');
      expect(fullText).toContain('Let me think');
    });
  });

  describe('with low alice_trust', () => {
    it('Alice stays silent', () => {
      story.variablesState['alice_trust'] = 40;
      const allText = [];
      while (story.canContinue) {
        allText.push(story.Continue());
      }
      story.ChooseChoiceIndex(0);
      while (story.canContinue) {
        allText.push(story.Continue());
      }
      const fullText = allText.join(' ');
      expect(fullText).not.toContain('Let me think');
      expect(fullText).toContain('молчала');
    });
  });
});
