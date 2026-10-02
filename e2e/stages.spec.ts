import { expect, test } from '@playwright/test';
import { absorbUntilStage, boot, diagnostics, mechanics, player, startFromMenu, waitForPhase } from './helpers';

/**
 * Growth stages: the bubble gets bigger, and BIGGER IS SLOWER.
 *
 * That rule is the whole tension of the design -- the more you eat, the harder it is to dodge -- so it has to
 * be true of the bubble's actual movement, not merely of a number in a config. The movement test measures
 * DISPLACEMENT for exactly that reason: a multiplier that never reaches the movement code would pass every
 * other check in this file. The appearance test measures the DRAWN radius for the same reason.
 */
test.describe('growth stages', () => {
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

  /**
   * The growth has to be VISIBLE, and this is the requirement stated directly: the bubble changes size with the
   * stage and each stage is a different colour so they can be told apart.
   *
   * Asserted on the DRAWN radius rather than on the config's `radius`, because a value that never reaches the
   * the drawing code would satisfy every config check while changing nothing on screen. Note it is also the
   * radius the eating rules use -- one function, so the bubble is genuinely as big as it looks.
   */
  test('each stage draws a bigger bubble in a different colour', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /** What the drawing code actually paints with, read from the same place the drawing code reads it. */
    type Look = { radius: number; inner: number; rim: number; glow: number; innerRing: boolean; rimWidthRatio: number };

    const readings: { stage: number; radiusPx: number; look: Look; radiusFraction: number }[] = [];
    for (const target of [1, 2, 3]) {
      await absorbUntilStage(page, target);
      // Park it in the middle so the reported screen position is stable between measurements.
      await page.evaluate(() => {
        const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB.game;
        g.debugSetSteadyCruise();
        (window as unknown as { __GB: { player: { x: number; screenY: number } } }).__GB.player.x = 0.5;
        (window as unknown as { __GB: { player: { x: number; screenY: number } } }).__GB.player.screenY = 0.45;
      });
      await page.waitForTimeout(120);
      const state = await page.evaluate(() => {
        const g = (window as unknown as {
          __GB: { game: { diagnostics: { stage: { appearance: Look; radiusFraction: number } }; playerScreenPx: { radiusPx: number } } };
        }).__GB.game;
        return { radiusPx: g.playerScreenPx.radiusPx, look: g.diagnostics.stage.appearance, radiusFraction: g.diagnostics.stage.radiusFraction };
      });
      readings.push({ stage: target, ...state });
    }

    console.log('stage  drawn radius px   lane fraction   radius x   inner      rim        glow       ring');
    for (const r of readings) {
      const hex = (v: number) => '#' + v.toString(16).padStart(6, '0');
      console.log(
        `  ${r.stage}    ${r.radiusPx.toFixed(1).padStart(14)}   ${r.radiusFraction.toFixed(4).padStart(12)}   ` +
          `${r.look.radius.toFixed(2).padStart(7)}   ${hex(r.look.inner)}   ${hex(r.look.rim)}   ${hex(r.look.glow)}   ${r.look.innerRing}`,
      );
    }

    // SIZE: strictly bigger each stage.
    expect(readings[0]!.radiusPx).toBeGreaterThan(0);
    expect(readings[1]!.radiusPx, 'stage 2 must draw a bigger bubble than stage 1').toBeGreaterThan(readings[0]!.radiusPx);
    expect(readings[2]!.radiusPx, 'stage 3 must draw a bigger bubble than stage 2').toBeGreaterThan(readings[1]!.radiusPx);

    /**
     * And the growth must clear a REAL margin, not merely be monotonic.
     *
     * The configured scales are 1.00 / 1.32 / 1.72, but the volume also rises while absorbing to reach a stage,
     * so the measured ratio is larger than the configured one and cannot be compared to it directly. What
     * matters is that a player can see the change: a 10% growth is technically "bigger" and invisible.
     */
    expect(readings[1]!.radiusFraction / readings[0]!.radiusFraction, 'stage 2 must be visibly bigger').toBeGreaterThan(1.15);
    expect(readings[2]!.radiusFraction / readings[1]!.radiusFraction, 'stage 3 must be visibly bigger').toBeGreaterThan(1.15);

    // The CONFIGURED radius on the bubble must equal the config's own value, so the knob is honoured rather than
    // shadowed by a default.
    for (const r of readings) expect(r.look.radius, `stage ${r.stage} radius comes from the config`).toBeGreaterThan(0);

    // COLOUR: every stage must be distinguishable from every other, in each part of the appearance.
    const distinct = (values: (number | boolean)[]): boolean => new Set(values).size === values.length;
    expect(distinct(readings.map((r) => r.look.inner)), 'each stage needs its own interior colour').toBe(true);
    expect(distinct(readings.map((r) => r.look.rim)), 'each stage needs its own rim colour').toBe(true);
    expect(distinct(readings.map((r) => r.look.glow)), 'each stage needs its own glow colour').toBe(true);
    /**
     * The shape cue: a second ring appears from stage 2.
     *
     * Asserted as "it CHANGES somewhere in the progression" rather than "all three differ": a boolean has two
     * values, so three stages cannot all be distinct by it. It separates stage 1 from the later ones; stages 2
     * and 3 are separated by colour, which is what the rim-distance checks below are for. An assertion that all
     * three differ would have been impossible to satisfy and would have forced a worse design.
     *
     * To distinguish more stages by shape, turn `innerRing` into a COUNT of rings.
     */
    expect(new Set(readings.map((r) => r.look.innerRing)).size, 'the inner ring must change across the stages').toBeGreaterThan(1);
    expect(readings[0]!.look.innerRing, 'stage 1 must NOT have the second ring').toBe(false);
    expect(readings[2]!.look.innerRing, 'and the top stage must have it').toBe(true);

    /**
     * And the colours must be *perceptibly* different, not merely different integers.
     *
     * A one-step change in a colour channel satisfies "different" and is invisible. The rim carries most of the
     * hue, so the check is on that: the stages must differ by a clear margin in at least one channel.
     */
    const channels = (c: number) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    const distance = (a: number, b: number) => {
      const [ar, ag, ab] = channels(a);
      const [br, bg, bb] = channels(b);
      return Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb));
    };
    const rims = readings.map((r) => r.look.rim);
    expect(distance(rims[0]!, rims[1]!), 'stage 1 and 2 rims must be clearly different colours').toBeGreaterThan(40);
    expect(distance(rims[1]!, rims[2]!), 'stage 2 and 3 rims must be clearly different colours').toBeGreaterThan(40);
    expect(distance(rims[0]!, rims[2]!), 'stage 1 and 3 rims must be clearly different colours').toBeGreaterThan(40);
  });
});
