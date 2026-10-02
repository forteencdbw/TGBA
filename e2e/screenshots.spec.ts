import { test } from '@playwright/test';
import { boot, settingsGeometry, startFromMenu, waitForPhase } from './helpers';

/**
 * Screenshot capture, as a test rather than a script.
 *
 * These assert nothing on purpose: a picture is for looking at, and a human decides whether the panel looks
 * right. What they replace is `scripts/shot-ui.mjs`, which re-implemented the browser spawn, the page boot, the
 * menu press and the wait-for-play just to take a picture -- all of which Playwright already does, and does with
 * the same helper functions the assertions use.
 *
 * Run them explicitly, since they are only wanted when someone is looking:
 *
 *     pnpm test:shots
 *
 * `pnpm test` EXCLUDES these via the `@screenshots` tag and `grepInvert` in the config. Each takes several
 * seconds and asserts nothing, so including them in the default run would make "all tests pass" a slightly
 * weaker claim -- and a suite that spends its time on pictures is a suite people stop running.
 *
 * Each test carries the tag in its OWN name as well as the describe title. Playwright matches `grepInvert`
 * against the full title including the describe, so the describe alone would be enough -- but a test that shows
 * up as `the settings panel, open` when listed individually is a test whose exclusion looks accidental.
 *
 * The output lands in `test-results/`, which is gitignored.
 */
