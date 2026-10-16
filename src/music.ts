/**
 * Per-level music, synthesised rather than loaded.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE ARE NO AUDIO FILES
 * ---------------------------------------------------------------------------------------------
 * The level music is generated with WebAudio (see `src/audio.ts`) rather than loaded. The recorded slots
 * (`src/recordedMusic.ts`) are the alternative, and a level with a recording plays that instead -- this module is what
 * covers a level the owner has not written a piece for yet.
 *
 * So a track is a small recipe -- a key, a tempo, a chord progression and a pattern -- and the sound is built from it.
 * That also makes the music TUNABLE in the same way everything else here is: swapping a level's mood is editing a few
 * numbers in `config/mechanics.json5`, not finding another track.
 *
 * ---------------------------------------------------------------------------------------------
 * THREE VOICES, THE WAY A CHIP HAD THEM
 * ---------------------------------------------------------------------------------------------
 * `update(dt)` walks a step clock and schedules the notes that fall in the time it was given, so the music follows the
 * game's own frame loop rather than a `setInterval` that would drift against it and keep playing while the tab is
 * hidden. On every step:
 *
 *   a LEAD     the chord's notes, one per step, on a PULSE wave -- this is what makes a level's mood audible
 *   a BASS     the chord's root, an octave down, on a TRIANGLE, retriggered at each chord change
 *   DRUMS      optional per track: the noise register, on the steps its pattern names
 *
 * Three voices is the whole of it, and there is no filter and no detuning anywhere -- those belong to the synthesiser
 * music this replaced. What tells six levels apart is now the wave's DUTY CYCLE, the register's clock rate and how
 * busy the drums are, which is how the hardware did it too.
 *
 * Everything is created on the game's existing AudioContext, so the settings panel's music slider applies to it with no
 * second volume control, and the browser's "no audio before a gesture" rule is already handled in one place.
 */
import { applyEnvelope, lfsrNoise, pulseWave, type NoiseMode } from './chip';

/** The drums: which steps of the pattern hit, and how the noise register is clocked for them. */
export interface DrumPattern {
  /** One entry per step, cycled: 0 is silence and anything else is a hit, so a pattern can be written as a grid. */
  pattern: number[];
  /** Register clock for a hit. Low is a pitched drum, high is a snare-ish hiss. */
  rate: number;
  /** A hit's clock at the end, as a multiple of `rate` -- below 1 is the falling drum of a kick. */
  endRatio?: number;
  mode?: NoiseMode;
  /** Length of a hit in seconds, and its level within the music bus. */
  seconds: number;
  gain: number;
}

/** One level's music, as authored in the config. */
export interface MusicTrack {
  /** Base frequency of the track's key, in Hz. */
  rootHz: number;
  /** Steps per minute. Slower is calmer; the lead's speed is what the player actually hears. */
  stepPerMinute: number;
  /** Steps between chord changes. */
  stepsPerChord: number;
  /** Semitone offsets from the root, per chord. */
  chords: number[][];
  /** Which chord note the lead plays on each step, cycled. */
  pattern: number[];
  /**
   * The lead's duty cycle: 0.125, 0.25 or 0.5.
   *
   * This is a level's character more than its waveform is -- a 12.5% pulse is thin and bright, a 50% one is hollow and
   * loud, and the two read as different instruments at the same pitch and tempo.
   */
  leadDuty: number;
  /** Level of a lead note, 0..1, within the music's own bus. */
  leadGain: number;
  /** Level of the bass, which sits an octave below the chord's root. */
  bassGain: number;
  /** Note length in seconds. */
  noteSeconds: number;
  /** The drums, or absent for a level that has none -- which is a mood choice, not a missing value. */
  drums?: DrumPattern;
}

export class Music {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private track: MusicTrack | null = null;
  private volume = 0.5;
  /** Seconds into the current step. */
  private stepClock = 0;
  private stepIndex = 0;
  private playing = false;

  /**
   * Attach to the game's audio context.
   *
   * Called once the AudioContext exists (the first user gesture), which is why it is a separate step from `setTrack`:
   * the game may set a level's music before anybody has touched the screen, and nothing may be created before then.
   */
  attach(ctx: AudioContext, destination: AudioNode): void {
    if (this.ctx === ctx) return;
    this.stop();
    this.ctx = ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(destination);
  }

  /** Start a level's music, or stop everything with `null`. Switching tracks restarts the step clock. */
  setTrack(track: MusicTrack | null): void {
    if (track === this.track) return;
    this.track = track;
    this.stepClock = 0;
    this.stepIndex = 0;
    this.playing = track !== null && this.ctx !== null;
    this.fadeTo(this.playing ? this.volume : 0);
  }

