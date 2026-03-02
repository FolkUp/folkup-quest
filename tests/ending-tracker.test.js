import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, value) => { storage[key] = value; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
};

vi.stubGlobal('localStorage', localStorageMock);

import { EndingTracker } from '../src/engine/ending-tracker.js';

describe('EndingTracker', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    vi.clearAllMocks();
  });

  it('getSeen returns empty array initially', () => {
    expect(EndingTracker.getSeen()).toEqual([]);
  });

  it('getCount returns 0 initially', () => {
    expect(EndingTracker.getCount()).toBe(0);
  });

  it('total returns 3', () => {
    expect(EndingTracker.total).toBe(3);
  });

  it('record stores an ending', () => {
    EndingTracker.record('lantern');
    expect(EndingTracker.getSeen()).toEqual(['lantern']);
    expect(EndingTracker.getCount()).toBe(1);
  });

  it('record does not duplicate endings', () => {
    EndingTracker.record('lantern');
    EndingTracker.record('lantern');
    expect(EndingTracker.getSeen()).toEqual(['lantern']);
    expect(EndingTracker.getCount()).toBe(1);
  });

  it('records multiple different endings', () => {
    EndingTracker.record('lantern');
    EndingTracker.record('bridge');
    EndingTracker.record('chair');
    expect(EndingTracker.getCount()).toBe(3);
    expect(EndingTracker.getSeen()).toContain('lantern');
    expect(EndingTracker.getSeen()).toContain('bridge');
    expect(EndingTracker.getSeen()).toContain('chair');
  });

  it('hasSeen returns true for recorded endings', () => {
    EndingTracker.record('bridge');
    expect(EndingTracker.hasSeen('bridge')).toBe(true);
    expect(EndingTracker.hasSeen('lantern')).toBe(false);
  });

  it('clear removes all records', () => {
    EndingTracker.record('lantern');
    EndingTracker.record('bridge');
    EndingTracker.clear();
    expect(EndingTracker.getSeen()).toEqual([]);
    expect(EndingTracker.getCount()).toBe(0);
  });

  it('getSeen filters invalid endings', () => {
    storage['folkup-quest-endings'] = JSON.stringify(['lantern', 'invalid', 'bridge']);
    expect(EndingTracker.getSeen()).toEqual(['lantern', 'bridge']);
  });

  it('getSeen handles corrupted localStorage gracefully', () => {
    storage['folkup-quest-endings'] = 'not json';
    expect(EndingTracker.getSeen()).toEqual([]);
  });

  it('getSeen handles non-array JSON gracefully', () => {
    storage['folkup-quest-endings'] = JSON.stringify({ not: 'array' });
    expect(EndingTracker.getSeen()).toEqual([]);
  });
});
