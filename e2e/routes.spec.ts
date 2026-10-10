import { expect, test, type Page } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Routes: the identity a run picks in the water, and the boil route's core loop.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS IS GUARDING
 * ---------------------------------------------------------------------------------------------
 * 1. THE BRANCH NODE IS REAL. Every run starts as the SAME base bubble -- no character select -- and its FIRST
 *    level-up offers exactly the three routes the game has, one mandatory pick. Picking one changes the run on
 *    that frame: the controls the touch layer lays out, the palette, what contact with a creature means.
 * 2. THE LOCK AND THE GUARANTEE. The other two routes' cards never appear again in that run, and the first draw
 *    after the pick opens with one of the picked route's own cards -- the choice deepens rather than dilutes.
 * 3. THE BOIL ROUTE'S LOOP CLOSES. Damage earns rage, rage is spent by slamming, and a slam opens the one
 *    thing the base bubble cannot answer at all: a wall.
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const menuGeometry = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: {
        game: {
          menuRef: {
            geometry: {
              button: Rect;
              codex: Rect;
              levels: { id: string; label: string; locked: boolean; selected: boolean; rect: Rect }[];
              tagline: string;
              hint: string;
            };
          };
        };
      };
    }).__GB.game;
    return g.menuRef.geometry;
  });

/** Press the centre of a canvas rectangle through the stage-level path a finger takes. */
const press = async (page: Page, rect: Rect): Promise<void> => {
  await page.evaluate(
    async (at) => {
      const g = (window as unknown as {
        __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void; handlePointerUp: (id: number) => void } };
      }).__GB.game;
      g.handlePointerDown(71, at.x, at.y);
      g.handlePointerUp(71);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    },
    { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 },
  );
};

const state = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: { game: { diagnostics: { bubbleType: unknown; route: string | null; rage: unknown; stage: { name: string }; phase: string } } };
    }).__GB.game;
    return {
      bubbleType: g.diagnostics.bubbleType as {
        id: string;
        name: string;
        controls: string[];
        hasSuction: boolean;
        hasCharge: boolean;
        hasBurst: boolean;
        swallowsHazards: boolean;
      },
      route: g.diagnostics.route,
      rage: g.diagnostics.rage as {
        value: number;
        fraction: number;
        safeSeconds: number;
        charging: boolean;
        aiming: { x: number; y: number };
        slamSeconds: number;
        onSlam: boolean;
        slams: number;
      },
      stageName: g.diagnostics.stage.name,
      phase: g.diagnostics.phase,
    };
  });

