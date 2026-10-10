import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, expectNoErrors, mechanics, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The score.
 *
 * One assertion per promise the mechanic makes: a run starts at zero, every event pays what the CONFIG says (read
 * from the running build rather than written into the test, so a re-priced event is not a failing test), the readout
 * on the screen says the same number the game does, and a new run resets the total while the session's best survives.
 *
 * The measurements in the commit message come from the same steps run by hand against the dev server.
 */
test.describe('the score', () => {
  const score = (page: Page) =>
    page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { diagnostics: { score: { value: number; best: number; byEvent: Record<string, number> }; ending: { bestScore: number } } }; hud: { scoreText: string } };
      }).__GB;
      return { ...g.game.diagnostics.score, endingBest: g.game.diagnostics.ending.bestScore, hud: g.hud.scoreText };
    });

  const prices = (page: Page) => mechanics(page).then((m) => m.score);

  /** A run with the water emptied, so nothing scores by accident. */
  const quietRun = async (page: Page): Promise<void> => {
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
      g.player.volume = 1.8;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });
  };

  test('a run starts at zero, and the readout says so', async ({ page }) => {
    const errors = watchForErrors(page);
    await quietRun(page);
    const s = await score(page);
    expect(s.value, 'a fresh run has no points').toBe(0);
    expect(s.byEvent, 'and an empty ledger').toEqual({ drivenOff: 0, absorb: 0, eaten: 0, boss: 0 });
    // The string the SCREEN shows, not a re-derivation of the format: a display bug has to be visible to this test.
    expect(s.hud).toBe('分数 0');
    await expectNoErrors(errors);
  });

  test('every event pays exactly what the config says', async ({ page }) => {
    const errors = watchForErrors(page);
    await quietRun(page);
    const price = await prices(page);

    // 1. Drive a creature off with the gun.
    await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: { debugSpawnHazardOnPlayer: (k: string) => void; hazardsRef: { hazards: { x: number; y: number }[] }; diagnostics: { hazards: { fled: number } } };
          player: { x: number; y: number };
          camera: { viewport: { laneWidthMeters: number } };
        };
      }).__GB;
      g.game.debugSpawnHazardOnPlayer('fish');
      const h = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1]!;
      h.y = g.player.y + 130;
      h.x = g.player.x * g.camera.viewport.laneWidthMeters;
    });
    await expect
      .poll(async () => page.evaluate(() => (window as unknown as { __GB: { game: { diagnostics: { hazards: { fled: number } } } } }).__GB.game.diagnostics.hazards.fled), {
        message: 'the gun has to finish the fish for this to mean anything',
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    const afterFlee = await score(page);
    expect(afterFlee.value, 'driving a creature off pays the configured price').toBe(price.drivenOff);
    expect(afterFlee.byEvent.drivenOff).toBe(1);
    expect(afterFlee.hud, 'and the screen shows it').toBe(`分数 ${price.drivenOff}`);

    // 2. Swallow a creature: the reversal.
    // (The pickup event went with the pickups themselves -- the skill and the gun's rows are mutation
    // picks now, so this run earns drivenOff, eaten and boss and nothing else.)
    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugSwallowForTest: (k: string) => number } } }).__GB.game.debugSwallowForTest('fish');
    });
    const afterEat = await score(page);
    expect(afterEat.value, 'the reversal pays too').toBe(price.drivenOff + price.eaten);

    // 3. Defeat the boss, which is the biggest single payment.
    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugSkipToLevelEnd: () => void } } }).__GB.game.debugSkipToLevelEnd();
    });
    await expect
      .poll(async () => page.evaluate(() => (window as unknown as { __GB: { game: { diagnostics: { ending: { surfaced: boolean } } } } }).__GB.game.diagnostics.ending.surfaced), {
        message: 'the run has to reach the surface',
        timeout: 30_000,
      })
      .toBe(true);
    const finished = await score(page);
    expect(finished.value, 'and finishing pays the boss bonus').toBe(price.drivenOff + price.eaten + price.boss);
    // Per event rather than the whole object: collectable bubbles drift in, and with absorb in the table an exact
    // object would make this test fail for a bubble the level happened to put in the way.
    expect(finished.byEvent.drivenOff).toBe(1);
    expect(finished.byEvent.eaten).toBe(1);
    expect(finished.byEvent.boss).toBe(1);
    // The best is taken at the END of the run, so it has to include everything that run earned.
    expect(finished.endingBest, 'the session best sees the whole run').toBe(finished.value);
    await expectNoErrors(errors);
  });

  /**
   * The floating numbers: at the event, drifting UP, gone by the time the config says.
   *
   * "Up" is asserted in SCREEN pixels, which is the point of the whole design: a popup anchored to a world position
   * drifts down with the current, and a number that sinks is not a number that drifts. The scored event is placed off
   * to the side of the bubble so "at the event" is distinguishable from "at the player".
   */
  test('the score floats up where it was earned, and expires', async ({ page }) => {
    const errors = watchForErrors(page);
    await quietRun(page);

    const placed = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: { scorePopupsRef: { add: (x: number, y: number, v: number, camera: unknown) => void; count: number; lastText: string | null }; score: { popups: { lifeSeconds: number } } };
          player: { x: number; y: number };
          camera: { viewport: { laneWidthMeters: number }; toScreenX: (x: number) => number; toScreenY: (y: number) => number };
        };
      }).__GB;
      const lane = g.camera.viewport.laneWidthMeters;
      // Off to the side of the bubble, so "at the event" is distinguishable from "at the player".
      const x = g.player.x * lane + 20;
      const y = g.player.y + 8;
      // The pickups went with the pickup system, so the layer is driven directly -- the same call every
      // scoring site makes, with the same world-to-screen conversion inside it.
      g.game.scorePopupsRef.add(x, y, 25, g.camera);
      return {
        itemX: g.camera.toScreenX(x),
        itemY: g.camera.toScreenY(y),
        bubbleX: g.camera.toScreenX(g.player.x * lane),
        life: g.game.score.popups.lifeSeconds,
      };
    });
    await expect.poll(async () => page.evaluate(() => (window as unknown as { __GB: { game: { scorePopupsRef: { count: number } } } }).__GB.game.scorePopupsRef.count), {
      message: 'a scored event has to float a number',
      timeout: 10_000,
    }).toBeGreaterThan(0);

    const first = await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { scorePopupsRef: { lastText: string | null; root: { children: { x: number; y: number }[] } } } } }).__GB.game.scorePopupsRef;
      const label = g.root.children[0]!;
      return { text: g.lastText, x: label.x, y: label.y };
    });
    // The value this test paid (25, above) is what the number must say -- the prefix comes from the
    // config too, so re-labelling the popups is not a failing test.
    const prefix = await page.evaluate(() => (window as unknown as { __GB: { mechRef: { score: { popups: { prefix: string } } } } }).__GB.mechRef.score.popups.prefix);
    expect(first.text, 'the number is the points, not the score').toBe(`${prefix}25`);
    expect(Math.abs(first.x - placed.itemX), 'it appears where the ITEM was').toBeLessThan(6);
    expect(Math.abs(first.x - placed.bubbleX), 'and not where the bubble is').toBeGreaterThan(10);

    // It rises: sampled on the screen, not in the world.
    await page.waitForTimeout(600);
    const later = await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { scorePopupsRef: { root: { children: { y: number }[] } } } } }).__GB.game.scorePopupsRef;
      return g.root.children[0]?.y ?? null;
    });
    expect(later, 'it must still be alive').not.toBeNull();
    expect(later!, 'and it must have moved UP the screen, not down').toBeLessThan(first.y);

    // And it is gone by the time it said it would be.
    await page.waitForTimeout(placed.life * 1000);
    expect(
      await page.evaluate(() => (window as unknown as { __GB: { game: { scorePopupsRef: { count: number } } } }).__GB.game.scorePopupsRef.count),
      'nothing may outlive its life',
    ).toBe(0);
    await expectNoErrors(errors);
  });

  test('a new run starts at zero and keeps the best', async ({ page }) => {
    const errors = watchForErrors(page);
    await quietRun(page);
    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugSwallowForTest: (k: string) => number } } }).__GB.game.debugSwallowForTest('fish');
    });
    const first = await score(page);
    expect(first.value).toBeGreaterThan(0);

    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugStartRunWithRoute: (t: string) => string | null } } }).__GB.game.debugStartRunWithRoute('devour');
    });
    await waitForPhase(page, 'playing');
    const second = await score(page);
    expect(second.value, 'the score is the RUN it belongs to').toBe(0);
    expect(second.hud).toBe('分数 0');
    expect(second.best, 'and the session remembers the best').toBeGreaterThan(0);
    expect(await diagnostics(page)).toBeTruthy();
    await expectNoErrors(errors);
  });
});



