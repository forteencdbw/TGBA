import { expect, test, type Page } from '@playwright/test';
import { boot, expectNoErrors, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The food-chain reversal: what you had to dodge, you can turn around and eat.
 *
 * The rule is deliberately DOUBLE-SIDED. Below the tier the same overlap costs a hit; at or above it, the hazard
 * becomes mass. These tests drive both sides, because a rule that only ever granted food would pass a test that
 * only checked the eating half while being a completely different game.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO THINGS THESE TESTS HAD TO LEARN THE HARD WAY
 * ---------------------------------------------------------------------------------------------
 * 1. PIN THE VOLUME. The first version relied on the run "starting small" -- but the water is full of
 *    collectables that the bubble eats as they arrive, so within a second the volume had crossed the fish's tier
 *    on its own and the fish stopped being a threat. The test then failed against a working mechanic. A claim
 *    about a threshold has to pin the value on the side of it being claimed.
 *
 * 2. READ THE OUTCOME IN THE SAME EVALUATION THAT SPAWNS. The contact resolves synchronously and the hazard is
 *    pushed clear on the same frame, so reading the counters from Node afterwards finds a fish that has already
 *    been bounced away. An earlier version read `hits` a step too late and reported zero against a hit that had
 *    already landed.
 */

/** The consumption config the running build actually loaded. */
const consumption = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: {
        mechRef: {
          consumption: {
            tierVolume: number[];
            edibleAtTier: Record<string, number>;
            mass: Record<string, number>;
            massEfficiency: number;
          };
        };
      };
    }).__GB;
    return g.mechRef.consumption;
  });

/**
 * Whether this kind is edible AT a given volume, asked in one round trip.
 *
 * ATOMIC on purpose. Setting the volume and then asking the question as two separate calls is a race: the bubble
 * keeps eating collectables, so the answer can change in between. An earlier version did that and read `false`
 * at a volume of 2.2 against a rule that says `true`, so the assertion failed while the mechanic was fine.
 *
 * The volume is a parameter rather than read from the player precisely so there is no window in which the game
 * can move it.
 */
const canEatAt = (page: Page, kind: string, volume: number) =>
  page.evaluate(
    (args) => {
      const g = (window as unknown as {
        __GB: { game: { canEatHazardForTest: (kind: string) => boolean }; player: { volume: number } };
      }).__GB;
      g.player.volume = args.volume;
      return g.game.canEatHazardForTest(args.kind);
    },
    { kind, volume },
  );

/**
 * Spawn a hazard on the player and report the outcome, measured INSIDE one page evaluation.
 *
 * The volume is re-pinned on every attempt, because the bubble keeps eating collectables on its own and would
 * otherwise drift across the tier boundary between attempts.
 */
const tryEat = (page: Page, kind: 'fish' | 'jelly' | 'trash' | 'crab', volume: number) =>
  page.evaluate(
    async (args) => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (k: string) => void;
            diagnostics: { stats: { hits: number } };
            hazardsRef: { eaten: number };
          };
          player: { volume: number };
        };
      }).__GB;
      g.player.volume = args.volume;
      const hitsBefore = g.game.diagnostics.stats.hits;
      g.game.debugSpawnHazardOnPlayer(args.kind);
      // A frame for the contact to resolve.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return { hitsBefore, hitsAfter: g.game.diagnostics.stats.hits, eaten: g.game.hazardsRef.eaten };
    },
    { kind, volume },
  );

