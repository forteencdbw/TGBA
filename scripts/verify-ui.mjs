// Drives the settings panel and the main menu through their real pointer paths.
//
// Every requirement here is a BEHAVIOUR, not a drawing, so each one is asserted rather than eyeballed:
//
//   the gear opens the panel and the LEVEL FREEZES (the scroll does not creep while it is open)
//   the volume slider changes the audio master gain live, at the value the slider shows
//   restart begins a fresh run
//   exit reaches the main menu
//   save and cancel both close the panel and resume, at the phase it interrupted
//
// Taps go through `handlePointerDown/Move/Up`, the same entry points the stage listeners use, so the routing
// under test is the shipping one. Coordinates come from the panel's own reported geometry, so this cannot
// silently pass while pointing at the wrong place.
//
// Usage: node scripts/verify-ui.mjs [url]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const PORT = 9392;
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

const profile = mkdtempSync(join(tmpdir(), 'gb-ui-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new', '--no-first-run', '--no-sandbox',
    '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--window-size=500,780', 'about:blank',
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
    const errors = [];
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        errors,
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) rej(new Error(JSON.stringify(m.error)));
        else res(m.result);
      } else if (m.method === 'Runtime.exceptionThrown') {
        errors.push(String(m.params?.exceptionDetails?.exception?.description ?? '').split('\n')[0]);
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

  const evalJson = async (expr, awaitPromise = false) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception?.description ?? '').split('\n')[0]);
    return JSON.parse(r.result.value);
  };

  const out = await evalJson(
    `(async function () {
       const g = window.__GB.game;
       const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
       const frames = async function (n) { for (let i = 0; i < n; i++) await raf(); };
       const tap = async function (x, y) {
         g.handlePointerDown(900, x, y);
         await raf();
         g.handlePointerUp(900);
         await raf();
       };
       const snap = function () {
         return {
           phase: g.diagnostics.phase,
           scroll: +g.diagnostics.level.scrolled.toFixed(2),
           elapsed: +g.diagnostics.elapsed.toFixed(2),
           settingsOpen: g.settingsRef.isOpen,
           sliderValue: +g.settingsRef.sliderValue.toFixed(3),
           masterGain: +g.audioRef.debugLevels().master.toFixed(4),
           volume: +g.audioRef.getVolume().toFixed(3),
           menuVisible: g.menuRef.root.visible
         };
       };
       const steps = {};

       steps.atBoot = snap();
       const menuGeo = g.menuRef.geometry;
       await tap(menuGeo.button.x + menuGeo.button.w / 2, menuGeo.button.y + menuGeo.button.h / 2);
       await frames(6);
       steps.afterStartTap = snap();

       const geo = g.settingsRef.geometry;

       /**
        * The panel is opened DURING THE INTRO first, which is a real thing a player does.
        *
        * It must resume to the intro rather than skipping the rest of the animation, and the scroll must not
        * advance on its own -- the intro holds the camera still.
       */
       await tap(geo.gear.x, geo.gear.y);
       await frames(4);
       steps.openDuringIntro = snap();
       const introCancel = geo.buttons.cancel;
       await tap(introCancel.x + introCancel.w / 2, introCancel.y + introCancel.h / 2);
       await frames(4);
       steps.resumedDuringIntro = snap();

       // Now wait for actual play, so the pause and the slider are measured on a live level.
       for (let i = 0; i < 240 && g.diagnostics.phase !== 'playing'; i++) await raf();
       await frames(20);
       steps.playing = snap();

       // --- The gear opens the panel, and the level must FREEZE ---
       await tap(geo.gear.x, geo.gear.y);
       await frames(4);
       steps.panelOpen = snap();
       const scrollAtOpen = steps.panelOpen.scroll;
       // Half a second of wall clock with the panel up. If the pause is real, nothing moves.
       const t0 = performance.now();
       while (performance.now() - t0 < 500) await raf();
       steps.panelStillOpen = snap();
       steps.scrollDriftWhilePaused = +(steps.panelStillOpen.scroll - scrollAtOpen).toFixed(3);

       // --- The volume slider, dragged to 25% then to 0 then to 100 ---
       const sliderAt = function (t) { return { x: geo.slider.x + geo.slider.w * t, y: geo.slider.y }; };
       const dragTo = async function (t) {
         const p = sliderAt(t);
         g.handlePointerDown(901, p.x, p.y);
         await raf();
         g.handlePointerMove(901, p.x, p.y);
         await raf();
         g.handlePointerUp(901);
         await raf();
         return snap();
       };
       steps.slider25 = await dragTo(0.25);
       steps.slider0 = await dragTo(0);
       steps.slider100 = await dragTo(1);

       // --- The slider must also respond to a press WITHOUT a move, i.e. a tap along the track ---
       const p60 = sliderAt(0.6);
       g.handlePointerDown(902, p60.x, p60.y);
       await raf();
       g.handlePointerUp(902);
       await raf();
       steps.sliderTap60 = snap();

       // --- Cancel closes and RESUMES ---
       const cancel = geo.buttons.cancel;
       await tap(cancel.x + cancel.w / 2, cancel.y + cancel.h / 2);
       await frames(4);
       steps.afterCancel = snap();
       const scrollAtResume = steps.afterCancel.scroll;
       const t1 = performance.now();
       while (performance.now() - t1 < 400) await raf();
       steps.resumedDrift = +(snap().scroll - scrollAtResume).toFixed(2);

       // --- Reopen, and SAVE closes and resumes the same way ---
       await tap(geo.gear.x, geo.gear.y);
       await frames(4);
       steps.reopened = snap();
       const save = geo.buttons.save;
       await tap(save.x + save.w / 2, save.y + save.h / 2);
       await frames(4);
       steps.afterSave = snap();

       // --- Restart: the scroll goes back to the beginning ---
       await frames(30);
       const beforeRestart = snap();
       await tap(geo.gear.x, geo.gear.y);
       await frames(4);
       const restart = geo.buttons.restart;
       await tap(restart.x + restart.w / 2, restart.y + restart.h / 2);
       await frames(4);
       steps.restart = { before: beforeRestart, after: snap() };

       // --- Exit: the main menu comes back and the level stops ---
       await frames(40);
       await tap(geo.gear.x, geo.gear.y);
       await frames(4);
       const exitBtn = geo.buttons.exit;
       await tap(exitBtn.x + exitBtn.w / 2, exitBtn.y + exitBtn.h / 2);
       await frames(6);
       steps.afterExit = snap();

       // And starting again from the menu must work.
       await tap(menuGeo.button.x + menuGeo.button.w / 2, menuGeo.button.y + menuGeo.button.h / 2);
       await frames(8);
       steps.afterRestartFromMenu = snap();

       return JSON.stringify({ steps, geo: { gear: geo.gear, slider: geo.slider, buttons: geo.buttons } });
     })()`,
    true,
  );

  const s = out.steps;
  const fmt = (label, v) =>
    console.log(
      '  ' + label.padEnd(22) +
      String(v.phase).padEnd(9) +
      String(v.scroll).padStart(9) +
      String(v.settingsOpen).padStart(9) +
      (v.sliderValue * 100).toFixed(0).padStart(8) + '%' +
      String(v.masterGain).padStart(10) +
      String(v.menuVisible).padStart(8),
    );

  console.log('step                    phase       scroll  panelOpen   slider    masterGain  menu');
  fmt('at boot', s.atBoot);
  fmt('after start tap', s.afterStartTap);
  fmt('open during intro', s.openDuringIntro);
  fmt('resume into intro', s.resumedDuringIntro);
  fmt('now playing', s.playing);
  fmt('panel opened', s.panelOpen);
  fmt('still open (+0.5s)', s.panelStillOpen);
  fmt('slider -> 25%', s.slider25);
  fmt('slider -> 0%', s.slider0);
  fmt('slider -> 100%', s.slider100);
  fmt('tap track at 60%', s.sliderTap60);
  fmt('after CANCEL', s.afterCancel);
  fmt('after SAVE', s.afterSave);
  fmt('restart: before', s.restart.before);
  fmt('restart: after', s.restart.after);
  fmt('after EXIT', s.afterExit);
  fmt('start from menu', s.afterRestartFromMenu);

  console.log('\nscroll drift while the panel was open: ' + s.scrollDriftWhilePaused + ' m');
  console.log('scroll drift after cancel resumed:     ' + s.resumedDrift + ' m');

  const checks = {
    // The menu is where it starts, and the start button begins a run.
    bootsIntoTheMenu: s.atBoot.phase === 'menu' && s.atBoot.menuVisible === true,
    startButtonBeginsARun: s.afterStartTap.phase !== 'menu' && s.afterStartTap.menuVisible === false,
    /**
     * Opening the panel mid-animation must return to the animation, not skip it.
     *
     * The phase is remembered rather than assumed to be `playing` for exactly this reason, and it is asserted
     * because "resume to playing" would look right in every other case.
     */
    resumingRestoresTheInterruptedPhase:
      s.openDuringIntro.phase === 'paused' && s.resumedDuringIntro.phase === 'intro',
    // THE PAUSE. Not "a flag is set" -- the level's own progress must not move.
    gearOpensThePanel: s.panelOpen.settingsOpen === true && s.panelOpen.phase === 'paused',
    panelFreezesTheLevel: s.scrollDriftWhilePaused === 0,
    // The slider drives the audio, and the gain matches what the slider shows.
    sliderAt25SetsGain: Math.abs(s.slider25.masterGain - 0.25) < 0.02 && Math.abs(s.slider25.sliderValue - 0.25) < 0.01,
    sliderAt0Silences: s.slider0.masterGain < 0.02,
    sliderAt100IsFull: Math.abs(s.slider100.masterGain - 1) < 0.02,
    // A tap along the track works, not only a drag from the knob.
    tappingTheTrackWorks: Math.abs(s.sliderTap60.sliderValue - 0.6) < 0.02,
    // Cancel and save both close and resume.
    cancelClosesAndResumes: s.afterCancel.settingsOpen === false && s.afterCancel.phase !== 'paused' && s.resumedDrift > 1,
    saveClosesAndResumes: s.afterSave.settingsOpen === false && s.afterSave.phase !== 'paused',
    // Restart puts the level back to its start.
    restartBeginsAFreshRun: s.restart.after.scroll < s.restart.before.scroll && s.restart.after.phase !== 'paused',
    exitReachesTheMenu: s.afterExit.phase === 'menu' && s.afterExit.menuVisible === true,
    returningFromTheMenuWorks: s.afterRestartFromMenu.phase !== 'menu' && s.afterRestartFromMenu.menuVisible === false,
    noExceptions: cdp.errors.length === 0,
  };
  if (cdp.errors.length) console.log('\nexceptions: ' + JSON.stringify(cdp.errors.slice(0, 4)));
  console.log('\nCHECKS: ' + JSON.stringify(checks));
  code = Object.values(checks).every(Boolean) ? 0 : 1;
  cdp.close();
} catch (e) {
  console.error('VERIFY-UI FAILED: ' + e.message);
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
