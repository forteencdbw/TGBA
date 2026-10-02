import { expect, test } from '@playwright/test';
import {
  audioLevels,
  boot,
  diagnostics,
  expectNoErrors,
  mechanics,
  settingsGeometry,
  startFromMenu,
  waitForPhase,
  watchForErrors,
} from './helpers';

/**
 * The settings panel, the pause, and the main menu.
 *
 * The panel's controls are Pixi geometry with no DOM, so they are driven by REAL clicks at the coordinates the
 * panel reports. That is deliberate: if the panel's hit testing and its drawing ever disagree, the click lands
 * somewhere else and the test fails, which is the behaviour worth having.
 */
test.describe('settings, pause and the menu', () => {
  test('the gear opens the panel and the level FREEZES', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.waitForTimeout(500);

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);

    const opened = await diagnostics(page);
    expect(opened.phase, 'opening the panel must pause the run').toBe('paused');

    /**
     * THE PAUSE, asserted on the LEVEL's own progress rather than on a flag.
     *
     * A pause that only stopped the drawing would still let the scroll advance, the hazard timers run and the
     * invulnerability window expire while the player reads the menu.
     */
    const before = await diagnostics(page);
    await page.waitForTimeout(800);
    const after = await diagnostics(page);
    expect(after.level.scrolled, 'the scroll must not creep while the panel is open').toBe(before.level.scrolled);
    expect(after.elapsed, 'game time must not advance either').toBeCloseTo(before.elapsed, 3);

    await expectNoErrors(errors);
  });

  test('the volume slider changes the audio live, and CANCEL resumes', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.waitForTimeout(400);

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);
    expect((await diagnostics(page)).phase).toBe('paused');

    /**
     * Drag the knob by pressing ON the track at a fraction of its width.
     *
     * A tap is enough -- the panel's slider jumps to wherever it was pressed, which is the behaviour a thumb
     * expects -- and it also proves the track is hit-testable along its whole length rather than only at the
     * knob.
     */
    const setVolumeTo = async (fraction: number): Promise<void> => {
      await page.mouse.click(geo.slider.x + geo.slider.w * fraction, geo.slider.y);
    };

    await setVolumeTo(0.25);
    let levels = await audioLevels(page);
    expect(levels.master, 'the master gain must follow the slider').toBeCloseTo(0.25, 1);

    await setVolumeTo(0);
    levels = await audioLevels(page);
    expect(levels.master, 'zero must be silent').toBeLessThan(0.02);

    await setVolumeTo(1);
    levels = await audioLevels(page);
    expect(levels.master).toBeCloseTo(1, 1);

    // Cancel closes and RESUMES, at the phase it interrupted.
    await page.mouse.click(geo.buttons.cancel.x + geo.buttons.cancel.w / 2, geo.buttons.cancel.y + geo.buttons.cancel.h / 2);
    const resumed = await diagnostics(page);
    expect(resumed.phase).not.toBe('paused');

    const beforeScroll = resumed.level.scrolled;
    await page.waitForTimeout(600);
    const later = await diagnostics(page);
    expect(later.level.scrolled, 'the level must be running again after cancel').toBeGreaterThan(beforeScroll);

    await expectNoErrors(errors);
  });

  test('SAVE closes the panel the same way', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.waitForTimeout(300);

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);
    expect((await diagnostics(page)).phase).toBe('paused');

    const save = geo.buttons.save;
    await page.mouse.click(save.x + save.w / 2, save.y + save.h / 2);
    expect((await diagnostics(page)).phase).not.toBe('paused');
  });

  test('restart begins a fresh run, and exit stops the ambience', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    // Let the level get going, and wait until the ambience is actually audible -- otherwise "it stopped" is
    // asserted against a bed that was never playing, which is not the same thing.
    await page.waitForFunction(
      () => {
        const g = (window as unknown as { __GB: { game: { diagnostics: { level: { scrolled: number } }; audioRef: { debugLevels: () => { ambient: number } } } } }).__GB.game;
        return g.diagnostics.level.scrolled > 40 && g.audioRef.debugLevels().ambient > 0.05;
      },
      null,
      { timeout: 30_000 },
    );

    const geo = await settingsGeometry(page);
    await page.mouse.click(geo.gear.x, geo.gear.y);
    const beforeRestart = await diagnostics(page);

    // Restart: the scroll goes back to the start and a fresh intro begins.
    const restart = geo.buttons.restart;
    await page.mouse.click(restart.x + restart.w / 2, restart.y + restart.h / 2);
    const afterRestart = await diagnostics(page);
    expect(afterRestart.level.scrolled, 'restart returns the level to its start').toBeLessThan(beforeRestart.level.scrolled);
    expect(afterRestart.stage.stage, 'and the bubble is back to stage 1').toBe(1);

    // Exit to the menu, from a live level, so the ambience is audible when it happens.
    await waitForPhase(page, 'playing');
    await page.waitForFunction(
      () => (window as unknown as { __GB: { game: { audioRef: { debugLevels: () => { ambient: number } } } } }).__GB.game.audioRef.debugLevels().ambient > 0.05,
      null,
      { timeout: 30_000 },
    );
    await page.mouse.click(geo.gear.x, geo.gear.y);
    const exit = geo.buttons.exit;
    await page.mouse.click(exit.x + exit.w / 2, exit.y + exit.h / 2);

    const atMenu = await diagnostics(page);
    expect(atMenu.phase, 'exit must reach the main menu').toBe('menu');

    /**
     * THE AMBIENCE MUST STOP.
     *
     * It is driven from the game's per-frame step, and the step does not run on the menu -- so nothing else
     * would ever tell it to stop, and it used to keep playing over the menu at whatever level it had.
     */
    const levels = await audioLevels(page);
    expect(levels.ambient, 'the water must go quiet on the menu').toBe(0);
    expect(levels.noise, 'and the bubble density with it').toBe(0);
    // But NOT a mute: the player's volume survives, so starting again is audible.
    expect(levels.master, 'exiting must not change the volume').toBeGreaterThan(0.05);

    await expectNoErrors(errors);
  });

  /**
   * Two-finger steering-plus-skill coverage moved to `wheel.spec.ts`.
   *
   * It lived here as "dragging and the skill button" and asserted that a DRAG kept steering the bubble while a
   * second finger pressed the skill. The drag model is gone -- the thumb wheel replaced it -- so that assertion
   * was testing a control the game no longer has, and it failed for the right reason. The wheel has its own
   * routing for the same two-finger case, and the test for it belongs beside the control it drives.
   */
});

test.describe('the mechanics config', () => {
  test('the values the game loaded are the values in the file', async ({ page }) => {
    await boot(page);
    const loaded = await mechanics(page);

    // Read the file in Node, with the same library the game uses, so a syntax edge cannot make the two disagree
    // about what the file says.
    const { default: JSON5 } = await import('json5');
    const { readFileSync } = await import('node:fs');
    const file = JSON5.parse(readFileSync('config/mechanics.json5', 'utf8'));

    expect(loaded.stages.speedMultiplier).toEqual(file.stages.speedMultiplier);
    expect(loaded.stages.absorbToStage2).toBe(file.stages.absorbToStage2);
    expect(loaded.stages.absorbToStage3).toBe(file.stages.absorbToStage3);
    expect(loaded.volume.max).toBe(file.volume.max);
    /**
     * The pacing number is NOT here any more, and its absence is deliberate.
     *
     * `level.scrollSpeed` used to be a mechanics key; it moved into `config/levels.json5` when levels became data,
     * because pacing is a property of a LEVEL rather than of the game (two levels of the same length should be allowed
     * to run at different speeds). Its file-versus-runtime check moved with it -- see the first case in
     * `e2e/spawns.spec.ts`, which compares the running level's block count against the file's.
     */
  });
});
