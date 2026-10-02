import { expect, test, type Page } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Bubble types: the choice on the main menu, and the volatile bubble's core loop.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS IS GUARDING
 * ---------------------------------------------------------------------------------------------
 * 1. THE CHOICE IS REAL. The menu offers exactly the types the game has, in the same order, and pressing one
 *    actually changes the run -- the controls laid out, the palette, and what the verbs do. A menu button that set a
 *    variable nothing read would look identical in a screenshot.
 * 2. THE DEVOUR BUBBLE IS UNCHANGED. It is the game's original design and the one people are playing, so the
 *    abstraction that made room for a second type has to be invisible to the first: same controls, same numbers,
 *    and crucially NO rage.
 * 3. THE VOLATILE BUBBLE'S LOOP CLOSES. Damage earns rage, rage is spent by slamming, and a slam opens the one
 *    thing the other bubble cannot answer at all: a wall.
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
              types: { id: string; label: string; rect: Rect }[];
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
      __GB: { game: { diagnostics: { bubbleType: unknown; rage: unknown; stage: { name: string }; phase: string } } };
    }).__GB.game;
    return {
      bubbleType: g.diagnostics.bubbleType as {
        id: string;
        name: string;
        controls: string[];
        hasSpit: boolean;
        hasCompress: boolean;
        hasCharge: boolean;
      },
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

test.describe('bubble types', () => {
  test('the menu offers exactly the types the game has, and the choice changes the run', async ({ page }) => {
    await boot(page);

    const offered = await menuGeometry(page);
    const known = await page.evaluate(() =>
      (window as unknown as { __GB: { game: { debugBubbleTypeIds: () => string[] } } }).__GB.game.debugBubbleTypeIds(),
    );

    expect(offered.types.map((t) => t.id), 'the menu must offer exactly the game\'s types, in order').toEqual(known);
    expect(offered.types.length, 'there must be more than one bubble to choose between').toBeGreaterThan(1);
    for (const type of offered.types) {
      expect(type.label.length, `the ${type.id} button needs a name on it`).toBeGreaterThan(0);
      expect(type.rect.w, `the ${type.id} button needs to be on screen`).toBeGreaterThan(0);
    }
    // The tagline and the hint describe the SELECTED type, so the choice is informed rather than remembered.
    expect(offered.tagline.length, 'the menu must describe the selected bubble').toBeGreaterThan(0);
    expect(offered.hint.length, 'and say which controls it uses').toBeGreaterThan(0);
    const defaultTagline = offered.tagline;

    /**
     * Pick the volatile bubble by pressing its button, then start.
     *
     * Both presses are the real controls, so a selector that drew correctly and hit-tested wrongly fails here.
     */
    const angry = offered.types.find((t) => t.id === 'angry');
    expect(angry, 'the volatile bubble must be on the menu').toBeTruthy();
    await press(page, angry!.rect);

    const afterPick = await menuGeometry(page);
    expect(afterPick.tagline, 'picking a bubble must change the description').not.toBe(defaultTagline);
    expect(afterPick.hint, 'and the control hint, because the controls differ').not.toBe(offered.hint);

    await press(page, afterPick.button);
    await waitForPhase(page, 'intro');

    const run = await state(page);
    expect(run.bubbleType.id, 'the run must be the bubble that was chosen').toBe('angry');
    expect(run.bubbleType.controls, 'and must lay out that type\'s controls').toEqual(['wheel', 'skill', 'charge', 'burst']);
    expect(run.bubbleType.hasSpit, 'the volatile bubble has no spit').toBe(false);
    expect(run.bubbleType.hasCompress, 'and no digest').toBe(false);
    expect(run.bubbleType.hasCharge, 'but it does have the charge').toBe(true);
  });

  test('the chosen type is what the touch layer lays out', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
    await waitForPhase(page, 'intro');

    const layout = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: {
              controlIds: string[];
              chargeGeometry: { x: number; y: number; radius: number };
              wheelGeometry: { x: number; y: number; radius: number };
            };
          };
        };
      }).__GB.game;
      return {
        controlIds: [...g.touchRef.controlIds],
        charge: g.touchRef.chargeGeometry,
        wheel: g.touchRef.wheelGeometry,
      };
    });

    /**
     * The control LIST is the thing under test, not the geometry.
     *
     * `layout` computes a position for every button whether or not the type uses it, so the geometry being non-zero
     * proves nothing. What proves the abstraction works is that the type's list does not contain spit or digest --
     * and the drawing and the hit testing both read that list.
     */
    expect(layout.controlIds).toEqual(['wheel', 'skill', 'charge', 'burst']);
    expect(layout.charge.radius, 'the charge button must have a real size to press').toBeGreaterThan(0);
    expect(layout.wheel.radius, 'and the wheel must still be there').toBeGreaterThan(0);

    /**
     * And pressing where the spit button WOULD be must do nothing.
     *
     * The stale rectangles are still in the layer, so this is the case a probe has to check explicitly: a type with
     * no spit button that still answered a press there would be a ghost control.
     */
    const pressed = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: { spit: { hits: number } };
          };
        };
      }).__GB.game;
      const before = g.diagnostics.spit.hits;
      const s = g.touchRef.spitGeometry;
      g.handlePointerDown(72, s.x, s.y);
      g.handlePointerUp(72);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return g.diagnostics.spit.hits - before;
    });
    expect(pressed, 'a type without a spit button must not answer a press where one used to be').toBe(0);
  });

  test('the devour bubble is untouched: same controls, and NO rage', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await state(page);
    expect(run.bubbleType.id, 'the default run is still the devour bubble').toBe('devour');
    expect(run.bubbleType.controls, 'with exactly its old controls').toEqual(['wheel', 'skill', 'suction', 'spit', 'compress']);
    expect(run.bubbleType.hasSpit).toBe(true);
    expect(run.bubbleType.hasCompress).toBe(true);
    expect(run.bubbleType.hasCharge, 'and no charge verb it never had').toBe(false);

    /**
     * And being hit earns nothing, because it has no resource to earn.
     *
     * This is the assertion that keeps the second bubble from costing the first one anything: `takeHit` is the single
     * place a hit lands, and a rage gain wired in unconditionally there would silently make the devour bubble carry
     * a meter it has no way to spend.
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
    expect(afterHits, 'the devour bubble must gain no rage from damage').toBe(0);
  });

  test('rage comes from surviving damage, and decays once the bubble is left alone', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
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
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
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
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;
      await raf();

      // Full rage, so the slam is at its strongest -- and so the spend afterwards is unmistakable.
      g.game.debugGrantRageForTest(100);
      const rageBefore = g.game.diagnostics.rage.value;

      // A wall: `ramVolume` is null, so NO volume smashes it. The volatile bubble's answer is the charge.
      g.game.debugSpawnObstacleOnPlayer('wall', 0);
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
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
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
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
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

  test('the aim locks while winding up, so a released stick still slams where it was pointed', async ({ page }) => {
    await boot(page);
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugStartRunWithType: (id: string) => void } } }).__GB.game.debugStartRunWithType('angry'));
    await waitForPhase(page, 'playing');

    const aim = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { chargeGeometry: { x: number; y: number }; wheelGeometry: { x: number; y: number; radius: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerMove: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: { rage: { aiming: { x: number; y: number }; charging: boolean } };
          };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const c = g.game.touchRef.chargeGeometry;
      const w = g.game.touchRef.wheelGeometry;

      /**
       * Point LEFT on the wheel with one thumb, wind up with the other, then let the stick go.
       *
       * Two pointers, because that is the gesture: the wheel is held with one hand and the charge button with the
       * other. The aim is captured WHILE CHARGING -- it follows the stick until the stick is released and then holds
       * -- which is why the first reading is taken after the wind-up starts rather than before it.
       */
      g.game.handlePointerDown(31, w.x - w.radius * 0.9, w.y);
      await raf();

      g.game.handlePointerDown(32, c.x, c.y);
      await raf();
      const whileHeld = { ...g.game.diagnostics.rage.aiming };

      // Let go of the STICK only. The charge is still being wound.
      g.game.handlePointerUp(31);
      await raf();

      const locked = { ...g.game.diagnostics.rage.aiming };
      const stillCharging = g.game.diagnostics.rage.charging;
      g.game.handlePointerUp(32);
      await raf();
      return { whileHeld, locked, stillCharging };
    });

    console.log(`aim: ${JSON.stringify(aim)}`);
    expect(aim.whileHeld.x, 'holding the stick left while winding must aim left').toBeLessThan(-0.5);
    expect(aim.stillCharging, 'releasing the stick must not release the charge').toBe(true);
    expect(aim.locked.x, 'and the aim must LOCK at that direction once the stick is let go').toBeLessThan(-0.5);
    expect(Math.abs(aim.locked.y), 'with no drift sideways').toBeLessThan(0.3);
  });
});
