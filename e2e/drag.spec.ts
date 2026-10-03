import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, expectNoErrors, player, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The touch drag: the phone's only way to move.
 *
 * A finger ANYWHERE on the screen moves the bubble by the same distance the finger moved, from wherever the bubble
 * already is -- not to where the finger is. These tests drive the game's own pointer entry points and read the
 * displacement the control queued, so a gesture the code does not actually produce fails here rather than passing
 * quietly.
 *
 * What this replaces: `wheel.spec.ts`, which drove a fixed pad with a dead zone and a deflection. There is no pad
 * to find any more, so the questions changed -- is a touch anywhere enough, is the distance 1:1, does it stop when
 * the finger stops -- and those are what is asserted below.
 */
test.describe('the touch drag', () => {
  /** The drag's own state: what is queued, what it points at, and whether a finger is down. */
  const drag = (page: Page) =>
    page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: {
              debugState: {
                steering: boolean;
                dragPointers: number;
                pendingX: number;
                pendingY: number;
                aimX: number;
                aimY: number;
                pointerAt: { x: number; y: number } | null;
              };
            };
          };
        };
      }).__GB.game;
      return g.touchRef.debugState;
    });

  /** The play area in canvas pixels: what turns a finger's pixels into a fraction of the screen. */
  const geometry = (page: Page) =>
    page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { canvasSize: { width: number; height: number } }; camera: { viewport: { laneWidthPx: number } } };
      }).__GB;
      return { canvas: g.game.canvasSize, laneWidthPx: g.camera.viewport.laneWidthPx };
    });

  const down = (page: Page, id: number, x: number, y: number) =>
    page.evaluate(
      (p) => (window as unknown as { __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void } } }).__GB.game.handlePointerDown(p.id, p.x, p.y),
      { id, x, y },
    );

  const move = (page: Page, id: number, x: number, y: number) =>
    page.evaluate(
      (p) => (window as unknown as { __GB: { game: { handlePointerMove: (id: number, x: number, y: number) => void } } }).__GB.game.handlePointerMove(p.id, p.x, p.y),
      { id, x, y },
    );

  const up = (page: Page, id: number) =>
    page.evaluate((i) => (window as unknown as { __GB: { game: { handlePointerUp: (id: number) => void } } }).__GB.game.handlePointerUp(i), id);

  /** Let one rendered frame run, so the physics has consumed whatever was queued. */
  const frame = (page: Page) =>
    page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));

  test('a drag anywhere on the screen steers, and only while the finger is down', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    // A steady cruise keeps the level from ending mid-test and the bubble from being shoved by a spawn.
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void } } }).__GB.game.debugSetSteadyCruise());

    const { canvas } = await geometry(page);
    // Well up in the water, nowhere near a button and nowhere near the bubble: the whole point of the scheme.
    const x = canvas.width * 0.5;
    const y = canvas.height * 0.3;

    expect((await drag(page)).steering, 'nothing is steering before the touch').toBe(false);

    await down(page, 71, x, y);
    let state = await drag(page);
    expect(state.steering, 'a touch in the water steers now').toBe(true);
    expect(state.dragPointers, 'and exactly one finger drives it').toBe(1);

    await move(page, 71, x + 40, y - 25);
    state = await drag(page);
    /**
     * The AIM is asserted rather than the queued displacement, and that is deliberate.
     *
     * The displacement is consumed by the first physics sub-step after it is queued, so a frame can legitimately
     * run between the gesture and the reading -- the assertion would then be racing the game loop. The distance
     * that displacement produces is what matters, and the test below measures it on the bubble itself. What is
     * stable here is the aim, which a finger that is still down keeps.
     */
    expect(state.aimX, 'the aim follows the finger from where it landed').toBeGreaterThan(0);
    expect(state.aimY, 'on both axes').toBeGreaterThan(0);
    expect(state.pointerAt, 'and the control knows where the finger is').not.toBeNull();

    await up(page, 71);
    expect((await drag(page)).steering, 'the finger up ends the steering').toBe(false);
    await expectNoErrors(errors);
  });

  test('the bubble travels exactly as far as the finger did', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
      g.game.debugSetSteadyCruise();
      // Mid-screen, so a 40px drag in either direction cannot run into a wall and be clamped.
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });

    const { canvas, laneWidthPx } = await geometry(page);
    const startX = canvas.width * 0.5;
    const startY = canvas.height * 0.3;
    const before = await player(page);

    await down(page, 71, startX, startY);
    await move(page, 71, startX + 40, startY - 30);
    await frame(page);
    const after = await player(page);

    /**
     * 1:1, in the units the position is stored in: pixels across the lane, pixels up the window.
     *
     * This is the promise the whole control makes, so it is asserted as a distance rather than as "it moved":
     * a bubble that moves 30px for a 40px finger, or that ramps up to speed, fails here.
     */
    expect(after.x - before.x, 'rightward movement is the finger distance over the lane width').toBeCloseTo(40 / laneWidthPx, 4);
    expect(after.screenY - before.screenY, 'upward movement is the finger distance over the window height').toBeCloseTo(30 / canvas.height, 4);

    await up(page, 71);
    await expectNoErrors(errors);
  });

  test('lifting the finger leaves the bubble exactly where it was', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });

    const { canvas } = await geometry(page);
    const startX = canvas.width * 0.5;
    const startY = canvas.height * 0.3;

    await down(page, 71, startX, startY);
    // A fast gesture, then a lift: the stick model this replaces would have carried the bubble for another half a
    // second afterwards, which is the behaviour that had to go.
    await move(page, 71, startX + 60, startY - 20);
    await frame(page);
    await up(page, 71);

    const settled = await player(page);
    await page.waitForTimeout(400);
    const later = await player(page);

    expect(later.x, 'no drift on the lateral axis after the release').toBeCloseTo(settled.x, 4);
    expect(later.screenY, 'and none on the vertical').toBeCloseTo(settled.screenY, 4);
    await expectNoErrors(errors);
  });

  test('a touch that lands on a button belongs to that button', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The press must go to the button and NOT also start a drag.
     *
     * It is the order of the branches in `onPointerDown` that decides this, and getting it wrong would mean every
     * attempt to spit also shoved the bubble sideways -- the exact failure the drag's "anywhere" rule invites.
     */
    await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { spitGeometry: { x: number; y: number } };
          };
        };
      }).__GB.game;
      const b = g.touchRef.spitGeometry;
      g.handlePointerDown(71, b.x, b.y);
    });

    const state = await drag(page);
    expect(state.steering, 'the spit button must not also start a drag').toBe(false);
    expect(state.dragPointers, 'and no pointer is steering').toBe(0);

    await up(page, 71);
    await expectNoErrors(errors);
  });

  test('one finger steers while the other fires a skill', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');
    await page.evaluate(() => (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void } } }).__GB.game.debugSetSteadyCruise());

    const activationsBefore = (await diagnostics(page)).skillActivations;
    const { canvas } = await geometry(page);

    /**
     * The multi-touch case the old drag model got wrong once ("dragging to steer blocks the skill button").
     *
     * Both fingers are routed independently, so this has to keep working rather than be assumed: the second
     * pointer must not steal the first one's drag, and the drag must keep delivering displacement while the skill
     * is being spent.
     */
    await page.evaluate(
      (p) => {
        const g = (window as unknown as {
          __GB: {
            game: {
              debugGrantSkill: (id: string) => void;
              handlePointerDown: (id: number, x: number, y: number) => void;
              touchRef: { skillGeometry: { x: number; y: number } };
            };
          };
        }).__GB.game;
        g.debugGrantSkill('dash');
        const s = g.touchRef.skillGeometry;
        g.handlePointerDown(71, p.x, p.y);
        g.handlePointerDown(82, s.x, s.y);
      },
      { x: canvas.width * 0.5, y: canvas.height * 0.3 },
    );

    const state = await drag(page);
    expect(state.steering, 'the steering finger keeps the drag').toBe(true);

    await expect
      .poll(async () => (await diagnostics(page)).skillActivations, { message: 'the skill must fire', timeout: 5000 })
      .toBeGreaterThan(activationsBefore);
  });
});
