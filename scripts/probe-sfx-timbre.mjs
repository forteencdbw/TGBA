// Reads the sound effects' TIMBRE out of their own samples.
//
// The sound is synthesised, so "is this really a chip's pulse wave and not a sine" is answerable without listening: render
// a cue through an `OfflineAudioContext` -- which never touches the audio device, so this makes no noise -- and measure
// the waveform.
//
// IT CALIBRATES FIRST, and that is the part worth explaining. Measuring a waveform is code, and code can be wrong; a probe
// that reports "this cue failed" when its own arithmetic is broken is worse than no probe, because the failure looks like
// a fact about the game. So every run begins by rendering bare pulses at the three duty cycles, with no envelope and no
// sweep, and measuring them with the SAME functions the cues are measured with. If the calibration is off, the cue table
// below it means nothing and the script says so.
//
// THEN THE CUES, with one exclusion: a cue whose tone layer SWEEPS its frequency cannot be measured this way at all. The
// harmonics of a moving tone are not at n x f0, so the reading is meaningless rather than merely inaccurate -- those rows
// are marked `swept` and are not judged.
//
//   THE PALETTE   every tone layer is a `pulse` with a duty cycle or a `triangle`. A `sine` cannot be voiced at all.
//   THE SHAPE     a pulse's third harmonic is present. That is the number that matters -- a SINE has none either, so "the
//                 upper harmonics are quiet" would pass for a sine. A pulse's is a third of the fundamental or more.
//   THE ENVELOPE  a `linear` cue's decay correlates with a straight line at least as well as with an exponential.
//
// Usage: node scripts/probe-sfx-timbre.mjs [url]
//
// Needs the dev server up (`pnpm dev`), because it imports the module over HTTP. It starts its own headless Chrome on its
// own port, with `--mute-audio` -- an `OfflineAudioContext` is silent anyway, and a measuring tool has no business making a
// sound on somebody's machine either way.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9337;
/** One render rate for everything, in the page too: the arithmetic below is written against it. */
const RATE = 44100;

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('no chrome');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'gb-timbre-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--mute-audio',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Find the page target's websocket URL, retrying while Chrome starts. */
async function pageSocket() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error('chrome never opened a page target');
}

const socketUrl = await pageSocket();
const ws = new WebSocket(socketUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
});
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/**
 * Evaluate an expression in the page, awaiting it, and return its JSON value.
 *
 * The `await` is INSIDE the page's expression, and that is not a detail: `JSON.stringify(promise)` is `"{}"`, so wrapping
 * the expression from the outside silently reports every promise as an empty object. It has to be the resolved value that
 * gets stringified -- a mistake this file made on its first run.
 */
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression: `(async () => JSON.stringify(await (${expression})))()`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value === undefined ? undefined : JSON.parse(r.result.value);
}

const cleanup = () => {
  try {
    ws.close();
  } catch {
    // already gone
  }
  chrome.kill();
};

/**
 * The measuring code, as the page runs it.
 *
 * A string built here and shipped whole, because every number has to come back in one round trip. It defines the
 * primitives, calibrates them against a pulse it made itself, and then measures the cue table.
 */