test.describe('eating hazards', () => {
  test('a bubble below the fish tier is HURT by a fish rather than eating it', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const cfg = await consumption(page);
    const fishTier = cfg.edibleAtTier.fish!;
    // Halfway between the rung below and this one, so it is unambiguously short of the threshold.
    const justBelow = ((cfg.tierVolume[fishTier - 2] ?? 0) + (cfg.tierVolume[fishTier - 1] ?? 0)) / 2;
    expect(await canEatAt(page, 'fish', justBelow), `volume ${justBelow} must be BELOW the fish tier`).toBe(false);

    const result = await tryEat(page, 'fish', justBelow);

    expect(result.eaten, 'a bubble below the tier must NOT eat a fish').toBe(0);
    expect(result.hitsAfter, 'and the fish must still hurt').toBeGreaterThan(result.hitsBefore);
    await expectNoErrors(errors);
  });

  test('a bubble at the fish tier EATS the same fish instead of being hurt', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The SAME creature, the same overlap, the opposite outcome -- and the only difference is a volume the
     * player would have earned.
     */
    const cfg = await consumption(page);
    const justAt = cfg.tierVolume[cfg.edibleAtTier.fish! - 1] ?? 1;
    expect(justAt, 'the fish tier must be reachable on the ladder').toBeGreaterThan(0);

    /**
     * Pin the volume and read the verdict in ONE evaluation.
     *
     * Two round trips is a race: the bubble keeps eating collectables, so between setting the volume and asking
     * whether a fish is edible the answer can change. An earlier version did exactly that and read `false` at a
     * volume of 2.2, against a rule that says `true` -- the assertion failed and the mechanic was fine.
     */
    const atTier = await page.evaluate((v) => {
      const g = (window as unknown as {
        __GB: { game: { canEatHazardForTest: (kind: string) => boolean }; player: { volume: number } };
      }).__GB;
      g.player.volume = v;
      return g.game.canEatHazardForTest('fish');
    }, justAt);
    expect(atTier, `volume ${justAt} must reach the fish tier`).toBe(true);

    /**
     * Polled, because one attempt can be unlucky -- a fish can be bounced clear before the collision registers.
     * The counter is monotonic, which is what makes "did it EVER happen" answerable.
     */
    let last: { hitsBefore: number; hitsAfter: number; eaten: number } = { hitsBefore: 0, hitsAfter: 0, eaten: 0 };
    await expect
      .poll(
        async () => {
          last = await tryEat(page, 'fish', justAt);
          return last.eaten;
        },
        { message: 'a bubble at the fish tier must be able to eat one', timeout: 20_000, intervals: [250] },
      )
      .toBeGreaterThan(0);

    /**
     * And eating must not ALSO have cost a hit.
     *
     * The decisive attempt is the one that ate, so the assertion is on that attempt's own before/after rather
     * than on a running total: earlier attempts in the poll may have been touched by something else, and a
     * running total would attribute those to the eat.
     */
    expect(last.hitsAfter, 'the attempt that ate must not also have taken damage').toBe(last.hitsBefore);
  });

  test('each kind becomes edible at the tier the config names', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * Walk the ladder and check the rule at EVERY rung, driven by the config's own `tierVolume`.
     *
     * The test asserts that the tier a volume lands in decides edibility, whatever the numbers are -- so
     * retuning the ladder or the table does not break it. The thresholds themselves belong to the owner.
     */
    const cfg = await consumption(page);
    const kinds = ['fish', 'jelly', 'trash', 'crab'] as const;

    for (const kind of kinds) {
      expect(cfg.mass[kind], `${kind} needs a mass`).toBeGreaterThan(0);
      expect(cfg.edibleAtTier[kind], `${kind} needs an edibility tier`).toBeGreaterThanOrEqual(1);
    }

    let previous: Record<string, boolean> = {};
    for (let tier = 1; tier <= cfg.tierVolume.length; tier++) {
      const volume = cfg.tierVolume[tier - 1]! + 0.01;
      for (const kind of kinds) {
        const now = await canEatAt(page, kind, volume);
        const shouldBe = tier >= cfg.edibleAtTier[kind]!;
        expect(now, `at tier ${tier}, ${kind} edibility should follow edibleAtTier (${cfg.edibleAtTier[kind]})`).toBe(shouldBe);
        // The ladder must be MONOTONE in the game's terms: growing never takes a food source away. Checked in
        // the same walk, because the failure it guards is a rung out of order.
        if (previous[kind]) expect(now, `${kind} must stay edible once edible`).toBe(true);
        previous[kind] = now;
      }
    }
  });

  test('the mass gained comes from the config, not from a literal', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const cfg = await consumption(page);
    // Top rung, so a fish is unambiguously edible and the only thing under test is the mass it yields.
    const top = cfg.tierVolume[cfg.tierVolume.length - 1]! + 1;

    /**
     * Measure the volume change across the SAME evaluation that spawns.
     *
     * Reading it from Node afterwards would include whatever collectables drifted in during the round trip, which
     * is a much larger number than a fish is worth and would make the assertion meaningless.
     */
    let gained = 0;
    await expect
      .poll(
        async () => {
          const r = await page.evaluate(
            async (v) => {
              const g = (window as unknown as {
                __GB: {
                  game: { debugSpawnHazardOnPlayer: (k: string) => void; hazardsRef: { eaten: number } };
                  player: { volume: number };
                };
              }).__GB;
              g.player.volume = v;
              const before = g.player.volume;
              const eatenBefore = g.game.hazardsRef.eaten;
              g.game.debugSpawnHazardOnPlayer('fish');
              await new Promise<void>((res) => requestAnimationFrame(() => res()));
              return { eaten: g.game.hazardsRef.eaten, gained: g.player.volume - before, ateThisTime: g.game.hazardsRef.eaten > eatenBefore };
            },
            top,
          );
          // Report the gain only from an attempt that actually ate, so the measurement is of a fish.
          if (r.ateThisTime) gained = r.gained;
          return r.eaten;
        },
        { message: 'a bubble at the top tier must eat a fish', timeout: 20_000, intervals: [250] },
      )
      .toBeGreaterThan(0);

    /**
     * The gain must be about `mass.fish * massEfficiency`.
     *
     * Bounded rather than exact: `growByAbsorbing` has its own shape and the frame may have caught a collectable
     * too. What matters is that the config value drove it -- a hardcoded literal would show up as a number
     * unrelated to the file.
     */
    const expected = cfg.mass.fish! * cfg.massEfficiency;
    expect(gained, `one fish should be worth about ${expected.toFixed(2)}`).toBeGreaterThan(expected * 0.5);
    expect(gained, 'and not wildly more, which would mean something else was eaten too').toBeLessThan(expected * 4);
  });
});
