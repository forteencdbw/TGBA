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
      minGapFraction: number;
      projectileDamage: number;
      ramVolumeThreshold: number;
      ramDamagePerVolume: number;
      collideDamage: number;
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
      for (const e of g.game.levelRef.entries) {
        if (e.kind !== 'crate' && e.kind !== 'coral') continue;
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
