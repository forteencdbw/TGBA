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
    expect(s.byEvent, 'and an empty ledger').toEqual({ drivenOff: 0, skill: 0, eaten: 0, surface: 0 });
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

    // 2. Collect a special item.
    await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: { skillPickup: { id: null; x: number; y: number } | null };
          player: { x: number; y: number };
          camera: { viewport: { laneWidthMeters: number } };
        };
      }).__GB;
      // Placed on the bubble, so the pickup's own collision takes it on the next update.
      g.game.skillPickup = { id: null, x: g.player.x * g.camera.viewport.laneWidthMeters, y: g.player.y };
    });
    await expect.poll(async () => (await score(page)).byEvent.skill, { message: 'the pickup has to be collected', timeout: 10_000 }).toBe(1);
    const afterPickup = await score(page);
    expect(afterPickup.value).toBe(price.drivenOff + price.skill);

    // 3. Swallow a creature: the reversal.
    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugSwallowForTest: (k: string) => number } } }).__GB.game.debugSwallowForTest('fish');
    });
    const afterEat = await score(page);
    expect(afterEat.value, 'the reversal pays too').toBe(price.drivenOff + price.skill + price.eaten);

    // 4. Reach the surface, which is the biggest single payment.
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
    expect(finished.value, 'and finishing pays the surface bonus').toBe(price.drivenOff + price.skill + price.eaten + price.surface);
    expect(finished.byEvent).toEqual({ drivenOff: 1, skill: 1, eaten: 1, surface: 1 });
    // The best is taken at the END of the run, so it has to include everything that run earned.
    expect(finished.endingBest, 'the session best sees the whole run').toBe(finished.value);
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
      (window as unknown as { __GB: { game: { debugStartRunWithType: (t: string) => void } } }).__GB.game.debugStartRunWithType('devour');
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
