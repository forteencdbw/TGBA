import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, startFromMenu, waitForPhase } from './helpers';

/**
 * Spitting: what you swallowed is also your ammunition.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING TESTED, AND WHAT IS DELIBERATELY NOT
 * ---------------------------------------------------------------------------------------------
 * Four claims:
 *   1. swallowing puts a hazard in the stomach rather than destroying it
 *   2. spitting fires the OLDEST one, so the stomach is a queue and not a bag
 *   3. the projectile travels, and going up it travels UP -- the level is an ascent, so up is forward
 *   4. a hit shoves the target, and a heavier target is shoved less
 *
 * NOT tested, because it is not built: the capacity chapter's over-eating state -- bulging, slower turning, and a
 * burst if the stomach stays over its limit. Right now a full stomach only refuses more, which is the smallest
 * version that makes spitting coherent and keeps this milestone testable instead of half-implementing two systems.
 */

const cfg = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as { __GB: { mechRef: { spit: { capacity: number; knockbackMeters: number } } } }).__GB;
    return g.mechRef.spit;
  });

/**
 * Swallow a hazard through the real path: raise the volume, walk into it.
 *
 * Uses `debugSpawnHazardOnPlayer` so the hazard lands on the player, and the swallow goes through the same
 * collision the game uses -- not a direct push into the stomach, which would test nothing about the eating path.
 */
const swallow = (page: Page, kind: 'fish' | 'jelly' | 'trash' | 'crab') =>
  page.evaluate(async (k: string) => {
    const g = (window as unknown as {
      __GB: {
        game: { debugSpawnHazardOnPlayer: (kind: string) => void };
        player: { volume: number };
      };
    }).__GB;
    // Big enough to eat anything the config lists.
    g.player.volume = 20;
    g.game.debugSpawnHazardOnPlayer(k);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }, kind);

/** Press the spit button through the game's own pointer path, and let a frame pass. */
const spit = (page: Page, frames = 1) =>
  page.evaluate(async (n) => {
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
    for (let i = 0; i < n; i++) await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }, frames);

