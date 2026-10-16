/**
 * The chip's two voices: a pulse wave and an LFSR noise channel.
 *
 * Shared, because both the sound effects (`src/sfx.ts`) and the level music (`src/music.ts`) are built from exactly
 * these. Putting them here rather than in either one keeps "what a pulse wave is" a single piece of arithmetic.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A PULSE AND NOT `OscillatorType = 'square'`
 * ---------------------------------------------------------------------------------------------
 * WebAudio's built-in `square` is ONE duty cycle: 50%. A 50% square is the brightest and hollowest of the three the
 * hardware had, and using it for everything is most of what makes imitation chip audio sound wrong -- every cue ends up
 * the same shade of thin. A 25% pulse is the sound most people actually mean by "video game beep".
 *
 * A pulse of duty `d` is a Fourier series: harmonic `n` has amplitude `2/(n*pi) * sin(n*pi*d)`. Handing those
 * coefficients to `createPeriodicWave` gets a band-limited pulse, which is cleaner than the hardware's aliasing but
 * otherwise the same waveform -- and band-limited is the right call here, because the owner asked for the STYLE rather
 * than for the artefacts.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE NOISE IS AN LFSR AND NOT A RANDOM BUFFER
 * ---------------------------------------------------------------------------------------------
 * A chip's noise channel is a linear-feedback shift register clocked at a divided rate, and that matters because the
 * register REPEATS: clocked slowly the repeat is short enough to be heard as a note, which is how drum sounds were
 * tuned. White noise through a filter cannot do that -- it can only be more or less bright, never pitched -- and
 * "periodic and buzzy" versus "broadband and smooth" is a difference anybody can hear.
 *
 * Two modes, both from the hardware: a 15-bit register (period 32767, the broadband hiss) and the same register with
 * its feedback tapped at bit 6 (period 93, the pitched buzz used for drums).
 */

/**
 * The most harmonics a pulse is built from.
 *
 * A cap AND a Nyquist limit below it, and the limit is the one that matters. `createPeriodicWave` does not band-limit: it
 * renders every harmonic it is given, and anything above half the sample rate folds back down as an alias -- an inharmonic
 * tone that has nothing to do with the waveform. With a fixed 64 harmonics that is what happened to every high-pitched
 * NARROW pulse: at 1200 Hz the 19th harmonic is already past Nyquist, so a 12.5% duty pulse measured as if it were 7%, and
 * it did not sound like the waveform it claimed to be. The limit is per fundamental, which is why `pulseWave` needs to be
 * told the frequency.
 */
const PULSE_HARMONICS = 64;

/**
 * Pulse waves are cached per duty cycle and CONTEXT.
 *
 * A `PeriodicWave` is bound to the context that made it, and building one is a 64-term loop plus a normalisation pass --
 * cheap once, wasteful sixty times a second for a cue that fires on every round.
 */
const PULSE_CACHE = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>();

/**
 * A pulse wave at the given duty cycle, with the peak normalised to 1.
 *
 * Normalised so that gains mean the same thing at every duty: a 12.5% pulse concentrates its power into a shorter window
 * and would otherwise come out far louder than a 50% one at the same setting.
 *
 * @param hz the fundamental it will be played at. Passed in because the harmonic count has to stop below Nyquist, and only
 *   the caller knows the pitch. A pulse's narrowness lives in its HIGH harmonics, so folding those back is what turns a
 *   12.5% pulse into a different waveform -- see `PULSE_HARMONICS`.
 */
export function pulseWave(ctx: BaseAudioContext, duty: number, hz = 0): PeriodicWave {
  const d = Math.max(0.02, Math.min(0.5, duty));
  // `hz` of 0 means "the lowest the caller is likely to go", so a caller that cannot say still gets a usable wave.
  const limit = hz > 0 ? Math.max(1, Math.min(PULSE_HARMONICS, Math.floor(ctx.sampleRate * 0.5 / hz) - 1)) : PULSE_HARMONICS;
  const key = d + '|' + limit;
  let perContext = PULSE_CACHE.get(ctx);
  if (!perContext) {
    perContext = new Map<string, PeriodicWave>();
    PULSE_CACHE.set(ctx, perContext);
  }
  const cached = perContext.get(key);
  if (cached) return cached;

  const real = new Float32Array(limit + 1);
  const imag = new Float32Array(limit + 1);
  for (let n = 1; n <= limit; n++) {
    real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);
  }
  const wave = ctx.createPeriodicWave(real, imag);
  perContext.set(key, wave);
  return wave;
}

