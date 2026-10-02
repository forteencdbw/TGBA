import { expect, test } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Layout, which is the one thing here that a Playwright test does BETTER than the old harness did.
 *
 * `page.setViewportSize` is a sentence; the old browser suites hardcoded a window size into the Chrome
 * command line and re-spawned the browser to try another. That meant the layout was only ever checked at the
 * size it was developed at -- and the desktop case, where the play area was stretched across a 2560px window
 * and pushed the skill button off the right edge, was missed for exactly that reason.
 *
 * The `desktop` project covers a wide window; these tests check the invariants that must hold at ANY size, by
 * resizing within one page.
 */
test.describe('layout holds at any canvas size', () => {
  test('phones fill the width, desktops are capped and centred', async ({ page }) => {
    await boot(page);

    /**
     * Each case carries its OWN canvas width, because the expected centring depends on it.
     *
     * The first version computed the expected `left` against a single 2560px canvas for every case, so the
     * laptop assertion compared a 1440px layout against a 2560px expectation and failed on a correct layout.
     * A wrong expectation is indistinguishable from a wrong result until you read which number is which.
     */
    const cases = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { layout: { computeViewport: (w: number, h: number) => { laneWidthPx: number; left: number; visibleDepthMeters: number } } };
      }).__GB;
      const make = (canvasW: number, canvasH: number) => ({ canvasW, ...g.layout.computeViewport(canvasW, canvasH) });
      return {
        phone: make(412, 915),
        small: make(900, 700),
        laptop: make(1440, 900),
        desktop: make(2560, 1440),
      };
    });

    // A phone canvas is narrower than the cap, so the lane uses the whole width and there is no letterbox.
    expect(cases.phone.laneWidthPx, 'a phone canvas must be filled edge to edge').toBeCloseTo(cases.phone.canvasW, 0);
    expect(cases.phone.left, 'and must not be letterboxed').toBeCloseTo(0, 0);

    for (const [name, v] of Object.entries(cases)) {
      expect(v.laneWidthPx, `${name}: the lane can never exceed the canvas`).toBeLessThanOrEqual(v.canvasW + 1);
      expect(v.left, `${name}: the lane must be centred`).toBeCloseTo((v.canvasW - v.laneWidthPx) / 2, 0);
      // The water view must stay comparable across sizes, or a wide window zooms out into a soup where
      // everything is the same size on screen and size stops being readable.
      expect(v.visibleDepthMeters, `${name}: the visible depth must stay bounded`).toBeLessThan(1000);
    }

    // And a wide window must actually be capped rather than stretched.
    expect(cases.desktop.laneWidthPx, 'a 2560px window must cap the lane').toBeLessThan(1200);
    expect(cases.laptop.laneWidthPx, 'a 1440px window must cap the lane too').toBeLessThan(1200);
  });

  test('the settings panel and the skill button stay on screen after a resize', async ({ page }) => {
    await boot(page);

    /**
     * Resize to a wide desktop window, mid-session, and check the controls are still reachable.
     *
     * This is the shape of the real bug: the skill button was placed at `canvasWidth - 76 * scale`, which on a
     * 2560px window is 2485px -- past the right edge, so the player simply did not have a skill button.
     */
    for (const size of [
      { width: 412, height: 915 },
      { width: 2560, height: 1440 },
      { width: 900, height: 700 },
    ]) {
      await page.setViewportSize(size);
      // Give the resize handler and one layout pass a moment.
      await page.waitForTimeout(250);

      const geo = await page.evaluate(() => {
        const g = (window as unknown as {
          __GB: {
            game: {
              canvasSize: { width: number; height: number };
              settingsRef: { geometry: { gear: { x: number; y: number; radius: number } } };
              touchRef: { skillGeometry: { x: number; y: number; radius: number } };
            };
          };
        }).__GB.game;
        return { canvas: g.canvasSize, gear: g.settingsRef.geometry.gear, skill: g.touchRef.skillGeometry };
      });

      const label = `${size.width}x${size.height}`;
      expect(geo.gear.x - geo.gear.radius, `${label}: the gear must be inside the canvas`).toBeGreaterThanOrEqual(0);
      expect(geo.gear.x + geo.gear.radius, `${label}: the gear must not hang off the right edge`).toBeLessThanOrEqual(geo.canvas.width + 1);
      expect(geo.gear.y - geo.gear.radius, `${label}: the gear must be below the top edge`).toBeGreaterThanOrEqual(0);
    }
  });

  test('the panel and menu are reachable after a resize, not just the gear', async ({ page }) => {
    await boot(page);
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.waitForTimeout(250);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    // Click the gear at its reported position after a big resize, and require the panel to actually open.
    const gear = await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { settingsRef: { geometry: { gear: { x: number; y: number } } } } } }).__GB.game;
      return g.settingsRef.geometry.gear;
    });
    await page.mouse.click(gear.x, gear.y);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => (window as unknown as { __GB: { game: { settingsRef: { isOpen: boolean } } } }).__GB.game.settingsRef.isOpen,
          ),
        { message: 'the gear must still open the panel on a wide window', timeout: 5000 },
      )
      .toBe(true);
  });
});
