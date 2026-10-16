/**
 * The sound-effect engine: a recipe per cue, or a recording that has taken its place.
 *
 * ---------------------------------------------------------------------------------------------
 * A CUE IS DATA
 * ---------------------------------------------------------------------------------------------
 * Every cue is a row in `audio.sfx.sounds` (config/mechanics.json5): a few layers of tone and filtered noise, and the
 * numbers that shape them. Nothing here knows what any cue is FOR -- that is the callers' business (`src/soundIds.ts`
 * lists the names). So replacing a placeholder is a config edit, and replacing it with a real recording is a file drop:
 * `src/assets/audio/sfx/<name>.wav` (or `.mp3`) wins over the recipe of the same name, with no code and no config change.
 *
 * The files are fetched and decoded after the first gesture (the context does not exist before it), and a cue whose
 * file has not finished decoding plays its recipe -- so a slow connection costs a few cues their recording, never their
 * sound.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE A CUE COMES FROM
 * ---------------------------------------------------------------------------------------------
 * `pan` is -1..1 and comes from where the thing happened in the lane, so a shark on the left is in the left ear. The width
 * of that (`panWidth`) is a config number: a full-width pan on a phone's single speaker is nothing, and on headphones is
 * a lot.
 *
 * `scale` is the world's timescale, and it is what makes a slow motion believable: a cue fired while the world is at a
 * third speed is played a third as high AND a third as long, which together are what a slowed tape does. **The `ui` bus is
 * exempt**, and that is not a detail: a button, a card, and the pick's own warning are the player's feedback about a
 * CONTROL rather than a thing happening in the water, so dragging them down with the water would make the panel itself
 * feel like it had stalled. The exemption lives here rather than at the call sites, so "does this cue slow down" has one
 * answer and it is the cue's own bus.
 */
import { mech } from './mechanisms';
import { SOUND_BUSES, type SoundBus, type SoundId } from './soundIds';

export interface ToneLayer {
  type: 'tone';
  wave?: OscillatorType;
  hz: number;
  /** Frequency at the end, as a multiple of `hz`. Default 1 (no sweep). */
  endRatio?: number;
  seconds: number;
  gain: number;
  /** Seconds before this layer starts, for a cue made of several beats. */
  delay?: number;
  /** Seconds to reach full level. Default 0.008; longer for a swell. */
  attack?: number;
  /** A wobble on the pitch: its rate in Hz and its depth as a fraction of `hz`. */
  vibratoHz?: number;
  vibratoDepth?: number;
}

