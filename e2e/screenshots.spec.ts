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

  /**
   * One capture per stage, parked in the same place, so the three can be compared.
   *
   * This is the picture that answers "are the stages distinguishable", and comparing them is the whole point -- a
   * single stage in isolation says nothing about whether a player could tell it from the next one. The bubble is
   * parked at a fixed lane position, so the only differences between the three frames are the ones the stage
   * controls.
   */
  for (const stage of [1, 2, 3]) {
    test(`growth stage ${stage}, parked for comparison @screenshots`, async ({ page }, testInfo) => {
      await boot(page);
      await startFromMenu(page);
      await waitForPhase(page, 'playing');
      await page.evaluate(async (want) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              diagnostics: { stage: { stage: number } };
              spawnBubbleOnPlayer: (r: number) => void;
              demoteStageForTest: () => number;
              debugSetSteadyCruise: () => void;
            };
            player: { x: number; screenY: number };
          };
        }).__GB;
        const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
        let guard = 0;
        while (g.game.diagnostics.stage.stage > want && guard++ < 20) {
          g.game.demoteStageForTest();
          await raf();
        }
        guard = 0;
        while (g.game.diagnostics.stage.stage < want && guard++ < 600) {
          g.game.spawnBubbleOnPlayer(0.4);
          await raf();
        }
        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.45;
      }, stage);
      await page.waitForTimeout(600);
      await page.screenshot({ path: testInfo.outputPath(`stage-${stage}.png`) });
    });
  }

  /**
   * The wheel with a thumb on it, pushed up and to the right.
   *
   * The idle wheel's appearance can be reasoned about from the code; this state cannot, because it is about
   * whether the knob's offset and the pad brightening actually read as "I am pushing this way".
   */
  test('the wheel pushed up and right @screenshots', async ({ page }, testInfo) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugSetSteadyCruise: () => void;
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { wheelGeometry: { x: number; y: number; radius: number } };
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      g.game.debugSetSteadyCruise();
      g.player.x = 0.42;
      g.player.screenY = 0.5;
      const w = g.game.touchRef.wheelGeometry;
      // Up and to the right: clearly deflected, but not pinned to the rim.
      g.game.handlePointerDown(71, w.x + w.radius * 0.6, w.y - w.radius * 0.6);
      for (let i = 0; i < 20; i++) await raf();
    });
    await page.screenshot({ path: testInfo.outputPath('wheel-pushed.png') });
  });
});
