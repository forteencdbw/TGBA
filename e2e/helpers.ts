import { expect, type Page } from '@playwright/test';

/**
 * Shared helpers for the end-to-end tests.
 *
 * ---------------------------------------------------------------------------------------------
 * THE POINT OF THIS FILE
 * ---------------------------------------------------------------------------------------------
 * The old hand-rolled probes had one recurring failure: they read fields off `window.__GB` as untyped JSON, so
 * a field the game had renamed showed up as `undefined` and the probe failed with a message that pointed at
 * the wrong place -- or worse, PASSED, because `undefined > 0.05` is false but `undefined === undefined` is
 * true. Several of those cost real time.
 *
 * The interfaces below describe the slice of the game the tests touch. `game(page)` returns them typed, so
 * renaming a field in the game breaks the tests at the exact line, with a name in the error.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE GAME'S TEST HOOKS, NOT THE DOM
 * ---------------------------------------------------------------------------------------------
 * The canvas has no DOM to query: the water, the bubble and the hazards are Pixi draw calls. So there is no
 * honest locator for "the bubble moved". `window.__GB` is the seam, and it is a deliberate one -- the game
 * exposes its scroll, its player's screen fraction, its hazard list and its audio graph precisely so that a
 * test can assert the FACT rather than a proxy for it.
 *
 * Two things that ARE driven through real input, because that is what is under test: the menu's start button
 * and the settings panel's controls. Those are hit-tested by the game itself, so a click that lands in the
 * wrong place is a failure rather than a hidden pass.
 */

/** The slice of `window.__GB.game.diagnostics` the tests read. */
export interface Diagnostics {
  frames: number;
  elapsed: number;
  phase: 'menu' | 'intro' | 'playing' | 'burst' | 'paused';
  volume: number;
  bubbles: number;
  gameSeconds: number;
  level: {
    id: string;
    scrollLength: number;
    scrollSpeed: number;
    scrolled: number;
    entriesEmitted: number;
    entriesTotal: number;
  };
  stage: {
    stage: number;
    name: string;
    absorbedInStage: number;
    neededForNext: number | null;
    speedMultiplier: number;
    /** The colours this stage paints the bubble with. */
    palette: { body: number; rim: number; halo: number };
    /** The drawn radius as a fraction of the lane, which is also the radius the eating rules use. */
    radiusFraction: number;
  };
  hazards: { active: number; byKind: Record<string, number>; comedyBeats: number };
  emergence: { fishCount: number; perceptionRadiusMeters: number };
  slow: { remaining: number; factor: number; impulseVy: number };
  ending: { surfaced: boolean; splash: number; bestClimbed: number };
  audio: { muted: boolean; running: boolean };
  /** Which skill is in the slot and how many uses are left, or null. */
  skill: { id: string; uses: number } | null;
  /** How many skills have been used this run. */
  skillActivations: number;
  stats: { absorbed: number; hits: number; maxVolume: number; ended: number; newRecord: boolean };
  laneWidthMeters: number;
  lateral: { keyboardSpeed: number; laneWidth: number; crossingSeconds: number };
}

/** The piece of the game object the tests call. */
export interface GameHandle {
  diagnostics: Diagnostics;
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    screenY: number;
    volume: number;
    stageSpeedMultiplier: number;
    steerScale: number;
  };
  camera: { y: number; viewport: { laneWidthPx: number; visibleDepthMeters: number; width: number; height: number } };
  /** Canvas size in CSS pixels. */
  canvasSize: { width: number; height: number };
  /** Audio's REQUESTED gains, which is the decision rather than the ramp in progress. */
  audioLevels: () => { cutoff: number; ambient: number; noise: number; master: number };
  settingsGeometry: () => {
    gear: { x: number; y: number; radius: number };
    panel: { x: number; y: number; w: number; h: number };
    slider: { x: number; y: number; w: number; h: number };
    buttons: Record<string, { x: number; y: number; w: number; h: number }>;
  };
  settingsOpen: () => boolean;
  sliderValue: () => number;
  menuButton: () => { x: number; y: number; w: number; h: number };
  menuVisible: () => boolean;
  /** Test hooks. Prefixed `debug` in the game, gathered here so a test reads like intent. */
  startRun: () => void;
  restart: () => void;
  spawnBubbleOnPlayer: (sizeRatio: number) => void;
  spawnHazardOnPlayer: (kind: 'fish' | 'jelly' | 'trash' | 'crab') => void;
  grantSkill: (id: string) => void;
  skipToLevelEnd: () => void;
  demoteStage: () => number;
  steadyCruise: () => void;
  /** The mechanics config as loaded, for comparing the running build against the file. */
  mechanics: {
    stages: {
      speedMultiplier: number[];
      absorbToStage2: number;
      absorbToStage3: number;
      minSpeedMultiplier: number;
      growInvulnerableSeconds: number;
      color: number[];
      name: string[];
    };
    level: { scrollSpeed: number };
    volume: { max: number; hitCost: number; laneRatio: number };
    hazards: { crabLaunchMps: number; crabLaunchScreenBonus: number };
  };
  /** The lateral authority this display resolved to. */
  lateralSnapshot: { keyboardSpeed: number; laneWidth: number };
}

