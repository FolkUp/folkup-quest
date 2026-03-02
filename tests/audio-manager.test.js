import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Audio constructor
class MockAudio {
  constructor() {
    this.src = '';
    this.loop = false;
    this.volume = 0;
    this.paused = true;
    this._errorHandlers = [];
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  addEventListener(event, handler) {
    if (event === 'error') this._errorHandlers.push(handler);
  }
  canPlayType(type) {
    return type === 'audio/mpeg' ? 'probably' : '';
  }
  _triggerError() {
    this._errorHandlers.forEach((h) => h());
  }
}

// Mock localStorage
function createMockStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
  };
}

describe('AudioManager', () => {
  let AudioManager;

  beforeEach(async () => {
    vi.stubGlobal('Audio', MockAudio);
    vi.stubGlobal('localStorage', createMockStorage());
    // Fresh import each time to reset module state
    const mod = await import('../src/engine/audio-manager.js');
    AudioManager = mod.AudioManager;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('defaults to muted when no localStorage value', () => {
      const am = new AudioManager();
      expect(am.muted).toBe(true);
    });

    it('reads muted=false from localStorage', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      expect(am.muted).toBe(false);
    });

    it('initializes currentTrack as null', () => {
      const am = new AudioManager();
      expect(am.currentTrack).toBeNull();
    });
  });

  describe('isSupported', () => {
    it('returns true when Audio and canPlayType available', () => {
      expect(AudioManager.isSupported()).toBe(true);
    });

    it('returns false when Audio throws', () => {
      vi.stubGlobal('Audio', function () { throw new Error('no audio'); });
      expect(AudioManager.isSupported()).toBe(false);
    });
  });

  describe('play', () => {
    it('does not play before unlock', () => {
      const am = new AudioManager();
      am.play('act1-dark');
      // currentTrack stays null because not unlocked
      expect(am.currentTrack).toBeNull();
    });

    it('sets currentTrack after unlock + play', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('act1-dark');
      expect(am.currentTrack).toBe('act1-dark');
    });

    it('same track is a no-op', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('act1-dark');
      const first = am._current;
      am.play('act1-dark');
      expect(am._current).toBe(first);
    });

    it('different track triggers crossfade (new current)', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('act1-dark');
      const first = am._current;
      am.play('act2-tension');
      expect(am.currentTrack).toBe('act2-tension');
      expect(am._current).not.toBe(first);
      expect(am._outgoing).toBe(first);
    });
  });

  describe('stop', () => {
    it('clears currentTrack', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('act1-dark');
      am.stop();
      expect(am.currentTrack).toBeNull();
    });

    it('stop when nothing playing is safe', () => {
      const am = new AudioManager();
      expect(() => am.stop()).not.toThrow();
    });
  });

  describe('toggleMute', () => {
    it('flips muted state', () => {
      const am = new AudioManager();
      expect(am.muted).toBe(true);
      am.toggleMute();
      expect(am.muted).toBe(false);
      am.toggleMute();
      expect(am.muted).toBe(true);
    });

    it('persists to localStorage', () => {
      const am = new AudioManager();
      am.toggleMute();
      expect(localStorage.setItem).toHaveBeenCalledWith('folkup-quest-muted', 'false');
    });
  });

  describe('unlock', () => {
    it('sets unlocked flag', () => {
      const am = new AudioManager();
      expect(am._unlocked).toBe(false);
      am.unlock();
      expect(am._unlocked).toBe(true);
    });

    it('double unlock is safe', () => {
      const am = new AudioManager();
      am.unlock();
      expect(() => am.unlock()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('cleans up intervals and elements', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('act1-dark');
      am.destroy();
      expect(am._current).toBeNull();
      expect(am._outgoing).toBeNull();
      expect(am.currentTrack).toBeNull();
      expect(am._fadeInterval).toBeNull();
      expect(am._outFadeInterval).toBeNull();
    });
  });

  describe('error resilience', () => {
    it('clears current on audio error', () => {
      vi.stubGlobal('localStorage', createMockStorage({ 'folkup-quest-muted': 'false' }));
      const am = new AudioManager();
      am.unlock();
      am.play('bad-track');
      const audio = am._current;
      audio._triggerError();
      expect(am._current).toBeNull();
      expect(am.currentTrack).toBeNull();
    });
  });
});
