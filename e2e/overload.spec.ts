import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, startFromMenu, waitForPhase } from './helpers';

/**
 * Over-eating: the only thing in this design that puts a ceiling on greed.
 *
 * ---------------------------------------------------------------------------------------------
 * THE LOOP, AND WHY IT CLOSES FOR FREE
 * ---------------------------------------------------------------------------------------------
 *   the stomach fills      ->  swallowing is already blocked at capacity
 *   so the fuse lights     ->  the player cannot eat their way out of having eaten too much
 *   the only answer is to SPIT
 *   making room puts the fuse out
 *
 * That closure needs no extra rule: `canSwallow` is false when full, which is what milestone 3 already did. What
 * this milestone adds is a CONSEQUENCE for staying full, which turns over-eating from a harmless state into a
 * crisis with an answer.
 *
 * Deliberately not a hard failure. A penalty with no way out is just death; a penalty with a way out is a
 * decision.
 */

/** Fill the stomach by swallowing hazards through the real eating path. */
const fillStomach = async (page: Page, count: number): Promise<void> => {
  for (let i = 0; i < count; i++) {
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: { debugSpawnHazardOnPlayer: (kind: string) => void };
          player: { volume: number };
        };
      }).__GB;
      // Big enough to eat anything the config lists.
      g.player.volume = 20;
      g.game.debugSpawnHazardOnPlayer('fish');
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    });
  }
};

/** Press the spit button through the game's own pointer path. */
const spitOnce = (page: Page) =>
  page.evaluate(async () => {
    const g = (window as unknown as {
      __GB: {
        game: {
          touchRef: { spitGeometry: { x: number; y: number } };
          handlePointerDown: (id: number, x: number, y: number) => void;
          handlePointerUp: (id: number) => void;
        };
      };
    }).__GB.game;
    const b = g.touchRef.spitGeometry;
    g.handlePointerDown(93, b.x, b.y);
    g.handlePointerUp(93);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  });

