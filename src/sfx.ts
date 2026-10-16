/**
 * The sound-effect engine: a recipe per cue, or a recording that has taken its place.
 *
 * ---------------------------------------------------------------------------------------------
 * A CUE IS DATA
 * ---------------------------------------------------------------------------------------------
 * Every cue is a row in `audio.sfx.sounds` (config/mechanics.json5): a few layers of pulse, triangle and LFSR noise, and
 * the numbers that shape them. Nothing here knows what any cue is FOR -- that is the callers' business
 * (`src/soundIds.ts` lists the names). So replacing a placeholder is a config edit, and replacing it with a real
 * recording is a file drop: `src/assets/audio/sfx/<name>.wav` (or `.mp3`) wins over the recipe of the same name, with no
 * code and no config change.
 *
 * The files are fetched and decoded after the first gesture (the context does not exist before it), and a cue whose file
 * has not finished decoding plays its recipe -- so a slow connection costs a few cues their recording, never their
 * sound.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PALETTE IS A CHIP'S, ON PURPOSE
 * ---------------------------------------------------------------------------------------------
 * Three voices and no more -- a pulse wave with a duty cycle, a triangle, and the noise register (`src/chip.ts`). That
 * is the whole instrument. A recipe that wanted a sine, a filter sweep or a vibrato has nowhere to put it, which is the
 * point: this is the sound of a particular kind of machine, and the constraint is what makes it sound like one.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE A CUE COMES FROM
 * ---------------------------------------------------------------------------------------------
 * `pan` is -1..1 and comes from where the thing happened in the lane, so a shark on the left is in the left ear. The
 * width of that (`panWidth`) is a config number: a full-width pan on a phone's single speaker is nothing, and on
 * headphones is a lot.
 */
import { applyEnvelope, envelopeEnd, lfsrNoise, pulseWave, type EnvelopeShape, type NoiseMode } from './chip';
import { mech } from './mechanisms';
import { SOUND_BUSES, type SoundBus, type SoundId } from './soundIds';

export interface ToneLayer {
  type: 'tone';
  /** `pulse` is the chip's square channel; `triangle` is its other tonal one. */
  wave: 'pulse' | 'triangle';
  /** Duty cycle of a pulse: 0.125, 0.25 or 0.5. Ignored by a triangle, which has no duty. */
  duty?: number;
  hz: number;
  /** Frequency at the end, as a multiple of `hz`. Default 1 (no sweep). */
  endRatio?: number;
  seconds: number;
  gain: number;
  /** Seconds before this layer starts, for a cue made of several beats. */
  delay?: number;
  /** Seconds to reach full level. Default 0: instantly on, which is what the chip did. */
  attack?: number;
  /** How it ends. Default `linear`. */
  shape?: EnvelopeShape;
}

export interface NoiseLayer {
  type: 'noise';
  /** `hiss` is the 15-bit register, `buzz` the short one that can be heard as a note. Default `hiss`. */
  mode?: NoiseMode;
  /** How fast the register is clocked. Low is a pitched buzz, high is a hiss. */
  rate: number;
  /** Clock rate at the end, as a multiple of `rate`. Default 1. */
  endRatio?: number;
  seconds: number;
  gain: number;
  delay?: number;
  attack?: number;
  shape?: EnvelopeShape;
}

export type SfxLayer = ToneLayer | NoiseLayer;

export interface SfxRecipe {
  /** What it is, in Chinese: shown in the audition list. */
  label: string;
  bus: SoundBus;
  /** Overall level of the recipe, 0..1. Default 1. */
  gain?: number;
  /** Level of a recording that replaces it, relative to the recording's own loudness. Default 1. */
  fileGain?: number;
  /** Minimum seconds between two plays of this cue. Default 0.09. */
  gap?: number;
  /** Random detune per play, as a fraction (0.04 = ±4%), so a repeated cue is not a metronome. */
  pitchJitter?: number;
  /** Pitch multiplier added per unit of intensity: hz × (1 + intensity × this). */
  pitchPerIntensity?: number;
  /** Level multiplier added per unit of intensity: gain × (1 + intensity × this). */
  gainPerIntensity?: number;
  layers: SfxLayer[];
}

export interface SfxConfig {
  /** How far to the side a cue at the edge of the lane is placed, 0..1. 0 puts everything in the middle. */
  panWidth: number;
  /** Cues that would start while this many are still sounding are dropped (UI cues are exempt). */
  maxVoices: number;
  buses: Record<SoundBus, number>;
  sounds: Record<SoundId, SfxRecipe>;
}

