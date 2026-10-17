/**
 * A recorded track, streamed and faded in and out.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY ELEMENT AND NOT BUFFER
 * ---------------------------------------------------------------------------------------------
 * A track is minutes long. Decoding one with `decodeAudioData` holds all of it as float PCM -- about 70 MB of memory for
 * three minutes of stereo -- for the sake of background music. An `<audio>` element decodes as it plays, so the cost is
 * the file's own couple of megabytes. Routing it through `createMediaElementSource` into the game's bus is what makes the
 * settings sliders and the mute key apply to it with no second volume control.
 *
 * The MENU track is the exception: its element is created and fetched at boot (`whenPlayable`), because the loading page
 * waits for the music behind the menu before it lets the menu be seen. PLAYBACK is still refused until the first gesture
 * -- only the download starts early. Every other slot is still created on its first play, so an unplayed level's file is
 * never fetched.
 *
 * ---------------------------------------------------------------------------------------------
 * ONE ENVELOPE FOR EVERYTHING
 * ---------------------------------------------------------------------------------------------
 * Coming in, leaving, and the loop point are the same thing: `presence` moving between 0 and 1. The loop is "leave,
 * rewind, come back" -- near the end of the file the target drops to 0, and once it has arrived the track is put back to
 * the start and the target returns to 1. No sample-accurate seam is attempted (an MP3 cannot promise one); the fade hides
 * it.
 *
 * Used by every slot in `src/recordedMusic.ts`, which is why it is a class: they differ only in which file and which numbers.
 */
/** The four numbers each streamed track is played by. */
export interface StreamedTrackConfig {
  /** How loud, 0..1, before the player's own slider. */
  volume: number;
  /** Seconds to fade in when it starts, and again after each loop. */
  fadeInSeconds: number;
  /** Seconds to fade out when it is no longer the thing playing. */
  leaveFadeSeconds: number;
  /** Seconds before the end of the file at which it fades out, to loop back to the start. */
  loopFadeSeconds: number;
  /** Seconds to fade out when this slot is HELD rather than left. See `update`'s `held`. */
  holdFadeSeconds: number;
}

/** What `stateRef` reports: enough to prove the fade and the element are doing what they should. */
export interface StreamedTrackState {
  created: boolean;
  playing: boolean;
  presence: number;
  time: number;
  duration: number;
  url: string | null;
}

export class StreamedTrack {
  private el: HTMLAudioElement | null = null;
  private gain: GainNode | null = null;
  /** 0..1: how far the track is faded in. The only thing the fade logic reads and writes. */
  private presence = 0;
  /** Set when the track was faded out for good, so the next time it comes in it starts from the beginning. */
  private rewind = false;
  /** `performance.now()` before which `play()` is not retried, so a refused start is not hammered every frame. */
  private retryAfter = 0;

  constructor(private url: string | null = null) {}

  /**
   * Point at another file, or at none.
   *
   * A change tears the element down rather than repointing it: a `MediaElementAudioSourceNode` is bound to ONE element for
   * its life and cannot be moved to another, so the only way to change track is a new element and a new source node.
   */
  setUrl(url: string | null): void {
    if (url === this.url) return;
    this.url = url;
    this.el?.pause();
    this.el = null;
    this.gain = null;
    this.presence = 0;
  }

