import { expect, test } from '@playwright/test';
import { boot, diagnostics, mechanics, player, startFromMenu, waitForPhase } from './helpers';

/**
 * Growth stages: the bubble gets bigger, and BIGGER IS SLOWER.
 *
 * That rule is the whole tension of the design -- the more you eat, the harder it is to dodge -- so it has to
 * be true of the bubble's actual movement, not merely of a number in a config. The last assertion here measures
 * DISPLACEMENT for exactly that reason: a multiplier that never reaches the movement code would pass every
 * other check in this file.
 */
test.describe('growth stages', () => {
  /**
   * Drive the bubble to a target stage by absorbing, inside ONE page evaluation.
   *
   * The first version spawned a single bubble per `expect.poll` tick and relied on Playwright's retry cadence
   * to keep the game stepping. That is a timing guess: the poll interval and the frame loop are unrelated, so
   * the run could sit for a full poll interval with nothing spawned and the stage never moved. A
   * `requestAnimationFrame` loop inside the page is the direct expression of "keep feeding it until the stage
   * changes", and it stops the moment it has what it came for.
   */
  const absorbUntilStage = async (page: import('@playwright/test').Page, target: number): Promise<void> => {
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

        // Come DOWN to the target if a previous step overshot, using the game's own demote path so the state
        // stays consistent rather than being written by hand.
        let guard = 0;
        while (g.diagnostics.stage.stage > want && guard++ < 20) {
          g.demoteStageForTest();
          await raf();
        }
        // Then feed it until it promotes. ONE bubble per frame, and wait a frame after each so the absorb is
        // processed before the next one is spawned -- spawning faster than the game consumes them piles bubbles
        // on the player and the count stops being meaningful.
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
  };

  test('starts at stage 1 and promotes at the configured thresholds', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const config = await mechanics(page);
    const start = await diagnostics(page);
    expect(start.stage.stage, 'a run begins in stage 1').toBe(1);
    expect(start.stage.speedMultiplier, 'and stage 1 is the fast one').toBeCloseTo(config.stages.speedMultiplier[0]!, 5);

    const absorbedBefore = (await diagnostics(page)).stats.absorbed;

    /**
     * Promote by absorbing, and check the threshold against the config.
     *
     * The threshold is measured as a DIFFERENCE in the game's own absorbed counter, because the game is the
     * authority on when it promoted -- reproducing its arithmetic here would just be a second implementation to
     * get wrong.
     */
    await absorbUntilStage(page, 2);

    const promoted = await diagnostics(page);
    const absorbedToPromote = promoted.stats.absorbed - absorbedBefore;
    expect(absorbedToPromote, `stage 2 should need ${config.stages.absorbToStage2} absorbed`).toBeGreaterThanOrEqual(
      config.stages.absorbToStage2,
    );
    // One of slack: the loop spawns a bubble, then waits a frame, so the final spawn may land after the promote.
    expect(absorbedToPromote).toBeLessThanOrEqual(config.stages.absorbToStage2 + 2);
    expect(promoted.stage.speedMultiplier).toBeCloseTo(config.stages.speedMultiplier[1]!, 5);
    // The multiplier must reach the PLAYER, not just the stage state.
    expect((await player(page)).stageSpeedMultiplier).toBeCloseTo(config.stages.speedMultiplier[1]!, 2);
  });

  test('each stage moves the bubble measurably slower', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const config = await mechanics(page);

    /**
     * Start from the lane's CENTRE every time, and use a short window.
     *
     * The first version of this measurement started wherever the previous one ended, and stage 1 crosses half
     * the lane in the time allowed -- so every run hit the lane's right edge, was clamped there, and all three
     * readings came out identical. Three identical numbers look like "the multiplier does nothing", and that
     * version passed because its bound was loose enough.
     */
    const measure = async (): Promise<{ stage: number; dx: number; steadyV: number }> => {
      await page.evaluate(() => {
        const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB.game;
        g.debugSetSteadyCruise();
        (window as unknown as { __GB: { player: { x: number; screenY: number } } }).__GB.player.x = 0.5;
        (window as unknown as { __GB: { player: { x: number; screenY: number } } }).__GB.player.screenY = 0.5;
      });
      const before = await player(page);
      await page.keyboard.down('KeyD');
      await page.waitForTimeout(320);
      const mid = await player(page);
      await page.keyboard.up('KeyD');
      const after = await player(page);
      const stage = (await diagnostics(page)).stage.stage;
      return { stage, dx: after.x - before.x, steadyV: Math.abs(mid.vx) };
    };

    const readings: { stage: number; dx: number; steadyV: number }[] = [];
    for (const target of [1, 2, 3]) {
      await absorbUntilStage(page, target);
      readings.push(await measure());
    }

    expect(readings.map((r) => r.stage)).toEqual([1, 2, 3]);

    /**
     * STEADY-STATE VELOCITY is the exact form of the claim, so it is asserted tightly.
     *
     * `vx` while holding a key is the keyboard speed times the talent's steering scale times this stage's
     * multiplier, and the first two are readable -- so the expected value is computed from what the player
     * actually has rather than from a hardcoded constant. An earlier version of this check baked in one run's
     * talent penalty and failed on the next run, where the talent differed.
     */
    for (const r of readings) {
      const expected = 0.5 * (await player(page)).steerScale * config.stages.speedMultiplier[r.stage - 1]!;
      expect(r.steadyV, `stage ${r.stage} velocity should match keyboardSpeed x steerScale x multiplier`).toBeCloseTo(expected, 2);
    }

    /**
     * And DISPLACEMENT must show it too, which is the player-facing half.
     *
     * Looser, because frame durations vary, and it also asserts the measurement did not saturate -- three clamped
     * readings would satisfy "monotonically decreasing" while proving nothing.
     */
    const dx1 = readings[0]!.dx;
    const dx2 = readings[1]!.dx;
    const dx3 = readings[2]!.dx;
    expect(dx1).toBeGreaterThan(dx2);
    expect(dx2).toBeGreaterThan(dx3);
    // Each step is roughly the configured ratio, within frame-timing noise.
    expect(dx2 / dx1).toBeGreaterThan(0.6);
    expect(dx2 / dx1).toBeLessThan(0.95);
    expect(dx3 / dx2).toBeGreaterThan(0.6);
    expect(dx3 / dx2).toBeLessThan(0.95);
  });
});
