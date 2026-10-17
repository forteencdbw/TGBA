/**
 * Audio: the water's bed, the mix, and the door every cue goes through.
 *
 * The ambience is synthesised here (a filtered noise bed with a slow wobble). Every ONE-SHOT is a cue in `src/sfx.ts`: a
 * recipe in `audio.sfx.sounds` of the config, or a recording dropped into `src/assets/audio/sfx/` under the same name.
 * The two sliders map to two buses below the mute: effects (the bed and every cue) and music (the level synths and the
 * menu track).
 *
 *   destination <- master (mute) <- sfxBus (effects slider) <- ambience bed, and the four cue buses (ui/combat/player/env)
 *                                 <- musicBus (music slider) <- level music, menu track
 *
 * The ambience is parameterised by depth, which is the original brief: it was meant as free progress feedback. Every
 * parameter below is a filter cutoff or a rate.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PROGRESS FEEDBACK IS THE POINT
 * ---------------------------------------------------------------------------------------------
 * Two parameters are driven by DEPTH, and together they are the readout:
 *
 *   - the low-pass cutoff opens (muffled -> bright), which is what "getting closer to the surface"
 *     sounds like underwater
 *   - the bubble density rises, so the water is busier near the light
 *
 * A player with the screen covered could still tell roughly how deep they were.
 *
 * ---------------------------------------------------------------------------------------------
 * BROWSERS BLOCK AUDIO UNTIL A GESTURE
 * ---------------------------------------------------------------------------------------------
 * `AudioContext` starts suspended and only a real user gesture may resume it. So nothing is created
 * until the first input, and `unlock()` is called from the input path. Creating the context eagerly
 * and hoping is the usual way this ends up silently muted on a phone.
 */

import { mech } from './mechanisms';
import { SfxEngine } from './sfx';
import type { SoundId } from './soundIds';

/** Every cue the game can ask for. The names, and which group each belongs to, are in `src/soundIds.ts`. */
export type SoundEvent = SoundId;

export class GameAudio {
  private ctx: AudioContext | null = null;
  /** Mute only: 1 when sound is on, 0 when muted. Everything passes through it. */
  private master: GainNode | null = null;
  /** The effects slider: the ambience bed and every one-shot hang off this. */
  private sfxBus: GainNode | null = null;
  /** The music slider: the level music and the menu track hang off this. */
  private musicBus_: GainNode | null = null;
  private readonly sfx = new SfxEngine();
  private ambientGain: GainNode | null = null;
  /**
   * The background music's own level, separate from the player's master volume.
   *
   * See `build()` for why it is a node rather than a multiplier on the master.
   */
  private musicGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  /** Noise source feeding the ambient bed, plus its own gain so the bed can be modulated. */
  private noise: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  /** Slow turbulence, so the bed is not a dead hiss. */
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  /** Master switch. Muted by default until a gesture happens. */
  private enabled = true;
  private started = false;
  /**
   * The player's volume, 0..1, set by the settings slider.
   *
   * SEPARATE from `enabled`. Muting is the M key and is a hard silence; this is how loud the game is, and the
   * two must not overwrite each other -- turning the volume to zero and pressing M twice should not leave the
   * game at a volume the player did not choose.
   */
  private volume = 0.8;
  /** The music slider, 0..1. Separate from `volume`, which is the effects'. */
  private musicSlider = 0.8;
  private now = 0;

  /**
   * The values last REQUESTED, as opposed to the values the audio thread is currently producing.
   *
   * Needed because every parameter here is moved with `setTargetAtTime`, which is a smooth ramp: a
   * probe reading `parameter.value` immediately after a change sees the OLD value, and the assertion
   * then fails against a correctly working graph. An earlier version of the audio check did exactly
   * that and reported that the ambience ignored depth while it was in fact ramping towards the right
   * target.
   */
  private requested = { cutoff: 260, ambient: 0, noise: 0.5, master: 1 };
  /** The last few `setDepth` calls, for probes. See `setDepth`. */
  readonly depthTrace: { depth: number; audible: boolean }[] = [];

