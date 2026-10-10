import { expect, test, type Page } from '@playwright/test';
import { boot, expectNoErrors, mechanics, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The gun: the small bubbles the player's bubble fires on its own.
 *
 * One assertion per thing the design promises -- it fires on a cadence nobody asked for, a round takes hit points
 * off a creature, a creature that runs out of them LEAVES rather than dying, a kind with no hit points is not a
 * target, and scenery stops the rounds without being damaged by them.
 *
 * The measurements in the commit message come from the same steps, run by hand against the dev server.
 */
test.describe('the gun', () => {
  /** The gun's counters, read from the game's own diagnostics. */
  const gun = (page: Page) =>
    page.evaluate(() => {
      const d = (window as unknown as {
        __GB: { game: { diagnostics: { bullets: { inFlight: number; fired: number; hits: number; armed: boolean }; gameSeconds: number } } };
      }).__GB.game.diagnostics;
      return { ...d.bullets, gameSeconds: d.gameSeconds };
    });

  const hazardCounters = (page: Page) =>
    page.evaluate(() => {
      const d = (window as unknown as {
        __GB: { game: { diagnostics: { hazards: { active: number; leaving: number; fled: number; damaged: number } } } };
      }).__GB.game.diagnostics;
      return d.hazards;
    });

  /** Put one named creature a fixed distance above the muzzle, and hand back its id. */
  const placeCreature = (page: Page, kind: string, ahead: number) =>
    page.evaluate(
      (p) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugSpawnHazardOnPlayer: (k: string) => void;
              hazardsRef: { hazards: { id: number; kind: string; x: number; y: number }[] };
            };
            player: { x: number; y: number };
            camera: { viewport: { laneWidthMeters: number } };
          };
        }).__GB;
        g.game.hazardsRef.hazards.length = 0;
        g.game.debugSpawnHazardOnPlayer(p.kind);
        const h = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1]!;
        h.y = g.player.y + p.ahead;
        h.x = g.player.x * g.camera.viewport.laneWidthMeters;
        return h.id;
      },
      { kind, ahead },
    );

  const creature = (page: Page, id: number) =>
    page.evaluate((i) => {
      const h = (window as unknown as {
        __GB: { game: { hazardsRef: { hazards: { id: number; health: number; maxHealth: number; flee: string | null; y: number }[] } } };
      }).__GB.game.hazardsRef.hazards.find((x) => x.id === i);
      return h ? { health: h.health, maxHealth: h.maxHealth, flee: h.flee, y: h.y } : null;
    }, id);

  /** A run with the water emptied and the bubble fat enough to survive a contact or two. */
  const openWater = async (page: Page): Promise<void> => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { debugSetSteadyCruise: () => void; hazardsRef: { hazards: unknown[] }; obstaclesRef: { obstacles: unknown[] } }; player: { volume: number; x: number; screenY: number } };
      }).__GB;
      g.game.debugSetSteadyCruise();
      g.game.hazardsRef.hazards.length = 0;
      g.game.obstaclesRef.obstacles.length = 0;
      g.player.volume = 8;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });
  };

  test('it fires by itself, at the configured rate', async ({ page }) => {
    const errors = watchForErrors(page);
    await openWater(page);

    // The ladder's FIRST tier is what a fresh run fires at; the tiers above it come from mutation picks.
    const rate = (await mechanics(page)).bullets.rateTiers[0] ?? 0;
    expect(rate, 'the config must have a cadence at all').toBeGreaterThan(0);

    const before = await gun(page);
    // Polled on the GAME's clock, not the wall clock: a browser under load runs the simulation slower than real
    // time, so a wall-clock second is not a second of firing. See `Diagnostics.gameSeconds`.
    await expect
      .poll(async () => (await gun(page)).fired, { message: 'the gun must fire on its own', timeout: 10_000 })
      .toBeGreaterThan(before.fired);
    const after = await gun(page);
    const gameSeconds = after.gameSeconds - before.gameSeconds;
    const measured = (after.fired - before.fired) / gameSeconds;
    expect(measured, `rounds per game second must be the configured ${rate}`).toBeGreaterThan(rate * 0.7);
    expect(measured).toBeLessThan(rate * 1.3);

    await expectNoErrors(errors);
  });

  test('a fish takes hit points from the rounds, and then leaves instead of dying', async ({ page }) => {
    const errors = watchForErrors(page);
    await openWater(page);

    const health = (await mechanics(page)).hazards.health.fish ?? 0;
    expect(health, 'this test is about a creature that CAN be driven off').toBeGreaterThan(0);

    const id = await placeCreature(page, 'fish', 130);
    const countersBefore = await hazardCounters(page);

    // Somewhere between the first hit and the last one, a creature is damaged but still there.
    await expect
      .poll(async () => (await creature(page, id))?.health ?? 0, { message: 'rounds must take hit points off it', timeout: 15_000 })
      .toBeLessThan(health);

    await expect
      .poll(async () => (await creature(page, id))?.flee ?? null, { message: 'at zero hit points it must be LEAVING', timeout: 15_000 })
      .toBe(true);

    /**
     * And it leaves FAST: it is out of the field within a second or so, which is the whole point of the state --
     * a fish that hung around after being finished would not read as driven off.
     */
    const leaving = await creature(page, id);
    expect(leaving, 'it must still be in the water for a moment, so the player sees it go').not.toBeNull();
    // One of the three ways out, picked when it decided to go -- never a diagonal, never nothing.
    expect(['up', 'left', 'right'], 'and it must be leaving in one of the three directions').toContain(leaving?.flee);
    await expect
      .poll(async () => (await creature(page, id)) === null, { message: 'and it must be gone shortly after', timeout: 5000 })
      .toBe(true);

    const countersAfter = await hazardCounters(page);
    expect(countersAfter.fled, 'driven off, counted once').toBe(countersBefore.fled + 1);
    expect(countersAfter.damaged, 'with the earlier hits counted as damage rather than as flight').toBeGreaterThan(countersBefore.damaged);
    await expectNoErrors(errors);
  });

  test('a creature with no hit points is not a target: the rounds pass through', async ({ page }) => {
    const errors = watchForErrors(page);
    await openWater(page);

    expect((await mechanics(page)).hazards.health.jelly, 'the jellyfish is the immune case in the shipped config').toBe(0);
    const id = await placeCreature(page, 'jelly', 130);
    const countersBefore = await hazardCounters(page);

    const before = await gun(page);
    await expect.poll(async () => (await gun(page)).fired, { timeout: 10_000 }).toBeGreaterThan(before.fired + 3);

    const untouched = await creature(page, id);
    expect(untouched?.flee, 'an immune creature must not be driven off').toBeNull();
    expect(untouched?.health, 'and must not lose hit points').toBe(0);
    const countersAfter = await hazardCounters(page);
    expect(countersAfter.fled, 'nothing fled').toBe(countersBefore.fled);
    expect(countersAfter.damaged, 'and nothing was damaged').toBe(countersBefore.damaged);
    await expectNoErrors(errors);
  });

  test('scenery stops the rounds, and the rounds do not damage it', async ({ page }) => {
    const errors = watchForErrors(page);
    await openWater(page);

    const id = await placeCreature(page, 'fish', 150);
    // A crate in the line of fire, closer than the fish.
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { debugSpawnObstacleOnPlayer: (k: string, ahead: number) => void } } }).__GB.game;
      g.debugSpawnObstacleOnPlayer('crate', 70);
    });

    const before = await gun(page);
    const fishBefore = await creature(page, id);
    await expect.poll(async () => (await gun(page)).hits, { timeout: 15_000 }).toBeGreaterThan(before.hits);

    const fishAfter = await creature(page, id);
    expect(fishAfter?.health, 'a fish behind a crate must be untouched').toBe(fishBefore?.health);
    // And the crate is scenery, not a target: the same hit count that says "blocked" says nothing was broken.
    const obstacles = await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { obstaclesRef: { obstacles: { kind: string }[] } } } }).__GB.game;
      return g.obstaclesRef.obstacles.length;
    });
    expect(obstacles, 'the crate is still there').toBeGreaterThan(0);
    await expectNoErrors(errors);
  });
});


