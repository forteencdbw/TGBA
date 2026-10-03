/**
 * Per-level music, synthesised rather than loaded.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE ARE NO AUDIO FILES
 * ---------------------------------------------------------------------------------------------
 * This project has no binary assets at all: every sound it makes is generated with WebAudio (see `src/audio.ts`), and
 * the whole game is a few hundred kilobytes of TypeScript and JSON5. Shipping six music tracks as files would multiply
 * that by orders of magnitude, and would also mean six things to keep in sync with a level list that is edited as data.
 *
 * So a track is a small recipe -- a key, a tempo, a waveform, a chord progression and a pattern -- and the sound is
 * built from it. That also makes the music TUNABLE in the same way everything else here is: swapping a level's mood is
 * editing four numbers in `config/mechanics.json5`, not finding another track.
 *
 * ---------------------------------------------------------------------------------------------
 * HOW IT PLAYS
 * ---------------------------------------------------------------------------------------------
 * `update(dt)` walks a step clock and schedules the notes that fall in the time it was given, so the music follows the
 * game's own frame loop rather than a `setInterval` that would drift against it and keep playing while the tab is
 * hidden. Two voices per track:
 *
 *   a PAD       two detuned oscillators on the chord's root and fifth, held for the whole bar, quiet
 *   an ARP      the chord's notes, one per step, with a short envelope -- this is what makes a level's mood audible
 *
 * Everything is created on the game's existing AudioContext, so the settings panel's volume slider applies to it with no
 * second volume control, and the browser's "no audio before a gesture" rule is already handled in one place.
 */

/** One level's music, as authored in the config. */
export interface MusicTrack {
  /** Base frequency of the track's key, in Hz. */
  rootHz: number;
  /** Steps per minute. Slower is calmer; the arpeggio's speed is what the player actually hears. */
  stepPerMinute: number;
  /** Steps between chord changes. */
  stepsPerChord: number;
  /** Semitone offsets from the root, per chord. */
  chords: number[][];
  /** Which chord note the arpeggio plays on each step, cycled. */
  pattern: number[];
  /** Oscillator type for the arpeggio, and for the pad. */
  wave: OscillatorType;
  padWave: OscillatorType;
  /** Levels, 0..1: how loud the arpeggio and the pad are within the music's own bus. */
  arpGain: number;
  padGain: number;
  /** Note length in seconds, and the pad's fade in/out. */
  noteSeconds: number;
  /** Low-pass cutoff in Hz, which is most of the difference between "underwater" and "bright". */
  cutoffHz: number;
  /** How far the pad's two oscillators are detuned from each other, in cents. */
  detuneCents: number;
}

export class Music {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
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
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 900;
    // A pad and an arpeggio are steady tones, so a gentle shelf on the very top keeps them from sounding like a test
    // signal on phone speakers while leaving the mid-range (where the arp lives) alone.
    this.filter.connect(this.bus);
    this.bus.connect(destination);
  }

  /** Start a level's music, or stop everything with `null`. Switching tracks restarts the step clock. */
  setTrack(track: MusicTrack | null): void {
    if (track === this.track) return;
    this.track = track;
    this.stepClock = 0;
    this.stepIndex = 0;
    this.playing = track !== null && this.ctx !== null;
    if (this.filter && this.ctx) this.filter.frequency.setTargetAtTime(track?.cutoffHz ?? 900, this.ctx.currentTime, 0.4);
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
    if (!ctx || !this.filter || notes.length === 0) return 0;
    const root = this.track?.rootHz ?? 110;
    notes.forEach((semitone, i) => {
      this.blipAt(root * Math.pow(2, semitone / 12), gapSeconds * 1.8, 0.2, 'triangle', 0, ctx.currentTime + i * gapSeconds);
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

  /** The track's id-free description, for probes: how many steps a minute it is meant to run at. */
  get debugTrack(): { rootHz: number; stepPerMinute: number; chords: number } | null {
    return this.track ? { rootHz: this.track.rootHz, stepPerMinute: this.track.stepPerMinute, chords: this.track.chords.length } : null;
  }

  /**
   * Advance the music by one frame.
   *
   * Steps are scheduled HERE rather than ahead of time by a look-ahead scheduler, because this game already has a frame
   * loop that runs while it is visible and stops when the tab is hidden -- which is exactly the behaviour wanted from
   * music in a browser game, and free.
   */
  update(dt: number): void {
    if (!this.playing || !this.track || !this.ctx || !this.filter) return;
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

  /** One step: a chord note from the arpeggio, plus the pad when a chord starts. */
  private playStep(index: number, stepSeconds: number): void {
    const track = this.track;
    const ctx = this.ctx;
    if (!track || !ctx || !this.filter) return;
    const chord = track.chords[Math.floor(index / Math.max(1, track.stepsPerChord)) % track.chords.length];
    if (!chord || !chord.length) return;
    const note = chord[track.pattern[index % track.pattern.length] % chord.length] ?? chord[0]!;
    this.blip(this.frequency(track.rootHz, note), stepSeconds, track.arpGain, track.wave, 0);
    // The pad retriggers only on a chord change, so it holds underneath the arpeggio instead of pulsing with it.
    if (index % Math.max(1, track.stepsPerChord) === 0) {
      const barSeconds = stepSeconds * track.stepsPerChord;
      this.blip(this.frequency(track.rootHz, chord[0]!), barSeconds, track.padGain, track.padWave, track.detuneCents);
      const fifth = chord[Math.min(2, chord.length - 1)] ?? chord[0]!;
      this.blip(this.frequency(track.rootHz, fifth), barSeconds, track.padGain * 0.7, track.padWave, -track.detuneCents);
    }
  }

  /** Semitones to Hz, relative to the track's root. */
  private frequency(rootHz: number, semitones: number): number {
    return rootHz * Math.pow(2, semitones / 12);
  }

  /**
   * One note: an oscillator with a short attack and a decay to (almost) nothing.
   *
   * The envelope is the whole reason this sounds like an instrument rather than like a tone generator, and it is why a
   * note's length is a config value: a pad that ended abruptly would click.
   */
  private blip(hz: number, seconds: number, gain: number, wave: OscillatorType, detune: number): void {
    this.blipAt(hz, seconds, gain, wave, detune, this.ctx?.currentTime ?? 0);
  }

  /** The same note, at a chosen time, so a flourish can be scheduled as a phrase rather than fired all at once. */
  private blipAt(hz: number, seconds: number, gain: number, wave: OscillatorType, detune: number, at: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.filter || gain <= 0.0001) return;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.value = hz;
    osc.detune.value = detune;
    const env = ctx.createGain();
    const now = Math.max(at, ctx.currentTime);
    const attack = Math.min(0.08, seconds * 0.2);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack + 0.05, seconds));
    osc.connect(env);
    env.connect(this.filter);
    osc.start(now);
    osc.stop(now + Math.max(attack + 0.1, seconds) + 0.02);
  }

  /** Glide the music bus to a level. Never a step: a hard gain change on a sustained pad is an audible click. */
  private fadeTo(value: number): void {
    if (!this.bus || !this.ctx) return;
    this.bus.gain.setTargetAtTime(value, this.ctx.currentTime, 0.35);
  }
}

