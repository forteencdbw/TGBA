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

  /**
   * The menu with the VOLATILE bubble selected, so the owner can see the selector and what it says.
   *
   * The load-bearing part of the picture is the bottom two lines: the tagline and the control hint both change with
   * the selection, and whether they read well is a judgement only a person can make.
   */
  test('the menu with the volatile bubble picked @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            menuRef: { geometry: { types: { id: string; rect: { x: number; y: number; w: number; h: number } }[] } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
          };
        };
      }).__GB.game;
      const angry = g.menuRef.geometry.types.find((t) => t.id === 'angry')!;
      const at = { x: angry.rect.x + angry.rect.w / 2, y: angry.rect.y + angry.rect.h / 2 };
      g.handlePointerDown(71, at.x, at.y);
      g.handlePointerUp(71);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('menu-types.png') });
  });

  /**
   * The volatile bubble in the water, at 暴怒 and at 失控.
   *
   * Two frames rather than one because the whole point of the rage palette is that the four stages are told apart
   * at a glance, and "are these two different enough" is exactly the question a screenshot answers and no assertion
   * can.
   */
  for (const [rage, name] of [
    [60, 'angry-furious'],
    [100, 'angry-overload'],
  ] as const) {
    test(`the volatile bubble at ${rage} rage @screenshots`, async ({ page }, testInfo) => {
      await boot(page);
      await page.evaluate(async (amount) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugStartRunWithType: (id: string) => void;
              debugGrantRageForTest: (amount: number) => number;
              debugSetSkillForTest?: () => void;
              obstaclesRef: { obstacles: unknown[] };
              hazardsRef: { hazards: unknown[] };
            };
            player: { volume: number };
          };
        }).__GB;
        const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
        g.game.debugStartRunWithType('angry');
        // A few frames so the intro is over and the bubble is full size: a screenshot of the birth animation would
        // show every rage stage as a small dot.
        for (let i = 0; i < 40; i++) await raf();
        // A volume a real run can reach (the cap is 10), so the picture is of the bubble as it plays rather than of\n        // a diagnostic curiosity: at volume 36 the thing filled most of the screen.\n        g.player.volume = 8;
        g.game.debugGrantRageForTest(amount);
        g.game.hazardsRef.hazards.length = 0;
        g.game.obstaclesRef.obstacles.length = 0;
        for (let i = 0; i < 3; i++) await raf();
      }, rage);
      await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
    });
  }

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
   * The two NEW obstacles, half-torn and half-broken, so the owner can see them without playing to 960m.
   *
   * Four kinds now have to be told apart at a glance, and two of them carry their state in their shape: the net's
   * hole grows as it tears and the wall is a stack rather than a box. Both of those are judgements about a picture,
   * which is why this is a screenshot and not an assertion -- and the net in particular is the one obstacle in the
   * game whose whole interaction is invisible from its numbers alone.
   */
  test('a wall and a half-torn net @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            obstaclesRef: { obstacles: { kind: string; x: number; y: number; healthFraction: number }[] };
            camera: { viewport: { laneWidthMeters: number } };
            levelRef: { scrollSpeed: number };
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // Freeze the water: otherwise the pair sweeps past in half a second and the capture is of empty sea.
      g.game.levelRef.scrollSpeed = 0;
      g.player.volume = 6;
      g.player.x = 0.5;
      // Low on the screen, because both obstacles are placed ABOVE the player and the top of the canvas is where
      // the debug readout lives. The first capture put the net behind that overlay.
      g.player.screenY = 0.62;
      const lane = g.game.camera.viewport.laneWidthMeters;

      g.game.debugSpawnObstacleOnPlayer('wall', lane * 0.2);
      g.game.debugSpawnObstacleOnPlayer('net', lane * 0.2);
      for (const o of g.game.obstaclesRef.obstacles) {
        if (o.kind === 'wall') o.x = g.player.x * lane + lane * 0.18;
        if (o.kind === 'net') o.x = g.player.x * lane - lane * 0.18;
        // Part-torn, so the hole is visible: a whole net and a torn one are the two states worth seeing.
        if (o.kind === 'net') o.healthFraction = 0.55;
      }
      await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('obstacles-new.png') });
  });

  /**
   * The five negative food creatures, loose.
   *
   * All of them have to be recognisable from their SILHOUETTE alone, because that is what the player reads at
   * speed and because they are the creatures the player is meant to make a decision about: an urchin is a ball of
   * needles, a bomb fish is a round body with a fuse, an eel is a long thin S, rot is a lumpy mass, and oil is a
   * flat slick. If any of those needs colour to be told apart from a fish, it will not be read at all on a phone in
   * daylight.
   *
   * Captured at volume 1, so NONE of them is edible and all five show the "threat" reading. That is the reading
   * worth having: below its tier each is an ordinary hazard, and the golden "this is food" halo is already shown on
   * the other creatures by the captures above.
   */
  test('the negative food creatures, loose @screenshots', async ({ page }, testInfo) => {
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
      g.player.screenY = 0.28;
      const lane = g.game.camera.viewport.laneWidthMeters;

      // Two rows of five, spread across the lane, each pair offset so none of them overlaps.
      const layout: readonly (readonly [string, number, number])[] = [
        ['urchin', -0.28, 0.12],
        ['bombfish', 0.0, 0.12],
        ['eel', 0.28, 0.12],
        ['rot', -0.14, -0.12],
        ['oil', 0.16, -0.12],
      ];
      for (const [kind, dx, dy] of layout) {
        g.game.debugSpawnHazardOnPlayer(kind);
        const h = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1]!;
        h.x = g.player.x * lane + lane * dx;
        h.y = g.player.y + lane * dy;
      }
      // Let the eel's weave and the urchin's needles rotate off their spawn pose.
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

  /**
   * The codex, on two tabs.
   *
   * Two rather than one because the tabs differ in shape: the enemy tab is the only one that pages, so it is the one
   * where a card grid can run out of room, and the skill tab is the one with the widest mix of fact lines. Between
   * them they cover the layouts a card has to survive.
   */
  for (const [tab, name] of [
    ['enemy', 'codex-enemies'],
    ['skill', 'codex-skills'],
  ] as const) {
    test(`the codex, on the ${tab} tab @screenshots`, async ({ page }, testInfo) => {
      await boot(page);
      await page.evaluate(async (which) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugOpenCodexForTest: () => void;
              codexRef: { show: (c: string) => void; geometry: { tabs: { id: string; rect: { x: number; y: number; w: number; h: number } }[] } };
              handlePointerDown: (id: number, x: number, y: number) => void;
              handlePointerUp: (id: number) => void;
            };
          };
        }).__GB.game;
        g.debugOpenCodexForTest();
        // Through the page's own tab button, so the capture is of the state a press produces rather than of a state
        // forced from outside.
        const t = g.codexRef.geometry.tabs.find((x) => x.id === which)!;
        g.handlePointerDown(71, t.rect.x + t.rect.w / 2, t.rect.y + t.rect.h / 2);
        g.handlePointerUp(71);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }, tab);
      await page.waitForTimeout(200);
      await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
    });
  }

  /**
   * The rage burst, caught mid-wave with the gauge emptying.
   *
   * The one frame that matters for this verb is the one right after the press: the ring is on its way out, the gauge
   * has just gone to zero, and the creatures around the bubble are either gone or flying away. The wave lasts about a
   * third of a second, so the capture has to be aimed at it rather than waited for -- hence the single `raf` after
   * the press.
   */
  test('the rage burst mid-wave @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugStartRunWithType: (id: string) => void;
            debugGrantRageForTest: (amount: number) => number;
            debugSpawnHazardOnPlayer: (kind: string) => void;
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            useBurstForTest: () => void;
            hazardsRef: { hazards: { kind: string; x: number; y: number }[] };
            obstaclesRef: { obstacles: unknown[] };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; y: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      g.game.debugStartRunWithType('angry');
      // Past the birth animation: a capture during it would show a bubble a quarter of its size.
      for (let i = 0; i < 40; i++) await raf();

      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.volume = 8;
      g.player.x = 0.5;
      g.player.screenY = 0.55;
      g.game.hazardsRef.hazards.length = 0;
      g.game.obstaclesRef.obstacles.length = 0;
      await raf();

      g.game.debugGrantRageForTest(100);
      /**
       * A ring of creatures, 90m out.
       *
       * Outside the bubble's mouth (at volume 8 it reaches about 35m) so they are still there when the wave fires,
       * and well inside the wave, which reaches 307m at full rage.
       */
      const kinds = ['fish', 'jelly', 'urchin', 'eel', 'bombfish', 'trash'];
      const out = 90;
      for (const kind of kinds) g.game.debugSpawnHazardOnPlayer(kind);
      g.game.hazardsRef.hazards.forEach((h, i) => {
        const angle = (i / g.game.hazardsRef.hazards.length) * Math.PI * 2 - Math.PI / 2;
        h.x = g.player.x * lane + Math.cos(angle) * out;
        h.y = g.player.y + Math.sin(angle) * out;
      });
      g.game.debugSpawnObstacleOnPlayer('crate', out + lane * 0.12);
      await raf();

      g.game.useBurstForTest();
      // One frame in, so the ring is part-way out rather than a dot at the centre.
      await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('burst.png') });
  });
});