  /**
   * How many times the game has asked for silence while near the surface.
   *
   * A counter rather than a read of `depthTrace`, because the trace is a small RING BUFFER: by the time a
   * probe looked, the entry it wanted had often been pushed out, and the suite then failed on a working fix.
   * This records the fact itself, so the assertion cannot be evicted.
   */
  silencedAtSurfaceCount = 0;

  /** Test hooks: what the bed was last told to be, so a probe can check it does not move with depth. */
  get requestedAmbientRef(): number {
    return this.requested.ambient;
  }

  get requestedNoiseRef(): number {
    return this.requested.noise;
  }

  get isRunning(): boolean {
    return this.started && this.ctx?.state === 'running';
  }

  get muted(): boolean {
    return !this.enabled;
  }

  /**
   * Resume the context. MUST be called from a real input gesture.
   *
   * Cheap to call repeatedly and does nothing after the first success: every pointerdown routes
   * through here, and asking the browser to resume an already-running context on every tap is pure
   * overhead.
   *
   * Returns whether audio is actually available, so the HUD can say so rather than lying with a mute
   * icon over silence.
   */
  unlock(): boolean {
    if (!this.enabled) return false;
    if (this.started && this.ctx?.state === 'running') return true;
    try {
      if (!this.ctx) this.build();
      // `resume()` is async, so the very first gesture leaves the context "suspended" for a moment.
      // Reporting that as failure would make the toggle look broken on the first tap.
      void this.ctx?.resume();
      this.started = true;
      return true;
    } catch {
      // A browser that refuses WebAudio entirely must not break the game.
      this.enabled = false;
      return false;
    }
  }

  setMuted(muted: boolean): void {
    this.enabled = !muted;
    this.applyMaster();
    if (!muted) this.unlock();
  }

  /**
   * Silence the continuous ambience without touching the master gain or the player's volume.
   *
   * Needed because the ambience is driven from the game's per-frame step, and THE STEP DOES NOT RUN in every
   * phase: on the menu it returns immediately, so nothing was left to tell the bed to stop and it kept playing
   * over the main menu at whatever level it last had.
   *
   * Distinct from muting. One-shots still work and the volume is untouched: this means "there is no water
   * here", not "be quiet".
   */
  silenceAmbience(): void {
    if (!this.ctx || !this.ambientGain || !this.noiseGain) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.setTargetAtTime(0, now, 0.25);
    this.noiseGain.gain.setTargetAtTime(0, now, 0.25);
    this.requested.ambient = 0;
    this.requested.noise = 0;
  }

  /**
   * The player's volume, 0..1.
   *
   * Applied through the master gain, so ONE number scales the ambience and every one-shot together -- which
   * is what the slider is for. Setting it also unlocks audio, because the slider is a gesture: without that a
   * player who turned the volume up before pressing anything would hear nothing and conclude it was broken.
   */
  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    this.applyMaster();
    if (this.volume > 0) this.unlock();
  }

  getVolume(): number {
    return this.volume;
  }

  /** The music slider, 0..1: how loud the level music and the menu track are. */
  setMusicSlider(volume: number): void {
    this.musicSlider = Math.min(1, Math.max(0, volume));
    this.applyMaster();
    if (this.musicSlider > 0) this.unlock();
  }

  getMusicSlider(): number {
    return this.musicSlider;
  }

  /**
   * The game's audio context and master bus, for the music to hang off.
   *
   * Handed out rather than re-created so there is ONE context, ONE place that knows about the browser's gesture rule,
   * and ONE volume control: the settings slider already moves this master, so the music follows it for free.
   * `null` until the first gesture, which is the signal to the music that it may not make a sound yet.
   */
