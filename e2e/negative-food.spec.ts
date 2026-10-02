import { expect, test } from '@playwright/test';
import { boot, startFromMenu, waitForPhase } from './helpers';

/**
 * Negative food: edible, and it keeps acting once it is inside.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS CLASS EXISTS AT ALL
 * ---------------------------------------------------------------------------------------------
 * Without it, swallowing is a pure gain -- mass, plus ammunition -- so the player never has to ask whether a
 * thing is worth eating. These two creatures exist to make that a question, and they are deliberately two
 * DIFFERENT questions:
 *
 *   bomb fish   a decision with a DEADLINE. Four seconds, then it goes off inside you. Spit it back out and it is
 *               a grenade; compress it down and it is a race.
 *   urchin      a decision with a BILL. It does not explode, it bleeds you for as long as you are carrying it, and
 *               the way out that works for everything else -- compressing -- makes it worse, because digesting
 *               doubles the damage you take.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING TESTED
 * ---------------------------------------------------------------------------------------------
 *   1. An urchin hurts from inside, over time, and stops the moment it is gone.
 *   2. A bomb fish counts down from the moment it is swallowed and goes off: it costs a hit AND destroys the mass
 *      it was worth, without paying any eating rank for it.
 *   3. Its ammunition explodes -- one round shoves everything in a radius, not just what it hit.
 *   4. Below its tier it is an ordinary hazard, because the reversal is a two-sided judgement and these are not an
 *      exception to it.
 *
 * Every measurement happens inside ONE page evaluation with a `requestAnimationFrame` loop, because the game keeps
 * running between two round trips: a volume read before an action and one read after it are not the same bubble.
 *
 * The RATES are edited at runtime, which is the documented way to tune this config and the only sane way to test a
 * mechanism measured in seconds. Each test sets the value it is asserting against, so it keeps testing the
 * mechanism rather than a hardcoded number after the owner retunes the creature.
 */

