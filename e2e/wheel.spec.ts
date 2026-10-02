import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, expectNoErrors, player, startFromMenu, waitForPhase, watchForErrors } from './helpers';

/**
 * The touch wheel: a virtual analog stick at the bottom of the lane.
 *
 * Push direction and push distance map to direction and speed. These tests drive it through the game's own
 * pointer entry points at the wheel's REPORTED geometry, so a pad drawn in one place and hit-tested in another
 * fails rather than passing quietly.
 */
test.describe('the touch wheel', () => {
  /** The wheel's real geometry, plus the input state it produces. */
  const wheel = (page: Page) =>
    page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            touchRef: {
              wheelGeometry: { x: number; y: number; radius: number; deadZone: number };
              debugState: { held: boolean; deflection: number; axisX: number; axisY: number; knobX: number; knobY: number };
            };
          };
        };
      }).__GB.game;
      return { geo: g.touchRef.wheelGeometry, state: g.touchRef.debugState };
    });

  /** Push the wheel to a position at `fraction` of its radius, in a direction given in SCREEN terms. */
  const push = async (page: Page, dxFraction: number, dyScreenFraction: number, pointerId = 71): Promise<void> => {
    const { geo } = await wheel(page);
    // Screen y grows downwards, so "up" is a negative offset here. Clamping to the radius is the game's job.
    const x = geo.x + geo.radius * dxFraction;
    const y = geo.y + geo.radius * dyScreenFraction;
    await page.evaluate(
      (p) => {
        const g = (window as unknown as { __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void } } }).__GB.game;
        g.handlePointerDown(p.id, p.x, p.y);
      },
      { id: pointerId, x, y },
    );
  };

  const release = async (page: Page, pointerId = 71): Promise<void> => {
    await page.evaluate(
      (id) => {
        const g = (window as unknown as { __GB: { game: { handlePointerUp: (id: number) => void } } }).__GB.game;
        g.handlePointerUp(id);
      },
      pointerId,
    );
  };

  test('a touch on the pad is held, and one outside it is not', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const { geo } = await wheel(page);
    expect(geo.radius, 'the wheel must have been laid out').toBeGreaterThan(10);

    // A touch well outside the pad, up in the water: the wheel must not claim it.
    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void; canvasSize: { width: number; height: number } } } }).__GB.game;
      g.handlePointerDown(70, g.canvasSize.width / 2, g.canvasSize.height * 0.3);
    });
    expect((await wheel(page)).state.held, 'a touch in the water must not grab the wheel').toBe(false);

    // A touch on the pad is claimed.
    await push(page, 0, 0, 72);
    expect((await wheel(page)).state.held, 'a touch on the pad must be held').toBe(true);
  });

  test('inside the dead zone the bubble does not move; outside it does', async ({ page }) => {
    const errors = watchForErrors(page);
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const { geo } = await wheel(page);

    /**
     * Just inside the dead zone: no axis at all.
     *
     * This is the property that makes the pad usable -- a thumb that lands 5px off centre must not send the
     * bubble drifting, or the player fights the control instead of the water.
     */
    const inside = geo.deadZone * 0.5;
    await page.evaluate(
      (p) => {
        const g = (window as unknown as { __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void } } }).__GB.game;
        g.handlePointerDown(71, p.x, p.y);
      },
      { x: geo.x + inside, y: geo.y },
    );
    let state = (await wheel(page)).state;
    expect(state.held, 'the pad is held even inside the dead zone').toBe(true);
    expect(state.axisX, 'but it produces no input').toBe(0);
    expect(state.deflection).toBe(0);

    // Just outside: a small but real input, NOT a jump to full.
    await page.evaluate(
      (p) => {
        const g = (window as unknown as { __GB: { game: { handlePointerMove: (id: number, x: number, y: number) => void } } }).__GB.game;
        g.handlePointerMove(71, p.x, p.y);
      },
      { x: geo.x + geo.deadZone * 1.6, y: geo.y },
    );
    state = (await wheel(page)).state;
    expect(state.axisX, 'just outside the dead zone must give a small push, not a jump').toBeGreaterThan(0);
    expect(state.axisX, 'and it must be a FRACTION of full speed').toBeLessThan(0.35);

    await release(page);
    await expectNoErrors(errors);
  });

  test('full deflection gives full speed, and the direction is the one pushed', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /** Park the bubble in the middle so a push has room to move it. */
    const recentre = () =>
      page.evaluate(() => {
        const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
        g.game.debugSetSteadyCruise();
        g.player.x = 0.5;
        g.player.screenY = 0.5;
      });

    // --- Right, at full deflection ---
    await recentre();
    await push(page, 1, 0);
    let state = (await wheel(page)).state;
    expect(state.axisX, 'pushing right must give a positive x axis').toBeCloseTo(1, 1);
    expect(Math.abs(state.axisY), 'and no vertical axis').toBeLessThan(0.05);

    const beforeRight = await player(page);
    await expect
      .poll(async () => (await player(page)).x, { message: 'the bubble must move right', timeout: 5000 })
      .toBeGreaterThan(beforeRight.x + 0.1);
    await release(page);

    // --- Up, at full deflection ---
    await recentre();
    await push(page, 0, -1);
    state = (await wheel(page)).state;
    expect(state.axisY, 'pushing up the screen must give a positive vertical axis').toBeCloseTo(1, 1);

    const beforeUp = await player(page);
    await expect
      .poll(async () => (await player(page)).screenY, { message: 'the bubble must move up the screen', timeout: 5000 })
      .toBeGreaterThan(beforeUp.screenY + 0.05);
    await release(page);
  });

  test('releasing recentres the stick and the bubble coasts to a stop', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });

    await push(page, 1, 0);
    await page.waitForTimeout(200);
    await release(page);

    const state = (await wheel(page)).state;
    expect(state.held, 'the pad must be released').toBe(false);
    expect(state.axisX, 'and the axis must be recentred, not left where the thumb stopped').toBe(0);
    expect(state.axisY).toBe(0);
    expect(state.deflection).toBe(0);

    /**
     * The bubble COASTS rather than stopping dead, and then stops.
     *
     * Coasting is what makes a small correction possible instead of a lurch, so the assertion is that it settles
     * rather than that it halts instantly.
     */
    await page.waitForTimeout(1200);
    const first = await player(page);
    await page.waitForTimeout(600);
    const second = await player(page);
    expect(Math.abs(second.vx), 'the bubble must settle to a stop').toBeLessThan(0.01);
    expect(second.x, 'and stay put once stopped').toBeCloseTo(first.x, 3);
  });

  test('the bubble does not follow the finger any more', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    await page.evaluate(() => {
      const g = (window as unknown as { __GB: { game: { debugSetSteadyCruise: () => void }; player: { x: number; screenY: number } } }).__GB;
      g.game.debugSetSteadyCruise();
      g.player.x = 0.5;
      g.player.screenY = 0.5;
    });

    const { geo } = await wheel(page);
    const before = await player(page);

    /**
     * THE REGRESSION THIS REPLACES: a touch far to the right of the pad used to be a destination.
     *
     * Under the old model, pressing at 90% of the lane put the bubble there. Now that touch is outside the pad,
     * so it must do nothing at all -- which is the whole difference between a stick and a drag, and the reason
     * the player's thumb no longer covers the bubble.
     */
    await page.evaluate(
      (p) => {
        const g = (window as unknown as { __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void } } }).__GB.game;
        g.handlePointerDown(71, p.x, p.y);
      },
      { x: geo.x + geo.radius * 3, y: geo.y },
    );
    await page.waitForTimeout(500);

    const after = await player(page);
    expect(after.x, 'a touch outside the pad must not move the bubble').toBeCloseTo(before.x, 2);
    expect(after.screenY, 'on either axis').toBeCloseTo(before.screenY, 2);
  });

  test('the wheel and the skill button can be used at the same time', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const activationsBefore = (await diagnostics(page)).skillActivations;

    /**
     * One thumb holds a direction, the other fires the skill.
     *
     * This is the multi-touch bug that was fixed once already for the drag model ("dragging to steer blocks the
     * skill button"), and the wheel has its own routing, so it is worth re-asserting rather than assuming the
     * rewrite preserved it.
     */
    await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugGrantSkill: (id: string) => void;
            handlePointerDown: (id: number, x: number, y: number) => void;
            touchRef: { skillGeometry: { x: number; y: number }; wheelGeometry: { x: number; y: number; radius: number } };
            input: { wheelX: number };
          };
        };
      }).__GB.game;
      g.debugGrantSkill('dash');
      const w = g.touchRef.wheelGeometry;
      const s = g.touchRef.skillGeometry;
      g.handlePointerDown(71, w.x + w.radius, w.y);
      g.handlePointerDown(82, s.x, s.y);
    });

    // The wheel must still be producing input with the second finger down.
    const state = await wheel(page);
    expect(state.state.axisX, 'the wheel must keep working while the skill is pressed').toBeGreaterThan(0.8);

    await expect
      .poll(async () => (await diagnostics(page)).skillActivations, { message: 'the skill must fire', timeout: 5000 })
      .toBeGreaterThan(activationsBefore);
  });
});
