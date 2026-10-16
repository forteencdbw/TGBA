/**
 * The main menu's music: one recorded track, streamed, faded in and out.
 *
 * Separate from `src/music.ts` on purpose. That module SYNTHESISES a mood per level from a few numbers; this is a
 * finished piece of music in a file, and almost nothing about the two is shared except the bus they play into.
 *
 * ---------------------------------------------------------------------------------------------
 * STREAMED, NOT DECODED
 * ---------------------------------------------------------------------------------------------
 * The track is ~190 seconds of stereo. Decoding it with `decodeAudioData` would hold the whole thing as float PCM,
 * roughly 70 MB of memory on a phone for the sake of a menu. An `<audio>` element decodes as it plays, so the cost is
 * the file's own ~2 MB. It is routed through `createMediaElementSource` into the game's master bus, which is what makes
 * the settings volume and the mute key apply to it with no second control.
 *
 * Nothing is created until the browser has allowed sound (`audio.musicBus()` is null before the first gesture), so the
 * 2 MB is not fetched for a player who has not touched the screen yet.
 *
 * ---------------------------------------------------------------------------------------------
 * ONE ENVELOPE FOR EVERYTHING
 * ---------------------------------------------------------------------------------------------
 * Coming in, leaving, and the loop point are all the same thing: `presence` moving between 0 and 1. The loop is
 * "leave, rewind, come back" -- near the end of the file the target drops to 0, and when it has arrived the track is put
 * back to the start and the target returns to 1. There is no sample-accurate seam to get right (MP3 cannot promise one
 * anyway); the fade hides it.
 */
import menuTrackUrl from './assets/audio/abyssal-menu.mp3?url';
import { mech } from './mechanisms';

export class MenuMusic {
  private el: HTMLAudioElement | null = null;
  private gain: GainNode | null = null;
  /** 0..1: how far the track is faded in. The only thing the fade logic reads and writes. */
  private presence = 0;
  /** Set when the track was faded out for good, so the next time it comes in it starts from the beginning. */
  private rewind = false;
  /** `performance.now()` before which `play()` is not retried, so a refused start is not hammered every frame. */
  private retryAfter = 0;

  /**
   * Advance the fade and make sure the element is in the right state.
   *
   * @param active whether the menu is the thing on screen.
   * @param bus the game's audio bus, or null before the first gesture.
   *
   * Also called with `dt` 0 from the pointer handler: `play()` is only reliably allowed inside a gesture on iOS, and
   * that call is what starts the first one there.
   */
  update(dt: number, active: boolean, bus: { ctx: AudioContext; destination: AudioNode } | null): void {
    if (!bus) return;
    if (!this.el) {
      if (!active) return;
      this.create(bus);
    }
    const el = this.el;
    const gain = this.gain;
    if (!el || !gain || el.error) return;
    const cfg = mech.audio.music.menu;

    // Near the end of the file the target drops to zero so the track fades out before it runs out. `duration` is NaN
    // until the metadata has arrived, which compares false, so the first seconds never loop early.
    const looping = active && el.duration - el.currentTime <= cfg.loopFadeSeconds;
    const target = active && !looping ? 1 : 0;
    const seconds = target > this.presence ? cfg.fadeInSeconds : active ? cfg.loopFadeSeconds : cfg.leaveFadeSeconds;
    const step = dt / Math.max(0.01, seconds);
    this.presence = target > this.presence ? Math.min(target, this.presence + step) : Math.max(target, this.presence - step);

    if (active) {
      if (looping && this.presence === 0) el.currentTime = 0;
      if ((el.paused || el.ended) && performance.now() >= this.retryAfter) this.start(el);
    } else if (this.presence === 0 && !el.paused) {
      el.pause();
      this.rewind = true;
    }
    gain.gain.setTargetAtTime(this.presence * cfg.volume, bus.ctx.currentTime, 0.05);
  }

  private start(el: HTMLAudioElement): void {
    if (this.rewind || el.ended) {
      el.currentTime = 0;
      this.rewind = false;
    }
    el.play().catch(() => {
      // Refused (no gesture yet, or the element is not ready): try again shortly rather than every frame.
      this.retryAfter = performance.now() + 1000;
    });
  }

  private create(bus: { ctx: AudioContext; destination: AudioNode }): void {
    const el = new Audio(menuTrackUrl);
    el.preload = 'auto';
    // `loop` is left off: the loop is the envelope's job (see the header).
    const gain = bus.ctx.createGain();
    gain.gain.value = 0;
    bus.ctx.createMediaElementSource(el).connect(gain);
    gain.connect(bus.destination);
    this.el = el;
    this.gain = gain;
    // A hidden tab should be quiet, the way the level music is (its step clock stops with the frame loop). `update`
    // starts it again, from where it was, when the tab is back and the menu is still up.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !el.paused) el.pause();
    });
  }

  /** Test hook: what the element and the fade are doing, so a probe can read it without hearing it. */
  get stateRef(): { created: boolean; playing: boolean; presence: number; time: number; duration: number } {
    const el = this.el;
    return { created: !!el, playing: !!el && !el.paused, presence: this.presence, time: el?.currentTime ?? 0, duration: el?.duration ?? 0 };
  }
}
