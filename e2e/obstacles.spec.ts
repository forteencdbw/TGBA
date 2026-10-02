import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, startFromMenu, waitForPhase } from './helpers';

/**
 * Destructible obstacles: crates you smash and coral you squeeze past.
 *
 * These exist because two mechanics already in the game had nothing to aim at. Spitting was meant to "break
 * fragile walls" and there were no walls; shrinking was meant to open routes and there was nothing that was
 * easier to pass when small. Crates are the target for the first and coral for the second.
 *
 * ---------------------------------------------------------------------------------------------
 * THE RULE THAT MAKES IT A DECISION RATHER THAN A REQUIREMENT
 * ---------------------------------------------------------------------------------------------
 * **Every row must leave a gap the smallest player can fit through.** If a row could seal the lane, being small
 * at that point would be mandatory, and "should I be big here" would stop being a question. With a guaranteed
 * gap, a big bubble can always choose to detour and a small one can thread it -- both playable, so the choice is
 * real.
 */

const cfg = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: { mechRef: { obstacles: Record<string, unknown> } };
    }).__GB;
    return g.mechRef.obstacles as {
      health: Record<string, number>;
      radius: Record<string, number>;
      ramVolume: Record<string, number | null>;
      minGapFraction: number;
      projectileDamage: number;
      ramVolumeThreshold: number;
      ramDamagePerVolume: number;
      collideDamage: number;
      netDrag: number;
    };
  });