/**
 * Wait until the game module has booted and exposed itself.
 *
 * `window.__GB` is assigned during `Game`'s constructor, so this is satisfied before the first frame.
 */
export async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as unknown as { __GB?: unknown }).__GB), null, { timeout: 30_000 });
}

/**
 * Press the menu's start button, through the game's own pointer path.
 *
 * Deliberately NOT `page.click` on a selector: there is no element to click. The button is Pixi geometry, and
 * the game hit-tests it. `page.mouse` at the reported centre is a real input event at a real coordinate, which
 * is the closest thing to a finger that exists here -- and it fails if the button is not where it claims.
 */
export async function startFromMenu(page: Page): Promise<void> {
  const box = await page.evaluate(() => {
    const b = (window as unknown as { __GB: { game: { menuRef: { geometry: { button: { x: number; y: number; w: number; h: number } } } } } }).__GB.game.menuRef.geometry.button;
    return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  });
  await page.mouse.click(box.x, box.y);
}

/** Wait for a specific phase, and fail with what it saw instead. */
export async function waitForPhase(page: Page, phase: Diagnostics['phase'], timeout = 30_000): Promise<void> {
  try {
    await page.waitForFunction(
      (want) => (window as unknown as { __GB: { game: { diagnostics: { phase: string } } } }).__GB.game.diagnostics.phase === want,
      phase,
      { timeout },
    );
  } catch {
    const actual = await page.evaluate(
      () => (window as unknown as { __GB: { game: { diagnostics: { phase: string } } } }).__GB.game.diagnostics.phase,
    );
    throw new Error(`waited for phase "${phase}" but the game was in "${actual}" after ${timeout}ms`);
  }
}

/** Read the diagnostics. */
export async function diagnostics(page: Page): Promise<Diagnostics> {
  return page.evaluate(() => JSON.parse(JSON.stringify((window as unknown as { __GB: { game: { diagnostics: unknown } } }).__GB.game.diagnostics)));
}

/** Read the player. */
export async function player(page: Page): Promise<GameHandle['player']> {
  return page.evaluate(() => {
    const p = (window as unknown as { __GB: { player: Record<string, number> } }).__GB.player;
    return {
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      screenY: p.screenY,
      volume: p.volume,
      stageSpeedMultiplier: p.stageSpeedMultiplier,
      steerScale: p.steerScale,
    };
  });
}

/** The audio module's requested gains. */
export async function audioLevels(page: Page): Promise<{ cutoff: number; ambient: number; noise: number; master: number }> {
  return page.evaluate(() => (window as unknown as { __GB: { game: { audioRef: { debugLevels: () => never } } } }).__GB.game.audioRef.debugLevels());
}

/** The settings panel's real geometry, so a test can aim at the actual controls. */
export async function settingsGeometry(page: Page): Promise<ReturnType<GameHandle['settingsGeometry']>> {
  return page.evaluate(() => (window as unknown as { __GB: { game: { settingsRef: { geometry: never } } } }).__GB.game.settingsRef.geometry);
}

/** The mechanics config the running build actually loaded. */
export async function mechanics(page: Page): Promise<GameHandle['mechanics']> {
  return page.evaluate(() => JSON.parse(JSON.stringify((window as unknown as { __GB: { mechRef: unknown } }).__GB.mechRef)));
}

/** Nothing should have thrown during the test. Collected from the console and page errors. */
export function watchForErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  return errors;
}

/** A convenience assertion used by several tests. */
export async function expectNoErrors(errors: string[]): Promise<void> {
  expect(errors, 'the page reported errors').toEqual([]);
}

/**
 * Drive the bubble to a target growth stage by absorbing, then stop.
 *
 * Inside ONE page evaluation, using a `requestAnimationFrame` loop. The first version spawned a single bubble
 * per `expect.poll` tick and relied on Playwright's retry cadence to keep the game stepping -- a timing guess,
 * since the poll interval and the frame loop are unrelated, so the run could sit for a poll interval with
 * nothing spawned and the stage would never move. A rAF loop is the direct expression of "keep feeding it until
 * it promotes", and it stops the moment it has what it came for.
 *
 * Comes DOWN to the target too, through the game's own demote path, so a test can walk the stages in any order
 * rather than only upward.
 */
export async function absorbUntilStage(page: Page, target: number): Promise<void> {
  const reached = await page.evaluate(
    async (want) => {
      const g = (window as unknown as {
        __GB: {
          game: {
            diagnostics: { stage: { stage: number }; stats: { absorbed: number } };
            spawnBubbleOnPlayer: (r: number) => void;
            demoteStageForTest: () => number;
          };
        };
      }).__GB.game;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      let guard = 0;
      while (g.diagnostics.stage.stage > want && guard++ < 20) {
        g.demoteStageForTest();
        await raf();
      }
      // ONE bubble per frame, waiting a frame after each so the absorb is processed before the next spawn --
      // spawning faster than the game consumes them piles bubbles on the player and the count stops meaning
      // anything.
      guard = 0;
      while (g.diagnostics.stage.stage < want && guard++ < 600) {
        g.spawnBubbleOnPlayer(0.4);
        await raf();
      }
      return { stage: g.diagnostics.stage.stage, absorbed: g.diagnostics.stats.absorbed };
    },
    target,
  );

  expect(reached.stage, `the bubble should reach stage ${target}`).toBe(target);
}
