import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, player, startFromMenu, waitForPhase } from './helpers';

/**
 * Suction: a long press pulls light things toward the bubble.
 *
 * ---------------------------------------------------------------------------------------------
 * THE THREE CLAIMS WORTH TESTING
 * ---------------------------------------------------------------------------------------------
 * 1. It PULLS, and toward the player rather than in some other direction.
 * 2. It costs SPEED. Without the cost there is no decision, only a free widening of the mouth.
 * 3. Heavier things come more slowly. This is what makes the mechanic grow with the player, so it is the part
 *    that would be silently missing if the mass ratio were ignored.
 *
 * And deliberately NOT claimed: that it feeds you. Suction only pulls; the consumption tier still decides what
 * happens on contact, which is what keeps "drag a crab you cannot eat into your own face" possible.
 */

const cfg = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: { mechRef: { suction: { radiusRatio: number; radiusPerVolume: number; maxRadiusRatio: number; pullPerSecond: number; moveSpeedFactor: number } } };
    }).__GB;
    return g.mechRef.suction;
  });

/** Hold or release the suction button through the game's own pointer path. */
const holdSuction = (page: Page, held: boolean) =>
  page.evaluate(
    (on) => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { skillGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
          };
        };
      }).__GB.game;
      const b = g.touchRef.skillGeometry;
      if (on) g.handlePointerDown(91, b.x, b.y);
      else g.handlePointerUp(91);
    },
    held,
  );

