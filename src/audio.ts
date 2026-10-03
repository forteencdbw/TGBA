/**
 * Audio (D6). Fully synthesised, no assets.
 *
 * The design asks for "ambient only, no BGM, and the deeper it is the quieter and the brighter it gets
 * near the surface -- the ambience itself is free progress feedback". Synthesising rather than
 * shipping a CC0 pack is not a shortcut here: the whole visual layer is procedural geometry with no
 * art assets, and a sampled water loop would be the one thing in the game that could not be re-tuned
 * by changing a number. Every parameter below is a filter cutoff or a rate.
 *
 * "No BGM" means no composed music track: the bed IS the soundtrack, and `audio.musicVolume` in the config
 * sets its level against the one-shot effects.
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
 * A player with the screen covered could still tell roughly how deep they were. That is the whole
 * brief for this module, and it is why there is no music: a loop would fight it.
 *
 * ---------------------------------------------------------------------------------------------
 * BROWSERS BLOCK AUDIO UNTIL A GESTURE
 * ---------------------------------------------------------------------------------------------
 * `AudioContext` starts suspended and only a real user gesture may resume it. So nothing is created
 * until the first input, and `unlock()` is called from the input path. Creating the context eagerly
 * and hoping is the usual way this ends up silently muted on a phone.
 */

/** Events worth a sound. Kept small: a game this busy needs few, distinct cues, not many. */
import { mech } from './mechanisms';