test.describe('negative food', () => {
  test('an urchin bleeds the player from inside, and stops when it is gone', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            debugSetSteadyCruise: () => void;
            debugSwallowForTest: (kind: string) => number;
            stomachRef: { attemptSpit: () => { outcome: string } };
            diagnostics: { stomach: { internalHits: number } };
          };
        };
      }).__GB;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      g.game.debugSetSteadyCruise();
      // No digestion at all: the only thing allowed to move the volume in this test is the urchin.
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;
      /**
       * A fast drain, so the first hit lands inside a second rather than after three and a third.
       *
       * Set BEFORE swallowing on purpose: the effect is captured onto the item at that moment, so a value edited
       * afterwards would not be the value under test.
       */
      const perSecond = 4;
      g.mechRef.hazards.urchinDrainPerSecond = perSecond;
      // Big and healthy, so a few hits cannot end the run in the middle of the measurement.
      g.player.volume = 8;

      /**
       * Keep the water empty for the WHOLE measurement, not just at the start.
       *
       * The level's timeline keeps feeding collectables and hazards in at the top of the view, and over the several
       * seconds this runs they arrive: the first version of this test cleared the field once and then watched the
       * volume go UP by 1.0 while it was meant to be falling, because the player ate something. Isolating one
       * mechanism means keeping the rest of the world out of the window, every frame.
       */
      const quiet = (): void => {
        g.game.fieldRef.bubbles.length = 0;
        g.game.hazardsRef.hazards.length = 0;
      };
      const settle = async (frames: number): Promise<void> => {
        for (let i = 0; i < frames; i++) {
          quiet();
          await raf();
        }
      };

      const gained = g.game.debugSwallowForTest('urchin');
      const start = g.player.volume;

      let guard = 0;
      while (g.game.diagnostics.stomach.internalHits < 1 && guard++ < 1800) {
        quiet();
        await raf();
      }
      const first = { volume: g.player.volume, hits: g.game.diagnostics.stomach.internalHits };

      // Keep going, then take it out and confirm the bleeding stops.
      await settle(120);
      const bleeding = { volume: g.player.volume, hits: g.game.diagnostics.stomach.internalHits };
      // Taken out through the real spit path, so "it stops when it is gone" is a claim about the game rather than
      // about a test hook that removes things.
      g.game.stomachRef.attemptSpit();
      const whenEmptied = g.player.volume;
      await settle(120);

      return { gained, start, perSecond, first, bleeding, whenEmptied, settled: { volume: g.player.volume, hits: g.game.diagnostics.stomach.internalHits } };
    });

    console.log(
      `urchin: ${r.perSecond}/s -> first hit took volume ${r.start.toFixed(2)} -> ${r.first.volume.toFixed(2)}; ` +
        `${r.settled.hits} hits total, settled at ${r.settled.volume.toFixed(2)}`,
    );

    expect(r.gained, 'an urchin must be worth something, or eating one is never a decision').toBeGreaterThan(0);
    expect(r.first.hits, 'it must cost a hit point while it is inside').toBeGreaterThanOrEqual(1);
    expect(r.first.volume, 'and that hit must show up as volume lost').toBeLessThan(r.start);

    /**
     * The bleeding is CONTINUOUS, not a one-off on swallowing.
     *
     * Asserted as "more hits later than earlier", which is what separates an internal drain from the contact damage
     * the urchin does on the way in -- a single hit at swallow time would satisfy every other assertion here.
     */
    expect(r.bleeding.hits, 'it must keep hurting, not just once on the way in').toBeGreaterThan(r.first.hits);
    expect(r.bleeding.volume, 'and keep costing volume').toBeLessThan(r.first.volume);

    /**
     * And it is the ITEM that is doing it.
     *
     * Removing it must stop the damage completely: a claim about an internal effect that kept ticking after the
     * thing was thrown up would be a claim about a bug.
     */
    expect(r.settled.hits, 'once it is out of the stomach, nothing more is taken').toBe(r.bleeding.hits);
    expect(r.settled.volume, 'and the volume stops falling').toBeCloseTo(r.whenEmptied, 5);
  });

  test('a bomb fish counts down and goes off inside, costing the hit AND the mass', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          tuning: { hitPointVolume: number };
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            debugSetSteadyCruise: () => void;
            debugSetTalent: (id: string) => string;
            debugSwallowForTest: (kind: string) => number;
            diagnostics: {
              stomach: { contents: { kind: string; fuse: number }[]; internalHits: number; destroyed: number };
              digest: { energy: number };
            };
          };
        };
      }).__GB;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      g.game.debugSetSteadyCruise();
      /**
       * Pin a talent that does not discount damage.
       *
       * The run's talent is ROLLED, and the silt one ignores part of every hit -- so without this the exact cost of
       * the detonation depends on a dice roll, and the measurement below would pass or fail for a reason that has
       * nothing to do with bomb fish. That is what this hook is for; it is called out in the helpers.
       */
      g.game.debugSetTalent('soda');
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;
      // A distinctive, short fuse, so "the countdown starts at swallow and uses the config" is measurable in a
      // second rather than in four. Set before swallowing; the item captures it.
      const configured = 0.7;
      g.mechRef.hazards.bombfishFuseSeconds = configured;
      g.player.volume = 8;

      const gained = g.game.debugSwallowForTest('bombfish');
      const start = g.player.volume;
      const fuseAtSwallow = g.game.diagnostics.stomach.contents[0]?.fuse ?? -1;
      const energyBefore = g.game.diagnostics.digest.energy;

      /**
       * The water is kept empty for the whole countdown.
       *
       * Otherwise the timeline feeds a collectable in while the fuse burns, the player eats it, and the assertion
       * "the bubble lost exactly the mass the bomb was worth" fails for a reason that has nothing to do with bombs.
       */
      let guard = 0;
      while (g.game.diagnostics.stomach.contents.length > 0 && guard++ < 1800) {
        g.game.fieldRef.bubbles.length = 0;
        g.game.hazardsRef.hazards.length = 0;
        await raf();
      }

      return {
        gained,
        start,
        fuseAtSwallow,
        configured,
        energyBefore,
        hitPointVolume: g.tuning.hitPointVolume,
        volume: g.player.volume,
        hits: g.game.diagnostics.stomach.internalHits,
        destroyed: g.game.diagnostics.stomach.destroyed,
        energyAfter: g.game.diagnostics.digest.energy,
        remaining: g.game.diagnostics.stomach.contents.length,
      };
    });

    console.log(
      `bomb fish: fuse ${r.fuseAtSwallow.toFixed(2)}s of ${r.configured}s; volume ${r.start.toFixed(2)} -> ${r.volume.toFixed(2)}, ` +
        `${r.hits} hit(s), ${r.destroyed.toFixed(3)} destroyed, energy ${r.energyAfter.toFixed(3)}`,
    );

    expect(r.fuseAtSwallow, 'the fuse runs from the moment it is swallowed, at the configured length').toBeCloseTo(r.configured, 2);
    expect(r.remaining, 'it must eventually go off rather than staying inside forever').toBe(0);
    expect(r.hits, 'the detonation must cost a hit point').toBeGreaterThanOrEqual(1);

    /**
     * The mass it was worth goes with it, and buys NO rank.
     *
     * This is what separates a bomb fish from a slow-digesting snack: `destroyed` is volume that left the bubble
     * without paying. The energy check is the other half of the same claim -- if a detonation credited growth
     * energy, a player could use bombs to convert food into eating rank for free, which is exactly backwards.
     */
    expect(r.destroyed, 'the blast destroys what was left of it').toBeCloseTo(r.gained, 4);
    /**
     * And the bubble pays BOTH costs: the mass it was worth, and the hit point the blast cost.
     *
     * Written out as two terms rather than as "less than it was", because the second one is easy to forget when
     * reading the code and is exactly what a player will feel -- the first version of this assertion left it out
     * and read as a failure of the mechanic.
     */
    expect(r.volume, 'the bubble loses the destroyed mass AND the hit point').toBeCloseTo(
      r.start - r.gained - r.hitPointVolume,
      4,
    );
    expect(r.energyAfter, 'and blown-up mass pays no eating rank at all').toBeCloseTo(r.energyBefore, 6);
  });

  test('a thrown bomb fish explodes, shoving everything in its blast and not just what it hit', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { x: number; y: number; volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: { kind: string; x: number; y: number }[] };
            camera: { viewport: { laneWidthMeters: number } };
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            debugSwallowForTest: (kind: string) => number;
            debugSpawnHazardOnPlayer: (kind: string) => void;
            diagnostics: { spit: { hits: number } };
          };
        };
      }).__GB;
      const lane = g.game.camera.viewport.laneWidthMeters;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      /**
       * Freeze the digestion and the fuse, so the ONLY thing this measures is the round in flight.
       *
       * The fuse matters: left at four seconds it could go off inside during the flight and the test would be
       * measuring a detonation in the stomach rather than a grenade on impact.
       */
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;
      g.mechRef.hazards.bombfishFuseSeconds = 600;
      g.player.volume = 20;

      g.game.debugSwallowForTest('bombfish');

      /**
       * A cluster of targets, spawned and moved IN THE SAME FRAME.
       *
       * `debugSpawnHazardOnPlayer` produces armed crabs whose telegraph is already spent, so they fire on first
       * contact and remove themselves; positioning them before the frame advances keeps them alive. Crabs are the
       * right target because they are otherwise inert -- a fish swims at the player, which makes a ballistic
       * measurement impossible.
       *
       * Two are close together, along the shot's path, and one is far out to the side: if the blast did nothing,
       * only the one the round actually touches would move.
       */
      const targets: { kind: string; x: number; y: number }[] = [];
      for (let i = 0; i < 3; i++) {
        g.game.debugSpawnHazardOnPlayer('crab');
        const t = g.game.hazardsRef.hazards[g.game.hazardsRef.hazards.length - 1];
        if (!t) return null;
        t.x = g.player.x * lane + (i === 2 ? lane * 0.45 : i * lane * 0.03);
        t.y = g.player.y + lane * 0.45;
        targets.push(t);
      }

      const b = g.game.touchRef.spitGeometry;
      const hitsBefore = g.game.diagnostics.spit.hits;
      g.game.handlePointerDown(95, b.x, b.y);
      g.game.handlePointerUp(95);

      const before = targets.map((t) => ({ x: t.x, y: t.y }));
      let guard = 0;
      while (g.game.diagnostics.spit.hits === hitsBefore && guard++ < 600) await raf();
      await raf();

      return {
        blastRadius: g.mechRef.hazards.bombfishBlastRadiusRatio!,
        moved: targets.map((t, i) => Math.hypot(t.x - before[i]!.x, t.y - before[i]!.y)),
      };
    });

    expect(r, 'the cluster must be spawnable').not.toBeNull();
    console.log(`blast: radius ${r!.blastRadius} of a lane, shoves ${r!.moved.map((m) => m.toFixed(1)).join(' / ')} m`);

    expect(r!.moved[0], 'the round must shove what it hits').toBeGreaterThan(1);
    expect(r!.moved[1], 'and also the neighbour inside the blast, which is the whole point of a grenade').toBeGreaterThan(1);
    /**
     * And it is a BLAST, not a wider hit box.
     *
     * Compared against the target the round actually touched rather than against zero, because every hazard drifts
     * on its own: a crab falls a metre or two during the flight whatever happens to it, so "did it move at all" is
     * not answerable. "Moved a tiny fraction of what the neighbours moved" is.
     *
     * Without this, a projectile with a large hitbox would satisfy the two assertions above while the "explosion"
     * was really just a bigger bullet.
     */
    expect(r!.moved[2], 'but nothing outside the blast radius may be shoved').toBeLessThan(r!.moved[0]! / 5);
  });

  test('below its tier it is an ordinary hazard, and at its tier the same creature is food', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: {
            consumption: { tierVolume: number[]; edibleAtTier: Record<string, number> };
            digest: Record<string, number>;
          };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[]; eaten: number };
            stomachRef: { reset: () => void };
            debugSpawnHazardOnPlayer: (kind: string) => void;
            diagnostics: { stats: { hits: number }; spit: { contents: string[] }; invulnerable: number };
          };
        };
      }).__GB;
      g.mechRef.digest.passivePerSecond = 0;
      g.mechRef.digest.compressPerSecond = 0;

      /** One contact, at a pinned volume, read in the same evaluation so nothing can drift in between. */
      const contact = async (kind: string, volume: number) => {
        g.game.fieldRef.bubbles.length = 0;
        g.game.hazardsRef.hazards.length = 0;
        g.game.stomachRef.reset();
        g.player.volume = volume;
        /**
         * Wait out the invulnerability from the PREVIOUS contact.
         *
         * Eating grants a brief one by design, and the damage path is skipped while it lasts -- so without this the
         * second contact would report "no damage" and the test would blame the creature for a rule that is working.
         */
        let guard = 0;
        while (g.game.diagnostics.invulnerable > 0 && guard++ < 600) await raf();

        const hitsBefore = g.game.diagnostics.stats.hits;
        const eatenBefore = g.game.hazardsRef.eaten;
        g.game.debugSpawnHazardOnPlayer(kind);
        await raf();
        await raf();
        return {
          hurt: g.game.diagnostics.stats.hits > hitsBefore,
          eaten: g.game.hazardsRef.eaten > eatenBefore,
          inside: g.game.diagnostics.spit.contents.includes(kind),
        };
      };

      const out: Record<string, { hurt: boolean; eaten: boolean; inside: boolean }> = {};
      for (const kind of ['urchin', 'bombfish', 'eel', 'rot', 'oil']) {
        const tier = g.mechRef.consumption.edibleAtTier[kind]!;
        /**
         * Just below the tier and comfortably at it.
         *
         * Floored at 1 for the lower one: a bubble below the death threshold would pop on the contact and end the
         * run, and the rest of the measurement would be taken on a game that had stopped.
         */
        const below = Math.max(1, (g.mechRef.consumption.tierVolume[tier - 2] ?? 0) + 0.05);
        const at = (g.mechRef.consumption.tierVolume[tier - 1] ?? 1) + 0.3;
        out[`${kind}@below`] = await contact(kind, below);
        out[`${kind}@at`] = await contact(kind, at);
      }
      return out;
    });

    for (const kind of ['urchin', 'bombfish', 'eel', 'rot', 'oil']) {
      const below = r[`${kind}@below`]!;
      const at = r[`${kind}@at`]!;
      // Below the tier: the ordinary hazard path, exactly like a fish.
      expect(below.eaten, `${kind} below its tier must not be eaten`).toBe(false);
      expect(below.hurt, `${kind} below its tier must hurt, like every other hazard`).toBe(true);
      // At the tier: the reversal, with the side effect attached.
      expect(at.eaten, `${kind} at its tier must be eaten rather than hurting`).toBe(true);
      expect(at.inside, `and it must end up in the stomach, where its side effect can act`).toBe(true);
    }
  });

  test('an eel takes the controls away, and gives them back', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { x: number; vx: number; volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            debugSwallowForTest: (kind: string) => number;
            diagnostics: { misfire: { remaining: number; inverted: boolean } };
          };
        };
      }).__GB;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      g.mechRef.digest.passivePerSecond = 0;
      /**
       * A shock that is both frequent and long enough to catch in a sampled loop.
       *
       * Set before swallowing, because the item captures the effect at that moment. Half the time inverted, half
       * not, so BOTH states are observable inside one window -- a test that only ever saw the inverted state could
       * not tell "the controls break" from "the controls are broken forever".
       */
      g.mechRef.hazards.eelShockPeriodSeconds = 1.0;
      g.mechRef.hazards.eelShockSeconds = 0.5;
      g.player.volume = 8;
      g.game.debugSwallowForTest('eel');

      /**
       * Hold RIGHT for the whole run, through the real keyboard path.
       *
       * Dispatched as a real key event because `Input.update` recomputes the axes from the held-key set every step,
       * so writing `axisX` directly would be overwritten and would not be testing the input path at all.
       */
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
      await raf();

      let sawInverted = false;
      let sawObeying = false;
      let invertedSign = 0;
      let obeyingSign = 0;
      let shockFired = false;
      for (let i = 0; i < 60; i++) {
        await raf();
        const d = g.game.diagnostics.misfire;
        if (d.inverted) {
          shockFired = true;
          sawInverted = true;
          invertedSign = Math.sign(g.player.vx);
        } else if (shockFired) {
          // Only counted AFTER the first shock, so "obeying" is the controls coming back rather than the calm
          // before anything happened.
          sawObeying = true;
          obeyingSign = Math.sign(g.player.vx);
        }
      }
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
      for (let i = 0; i < 90; i++) await raf();
      const after = g.game.diagnostics.misfire;

      return { sawInverted, sawObeying, invertedSign, obeyingSign, after };
    });

    console.log(
      `eel: inverted ${r.sawInverted} (vx sign ${r.invertedSign}), obeyed again ${r.sawObeying} (sign ${r.obeyingSign}), ` +
        `remaining after ${r.after.remaining.toFixed(2)}s`,
    );

    expect(r.sawInverted, 'the eel must actually take the controls away').toBe(true);
    /**
     * Held RIGHT, so obeying means a POSITIVE vx and being shocked means a NEGATIVE one.
     *
     * The sign is the whole assertion: "the bubble moved" would pass for a bubble that ignored the input entirely,
     * and "the axis was inverted" is exactly a reversal of where the same held key sends it.
     */
    expect(r.obeyingSign, 'while obeying, holding right must move the bubble right').toBe(1);
    expect(r.invertedSign, 'and while shocked, the same held key must send it LEFT').toBe(-1);
    expect(r.sawObeying, 'and the controls must come BACK -- otherwise this is a bug, not a shock').toBe(true);
    expect(r.after.remaining, 'and the state must expire once the eel is gone').toBe(0);
  });

  test('rot makes the exits slower: digestion crawls while it is inside, and recovers when it is out', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            debugSwallowForTest: (kind: string) => number;
            diagnostics: { gameSeconds: number; stomach: { digestScale: number }; digest: { progress: number }; spit: { contents: string[] } };
            stomachRef: { attemptSpit: () => { outcome: string } };
          };
        };
      }).__GB;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      /**
       * A fast, round digest rate (1.0 per second) so a short window measures a large, unambiguous fraction.
       *
       * Passive rather than compressed: the compress control costs suction and double damage, and neither has
       * anything to do with what is being measured here.
       */
      const rate = 1;
      const rotScale = 0.25;
      g.mechRef.digest.passivePerSecond = rate;
      g.mechRef.digest.compressPerSecond = rate;
      g.mechRef.hazards.rotDigestScale = rotScale;
      g.player.volume = 8;

      /**
       * Measured as PROGRESS PER SECOND OF GAME TIME, and measured UNTIL A TARGET rather than for a fixed number
       * of frames.
       *
       * Two traps that the first version of this test fell into. Frame counts are not comparable -- the game steps
       * a fixed 120Hz internally while the browser under test runs at whatever rate it manages -- so `gameSeconds`
       * is the clock the mechanic itself uses. And a fixed WINDOW is not comparable either: the same window that
       * reads 0.4 of an item at the slowed rate finishes the item outright at the full rate, after which the
       * progress reading is a flatline and the measured rate is zero. Stopping at a target keeps the item alive in
       * both halves.
       */
      const measureTo = async (target: number): Promise<{ rate: number; progress: number; soaked: boolean }> => {
        const p0 = g.game.diagnostics.digest.progress;
        const t0 = g.game.diagnostics.gameSeconds;
        let guard = 0;
        while (g.game.diagnostics.digest.progress < target && guard++ < 900) await raf();
        const p1 = g.game.diagnostics.digest.progress;
        const t1 = g.game.diagnostics.gameSeconds;
        return { rate: (p1 - p0) / Math.max(1e-6, t1 - t0), progress: p1, soaked: guard >= 900 };
      };

      // The rot first, so it is the item at the front of the queue and the one being digested.
      g.game.debugSwallowForTest('rot');
      g.game.debugSwallowForTest('fish');
      const scaleWithRot = g.game.diagnostics.stomach.digestScale;
      const slowed = await measureTo(0.4);

      // Take the rot out through the real spit path; the fish behind it is now what gets digested.
      const spit = g.game.stomachRef.attemptSpit();
      const scaleWithout = g.game.diagnostics.stomach.digestScale;
      const normal = await measureTo(0.4);

      return {
        rate,
        rotScale,
        scaleWithRot,
        scaleWithout,
        slowed,
        normal,
        spit: spit.outcome,
        contents: g.game.diagnostics.spit.contents,
      };
    });

    console.log(
      `rot: scale ${r.scaleWithRot} -> ${r.scaleWithout}; digest ${r.slowed.rate.toFixed(3)}/s slowed, ${r.normal.rate.toFixed(3)}/s normal (configured ${r.rate}/s), ` +
        `progress ${r.slowed.progress.toFixed(2)} / ${r.normal.progress.toFixed(2)}`,
    );

    expect(r.slowed.soaked, 'the slowed half must reach its target rather than timing out').toBe(false);
    expect(r.normal.soaked, 'and so must the normal half').toBe(false);
    expect(r.contents, 'the fish must still be in the stomach for the second measurement').toEqual(['fish']);
    expect(r.spit, 'the rot must be spittable -- that is the answer to it').toBe('fired');
    expect(r.scaleWithRot, 'the rot must report the scale it is applying').toBeCloseTo(r.rotScale, 6);
    expect(r.scaleWithout, 'and stop applying it once it is gone').toBe(1);

    /**
     * The measurement, not the multiplier: the rate must actually BE the configured rate times the scale.
     *
     * The tolerance is loose because this is a sampled average of a real-time simulation, but it is far tighter
     * than the gap between "1.0" and "0.25" -- so it distinguishes the mechanic from a no-op and from a full stop.
     */
    expect(r.slowed.rate, 'digestion must actually crawl while the rot is inside').toBeCloseTo(r.rate * r.rotScale, 1);
    expect(r.normal.rate, 'and recover once it is out').toBeCloseTo(r.rate, 1);
  });

  test('oil clogs the exit: the spit refuses, and says so, until it lets go', async ({ page }) => {
    await boot(page);
    await startFromMenu(page);
    await waitForPhase(page, 'playing');

    const r = await page.evaluate(async () => {
      const raf = (): Promise<void> => new Promise<void>((res) => requestAnimationFrame(() => res()));
      const g = (window as unknown as {
        __GB: {
          mechRef: { hazards: Record<string, number>; digest: Record<string, number> };
          player: { volume: number };
          game: {
            fieldRef: { bubbles: unknown[] };
            hazardsRef: { hazards: unknown[] };
            debugSwallowForTest: (kind: string) => number;
            touchRef: { spitGeometry: { x: number; y: number } };
            handlePointerDown: (id: number, x: number, y: number) => void;
            handlePointerUp: (id: number) => void;
            diagnostics: { spit: { contents: string[]; inFlight: number }; stomach: { clogs: number } };
            stomachRef: { reset: () => void };
          };
        };
      }).__GB;
      g.game.fieldRef.bubbles.length = 0;
      g.game.hazardsRef.hazards.length = 0;
      g.mechRef.digest.passivePerSecond = 0;
      g.player.volume = 8;

      /**
       * One press of the real spit button.
       *
       * Reports whether a round was in the air ONE frame after the press, because the projectile is gone within a
       * second or so: it leaves the level's band long before it slows down, so sampling it after the cooldown wait
       * below reads zero even for a shot that worked. The wait is only there so the next press is not swallowed by
       * the refusal cooldown.
       */
      const press = async (): Promise<number> => {
        const b = g.game.touchRef.spitGeometry;
        g.game.handlePointerDown(96, b.x, b.y);
        g.game.handlePointerUp(96);
        await raf();
        const inFlight = g.game.diagnostics.spit.inFlight;
        await raf();
        for (let i = 0; i < 20; i++) await raf();
        return inFlight;
      };

      /**
       * A clogged oil first, then a willing one -- TWO creatures rather than one, and that is not a workaround.
       *
       * A creature's properties are captured when it is SWALLOWED (`StomachEffect` is stored on the item, so the
       * eel's period and the bomb's fuse cannot change under a countdown that is already running). Changing
       * `oilSpitChance` therefore cannot loosen an oil that is already inside -- which is the honest semantic, and
       * the reason this test needs a second slick to show that the chance is what governs.
       */
      g.mechRef.hazards.oilSpitChance = 0;
      g.game.debugSwallowForTest('oil');
      const cloggedInFlight = await press();
      const clogged = {
        contents: g.game.diagnostics.spit.contents.slice(),
        clogs: g.game.diagnostics.stomach.clogs,
        inFlight: cloggedInFlight,
      };

      // The same press with a slick that is willing to let go.
      g.game.stomachRef.reset();
      g.mechRef.hazards.oilSpitChance = 1;
      g.game.debugSwallowForTest('oil');
      const firedInFlight = await press();

      return {
        clogged,
        after: {
          contents: g.game.diagnostics.spit.contents.slice(),
          clogs: g.game.diagnostics.stomach.clogs,
          inFlight: firedInFlight,
        },
      };
    });

    console.log(
      `oil: clogged -> contents ${r.clogged.contents.join(',')} clogs ${r.clogged.clogs} inFlight ${r.clogged.inFlight}; ` +
        `then contents ${r.after.contents.join(',') || '(empty)'} clogs ${r.after.clogs} inFlight ${r.after.inFlight}`,
    );

    /**
     * A refusal is not an empty stomach.
     *
     * The item must STAY, nothing may be launched, and the refusal must be counted -- because the count is the only
     * trace a refusal leaves, and without the distinct cue the player would conclude the button is broken rather
     * than that the oil is stuck.
     */
    expect(r.clogged.contents, 'a clogged item must stay in the stomach').toEqual(['oil']);
    expect(r.clogged.inFlight, 'and nothing may be launched').toBe(0);
    expect(r.clogged.clogs, 'and the refusal must be counted').toBe(1);

    // And it is a CHANCE, not a wall: the same press gets it out once it is willing.
    expect(r.after.contents, 'with the oil willing to let go, it must leave').toEqual([]);
    expect(r.after.inFlight, 'and be in the air').toBe(1);
    expect(r.after.clogs, 'with no further refusals').toBe(1);
  });
});
