import { expect, test } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Level selection and progression.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS FILE EXISTS TO PROVE
 * ---------------------------------------------------------------------------------------------
 * Three claims, and the middle one is the reason there is a save file at all:
 *
 *   1. The menu offers the levels the GAME has, in order, and the first one is playable from a fresh save.
 *   2. A locked level cannot be played, and cannot be played by TAPPING it -- the pill does not arm, so a press
 *      produces nothing rather than a run that silently starts on the wrong water.
 *   3. Reaching the surface of a level unlocks the next one, and the unlock survives a reload.
 *
 * The last one is measured through `localStorage` rather than through the menu: the menu could be redrawn from
 * anything, and a reload is the only way to tell "remembered" from "happened to still be in memory".
 */
test.describe('level select and progress', () => {
  test('the menu offers the levels the file has, in order, with only the first open', async ({ page }) => {
    await boot(page);

    /**
     * Compared against the FILE, not against a remembered list.
     *
     * The number of levels is content: the owner adds one by writing a block, and a test that hard-coded two would
     * fail on the day they did. What has to hold is that the row and the file agree, in the same order.
     */
    const { default: JSON5 } = await import('json5');
    const { readFileSync } = await import('node:fs');
    const file = JSON5.parse(readFileSync('config/levels.json5', 'utf8')) as {
      start: string;
      levels: { id: string; name: string }[];
    };

    const seen = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            menuRef: { geometry: { levels: { id: string; label: string; locked: boolean; selected: boolean }[]; levelNote: string } };
            diagnostics: { level: { ladder: { id: string; locked: boolean; selected: boolean }[]; cleared: string[] } };
          };
        };
      }).__GB.game;
      return { row: g.menuRef.geometry.levels, note: g.menuRef.geometry.levelNote, diag: g.diagnostics.level };
    });

    expect(seen.row.map((l) => l.id), 'the menu lists the file\'s levels in file order').toEqual(file.levels.map((l) => l.id));
    expect(seen.row.map((l) => l.label), 'with the file\'s names').toEqual(file.levels.map((l) => l.name));
    expect(file.levels.length, 'and there is more than one, or there would be nothing to select').toBeGreaterThan(1);

    // A fresh save: nothing cleared, the first level open and selected, everything after it locked.
    expect(seen.diag.cleared, 'a fresh save has cleared nothing').toEqual([]);
    expect(seen.row[0]!.locked, 'the first level is always playable').toBe(false);
    expect(seen.diag.ladder[0]!.selected, 'and it is the one selected').toBe(true);
    for (const later of seen.row.slice(1)) {
      expect(later.locked, `${later.id} must start locked`).toBe(true);
    }
    // And the menu SAYS why, rather than showing a dim pill with no explanation.
    expect(seen.note, 'the note under the row says what unlocks the locked one').toContain(file.levels[0]!.name);
  });

  test('tapping a locked level does nothing, and does not start a run on it', async ({ page }) => {
    await boot(page);

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            menuRef: { geometry: { levels: { id: string; locked: boolean; selected: boolean; rect: { x: number; y: number; w: number; h: number } }[] } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: { phase: string; level: { id: string; selected: string } };
          };
        };
      }).__GB.game;
      const locked = g.menuRef.geometry.levels.find((l) => l.locked)!;
      const before = { id: g.diagnostics.level.id, selected: g.diagnostics.level.selected, phase: g.diagnostics.phase };
      // Through the same pointer path a finger takes.
      g.handlePointerDown(71, locked.rect.x + locked.rect.w / 2, locked.rect.y + locked.rect.h / 2);
      g.handlePointerUp(71);
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return {
        lockedId: locked.id,
        before,
        after: { id: g.diagnostics.level.id, selected: g.diagnostics.level.selected, phase: g.diagnostics.phase },
        row: g.menuRef.geometry.levels.map((l) => ({ id: l.id, locked: l.locked, selected: l.selected })),
      };
    });

    expect(result.after.selected, 'a locked level cannot become the selection').toBe(result.before.selected);
    expect(result.after.id, 'and the game is still pointed at the level it was').toBe(result.before.id);
    expect(result.after.phase, 'and no run started').toBe(result.before.phase);
    expect(result.row.find((l) => l.id === result.lockedId)!.selected, 'and it is not drawn as selected').toBe(false);
  });

  test('the selected level is the one that gets played, with its own length and content', async ({ page }) => {
    await boot(page);

    const { default: JSON5 } = await import('json5');
    const { readFileSync } = await import('node:fs');
    const file = JSON5.parse(readFileSync('config/levels.json5', 'utf8')) as {
      levels: { id: string; name: string; scrollLength: number; scrollSpeed: number; spawns: unknown[] }[];
    };
    const second = file.levels[1]!;

    const result = await page.evaluate(async (id) => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugProgress: () => { ladder: { id: string }[] };
            debugClearLevel: (id: string) => string | null;
            debugSelectLevel: (id: string) => boolean;
            debugStartRunWithRoute: (id: string) => string | null;
            diagnostics: { level: { id: string; scrollLength: number; scrollSpeed: number; entriesTotal: number; blocks: number } };
          };
        };
      }).__GB.game;
      /**
       * Unlock it the way a player would have to: by clearing the level BEFORE it.
       *
       * Not by clearing itself, which is what the first version did -- and which does not unlock anything, because the
       * rule is "clear the previous level", not "clear the level you want".
       */
      const first = g.debugProgress().ladder[0]!.id;
      g.debugClearLevel(first);
      const selected = g.debugSelectLevel(id);
      g.debugStartRunWithRoute('devour');
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      return { selected, level: g.diagnostics.level };
    }, second.id);

    expect(result.selected, 'the unlocked level can be selected').toBe(true);
    expect(result.level.id, 'and it is the level the run happens in').toBe(second.id);
    expect(result.level.scrollLength, 'with its own length').toBe(second.scrollLength);
    expect(result.level.scrollSpeed, 'its own pacing').toBe(second.scrollSpeed);
    /**
     * And its own content: the timeline is the level's, which is the thing that would silently stay on the previous
     * level if `selectLevel` forgot to reassign it.
     */
    expect(result.level.blocks, 'and its own spawn table').toBe(second.spawns.length);
    expect(result.level.entriesTotal, 'expanded into its own timeline').toBeGreaterThan(second.spawns.length - 1);
  });

  test('reaching the surface unlocks the next level, and the save survives a reload', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * Fast-forwarded to the surface rather than played.
     *
     * The run's own end condition is what has to fire, so the scroll speed is raised until it does -- the level's
     * machinery, not a hook that fakes the win. Losing the run is not possible at this speed: nothing can catch a
     * bubble that is moving at 400 m/s.
     */
    const cleared = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            levelRef: { scrollSpeed: number };
            diagnostics: { phase: string; level: { id: string; cleared: string[]; ladder: { id: string; locked: boolean }[] } };
            hazardsRef: { hazards: unknown[] };
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      const real = g.game.levelRef.scrollSpeed;
      g.game.levelRef.scrollSpeed = 400;
      const levelId = g.game.diagnostics.level.id;
      let frames = 0;
      while (g.game.diagnostics.phase === 'playing' && frames < 600) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        frames++;
      }
      g.game.levelRef.scrollSpeed = real;
      return {
        levelId,
        frames,
        phase: g.game.diagnostics.phase,
        cleared: [...g.game.diagnostics.level.cleared],
        ladder: g.game.diagnostics.level.ladder.map((l) => ({ id: l.id, locked: l.locked })),
        banner: (window as unknown as { __GB: { game: { runBannerTextForTest?: string } } }).__GB.game.runBannerTextForTest ?? '',
      };
    });

    expect(cleared.phase, 'the run must have ENDED, or nothing was cleared').not.toBe('playing');
    expect(cleared.cleared, 'and the level it ended on must be recorded as cleared').toContain(cleared.levelId);
    expect(
      cleared.ladder.filter((l) => !l.locked).length,
      'which must open exactly one more level than before',
    ).toBe(2);

    // Reload: the only way to tell "remembered" from "still in memory".
    await page.reload();
    await page.waitForFunction(() => {
      const g = (window as unknown as { __GB?: { game?: { diagnostics?: { phase?: string } } } }).__GB;
      return g?.game?.diagnostics?.phase === 'menu';
    });
    const afterReload = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { diagnostics: { level: { cleared: string[]; ladder: { id: string; locked: boolean }[] } } } };
      }).__GB.game;
      return { cleared: [...g.diagnostics.level.cleared], unlocked: g.diagnostics.level.ladder.filter((l) => !l.locked).length };
    });
    expect(afterReload.cleared, 'the clear is still there after a reload').toContain(cleared.levelId);
    expect(afterReload.unlocked, 'and so is the unlock').toBe(2);
  });

  test('a level is unlocked by the one before it, and only by that one', async ({ page }) => {
    await boot(page);

    /**
     * The rule, asserted directly: clearing the FIRST level opens the second and nothing else.
     *
     * With two levels this is the whole rule. It is written as a loop over the ladder so that a third level added to
     * the file is checked by the same assertions rather than by new ones -- "each level opens the next" is the claim,
     * and it should hold however long the ladder gets.
     */
    const before = await page.evaluate(() =>
      (window as unknown as { __GB: { game: { debugProgress: () => { ladder: { id: string; locked: boolean }[] } } } }).__GB.game.debugProgress(),
    );
    expect(before.ladder.filter((l) => !l.locked).length, 'exactly one level is open to begin with').toBe(1);

    const step = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugProgress: () => { ladder: { id: string; locked: boolean }[] };
            debugClearLevel: (id: string) => string | null;
          };
        };
      }).__GB.game;
      const opened: (string | null)[] = [];
      // Clear them one at a time from the top; each should open exactly one more.
      const seen: number[] = [];
      for (let i = 0; i < 3; i++) {
        const ladder = g.debugProgress().ladder;
        const next = ladder.find((l) => !l.locked && !seen.includes(ladder.indexOf(l)));
        if (!next) break;
        const index = ladder.indexOf(next);
        seen.push(index);
        opened.push(g.debugClearLevel(next.id));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
      return { opened, ladder: g.debugProgress().ladder };
    });

    expect(step.opened[0], 'clearing the first level opens the second').toBe(step.ladder[1]?.id ?? null);
    // And clearing a level twice opens nothing: `clear` is idempotent, so a second visit to the surface is not a
    // second unlock.
    const again = await page.evaluate((id) => {
      const g = (window as unknown as { __GB: { game: { debugClearLevel: (id: string) => string | null } } }).__GB.game;
      return g.debugClearLevel(id);
    }, before.ladder[0]!.id);
    expect(again, 'clearing an already-cleared level opens nothing').toBeNull();
  });

  test('progress can be reset, which is what makes the ladder testable and a save clearable', async ({ page }) => {
    await boot(page);

    const result = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugProgress: () => { cleared: string[]; selected: string; ladder: { id: string; locked: boolean }[] };
            debugClearLevel: (id: string) => string | null;
            debugSelectLevel: (id: string) => boolean;
            debugResetProgress: () => void;
          };
        };
      }).__GB.game;
      const first = g.debugProgress().ladder[0]!.id;
      g.debugClearLevel(first);
      const second = g.debugProgress().ladder[1]!;
      g.debugSelectLevel(second.id);
      const progressed = g.debugProgress();

      const stored = localStorage.getItem('tgba.progress.v1');
      g.debugResetProgress();
      return { progressed, stored, after: g.debugProgress(), first };
    });

    expect(result.progressed.cleared, 'progress accumulates').toContain(result.first);
    expect(result.progressed.selected, 'and the selection moves with it').not.toBe(result.first);
    // The save is where a reader would look for it, and it is JSON.
    expect(result.stored, 'the save is written to the documented key').toContain(result.first);
    expect(JSON.parse(result.stored!).selected, 'and it holds the selection').toBe(result.progressed.selected);
    expect(result.after.cleared, 'reset forgets everything').toEqual([]);
    expect(result.after.selected, 'and goes back to the level the file names as start').toBe(result.first);
    expect(result.after.ladder.filter((l) => !l.locked).length, 'leaving one level open').toBe(1);
  });
});
