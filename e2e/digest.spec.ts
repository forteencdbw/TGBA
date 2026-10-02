import { expect, test } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Digestion: the third way out of the stomach, and the only one that pays.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING TESTED
 * ---------------------------------------------------------------------------------------------
 * The claims the milestone is built on -- each one a thing the design promised and the code has to keep:
 *
 *   1. THE LEDGER CLOSES. What swallowing adds, both exits take back: spitting in one go, digesting by the slice.
 *      This is the one that was NOT true before. `spit.ts` and a commit message both said that spitting dropped
 *      your volume, and nothing anywhere reduced it, so 极限瘦身 did not exist. A regression here is silent, so it
 *      is measured rather than assumed.
 *   2. VOLUME FALLS WHILE DIGESTING, not only when the item is finished -- otherwise "double damage while
 *      digesting" is a cost attached to nothing.
 *   3. THE FUSE GOES OUT. Digestion is an answer to over-eating, or the only answer is spitting and the third exit
 *      has no reason to exist.
 *   4. SUCTION IS UNAVAILABLE while compressing, and hits cost more. The price that makes it a decision.
 *   5. THE RANK IS REAL: a small bubble that has digested can eat what its volume says it cannot, and the eat
 *      rule is asked through the SAME function the collision and the golden outline marker use.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY EVERY MEASUREMENT LIVES INSIDE ONE PAGE EVALUATION
 * ---------------------------------------------------------------------------------------------
 * The game keeps running between two `page.evaluate` round trips: the world scrolls, collectables stream past and
 * the bubble eats them, so a volume read before an action and a volume read after it are not describing the same
 * bubble. Every probe below therefore drives the control and samples the result inside a single evaluation, with a
 * `requestAnimationFrame` loop -- which is also how the durations get measured in GAME time rather than in the
 * test runner's.
 *
 * The water is also cleared at the start of each measurement, so a collectable drifting into the bubble cannot
 * quietly add volume under an assertion about volume going down. New content only ever enters at the TOP of the
 * view and the scroll brings it down over several seconds, which is far longer than any of these run for.
 *
 * The RATES are edited at runtime, which is the documented way to tune this config and the only sane way to test a
 * mechanism measured in seconds. `passivePerSecond` is set to ZERO: the slow trickle is supposed to be there, and
 * leaving it on would let it move the numbers under every assertion here.
 */