test.describe('routes', () => {
  test('the menu has no character select: every run starts as the base bubble', async ({ page }) => {
    await boot(page);

    const offered = await menuGeometry(page);

    /**
     * The menu decides ONE thing now -- which water -- and its geometry says so: a levels row, no types row.
     * A character select that had stopped agreeing with the game would show up here as a row nobody reads.
     */
    expect(offered.levels.length, 'the menu offers the levels to choose between').toBeGreaterThan(0);
    expect(offered.tagline.length, 'and names what every run starts as').toBeGreaterThan(0);
    expect(offered.hint.length, 'and says which controls that uses').toBeGreaterThan(0);

    await press(page, offered.button);
    await waitForPhase(page, 'intro');

    const run = await state(page);
    expect(run.bubbleType.id, 'the run must start as the base bubble').toBe('base');
    expect(run.route, 'with no route picked yet').toBeNull();
    expect(run.bubbleType.controls, 'and only the button every form has').toEqual(['skill']);
  });

  test('the first level-up offers exactly the three routes, and picking one changes the run on that frame', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The branch node, forced: the ladder's real arithmetic with the earning skipped, because farming a level
     * here would be a minute of grazing around the thing under test.
     */
    const offered = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantMutationPoints: (n: number) => number;
            levelupRef: { open: boolean; choiceAt: (i: number) => { id: string; name: string } | null };
            debugRouteIds: () => string[];
            diagnostics: { phase: string; route: string | null };
          };
        };
      }).__GB.game;
      g.debugGrantMutationPoints(200);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return {
        phase: g.diagnostics.phase,
        route: g.diagnostics.route,
        ids: g.debugRouteIds(),
        cards: [0, 1, 2].map((i) => g.levelupRef.choiceAt(i)),
        open: g.levelupRef.open,
      };
    });

    expect(offered.phase, 'the first level must freeze the water for the branch node').toBe('levelup');
    expect(offered.route, 'and no route is picked until a card is').toBeNull();
    expect(offered.ids, 'the game has three routes').toEqual(['devour', 'boil', 'barrage']);
    /**
     * The cards ARE the routes, all three and nothing else: the branch is not one offer among others, it is
     * the panel. A route added to the game but missing from the node would fail against `debugRouteIds`.
     */
    expect(offered.open).toBe(true);
    expect(offered.cards.map((c) => c!.id), 'the branch node offers exactly the routes, in order').toEqual(
      offered.ids.map((id) => `route:${id}`),
    );

    /**
     * Pick 吞噬 with the number key -- the real keyboard path -- and read the run on the frame after.
     */
    await page.keyboard.press('Digit1');
    await page.evaluate(async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    });
    const run = await state(page);
    expect(run.phase, 'the pick closes the panel and resumes the water').toBe('playing');
    expect(run.route, 'and the route is the card that was picked').toBe('devour');
    expect(run.bubbleType.controls, 'the form now carries the suction button').toEqual(['skill', 'suction']);
    expect(run.bubbleType.hasSuction, 'contact with food is a meal now').toBe(true);
    expect(run.bubbleType.swallowsHazards, 'and the mouth is open').toBe(true);
  });

  test('a route pick re-lays the touch layer on the same frame', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => string | null } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'intro');

    const layout = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: {
              controlIds: string[];
              chargeGeometry: { x: number; y: number; radius: number };
            };
          };
        };
      }).__GB.game;
      return {
        controlIds: [...g.touchRef.controlIds],
        charge: g.touchRef.chargeGeometry,
      };
    });

    /**
     * The control LIST is the thing under test, not the geometry.
     *
     * `layout` computes a position for every button whether or not the form uses it, so the geometry being non-zero
     * proves nothing. What proves the mid-run swap works is that the list changed WITH the pick -- this run started
     * as the base bubble (one button) and the boil route added two more without a restart.
     *
     * Nothing in the list is MOVEMENT: a phone steers by dragging anywhere on the screen, which needs no button and
     * therefore no id. See `src/touch.ts`.
     */
    expect(layout.controlIds).toEqual(['skill', 'charge', 'burst']);
    expect(layout.charge.radius, 'the charge button must have a real size to press').toBeGreaterThan(0);
  });

  test('a picked route locks the other two, and the next draw opens with one of its own cards', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => string | null } } }).__GB.game.debugStartRunWithRoute('devour'));
    await waitForPhase(page, 'playing');

    /**
     * One level banked, spent on the route's own card: the guarantee says the FIRST draw after the pick
     * contains one of them, so the identity the player just bought is deepened rather than diluted into
     * three universals.
     */
    const first = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantMutationPoints: (n: number) => number;
            levelupRef: { open: boolean; choiceAt: (i: number) => { id: string; name: string } | null };
            input: { consumeLevelUpChoice: () => void };
            diagnostics: { phase: string; route: string | null };
          };
        };
      }).__GB;
      g.game.debugGrantMutationPoints(200);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return { phase: g.game.diagnostics.phase, cards: [0, 1, 2].map((i) => g.game.levelupRef.choiceAt(i)) };
    });
    expect(first.phase).toBe('levelup');
    const own = ['suction', 'eatInvuln', 'appetite'];
    expect(
      first.cards.some((c) => c && own.includes(c.id)),
      'the draw right after the pick must contain one of the route\'s own cards',
    ).toBe(true);
    expect(
      first.cards.some((c) => c && (c.id.startsWith('route:') || c.id === 'rage' || c.id === 'burstRadius' || c.id === 'simmer' || c.id === 'bulletSpeed' || c.id === 'bulletRadius' || c.id === 'bulletRange')),
      'and never a card from the other two routes',
    ).toBe(false);

    /**
     * And the lock holds for every draw after: a second level, same question -- the other routes' cards are
     * structurally absent, because the pool filters by the run's route.
     */
    await page.keyboard.press('Digit1');
    await page.evaluate(async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    });
    const second = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantMutationPoints: (n: number) => number;
            levelupRef: { choiceAt: (i: number) => { id: string; name: string } | null };
            diagnostics: { phase: string };
          };
        };
      }).__GB.game;
      g.debugGrantMutationPoints(200);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return { phase: g.diagnostics.phase, cards: [0, 1, 2].map((i) => g.levelupRef.choiceAt(i)) };
    });
    expect(second.phase).toBe('levelup');
    expect(
      second.cards.every((c) => !c || !c.id.startsWith('route:')),
      'the route cards never come back -- the choice was the run\'s one identity decision',
    ).toBe(true);
  });

  test('the base bubble earns no rage from damage, and the devour route does not add one', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await state(page);
    expect(run.bubbleType.id, 'the run starts as the base bubble').toBe('base');
    expect(run.bubbleType.controls, 'with exactly the one button every form has').toEqual(['skill']);
    expect(run.bubbleType.hasSuction, 'no field before the route is picked').toBe(false);
    expect(run.bubbleType.hasCharge, 'and no charge verb').toBe(false);

    /**
     * And being hit earns nothing, because the base has no resource to earn.
     *
     * This is the assertion that keeps the boil route from leaking into every other run: `takeHit` is the single
     * place a hit lands, and a rage gain wired in unconditionally there would silently make every bubble carry
     * a meter only the boil route can spend.
     */
    const afterHits = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: { game: { debugForceHit: () => void; diagnostics: { rage: { value: number } } } };
      }).__GB.game;
      for (let i = 0; i < 3; i++) {
        g.debugForceHit();
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
      return g.diagnostics.rage.value;
    });
    expect(afterHits, 'the base bubble must gain no rage from damage').toBe(0);
  });

  test('rage comes from surviving damage, and decays once the bubble is left alone', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const c = await page.evaluate(() => {
      const m = (window as unknown as { __GB: { mechRef: { angry: { rage: { perHit: number; decayPerSecond: number; decayDelaySeconds: number; max: number } } } } }).__GB.mechRef;
      return m.angry.rage;
    });

    const progression = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: { game: { debugForceHit: () => void; diagnostics: { rage: { value: number; stageName: string }; stats: { hits: number } } } };
      }).__GB.game;
      const stages: { rage: number; name: string }[] = [];
      for (let i = 0; i < 4; i++) {
        const before = g.diagnostics.stats.hits;
        g.debugForceHit();
        // The hit path is guarded by invulnerability at some sources and not others; `debugForceHit` applies it
        // directly, so waiting a frame is enough for the gain to land.
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        void before;
        stages.push({ rage: g.diagnostics.rage.value, name: g.diagnostics.rage.stageName });
      }
      return stages;
    });

    console.log(`rage progression: ${JSON.stringify(progression)} (perHit ${c.perHit})`);
    expect(progression[0]!.rage, 'one hit must be worth exactly one hit\'s rage').toBeCloseTo(c.perHit, 1);
    expect(progression[3]!.rage, 'and four hits must reach the cap').toBeCloseTo(c.max, 1);
    // The stage name follows, which is what the HUD and the bubble's own colour read.
    expect(progression[0]!.name, 'and the stage label must change with it').not.toBe(progression[3]!.name);

    /**
     * Then the decay, measured rather than assumed.
     *
     * Rage holds for `decayDelaySeconds` and then falls at `decayPerSecond`, so the assertion is in two parts: it
     * must NOT fall while the delay is running, and it must fall afterwards. The first half is the one that matters
     * -- a decay with no delay would make the whole system a race against the clock rather than a reward for
     * surviving.
     */
    const decay = await page.evaluate(async (delay) => {
      const g = (window as unknown as {
        __GB: { game: { diagnostics: { rage: { value: number; safeSeconds: number }; gameSeconds: number } } };
      }).__GB.game;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      // Wait out most of the delay, and check it has not moved.
      const t0 = g.diagnostics.gameSeconds;
      while (g.diagnostics.gameSeconds - t0 < delay * 0.6) await raf();
      const held = g.diagnostics.rage.value;
      // Then wait well past the delay for the fall.
      const t1 = g.diagnostics.gameSeconds;
      while (g.diagnostics.gameSeconds - t1 < delay + 1.4) await raf();
      return { held, after: g.diagnostics.rage.value, safe: g.diagnostics.rage.safeSeconds };
    }, c.decayDelaySeconds);

    console.log(`rage decay: ${JSON.stringify(decay)} (delay ${c.decayDelaySeconds}s, -${c.decayPerSecond}/s)`);
    expect(decay.held, 'rage must hold while the safe-time delay is still running').toBeCloseTo(c.max, 1);
    expect(decay.after, 'and must fall once the bubble has been left alone').toBeLessThan(decay.held);
  });

  test('the charge slams a wall that no volume can ram, and spends rage doing it', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            debugGrantRageForTest: (amount: number) => number;
            touchRef: { chargeGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: {
              obstacles: { broken: number; active: number };
              rage: { value: number; slams: number; onSlam: boolean; slamSeconds: number; charging: boolean; aiming: { x: number; y: number } };
              stats: { hits: number };
            };
            hazardsRef: { hazards: unknown[] };
            obstaclesRef: { obstacles: unknown[] };
            levelRef: { scrollSpeed: number };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; screenY: number; volume: number };
          mechRef: { angry: { rage: { max: number } } };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      /**
       * Freeze the water first: the player is carried up the level at the scroll speed, so a spawned obstacle is
       * behind them in half a second and contact can never be studied. See the obstacles spec, where the same
       * mistake produced a net that "took twelve seconds to tear".
       */
      const scroll = g.game.levelRef.scrollSpeed;
      g.game.levelRef.scrollSpeed = 0;
      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;
      await raf();

      /**
       * NEAR full rage, not full, and that distinction is the whole test.
       *
       * A full gauge puts the bubble into OVERLOAD now, and the overload smashes barriers by itself -- so a wall
       * spawned on an overloaded bubble is broken by the state rather than by the charge, the loop's baseline is
       * already stale when it starts, and the test reports that letting go never opened a slam window. Fifteen under
       * the cap is still a strong slam (the damage is 2.3 of 2.5) with the charge as the only thing acting.
       */
      g.game.debugGrantRageForTest(g.mechRef.angry.rage.max - 15);
      const rageBefore = g.game.diagnostics.rage.value;

      /**
       * A wall: `ramVolume` is null, so NO volume smashes it. The boil route's answer is the charge.
       *
       * Spawned AHEAD rather than on the player, and that is not tidiness. A wall in contact during the wind-up
       * charges a hit point, and a hit is +25 rage -- which pushed this test's near-full gauge straight to the cap,
       * started the OVERLOAD, and let the overload's free smash break the wall before the release. The test then
       * reported that letting go never opened a slam window, which was true and had nothing to do with the charge.
       * Out of reach, the only thing acting on the wall is the verb under test; the dash carries the bubble into it.
       */
      g.game.debugSpawnObstacleOnPlayer('wall', lane * 0.22);
      const brokeBefore = g.game.diagnostics.obstacles.broken;

      // Hold the real button, then let go: the verb lives on the release.
      const c = g.game.touchRef.chargeGeometry;
      g.game.handlePointerDown(77, c.x, c.y);
      await raf();
      await raf();
      const holding = g.game.diagnostics.rage;
      /**
       * The hit count is read HERE, after the wind-up and before the release.
       *
       * Winding up while pressed against a wall costs a hit point, and it should: the slam window is not open yet, so
       * an ordinary wall is still an ordinary wall. Counting from before the press would charge that hit to the slam.
       */
      const hitsBeforeSlam = g.game.diagnostics.stats.hits;
      g.game.handlePointerUp(77);

      let sawSlamWindow = false;
      let frames = 0;
      /** Hits taken by the moment the wall broke, which is the window the slam is responsible for. */
      let hitsAtBreak = -1;
      while (g.game.diagnostics.obstacles.broken === brokeBefore && frames < 90) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        frames++;
        if (g.game.diagnostics.rage.onSlam) sawSlamWindow = true;
        if (hitsAtBreak < 0 && g.game.diagnostics.obstacles.broken > brokeBefore) {
          hitsAtBreak = g.game.diagnostics.stats.hits - hitsBeforeSlam;
        }
      }

      const out = {
        rageBefore,
        broke: g.game.diagnostics.obstacles.broken - brokeBefore,
        hits: g.game.diagnostics.stats.hits - hitsBeforeSlam,
        hitsAtBreak,
        raged: g.game.diagnostics.rage.value,
        slams: g.game.diagnostics.rage.slams,
        frames,
        sawSlamWindow,
        aim: { ...holding.aiming },
        wasCharging: holding.charging,
      };
      g.game.levelRef.scrollSpeed = scroll;
      return out;
    });

    console.log(`wall slam: ${JSON.stringify(result)}`);
    expect(result.wasCharging, 'holding the charge button must wind the bubble up').toBe(true);
    expect(result.sawSlamWindow, 'and letting go must open a slam window').toBe(true);
    expect(result.broke, 'a slam must break the wall that no volume can ram').toBeGreaterThan(0);
    expect(result.slams, 'and must be counted as connected, not merely fired').toBeGreaterThan(0);
    /**
     * No hit point by the time the wall broke -- measured AT THE BREAK, not at the end of the run.
     *
     * The distinction is the mechanic rather than a convenience: a slam is the player's own committed attack and
     * costs nothing, but the window lasts `slamSeconds` and then the ordinary rules come back. Standing against a
     * wall with the window closed is a wall again, and a wall that stops you costs a hit -- which is what the
     * end-of-run count picks up. Asserting zero for the whole run would be asserting that a wall stops being one.
     */
    expect(result.hitsAtBreak, 'a slam is the player\'s own attack: it must not cost a hit point').toBe(0);
    expect(result.raged, 'and it must be paid for in rage').toBeLessThan(result.rageBefore);
  });

  test('the rage burst clears the small creatures, pushes the sharp ones, and spends the whole gauge', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (kind: string) => void;
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            debugGrantRageForTest: (amount: number) => number;
            touchRef: { burstGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: {
              obstacles: { broken: number; active: number; byKind: Record<string, number> };
              stage: { radiusFraction: number };
              rage: { value: number; bursts: number; lastBurstKills: number; lastBurstPushes: number; burstRadiusMeters: number; waveAlive: boolean };
            };
            hazardsRef: { hazards: { kind: string; x: number; y: number }[] };
            obstaclesRef: { obstacles: unknown[] };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; y: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;
      // An empty field, so the counts belong to the burst: a leftover from an earlier test would be scenery that is
      // also a measurement.
      g.game.obstaclesRef.obstacles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      await raf();

      g.game.debugGrantRageForTest(100);
      const rageBefore = g.game.diagnostics.rage.value;

      /**
       * Four creatures and two obstacles, all INSIDE the wave and outside arm's reach.
       *
       * The offset is not tidiness, it is the difference between a measurement and a meal: the creatures are chosen
       * to cover both halves of the design's rule (a fish and a jellyfish are clearable, an urchin and an eel are
       * pushed), and the first version of this spawned them ON the player -- who ate all four inside the single frame
       * before the burst, leaving the wave nothing to do and the test reporting that it had cleared nothing. The
       * crate had the same problem in reverse: at volume 6 the player RAMS it (the threshold is 4), so it broke
       * before the baseline and the wave got no credit.
       */
      for (const kind of ['fish', 'jelly', 'urchin', 'eel']) g.game.debugSpawnHazardOnPlayer(kind);
      /**
       * Out of arm's reach, measured rather than guessed.
       *
       * The bubble is not small -- at volume 6 its radius is 29 metres -- and a creature's own radius adds to that,
       * so the first offsets tried here were still inside its mouth and it ate the jellyfish, the urchin and the eel
       * before the wave fired. The margin has to clear the LARGEST creature (a jellyfish reaches 51.5m at this
       * size), which is why it is a fifth of the lane rather than a hair over the bubble's own edge.
       */
      const clearOfMouth = g.game.diagnostics.stage.radiusFraction * lane + lane * 0.2;
      for (const h of g.game.hazardsRef.hazards) {
        h.x = g.player.x * lane;
        h.y = g.player.y + clearOfMouth;
      }
      g.game.debugSpawnObstacleOnPlayer('crate', clearOfMouth + lane * 0.14);
      g.game.debugSpawnObstacleOnPlayer('wall', clearOfMouth + lane * 0.3);
      await raf();

      const before = {
        hazards: g.game.hazardsRef.hazards.length,
        broken: g.game.diagnostics.obstacles.broken,
        /**
         * The POSITION, not the hazard.
         *
         * Storing the object and reading `before.urchin.y` afterwards reads the same live object the wave just moved,
         * so the delta was zero however hard it was shoved -- a measurement that agreed with itself.
         */
        urchinY: g.game.hazardsRef.hazards.find((h) => h.kind === 'urchin')?.y ?? 0,
        walls: g.game.diagnostics.obstacles.byKind.wall ?? 0,
      };

      // The real button.
      const b = g.game.touchRef.burstGeometry;
      g.game.handlePointerDown(78, b.x, b.y);
      g.game.handlePointerUp(78);
      await raf();

      const after = {
        hazards: g.game.hazardsRef.hazards.length,
        kills: g.game.diagnostics.rage.lastBurstKills,
        pushes: g.game.diagnostics.rage.lastBurstPushes,
        bursts: g.game.diagnostics.rage.bursts,
        rage: g.game.diagnostics.rage.value,
        broken: g.game.diagnostics.obstacles.broken - before.broken,
        walls: g.game.diagnostics.obstacles.byKind.wall ?? 0,
        radius: g.game.diagnostics.rage.burstRadiusMeters,
        waveAlive: g.game.diagnostics.rage.waveAlive,
      };
      return {
        rageBefore,
        beforeHazards: before.hazards,
        afterHazards: after.hazards,
        urchinPushed: Math.abs((g.game.hazardsRef.hazards.find((h) => h.kind === 'urchin')?.y ?? 0) - before.urchinY),
        ...after,
        wallsBefore: before.walls,
      };
    });

    console.log(`burst: ${JSON.stringify(result)}`);
    expect(result.bursts, 'pressing the burst button must fire the verb').toBe(1);
    expect(result.waveAlive, 'and must leave a wave on screen to show how far it reached').toBe(true);
    expect(result.kills, 'it must clear the small creatures in range').toBeGreaterThanOrEqual(2);
    expect(result.pushes, 'and push the sharp ones it cannot clear').toBeGreaterThanOrEqual(2);
    expect(result.afterHazards, 'so the clearable ones are gone and the others are still there').toBeLessThan(result.beforeHazards);
    expect(result.urchinPushed, 'a pushed creature must actually move').toBeGreaterThan(1);
    expect(result.broken, 'the wave must shatter the fragile crate').toBeGreaterThan(0);
    expect(result.walls, 'but leave the wall standing -- opening masonry is the SLAM\'s answer').toBe(result.wallsBefore);
    expect(result.rage, 'and it costs the WHOLE gauge').toBe(0);
    expect(result.rageBefore, 'having had something to spend').toBeGreaterThan(0);
  });

  test('the burst is wider the more rage it spends', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    /**
     * The design's one stated scaling rule for the burst: "怒气越高，范围越大".
     *
     * Measured at three amounts rather than two, because two points on a line cannot tell a scale from a step. Each is
     * read from the game's own radius, which is the number the effects are applied with.
     */
    const radii = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantRageForTest: (amount: number) => number;
            useBurstForTest: () => void;
            diagnostics: { rage: { burstRadiusMeters: number; value: number } };
          };
          mechRef: { angry: { rage: { max: number } } };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      const out: { rage: number; radius: number }[] = [];
      for (const amount of [10, 50, 100]) {
        g.game.debugGrantRageForTest(amount);
        out.push({ rage: g.game.diagnostics.rage.value, radius: g.game.diagnostics.rage.burstRadiusMeters });
        g.game.useBurstForTest();
        await raf();
      }
      return out;
    });

    console.log(`burst radii: ${JSON.stringify(radii)}`);
    expect(radii[1]!.radius, 'more rage must mean a wider wave').toBeGreaterThan(radii[0]!.radius);
    expect(radii[2]!.radius, 'and the widest at full').toBeGreaterThan(radii[1]!.radius);
  });

  test('a full gauge starts an overload, and letting the clock run out wounds without killing', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const c = await page.evaluate(() => {
      const m = (window as unknown as { __GB: { mechRef: { angry: { overload: { seconds: number; steerFactor: number } } } } }).__GB.mechRef;
      return m.angry.overload;
    });

    const run = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantRageForTest: (amount: number) => number;
            debugSetSteadyCruise: () => void;
            diagnostics: {
              rage: { value: number; overloaded: boolean; overloadLeft: number };
              stats: { overloads: number };
              gameSeconds: number;
            };
            hazardsRef: { hazards: unknown[] };
          };
          player: { volume: number; slowFactor: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.game.debugSetSteadyCruise();
      g.game.hazardsRef.hazards.length = 0;
      g.player.volume = 6;
      await raf();
      const volumeBefore = g.player.volume;
      const overloadsBefore = g.game.diagnostics.stats.overloads;

      /**
       * Fill the gauge through `gainRage`, which is the same path a hit takes to reach the cap.
       *
       * `debugForceHit` is NOT used here: a hit also resets the safe-time clock, needs four of them at the configured
       * per-hit value, and would fold the damage it does into the volume this test is measuring.
       */
      g.game.debugGrantRageForTest(100);
      await raf();
      const started = { overloaded: g.game.diagnostics.rage.overloaded, left: g.game.diagnostics.rage.overloadLeft };

      // The steering penalty, sampled while overloaded: the same slow the net drag uses.
      g.game.hazardsRef.hazards.length = 0;
      await raf();
      const slowest = g.player.slowFactor;

      const t0 = g.game.diagnostics.gameSeconds;
      while (g.game.diagnostics.rage.overloaded && g.game.diagnostics.gameSeconds - t0 < 8) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
      }
      return {
        volumeBefore,
        started,
        slowest,
        elapsed: +(g.game.diagnostics.gameSeconds - t0).toFixed(2),
        stillOverloaded: g.game.diagnostics.rage.overloaded,
        rageAfter: g.game.diagnostics.rage.value,
        volumeAfter: g.player.volume,
        overloads: g.game.diagnostics.stats.overloads - overloadsBefore,
      };
    });

    console.log(`overload: ${JSON.stringify(run)} (config ${JSON.stringify(c)})`);
    expect(run.started.overloaded, 'a full gauge must put the bubble into overload').toBe(true);
    expect(run.started.left, 'with a countdown running').toBeGreaterThan(0);
    expect(run.elapsed, 'which lasts about as long as the config says').toBeGreaterThan(c.seconds * 0.6);
    expect(run.elapsed, 'and no longer').toBeLessThan(c.seconds + 2);
    expect(run.stillOverloaded, 'and it must be over when it is over').toBe(false);
    expect(run.slowest, 'the bubble must be harder to steer while it lasts').toBeLessThan(c.steerFactor + 0.05);

    expect(run.overloads, 'an expired overload must be counted').toBe(1);
    expect(run.rageAfter, 'and must empty the gauge').toBe(0);
    expect(run.volumeAfter, 'and must cost real volume').toBeLessThan(run.volumeBefore);
    /**
     * But never the run. The document is explicit -- "it does NOT end the game, it takes a heavy wound" -- and this is
     * the assertion that keeps the guard rail honest, since three hit points is enough to kill a small bubble and the
     * punishment stops while one is left.
     */
    expect(run.volumeAfter, 'and must NOT be able to kill the bubble').toBeGreaterThan(0);
  });

  test('the burst releases the overload, and so does breaking something large', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantRageForTest: (amount: number) => number;
            debugSetSteadyCruise: () => void;
            useBurstForTest: () => void;
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            diagnostics: {
              rage: { overloaded: boolean; value: number };
              obstacles: { broken: number };
            };
            hazardsRef: { hazards: unknown[] };
            obstaclesRef: { obstacles: unknown[] };
            levelRef: { scrollSpeed: number };
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;

      /** First escape route: the burst, which is the one the player always has. */
      g.game.debugGrantRageForTest(100);
      await raf();
      const beforeBurst = g.game.diagnostics.rage.overloaded;
      g.game.useBurstForTest();
      await raf();
      const afterBurst = { overloaded: g.game.diagnostics.rage.overloaded, rage: g.game.diagnostics.rage.value };

      /**
       * Second: smashing something LARGE while overloaded.
       *
       * A wall, because it is the largest thing the bubble can meet and volume cannot ram it at all -- so the only
       * way to break it here is the overload's own smash, which is exactly the document's "can destroy most ordinary
       * obstacles". The scroll is frozen so the wall stays on the player instead of being carried away.
       */
      const scroll = g.game.levelRef.scrollSpeed;
      g.game.levelRef.scrollSpeed = 0;
      g.game.obstaclesRef.obstacles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      g.game.debugGrantRageForTest(100);
      await raf();
      const beforeSmash = g.game.diagnostics.rage.overloaded;
      g.game.debugSpawnObstacleOnPlayer('wall', 0);
      const brokeBefore = g.game.diagnostics.obstacles.broken;
      let frames = 0;
      while (g.game.diagnostics.rage.overloaded && frames < 90) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        frames++;
      }
      const afterSmash = {
        overloaded: g.game.diagnostics.rage.overloaded,
        broke: g.game.diagnostics.obstacles.broken - brokeBefore,
      };

      // A crate, for contrast: smashing something SMALL is not a release.
      g.game.obstaclesRef.obstacles.length = 0;
      g.game.debugGrantRageForTest(100);
      await raf();
      g.game.debugSpawnObstacleOnPlayer('crate', 0);
      for (let i = 0; i < 6; i++) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
      }
      const afterCrate = { overloaded: g.game.diagnostics.rage.overloaded, obstacles: g.game.obstaclesRef.obstacles.length };
      g.game.levelRef.scrollSpeed = scroll;
      return { beforeBurst, afterBurst, beforeSmash, afterSmash, afterCrate };
    });

    console.log(`overload escapes: ${JSON.stringify(result)}`);
    expect(result.beforeBurst, 'the burst test needs an overload to release').toBe(true);
    expect(result.afterBurst.overloaded, 'using the burst must release the overload').toBe(false);
    expect(result.afterBurst.rage, 'and spend the gauge doing it').toBe(0);

    expect(result.beforeSmash, 'and so does the smash test').toBe(true);
    expect(result.afterSmash.broke, 'an overloaded bubble must break a wall by ramming it').toBeGreaterThan(0);
    expect(result.afterSmash.overloaded, 'breaking something LARGE must release the overload').toBe(false);

    /**
     * Breaking something SMALL is not a release.
     *
     * The document's list is "smash a LARGE target, a cold current, split, or burst" -- a crate is none of those, and
     * if it counted, the overload would end the moment the player bumped into scenery, which is not a decision.
     */
    expect(result.afterCrate.overloaded, 'breaking a crate must NOT be a release').toBe(true);
  });

  test('every route either eats a creature on the spot, or cannot eat it at all', async ({ page }) => {
    await boot(page);

    /**
     * The rule the swallow rework left behind, now asked of ROUTES.
     *
     * There is no inventory any more: a creature a form can eat is consumed the moment it touches, and a form
     * that cannot eat it takes the hit instead. So the per-route switch has exactly two honest outcomes, and this
     * is the test that keeps it honest: for EVERY route, a fish parked on the bubble at a size that could eat it
     * must either be gone within a few frames or never count as eaten -- never stored, never delayed.
     */
    const routes = await page.evaluate(() =>
      (window as unknown as { __GB: { game: { debugRouteIds: () => string[] } } }).__GB.game.debugRouteIds(),
    );
    expect(routes.length, 'there must be routes to check').toBeGreaterThan(0);

    for (const id of routes) {
      const result = await page.evaluate(async (typeId) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugStartRunWithRoute: (id: string) => string | null;
              debugSpawnHazardOnPlayer: (kind: string) => void;
              debugSetSteadyCruise: () => void;
              diagnostics: {
                bubbleType: { id: string; swallowsHazards: boolean };
                hazards: { eaten: number };
              };
              hazardsRef: { hazards: unknown[] };
            };
            player: { x: number; screenY: number; volume: number };
          };
        }).__GB;
        const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
        g.game.debugStartRunWithRoute(typeId);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.5;
        // Big enough that the tier rule would let a swallow-type eat a fish (fish needs tier 2, volume 2.2).
        g.player.volume = 6;
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        const before = g.game.diagnostics.hazards.eaten;
        g.game.debugSpawnHazardOnPlayer('fish');
        // A few frames is the whole point: instant means no waiting for a charge, a fuse, or an inventory.
        for (let i = 0; i < 5; i++) await raf();
        return {
          swallows: g.game.diagnostics.bubbleType.swallowsHazards,
          eaten: g.game.diagnostics.hazards.eaten - before,
        };
      }, id);
      if (result.swallows) {
        expect(result.eaten, `the ${id} route swallows, so a fish on it must be eaten on the spot`).toBeGreaterThan(0);
      } else {
        expect(result.eaten, `the ${id} route cannot swallow, so nothing may count as eaten`).toBe(0);
      }
    }
  });

  test('the boil route cannot eat creatures: an enemy it touches hurts it instead of feeding it', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (kind: string) => void;
            debugSetSteadyCruise: () => void;
            /** Pinned below: the run's talent is rolled, and fish-fart's bait makes fish contacts harmless. */
            debugSetTalent: (id: string) => string;
            /** And the bait beat is on by default, which makes one contact in four deal nothing at all. */
            debugSetBaitEnabled: (on: boolean) => boolean;
            diagnostics: {
              phase: string;
              stats: { hits: number; ended: number };
              hazards: { eaten: number };
              bubbleType: { swallowsHazards: boolean };
              gameSeconds: number;
            };
            hazardsRef: { hazards: { x: number; y: number }[] };
            levelRef: { scrollSpeed: number };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; y: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // Frozen water, so the creatures stay on the bubble instead of being carried away.
      const scroll = g.game.levelRef.scrollSpeed;
      g.game.levelRef.scrollSpeed = 0;
      g.game.debugSetSteadyCruise();
      /**
       * A neutral talent, because the run's own is ROLLED and fish-fart changes what a contact does: it fires on the
       * hit that would have landed and leaves bait, and a fish crossing bait is distracted into dealing no damage.
       * Measured with it in play, this test's "contact must hurt" came out 2 hits in 10 contacts.
       */
      g.game.debugSetTalent('soda');
      /**
       * And the bait beat itself, which is NOT the talent: `baitEnabled` is true by default and gives every fish
       * contact a 1-in-4 chance of being "the fish wandered off" instead of a hit. A test that counts hits has to
       * turn that off or it fails a quarter of the time on both projects.
       */
      g.game.debugSetBaitEnabled(false);
      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      // Comfortably big enough that the DEVOUR bubble would eat a fish (tier 1 needs volume 2.2).
      g.player.volume = 6;
      g.game.hazardsRef.hazards.length = 0;
      await raf();

      const before = { hits: g.game.diagnostics.stats.hits, eaten: g.game.diagnostics.hazards.eaten, ended: g.game.diagnostics.stats.ended };

      /**
       * Five creatures, so one lucky dodge or one harmless contact cannot decide the result.
       */
      for (const kind of ['fish', 'jelly', 'trash', 'crab', 'urchin']) g.game.debugSpawnHazardOnPlayer(kind);
      g.game.hazardsRef.hazards.forEach((h, i) => {
        const angle = (i / 5) * Math.PI * 2;
        h.x = g.player.x * lane + Math.cos(angle) * lane * 0.04;
        h.y = g.player.y + Math.sin(angle) * lane * 0.04;
      });

      const t0 = g.game.diagnostics.gameSeconds;
      // Long enough that any delayed consequence of contact would have landed.
      while (g.game.diagnostics.gameSeconds - t0 < 11) await raf();

      const out = {
        swallowsHazards: g.game.diagnostics.bubbleType.swallowsHazards,
        eatenByField: g.game.diagnostics.hazards.eaten - before.eaten,
        hits: g.game.diagnostics.stats.hits - before.hits,
        ended: g.game.diagnostics.stats.ended - before.ended,
        phase: g.game.diagnostics.phase,
      };
      g.game.levelRef.scrollSpeed = scroll;
      return out;
    });

    console.log(`volatile bubble vs creatures: ${JSON.stringify(result)}`);
    expect(result.swallowsHazards, 'the boil route must declare that it cannot eat creatures').toBe(false);
    expect(result.eatenByField, 'and the field must never report a creature as eaten').toBe(0);
    expect(result.hits, 'contact with an enemy must HURT it -- that is where its rage comes from').toBeGreaterThan(0);
    /**
     * And the run must survive creatures it cannot eat. A type that takes its hits as hits -- rather than storing
     * them somewhere they cannot be answered -- has no second way to die from a crowd.
     */
    expect(result.ended, 'and it must not have died to the crowd').toBe(0);
    expect(result.phase, 'the run must still be running').toBe('playing');
  });

  test('the devour bubble in the same situation DOES eat, which is the difference', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The contrast, because "the boil route cannot eat creatures" is only a design decision if the other bubble
     * still can. One creature, a few frames: the eat is instant, so what rises is the eaten count and the volume.
     */
    const eaten = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (kind: string) => void;
            debugSetSteadyCruise: () => void;
            diagnostics: { hazards: { eaten: number }; bubbleType: { swallowsHazards: boolean } };
            hazardsRef: { hazards: unknown[] };
          };
          player: { x: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;
      const volumeBefore = g.player.volume;
      g.game.hazardsRef.hazards.length = 0;
      await raf();
      const before = g.game.diagnostics.hazards.eaten;
      g.game.debugSpawnHazardOnPlayer('fish');
      for (let i = 0; i < 4; i++) await raf();
      return {
        eaten: g.game.diagnostics.hazards.eaten - before,
        volume: g.player.volume - volumeBefore,
        swallowsHazards: g.game.diagnostics.bubbleType.swallowsHazards,
      };
    });

    expect(eaten.swallowsHazards, 'the devour bubble can eat creatures').toBe(true);
    expect(eaten.eaten, 'and a fish on top of it is eaten, immediately').toBeGreaterThan(0);
    expect(eaten.volume, 'and the meal shows up as volume in the same breath').toBeGreaterThan(0);
  });

  test('the aim locks while winding up, so a released drag still slams where it was pointed', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithRoute: (id: string) => void } } }).__GB.game.debugStartRunWithRoute('boil'));
    await waitForPhase(page, 'playing');

    const aim = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { chargeGeometry: { x: number; y: number } };
            canvasSize: { width: number; height: number };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerMove: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: { rage: { aiming: { x: number; y: number }; charging: boolean } };
          };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const c = g.game.touchRef.chargeGeometry;
      const startX = g.game.canvasSize.width * 0.5;
      const startY = g.game.canvasSize.height * 0.4;

      /**
       * Drag LEFT with one thumb, wind up with the other, then let go of the drag.
       *
       * Two pointers, because that is the gesture: one hand steers (which is also how the aim is chosen now that the
       * wheel is gone), the other holds the charge button. The aim is captured WHILE CHARGING -- it follows the drag
       * until the finger lifts and then holds -- which is why the first reading is taken after the wind-up starts.
       */
      g.game.handlePointerDown(31, startX, startY);
      g.game.handlePointerMove(31, startX - 60, startY);
      await raf();

      g.game.handlePointerDown(32, c.x, c.y);
      await raf();
      const whileHeld = { ...g.game.diagnostics.rage.aiming };

      // Let go of the DRAG only. The charge is still being wound.
      g.game.handlePointerUp(31);
      await raf();

      const locked = { ...g.game.diagnostics.rage.aiming };
      const stillCharging = g.game.diagnostics.rage.charging;
      g.game.handlePointerUp(32);
      await raf();
      return { whileHeld, locked, stillCharging };
    });

    console.log(`aim: ${JSON.stringify(aim)}`);
    expect(aim.whileHeld.x, 'dragging left while winding must aim left').toBeLessThan(-0.5);
    expect(aim.stillCharging, 'releasing the drag must not release the charge').toBe(true);
    expect(aim.locked.x, 'and the aim must LOCK at that direction once the finger is let go').toBeLessThan(-0.5);
    expect(Math.abs(aim.locked.y), 'with no drift sideways').toBeLessThan(0.3);
  });

  /**
   * The barrage route's grant: a gun one row WIDER, on the frame of the pick.
   *
   * The route adds no button -- its verb is the gun the base bubble already had -- so the one thing that must
   * land on the pick is the one thing its card promises. The plain bubble used to live here; its one-hit rule
   * went with the character select, because a route is something ADDED to the base and "fewer hit points than
   * the base" is not a route.
   */
  test('the barrage route grants a wider gun on the spot, and no new buttons', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const outcome = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantMutationPoints: (n: number) => number;
            debugRouteIds: () => string[];
            levelupRef: { choiceAt: (i: number) => { id: string } | null };
            input: { consumeLevelUpChoice: () => void };
            touchRef: { controlIds: string[] };
            diagnostics: {
              phase: string;
              route: string | null;
              bullets: { gunStreams: number; armed: boolean };
              bubbleType: { controls: string[]; swallowsHazards: boolean };
            };
          };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const base = { streams: g.game.diagnostics.bullets.gunStreams, controls: [...g.game.touchRef.controlIds] };
      // The branch node, then the third card: 弹幕.
      g.game.debugGrantMutationPoints(200);
      await raf();
      await raf();
      const cards = [0, 1, 2].map((i) => g.game.levelupRef.choiceAt(i)?.id);
      const barrageAt = cards.findIndex((id) => id === 'route:barrage');
      if (barrageAt < 0) throw new Error(`branch node did not offer barrage: ${cards.join(',')}`);
      // The number keys, pressed the way a player would: 1 + the card's index.
      const key = ['Digit1', 'Digit2', 'Digit3'][barrageAt]!;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: key }));
      await raf();
      return {
        base,
        route: g.game.diagnostics.route,
        streams: g.game.diagnostics.bullets.gunStreams,
        armed: g.game.diagnostics.bullets.armed,
        controls: [...g.game.touchRef.controlIds],
        swallow: g.game.diagnostics.bubbleType.swallowsHazards,
      };
    });

    expect(outcome.base.streams, 'a run starts with one row of gun').toBe(1);
    expect(outcome.route, 'the picked route is barrage').toBe('barrage');
    expect(outcome.streams, 'and the card\'s promise lands on the spot: one more row').toBe(2);
    expect(outcome.armed, 'the gun stays the base weapon it always was').toBe(true);
    expect(outcome.controls, 'and no button was added -- this route\'s verb is the gun itself').toEqual(outcome.base.controls);
    expect(outcome.swallow, 'and it still cannot eat creatures').toBe(false);
  });
});