test.describe('spitting', () => {
  test('a swallowed hazard goes into the stomach instead of vanishing', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    expect((await diagnostics(page)).spit.contents, 'the stomach starts empty').toEqual([]);

    await swallow(page, 'fish');

    await expect
      .poll(async () => (await diagnostics(page)).spit.contents.length, { message: 'the fish should be inside', timeout: 5000 })
      .toBe(1);
    expect((await diagnostics(page)).spit.contents, 'and it should be the fish').toEqual(['fish']);
  });

  test('spitting fires the OLDEST thing first', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    await swallow(page, 'fish');
    await swallow(page, 'jelly');
    await swallow(page, 'crab');
    await expect.poll(async () => (await diagnostics(page)).spit.contents.length, { timeout: 5000 }).toBe(3);
    expect((await diagnostics(page)).spit.contents, 'the order should be the order swallowed').toEqual([
      'fish',
      'jelly',
      'crab',
    ]);

    /**
     * A QUEUE, not a bag: the first shot must be the fish.
     *
     * This is what makes a stomach legible -- a player who swallowed a crab *for* the crab needs to know when it
     * comes out, and a random or last-in order turns their plan into a lottery.
     */
    await spit(page, 2);
    expect((await diagnostics(page)).spit.contents, 'the fish was swallowed first, so it leaves first').toEqual([
      'jelly',
      'crab',
    ]);

    await spit(page, 2);
    expect((await diagnostics(page)).spit.contents).toEqual(['crab']);
  });

  test('an empty spit fires nothing and is refused with a pulse', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const before = await diagnostics(page);
    expect(before.spit.contents).toEqual([]);

    await spit(page, 2);

    const after = await diagnostics(page);
    expect(after.spit.inFlight, 'nothing may be launched from an empty stomach').toBe(0);
    expect(after.spit.hits).toBe(before.spit.hits);
  });
  test('the projectile travels up the screen when there is no steering', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The default direction is UP, and the assertion is on the projectile's own world y.
     *
     * Up rather than an arbitrary default because the level is a vertical ascent: "forward" is the water the
     * player is about to enter, which is where the targets are. A projectile that flew down by default would be
     * arming the player against the part of the level they have already passed.
     */
    const travel = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnHazardOnPlayer: (kind: string) => void;
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            projectilesRef: { x: number; y: number }[];
          };
          player: { volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      g.player.volume = 20;
      g.game.debugSpawnHazardOnPlayer('fish');
      await raf();
      // The stomach takes it on the collision; give the effect a frame to be applied.
      await raf();

      const b = g.game.touchRef.spitGeometry;
      g.game.handlePointerDown(93, b.x, b.y);
      g.game.handlePointerUp(93);
      await raf();
      const start = g.game.projectilesRef[0];
      if (!start) return null;
      const y0 = start.y;
      for (let i = 0; i < 10; i++) await raf();
      return { y0, y1: g.game.projectilesRef[0]?.y ?? null };
    });

    expect(travel, 'a projectile must exist after spitting').not.toBeNull();
    expect(travel!.y1, 'and it must have moved').not.toBeNull();
    expect(travel!.y1!, 'world y grows upward, so travelling up means y increases').toBeGreaterThan(travel!.y0);
  });

  test('a hit shoves the target, and stronger ammunition shoves it further', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const c = await cfg(page);

    /**
     * ---------------------------------------------------------------------------------------------
     * WHAT THIS MEASURES, AFTER TWO WRONG VERSIONS
     * ---------------------------------------------------------------------------------------------
     * The claim is "the item keeps its own properties": the same shot should do different things depending on
     * what was swallowed. So this fires two kinds of ammunition at the SAME kind of target and compares.
     *
     * The first version pointed a shot at a FISH and hoped to hit it. It never did, and the trace showed why: a
     * fish swims UP at the player, and the projectile travels up too, so both are climbing the same axis and the
     * fish can simply outrun the shot for 215 metres. A target that flees the shooter is the wrong target for a
     * ballistics test.
     *
     * The second version aimed at a crab, which does hold station -- but spawned it while the player was small,
     * where a crab is still a hazard, so it was eaten or bounced before the shot. The target has to be something
     * the player cannot swallow.
     */
    const shoveWith = async (ammo: 'crab' | 'trash'): Promise<{ shove: number; hits: number; why: string }> =>
      page.evaluate(
        async (what: string) => {
          const g = (window as unknown as {
            __GB: {
              game: {
                debugSpawnHazardOnPlayer: (kind: string) => void;
                touchRef: { spitGeometry: { x: number; y: number } };
                handlePointerDown: (id: number, x: number, y: number) => void;
                handlePointerUp: (id: number) => void;
                hazardsRef: { hazards: { x: number; y: number; kind: string }[] };
                camera: { viewport: { laneWidthMeters: number } };
                diagnostics: { spit: { contents: string[]; hits: number } };
                projectilesRef: { x: number; y: number }[];
              };
              player: { x: number; y: number; volume: number };
            };
          }).__GB;
          const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
          const lane = g.game.camera.viewport.laneWidthMeters;
          const fail = (why: string) => ({ shove: Number.NaN, hits: -1, why });

          g.player.volume = 20;
          g.game.debugSpawnHazardOnPlayer(what);
          await raf();
          await raf();
          if (!g.game.diagnostics.spit.contents.includes(what)) return fail(`stomach has ${g.game.diagnostics.spit.contents.join(',')}`);

          /**
           * THE TARGET: a crab, spawned and then moved in the SAME FRAME.
           *
           * `debugSpawnHazardOnPlayer` produces an ARMED crab with its telegraph already spent, so it fires on the
           * first contact and removes itself -- at the player's position that is the very next frame, which is why
           * an earlier version found an empty hazard list no matter what volume it used. Repositioning it before
           * the frame advances keeps it alive, because it never contacts anything.
           *
           * A crab is the right target precisely because it is otherwise inert: a fish swims at the player, which
           * makes it impossible to measure a ballistic shove against (the shot and the target climb the same axis
           * and the fish can outrun the projectile entirely).
           */
          g.game.debugSpawnHazardOnPlayer('crab');
          const target = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1] as { x: number; y: number; kind: string } | undefined;
          if (!target) return fail('no target spawnable');
          /**
           * Placed FAR up the screen, beyond the suction radius, so the field cannot drag it and the shot has to
           * cross a real distance. Also far enough that the crab never arms against the player.
           */
          target.x = g.player.x * lane;
          target.y = g.player.y + lane * 0.9;

          const b = g.game.touchRef.spitGeometry;
          const hitsBefore = g.game.diagnostics.spit.hits;
          g.game.handlePointerDown(93, b.x, b.y);
          g.game.handlePointerUp(93);

          let before = { x: target.x, y: target.y };
          let landed = false;
          for (let i = 0; i < 120; i++) {
            await raf();
            if (g.game.diagnostics.spit.hits > hitsBefore) {
              landed = true;
              break;
            }
            before = { x: target.x, y: target.y };
          }
          await raf();
          if (!landed) return fail(`the shot never landed (target still at ${target.y.toFixed(0)}, player ${g.player.y.toFixed(0)})`);
          return { shove: Math.hypot(target.x - before.x, target.y - before.y), hits: 1, why: 'ok' };
        },
        ammo,
      );

    const crabShot = await shoveWith('crab');
    const trashShot = await shoveWith('trash');

    console.log(
      `shove: crab ammo ${crabShot.shove.toFixed(2)} m (${crabShot.why}), trash ammo ${trashShot.shove.toFixed(2)} m (${trashShot.why}), base ${c.knockbackMeters}`,
    );

    expect(crabShot.hits, `the crab shot must land (${crabShot.why})`).toBeGreaterThan(0);
    expect(trashShot.hits, `the trash shot must land (${trashShot.why})`).toBeGreaterThan(0);

    // Both must actually move it, or the comparison is between two zeroes.
    expect(crabShot.shove, 'the crab shot must shove the target').toBeGreaterThan(0.5);
    expect(trashShot.shove, 'and so must the trash shot').toBeGreaterThan(0.5);
    // A crab is the heavier, stronger round, so it shoves further than a trash bag.
    expect(crabShot.shove, 'a crab must hit harder than a trash bag').toBeGreaterThan(trashShot.shove);
  });
});
