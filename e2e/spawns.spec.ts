import { expect, test } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * The level's spawn table, and the four ways content can arrive.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THESE CASES ARE FOR
 * ---------------------------------------------------------------------------------------------
 * Two claims need proving, and neither is visible in a screenshot. The first is that the level FILE is what drives
 * the level -- that a block's `count` decides how many creatures appear, and that the loader refuses a block it
 * cannot honour instead of ignoring the part it did not understand. The second is that content can arrive from the
 * sides and from below: a creature that swims in from the left has to spawn OUTSIDE the lane, or it has spawned
 * rather than swum.
 *
 * Both are measured from the game's own diagnostics rather than from the file, which is the only way the two can
 * disagree out loud.
 */
test.describe('level spawning', () => {
  test('the level file is what drives the level', async ({ page }) => {
    await boot(page);

    const fromFile = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { diagnostics: { level: { entriesTotal: number; blocks: number; installed: boolean; id: string } } } };
      }).__GB.game;
      return g.diagnostics.level;
    });

    /**
     * The shipped file, read and expanded.
     *
     * 51 blocks becoming 177 entries is asserted rather than "more than zero" because the pair is what catches a
     * conversion error: every block expands to a known number of entries, and a change to either number is a change
     * to the level. When the timeline moved out of `src/levels.ts` into the file, this pair had to come out
     * identical -- 171 entries from the 48 original blocks, plus the 6 that the three new side/bottom example blocks
     * add.
     */
    expect(fromFile.id, 'the file names the level being played').toBe('open-water');
    expect(fromFile.blocks, 'the file holds this many blocks').toBe(51);
    expect(fromFile.entriesTotal, 'which expand to this many entries').toBe(177);
    expect(fromFile.installed, 'and nothing has replaced them').toBe(false);

    /**
     * A hand-written table, through the same reader and the same expansion.
     *
     * `count` is the number the owner edits to say "three fish", so it is the number asserted: five blocks of one,
     * two, three, four and five entries are twenty entries, whatever the arrangements are.
     */
    const installed = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugInstallSpawnBlocks: (blocks: readonly unknown[]) => number;
            diagnostics: { level: { entriesTotal: number; blocks: number; installed: boolean } };
          };
        };
      }).__GB.game;
      const count = g.debugInstallSpawnBlocks([
        { at: 10, kind: 'jelly', x: 0.5 },
        { at: 20, kind: 'fish', count: 2, arrange: 'line' },
        { at: 30, kind: 'fish', count: 3, arrange: 'spread', span: 10, amplitude: 0.1 },
        { at: 40, kind: 'bubble', count: 4, arrange: 'line' },
        { at: 50, kind: 'bubble', count: 5, arrange: 'spread', span: 20, amplitude: 0.2 },
      ]);
      return { count, level: g.diagnostics.level };
    });

    // The blocks were count 1, 2, 3, 4 and 5, so fifteen entries -- count is the number the owner edits, and the
    // total is the only number that catches one of them being ignored.
    expect(installed.count, 'the blocks together place 1+2+3+4+5 entries').toBe(15);
    expect(installed.level.blocks, 'the file is reported as holding the blocks that were installed').toBe(5);
    expect(installed.level.entriesTotal, 'and the timeline holds what they expanded to').toBe(15);
    expect(installed.level.installed, 'and the level reports that it is not the file\'s timeline any more').toBe(true);
  });

  test('a block the loader cannot honour is refused by name', async ({ page }) => {
    await boot(page);

    /**
     * Four refusals, each for a different reason, each naming what is wrong.
     *
     * These matter more than they look. An ignored key is invisible: a block written with `amplitoode` would produce
     * a straight line instead of a weave, and the owner would be looking at the game wondering why their edit did
     * nothing. The other three are things the game genuinely cannot do -- scenery that swims up, a row of creatures
     * arranged as a barrier, and content arriving from the side that has no way to move sideways.
     */
    const refusals = await page.evaluate(() => {
      const g = (window as unknown as {
        __GB: { game: { debugInstallSpawnBlocks: (blocks: readonly unknown[]) => number } };
      }).__GB.game;
      const attempt = (blocks: readonly unknown[]): string => {
        try {
          g.debugInstallSpawnBlocks(blocks);
          return 'accepted';
        } catch (e) {
          return (e as Error).message;
        }
      };
      return {
        typo: attempt([{ at: 10, kind: 'fish', amplitoode: 0.2 }]),
        sceneryUp: attempt([{ at: 10, kind: 'crate', from: 'bottom' }]),
        fishBarrier: attempt([{ at: 10, kind: 'fish', count: 3, arrange: 'barrier' }]),
        bubbleSide: attempt([{ at: 10, kind: 'bubble', from: 'left' }]),
        noAt: attempt([{ kind: 'fish' }]),
        badKind: attempt([{ at: 10, kind: 'dolphin' }]),
      };
    });

    expect(refusals.typo, 'a misspelled key must be named').toContain('amplitoode');
    expect(refusals.typo, 'and the message must say which block it was').toContain('spawns[0]');
    expect(refusals.sceneryUp, 'scenery cannot swim up').toContain('scenery cannot swim up');
    expect(refusals.fishBarrier, 'only obstacles can be arranged as a barrier').toContain('only obstacles');
    expect(refusals.bubbleSide, 'collectables come down with the current').toContain('collectables and skills');
    expect(refusals.noAt, '"at" is required').toContain('required');
    expect(refusals.badKind, 'an unknown kind is listed against the known ones').toContain('should be one of');
  });

  test('a creature entering from the left starts outside the lane and swims in', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugInstallSpawnBlocks: (blocks: readonly unknown[]) => number;
            levelRef: { scrollSpeed: number };
            diagnostics: { level: { arrivals: Record<string, number> }; obstacles: unknown };
            hazardsRef: { hazards: { kind: string; x: number; y: number; entry: unknown }[] };
            camera: { viewport: { laneWidthMeters: number } };
            spawnLogRef: readonly { kind: string; from: string; x: number }[];
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      /**
       * Three fish from the left, entering at 60 m/s so the arrival is over in a handful of frames.
       *
       * `at: 20` rather than a real level distance: the run starts at zero and the point is the ARRIVAL, not the
       * wait. The block is expanded by the game's own reader, so what is under test is the shipped path.
       */
      g.game.debugInstallSpawnBlocks([
        { at: 20, kind: 'fish', count: 3, arrange: 'spread', span: 20, from: 'left', depth: 0.7, enterSpeed: 60 },
      ]);
      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.x = 0.5;
      g.player.screenY = 0.5;

      /**
       * Scroll until they have arrived, sampling the widest position seen.
       *
       * Nothing can be read from one frame: they spawn off-screen, and by the time they are inside the entry state is
       * gone. So this records the extremes while it waits, which is also what makes "it never appeared inside the
       * lane" and "it appeared inside the lane immediately" distinguishable.
       */
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let sawEntering = false;
      let frames = 0;
      while (g.game.diagnostics.level.arrivals['left']! < 3 && frames < 600) {
        for (const h of g.game.hazardsRef.hazards) {
          minX = Math.min(minX, h.x);
          maxX = Math.max(maxX, h.x);
          if (h.entry) sawEntering = true;
        }
        await raf();
        frames++;
      }
      // And then let the last one finish arriving.
      for (let i = 0; i < 40; i++) {
        for (const h of g.game.hazardsRef.hazards) {
          minX = Math.min(minX, h.x);
          maxX = Math.max(maxX, h.x);
          if (h.entry) sawEntering = true;
        }
        await raf();
      }

      return {
        lane,
        arrivals: { ...g.game.diagnostics.level.arrivals },
        minX,
        maxX,
        sawEntering,
        spawnLog: g.game.spawnLogRef.filter((e) => e.from === 'left').map((e) => ({ kind: e.kind, x: e.x })),
        inside: g.game.hazardsRef.hazards.filter((h) => h.kind === 'fish' && h.x >= 0 && h.x <= lane).length,
        stillEntering: g.game.hazardsRef.hazards.filter((h) => h.entry).length,
        frames,
      };
    });

    console.log(`left entry: ${JSON.stringify(run)}`);
    expect(run.arrivals['left'], 'three fish were placed, and all three came from the left').toBe(3);
    expect(run.spawnLog.length, 'and the spawn log agrees about where they came from').toBe(3);
    /**
     * The measurement that matters: they started OUTSIDE the lane.
     *
     * That is the difference between swimming in and spawning in. A fish placed at x = 0 is inside the play area, and
     * the player sees it appear.
     */
    expect(run.minX, 'a left entry must spawn outside the lane').toBeLessThan(0);
    for (const entry of run.spawnLog) {
      expect(entry.x, 'and the log must show the off-screen spawn position').toBeLessThan(0);
    }
    expect(run.sawEntering, 'they must be in the arriving state at least once').toBe(true);
    expect(run.stillEntering, 'and have finished arriving by the end').toBe(0);
    expect(run.inside, 'and ended up inside the lane').toBe(3);
  });

  test('a creature entering from below rises into view, against the current', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugInstallSpawnBlocks: (blocks: readonly unknown[]) => number;
            diagnostics: { level: { arrivals: Record<string, number> } };
            hazardsRef: { hazards: { id: number; kind: string; x: number; y: number; entry: unknown }[] };
            camera: { visibleWorldRange: (d: number) => { min: number; max: number } };
            spawnLogRef: readonly { kind: string; from: string; worldY: number; visibleBottom: number }[];
          };
          player: { x: number; screenY: number; y: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      /**
       * Two URCHINS from below, at the default entry speed.
       *
       * An urchin rather than a fish, and that is a measurement choice rather than a taste one: a fish is FOOD for the
       * devour bubble, so it gets eaten at the end of its rise and the exact moment the arrival ends is never
       * observable -- the first version of this case measured that and read `null`. An urchin cannot be eaten at this
       * size and does not leave, so the handover is a frame the probe can actually see.
       *
       * The default entry speed rather than a fast one, because the claim under test is that the DEFAULT can
       * out-swim the current: if it could not, nothing would ever appear from behind and the block would look like it
       * did nothing.
       */
      g.game.debugInstallSpawnBlocks([{ at: 20, kind: 'urchin', count: 2, arrange: 'spread', span: 10, x: 0.5, from: 'bottom' }]);
      g.player.x = 0.5;
      g.player.screenY = 0.5;

      let frames = 0;
      while (g.game.diagnostics.level.arrivals['bottom']! < 2 && frames < 600) {
        await raf();
        frames++;
      }

      const first = g.game.hazardsRef.hazards.map((h) => ({ y: h.y, entry: h.entry !== null }));
      /**
       * Then let them rise, and ask whether they became VISIBLE -- asked every frame.
       *
       * Comparing the best y against the bottom of the view at the END would be wrong, and was: the view rises with
       * the camera at the scroll speed, so a creature that climbed into view and then fell behind looks, in a final
       * sample, like one that never arrived. Visibility is a moment, not a position.
       */
      let best = Number.NEGATIVE_INFINITY;
      let sawEntering = false;
      let seenInView = false;
      /**
       * How close to the player the arrival ended, which is the claim about `bottom` entries.
       *
       * Sampled at the TRANSITION rather than compared at the end: "the arrival ends when it is level with the player"
       * is a statement about one frame, and by the end of the sample the creature is somewhere else entirely. Keyed by
       * id because the list is rebuilt as hazards come and go.
       */
      let closestWhileEntering = Number.POSITIVE_INFINITY;
      /**
       * Long enough, and only MY creatures.
       *
       * The view is 735 metres tall, so a creature climbing from below the bottom edge to the player has about 370
       * metres to cover at 45 m/s -- eight seconds, or roughly 160 frames. The first version sampled 90 frames and
       * every hazard in the water, so it reported a number belonging to a level-spawned fish and missed the handover
       * entirely.
       */
      for (let i = 0; i < 320; i++) {
        const bottom = g.game.camera.visibleWorldRange(0).min;
        for (const h of g.game.hazardsRef.hazards.filter((x) => x.kind === 'urchin')) {
          best = Math.max(best, h.y);
          const entering = h.entry !== null;
          if (entering) sawEntering = true;
          if (h.y >= bottom) seenInView = true;
          /**
           * The closest it got to the player's depth WHILE STILL ARRIVING, which is the claim.
           *
           * Not the gap at the moment the arrival ends: the simulation sub-steps at 120Hz behind a rendered frame,
           * so the transition happens between samples and by the time it is observed the creature has already spent
           * part of a frame behaving normally. The closest approach cannot be faked by sampling -- an arrival that
           * stopped at the bottom edge of the view would leave this number in the hundreds, and one that stops level
           * with the player leaves it inside a frame of closing speed.
           */
          if (entering) closestWhileEntering = Math.min(closestWhileEntering, Math.abs(h.y - g.player.y));
        }
        await raf();
      }

      return {
        arrivals: { ...g.game.diagnostics.level.arrivals },
        spawnLog: g.game.spawnLogRef.filter((e) => e.from === 'bottom').map((e) => ({ worldY: e.worldY, visibleBottom: e.visibleBottom })),
        firstY: first.map((f) => +f.y.toFixed(1)),
        bestY: +best.toFixed(1),
        sawEntering,
        seenInView,
        closestWhileEntering: Number.isFinite(closestWhileEntering) ? +closestWhileEntering.toFixed(1) : null,
        bottomOfView: +g.game.camera.visibleWorldRange(0).min.toFixed(1),
        frames,
      };
    });

    console.log(`bottom entry: ${JSON.stringify(run)}`);
    expect(run.arrivals['bottom'], 'two creatures came from below').toBe(2);
    expect(run.spawnLog.length).toBe(2);
    for (const entry of run.spawnLog) {
      expect(entry.worldY, 'a bottom entry must spawn BELOW the visible range').toBeLessThan(entry.visibleBottom);
    }
    expect(run.sawEntering, 'it must arrive rather than appear').toBe(true);
    /**
     * And it must actually get into view.
     *
     * Rising means the world y has to increase past the bottom of the view, which is a different direction from
     * everything else in the game -- the current carries the whole level downwards, so this only happens if the entry
     * speed beats the scroll. Measured against the view rather than against the spawn point, because "it moved" is
     * not the claim; "it became visible" is.
     */
    expect(run.seenInView, 'and it must become visible, not merely move').toBe(true);
    /**
     * And the arrival ENDS level with the player rather than at the edge of the view.
     *
     * This is the difference between a creature that comes up from behind and one that appears for a moment and then
     * sinks away again: everything in this game descends relative to the player, so stopping the rise at the moment it
     * becomes visible would leave a flicker. The tolerance is one frame of rising, because that is how often the
     * transition is sampled.
     */
    expect(run.closestWhileEntering, 'its arrival must be seen getting somewhere').not.toBeNull();
    expect(
      run.closestWhileEntering,
      'and the arrival must carry it up to the player, not stop at the bottom edge of the view',
    ).toBeLessThan(25);
  });

  test('a drifted obstacle settles where the level put it', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const run = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            debugInstallSpawnBlocks: (blocks: readonly unknown[]) => number;
            diagnostics: { level: { arrivals: Record<string, number> } };
            obstaclesRef: { obstacles: { kind: string; x: number; entry: unknown }[] };
            camera: { viewport: { laneWidthMeters: number } };
            spawnLogRef: readonly { kind: string; from: string; x: number }[];
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      // A crate washed in from the right, aimed at 0.72 of the lane.
      g.game.debugInstallSpawnBlocks([{ at: 20, kind: 'crate', x: 0.72, from: 'right', enterSpeed: 90 }]);
      const lane = g.game.camera.viewport.laneWidthMeters;
      g.player.x = 0.5;
      g.player.screenY = 0.5;

      let frames = 0;
      while (g.game.diagnostics.level.arrivals['right']! < 1 && frames < 600) {
        await raf();
        frames++;
      }
      const spawned = g.game.obstaclesRef.obstacles[0] ? { x: g.game.obstaclesRef.obstacles[0].x, entry: g.game.obstaclesRef.obstacles[0].entry !== null } : null;

      let minX = Number.POSITIVE_INFINITY;
      let settled: number | null = null;
      for (let i = 0; i < 180; i++) {
        const o = g.game.obstaclesRef.obstacles[0];
        if (o) {
          minX = Math.min(minX, o.x);
          if (!o.entry) settled = o.x;
        }
        await raf();
      }

      return {
        lane,
        arrivals: { ...g.game.diagnostics.level.arrivals },
        spawnLog: g.game.spawnLogRef.filter((e) => e.from === 'right').map((e) => ({ kind: e.kind, x: e.x })),
        spawned,
        minX: +minX.toFixed(1),
        settled: settled === null ? null : +(settled as number).toFixed(1),
        target: +(0.72 * lane).toFixed(1),
      };
    });

    console.log(`right entry: ${JSON.stringify(run)}`);
    expect(run.arrivals['right'], 'one crate arrived from the right').toBe(1);
    expect(run.spawned?.entry, 'and it started in the arriving state').toBe(true);
    expect(run.spawned?.x, 'spawning outside the lane on the right').toBeGreaterThan(run.lane);
    expect(run.spawnLog[0]?.x, 'which the spawn log confirms').toBeGreaterThan(run.lane);
    /**
     * Settling rather than sailing through.
     *
     * A crate that kept its velocity would cross the lane and leave by the other side, which is a moving obstacle --
     * a different mechanic. So the claim is two-part: it reached its target, and it never went past it.
     */
    expect(run.settled, 'and it must settle at the x the block asked for').toBeCloseTo(run.target, 0);
    expect(run.minX, 'and never drift past it').toBeGreaterThanOrEqual(run.target - 1);
  });

  test('the shipped level arrives from the sides as well as from above', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    /**
     * The whole level, fast-forwarded, counting arrivals by edge.
     *
     * The other cases install their own blocks, which proves the mechanism but not the FILE. This one runs the
     * shipping level at a scroll speed high enough to reach the side and bottom blocks the file contains, so the
     * claim is about what the owner will actually play.
     */
    const run = await page.evaluate(async () => {
      const g = (window as unknown as {
        __GB: {
          game: {
            levelRef: { scrollSpeed: number };
            diagnostics: { level: { arrivals: Record<string, number>; entriesEmitted: number; entriesTotal: number } };
            hazardsRef: { hazards: unknown[] };
          };
          player: { x: number; screenY: number };
        };
      }).__GB;
      const raf = (): Promise<void> => new Promise<void>((r) => requestAnimationFrame(() => r()));

      const real = g.game.levelRef.scrollSpeed;
      // Fast enough to cover 1500m in a few hundred frames, and the side blocks are at 300m, 900m and 1010m.
      g.game.levelRef.scrollSpeed = 400;
      g.player.x = 0.5;
      g.player.screenY = 0.5;
      const arrived: string[] = [];
      for (let i = 0; i < 240; i++) {
        g.game.hazardsRef.hazards.length = 0;
        await raf();
        const a = g.game.diagnostics.level.arrivals;
        for (const side of ['left', 'right', 'bottom']) {
          if (a[side]! > 0 && !arrived.includes(side)) arrived.push(side);
        }
      }
      const arrivals = { ...g.game.diagnostics.level.arrivals };
      g.game.levelRef.scrollSpeed = real;
      return { arrivals, arrived };
    });

    console.log(`shipped level arrivals: ${JSON.stringify(run)}`);
    expect(run.arrivals['top'], 'the level still arrives from above, as it always did').toBeGreaterThan(0);
    /**
     * And from the sides and from behind.
     *
     * Three of the file's blocks are side or bottom entries -- a school from the left, a pair from below, and a crate
     * from the right -- so all three counters have to move. If a future edit deleted them, this is the case that
     * notices.
     */
    expect(run.arrivals['left'], 'the school from the left arrived').toBeGreaterThan(0);
    expect(run.arrivals['bottom'], 'something came up from below').toBeGreaterThan(0);
    expect(run.arrivals['right'], 'and a crate drifted in from the right').toBeGreaterThan(0);
  });
});