const FILES = import.meta.glob('./assets/audio/sfx/*.{wav,mp3}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const FILE_URL = new Map<string, string>(Object.entries(FILES).map(([path, url]) => [path.replace(/^.*\//, '').replace(/\.[^.]+$/, ''), url]));

export class SfxEngine {
  private ctx: AudioContext | null = null;
  private buses: Partial<Record<SoundBus, GainNode>> = {};
  private readonly last = new Map<string, number>();
  private readonly buffers = new Map<string, AudioBuffer>();
  /** When each sounding voice ends, in context time, so "how many are playing" needs no callbacks. */
  private ends: number[] = [];
  /** How many cues have been played since the page loaded, and which one was last (and from where), for the hook below. */
  private plays = 0;
  private lastId: SoundId | null = null;
  private lastPan = 0;

  /** Hang the four buses off `destination`, and start fetching any recordings. */
  attach(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;
    for (const bus of SOUND_BUSES) {
      const node = ctx.createGain();
      node.gain.value = mech.audio.sfx.buses[bus];
      node.connect(destination);
      this.buses[bus] = node;
    }
    for (const [id, url] of FILE_URL) {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((bytes) => ctx.decodeAudioData(bytes))
        .then((buffer) => this.buffers.set(id, buffer))
        .catch(() => undefined);
    }
  }

  /** Play one cue. `intensity` is 0..1, `pan` is -1..1 (0 for a sound that is not somewhere in the water). */
  play(id: SoundId, intensity: number, pan: number): void {
    const ctx = this.ctx;
    const recipe = mech.audio.sfx.sounds[id];
    if (!ctx || !recipe) return;
    const now = ctx.currentTime;
    if (now - (this.last.get(id) ?? -1) < (recipe.gap ?? 0.09)) return;
    this.ends = this.ends.filter((t) => t > now);
    if (recipe.bus !== 'ui' && this.ends.length >= mech.audio.sfx.maxVoices) return;
    this.last.set(id, now);
    this.plays++;
    this.lastId = id;
    this.lastPan = Math.max(-1, Math.min(1, pan * mech.audio.sfx.panWidth));

    const bus = this.buses[recipe.bus];
    if (!bus) return;
    let out: AudioNode = bus;
    if (pan !== 0 && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan * mech.audio.sfx.panWidth));
      panner.connect(bus);
      out = panner;
    }

    const file = this.buffers.get(id);
    if (file) {
      const src = ctx.createBufferSource();
      src.buffer = file;
      const g = ctx.createGain();
      g.gain.value = (recipe.fileGain ?? 1) * (1 + intensity * (recipe.gainPerIntensity ?? 0));
      src.connect(g);
      g.connect(out);
      src.start(now);
      this.ends.push(now + file.duration);
      return;
    }

    this.render(recipe, ctx, out, intensity, now);
  }

  /**
   * Voice one recipe into `destination`, starting at `at`.
   *
   * Its own function, and taking the context rather than using `this.ctx`, for one reason: the offline render below has
   * to make the SAME sound in a context that never touches the audio device. Two copies of this arithmetic is how a
   * measurement and the thing it measures come to disagree.
   */
  private render(recipe: SfxRecipe, ctx: BaseAudioContext, destination: AudioNode, intensity: number, at: number): void {
    const level = Math.min(1, Math.max(0, intensity));
    const loud = (recipe.gain ?? 1) * (1 + level * (recipe.gainPerIntensity ?? 0));
    const jitter = 1 + (Math.random() * 2 - 1) * (recipe.pitchJitter ?? 0);
    const pitch = jitter * (1 + level * (recipe.pitchPerIntensity ?? 0));

    for (const layer of recipe.layers) {
      const start = at + (layer.delay ?? 0);
      const shape = layer.shape ?? 'linear';
      const attack = layer.attack ?? 0;
      this.ends.push(envelopeEnd(shape, attack, layer.seconds, start));
      if (layer.type === 'tone') this.voiceTone(layer, ctx, destination, start, loud, pitch, shape, attack);
      else this.voiceNoise(layer, ctx, destination, start, loud, pitch, shape, attack);
    }
  }

  private voiceTone(
    l: ToneLayer,
    ctx: BaseAudioContext,
    destination: AudioNode,
    at: number,
    loud: number,
    pitch: number,
    shape: EnvelopeShape,
    attack: number,
  ): void {
    const osc = ctx.createOscillator();
    if (l.wave === 'pulse') osc.setPeriodicWave(pulseWave(ctx, l.duty ?? 0.5, l.hz * pitch));
    else osc.type = 'triangle';
    const hz = l.hz * pitch;
    osc.frequency.setValueAtTime(hz, at);
    if (l.endRatio !== undefined && l.endRatio !== 1) {
      // LINEAR, not exponential: a chip's pitch came from a clock divider, and a divider does not bend the way a
      // synthesiser's exponential sweep does. It is also why the sweeps in this table are short.
      osc.frequency.linearRampToValueAtTime(Math.max(20, hz * l.endRatio), at + l.seconds);
    }
    const g = ctx.createGain();
    applyEnvelope(g.gain, shape, attack, l.seconds, l.gain * loud, at);
    osc.connect(g);
    g.connect(destination);
    osc.start(at);
    osc.stop(envelopeEnd(shape, attack, l.seconds, at) + 0.01);
  }

  private voiceNoise(
    l: NoiseLayer,
    ctx: BaseAudioContext,
    destination: AudioNode,
    at: number,
    loud: number,
    pitch: number,
    shape: EnvelopeShape,
    attack: number,
  ): void {
    const src = ctx.createBufferSource();
    // Generated for this play rather than cached: at a low rate the register's period is longer than the cue, so there is
    // nothing to loop, and a buffer of a few thousand samples costs less than a cache keyed by (mode, rate, length).
    src.buffer = lfsrNoise(ctx, l.mode ?? 'hiss', l.rate, Math.max(0.01, l.seconds));
    // A rate sweep is a CLOCK sweep, which is a playback-rate sweep -- and that is how the hardware made a falling drum:
    // by rewiring the period register in the middle of the hit.
    if (l.endRatio !== undefined && l.endRatio !== 1) {
      src.playbackRate.setValueAtTime(pitch, at);
      src.playbackRate.linearRampToValueAtTime(Math.max(0.1, pitch * l.endRatio), at + l.seconds);
    } else {
      src.playbackRate.value = pitch;
    }
    const g = ctx.createGain();
    applyEnvelope(g.gain, shape, attack, l.seconds, l.gain * loud, at);
    src.connect(g);
    g.connect(destination);
    src.start(at);
    src.stop(envelopeEnd(shape, attack, l.seconds, at) + 0.01);
  }

  /**
   * Test hook: what the engine has been asked to play.
   *
   * Sound is the one thing a screenshot cannot show, and this is the version of "did it work" that can be READ: a cue
   * that was played is a count and a name, and a cue that was dropped by the throttle or the voice cap is visible as a
   * count that did not move.
   */
  probe(): { attached: boolean; plays: number; last: SoundId | null; lastPan: number; voices: number } {
    const now = this.ctx?.currentTime ?? 0;
    return { attached: !!this.ctx, plays: this.plays, last: this.lastId, lastPan: this.lastPan, voices: this.ends.filter((t) => t > now).length };
  }

  /**
   * Test hook: render one cue to samples, with no audio device involved.
   *
   * An `OfflineAudioContext` is silent by construction -- which is what makes measuring the timbre possible at all
   * without making a noise on the machine doing the measuring. The samples go back to
   * `scripts/probe-sfx-timbre.mjs`, which reads the duty, the envelope and the harmonics out of them, so that "the
   * palette really is a pulse wave" is a measurement rather than a claim about a config file.
   */
  async renderOffline(id: SoundId, seconds: number): Promise<Float32Array> {
    const recipe = mech.audio.sfx.sounds[id];
    if (!recipe) return new Float32Array(0);
    const rate = 44100;
    const ctx = new OfflineAudioContext(1, Math.ceil(seconds * rate), rate);
    const sink = ctx.createGain();
    sink.connect(ctx.destination);
    // Deterministic: `render` jitters the pitch per play, and a measurement that moves cannot be compared to the last one.
    const jitter = recipe.pitchJitter;
    recipe.pitchJitter = 0;
    try {
      this.render(recipe, ctx, sink, 0.5, 0.01);
    } finally {
      // `delete` rather than assigning back: the field is optional, and putting `undefined` into it is not the same shape
      // as never having had it.
      if (jitter === undefined) delete recipe.pitchJitter;
      else recipe.pitchJitter = jitter;
    }
    const rendered = await ctx.startRendering();
    return rendered.getChannelData(0);
  }
}