  /** Follow the settings panel's slider. */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.playing) this.fadeTo(this.volume);
  }

  /**
   * Play a one-off flourish over the top of the music, and report how long it lasts.
   *
   * Returned rather than assumed: the level-cleared sequence waits for the flourish to FINISH before the bubble flies
   * off, so the two must agree about its length, and they agree by the caller reading the same number the synth does.
   */
  playSting(notes: number[], gapSeconds: number): number {
    const ctx = this.ctx;
    if (!ctx || !this.bus || notes.length === 0) return 0;
    const root = this.track?.rootHz ?? 110;
    notes.forEach((semitone, i) => {
      // A rising flourish is a lead phrase, so it uses the track's own duty rather than a fixed one.
      this.blipAt(root * Math.pow(2, semitone / 12), gapSeconds * 1.8, 0.2, this.track?.leadDuty ?? 0.25, ctx.currentTime + i * gapSeconds);
    });
    return notes.length * gapSeconds;
  }

  /** Stop the music, e.g. on the menu. */
  stop(): void {
    this.playing = false;
    this.fadeTo(0);
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** The track's id-free description, for probes: how many steps a minute it is meant to run at, and whether it has drums. */
  get debugTrack(): { rootHz: number; stepPerMinute: number; chords: number; drums: boolean } | null {
    return this.track
      ? { rootHz: this.track.rootHz, stepPerMinute: this.track.stepPerMinute, chords: this.track.chords.length, drums: !!this.track.drums }
      : null;
  }

  /**
   * Advance the music by one frame.
   *
   * Steps are scheduled HERE rather than ahead of time by a look-ahead scheduler, because this game already has a frame
   * loop that runs while it is visible and stops when the tab is hidden -- which is exactly the behaviour wanted from
   * music in a browser game, and free.
   */
  update(dt: number): void {
    if (!this.playing || !this.track || !this.ctx || !this.bus) return;
    const stepSeconds = 60 / Math.max(1, this.track.stepPerMinute);
    this.stepClock += dt;
    // A frame that took longer than a step schedules at most four notes: enough to catch up, few enough that a stall
    // cannot fire a hundred oscillators at once.
    let scheduled = 0;
    while (this.stepClock >= stepSeconds && scheduled < 4) {
      this.stepClock -= stepSeconds;
      this.playStep(this.stepIndex, stepSeconds);
      this.stepIndex++;
      scheduled++;
    }
  }

  /** One step: a lead note, the bass and the drums on a chord change, and a drum hit where the pattern asks for one. */
  private playStep(index: number, stepSeconds: number): void {
    const track = this.track;
    const ctx = this.ctx;
    if (!track || !ctx || !this.bus) return;
    const perChord = Math.max(1, track.stepsPerChord);
    const chord = track.chords[Math.floor(index / perChord) % track.chords.length];
    if (!chord || !chord.length) return;
    const note = chord[track.pattern[index % track.pattern.length] % chord.length] ?? chord[0]!;
    this.blip(this.frequency(track.rootHz, note), track.noteSeconds, track.leadGain, track.leadDuty);
    /**
     * The bass retriggers only on a chord change, and it is the root an OCTAVE DOWN.
     *
     * An octave down rather than at pitch: a triangle at the root would sit in the same register as the lead and the two
     * would read as one thick voice rather than as a bass under a tune. The octave is also what gives a three-voice
     * arrangement its bottom.
     */
    if (index % perChord === 0) {
      const barSeconds = stepSeconds * perChord;
      this.blip(this.frequency(track.rootHz / 2, chord[0]!), barSeconds, track.bassGain, null);
    }
    const drums = track.drums;
    if (drums && drums.gain > 0 && drums.pattern[index % drums.pattern.length]) {
      this.drum(drums);
    }
  }

  /** Semitones to Hz, relative to the track's root. */
  private frequency(rootHz: number, semitones: number): number {
    return rootHz * Math.pow(2, semitones / 12);
  }

  /**
   * One note: a pulse at the track's duty, or a triangle when `duty` is null.
   *
   * The attack is short rather than instant, and that is the one place this deviates from the effects' chip palette: a
   * sustained note switched on at full level is a click on every step, and a click at the tempo's rate is not a style,
   * it is a fault. Two milliseconds is inaudible as an attack and removes it.
   */
  private blip(hz: number, seconds: number, gain: number, duty: number | null): void {
    this.blipAt(hz, seconds, gain, duty, this.ctx?.currentTime ?? 0);
  }

  /** The same note, at a chosen time, so a flourish can be scheduled as a phrase rather than fired all at once. */
  private blipAt(hz: number, seconds: number, gain: number, duty: number | null, at: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus || gain <= 0.0001) return;
    const osc = ctx.createOscillator();
    if (duty === null) osc.type = 'triangle';
    else osc.setPeriodicWave(pulseWave(ctx, duty, hz));
    osc.frequency.value = hz;
    const env = ctx.createGain();
    const now = Math.max(at, ctx.currentTime);
    applyEnvelope(env.gain, 'linear', 0.002, Math.max(0.02, seconds), gain, now);
    osc.connect(env);
    env.connect(this.bus);
    osc.start(now);
    osc.stop(now + Math.max(0.02, seconds) + 0.02);
  }

  /** One drum hit: a burst of the noise register, with its clock falling if the pattern asks for it. */
  private drum(drums: DrumPattern): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    const now = ctx.currentTime;
    const rate = Math.max(20, drums.rate);
    const src = ctx.createBufferSource();
    src.buffer = lfsrNoise(ctx, drums.mode ?? 'hiss', rate, drums.seconds);
    if (drums.endRatio !== undefined && drums.endRatio !== 1) {
      src.playbackRate.setValueAtTime(1, now);
      src.playbackRate.linearRampToValueAtTime(Math.max(0.1, drums.endRatio), now + drums.seconds);
    }
    const env = ctx.createGain();
    applyEnvelope(env.gain, 'linear', 0.001, drums.seconds, drums.gain, now);
    src.connect(env);
    env.connect(this.bus);
    src.start(now);
    src.stop(now + drums.seconds + 0.02);
  }

  /** Glide the music bus to a level. Never a step: a hard gain change on a sustained note is an audible click. */
  private fadeTo(value: number): void {
    if (!this.bus || !this.ctx) return;
    this.bus.gain.setTargetAtTime(value, this.ctx.currentTime, 0.35);
  }
}
