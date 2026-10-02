/**
 * Audio (D6). Fully synthesised, no assets.
 *
 * The design asks for "ambient only, no BGM, and the deeper it is the quieter and the brighter it gets
 * near the surface -- the ambience itself is free progress feedback". Synthesising rather than
 * shipping a CC0 pack is not a shortcut here: the whole visual layer is procedural geometry with no
 * art assets, and a sampled water loop would be the one thing in the game that could not be re-tuned
 * by changing a number. Every parameter below is a filter cutoff or a rate.
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
export type SoundEvent = 'absorb' | 'hit' | 'pop' | 'surface' | 'skill' | 'slow' | 'crab' | 'fart';

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
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
    this.requested.master = muted ? 0 : 1;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.requested.master, this.ctx.currentTime, 0.05);
    }
    if (!muted) this.unlock();
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
    this.master.gain.value = this.enabled ? 1 : 0;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    // Starts muffled; `setDepth` opens it as the bubble rises.
    this.filter.frequency.value = 260;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.master);

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 0.0; // faded in by `setDepth`
    this.ambientGain.connect(this.filter);

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
    // Throttle identical cues: a swarm of fish can trigger many hits in one frame, and stacking them
    // clips into a click.
    const minGap = event === 'absorb' ? 0.045 : 0.09;
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
  debugLevels(): { cutoff: number; ambient: number; noise: number; master: number } {
    // The REQUESTED values, not `parameter.value`: see `requested`.
    return { ...this.requested };
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