  /**
   * Advance the fade and make sure the element is in the right state.
   *
   * @param active whether this track is the one that should be playing.
   * @param bus the game's music bus, or null before the first gesture.
   * @param dt seconds since the last call. 0 is passed from a pointer handler: `play()` is only reliably allowed inside a
   *   gesture on iOS, and that call is what starts the first one there.
   * @param opts `held` fades this slot to silence but LEAVES IT WHERE IT IS, and `rate` is the world's timescale -- a
   *   recorded track is slowed by playing it slower, which is the only way an `<audio>` element can be slowed at all.
   */
  update(
    dt: number,
    active: boolean,
    bus: { ctx: AudioContext; destination: AudioNode } | null,
    cfg: StreamedTrackConfig,
    opts: { held?: boolean; rate?: number } = {},
  ): void {
    if (!bus) return;
    const held = opts.held ?? false;
    if (!this.el) {
      if (!active || !this.url) return;
      this.ensureElement();
    }
    const el = this.el;
    if (!el) return;
    // The element may predate the bus (the menu's is fetched at boot), so the graph is built on the first frame that
    // has one, rather than in the same breath as the element.
    if (!this.gain) this.connect(bus);
    const gain = this.gain;
    if (!gain || el.error) return;

    // Near the end of the file the target drops to zero so the track fades out before it runs out. `duration` is NaN until
    // the metadata has arrived, which compares false, so the first seconds never loop early.
    const looping = active && !held && el.duration - el.currentTime <= cfg.loopFadeSeconds;
    const target = active && !held && !looping ? 1 : 0;
    /**
     * WHICH FADE, and the three cases are three different things rather than three lengths.
     *
     * Coming UP is always `fadeInSeconds`. Going down depends on WHY: a HOLD (the pick) uses its own length so it can be
     * made to match the slow motion it is riding; the loop point uses the loop's; and being left for another slot uses the
     * leave fade. Sharing one number between them would mean the pick could not be made silent exactly when the cards
     * appear without changing every other fade in the game.
     */
    const seconds =
      target > this.presence ? cfg.fadeInSeconds : held ? cfg.holdFadeSeconds : active ? cfg.loopFadeSeconds : cfg.leaveFadeSeconds;
    const step = dt / Math.max(0.01, seconds);
    this.presence = target > this.presence ? Math.min(target, this.presence + step) : Math.max(target, this.presence - step);

    if (active && !held) {
      if (looping && this.presence === 0) el.currentTime = 0;
      if ((el.paused || el.ended) && performance.now() >= this.retryAfter) this.start(el);
    } else if (this.presence === 0 && !el.paused) {
      el.pause();
      /**
       * A HOLD REMEMBERS WHERE IT WAS; being left does not.
       *
       * `rewind` is what makes the next start begin at zero, and it is set here rather than at `start` because this is the
       * moment that knows WHY the element stopped. The pick can happen three times in one level, and a 173-second track
       * that began again each time would be three openings and no middle.
       */
      this.rewind = !held;
    }
    // The world's tape speed. A step rather than a ramp: the slow motion's own shape is already the ramp, and the element
    // follows it frame by frame.
    const rate = Math.max(0.05, Math.min(1, opts.rate ?? 1));
    if (el.playbackRate !== rate) el.playbackRate = rate;
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

  /**
   * Resolve once the file can start playing, or at once when this slot has no file.
   *
   * Called by the boot loader for the menu's track: the first screen is not shown until the music behind it can start,
   * so pressing 开始 does not begin with a silent second while a download catches up. `canplay` means "enough has
   * arrived to start", not "all of it has", which is the right bar -- the rest keeps streaming.
   *
   * An error resolves rather than rejects, for the same reason every other asset failure here is survivable: music is
   * an upgrade to the screen, never a precondition, and a missing file must not leave the player on the loading page.
   */
  whenPlayable(): Promise<void> {
    if (!this.url) return Promise.resolve();
    const el = this.ensureElement();
    if (!el || el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = (): void => {
        if (settled) return;
        settled = true;
        el.removeEventListener('canplay', finish);
        el.removeEventListener('loadeddata', finish);
        el.removeEventListener('error', finish);
        resolve();
      };
      el.addEventListener('canplay', finish);
      el.addEventListener('loadeddata', finish);
      el.addEventListener('error', finish);
      // It may have become playable between the check above and the listeners going on.
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) finish();
    });
  }

  /**
   * The element, created but NOT yet wired into the audio graph.
   *
   * The split exists so `whenPlayable` can fetch before a gesture has produced an AudioContext. `preload = 'auto'` is
   * what starts the download; `loop` is left off because the loop is the envelope's job (see the header).
   */
  private ensureElement(): HTMLAudioElement | null {
    if (this.el) return this.el;
    if (!this.url) return null;
    const el = new Audio(this.url);
    el.preload = 'auto';
    this.el = el;
    // A hidden tab should be quiet, the way the level music is (its step clock stops with the frame loop). `update` starts
    // it again, from where it was, when the tab is back and this track is still the one up.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !el.paused) el.pause();
    });
    return el;
  }

  /**
   * Build the graph: element -> gain -> the game's music bus.
   *
   * A `MediaElementAudioSourceNode` can be created for an element only ONCE, which is why this is guarded by `gain`
   * rather than called wherever an element exists. A bus that changes (it does not today) would need a new element.
   */
  private connect(bus: { ctx: AudioContext; destination: AudioNode }): void {
    const el = this.el;
    if (!el || this.gain) return;
    const gain = bus.ctx.createGain();
    gain.gain.value = 0;
    bus.ctx.createMediaElementSource(el).connect(gain);
    gain.connect(bus.destination);
    this.gain = gain;
  }

  /** Test hook: what the element and the fade are doing, so a probe can read it without hearing it. */
  get stateRef(): StreamedTrackState {
    const el = this.el;
    return {
      created: !!el,
      playing: !!el && !el.paused,
      presence: this.presence,
      time: el?.currentTime ?? 0,
      duration: el?.duration ?? 0,
      url: this.url,
    };
  }
}

/**
 * Every recorded track the game can play, by the name its slot is called.
 *
 * `music/<name>.mp3` in the assets directory. None of them exist yet, and that is a supported state: a slot with no file
 * falls back to the level's synthesised recipe (see `src/music.ts`), so the game has music either way and adding a file is
 * a file drop with no code and no config change.
 */
const MUSIC_FILES = import.meta.glob('./assets/audio/music/*.{mp3,wav,ogg,m4a}', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>;

/** The URL for a named track, or null when no file of that name has been added. */
export function musicFileUrl(name: string): string | null {
  for (const [path, url] of Object.entries(MUSIC_FILES)) {
    if (path.replace(/^.*\//, '').replace(/\.[^.]+$/, '') === name) return url;
  }
  return null;
}
