import { expect, test, type Page } from '@playwright/test';
import { boot, diagnostics, startFromMenu, waitForPhase } from './helpers';

/**
 * The codex: a page of cards for everything in the game, reached from the main menu.
 *
 * ---------------------------------------------------------------------------------------------
 * THE TWO CLAIMS WORTH TESTING
 * ---------------------------------------------------------------------------------------------
 * 1. IT CANNOT GO STALE. Every creature, skill and talent the game has must have a card, and a card's NUMBERS must
 *    come from the same tables the simulation reads. Those are the two ways an in-game encyclopedia normally rots --
 *    an entry nobody wrote, and an entry describing a creature that has since been retuned -- and both are checked
 *    here against the GAME's own lists rather than against a second copy written into the test.
 *
 * 2. IT IS REACHABLE. Through the real menu button and the real page controls, because a page with no working door
 *    is indistinguishable from no page at all.
 *
 * Deliberately NOT tested: the pictures. A test cannot see whether an urchin reads as an urchin, and pretending
 * otherwise produces an assertion that would pass for a card drawn in entirely the wrong colour.
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const codex = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: {
        game: {
          diagnostics: {
            phase: string;
            codex: {
              open: boolean;
              category: string;
              page: number;
              pages: number;
              total: number;
              visible: string[];
              entries: Record<string, number>;
              entryIds: string[];
              gameHazards: string[];
              gameSkills: string[];
              gameTalents: string[];
              gameBubbleTypes: string[];
            };
          };
          codexRef: { texts: string[] };
        };
      };
    }).__GB.game;
    return { ...g.diagnostics.codex, phase: g.diagnostics.phase, texts: g.codexRef.texts };
  });

/** Press the centre of a rectangle, through the same stage-level path a finger takes. */
const press = async (page: Page, rect: Rect): Promise<void> => {
  await page.evaluate(
    async (at) => {
      const g = (window as unknown as {
        __GB: { game: { handlePointerDown: (id: number, x: number, y: number) => void; handlePointerUp: (id: number) => void } };
      }).__GB.game;
      g.handlePointerDown(71, at.x, at.y);
      g.handlePointerUp(71);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    },
    { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 },
  );
};

/** Where every control currently is, so a probe aims at the real ones instead of guessing. */
const geometry = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as {
      __GB: {
        game: {
          menuRef: { geometry: { button: Rect; codex: Rect } };
          codexRef: { geometry: { tabs: { id: string; rect: Rect }[]; buttons: { id: string; rect: Rect }[] } };
        };
      };
    }).__GB.game;
    return { menu: g.menuRef.geometry, codex: g.codexRef.geometry };
  });

const openCodex = (page: Page) =>
  page.evaluate(() => (window as unknown as { __GB: { game: { debugOpenCodexForTest: () => void } } }).__GB.game.debugOpenCodexForTest());

