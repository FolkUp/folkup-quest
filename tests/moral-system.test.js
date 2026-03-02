import { describe, it, expect } from 'vitest';
import {
  determineEnding,
  getEndingName,
  parseFeedbackTag,
  parseLampTag,
  parseEndingTag,
  parseAudioTag,
} from '../src/engine/moral-system.js';

describe('determineEnding', () => {
  // High Folk (≥65)
  it('accept + high folk → bridge', () => {
    expect(determineEnding(70, 'accept')).toBe('bridge');
  });
  it('refuse + high folk → lantern', () => {
    expect(determineEnding(70, 'refuse')).toBe('lantern');
  });
  it('counter_offer + high folk → lantern (best)', () => {
    expect(determineEnding(80, 'counter_offer')).toBe('lantern');
  });

  // Mid range (36-64)
  it('accept + mid → bridge', () => {
    expect(determineEnding(50, 'accept')).toBe('bridge');
  });
  it('refuse + mid → lantern', () => {
    expect(determineEnding(50, 'refuse')).toBe('lantern');
  });
  it('counter_offer + mid → bridge', () => {
    expect(determineEnding(50, 'counter_offer')).toBe('bridge');
  });

  // High Dragon (<36)
  it('accept + high dragon → chair', () => {
    expect(determineEnding(20, 'accept')).toBe('chair');
  });
  it('refuse + high dragon → bridge', () => {
    expect(determineEnding(20, 'refuse')).toBe('bridge');
  });
  it('counter_offer + high dragon → bridge', () => {
    expect(determineEnding(30, 'counter_offer')).toBe('bridge');
  });

  // Boundary values
  it('folk=65 is high folk', () => {
    expect(determineEnding(65, 'counter_offer')).toBe('lantern');
  });
  it('folk=64 is mid range', () => {
    expect(determineEnding(64, 'counter_offer')).toBe('bridge');
  });
  it('folk=36 is mid range', () => {
    expect(determineEnding(36, 'accept')).toBe('bridge');
  });
  it('folk=35 is high dragon', () => {
    expect(determineEnding(35, 'accept')).toBe('chair');
  });

  // Edge cases
  it('folk=0 + accept → chair', () => {
    expect(determineEnding(0, 'accept')).toBe('chair');
  });
  it('folk=100 + refuse → lantern', () => {
    expect(determineEnding(100, 'refuse')).toBe('lantern');
  });
  it('invalid final choice → bridge (default)', () => {
    expect(determineEnding(50, 'invalid')).toBe('bridge');
  });
});

describe('getEndingName', () => {
  it('returns correct names', () => {
    expect(getEndingName('lantern')).toBe('Фонарь');
    expect(getEndingName('bridge')).toBe('Мост');
    expect(getEndingName('chair')).toBe('Кресло');
  });
  it('returns raw value for unknown ending', () => {
    expect(getEndingName('unknown')).toBe('unknown');
  });
});

describe('parseFeedbackTag', () => {
  it('parses folk feedback', () => {
    expect(parseFeedbackTag('FEEDBACK: folk')).toBe('folk');
  });
  it('parses dragon feedback', () => {
    expect(parseFeedbackTag('FEEDBACK: dragon')).toBe('dragon');
  });
  it('returns null for non-feedback tag', () => {
    expect(parseFeedbackTag('SCENE: test')).toBeNull();
  });
  it('returns null for malformed tag', () => {
    expect(parseFeedbackTag('FEEDBACK: invalid')).toBeNull();
  });
});

describe('parseLampTag', () => {
  it('parses steady', () => {
    expect(parseLampTag('LAMP: steady')).toBe('steady');
  });
  it('parses bright', () => {
    expect(parseLampTag('LAMP: bright')).toBe('bright');
  });
  it('parses flicker', () => {
    expect(parseLampTag('LAMP: flicker')).toBe('flicker');
  });
  it('returns null for unknown state', () => {
    expect(parseLampTag('LAMP: off')).toBeNull();
  });
});

describe('parseEndingTag', () => {
  it('parses lantern ending', () => {
    expect(parseEndingTag('ENDING: lantern')).toBe('lantern');
  });
  it('parses bridge ending', () => {
    expect(parseEndingTag('ENDING: bridge')).toBe('bridge');
  });
  it('parses chair ending', () => {
    expect(parseEndingTag('ENDING: chair')).toBe('chair');
  });
  it('returns null for non-ending tag', () => {
    expect(parseEndingTag('SCENE: test')).toBeNull();
  });
  it('returns null for invalid ending', () => {
    expect(parseEndingTag('ENDING: invalid')).toBeNull();
  });
});

describe('parseAudioTag', () => {
  it('parses track name', () => {
    expect(parseAudioTag('AUDIO: act1-dark')).toBe('act1-dark');
  });
  it('parses stop command', () => {
    expect(parseAudioTag('AUDIO: stop')).toBe('stop');
  });
  it('returns null for non-audio tag', () => {
    expect(parseAudioTag('SCENE: test')).toBeNull();
  });
  it('is case insensitive', () => {
    expect(parseAudioTag('Audio: Act2-Tension')).toBe('act2-tension');
  });
  it('handles hyphens in track name', () => {
    expect(parseAudioTag('AUDIO: act3-resolution')).toBe('act3-resolution');
  });
  it('returns null for empty value', () => {
    expect(parseAudioTag('AUDIO: ')).toBeNull();
  });
});
