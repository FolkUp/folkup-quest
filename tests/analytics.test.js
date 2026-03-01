import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock import.meta.env before importing
vi.stubEnv('DEV', true);

const {
  initAnalytics,
  trackEvent,
  trackGameStart,
  trackChoiceMade,
  trackActChanged,
  trackEndingReached,
  trackGameCompleted,
} = await import('../src/utils/analytics.js');

describe('analytics', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('initAnalytics enables in dev mode', () => {
    initAnalytics();
    // Should log dev mode message
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[analytics] dev mode')
    );
  });

  it('trackEvent logs to console in dev mode', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackEvent('test_event', { key: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] test_event', { key: 'value' });
  });

  it('trackGameStart sends correct params for new game', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackGameStart(true);
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] game_start', { type: 'new' });
  });

  it('trackGameStart sends correct params for continue', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackGameStart(false);
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] game_start', { type: 'continue' });
  });

  it('trackChoiceMade sends choice index and scene', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackChoiceMade(2, 'scene5');
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] choice_made', { choice: 2, scene: 'scene5' });
  });

  it('trackActChanged sends act number', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackActChanged(2);
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] act_changed', { act: 2 });
  });

  it('trackEndingReached sends ending name', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackEndingReached('lantern');
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] ending_reached', { ending: 'lantern' });
  });

  it('trackGameCompleted sends ending and folk counter', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackGameCompleted('bridge', 55);
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] game_completed', { ending: 'bridge', folk_counter: 55 });
  });

  it('trackEvent with no params works', () => {
    initAnalytics();
    consoleSpy.mockClear();
    trackEvent('simple_event');
    expect(consoleSpy).toHaveBeenCalledWith('[analytics] simple_event', {});
  });
});
