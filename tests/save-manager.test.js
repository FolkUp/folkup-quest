import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager } from '../src/engine/save-manager.js';

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, value) => { storage[key] = value; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('SaveManager', () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    vi.clearAllMocks();
  });

  it('hasSave returns false when no save exists', () => {
    expect(SaveManager.hasSave()).toBe(false);
  });

  it('save stores state and meta', () => {
    const result = SaveManager.save('{"test": true}', { scene: 8, act: 2 });
    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  });

  it('hasSave returns true after saving', () => {
    SaveManager.save('{"test": true}', {});
    expect(SaveManager.hasSave()).toBe(true);
  });

  it('load returns saved state and meta', () => {
    SaveManager.save('{"storyState": "data"}', { scene: 8, act: 2 });
    const loaded = SaveManager.load();
    expect(loaded).not.toBeNull();
    expect(loaded.state).toBe('{"storyState": "data"}');
    expect(loaded.meta.scene).toBe(8);
    expect(loaded.meta.act).toBe(2);
    expect(loaded.meta.timestamp).toBeDefined();
  });

  it('clear removes save', () => {
    SaveManager.save('data', {});
    expect(SaveManager.hasSave()).toBe(true);
    SaveManager.clear();
    expect(SaveManager.hasSave()).toBe(false);
  });

  it('getMeta returns metadata', () => {
    SaveManager.save('data', { scene: 8, folk_counter: 55 });
    const meta = SaveManager.getMeta();
    expect(meta.scene).toBe(8);
    expect(meta.folk_counter).toBe(55);
  });

  it('getMeta returns null when no save', () => {
    expect(SaveManager.getMeta()).toBeNull();
  });

  it('load returns null when no save', () => {
    expect(SaveManager.load()).toBeNull();
  });
});
