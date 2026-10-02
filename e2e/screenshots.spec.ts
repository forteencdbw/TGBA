import { test } from '@playwright/test';
import { boot, settingsGeometry, startFromMenu, waitForPhase } from './helpers';

/**
 * Screenshot capture, as a test rather than a script.
 *
 * These assert nothing on purpose: a picture is for looking at, and a human decides whether the panel looks
 * right. What they replace is `scripts/shot-ui.mjs`, which re-implemented the browser spawn, the page boot, the
 * menu press and the wait-for-play just to take a picture -- all of which Playwright already does, and does with
 * the same helper functions the assertions use.
 *
 * Run them explicitly, since they are only wanted when someone is looking:
 *
 *     pnpm test:shots
 *
 * `pnpm test` EXCLUDES these via the `@screenshots` tag and `grepInvert` in the config. Each takes several
 * seconds and asserts nothing, so including them in the default run would make "all tests pass" a slightly
 * weaker claim -- and a suite that spends its time on pictures is a suite people stop running.
 *
 * Each test carries the tag in its OWN name as well as the describe title. Playwright matches `grepInvert`
 * against the full title including the describe, so the describe alone would be enough -- but a test that shows
 * up as `the settings panel, open` when listed individually is a test whose exclusion looks accidental.
 *
 * The output lands in `test-results/`, which is gitignored.
 */
test.describe('screen captures @screenshots', () => {
  test('the main menu @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('menu.png') });
  });

  test('mid-level, with the stage readout on the HUD @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    // Absorb a few so the stage line shows progress rather than zeros.
    await page.evaluate(async () => {
      const g = (window as unknown as { __GB: { game: { spawnBubbleOnPlayer: (r: number) => void } } }).__GB.game;
      for (let i = 0; i < 4; i++) {
        g.spawnBubbleOnPlayer(0.4);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: testInfo.outputPath('playing.png') });
  });

  test('the settings panel, open', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.waitForTimeout(400);

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);
    // Long enough for the pause to take effect and the slider to draw at its current value.
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('settings.png') });
  });

  test('stage 3, the slow one', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: { game: { diagnostics: { stage: { stage: number } }; spawnBubbleOnPlayer: (r: number) => void } };
      }).__GB.game;
      let guard = 0;
      while (g.diagnostics.stage.stage < 3 && guard++ < 600) {
        g.spawnBubbleOnPlayer(0.4);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath('stage-3.png') });
  });
});
