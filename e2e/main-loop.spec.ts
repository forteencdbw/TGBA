import { expect, test } from '@playwright/test';
import { boot, diagnostics, expectNoErrors, player, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The core loop: the menu, starting a run, and the two things the whole design rests on.
 *
 * These are the assertions that a Playwright test makes CHEAPER rather than merely different. In the old
 * harness each of them needed a Chrome spawn, a devtools websocket, a promise client and an `evaluate` string;
 * here they are three lines of intent.
 */
test.describe('the main loop', () => {
  test('boots into the menu, and the start button begins a run', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);

    const atBoot = await diagnostics(page);
    expect(atBoot.phase, 'the game should open on the menu rather than mid-level').toBe('menu');
    expect(atBoot.level.id).toBe('open-water');

    await startFromMenu(page);
    await waitForPhase(page, 'intro');
    await waitForPhase(page, 'playing');

    const playing = await diagnostics(page);
    expect(playing.level.scrollLength).toBeGreaterThan(0);
    await expectNoErrors(errors);
  });

  test('the build is on the menu and in the level readout, and matches what was compiled in', async ({ page }) => {
    await boot(page);

    const shown = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            diagnostics: { build: { version: string; hash: string; dirty: boolean; label: string } };
            menuRef: { versionText: string };
          };
        };
      }).__GB.game;
      return { compiled: g.diagnostics.build, menu: g.menuRef.versionText };
    });

    /**
     * The MENU's own text, not the module it came from.
     *
     * A test that read `buildLabel()` would pass while the menu drew nothing at all, which is the only way this
     * feature can actually fail: the values are compile-time constants, so nothing can go wrong between them and a
     * string except the drawing.
     */
    expect(shown.menu, 'the menu must show the build').toBe(shown.compiled.label);
    expect(shown.menu, 'and the label must name the version').toContain(shown.compiled.version);
    expect(shown.menu, 'and the commit it was built from').toContain(shown.compiled.hash);
    // A version that is not a version -- an unsubstituted `1.0.0`-shaped placeholder would sail through the two
    // assertions above, so the shape is checked as well.
    expect(shown.compiled.version, 'the version must look like a version').toMatch(/^\d+\.\d+\.\d+$/);

    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * And the same line in the level's debug readout.
     *
     * It is the readout a screenshot usually contains, so it is the one that gets read back to you when something
     * looks wrong on somebody else's device.
     */
    await expect
      .poll(
        () =>
          page.evaluate(
            () => (window as unknown as { __GB: { game: { hudRef: { debugText: string } } } }).__GB.game.hudRef.debugText,
          ),
        { message: 'the debug readout should name the build', timeout: 5000 },
      )
      .toContain(shown.compiled.label);
  });

  test('the world scrolls on its own, and the player does NOT carry it', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * THE INDEPENDENCE ASSERTION, and it needs BOTH halves.
     *
     * Asserting only that holding "up" moves the bubble would pass on the model this game used to have, where
     * the camera followed the player and pressing up therefore advanced the level. What must be true is that
     * the scroll rate is the SAME whether or not the player is pushing.
     */
    const scrollRate = async (holdUp: boolean): Promise<number> => {
      const before = await diagnostics(page);
      if (holdUp) await page.keyboard.down('KeyW');
      await page.waitForTimeout(1200);
      const after = await diagnostics(page);
      if (holdUp) await page.keyboard.up('KeyW');
      // Measured in GAME time, not wall clock: the frame delta is clamped, so on a loaded machine game time
      // runs slower than the clock and a wall-clock rate would measure the frame rate instead.
      return (after.level.scrolled - before.level.scrolled) / Math.max(1e-6, after.gameSeconds - before.gameSeconds);
    };

    const idleRate = await scrollRate(false);
    const pushingRate = await scrollRate(true);
    const configured = (await diagnostics(page)).level.scrollSpeed;

    expect(idleRate, 'the scroll must advance with no input at all').toBeGreaterThan(configured * 0.5);
    expect(pushingRate, 'holding up must not change the rate the level advances').toBeCloseTo(idleRate, 0);
    // And it tracks the level's own configured speed.
    expect(idleRate).toBeGreaterThan(configured * 0.7);
    expect(idleRate).toBeLessThan(configured * 1.3);
  });

  test('the player moves within the screen, on both axes, at a fixed speed', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /** Hold a direction and report how far the bubble moved, and how fast it settled at. */
    const travel = async (key: string): Promise<{ dx: number; dy: number; steadyV: number }> => {
      // Recentre first: a probe that starts wherever the previous one ended measures nothing when that one
      // finished against the lane's edge, and three clamped readings all look identical.
      await page.evaluate(() => {
        const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void } } }).__GB.game;
        g.debugSetSteadyCruise();
        const p = (window as unknown as { __GB: { player: { x: number; screenY: number } } }).__GB.player;
        p.x = 0.5;
        p.screenY = 0.5;
      });
      const before = await player(page);
      await page.keyboard.down(key);
      await page.waitForTimeout(500);
      const mid = await player(page);
      await page.keyboard.up(key);
      const after = await player(page);
      return {
        dx: after.x - before.x,
        dy: after.screenY - before.screenY,
        steadyV: Math.abs(key === 'KeyD' || key === 'KeyA' ? mid.vx : mid.vy),
      };
    };

    const right = await travel('KeyD');
    expect(right.dx, 'D must move the bubble right').toBeGreaterThan(0.05);
    expect(Math.abs(right.dy), 'D must not move it vertically').toBeLessThan(0.02);
    expect(right.steadyV, 'the keyboard moves at a constant speed, not ramping').toBeGreaterThan(0);

    const up = await travel('KeyW');
    expect(up.dy, 'W must move the bubble up the screen').toBeGreaterThan(0.05);
    expect(Math.abs(up.dx), 'W must not move it across the lane').toBeLessThan(0.02);

    const down = await travel('KeyS');
    expect(down.dy, 'S must move the bubble down the screen').toBeLessThan(-0.05);

    const left = await travel('KeyA');
    expect(left.dx, 'A must move the bubble left').toBeLessThan(-0.05);
  });

  test('holding nothing leaves the bubble still', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(() => {
      (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void } } }).__GB.game.debugSetSteadyCruise();
    });
    await page.waitForTimeout(300);
    const before = await player(page);
    await page.waitForTimeout(600);
    const after = await player(page);
    expect(after.screenY, 'with no input the bubble hovers: it does not drift up or down').toBeCloseTo(before.screenY, 3);
    expect(after.x).toBeCloseTo(before.x, 3);
  });
});