export type SoundEvent =
  | 'absorb'
  | 'hit'
  | 'pop'
  | 'surface'
  | 'skill'
  | 'slow'
  | 'crab'
  | 'fart'
  /**
   * A small-bubble round landing on a creature.
   *
   * Its own cue rather than a quiet `hit`, because it says something different: `hit` is "that was done to ME"
   * and this is "I am doing that to IT". The gun fires several times a second, so this is the shortest and
   * highest sound in the game -- it has to register without ever crowding the mix.
   */
  | 'bulletHit'
  /**
   * A small-bubble round LEAVING the bubble.
   *
   * The other half of the gun's voice, and quieter than the hit on purpose: the shot is the rhythm and the hit is
   * the information. Its pitch wanders a little per shot, because a cue that repeats four times a second at exactly
   * the same frequency stops being a sound and becomes a metronome.
   */
  | 'bulletFire';

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
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
  /** Throttle, so a swarm of pickups cannot stack into a buzz. */
  private lastPlayed = new Map<SoundEvent, number>();
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

  /**
   * Push the effective master gain: zero when muted, the player's volume otherwise.
   *
   * The single place the two are combined. Computing it at each call site is how "muted" and "quiet" end up
   * fighting, each restoring a gain the other had just set.
   */
  private applyMaster(): void {
    const target = this.enabled ? this.volume : 0;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    this.requested.master = target;
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
    this.master.gain.value = this.enabled ? this.volume : 0;
    this.requested.master = this.master.gain.value;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    // Starts muffled; `setDepth` opens it as the bubble rises.
    this.filter.frequency.value = 260;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.master);

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
   */
  play(event: SoundEvent, intensity = 0.5): void {
    if (!this.ctx || !this.master || !this.enabled) return;
    /**
     * Throttle identical cues: a swarm of fish can trigger many hits in one frame, and stacking them
     * clips into a click.
     *
     * `bulletHit` is throttled hardest of all, and that is not a detail: several rounds can land in the same
     * frame on a swarm, and a gun that fired four cues at once would be a click, not a sound. `bulletFire` is
     * allowed to repeat faster than the rest because it IS a rhythm -- but not without a floor, or a very high
     * `bullets.rateTiers` at its top tier would stack into a buzz.
     */
    const minGap = event === 'absorb' ? 0.045 : event === 'bulletHit' ? 0.05 : event === 'bulletFire' ? 0.04 : 0.09;
    const previous = this.lastPlayed.get(event) ?? -1;
    if (this.now - previous < minGap) return;
    this.lastPlayed.set(event, this.now);

    const ctx = this.ctx;
    const t = ctx.currentTime;
    const level = Math.min(1, Math.max(0, intensity));

    switch (event) {
      case 'absorb':
        // A rising blip: pitch rises with the bubble's size, so a big one announces itself.
        this.tone(420 + level * 520, 0.09, 0.16 + level * 0.1, 'sine', t, 1.9);
        break;
      case 'hit':
        // A dull low thud with a touch of noise. Not a "damage" sting -- the comedy tone forbids it.
        this.tone(150, 0.18, 0.3, 'triangle', t, 0.55);
        this.burst(0.09, 700, 0.22, t);
        break;
      case 'pop':
        // The death pop: a sharp noise crack plus a fast downward tone.
        this.burst(0.22, 2600, 0.5, t);
        this.tone(660, 0.26, 0.34, 'sine', t, 0.35);
        break;
      case 'surface':
        // Brighter and longer than the death pop: this one is a reward.
        this.burst(0.5, 4200, 0.42, t);
        this.tone(720, 0.5, 0.3, 'sine', t, 2.4);
        break;
      case 'skill':
        this.tone(520, 0.22, 0.24, 'square', t, 2.6);
        this.tone(780, 0.18, 0.16, 'sine', t, 2.2);
        break;
      case 'slow':
        // A downward slur, matching "something got hold of you".
        this.tone(300, 0.4, 0.26, 'sawtooth', t, 0.4);
        break;
      case 'crab':
        // The launch is the one hazard that can HELP, so it gets an upward flick rather than a thud.
        this.tone(240, 0.3, 0.3, 'triangle', t, 3.4);
        break;
      case 'fart':
        // Deliberately silly: a low buzz with a wobble. The talent is a joke and should sound like one.
        this.tone(90, 0.34, 0.34, 'sawtooth', t, 0.62);
        this.tone(120, 0.3, 0.2, 'square', t, 0.5);
        break;
      case 'bulletHit':
        /**
         * A dry, high tick: a bead of water cracking against something.
         *
         * Two parts, both of them tiny -- a short square pip that rises slightly, and a 30ms band-passed noise
         * click for the "crack". The rise is what keeps it from sounding like a metronome at four rounds a second:
         * each hit chirps UP, which reads as impact rather than as a repeating beep.
         *
         * `level` is the caller's, and the caller gets it from `audio.bulletHitVolume` in the config, because how
         * loud this one is matters more than for any other cue: it is the only sound in the game that plays several
         * times a second, so it is also the only one that can ruin the mix single-handed.
         */
        this.tone(1050, 0.045, 0.09 + level * 0.07, 'square', t, 1.5);
        this.burst(0.028, 3200, 0.05 + level * 0.06, t);
        break;
      case 'bulletFire':
        /**
         * A soft downward chirp with a puff of air behind it: a bubble being pushed out, not a gunshot.
         *
         * FALLING where the hit RISES, so the two halves of the gun are told apart by direction alone -- the shot
         * leaves and drops away, the impact snaps upward. It is deliberately the quieter of the two: this one is
         * the rhythm, and the hit is the information.
         *
         * The frequency wanders a few percent per shot. A cue that repeats four times a second at exactly one pitch
         * stops being a sound and becomes a metronome, which is the one thing a fire sound must not be.
         */
        const detune = 0.96 + Math.random() * 0.08;
        this.tone(430 * detune, 0.055, 0.06 + level * 0.05, 'triangle', t, 0.55);
        this.burst(0.022, 1300 * detune, 0.03 + level * 0.04, t);
        break;
    }
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

  /** A short tone with an exponential frequency sweep and a percussive envelope. */
  private tone(freq: number, seconds: number, gain: number, type: OscillatorType, at: number, endRatio: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * endRatio), at + seconds);

    const g = ctx.createGain();
    // Fast attack, exponential decay. `linearRampToValueAtTime(0)` would click, so the tail uses a
    // small floor.
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

    osc.connect(g);
    g.connect(this.master);
    osc.start(at);
    osc.stop(at + seconds + 0.02);
  }

  /** A filtered noise burst, for anything percussive. */
  private burst(seconds: number, cutoff: number, gain: number, at: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      // Decaying white noise, so the buffer itself carries the envelope.
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(at);
  }
}

/** A single shared instance: audio is global state, and two contexts would fight over the device. */
export const audio = new GameAudio();