musicBus(): { ctx: AudioContext; destination: AudioNode } | null {
    if (!this.ctx || !this.musicBus_) return null;
    return { ctx: this.ctx, destination: this.musicBus_ };
  }

  /**
   * Push the effective levels: mute on the master, and one number per slider on its own bus.
   *
   * The single place the three are combined. Computing it at each call site is how "muted" and "quiet" end up
   * fighting, each restoring a gain the other had just set.
   */
  private applyMaster(): void {
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.enabled ? 1 : 0, now, 0.05);
      this.sfxBus?.gain.setTargetAtTime(this.volume, now, 0.05);
      this.musicBus_?.gain.setTargetAtTime(this.musicSlider, now, 0.05);
    }
    this.requested.master = this.enabled ? this.volume : 0;
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /** Build the graph: a filtered noise bed with a slow amplitude wobble. */
  private build(): void {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error('no AudioContext');
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    // The player's volume, not 1: a graph built after the slider was moved must start at the right level,
    // which is what happens on the FIRST gesture if the settings panel was opened before any input.
    this.master.gain.value = this.enabled ? 1 : 0;
    this.requested.master = this.enabled ? this.volume : 0;
    this.master.connect(ctx.destination);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.volume;
    this.sfxBus.connect(this.master);
    this.musicBus_ = ctx.createGain();
    this.musicBus_.gain.value = this.musicSlider;
    this.musicBus_.connect(this.master);
    this.sfx.attach(ctx, this.sfxBus);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    // Starts muffled; `setDepth` opens it as the bubble rises.
    this.filter.frequency.value = 260;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.sfxBus);

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 0.0; // faded in by `setDepth`

    /**
     * The background music's own level, on a node of its own.
     *
     * Between the ambience and the filter rather than folded into the master gain, for two reasons. The master
     * carries the PLAYER's volume, so scaling it would drag the one-shots down with the music -- they are effects,
     * and nobody asked for them to be quieter. And a slider reading 100% should mean "as loud as this game goes",
     * so the relative level of the bed against the effects belongs in the config rather than baked into the
     * player's setting.
     *
     * Only the bed passes through here. `play()` connects one-shots straight to the master, so this node cannot
     * affect them.
     */
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = mech.audio.musicVolume;
    this.musicGain.connect(this.filter);
    this.ambientGain.connect(this.musicGain);

    // Two seconds of white noise, looped. Long enough that the loop point is not audible.
    const frames = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < frames; i++) {
      // A gentle low-pass over the noise itself: pure white noise reads as static, not water.
      last = last * 0.94 + (Math.random() * 2 - 1) * 0.06;
      data[i] = last * 3.2;
    }
    this.noise = ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.5;
    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.ambientGain);
    this.noise.start();

    // Slow turbulence so the bed breathes.
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.08;
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 0.22;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.noiseGain.gain);
    this.lfo.start();
  }

  /**
   * The background music's level relative to the one-shot effects.
   *
   * A multiplier on the bed's own gain node, so the player's volume slider still spans the full range and 100%
   * still means "as loud as this game goes". Changing this number changes the MUSIC, not the effects and not the
   * player's setting.
   */
  getMusicVolume(): number {
    return mech.audio.musicVolume;
  }

  /** Set the background music's level, live. */
  setMusicVolume(value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    mech.audio.musicVolume = clamped;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Point the ambience at a depth. THE progress readout -- see the module comment.
   *
   * @param depth metres from the surface
   * @param totalDepth the level's length, so this works for any level rather than only 1500m
   * @param audible whether the ambience should be heard AT ALL right now
   *
   * `audible` exists because depth alone cannot express this, and inferring it was a bug: once the
   * bubble reaches the surface its depth is pinned at 0, so the ambience sat at its loudest and
   * brightest -- and kept playing through the whole results sequence. Depth says WHERE the player is;
   * it does not say whether the run is still happening.
   */
  /**
   * The ambient bed at a FIXED level.
   *
   * The bed used to be driven by depth (`setDepth` below): it got louder and brighter as the run climbed, which sounded
   * like the game turning itself up rather than like the sea. The owner's call is to keep the texture but hold it
   * still -- so this sets the same two gains and the same filter to constant values, and `ambientVolume` in the config
   * is the one dial. `setDepth` is left in place, unused: it is the experiment that was rejected, and deleting it would
   * make bringing it back a rewrite rather than a call.
   */
  setAmbient(volume: number): void {
    if (!this.ctx || !this.filter || !this.ambientGain || !this.noiseGain) return;
    const level = Math.min(1, Math.max(0, volume));
    const now = this.ctx.currentTime;
    // The filter opens with the level too, so turning the bed up makes it fuller rather than just louder.
    this.filter.frequency.setTargetAtTime(300 + level * 1400, now, 0.4);
    this.ambientGain.gain.setTargetAtTime(level * 0.62, now, 0.5);
    this.noiseGain.gain.setTargetAtTime(level * 0.9, now, 0.5);
    this.requested.ambient = level * 0.62;
    this.requested.noise = level * 0.9;
  }

  setDepth(depth: number, totalDepth: number, audible = true): void {
    // Trace the last few calls, so a probe can see what the GAME actually passed rather than inferring
    // it from the resulting gains -- which was ambiguous when two call sites disagreed.
    this.depthTrace.push({ depth: +depth.toFixed(1), audible });
    if (this.depthTrace.length > 24) this.depthTrace.shift();
    if (!audible && depth < 2) this.silencedAtSurfaceCount++;
    if (!this.ctx || !this.filter || !this.ambientGain || !this.noiseGain) return;
    const t = Math.min(1, Math.max(0, 1 - depth / Math.max(1, totalDepth))); // 0 seabed, 1 surface
    const now = this.ctx.currentTime;
    // Cutoff sweeps roughly three octaves: 220Hz muffled down deep to 2600Hz bright at the surface.
    const cutoff = 220 + t * t * 2400;
    // Silence, not just quiet: the ending is a held beat, and a bed still running under it reads as
    // the game having forgotten to stop rather than as atmosphere.
    const ambient = audible ? 0.16 + t * 0.5 : 0;
    const noise = audible ? 0.42 + t * 0.5 : 0;
    this.filter.frequency.setTargetAtTime(cutoff, now, 0.4);
    this.ambientGain.gain.setTargetAtTime(ambient, now, 0.5);
    // Busier water near the light.
    this.noiseGain.gain.setTargetAtTime(noise, now, 0.5);
    this.requested.cutoff = cutoff;
    this.requested.ambient = ambient;
    this.requested.noise = noise;
  }

  /**
   * Play a one-shot.
   *
   * @param intensity 0..1, scales level and brightness. Used for things like how big a bubble was.
   * @param pan -1..1, where in the lane it happened (0 for something that is not in the water: a button, a callout).
   * @param scale the world's timescale, so a cue in the water can slow with it. 1 is normal speed. **Ignored by the
   *   `ui` bus**, which is the player's own feedback about a control rather than a thing happening in the water -- see
   *   `SfxEngine.play`.
   */
  play(event: SoundEvent, intensity = 0.5, pan = 0, scale = 1): void {
    if (!this.ctx || !this.sfxBus || !this.enabled) return;
    this.sfx.play(event, intensity, pan, scale);
  }

  /** Test hook: what the one-shot engine has been asked to play. See `SfxEngine.probe`. */
  sfxProbe(): ReturnType<SfxEngine['probe']> {
    return this.sfx.probe();
  }

  /** Advance the internal clock used for throttling. Called once per frame by the game. */
  tick(dt: number): void {
    this.now += dt;
  }

  /**
   * Current filter and gain values, for probes.
   *
   * Audio is the one subsystem a screenshot cannot check, and the design's brief for it is that the
   * ambience tracks depth -- so "did it react to depth" has to be readable from outside.
   */
  debugLevels(): { cutoff: number; ambient: number; noise: number; master: number; music: number } {
    // The REQUESTED values, not `parameter.value`: see `requested`.
    // `music` is the bed's own level, which is NOT part of the master and so has to be reported separately --
    // a test checking "the music got quieter" cannot see it in the master at all.
    return { ...this.requested, music: mech.audio.musicVolume };
  }
}

/** A single shared instance: audio is global state, and two contexts would fight over the device. */
export const audio = new GameAudio();