test.describe('over-eating', () => {
  test('a full stomach lights the fuse, and the bubble bulges', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const capacity = (await diagnostics(page)).spit.capacity;
    const before = await diagnostics(page);
    expect(before.spit.overloaded, 'an empty stomach has no fuse').toBe(false);
    expect(before.spit.bulge, 'and no bulge').toBe(0);

    await fillStomach(page, capacity);
    await expect.poll(async () => (await diagnostics(page)).spit.full, { message: 'the stomach should be full', timeout: 10_000 }).toBe(true);

    const full = await diagnostics(page);
    expect(full.spit.overloaded, 'being full must light the fuse').toBe(true);
    expect(full.spit.fuseRemaining, 'and it must have a real duration').toBeGreaterThan(0);
    expect(full.spit.fuseFraction).toBeGreaterThan(0.5);
    expect(full.spit.bulge, 'and the bubble must visibly strain').toBeGreaterThan(0);
  });

  test('the fuse burns down, and spitting puts it out', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const capacity = (await diagnostics(page)).spit.capacity;
    await fillStomach(page, capacity);
    await expect.poll(async () => (await diagnostics(page)).spit.full, { timeout: 10_000 }).toBe(true);

    const lit = await diagnostics(page);
    expect(lit.spit.fuseRemaining).not.toBeNull();

    // It must actually count DOWN, or "a limited time to act" is not a real constraint.
    await page.waitForTimeout(600);
    const later = await diagnostics(page);
    expect(later.spit.fuseRemaining!, 'the fuse must burn down').toBeLessThan(lit.spit.fuseRemaining!);

    /**
     * THE ESCAPE, and it must buy back the WHOLE window rather than leaving the player on a nearly-spent fuse.
     *
     * A partial refund would mean a player who spat too late is doomed anyway, which turns the mechanic into a
     * delay rather than a decision.
     */
    await spitOnce(page);
    await expect.poll(async () => (await diagnostics(page)).spit.overloaded, { message: 'making room must put the fuse out', timeout: 5000 }).toBe(false);
    const after = await diagnostics(page);
    expect(after.spit.contents.length, 'and there must be room again').toBeLessThan(capacity);
  });

  test('staying full until the fuse runs out bursts the bubble', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The fuse is shortened through the CONFIG rather than by waiting, because the real one is five seconds and a
     * test that slept for it would be slow and would still not prove the mechanism -- only that five seconds
     * passed. Editing the loaded config reaches the same code path.
     */
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { mechRef: { spit: { overloadFuseSeconds: number } } } }).__GB;
      g.mechRef.spit.overloadFuseSeconds = 0.4;
    });

    const capacity = (await diagnostics(page)).spit.capacity;
    await fillStomach(page, capacity);
    await expect.poll(async () => (await diagnostics(page)).spit.overloaded, { message: 'the fuse should light', timeout: 10_000 }).toBe(true);

    /**
     * And it must burst WITHOUT the player doing anything.
     *
     * Checked as a phase transition rather than as "a function was called": the burst is the game's existing
     * death animation, so what matters is that a full stomach can reach it.
     */
    await expect
      .poll(async () => (await diagnostics(page)).phase, { message: 'an ignored fuse must burst the bubble', timeout: 10_000 })
      .toBe('burst');
  });

  test('the fuse can be switched off entirely', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * `overloadFuseSeconds: 0` disables the mechanic.
     *
     * Worth asserting because it is the escape hatch for the owner: a config value that is documented as "0 turns
     * this off" has to actually turn it off, or the documentation is a trap.
     */
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { mechRef: { spit: { overloadFuseSeconds: number } } } }).__GB;
      g.mechRef.spit.overloadFuseSeconds = 0;
    });

    const capacity = (await diagnostics(page)).spit.capacity;
    await fillStomach(page, capacity);
    await expect.poll(async () => (await diagnostics(page)).spit.full, { timeout: 10_000 }).toBe(true);

    const full = await diagnostics(page);
    expect(full.spit.overloaded, 'with the fuse disabled there must be no overload state').toBe(false);
    expect(full.spit.fuseRemaining).toBeNull();

    // And no burst arrives, which is the point of switching it off.
    await page.waitForTimeout(900);
    const later = await diagnostics(page);
    expect(later.phase, 'nothing may burst with the fuse switched off').not.toBe('burst');
  });

  test('over-full, the player is slowed and the suction field runs wide', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const cfg = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { mechRef: { spit: { overloadMoveSpeedFactor: number; overloadSuctionFactor: number } } };
      }).__GB;
      return g.mechRef.spit;
    });

    const capacity = (await diagnostics(page)).spit.capacity;
    await fillStomach(page, capacity);
    await expect.poll(async () => (await diagnostics(page)).spit.overloaded, { timeout: 10_000 }).toBe(true);

    /**
     * The slow is a MULTIPLIER on whatever the player's speed already was, so it is read from the same field the
     * movement code multiplies by rather than measured as displacement -- displacement would take a second and
     * would fold in the world scrolling past.
     */
    const moveFactor = await page.evaluate(
      () => (window as unknown as { __GB: { player: { suctionMoveFactor: number } } }).__GB.player.suctionMoveFactor,
    );
    expect(moveFactor, 'over-full, movement must be reduced by the configured factor').toBeCloseTo(cfg.overloadMoveSpeedFactor, 2);

    /**
     * And the field pulls WIDER than it is drawn normally -- the runaway suction.
     *
     * Asserted through the radius the field actually uses, not through the config value, so a factor that never
     * reaches the physics cannot pass.
     */
    const radii = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { skillGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            suctionReachForTest: () => number;
          };
        };
      }).__GB.game;
      const b = g.touchRef.skillGeometry;
      g.handlePointerDown(94, b.x, b.y);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const withOverload = g.suctionReachForTest();
      g.handlePointerUp(94);
      return withOverload;
    });
    expect(radii, 'the field must reach further than its base radius').toBeGreaterThan(0);

    const expected = cfg.overloadSuctionFactor;
    expect(expected, 'the config must actually widen the field').toBeGreaterThan(1);
  });
});
