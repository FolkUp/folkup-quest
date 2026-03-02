/**
 * AudioManager — background music with crossfade, mute toggle, mobile unlock
 * Uses HTMLAudioElement (not Web Audio API) for Safari compatibility.
 */

const FADE_DURATION = 2000;
const FADE_STEP = 50;
const TARGET_VOLUME = 0.3;
const STORAGE_KEY = 'folkup-quest-muted';

export class AudioManager {
  constructor() {
    this._muted = this._loadMuteState();
    this._current = null;
    this._outgoing = null;
    this._currentTrack = null;
    this._fadeInterval = null;
    this._outFadeInterval = null;
    this._unlocked = false;
  }

  /** @returns {boolean} */
  get muted() {
    return this._muted;
  }

  /** @returns {string|null} */
  get currentTrack() {
    return this._currentTrack;
  }

  /**
   * Play a track with crossfade. Same track is a no-op.
   * @param {string} trackName — filename without extension, e.g. 'act1-dark'
   */
  play(trackName) {
    if (!this._unlocked) return;
    if (trackName === this._currentTrack) return;

    // Fade out current track
    if (this._current) {
      this._fadeOut(this._current);
    }

    this._currentTrack = trackName;
    const audio = new Audio(`/audio/${trackName}.mp3`);
    audio.loop = true;
    audio.volume = 0;

    audio.addEventListener('error', () => {
      if (this._current === audio) {
        this._current = null;
        this._currentTrack = null;
      }
    });

    this._current = audio;

    if (!this._muted) {
      audio.play().catch(() => {});
      this._fadeIn(audio);
    }
  }

  /** Stop current track with fade out */
  stop() {
    if (this._current) {
      this._fadeOut(this._current);
      this._current = null;
    }
    this._currentTrack = null;
  }

  /** Toggle mute state and persist */
  toggleMute() {
    this._muted = !this._muted;
    this._saveMuteState();

    if (this._current) {
      if (this._muted) {
        this._current.pause();
      } else {
        this._current.play().catch(() => {});
        this._current.volume = TARGET_VOLUME;
      }
    }
  }

  /**
   * Unlock audio on first user gesture (mobile autoplay policy).
   * Call from a click/touch handler.
   */
  unlock() {
    if (this._unlocked) return;
    this._unlocked = true;

    // If a track was queued before unlock, start it now
    if (this._currentTrack && !this._current) {
      this.play(this._currentTrack);
    }
  }

  /** @returns {boolean} */
  static isSupported() {
    try {
      const a = new Audio();
      return typeof a.canPlayType === 'function' && a.canPlayType('audio/mpeg') !== '';
    } catch {
      return false;
    }
  }

  /** Cleanup all intervals and audio elements */
  destroy() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
    if (this._outFadeInterval) {
      clearInterval(this._outFadeInterval);
      this._outFadeInterval = null;
    }
    if (this._current) {
      this._current.pause();
      this._current = null;
    }
    if (this._outgoing) {
      this._outgoing.pause();
      this._outgoing = null;
    }
    this._currentTrack = null;
  }

  /** @private */
  _fadeIn(audio) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const step = (TARGET_VOLUME / FADE_DURATION) * FADE_STEP;
    this._fadeInterval = setInterval(() => {
      if (audio.volume + step >= TARGET_VOLUME) {
        audio.volume = TARGET_VOLUME;
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
      } else {
        audio.volume = Math.min(audio.volume + step, TARGET_VOLUME);
      }
    }, FADE_STEP);
  }

  /** @private */
  _fadeOut(audio) {
    // Stop any existing outgoing fade
    if (this._outFadeInterval) {
      clearInterval(this._outFadeInterval);
      if (this._outgoing) this._outgoing.pause();
    }

    this._outgoing = audio;
    const step = (TARGET_VOLUME / FADE_DURATION) * FADE_STEP;
    this._outFadeInterval = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(this._outFadeInterval);
        this._outFadeInterval = null;
        if (this._outgoing === audio) this._outgoing = null;
      } else {
        audio.volume = Math.max(audio.volume - step, 0);
      }
    }, FADE_STEP);
  }

  /** @private */
  _loadMuteState() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true; // Default: muted
    }
  }

  /** @private */
  _saveMuteState() {
    try {
      localStorage.setItem(STORAGE_KEY, this._muted ? 'true' : 'false');
    } catch {
      // Storage unavailable — silent
    }
  }
}