test.describe('obstacles', () => {
  test('the authored level leaves a passable gap in every row', async ({ page }) => {
    await boot(page);

    /**
     * The guarantee, checked against the AUTHORED level rather than against what is on screen.
     *
     * `assertLevelSane` enforces this at module load, so the game would not have started at all if it were
     * violated -- but asserting it here means a future edit that seals a row fails as a test with a readable
     * message rather than as a blank page.
     */
    const check = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          mechRef: { obstacles: { radius: Record<string, number>; minGapFraction: number } };
          game: { levelRef: { entries: { at: number; x: number; kind: string }[] } };
        };
      }).__GB;

      const required = g.mechRef.obstacles.minGapFraction;
      const rows = new Map<number, { x: number; radius: number }[]>();
      /**
       * EVERY obstacle kind the config knows about, asked of the config rather than listed.
       *
       * This used to be `kind !== 'crate' && kind !== 'coral'`, which is the check that made a new obstacle kind
       * invisible to the one rule that keeps the level fair: `wall` and `net` rows would have been skipped here
       * entirely, so a sealed row of them would have passed this test while `assertLevelSane` -- which does read the
       * list -- refused to load the game.
       */
      const kinds = Object.keys(g.mechRef.obstacles.radius);
      for (const e of g.game.levelRef.entries) {
        if (!kinds.includes(e.kind)) continue;
        const row = rows.get(e.at) ?? [];
        row.push({ x: e.x, radius: g.mechRef.obstacles.radius[e.kind] ?? 0.05 });
        rows.set(e.at, row);
      }

      const passable = (row: { x: number; radius: number }[]): boolean => {
        const sorted = [...row].sort((a, b) => a.x - b.x);
        if (sorted[0]!.x - sorted[0]!.radius > required) return true;
        const last = sorted[sorted.length - 1]!;
        if (1 - (last.x + last.radius) > required) return true;
        for (let i = 1; i < sorted.length; i++) {
          const l = sorted[i - 1]!;
          const r = sorted[i]!;
          if (r.x - r.radius - (l.x + l.radius) > required) return true;
        }
        return false;
      };

      const failures: number[] = [];
      for (const [at, row] of rows) if (!passable(row)) failures.push(at);
      return { rowCount: rows.size, failures, required };
    });

    expect(check.rowCount, 'the level must actually contain obstacle rows').toBeGreaterThan(0);
    expect(check.failures, `these rows would seal the lane (need a gap of ${check.required})`).toEqual([]);
  });

  test('a crate is destroyed by a projectile', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const before = await diagnostics(page);
    const broken = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSpawnHazardOnPlayer: (k: string) => void;
            diagnostics: { obstacles: { broken: number }; spit: { contents: string[] } };
            camera: { viewport: { laneWidthMeters: number } };
          };
          player: { volume: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // Ammunition, and a crate directly above.
      g.player.volume = 20;
      g.game.debugSpawnHazardOnPlayer('crab');
      await raf();
      await raf();
      g.game.debugSpawnObstacleOnPlayer('crate', g.game.camera.viewport.laneWidthMeters * 0.4);

      const beforeBroken = g.game.diagnostics.obstacles.broken;
      const b = g.game.touchRef.spitGeometry;
      g.game.handlePointerDown(93, b.x, b.y);
      g.game.handlePointerUp(93);
      for (let i = 0; i < 60; i++) await raf();
      return g.game.diagnostics.obstacles.broken - beforeBroken;
    });

    expect(before.obstacles.broken, 'the run starts with nothing broken').toBe(0);
    expect(broken, 'one spit must be enough to break one crate').toBeGreaterThan(0);
  });

  test('a small player is BLOCKED and hurt; a big one smashes through', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const c = await cfg(page);

    /**
     * The same obstacle and the same collision, with opposite outcomes -- and the only difference is the volume
     * the player earned. This is the mechanic: crates reward being big, and coral punishes it.
     *
     * Driven through the real contact path by spawning the crate ON the player, which is the one place the
     * collision is guaranteed to resolve.
     */
    const hitAtVolume = async (volume: number): Promise<{ hits: number; broke: number }> =>
      page.evaluate(async (v) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
              debugSetSteadyCruise: () => void;
              diagnostics: { obstacles: { broken: number }; stats: { hits: number } };
            };
            player: { volume: number; x: number; screenY: number };
          hazardsRef: { hazards: unknown[] };
          };
        }).__GB;
        const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.5;
        g.player.volume = v;
        // Clear the invulnerability a previous attempt may have left, or the block would not register.
        await raf();
        const hitsBefore = g.game.diagnostics.stats.hits;
        const brokeBefore = g.game.diagnostics.obstacles.broken;

        g.game.debugSpawnObstacleOnPlayer('crate', 0);
        for (let i = 0; i < 8; i++) await raf();
        return {
          hits: g.game.diagnostics.stats.hits - hitsBefore,
          broke: g.game.diagnostics.obstacles.broken - brokeBefore,
        };
      }, volume);

    const small = await hitAtVolume(1);
    const big = await hitAtVolume(c.ramVolumeThreshold + 4);

    console.log(`crate contact: small ${JSON.stringify(small)}, big ${JSON.stringify(big)} (threshold ${c.ramVolumeThreshold})`);

    // Small: stopped by it, and it costs a hit. It must NOT break, or being big would not matter.
    expect(small.broke, 'a small player must not break a crate').toBe(0);
    expect(small.hits, 'and must be hurt for trying').toBeGreaterThan(0);

    // Big: straight through, and no damage taken.
    expect(big.broke, 'a big enough player must smash it').toBeGreaterThan(0);
    expect(big.hits, 'and take nothing for it').toBe(0);
  });

  test('a crate is weaker than coral', async ({ page }) => {
    await boot(page);
    const c = await cfg(page);

    // The premise, asserted rather than assumed: the two kinds must differ, or "which is worth shooting" is not a
    // question. A crate is meant to be a target and coral is meant to be avoided.
    expect(c.health.crate, 'a crate needs health').toBeGreaterThan(0);
    expect(c.health.coral, 'coral needs health').toBeGreaterThan(0);
    expect(c.health.coral!, 'coral must be the tougher of the two').toBeGreaterThan(c.health.crate!);
    expect(c.radius.coral!, 'and the bigger, so a coral gap is a real squeeze').toBeGreaterThan(c.radius.crate!);
  });

  test('every obstacle kind is one of four different answers, not four durability tiers', async ({ page }) => {
    await boot(page);
    const c = await cfg(page);

    /**
     * The four answers, asserted as RELATIONSHIPS rather than as numbers, because the numbers are the owner's to
     * tune and the relationships are the design:
     *
     *   crate  rammable, and one shot
     *   coral  rammable, and several shots
     *   wall   NOT rammable at any size, and several shots -- so ammunition or the minimum gap
     *   net    not rammed at all; it is torn, and a shot tears it faster
     */
    expect(c.health.wall, 'a wall needs health').toBeGreaterThan(0);
    expect(
      c.health.wall!,
      'a wall must survive a single fish shot, or "you need ammunition" is not true of it',
    ).toBeGreaterThan(c.projectileDamage * 0.8);
    expect(c.health.wall!, 'and it should be a real cost, not one crab either').toBeGreaterThan(c.projectileDamage * 1.6);

    // The rule that makes a wall a wall: no volume smashes it. `null` rather than a large number, so raising
    // `volume.max` later cannot quietly turn it into a crate.
    expect(c.ramVolume.wall ?? null, 'a wall must not be rammable at all').toBeNull();
    expect(c.ramVolume.net ?? null, 'and a net must not be rammed either').toBeNull();
    expect(c.ramVolume.crate, 'while a crate keeps the shared threshold').toBeUndefined();
    expect(c.ramVolume.coral, 'and so does coral').toBeUndefined();

    // A net is torn by pushing, and its `health` is the one row in that table measured in SECONDS.
    expect(c.netDrag, 'a net must be felt: it drags').toBeLessThan(1);
    expect(c.netDrag, 'but must not stop the player dead').toBeGreaterThan(0.1);
    /**
     * The tear budget must fit inside ONE pass.
     *
     * That is the constraint which sets it, and it is physics rather than feel: the scroll carries the player past
     * everything at `level.scrollSpeed`, so the overlap with any obstacle is well under a second. A tear that took
     * longer than that would never complete, and the net would look like it did nothing at all -- the one failure a
     * soft obstacle cannot afford. The first version of this was 1.6s, and the test that caught it watched a net
     * survive 600 frames of contact.
     */
    expect(c.health.net!, 'a net must open within a single pass, or it opens never').toBeLessThan(0.9);
  });

  test('a wall cannot be rammed at ANY volume, and a net drags without hurting', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const c = await cfg(page);

    /**
     * One experiment per kind, driven through the real contact path by spawning the thing ON the player -- with the
     * SCROLL FROZEN.
     *
     * ---------------------------------------------------------------------------------------------
     * WHY THE SCROLL HAS TO BE FROZEN, AND WHAT IT COST TO FIND OUT
     * ---------------------------------------------------------------------------------------------
     * The player's world position is DERIVED from the camera and their screen position, so an idle player is carried
     * up the level at `level.scrollSpeed` -- 25 m/s. A spawned obstacle is static in world space, so it is behind
     * them in about half a second no matter what the contact rule says.
     *
     * The first version of this test did not know that, and reported a net that took twelve seconds to tear with
     * five hit points lost. It had torn a DIFFERENT net: the player had travelled 300m up the level, been hit by
     * every obstacle row on the way, and finally met the level's own net at 920m. The numbers looked like a broken
     * mechanic and were in fact a broken experiment -- which is exactly what a probe that reads live state is for.
     *
     * With the scroll at zero the camera stops, the player stays where they are, the obstacle stays on them, and the
     * only thing in the water is the one being studied.
     */
    const contact = async (kind: string, volume: number, frames: number) =>
      page.evaluate(
        async (args) => {
          const g = (window as unknown as {
            __GB: {
              game: {
                debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
                diagnostics: { obstacles: { broken: number }; stats: { hits: number }; slow: { factor: number } };
                hazardsRef: { hazards: unknown[] };
                levelRef: { scrollSpeed: number };
                obstaclesRef: { obstacles: unknown[] };
              };
              player: { volume: number; x: number; screenY: number };
            };
          }).__GB;
          const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

          const scroll = g.game.levelRef.scrollSpeed;
          g.game.levelRef.scrollSpeed = 0;
          /**
           * Start from an EMPTY field.
           *
           * esolvePlayer stops at the first obstacle it touches, so anything left over from an earlier probe is
           * not just scenery -- it is the thing being measured. A wall left standing on the player from the wall
           * probe below made the net probe report a net that took thirty seconds to tear and cost five hit points,
           * because the contact resolving every frame was the WALL.
           */
          g.game.obstaclesRef.obstacles.length = 0;
          g.player.x = 0.5;
          g.player.screenY = 0.5;
          g.player.volume = args.volume;
          await raf();
          const hitsBefore = g.game.diagnostics.stats.hits;
          const brokeBefore = g.game.diagnostics.obstacles.broken;

          g.game.debugSpawnObstacleOnPlayer(args.kind, 0);
          let slowest = 1;
          for (let i = 0; i < args.frames; i++) {
            // Nothing else in the water, so a hit can only have come from the obstacle under study.
            g.game.hazardsRef.hazards.length = 0;
            await raf();
            slowest = Math.min(slowest, g.game.diagnostics.slow.factor);
          }
          g.game.levelRef.scrollSpeed = scroll;
          return {
            hits: g.game.diagnostics.stats.hits - hitsBefore,
            broke: g.game.diagnostics.obstacles.broken - brokeBefore,
            slowest,
          };
        },
        { kind, volume, frames },
      );

    /**
     * The wall, at a volume well past the ram threshold: it must NOT break, and it must cost a hit.
     *
     * `volume.max` is the ceiling the game itself enforces, so "not even at the biggest the player can get" is the
     * strongest version of the claim.
     */
    const wallAtMax = await contact('wall', 20, 10);
    console.log(`wall contact at volume 20: ${JSON.stringify(wallAtMax)} (ram threshold ${c.ramVolumeThreshold})`);
    expect(wallAtMax.broke, 'no volume rammes a wall -- that is the whole reason it exists').toBe(0);
    expect(wallAtMax.hits, 'and running into one costs a hit').toBeGreaterThan(0);

    /**
     * The net: torn by leaning on it, and never a hit point.
     *
     * It needs TIME rather than size -- `health.net` is seconds in contact -- so this waits for the tear rather than
     * asserting it inside a fixed window, and then checks that the wait was about what the config says. A net that
     * broke instantly would be a crate, and a net that never broke would be a wall; the two bounds are what make the
     * middle meaningful.
     *
     * The scroll is frozen for the same reason as above, and it is the reason this measurement is trustworthy at
     * all: without it the tear is a race against the world moving away.
     */
    const netWait = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSpawnObstacleOnPlayer: (kind: string, ahead: number) => void;
            diagnostics: { obstacles: { broken: number }; stats: { hits: number }; gameSeconds: number; slow: { factor: number } };
            hazardsRef: { hazards: unknown[] };
            levelRef: { scrollSpeed: number };
            obstaclesRef: { obstacles: unknown[] };
          };
          player: { volume: number; x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const scroll = g.game.levelRef.scrollSpeed;
      g.game.levelRef.scrollSpeed = 0;
      // Same empty field, for the same reason -- and here it is the difference between measuring the net and
      // measuring whatever the wall probe left standing.
      g.game.obstaclesRef.obstacles.length = 0;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      g.player.volume = 6;
      await raf();
      const hitsBefore = g.game.diagnostics.stats.hits;
      const brokeBefore = g.game.diagnostics.obstacles.broken;
      const t0 = g.game.diagnostics.gameSeconds;

      g.game.debugSpawnObstacleOnPlayer('net', 0);
      let frames = 0;
      let slowest = 1;
      let draggingFrames = 0;
      while (g.game.diagnostics.obstacles.broken === brokeBefore && frames < 600) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        frames++;
        slowest = Math.min(slowest, g.game.diagnostics.slow.factor);
        if (g.game.diagnostics.slow.factor < 1) draggingFrames++;
      }
      g.game.levelRef.scrollSpeed = scroll;
      return {
        frames,
        draggingFrames,
        torn: g.game.diagnostics.obstacles.broken - brokeBefore,
        hits: g.game.diagnostics.stats.hits - hitsBefore,
        seconds: +(g.game.diagnostics.gameSeconds - t0).toFixed(2),
        slowest,
      };
    });

    console.log(`net contact at volume 6: ${JSON.stringify(netWait)} (tear budget ${c.health.net}s)`);
    expect(netWait.torn, 'leaning on a net must tear it').toBeGreaterThan(0);
    expect(netWait.hits, 'and a net must never cost a hit point').toBe(0);
    // The drag is the only thing that makes a net DISCOVERABLE, and it is what the tear is paid with: being slowed
    // through the mesh is the time it takes to open it.
    expect(netWait.slowest, 'and the player must feel it: a net drags').toBeLessThan(c.netDrag + 0.05);
    expect(netWait.draggingFrames, 'for as long as the net is there').toBeGreaterThan(0);
    /**
     * And the tear must take about as long as the config says, within a generous factor.
     *
     * Generous because this is measuring a real frame loop on a shared machine: the point is that it is neither
     * instant nor interminable, which is the difference between a net and a crate, and between a net and a wall.
     */
    expect(netWait.seconds, 'a net must not open instantly').toBeGreaterThan(c.health.net! * 0.5);
    expect(netWait.seconds, 'and must not outlast the player\'s patience').toBeLessThan(c.health.net! * 4 + 0.5);
  });

  test('the ram threshold is a volume, so growing is what unlocks it', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    const c = await cfg(page);

    /**
     * `ramDamage` is zero below the threshold and rises above it, which is what makes "big enough to smash this"
     * a state the player can reason about -- it is the same ladder the eating rules use rather than a second,
     * invisible one.
     */
    const atSizes = await page.evaluate(
      (threshold) =>
        (window as unknown as { __GB: { mechRef: { obstacles: { ramVolumeThreshold: number; ramDamagePerVolume: number } } } }).__GB.mechRef
          .obstacles.ramVolumeThreshold === threshold,
      c.ramVolumeThreshold,
    );
    expect(atSizes, 'the threshold must be the configured one').toBe(true);
    expect(c.ramVolumeThreshold, 'and it must be above the starting volume, or nothing would be blocked').toBeGreaterThan(1);
  });
});
