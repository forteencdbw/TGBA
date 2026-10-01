// Verifies D6: the audio graph, and the two different endings.
//
// Audio is the one subsystem a screenshot cannot check, and the design's whole audio brief is that the
// ambience IS the progress readout -- so the assertion is that the ambience actually changes with
// depth, not merely that it makes noise.
//
// Usage: node scripts/audio-ending.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9375;

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

const profile = mkdtempSync(join(tmpdir(), 'gb-audio-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    // Headless Chrome has no audio device, but WebAudio still runs; `--autoplay-policy` is what makes
    // a context able to leave the suspended state without a real gesture.
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=500,780',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error('no devtools target');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 1;
    const pending = new Map();
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await findTarget());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });

  let booted = false;
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    const r = await cdp.send('Runtime.evaluate', { expression: '!!(window.__GB && window.__GB.game)', returnByValue: true });
    if (r.result.value === true) {
      booted = true;
      break;
    }
  }
  if (!booted) throw new Error('the game never booted');
  for (let i = 0; i < 60; i++) {
    const r = await cdp.send('Runtime.evaluate', { expression: 'window.__GB.game.diagnostics.phase', returnByValue: true });
    if (r.result.value === 'playing') break;
    await sleep(200);
  }

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
    return JSON.parse(r.result.value);
  };

  // ---------------------------------------------------------------- audio
  // The cue fired per event is not observable from outside, so the assertions are about the things
  // that ARE: the context runs after a gesture, muting works, and the ambience tracks depth.
  const audioProbe = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const audio = g.audioRef;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       // A real gesture path: the game unlocks audio from its pointer handler.
       g.handlePointerDown(1, 10, 10);
       g.handlePointerUp(1);
       for (let i = 0; i < 5; i++) await raf();
       const afterGesture = { running: audio.isRunning, muted: audio.muted };
       // Depth response: the ambience must DIFFER between the seabed and the surface.
       audio.setDepth(1500, 1500);
       const deep = audio.debugLevels();
       audio.setDepth(0, 1500);
       const shallow = audio.debugLevels();
       // Mute.
       const mutedNow = audio.toggleMute();
       const mutedLevel = audio.debugLevels();
       audio.toggleMute();
       return JSON.stringify({ afterGesture, deep, shallow, mutedNow, mutedLevel });
     })()`,
    true,
  );

  console.log('audio after a pointer gesture: ' + JSON.stringify(audioProbe.afterGesture));
  console.log('ambience at 1500m (seabed):    ' + JSON.stringify(audioProbe.deep));
  console.log('ambience at 0m (surface):      ' + JSON.stringify(audioProbe.shallow));
  console.log('muted: ' + audioProbe.mutedNow + ', master gain -> ' + JSON.stringify(audioProbe.mutedLevel));

  // ---------------------------------------------------------------- endings
  // Two endings that must FEEL different: death has no flash, the surface has one.
  const death = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       g.debugResetStats();
       // Kill it outright.
       for (let i = 0; i < 40; i++) g.debugForceHit();
       await raf();
       const d = g.diagnostics;
       return JSON.stringify({ phase: d.phase, surfaced: d.ending.surfaced, splash: d.ending.splash, hits: d.stats.hits });
     })()`,
    true,
  );

  const surface = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const t0 = performance.now();
       while (g.diagnostics.phase !== 'playing' && performance.now() - t0 < 12000) await raf();
       g.teleportToSurface();
       // Wait for the breach.
       const t1 = performance.now();
       while (g.diagnostics.phase !== 'burst' && performance.now() - t1 < 6000) await raf();
       const d = g.diagnostics;
       return JSON.stringify({
         phase: d.phase,
         surfaced: d.ending.surfaced,
         splashRightAfterBreach: d.ending.splash,
         bestClimbed: d.ending.bestClimbed,
         hits: d.stats.hits
       });
     })()`,
    true,
  );

  console.log('\ndeath:   ' + JSON.stringify(death));
  console.log('surface: ' + JSON.stringify(surface));

  const checks = {
    // Audio runs once a gesture has happened, and reports it honestly.
    audioRunsAfterGesture: audioProbe.afterGesture.running === true,
    // THE brief: the ambience changes with depth, so it doubles as progress feedback.
    ambienceBrightensNearSurface: audioProbe.shallow.cutoff > audioProbe.deep.cutoff * 2,
    ambienceGetsLouderNearSurface: audioProbe.shallow.ambient > audioProbe.deep.ambient,
    mutingSilencesMaster: audioProbe.mutedLevel.master === 0,
    // Two endings that feel different: the surface flashes white, death does not.
    deathPops: death.phase === 'burst',
    deathHasNoFlash: death.splash === 0,
    surfaceIsMarkedAsSurfaced: surface.surfaced === true,
    surfaceFlashes: surface.splashRightAfterBreach > 0.5,
    endingsAreDistinct: death.surfaced === false && surface.surfaced === true && surface.splashRightAfterBreach > death.splash,
    bestRunIsTracked: surface.bestClimbed > 0,
  };
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('AUDIO/ENDING FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