/** The noise channel's two registers. `hiss` is the long one, `buzz` the short one that can be heard as a pitch. */
export type NoiseMode = 'hiss' | 'buzz';

/**
 * One run of the noise register, as a buffer.
 *
 * @param rateHz how fast the register is CLOCKED. This is the pitch dial: a few hundred Hz is a low buzz with an
 *   audible note, several kHz is a hiss, and above that it stops reading as pitched at all.
 * @param seconds how much to generate. Generated to length rather than looped, because the register's own period is
 *   32767 steps -- at a low rate that is far longer than any cue, so a short loop would be a repeating pattern nobody
 *   asked for, and a long one would be a buffer per cue.
 */
export function lfsrNoise(ctx: BaseAudioContext, mode: NoiseMode, rateHz: number, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(seconds * ctx.sampleRate));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  /** How many output samples each register step covers, with a fractional remainder carried so the rate is exact. */
  const hold = ctx.sampleRate / Math.max(1, rateHz);
  // Non-zero seed: an all-zero register feeds itself zeros and never makes a sound.
  let reg = 1;
  let level = -1;
  let acc = hold;
  for (let i = 0; i < length; i++) {
    if (acc <= 0) {
      // The hardware's tap: bits 0 and 1 exclusive-ored, shifted back in at 14 -- or at 6 in the short mode, which is
      // what turns a 32767-step hiss into a 93-step buzz.
      const bit = (reg ^ (reg >> 1)) & 1;
      reg = (reg >> 1) | (bit << (mode === 'hiss' ? 14 : 6));
      level = (reg & 1) ? 1 : -1;
      acc += hold;
    }
    data[i] = level;
    acc -= 1;
  }
  return buffer;
}

/**
 * HOW A SOUND ENDS, which in this style is most of its character.
 *
 * `linear`   instantly on, straight line down. The chip default, and the one that reads as "blunt".
 * `cut`      instantly on, held flat, then gone. The hit-the-drum shape: no decay at all, because a chip's percussion
 *            was a noise channel switched on and off rather than an envelope.
 * `exponential` the smooth curve a synthesiser makes. Kept because a few cues want a soft tail, and because deleting
 *            the old shape outright would make going back to it a rewrite.
 */
export type EnvelopeShape = 'linear' | 'cut' | 'exponential';

/**
 * Apply an envelope to a gain node, and report when the voice should stop.
 *
 * `cut` is not a literal cut: the last 3ms ramp down to zero exists to avoid a step change in the signal, which is a
 * click -- a click is a click on any system, and it is not the "blunt" the owner asked for. Three milliseconds is short
 * enough that it still reads as an abrupt stop.
 */
export function applyEnvelope(
  gain: AudioParam,
  shape: EnvelopeShape,
  attack: number,
  seconds: number,
  level: number,
  at: number,
): void {
  const rise = Math.max(0, Math.min(attack, seconds * 0.5));
  gain.setValueAtTime(0, at);
  if (rise > 0) gain.linearRampToValueAtTime(level, at + rise);
  else gain.setValueAtTime(level, at);
  if (shape === 'cut') {
    const end = Math.max(at + rise + 0.003, at + seconds);
    gain.setValueAtTime(level, end);
    gain.linearRampToValueAtTime(0, end + 0.003);
    return;
  }
  if (shape === 'exponential') {
    // The floor rather than zero: an exponential ramp may not touch zero, and asking it to is an error.
    gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    return;
  }
  gain.linearRampToValueAtTime(0, at + seconds);
}

/** When a voice with this envelope falls silent, so the engine can count what is still sounding. */
export function envelopeEnd(shape: EnvelopeShape, attack: number, seconds: number, at: number): number {
  const rise = Math.max(0, Math.min(attack, seconds * 0.5));
  if (shape !== 'cut') return at + seconds;
  return Math.max(at + rise + 0.003, at + seconds) + 0.003;
}