const PAGE_SCRIPT = `(async () => {
  const chip = await import('/src/chip.ts');
  const { SfxEngine } = await import('/src/sfx.ts');
  const sounds = window.__GB.mechRef.audio.sfx.sounds;
  const RATE = ${RATE};

  /**
   * Amplitude at one frequency, over a window.
   *
   * Goertzel rather than an FFT: seven harmonic amplitudes at known frequencies is seven dot products, and an FFT would be
   * code to read rather than code that answers the question.
   */
  const goertzel = (data, from, count, hz) => {
    if (count < 2) return 0;
    const w = (2 * Math.PI * hz) / RATE;
    const coeff = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < count; i++) {
      const s0 = data[from + i] + coeff * s1 - s2;
      s2 = s1;
      s1 = s0;
    }
    return Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - coeff * s1 * s2)) / count;
  };

  const findOnset = (data) => {
    for (let i = 0; i < data.length; i++) if (Math.abs(data[i]) > 2e-3) return i;
    return 0;
  };

  /**
   * Where the note stops sounding, so the analysis window can be placed inside it.
   *
   * The buffer is deliberately longer than the note (a cue's render is padded), and measuring from the buffer's length
   * instead put the window PAST the end of a 20ms cue -- where the signal is a decay to zero and the "duty" is whatever a
   * near-silent ramp happens to average to. That is what made ui.slider read 0.069 instead of 0.125.
   */
  const findEnd = (data, at) => {
    for (let i = data.length - 1; i > at; i--) if (Math.abs(data[i]) > 2e-3) return i + 1;
    return data.length;
  };

  /**
   * Duty cycle, off the waveform: the fraction of one period above the middle of its own range.
   *
   * Averaged over eight periods, because one period at 1000 Hz is 44 samples and one sample of error is 2% of the answer.
   */
  const measureDuty = (data, from, period, periods) => {
    const n = Math.max(2, Math.floor(period));
    let lo = Infinity, hi = -Infinity;
    for (let i = from; i < from + n * periods; i++) { lo = Math.min(lo, data[i]); hi = Math.max(hi, data[i]); }
    const level = (lo + hi) / 2;
    let above = 0, total = 0;
    for (let i = from; i < from + n * periods; i++) { if (data[i] > level) above++; total++; }
    return above / Math.max(1, total);
  };

  /** Peak per window across a note, normalised to the first, for the envelope comparison. */
  const envelope = (data, at, tail, windows) => {
    const span = Math.max(1, Math.floor(tail / windows));
    const peaks = [];
    for (let w = 0; w < windows; w++) {
      let p = 0;
      for (let i = at + w * span; i < at + (w + 1) * span && i < data.length; i++) p = Math.max(p, Math.abs(data[i]));
      peaks.push(p);
    }
    const first = Math.max(1e-9, peaks[0]);
    return peaks.map((p) => p / first);
  };

  const corr = (a, b) => {
    const n = a.length;
    const ma = a.reduce((x, y) => x + y, 0) / n, mb = b.reduce((x, y) => x + y, 0) / n;
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
    return num / Math.sqrt(Math.max(1e-12, da * db));
  };

  /**
   * Everything measurable about one steady tone.
   *
   * A window at 30% into the note: past the attack, before the decay has taken most of it. Eight whole periods, so the
   * Goertzel bins land exactly on the harmonics rather than on a fraction of one.
   */
  const analyseTone = (data, hz, at, tail) => {
    const period = RATE / hz;
    const from = Math.min(Math.max(0, data.length - 2), at + Math.floor(tail * 0.3));
    const span = Math.min(Math.floor(period * 8), Math.max(2, data.length - from - 1));
    const h = [1, 2, 3, 4, 5, 6, 7].map((n) => goertzel(data, from, span, hz * n));
    const h1 = Math.max(1e-9, h[0]);
    const peaks = envelope(data, at, tail, 16);
    const ts = peaks.map((_, i) => i / (peaks.length - 1));
    return {
      harmonics: h.map((v) => +(v / h1).toFixed(3)),
      // Named dutyMeasured and NOT duty, because this object is mixed into a cue row: calling it duty would overwrite the
      // configured duty with the measured one, and the comparison between them would then always agree. It did, on this
      // file's second run. (No backticks in here either -- this whole script is inside a template literal.)
      dutyMeasured: +measureDuty(data, from, period, 8).toFixed(3),
      linearFit: +corr(peaks, ts.map((t) => 1 - t)).toFixed(3),
      expFit: +corr(peaks, ts.map((t) => Math.exp(-4 * t))).toFixed(3),
    };
  };

  /**
   * A bare pulse at a known duty and a known pitch, with no envelope and no sweep -- the reference a cue is judged against.
   *
   * WHY THE PITCH IS AN ARGUMENT. A pulse is band-limited to whatever fits under Nyquist, and a narrow pulse's shape lives
   * in its high harmonics, so the wave that comes out depends on the pitch it is played at: at 1200 Hz only 17 harmonics
   * fit, and a 12.5% pulse's plateau comes out rounded, which reads as a duty of 0.07 rather than 0.125 if you measure the
   * waveform rather than the recipe. That is not a fault -- folding those harmonics back instead would be aliasing -- but
   * it means the honest comparison is against a reference AT THE SAME PITCH, not against the ideal number.
   */
  const references = new Map();
  const reference = async (duty, hz) => {
    const key = duty + '@' + hz;
    if (!references.has(key)) {
      const ctx = new OfflineAudioContext(1, RATE, RATE);
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(chip.pulseWave(ctx, duty, hz));
      osc.frequency.value = hz;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(0);
      const data = (await ctx.startRendering()).getChannelData(0);
      // A steady tone from the first sample: the onset is 0 and the whole buffer is the note.
      references.set(key, analyseTone(data, hz, 0, data.length));
    }
    return references.get(key);
  };

  // The absolute check, at a pitch where every harmonic fits: this is the probe proving its own arithmetic against the
  // closed form (a pulse of duty d has harmonic n at 2/(n*pi)*sin(n*pi*d)).
  const calibration = [];
  for (const duty of [0.125, 0.25, 0.5]) calibration.push({ knownDuty: duty, ...(await reference(duty, 440)) });

  const results = [];
  const engine = new SfxEngine();
  for (const [id, recipe] of Object.entries(sounds)) {
    const tones = recipe.layers.filter((l) => l.type === 'tone');
    const noises = recipe.layers.filter((l) => l.type === 'noise');
    const only = tones.length === 1 && noises.length === 0 ? tones[0] : null;
    const seconds = Math.max(...recipe.layers.map((l) => (l.delay ?? 0) + l.seconds)) + 0.05;
    const data = await engine.renderOffline(id, seconds);
    const at = findOnset(data);
    const tail = findEnd(data, at) - at;
    let peak = 0;
    for (let i = at; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));

    /**
     * A SWEEPING tone is not measurable this way, and saying so is better than printing a number that looks like a
     * verdict. Its harmonics are not at n x f0, so the Goertzel bins land between partials and the reading is meaningless
     * rather than merely inaccurate.
     */
    const swept = !!(only && only.endRatio !== undefined && only.endRatio !== 1);
    const measured = only && !swept ? analyseTone(data, only.hz, at, tail) : null;
    const ref = only && !swept && only.wave === 'pulse' ? await reference(only.duty, only.hz) : null;
    const row = {
      id,
      kind: only ? only.wave : 'mixed',
      duty: only && only.duty ? only.duty : null,
      shape: only ? (only.shape ?? 'linear') : null,
      peak: +peak.toFixed(3),
      swept,
      ...(measured ?? {}),
      // What a bare pulse of the same duty at the same pitch measures, so the comparison is like for like.
      refDuty: ref ? ref.dutyMeasured : null,
      refThird: ref ? ref.harmonics[2] : null,
    };
    results.push(row);
  }

  return {
    calibration,
    results,
    palette: Object.values(sounds)
      .flatMap((r) => r.layers)
      .reduce((acc, l) => {
        const key = l.type === 'noise' ? 'noise ' + (l.mode ?? 'hiss') : l.wave + (l.duty ? ' ' + l.duty : '');
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    offPalette: Object.entries(sounds)
      .flatMap(([id, r]) => r.layers.filter((l) => l.type === 'tone' && l.wave !== 'pulse' && l.wave !== 'triangle').map(() => id))
      .filter((v, i, a) => a.indexOf(v) === i),
  };
})()`;