export interface NoiseLayer {
  type: 'noise';
  filter?: 'bandpass' | 'lowpass' | 'highpass';
  hz: number;
  /** Filter centre/cutoff at the end, as a multiple of `hz`. Default 1. */
  endRatio?: number;
  q?: number;
  seconds: number;
  gain: number;
  delay?: number;
  attack?: number;
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
  private noise: AudioBuffer | null = null;
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
    const frames = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    for (const [id, url] of FILE_URL) {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((bytes) => ctx.decodeAudioData(bytes))
        .then((buffer) => this.buffers.set(id, buffer))
        .catch(() => undefined);
    }
  }

  /**
   * Play one cue.
   *
   * `intensity` is 0..1, `pan` is -1..1 (0 for a sound that is not somewhere in the water), and `scale` is the world's
   * timescale -- see the note on it at the top of this file.
   */
  play(id: SoundId, intensity: number, pan: number, scale = 1): void {
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
    const level = Math.min(1, Math.max(0, intensity));
    const loud = (recipe.gain ?? 1) * (1 + level * (recipe.gainPerIntensity ?? 0));
    const jitter = 1 + (Math.random() * 2 - 1) * (recipe.pitchJitter ?? 0);
    // The tape factor: the pitch is multiplied by it and every duration divided by it. 1 for a `ui` cue and for a world
    // at full speed, so the ordinary path is unchanged. Bounded below so a pathological value cannot ask for silence.
    const tape = recipe.bus === 'ui' ? 1 : Math.max(0.05, Math.min(1, scale));
    const pitch = jitter * (1 + level * (recipe.pitchPerIntensity ?? 0)) * tape;

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
      g.gain.value = (recipe.fileGain ?? 1) * (1 + level * (recipe.gainPerIntensity ?? 0));
      src.connect(g);
      g.connect(out);
      src.start(now);
      this.ends.push(now + file.duration);
      return;
    }

    /**
     * Every duration is divided by the tape factor, so a slowed cue is stretched rather than merely re-pitched.
     *
     * The layer is copied rather than the two voice functions taught about a timescale: they already take a start time,
     * a length and an attack, so a layer that is longer and starts later IS a slowed one, and neither of them has to know
     * that time can run at different speeds.
     */
    for (const source of recipe.layers) {
      const layer =
        tape === 1
          ? source
          : {
              ...source,
              seconds: source.seconds / tape,
              delay: (source.delay ?? 0) / tape,
              attack: (source.attack ?? 0) / tape,
            };
      const at = now + (layer.delay ?? 0);
      this.ends.push(at + layer.seconds);
      if (layer.type === 'tone') this.tone(layer, at, loud, pitch, out);
      else this.burst(layer, at, loud, pitch, out);
    }
  }

  /**
   * Test hook: what the engine has been asked to play.
   *
   * Sound is the one thing a screenshot cannot show, and this is the version of "did it work" that can be READ: a cue that
   * was played is a count and a name, and a cue that was dropped by the throttle or the voice cap is visible as a count
   * that did not move.
   */
  probe(): { attached: boolean; plays: number; last: SoundId | null; lastPan: number; voices: number } {
    const now = this.ctx?.currentTime ?? 0;
    return { attached: !!this.ctx, plays: this.plays, last: this.lastId, lastPan: this.lastPan, voices: this.ends.filter((t) => t > now).length };
  }

  private tone(l: ToneLayer, at: number, loud: number, pitch: number, out: AudioNode): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = l.wave ?? 'sine';
    const hz = l.hz * pitch;
    osc.frequency.setValueAtTime(hz, at);
    if (l.endRatio !== undefined && l.endRatio !== 1) osc.frequency.exponentialRampToValueAtTime(Math.max(30, hz * l.endRatio), at + l.seconds);
    if (l.vibratoHz && l.vibratoDepth) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = l.vibratoHz;
      const depth = ctx.createGain();
      depth.gain.value = hz * l.vibratoDepth;
      lfo.connect(depth);
      depth.connect(osc.frequency);
      lfo.start(at);
      lfo.stop(at + l.seconds + 0.02);
    }
    const g = ctx.createGain();
    // Fast attack, exponential decay: a linear ramp to 0 would click, so the tail stops at a small floor.
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(l.gain * loud, at + Math.min(l.attack ?? 0.008, l.seconds * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, at + l.seconds);
    osc.connect(g);
    g.connect(out);
    osc.start(at);
    osc.stop(at + l.seconds + 0.02);
  }

  private burst(l: NoiseLayer, at: number, loud: number, pitch: number, out: AudioNode): void {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = l.filter ?? 'bandpass';
    const hz = l.hz * pitch;
    filter.frequency.setValueAtTime(hz, at);
    if (l.endRatio !== undefined && l.endRatio !== 1) filter.frequency.exponentialRampToValueAtTime(Math.max(30, hz * l.endRatio), at + l.seconds);
    filter.Q.value = l.q ?? 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(l.gain * loud, at + Math.min(l.attack ?? 0.004, l.seconds * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, at + l.seconds);
    src.connect(filter);
    filter.connect(g);
    g.connect(out);
    src.start(at, Math.random() * 0.5);
    src.stop(at + l.seconds + 0.02);
  }
}