test.describe('digestion', () => {
  test('the ledger closes: eating adds volume, and digesting gives that same mass back', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { compressGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            diagnostics: { digest: { drained: number; completed: number; energy: number } };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 6;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      const start = g.player.volume;
      const gained = g.game.debugSwallowForTest('fish');
      const afterSwallow = g.player.volume;

      const b = g.game.touchRef.compressGeometry;
      g.game.handlePointerDown(94, b.x, b.y);
      let guard = 0;
      while (g.game.diagnostics.digest.completed < 1 && guard++ < 1800) await raf();
      g.game.handlePointerUp(94);
      await raf();

      const d = g.game.diagnostics.digest;
      return { start, gained, afterSwallow, volume: g.player.volume, drained: d.drained, completed: d.completed, energy: d.energy };
    });

    expect(r.gained, 'swallowing a fish must add its mass to the bubble').toBeGreaterThan(0);
    expect(r.afterSwallow, 'and the bubble must be visibly bigger').toBeCloseTo(r.start + r.gained, 6);
    expect(r.completed, 'the item must have finished digesting').toBe(1);

    /**
     * The claim, stated as the ledger rather than as an absolute volume.
     *
     * `drained` is the running total digestion has taken out of the bubble, so `drained == gained` says exactly
     * "everything eating added came back out", and it is immune to anything else that may have touched the volume.
     * The absolute check beside it is the same statement seen from the bubble's side.
     */
    expect(r.drained, 'digesting must give the whole mass back').toBeCloseTo(r.gained, 4);
    expect(r.volume, 'so the bubble ends where it started').toBeCloseTo(r.start, 4);
    expect(r.energy, 'and the mass that left is what pays for the rank').toBeGreaterThan(0);
  });

  test('volume falls WHILE digesting, with the item still inside', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { compressGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            diagnostics: { volume: number; digest: { progress: number; compressing: boolean; drained: number }; spit: { contents: string[] } };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      // Two seconds per item, so the middle of the process is easy to catch rather than a single frame.
      g.mechRef.digest.compressPerSecond = 0.5;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      const gained = g.game.debugSwallowForTest('crab');
      const start = g.player.volume;

      const b = g.game.touchRef.compressGeometry;
      g.game.handlePointerDown(94, b.x, b.y);
      let guard = 0;
      while (g.game.diagnostics.digest.progress < 0.4 && guard++ < 1800) await raf();

      const mid = {
        volume: g.player.volume,
        progress: g.game.diagnostics.digest.progress,
        drained: g.game.diagnostics.digest.drained,
        compressing: g.game.diagnostics.digest.compressing,
        contents: g.game.diagnostics.spit.contents.length,
      };
      g.game.handlePointerUp(94);
      return { gained, start, mid };
    });

    expect(r.mid.progress, 'the read must land partway through, not at either end').toBeGreaterThan(0);
    expect(r.mid.progress, 'and not finished').toBeLessThan(1);
    expect(r.mid.contents, 'with the item still in the stomach').toBe(1);
    expect(r.mid.compressing, 'the state must be reported while it lasts, or nothing can charge for it').toBe(true);

    /**
     * The shrink is proportional, not a step at the end.
     *
     * Asserted against `gained x progress` rather than against "less than before", because the loose version would
     * also pass for an implementation that drained the whole mass the instant compression began.
     */
    expect(r.mid.drained, 'some volume must have left already').toBeGreaterThan(0);
    expect(r.mid.volume, 'and the bubble must already be smaller by that much').toBeCloseTo(r.start - r.mid.drained, 4);
    expect(r.mid.volume, 'and smaller than it was').toBeLessThan(r.start);
  });

  test('digesting puts the over-eating fuse out by making room', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { digest: Record<string, number>; spit: { capacity: number; overloadFuseSeconds: number } };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { compressGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            diagnostics: { spit: { full: boolean; overloaded: boolean; contents: string[] }; digest: { completed: number } };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 6;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      const capacity = g.mechRef.spit.capacity;
      const fuseSeconds = g.mechRef.spit.overloadFuseSeconds;
      for (let i = 0; i < capacity; i++) g.game.debugSwallowForTest('fish');
      const full = g.game.diagnostics.spit.full;
      const lit = g.game.diagnostics.spit.overloaded;

      const b = g.game.touchRef.compressGeometry;
      g.game.handlePointerDown(94, b.x, b.y);
      let guard = 0;
      while (g.game.diagnostics.spit.overloaded && guard++ < 1800) await raf();
      g.game.handlePointerUp(94);

      return {
        capacity,
        fuseSeconds,
        full,
        lit,
        stillLit: g.game.diagnostics.spit.overloaded,
        contents: g.game.diagnostics.spit.contents.length,
        completed: g.game.diagnostics.digest.completed,
      };
    });

    // Long enough that a failure means "digestion cannot defuse it", not "the test was too slow".
    expect(r.fuseSeconds, 'this test needs a fuse with room to work in').toBeGreaterThan(2);
    expect(r.full, 'the stomach must actually be full').toBe(true);
    expect(r.lit, 'and a full stomach must light the fuse').toBe(true);

    /**
     * The fuse goes out WITHOUT the stomach being emptied, which is the interesting half.
     *
     * Anyone can stop being over-full by spitting everything; the claim is that digestion -- slower, and paid for
     * out of suction and health -- is a real second answer. Asserting only "the fuse went out" would also pass if
     * the item had somehow been flung out of the stomach instead.
     */
    expect(r.stillLit, 'digesting must put the fuse out').toBe(false);
    expect(r.completed, 'by finishing exactly one item').toBe(1);
    expect(r.contents, 'and the stomach must still be holding the rest').toBe(r.capacity - 1);
  });

  test('digesting buys eating rank, so a small bubble can eat what its volume says it cannot', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: {
            digest: Record<string, number>;
            consumption: { mass: Record<string, number>; massEfficiency: number };
          };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { compressGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            canEatHazardForTest: (kind: string) => boolean;
            diagnostics: { digest: { energy: number; tierBonus: number; tier: number; completed: number }; spit: { contents: string[] } };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 8;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      /**
       * The verdict at a PINNED volume of 1, which is the smallest a bubble can be.
       *
       * `canEatHazardForTest` is the real rule -- the same function the collision and the golden outline marker
       * ask -- so this cannot pass while the marker and the collision disagree, which is the one bug in this
       * feature that would punish the player for trusting the screen.
       */
      g.player.volume = 1;
      const before = { fish: g.game.canEatHazardForTest('fish'), tierBonus: g.game.diagnostics.digest.tierBonus };

      // How many fish the CONFIG says it takes to buy one rank, computed rather than hardcoded, so this test
      // keeps testing the mechanism after the owner retunes the economy.
      const perFish = g.mechRef.consumption.mass.fish! * g.mechRef.consumption.massEfficiency * g.mechRef.digest.energyPerMass!;
      const needed = Math.ceil(g.mechRef.digest.energyPerTier! / perFish) + 1;

      const b = g.game.touchRef.compressGeometry;
      for (let i = 0; i < needed; i++) {
        g.game.debugSwallowForTest('fish');
        g.game.handlePointerDown(94, b.x, b.y);
        let guard = 0;
        while (g.game.diagnostics.spit.contents.length > 0 && guard++ < 1800) await raf();
        g.game.handlePointerUp(94);
      }

      // Back to the same pinned volume, so the only thing that changed is the rank.
      g.player.volume = 1;
      return {
        before,
        needed,
        after: {
          fish: g.game.canEatHazardForTest('fish'),
          crab: g.game.canEatHazardForTest('crab'),
          energy: g.game.diagnostics.digest.energy,
          tierBonus: g.game.diagnostics.digest.tierBonus,
          tier: g.game.diagnostics.digest.tier,
        },
      };
    });

    console.log(
      `rank: ${r.needed} fish digested -> energy ${r.after.energy.toFixed(3)}, bonus ${r.after.tierBonus}, tier ${r.after.tier}; fish edible ${r.before.fish} -> ${r.after.fish}`,
    );

    expect(r.before.tierBonus, 'a fresh run starts with no rank bought').toBe(0);
    expect(r.before.fish, 'and a volume-1 bubble cannot eat a fish').toBe(false);
    expect(r.after.tierBonus, 'the energy must have bought at least one rank').toBeGreaterThanOrEqual(1);
    expect(r.after.fish, 'so the same bubble can now eat the fish its volume alone would not allow').toBe(true);
    expect(r.after.tier, 'and the reported tier must be the one the rule is using').toBe(1 + r.after.tierBonus);
    expect(r.after.crab, 'while a crab needs three ranks, and is a separate question').toBe(r.after.tierBonus >= 3);
  });

  test('compressing disables suction and doubles the damage taken', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { compressGeometry: { x: number; y: number }; skillGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            debugForceHit: () => void;
            diagnostics: { suction: { held: boolean }; digest: { compressing: boolean } };
          };
        };
      }).__GB;
      /**
       * NO DIGESTION AT ALL in this test.
       *
       * The drain would otherwise be moving the volume at the same time as the hit, and the measurement would be
       * of the two together.
       */
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      // Something to compress, so the state is available at all.
      g.game.debugSwallowForTest('fish');

      /**
       * One measurement, with the SUCTION BUTTON HELD IN BOTH RUNS.
       *
       * That is what makes the comparison about the compression rather than about the field: the only difference
       * between the two runs is whether the compress button is also down. `debugForceHit` bypasses invulnerability
       * and goes through the same `takeHit` every hazard, obstacle and trash bag uses, so this measures the real
       * rule rather than a copy of it.
       */
      const measure = async (compressing: boolean): Promise<{ drop: number; sucking: boolean; digesting: boolean }> => {
        g.player.volume = 6;
        const skill = g.game.touchRef.skillGeometry;
        g.game.handlePointerDown(91, skill.x, skill.y);
        if (compressing) {
          const b = g.game.touchRef.compressGeometry;
          g.game.handlePointerDown(92, b.x, b.y);
        }
        await raf();
        await raf();

        const before = g.player.volume;
        const sucking = g.game.diagnostics.suction.held;
        const digesting = g.game.diagnostics.digest.compressing;
        g.game.debugForceHit();
        await raf();
        const drop = before - g.player.volume;

        g.game.handlePointerUp(92);
        g.game.handlePointerUp(91);
        await raf();
        return { drop, sucking, digesting };
      };

      const calm = await measure(false);
      const squeezed = await measure(true);
      const expected = 1 + g.mechRef.digest.extraHitPoints!;
      return { calm, squeezed, expected };
    });

    console.log(
      `hit for ${r.calm.drop.toFixed(3)} volume calm, ${r.squeezed.drop.toFixed(3)} while compressing; suction held ${r.calm.sucking} / ${r.squeezed.sucking}`,
    );

    expect(r.calm.sucking, 'suction works normally when not compressing').toBe(true);
    expect(r.calm.digesting, 'and the bubble is not in the digesting state').toBe(false);
    expect(r.squeezed.sucking, 'suction is unavailable while compressing, even with the button held').toBe(false);
    expect(r.squeezed.digesting, 'and the state is live').toBe(true);

    expect(r.calm.drop, 'a hit costs volume').toBeGreaterThan(0);
    expect(r.squeezed.drop, 'and costs MORE while compressing').toBeGreaterThan(r.calm.drop);
    expect(r.squeezed.drop / r.calm.drop, 'by exactly the configured multiple').toBeCloseTo(r.expected, 3);
  });

  test('the spit button still fires instantly, and what it fires carries the mass out', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            projectilesRef: unknown[];
            diagnostics: { spit: { contents: string[] }; digest: { drained: number } };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;

      const start = g.player.volume;
      const gained = g.game.debugSwallowForTest('crab');

      /**
       * A SINGLE PRESS, WHILE THE THUMB STAYS DOWN.
       *
       * Spitting has to stay a discrete, immediate shot: it is the reflex answer to a fuse that is burning. The
       * press is consumed by the next simulation step rather than inside the pointer handler -- the game reads
       * input once per step, which is the same one-frame latency every other control has -- so the shot is
       * asserted after ONE animation frame, with the button STILL HELD.
       *
       * That is the claim worth making: holding the button does not turn the press into "wait and see". A binding
       * that resolved "tap or hold" by waiting out a threshold would put a delay on the one action in this game
       * that cannot afford one, which is why compressing is a control of its own.
       */
      const b = g.game.touchRef.spitGeometry;
      g.game.handlePointerDown(95, b.x, b.y);
      await raf();
      const inFlightAfterAFrame = g.game.projectilesRef.length;
      const emptyAfterAFrame = g.game.diagnostics.spit.contents.length === 0;
      g.game.handlePointerUp(95);
      await raf();

      return {
        start,
        gained,
        inFlightAfterAFrame,
        emptyAfterAFrame,
        volume: g.player.volume,
        drained: g.game.diagnostics.digest.drained,
      };
    });

    expect(r.inFlightAfterAFrame, 'the shot must already be in the air a frame after the press, with the button held').toBe(1);
    expect(r.emptyAfterAFrame, 'and the stomach must be empty').toBe(true);
    expect(r.volume, 'spitting hands the mass straight back -- this is the 极限瘦身 the design promised').toBeCloseTo(
      r.start,
      4,
    );
    expect(r.drained, 'and it is not digestion that took it: the ledger stays exact').toBe(0);
  });
});
