/**
 * The recorded music: one streamed track per slot, and the rule for which slot is playing.
 *
 * ---------------------------------------------------------------------------------------------
 * A SLOT, NOT A SONG
 * ---------------------------------------------------------------------------------------------
 * There are four moments that want a recorded piece -- the menu, a level, a boss fight, the results screen -- and each is
 * a slot whose FILE is optional. A slot with no file is not silence: the level's synthesiser (`src/music.ts`) covers the
 * level, and a missing boss or results track simply leaves whatever was playing up. That is what makes "the owner is still
 * writing them" a supported state rather than a broken one, and it is why nothing here is required to exist.
 *
 * Files are named after their slot, in `src/assets/audio/music/`:
 *
 *   <level id>.mp3   the level, replacing that level's synthesised recipe
 *   boss.mp3         the boss fight
 *   summary.mp3      the results screen
 *
 * The menu's track is the exception and is imported directly (`assets/audio/abyssal-menu.mp3`): it is the one piece that
 * belongs to no level, so there is no id to name it after.
 *
 * All of them go through `StreamedTrack`, so they share one envelope (fade in, fade out, loop) and every one of them is
 * governed by the settings panel's music slider.
 */
import menuTrackUrl from './assets/audio/abyssal-menu.mp3?url';
import { mech } from './mechanisms';
import { musicFileUrl, StreamedTrack, type StreamedTrackConfig, type StreamedTrackState } from './streamedTrack';

/** The four moments that can have a recorded piece. */
export type MusicSlot = 'menu' | 'level' | 'boss' | 'summary';

export class RecordedMusic {
  private readonly tracks: Record<MusicSlot, StreamedTrack> = {
    menu: new StreamedTrack(menuTrackUrl),
    level: new StreamedTrack(null),
    boss: new StreamedTrack(musicFileUrl('boss')),
    summary: new StreamedTrack(musicFileUrl('summary')),
  };
  /** The slot that should be playing, or null for none. */
  private slot: MusicSlot | null = null;
  /**
   * Whether the music is HELD rather than playing: faded to silence, paused, and waiting where it stopped.
   *
   * The mutation pick is a pause in the music, not a departure from it -- the level's track has minutes left to run and
   * this can happen three times in one level -- so it needs a state that is neither "playing" nor "left". Set by the game
   * for as long as the pick's slow motion is running.
   */
  private held = false;
  /** The world's timescale, so a recorded track can be slowed the only way an element can: played slower. */
  private rate = 1;

  /**
   * Point the level slot at a track's file, or at nothing when that track has no recording yet.
   *
   * The name is a TRACK, not necessarily a level id: two levels can name the same stem in their `music` field, and
   * the game falls back to the level's own id (then `looksLike`) when the field is absent.
   */
  setLevel(track: string): void {
    this.tracks.level.setUrl(musicFileUrl(track));
  }

  /** Whether a slot has a file at all, which is what decides between the recording and the synthesiser. */
  has(slot: MusicSlot): boolean {
    return this.tracks[slot].stateRef.url !== null;
  }

  /**
   * Resolve when a slot's file can start, or at once when it has no file.
   *
   * The boot loader asks this about the menu's track before showing the menu. Playback still waits for the first
   * gesture; this only warms the download -- see `StreamedTrack.whenPlayable`.
   */
  whenPlayable(slot: MusicSlot): Promise<void> {
    return this.tracks[slot].whenPlayable();
  }

  /** Make a slot the one playing, or none of them. */
  play(slot: MusicSlot | null): void {
    this.slot = slot;
  }

  /**
   * Hold the music where it is, or let it go.
   *
   * While held the current slot fades to silence and pauses WITHOUT forgetting its position; releasing it fades back in
   * and carries on from that second. See `StreamedTrack.update`'s `held`.
   */
  hold(on: boolean): void {
    this.held = on;
  }

  /** Follow the world's timescale, so the music slows with a slow motion. */
  setRate(rate: number): void {
    this.rate = rate;
  }

  get playing(): MusicSlot | null {
    return this.slot;
  }

  /**
   * One frame.
   *
   * Every track is updated, not only the current one: the ones that are not current need to be told so, or they would go on
   * playing -- and their fade-out IS that instruction.
   *
   * `dt` of 0 and `bus` for the first call from a pointer handler: `play()` is only reliably allowed inside a gesture on
   * iOS, and the menu's track is the one that starts there.
   */
  update(dt: number, bus: { ctx: AudioContext; destination: AudioNode } | null): void {
    const cfg = mech.audio.music.recorded;
    for (const slot of ['menu', 'level', 'boss', 'summary'] as const) {
      this.tracks[slot].update(dt, this.slot === slot, bus, this.configFor(slot, cfg), { held: this.held, rate: this.rate });
    }
  }

  private configFor(slot: MusicSlot, cfg: typeof mech.audio.music.recorded): StreamedTrackConfig {
    const volume =
      slot === 'menu' ? mech.audio.music.menu.volume : slot === 'level' ? cfg.levelVolume : slot === 'boss' ? cfg.bossVolume : cfg.summaryVolume;
    return {
      volume,
      fadeInSeconds: cfg.fadeInSeconds,
      leaveFadeSeconds: cfg.leaveFadeSeconds,
      loopFadeSeconds: cfg.loopFadeSeconds,
      holdFadeSeconds: cfg.holdFadeSeconds,
    };
  }

  /** Test hook: what each slot's element and fade are doing, so a probe can read it without hearing it. */
  get stateRef(): Record<MusicSlot, StreamedTrackState> & { playing: MusicSlot | null; held: boolean; rate: number } {
    return {
      playing: this.slot,
      held: this.held,
      rate: this.rate,
      menu: this.tracks.menu.stateRef,
      level: this.tracks.level.stateRef,
      boss: this.tracks.boss.stateRef,
      summary: this.tracks.summary.stateRef,
    };
  }
}
