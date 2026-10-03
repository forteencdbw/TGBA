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
    expect(s.byEvent, 'and an empty ledger').toEqual({ drivenOff: 0, absorb: 0, skill: 0, eaten: 0, surface: 0 });
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
          game: { pickupDrops: { kind: string; id: string | null; x: number; y: number }[] };
          player: { x: number; y: number };
          camera: { viewport: { laneWidthMeters: number } };
        };
      }).__GB;
      // Placed on the bubble, so the pickup's own collision takes it on the next update.
      g.game.pickupDrops.push({ kind: 'skill', id: null, x: g.player.x * g.camera.viewport.laneWidthMeters, y: g.player.y });
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
    // Per event rather than the whole object: collectable bubbles drift in, and with bsorb in the table an exact\n    // object would make this test fail for a bubble the level happened to put in the way.\n    expect(finished.byEvent.drivenOff).toBe(1);\n    expect(finished.byEvent.skill).toBe(1);\n    expect(finished.byEvent.eaten).toBe(1);\n    expect(finished.byEvent.surface).toBe(1);
    // The best is taken at the END of the run, so it has to include everything that run earned.
    expect(finished.endingBest, 'the session best sees the whole run').toBe(finished.value);
    await expectNoErrors(errors);
  });

  /**
   * The floating numbers: at the event, drifting UP, gone by the time the config says.
   *
   * "Up" is asserted in SCREEN pixels, which is the point of the whole design: a popup anchored to a world position
   * drifts down with the current, and a number that sinks is not a number that drifts. The pickup is placed off to the
   * side of the bubble so "at the event" is distinguishable from "at the player".
   */
  test('the score floats up where it was earned, and expires', async ({ page }) => {
    const errors = watchForErrors(page);
    await quietRun(page);

    const placed = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: { pickupDrops: { kind: string; id: string | null; x: number; y: number }[]; scorePopupsRef: { count: number; lastText: string | null }; score: { popups: { lifeSeconds: number } } };
          player: { x: number; y: number };
          camera: { viewport: { laneWidthMeters: number }; toScreenX: (x: number) => number; toScreenY: (y: number) => number };
        };
      }).__GB;
      const lane = g.camera.viewport.laneWidthMeters;
      // Inside the pickup's reach (~33 m) and off to the side, so the two positions cannot be confused.
      const x = g.player.x * lane + 20;
      const y = g.player.y + 8;
      // The pickups are a list now (a level may place several); a probe drops one in the same way the spawner does.
      g.game.pickupDrops.push({ kind: 'skill', id: null, x, y });
      return {
        itemX: g.camera.toScreenX(x),
        itemY: g.camera.toScreenY(y),
        bubbleX: g.camera.toScreenX(g.player.x * lane),
        life: g.game.score.popups.lifeSeconds,
      };
    });
    await expect.poll(async () => page.evaluate(() => (window as unknown as { __GB: { game: { scorePopupsRef: { count: number } } } }).__GB.game.scorePopupsRef.count), {
      message: 'collecting a special item has to float a number',
      timeout: 10_000,
    }).toBeGreaterThan(0);

    const first = await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { scorePopupsRef: { lastText: string | null; root: { children: { x: number; y: number }[] } } } } }).__GB.game.scorePopupsRef;
      const label = g.root.children[0]!;
      return { text: g.lastText, x: label.x, y: label.y };
    });
    const price = (await prices(page)).skill;
    // The prefix comes from the config too, so re-labelling the popups is not a failing test.
    const prefix = await page.evaluate(() => (window as unknown as { __GB: { mechRef: { score: { popups: { prefix: string } } } } }).__GB.mechRef.score.popups.prefix);
    expect(first.text, 'the number is the points, not the score').toBe(`${prefix}${price}`);
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