try {
  await send('Page.enable');
  await send('Page.navigate', { url: URL_ARG });
  // Wait for the game's own seam rather than for a timeout: it is the honest "the page is loaded" signal.
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await evaluate('!!window.__GB')) break;
    await sleep(250);
  }
  if (!(await evaluate('!!window.__GB'))) throw new Error(`__GB never appeared at ${URL_ARG} -- is the dev server up?`);

  const report = await evaluate(PAGE_SCRIPT);

  // ---------------------------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------------------------
  console.log('\nPALETTE (layers across all 68 cues)');
  for (const [key, count] of Object.entries(report.palette).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${key}`);
  }
  if (report.offPalette.length) console.log(`  !! off-palette layers in: ${report.offPalette.join(', ')}`);

  console.log('\nCALIBRATION (bare pulses this script made itself, measured with the same code)');
  console.log('  duty   meas   h2/h1  h3/h1  h5/h1  verdict');
  let calibrationOk = true;
  for (const c of report.calibration) {
    const off = Math.min(Math.abs(c.dutyMeasured - c.knownDuty), Math.abs(1 - c.dutyMeasured - c.knownDuty));
    const ok = off < 0.05 && c.harmonics[2] > 0.12;
    if (!ok) calibrationOk = false;
    console.log(
      `  ${String(c.knownDuty).padEnd(6)} ${String(c.dutyMeasured).padEnd(6)} ${String(c.harmonics[1]).padEnd(7)} ${String(c.harmonics[2]).padEnd(6)} ${String(c.harmonics[4]).padEnd(6)} ${ok ? 'ok' : 'MEASUREMENT IS WRONG'}`,
    );
  }
  if (!calibrationOk) console.log('\nThe calibration failed, so nothing below it can be trusted. Fix the measuring code first.');

  const single = report.results.filter((r) => r.kind !== 'mixed');
  const rest = report.results.length - single.length;
  console.log(`\nSINGLE-TONE CUES (${single.length} of ${report.results.length}; the other ${rest} are mixtures of several layers)`);
  console.log('  cue                        duty   meas   h2/h1  h3/h1  ref    linear expo   verdict');
  let failures = 0;
  for (const r of single) {
    if (r.swept) {
      console.log(`  ${r.id.padEnd(26)} ${String(r.duty ?? '-').padEnd(6)} swept  --     --     --     --     --     not measurable: the tone sweeps`);
      continue;
    }
    // Judged against the reference AT THIS PITCH, not against the ideal duty: see `reference`. A pulse can also come out
    // inverted, which is the same wave phase-shifted, so the complement counts as a match too.
    const against = r.refDuty ?? r.duty;
    const off = Math.min(Math.abs(r.dutyMeasured - against), Math.abs(1 - r.dutyMeasured - against));
    const refOff = r.refDuty === null ? 0 : Math.min(Math.abs(r.refDuty - r.duty), Math.abs(1 - r.refDuty - r.duty));
    const harmonicsOk = r.kind === 'triangle' || r.harmonics[2] > 0.12;
    const dutyOk = r.kind !== 'pulse' || off < 0.03;
    const envelopeOk = r.shape !== 'linear' || r.linearFit >= r.expFit - 0.2;
    const reasons = [
      harmonicsOk ? '' : 'no-3rd-harmonic(sine?)',
      dutyOk ? '' : 'does-not-match-a-reference-pulse',
      envelopeOk ? '' : 'envelope-not-linear',
    ].filter(Boolean);
    if (reasons.length) failures++;
    console.log(
      `  ${r.id.padEnd(26)} ${String(r.duty ?? '-').padEnd(6)} ${String(r.dutyMeasured).padEnd(6)} ` +
        `${String(r.harmonics[1]).padEnd(6)} ${String(r.harmonics[2]).padEnd(6)} ` +
        `${r.refDuty === null ? String(r.harmonics[4]).padEnd(6) : String(r.refDuty).padEnd(6)} ` +
        `${String(r.linearFit).padEnd(6)} ${String(r.expFit).padEnd(6)} ${reasons.length ? reasons.join(' ') : 'ok'}`,
    );
  }

  console.log('\nWHAT THE NUMBERS MEAN');
  console.log('  h3/h1  a pulse has a strong third harmonic -- about 0.33 at 0.5 duty, and larger as the duty narrows. A SINE');
  console.log('         has essentially none, so this is the number that proves the palette is not a sine. h2/h1 is absent at');
  console.log('         0.5 duty and large at 0.125, which is why those two duties sound so different.');
  console.log('  duty   the fraction of one period the wave spends on, measured off the samples.');
  console.log('  ref    what a bare pulse of the SAME duty at the SAME pitch measures. A cue matches when its own reading');
  console.log('         agrees with this, which is the real claim: the cue is playing the waveform the config asked for.');
  console.log('  linear a `linear` envelope should correlate with a straight line at least as well as with an exponential.');
  const ok = calibrationOk && failures === 0 && report.offPalette.length === 0;
  console.log(ok ? '\nALL CHECKS PASSED' : `\n${failures} CUE(S) FAILED`);
  process.exitCode = ok ? 0 : 1;
} catch (error) {
  console.error(error.message ?? error);
  process.exitCode = 1;
} finally {
  cleanup();
}
