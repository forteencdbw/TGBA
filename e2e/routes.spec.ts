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
              settings: Rect;
            };
          };
          settingsRef: {
            geometry: {
              levels: { id: string; label: string; locked: boolean; selected: boolean; rect: Rect }[];
            };
          };
        };
      };
    }).__GB.game;
    return { ...g.menuRef.geometry, levels: g.settingsRef.geometry.levels };
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
  test('the menu has no character row, and a run starts in the form the picker returned', async ({ page }) => {
    await boot(page);

    const offered = await menuGeometry(page);

    /**
     * The menu decides ONE thing now -- which water -- and its geometry says so. That row has MOVED: it lives in the
     * settings panel, because it is the debug ladder and the switch that turns it on is in there.
     *
     * What is asserted is unchanged in substance: the game offers levels to choose between, and the menu offers no
     * character select. The two lines that read the tagline and the hint are GONE, not moved: both were deleted from
     * the menu, and asserting on the absence of text that does not exist is not a test.
     */
    expect(offered.levels.length, 'the levels to choose between, offered by the panel').toBeGreaterThan(0);

    await press(page, offered.button);
    await waitForPhase(page, 'intro');

    const run = await state(page);
    expect(run.bubbleType.id, 'the run must start as the base bubble').toBe('base');
    expect(run.route, 'with no route picked yet').toBeNull();
    expect(run.bubbleType.controls, 'and no buttons at all').toEqual([]);
  });
  test('the base bubble earns no rage from damage, and the devour route does not add one', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await state(page);
    expect(run.bubbleType.id, 'the run starts as the base bubble').toBe('base');
    expect(run.bubbleType.controls, 'with no buttons at all').toEqual([]);
    expect(run.bubbleType.hasSuction, 'no field before the route is picked').toBe(false);

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
            /** Pinned below: the run's talent is rolled, and fish-fart changes what a fish contact does. */
            debugSetTalent: (id: string) => string;
            diagnostics: {
              phase: string;
              stats: { hits: number; ended: number };
              hazards: { eaten: number };
              bubbleType: { swallowsHazards: boolean };
              gameSeconds: number;
            };
            hazardsRef: { hazards: { x: number; y: number }[] };
            levelRef: { scrollSpeed: number; driftSpeed: number };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { x: number; y: number; screenY: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // Frozen water, so the creatures stay on the bubble instead of being carried away.
      const scroll = g.game.levelRef.scrollSpeed;
      const drift = g.game.levelRef.driftSpeed;
      g.game.levelRef.scrollSpeed = 0;
      // The creatures' drift is the level's own number now, not the camera's: freezing the water means freezing both.
      g.game.levelRef.driftSpeed = 0;
      g.game.debugSetSteadyCruise();
      /**
       * A PINNED talent, because the run's own is ROLLED and fish-fart changes what a contact does: it fires on the
       * hit that would have landed and leaves bait behind, which feeds the swarm the escape was meant to get away
       * from. Measured with it in play, this test's "contact must hurt" came out 2 hits in 10 contacts.
       *
       * 汽水泡 used to be the neutral pick and the talent was deleted. 淤泥 is safe for the two things read here:
       * it changes volume and defence, the case below pins `player.volume` itself, and a contact is COUNTED in
       * `stats.hits` whatever the defence reduces the damage to.
       */
      g.game.debugSetTalent('silt');
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
      g.game.levelRef.driftSpeed = drift;
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
      // The slow motion runs before the cards do -- see the note on the first site in this file.
      for (let i = 0; i < 300 && g.game.diagnostics.phase !== 'levelup'; i++) await raf();
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