test.describe('suction', () => {
  test('holding the button raises the field, and releasing drops it', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    expect((await diagnostics(page)).suction.held, 'the field starts down').toBe(false);

    await holdSuction(page, true);
    await expect.poll(async () => (await diagnostics(page)).suction.held, { timeout: 3000 }).toBe(true);

    await holdSuction(page, false);
    await expect.poll(async () => (await diagnostics(page)).suction.held, { timeout: 3000 }).toBe(false);
  });

  test('the field costs movement speed', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const c = await cfg(page);

    /**
     * Measure travel over a fixed window with the field down and then up, from the same place.
     *
     * Displacement rather than a read of `moveFactor`: the factor is a number the game reports about itself, and
     * the claim worth testing is that the bubble actually moves less.
     */
    const travel = async (sucking: boolean): Promise<number> => {
      await page.evaluate(() => {
        const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.5;
      });
      if (sucking) await holdSuction(page, true);
      const before = await player(page);
      await page.keyboard.down('KeyD');
      await page.waitForTimeout(400);
      await page.keyboard.up('KeyD');
      const after = await player(page);
      if (sucking) await holdSuction(page, false);
      return after.x - before.x;
    };

    const free = await travel(false);
    const gathering = await travel(true);

    expect(free, 'the free run must actually move, or the comparison means nothing').toBeGreaterThan(0.05);
    expect(gathering, 'gathering must move the bubble LESS').toBeLessThan(free);
    // And by roughly the configured factor, within frame-timing noise.
    expect(gathering / free).toBeGreaterThan(c.moveSpeedFactor * 0.6);
    expect(gathering / free).toBeLessThan(c.moveSpeedFactor * 1.5);
  });

  test('a collectable inside the field is pulled toward the player', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * Park a bubble inside the field and watch the DISTANCE close.
     *
     * Distance rather than position, because the whole world is scrolling: a bubble's absolute y changes whether
     * or not anything is pulling it, so only the gap to the player answers the question.
     */
    const reading = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: { skillGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            spawnBubbleOnPlayer: (r: number) => void;
            fieldRef: { bubbles: { x: number; y: number }[] };
            camera: { viewport: { laneWidthMeters: number } };
            diagnostics: { suction: { radiusFraction: number; held: boolean } };
          };
          player: { x: number; y: number; volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      const button = g.game.touchRef.skillGeometry;

      // A big bubble, so the field is wide.
      g.player.volume = 4;
      g.game.spawnBubbleOnPlayer(0.9);

      const lane = g.game.camera.viewport.laneWidthMeters;
      const reach = g.game.diagnostics.suction.radiusFraction;
      const target = g.game.fieldRef.bubbles[g.game.fieldRef.bubbles.length - 1]!;
      // Three quarters of the way out, and offset LATERALLY so the pull has a direction to act in rather than
      // only an axis the world is already moving along.
      target.x = g.player.x * lane + lane * reach * 0.7;
      target.y = g.player.y;

      const gap = () => Math.hypot(target.x - g.player.x * lane, target.y - g.player.y);
      const gapBefore = gap();

      g.game.handlePointerDown(91, button.x, button.y);
      for (let i = 0; i < 20; i++) await raf();
      const gapAfter = gap();
      const held = g.game.diagnostics.suction.held;
      g.game.handlePointerUp(91);

      return { gapBefore, gapAfter, held, reach, lane };
    });

    expect(reading.held, 'the field must have been up for the pull to be the cause').toBe(true);
    expect(reading.gapBefore, 'the bubble must start inside the field').toBeGreaterThan(0.5);
    expect(reading.gapAfter, 'and the gap must have closed').toBeLessThan(reading.gapBefore * 0.95);
  });

  test('a heavier target is pulled in more slowly than a lighter one', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * THE CLAIM THAT MAKES THE MECHANIC GROW WITH THE PLAYER.
     *
     * The pull scales with a target's mass RELATIVE to the player's, so the same speck is heavy when you are tiny
     * and trivial when you are huge, with no second progression to maintain. If the mass ratio were ignored, the
     * field would be equally strong on everything and the mechanic would collapse into "hold to win".
     *
     * ---------------------------------------------------------------------------------------------
     * TWO COMPARISONS THIS TEST GOT WRONG BEFORE ARRIVING HERE
     * ---------------------------------------------------------------------------------------------
     * The first version compared the gap a collectable closed against the gap a FISH closed. It failed, and for
     * two separate reasons: a fish swims at the player on its own, so its gap closes for reasons the field had
     * nothing to do with; and the collectable's mass happened to be HIGHER than the fish's (0.9 against 0.28), so
     * both were under the ratio-1 threshold and received an identical FULL pull. The premise "a fish is heavier
     * than a collectable" was simply false.
     *
     * The second version measured each target with the field down and up, which isolates the pull -- but the
     * targets were still both light, so the heavy path of the decay was never exercised and the numbers it
     * produced were noise dressed as a result.
     *
     * So both conditions are now stated rather than assumed: ONE player size, and two collectables chosen to
     * straddle the threshold -- one well under the player's mass, one well over.
     */
    const pullContribution = async (sizeRatio: number, playerVolume: number): Promise<{ free: number; pulled: number; mass: number }> =>
      page.evaluate(
        async (args: { sizeRatio: number; playerVolume: number }) => {
          const g = (window as unknown as {
            __GB: {
              game: {
                touchRef: { skillGeometry: { x: number; y: number } };
                handlePointerDown: (id: number, x: number, y: number) => void;
                handlePointerUp: (id: number) => void;
                spawnBubbleOnPlayer: (r: number) => void;
                fieldRef: { bubbles: { x: number; y: number; volume: number }[] };
                camera: { viewport: { laneWidthMeters: number } };
                diagnostics: { suction: { radiusFraction: number } };
              };
              player: { x: number; y: number; volume: number };
            };
          }).__GB;
          const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
          const button = g.game.touchRef.skillGeometry;

          /** Place one fresh collectable at a known spot and report how far the gap closes over 15 frames. */
          const run = async (sucking: boolean): Promise<{ closed: number; mass: number }> => {
            g.player.volume = args.playerVolume;
            if (sucking) g.game.handlePointerDown(91, button.x, button.y);

            g.game.spawnBubbleOnPlayer(args.sizeRatio);
            const list = g.game.fieldRef.bubbles;
            const target = list[list.length - 1]!;
            const lane = g.game.camera.viewport.laneWidthMeters;
            const reach = g.game.diagnostics.suction.radiusFraction;
            // The same starting condition every run: laterally at 60% of the reach, level with the player.
            target.x = g.player.x * lane + lane * reach * 0.6;
            target.y = g.player.y;
            const gap = () => Math.hypot(target.x - g.player.x * lane, target.y - g.player.y);
            const before = gap();

            for (let i = 0; i < 15; i++) await raf();
            const closed = 1 - gap() / Math.max(1e-6, before);
            if (sucking) g.game.handlePointerUp(91);
            return { closed, mass: target.volume };
          };

          /**
           * Free FIRST, so the field is never left up into the other measurement.
           *
           * A field left on would make the baseline itself pulled and the difference would collapse to nothing --
           * the kind of silent contamination that makes a comparison meaningless.
           */
          const free = await run(false);
          const pulled = await run(true);
          return { free: free.closed, pulled: pulled.closed, mass: pulled.mass };
        },
        { sizeRatio, playerVolume },
      );

    const playerVolume = 1;
    // A small speck, well under the player's mass, and a big one well over it.
    const light = await pullContribution(0.4, playerVolume);
    const heavy = await pullContribution(2.2, playerVolume);
    const lightPull = light.pulled - light.free;
    const heavyPull = heavy.pulled - heavy.free;

    console.log(
      `pull contribution: light (mass ${light.mass.toFixed(2)}) ${lightPull.toFixed(4)}, ` +
        `heavy (mass ${heavy.mass.toFixed(2)}) ${heavyPull.toFixed(4)}, player volume ${playerVolume}`,
    );

    // The premise, asserted rather than assumed: the two must actually straddle the player's mass.
    expect(light.mass, 'the light collectable must be under the player mass').toBeLessThan(playerVolume);
    expect(heavy.mass, 'the heavy collectable must be over it').toBeGreaterThan(playerVolume);

    expect(lightPull, 'the field must measurably add to a light collectable closing the gap').toBeGreaterThan(0.05);
    expect(heavyPull, 'and must add LESS to the heavier one').toBeLessThan(lightPull);
    // The heavy path is a genuine decay, not merely "slightly less": it should be a small fraction of the light.
    expect(heavyPull, 'the heavy target should be pulled at a small fraction of the light one').toBeLessThan(lightPull * 0.6);
  });

  test('releasing stops the pull, it does not leave the field on', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    await holdSuction(page, true);
    await page.waitForTimeout(120);
    await holdSuction(page, false);
    await page.waitForTimeout(120);

    const d = await diagnostics(page);
    expect(d.suction.held, 'the field must be down after release').toBe(false);
    // A field left on would silently drain the player's speed forever, which reads as the controls being broken.
    expect(d.suction.moveFactor, 'and the movement penalty must be gone with it').toBeCloseTo(1, 5);
  });
});