test.describe('the codex', () => {
  test('opens from the menu button, and the back button returns to the menu', async ({ page }) => {
    await boot(page);

    const atBoot = await diagnostics(page);
    expect(atBoot.phase, 'the game opens on the menu').toBe('menu');

    const geo = await geometry(page);
    expect(geo.menu.codex.w, 'the menu must offer a codex button').toBeGreaterThan(0);
    // Below the start button, and the same width: they share a column, so a press meant for one cannot land on the
    // other by a few pixels.
    expect(geo.menu.codex.y, 'the codex button sits below the start button').toBeGreaterThan(geo.menu.button.y);
    expect(geo.menu.codex.w, 'and they share a width').toBeCloseTo(geo.menu.button.w, 1);

    await press(page, geo.menu.codex);
    const open = await codex(page);
    expect(open.open, 'pressing it must open the codex').toBe(true);
    expect(open.phase, 'and the game must be IN the codex phase, not still on the menu').toBe('codex');
    expect(open.category, 'opening lands on the first tab').toBe('enemy');
    expect(open.page, 'and the first page').toBe(0);
    expect(open.visible.length, 'with cards on it').toBeGreaterThan(0);

    const back = geo.codex.buttons.find((b) => b.id === 'back');
    expect(back, 'the page must have a back button').toBeTruthy();
    await press(page, back!.rect);

    const after = await codex(page);
    expect(after.open, 'and it must leave').toBe(false);
    expect(after.phase, 'back to the menu').toBe('menu');
    /**
     * And the RUN has not started. A codex button that also began a level would be a very confusing menu, and the
     * two callbacks are one typo apart.
     */
    await waitForPhase(page, 'menu');
  });

  test('every creature, skill and talent in the game has a card -- checked against the game, not against itself', async ({ page }) => {
    await boot(page);
    const c = await codex(page);

    expect(c.gameHazards.length, 'the game must have creatures to document').toBeGreaterThan(0);
    for (const kind of c.gameHazards) {
      expect(c.entryIds, `the ${kind} has no card`).toContain(`enemy:${kind}`);
    }
    for (const id of c.gameSkills) {
      expect(c.entryIds, `the ${id} skill has no card`).toContain(`skill:${id}`);
    }
    for (const id of c.gameTalents) {
      expect(c.entryIds, `the ${id} talent has no card`).toContain(`talent:${id}`);
    }
    /**
     * And every bubble TYPE, which is the newest way this page could have gone stale.
     *
     * The bubble tab was written when there was one bubble, and its cards read as if suction, spitting and digesting
     * were rules of the game rather than one character's verbs -- true for exactly as long as it took a second type
     * to exist. The card ids are `bubble:<type>` now, keyed by the game's own type ids, so a third type with no prose
     * fails here.
     */
    for (const id of c.gameBubbleTypes) {
      expect(c.entryIds, `the ${id} bubble has no card`).toContain(`bubble:${id}`);
    }

    /**
     * The two lists being compared come from different places on purpose.
     *
     * `gameHazards` is `Object.keys(KIND_TUNING)`, a TOTAL record over the hazard union -- so adding a creature
     * without a tuning row is a compile error and cannot hide here. `entryIds` is the codex's own list. Two
     * independent lists, and the test is that they agree: that is what makes "you cannot add a creature without
     * documenting it" true rather than aspirational.
     */
    expect(
      c.entryIds.length,
      'the page must also document the things that are not creatures -- food, obstacles, the bubble, its verbs',
    ).toBeGreaterThan(c.gameHazards.length);
    expect(new Set(c.entryIds).size, 'no card may be listed twice').toBe(c.entryIds.length);
    for (const category of ['enemy', 'environment', 'bubble', 'skill', 'talent']) {
      expect(c.entries[category], `the ${category} tab must not be empty`).toBeGreaterThan(0);
    }
  });

  test('a card shows the numbers from the live config, so the page cannot describe an older game', async ({ page }) => {
    await boot(page);
    await openCodex(page);

    const before = await codex(page);
    const original = await page.evaluate(
      () => (window as unknown as { __GB: { mechRef: { consumption: { mass: Record<string, number> } } } }).__GB.mechRef.consumption.mass.fish!,
    );
    // A distinctive value, so finding it in the drawn text afterwards cannot be a coincidence.
    await page.evaluate(
      () => ((window as unknown as { __GB: { mechRef: { consumption: { mass: Record<string, number> } } } }).__GB.mechRef.consumption.mass.fish = 9.87),
    );

    /**
     * Redraw by switching tabs and back, which is the mechanism under test.
     *
     * The cards are built when the page DRAWS. A module-level table would have captured the config at import time and
     * nothing here would change -- which is the failure this asserts against, because the page's whole claim is that
     * it describes the game as it currently is.
     */
    const geo = await geometry(page);
    await press(page, geo.codex.tabs.find((t) => t.id === 'skill')!.rect);
    await press(page, geo.codex.tabs.find((t) => t.id === 'enemy')!.rect);

    const after = await codex(page);
    expect(before.texts.some((t) => t.includes('9.87')), 'the value must not already have been on the page').toBe(false);
    expect(after.texts.length, 'the cards must have text on them').toBeGreaterThan(0);
    /**
     * The value alone, because a fact is drawn as TWO objects -- a dim label and a bright value, so the values line up
     * in a column. Asserting the pair as one string is what the first version of this test did, and it stopped being
     * true the moment the layout changed; the value itself is the thing that comes from the config either way.
     */
    expect(
      after.texts.some((t) => t.trim() === '9.87'),
      `the card must show the retuned mass rather than the one from when the module loaded (was ${original})`,
    ).toBe(true);

    await page.evaluate(
      () => ((window as unknown as { __GB: { mechRef: { consumption: { mass: Record<string, number> } } } }).__GB.mechRef.consumption.mass.fish = 0.28),
    );
  });

  test('the tabs switch category and the page buttons turn pages, and a tab starts at its own first page', async ({ page }) => {
    await boot(page);
    await openCodex(page);

    const geo = await geometry(page);
    const tab = (id: string) => geo.codex.tabs.find((t) => t.id === id)!.rect;
    const button = (id: string) => geo.codex.buttons.find((b) => b.id === id)!.rect;

    /**
     * The enemy tab is the only one that does not fit on a page -- nine creatures against four to six elsewhere --
     * so it is where paging is observable at all.
     */
    const first = await codex(page);
    expect(first.category).toBe('enemy');
    expect(first.pages, 'the enemy tab needs more than one page').toBeGreaterThan(1);
    const perPage = first.visible.length;

    await press(page, button('next'));
    const second = await codex(page);
    expect(second.page, 'next turns the page').toBe(1);
    expect(second.visible.length, 'and the last page holds what is left').toBeGreaterThan(0);
    expect(second.visible.length, 'which is less than a full page, or there would be another one').toBeLessThan(perPage);
    expect(
      second.visible.some((id) => first.visible.includes(id)),
      'a page turn must show different cards, not the same ones again',
    ).toBe(false);

    await press(page, button('next'));
    expect((await codex(page)).page, 'next must not walk off the end').toBe(1);

    await press(page, button('prev'));
    const backOne = await codex(page);
    expect(backOne.page, 'prev comes back').toBe(0);
    expect(backOne.visible, 'and shows the same cards as before').toEqual(first.visible);

    /**
     * A tab starts at ITS OWN first page.
     *
     * Turning to page 2 of the enemies and then switching tabs must not leave the new tab on a page it does not
     * have. That is a real bug shape here rather than a hypothetical one, because the category and the page are
     * separate pieces of state and only one of them is being changed.
     */
    await press(page, button('next'));
    expect((await codex(page)).page).toBe(1);
    await press(page, tab('skill'));
    const skills = await codex(page);
    expect(skills.category).toBe('skill');
    expect(skills.page, 'a new tab starts at the top').toBe(0);
    expect(skills.pages, 'the skill tab fits on one page').toBe(1);
    expect(
      skills.visible.every((id) => id.startsWith('skill:')),
      'and it shows only that tab: a page that mixed categories would not be a tab',
    ).toBe(true);

    await press(page, tab('enemy'));
    const backToEnemies = await codex(page);
    expect(backToEnemies.category, 'and going back to the enemy tab').toBe('enemy');
    expect(backToEnemies.page, 'also starts it at the top').toBe(0);
  });

  test('the codex is not reachable mid-run, and pressing where its button was does not start it', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const geo = await geometry(page);
    expect((await codex(page)).open, 'a run must not be in the codex').toBe(false);

    /**
     * The menu's rectangles are stale once a level is running -- nothing is drawing them -- so this presses exactly
     * where the codex button used to be. It must do nothing: the codex is reference material, and a player should not
     * be able to open a wall of text with a fuse burning. "I need to look something up" mid-run is what the pause
     * panel is for, and it already freezes the simulation.
     */
    await press(page, geo.menu.codex);
    expect((await diagnostics(page)).phase, 'the run must still be running').toBe('playing');
    expect((await codex(page)).open, 'and the codex must still be shut').toBe(false);
  });
});