test.describe('screen captures @screenshots', () => {
  test('the main menu @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('menu.png') });
  });

  test('mid-level, with the stage readout on the HUD @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    // Absorb a few so the stage line shows progress rather than zeros.
    await page.evaluate(async () => {
      const g = (window as unknown as { __GB: { game: { spawnBubbleOnPlayer: (r: number) => void } } }).__GB.game;
      for (let i = 0; i < 4; i++) {
        g.spawnBubbleOnPlayer(0.4);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: testInfo.outputPath('playing.png') });
  });

  test('the settings panel, open', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.waitForTimeout(400);

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);
    // Long enough for the pause to take effect and the slider to draw at its current value.
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('settings.png') });
  });

  /**
   * One capture per stage, parked in the same place, so the three can be compared.
   *
   * This is the picture that answers "are the stages distinguishable", and comparing them is the whole point -- a
   * single stage in isolation says nothing about whether a player could tell it from the next one. The bubble is
   * parked at a fixed lane position, so the only differences between the three frames are the ones the stage
   * controls.
   */
  for (const stage of [1, 2, 3]) {
    test(`growth stage ${stage}, parked for comparison @screenshots`, async ({ page }, testInfo) => {
      await boot(page);
      await startFromMenu(page);
      await waitForPhase(page, 'playing');
      await page.evaluate(async (want) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              diagnostics: { stage: { stage: number } };
              spawnBubbleOnPlayer: (r: number) => void;
              demoteStageForTest: () => number;
              debugSetSteadyCruise: () => void;
            };
            player: { x: number; screenY: number };
          };
        }).__GB;
        const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
        let guard = 0;
        while (g.game.diagnostics.stage.stage > want && guard++ < 20) {
          g.game.demoteStageForTest();
          await raf();
        }
        guard = 0;
        while (g.game.diagnostics.stage.stage < want && guard++ < 600) {
          g.game.spawnBubbleOnPlayer(0.4);
          await raf();
        }
        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.45;
      }, stage);
      await page.waitForTimeout(600);
      await page.screenshot({ path: testInfo.outputPath(`stage-${stage}.png`) });
    });
  }

  /**
   * The wheel with a thumb on it, pushed up and to the right.
   *
   * The idle wheel's appearance can be reasoned about from the code; this state cannot, because it is about
   * whether the knob's offset and the pad brightening actually read as "I am pushing this way".
   */
  test('the wheel pushed up and right @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSetSteadyCruise: () => void;
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { wheelGeometry: { x: number; y: number; radius: number } };
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      g.game.debugSetSteadyCruise();
      g.player.x = 0.42;
      g.player.screenY = 0.5;
      const w = g.game.touchRef.wheelGeometry;
      // Up and to the right: clearly deflected, but not pinned to the rim.
      g.game.handlePointerDown(71, w.x + w.radius * 0.6, w.y - w.radius * 0.6);
      for (let i = 0; i < 20; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('wheel-pushed.png') });
  });

  /**
   * The suction field, held open with a few things inside it.
   *
   * The field's whole job is to make "I am gathering right now" unmistakable in peripheral vision while the player
   * watches a fish, and that is a judgement about a picture rather than about a value in a config.
   */
  test('the suction field, held open @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSetSteadyCruise: () => void;
            spawnBubbleOnPlayer: (r: number) => void;
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { skillGeometry: { x: number; y: number } };
            camera: { viewport: { laneWidthMeters: number } };
            diagnostics: { suction: { radiusFraction: number } };
            fieldRef: { bubbles: { x: number; y: number }[] };
          };
          player: { x: number; y: number; volume: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // A grown bubble, so the field is wide enough to see, and a few collectables inside it.
      g.player.volume = 3;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      const lane = g.game.camera.viewport.laneWidthMeters;
      const reach = g.game.diagnostics.suction.radiusFraction;
      for (const [dx, dy] of [
        [-0.7, 0.5],
        [0.75, -0.35],
        [0.2, 0.8],
      ] as const) {
        g.game.spawnBubbleOnPlayer(0.7);
        const list = g.game.fieldRef.bubbles;
        const b = list[list.length - 1]!;
        b.x = g.player.x * lane + lane * reach * dx;
        b.y = g.player.y + lane * reach * dy;
      }

      const button = g.game.touchRef.skillGeometry;
      g.game.handlePointerDown(91, button.x, button.y);
      // Long enough for the inward rings to animate out and for the button to show its held state.
      for (let i = 0; i < 25; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('suction.png') });
  });

  /**
   * A projectile in flight, with a full stomach behind it.
   *
   * Two things worth looking at rather than measuring: whether the spit button on the left reads as the opposite
   * of the suction button on the right, and whether a thrown crab is legible as *something the player threw*
   * rather than as a crab that happens to be moving fast.
   */
  test('a projectile in flight @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (kind: string) => void;
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSetSteadyCruise: () => void;
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 20;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.4;
      // Two kinds, so the picture shows that the ammunition keeps its identity.
      for (const kind of ['crab', 'jelly'] as const) {
        g.game.debugSpawnHazardOnPlayer(kind);
        await raf();
        await raf();
      }

      const b = g.game.touchRef.spitGeometry;
      g.game.handlePointerDown(93, b.x, b.y);
      g.game.handlePointerUp(93);
      // Part-way up the screen, so the shot and its trail are both visible.
      for (let i = 0; i < 4; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('spit.png') });
  });

  /**
   * The bubble over capacity: strained silhouette and the warning rim.
   *
   * The state's whole job is to be legible without reading anything, at a glance, while the player is watching a
   * fish -- so a picture is the only way to judge whether it worked.
   */
  test('the bubble over capacity @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: { debugSpawnHazardOnPlayer: (kind: string) => void; debugSetSteadyCruise: () => void };
          player: { x: number; screenY: number; volume: number };
          mechRef: { spit: { capacity: number } };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 20;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      // Fill the stomach exactly to capacity.
      for (let i = 0; i < g.mechRef.spit.capacity; i++) {
        g.game.debugSpawnHazardOnPlayer('fish');
        await raf();
        await raf();
      }
      // Part-way into the fuse, so the pulse is running but the bubble is not yet bursting.
      for (let i = 0; i < 12; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('overloaded.png') });
  });

  /**
   * A crate and a coral, side by side, with a projectile in flight at them.
   *
   * The two kinds have to be told apart at a glance -- one is worth shooting and one is worth avoiding -- and that
   * is a judgement about a picture. The shot is in frame so the interaction the obstacles exist for is visible.
   */
  test('a crate, a coral, and a shot at them @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSetSteadyCruise: () => void;
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            debugSpawnHazardOnPlayer: (kind: string) => void;
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 8;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.42;
      const lane = g.game.camera.viewport.laneWidthMeters;

      // A crate above, a coral to the side, and ammunition to fire at the crate.
      g.game.debugSpawnObstacleOnPlayer('crate', lane * 0.55);
      g.game.debugSpawnObstacleOnPlayer('coral', lane * 0.55);
      // Offset the coral laterally, since both spawned on the player's column.
      for (const o of (window as unknown as { __GB: { game: { obstaclesRef: { obstacles: { kind: string; x: number; y: number }[] } } } }).__GB.game
        .obstaclesRef.obstacles) {
        if (o.kind === 'coral') o.x = g.player.x * lane + lane * 0.26;
      }

      g.game.debugSpawnHazardOnPlayer('crab');
      await raf();
      await raf();
      const b = g.game.touchRef.spitGeometry;
      g.game.handlePointerDown(93, b.x, b.y);
      g.game.handlePointerUp(93);
      // Part-way to the crate, so both the shot and its trail are in frame.
      for (let i = 0; i < 4; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('obstacles.png') });
  });

  /**
   * The two negative food creatures, loose and side by side.
   *
   * Both have to be recognisable as "not food" from their SILHOUETTE, because that is what the player reads at
   * speed: an urchin is a ball of needles and a bomb fish is a round body with a fuse, and if either of those needs
   * colour to be told apart from a fish, it will not be read at all on a phone in daylight.
   *
   * Parked in a fixed lane position, like the stage captures, so the two can be compared against each other and
   * against whatever the owner changes.
   */
  test('an urchin and a bomb fish, loose @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      /**
       * Small, so NEITHER is edible at this size and both show the "threat" reading.
       *
       * That is the reading worth capturing: a creature the player must decide about has to look like something to
       * avoid first, and both of these are ordinary hazards below their tier. The golden "this is food" halo is
       * already shown on the other creatures by the captures above.
       */
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSetSteadyCruise: () => void;
            debugSpawnHazardOnPlayer: (kind: string) => void;
            hazardsRef: { hazards: { kind: string; x: number; y: number }[] };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; y: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 1;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.3;
      const lane = g.game.camera.viewport.laneWidthMeters;

      for (const [kind, dx, dy] of [
        ['urchin', -0.2, 0.16],
        ['bombfish', 0.2, 0.16],
        ['urchin', -0.2, -0.14],
        ['bombfish', 0.2, -0.14],
      ] as const) {
        g.game.debugSpawnHazardOnPlayer(kind);
        const h = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1]!;
        h.x = g.player.x * lane + lane * dx;
        h.y = g.player.y + lane * dy;
      }
      // Let the urchin needles rotate off their spawn angle so the drawing is not a still frame of one pose.
      for (let i = 0; i < 20; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('negative-food.png') });
  });

  /**
   * A stomach with contents, being compressed, one of them about to go off.
   *
   * The picture that answers "can the player tell what is inside them, and which one is about to explode" -- the
   * only warning a bomb fish gets, and the reason the contents are drawn on the bubble at all.
   *
   * TWO items, not three, and that is deliberate: three is CAPACITY, which lights the over-eating fuse, and the
   * rim then shows that warning instead of the compression colour. The over-full silhouette has its own capture
   * above; this one is for the state the compress control puts the bubble in.
   */
  test('a stomach being compressed, with a bomb about to go off @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; spit: Record<string, number>; stomach: Record<string, number> };
          game: {
            debugSetSteadyCruise: () => void;
            debugSwallowForTest: (kind: string) => number;
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { compressGeometry: { x: number; y: number } };
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 5;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;

      /**
       * The over-eating fuse is pushed out of the way for a different reason than in the capture above: with only
       * two items the stomach is not full, so it would not light anyway -- but a future capacity change should not
       * silently turn this picture into a picture of a different warning. The panic window is widened so the bomb
       * marker is caught BLINKING without waiting out a real fuse at screenshot frame rates.
       *
       * Nothing about the drawing depends on these numbers; they only decide which frame is being photographed.
       */
      g.mechRef.spit.overloadFuseSeconds = 600;
      g.mechRef.hazards.bombfishFuseSeconds = 600;
      g.mechRef.hazards.urchinDrainPerSecond = 0;
      g.mechRef.stomach.fusePanicSeconds = 600;

      g.game.debugSwallowForTest('urchin');
      g.game.debugSwallowForTest('bombfish');

      const button = g.game.touchRef.compressGeometry;
      g.game.handlePointerDown(94, button.x, button.y);
      // Long enough for the rim to be in its compressed colour and the markers to be laid out and blinking.
      for (let i = 0; i < 14; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('stomach.png') });
  });
});
