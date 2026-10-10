import type { GameSnapshot } from './snapshot';
import { audio } from './audio';
import { bubbleLook } from './bubbleLook';
import { BUBBLE_TYPES, hasControl } from './bubbleTypes';
import { CODEX_CATEGORIES, codexEntries, entriesFor } from './codex';
import { KIND_TUNING, type HazardKind } from './hazards';
import type { LateralAuthority } from './lateral';
import { LEVEL, TIMELINE, currentSpawnBlocks, secondsPerScreenSeries } from './levels';
import { mech } from './mechanisms';
import { rageFraction, rageStageName } from './rage';
import { SKILLS } from './skills';
import { stageName, stageRadiusFraction, type StageAppearance } from './stages';
import { suctionRadiusFraction } from './suction';
import { TALENTS } from './talents';
import { buildLabel, GIT_DIRTY, GIT_HASH, APP_VERSION } from './version';
import { hitsSurvived } from './volume';

/**
 * What one frame of the game looks like from outside it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE THIS CAME FROM, AND WHY IT MOVED
 * ---------------------------------------------------------------------------------------------
 * This was a six-hundred-line getter on `Game`, and it is the contract the browser probes read: the suite asks questions
 * like "how much did the bubble grow" and "where did the timeline put that fish" by reading this object rather than the
 * screen. Being a getter on the game meant a report could only be produced BY a game, which is why a probe needs a
 * canvas to ask anything at all.
 *
 * It is a function of a `GameSnapshot` now. Nothing about what it returns changed: the same keys, the same rounding,
 * the same numbers, in the same order -- and the return type below is the one that was on the getter, moved rather than
 * rewritten, because that type IS the contract.
 */
export function diagnosticsOf(g: GameSnapshot): {
    /**
     * The build this page is running.
     *
     * Reported here as well as drawn on the menu and in the debug readout, so a probe can assert that what is on
     * screen is what was compiled in -- rather than reading the version module, which would pass while the drawing
     * showed nothing.
     */
    build: { version: string; hash: string; dirty: boolean; label: string };
    /**
     * The codex page: whether it is open, and what it is showing.
     *
     * `entries` is the count PER CATEGORY as the game's own data reports it, which is what a probe needs to assert
     * that every creature, skill and talent has somewhere to be read about.
     */
    codex: {
      open: boolean;
      category: string;
      page: number;
      pages: number;
      total: number;
      visible: readonly string[];
      entries: Record<string, number>;
      /** Every entry id the page has, so a probe can check coverage against the game's own lists below. */
      entryIds: readonly string[];
      /**
       * What the GAME actually has, from the modules that define it.
       *
       * Read from `KIND_TUNING`, `SKILLS` and `TALENTS` rather than from the codex, which is the whole point: a
       * creature added to the game but not to the codex shows up as a difference between these and `entryIds`, and
       * that is a failing test rather than a page nobody notices is out of date.
       */
      gameHazards: readonly string[];
      gameSkills: readonly string[];
      gameTalents: readonly string[];
      /** The bubble types the game offers, so the codex's coverage of them is checkable. */
      gameBubbleTypes: readonly string[];
    };
    frames: number;
    elapsed: number;
    intro: number;
    lastDelta: number;
    nominalSeconds: number;
    level: {
      id: string;
      name: string;
      scrollLength: number;
      scrollSpeed: number;
      scrolled: number;
      entriesEmitted: number;
      entriesTotal: number;
      /** Blocks in the level file, against the entries they expanded to. */
      blocks: number;
      /** Arrivals this run, counted by the edge they came from. */
      arrivals: { top: number; left: number; right: number; bottom: number };
      /** Whether the timeline in use came from a spec rather than from the level file. */
      installed: boolean;
      /** The ladder, in file order, with the save's state against each one. */
      ladder: { id: string; name: string; locked: boolean; selected: boolean }[];
      /** The save: which levels are cleared, and which is selected. */
      cleared: string[];
      selected: string;
      secondsPerScreen: number[];
    };
    playerVx: number;
    playerVy: number;
    bannerAlpha: number;
    bannerSeen: boolean;
    lateral: LateralAuthority;
    laneWidthMeters: number;
    visibleDepthMeters: number;
    gameSeconds: number;
    hazards: {
      active: number;
      /** How many are leaving because the gun finished them, rather than being eaten or having drifted off. */
      leaving: number;
      /** Lunges committed this run, monotonic: a charge is over in under a second. */
      charges: number;
      byKind: Record<string, number>;
      comedyBeats: number;
      lastBeat: { what: HazardKind; at: number } | null;
      grabs: number;
      baits: number;
      /** Hazards eaten this run: the food-chain reversal. */
      eaten: number;
      /** Creatures driven off by the gun, and hits that landed without finishing one. */
      fled: number;
      damaged: number;
    };
    slow: { remaining: number; factor: number; impulseVy: number };
    /** The suction field: whether it is held, how far it reaches, and what it costs in speed. */
    suction: { held: boolean; radiusFraction: number; moveFactor: number };
    /**
     * The obstacles: crates to smash and coral to squeeze past.
     *
     * `rows` is the authored structure, not the live one, so a test can assert the passability guarantee against
     * the level rather than against whatever happens to be on screen.
     */
    obstacles: {
      active: number;
      byKind: Record<string, number>;
      broken: number;
      ramThreshold: number;
      minGap: number;
    };
    /**
     * The gun: the small bubbles fired on their own.
     *
     * `armed` is here because "nothing is happening" has two very different causes -- the type has no gun, or it has
     * one and has not fired yet -- and a probe that could not tell them apart would report a broken weapon whenever
     * it looked a frame too early.
     */
    /**
     * The enemies' fire, so a probe can tell "nothing is shooting" from "the rounds are all gone".
     */
    enemyBullets: { inFlight: number; fired: number; hits: number };
    bullets: {
      inFlight: number;
      fired: number;
      hits: number;
      armed: boolean;
    };
    /**
     * Lost control, from an electric eel.
     *
     * Reported as its own top-level fact rather than under `stomach`, because what it describes is a property of
     * the PLAYER: the steering is inverted right now, whatever the reason was.
     */
    misfire: { remaining: number; inverted: boolean };
    trashDrain: number;
    maxGripSeconds: number;
    talent: {
      id: string;
      name: string;
      ascentMultiplier: number;
      steerMultiplier: number;
      startVolume: number;
      shrinkResistance: number;
    };
    skill: { id: string; uses: number } | null;
    skillActivations: number;
    farts: number;
    emergence: {
      fishSplits: number;
      bubblesEatenByFish: number;
      fishCount: number;
      perceptionRadiusMeters: number;
    };
    events: { seen: number; fired: number[]; last: { label: string; at: number } | null };
    audio: { muted: boolean; running: boolean };
    ending: { surfaced: boolean; splash: number; bestClimbed: number; bestVolume: number; bestScore: number };
    /**
     * The score: the total, and what earned it.
     *
     * The ledger is reported because the total cannot say which act paid, and "the surface bonus landed" is a
     * question about one event rather than about the sum. Counts rather than points: the points are derivable from
     * the config, and reporting them would be reporting the config a second time.
     */
    score: { value: number; best: number; byEvent: Record<string, number>; popups: number };
    /**
     * The mutation ladder: the bar, the picks, and what paid them.
     *
     * `pending` above zero is what opens the freeze; `grazes` is the hazard field's own monotonic count,
     * reported beside the ledger so the two can be checked against each other.
     */
    mutation: {
      value: number;
      need: number;
      level: number;
      pending: number;
      grazes: number;
      ledger: Record<string, number>;
    };
    /** Damage numbers in flight. Separate from `score.popups` because the two styles share one field. */
    damagePopups: number;
    activeSkill: { id: string; remaining: number } | null;
    stage: {
      stage: number;
      name: string;
      absorbedInStage: number;
      neededForNext: number | null;
      /** False for a type that does not grow from absorbing: it has no next stage to count toward. */
      grows: boolean;
      speedMultiplier: number;
      appearance: StageAppearance;
      radiusFraction: number;
    };
    /** Which bubble the run is, and therefore which controls and palette are live. */
    bubbleType: {
      id: string;
      name: string;
      controls: string[];
      hasSpit: boolean;
      hasCompress: boolean;
      hasCharge: boolean;
      /** Whether it can swallow a creature at all. False means contact is damage, never a meal. */
      swallowsHazards: boolean;
      /** Hits this type survives at any size, or null when hit points are the bubble's volume. */
      hitsToPop: number | null;
    };
    /** The volatile bubble's resource. Always present; always zero for the devour bubble. */
    rage: {
      value: number;
      fraction: number;
      safeSeconds: number;
      charging: boolean;
      aiming: { x: number; y: number };
      stageName: string;
      slamSeconds: number;
      onSlam: boolean;
      slams: number;
      /** The burst: how many have fired, and what the last one did. */
      bursts: number;
      burstRadiusMeters: number;
      waveAlive: boolean;
      lastBurstKills: number;
      lastBurstPushes: number;
      /** Overload: full gauge, on the clock. `left` is what the HUD counts down. */
      overloaded: boolean;
      overloadLeft: number;
    };
    phase: string;
    volume: number;
    hitsSurvived: number;
    invulnerable: number;
    bubbles: number;
    lastEaten: number;
    stats: { absorbed: number; hits: number; maxVolume: number; ended: number; newRecord: boolean };
    report: { fps: number; lastDeltaMs: number; frames: number; bubbles: number; specks: number; hazards: number };
  } {
    return {
      build: { version: APP_VERSION, hash: GIT_HASH, dirty: GIT_DIRTY, label: buildLabel() },
      codex: {
        open: g.phase === 'codex',
        category: g.codex.state.category,
        page: g.codex.state.page,
        pages: g.codex.state.pages,
        total: g.codex.state.total,
        visible: g.codex.state.visible,
        entries: Object.fromEntries(CODEX_CATEGORIES.map((c) => [c.id, entriesFor(c.id).length])),
        entryIds: codexEntries().map((e) => e.id),
        gameHazards: Object.keys(KIND_TUNING),
        gameSkills: SKILLS.map((s) => s.id),
        gameTalents: TALENTS.map((t) => t.id),
        /**
         * The bubble types, so the codex's coverage can be checked the same way the creatures' is.
         *
         * From `BUBBLE_TYPES` -- the list the main menu itself is built from -- rather than from the codex, which is
         * the whole point: a third type added to the game but not to the codex shows up as a difference between this
         * and `entryIds`, and that is a failing test rather than a page nobody notices is out of date.
         */
        gameBubbleTypes: BUBBLE_TYPES.map((t) => t.id),
      },
      frames: g.frameCount,
      elapsed: g.elapsed,
      intro: g.phaseTimer,
      lastDelta: g.lastDelta,
      nominalSeconds: g.nominalSeconds,
      /**
       * The level's own declared properties, so a probe can reason about pacing without hardcoding
       * a depth or a duration. A run length is an OUTPUT of these, not a target.
       */
      level: {
        id: LEVEL.id,
        name: LEVEL.name,
        scrollLength: LEVEL.scrollLength,
        scrollSpeed: LEVEL.scrollSpeed,
        /** How far the level has scrolled, and so how far through it the camera is. */
        scrolled: +g.scrolled.toFixed(2),
        /** Entries emitted so far, and the total, so progress through the TIMELINE is observable. */
        entriesEmitted: g.timelineEmitted,
        entriesTotal: TIMELINE.length,
        /**
         * How many BLOCKS the level file holds, next to how many entries they expanded to.
         *
         * Both numbers, because they answer different questions and a test needs both: `entriesTotal` is what the
         * level contains, `blocks` is what the file says. The pair is what makes "the file drives the level"
         * checkable from outside -- change a block's `count` and one number moves while the other does not.
         */
        blocks: currentSpawnBlocks().length,
        /** Arrivals this run, counted by the edge they came from. */
        arrivals: { ...g.spawnedBySide },
        /** Whether the timeline in use is the level FILE's or one a spec installed. */
        installed: TIMELINE !== LEVEL.entries,
        /** The ladder, in file order, with the save's state against each one. */
        ladder: g.progress.entries(),
        /** The save itself, so a test can assert what was written rather than only what is drawn. */
        cleared: [...g.progress.cleared],
        selected: g.progress.selected,
        /**
         * Seconds per screenful, in order from the seabed up.
         *
         * Reported as a SERIES, not an average. A mean of a curve describes no part of the actual
         * experience and was actively misleading when it was used as the readout for "how fast does this
         * look". With a constant scroll speed the series is flat, and it will stop being flat the moment
         * a level varies its pace.
         */
        secondsPerScreen: secondsPerScreenSeries(LEVEL).map((v) => +v.toFixed(1)),
      },
      /** The player's own motion. Vertical and horizontal are symmetric now. */
      playerVx: +g.player.vx.toFixed(4),
      playerVy: +g.player.vy.toFixed(2),
      bannerAlpha: g.finishBanner.alpha,
      bannerSeen: g.bannerSeen,
      lateral: g.lateral,
      laneWidthMeters: g.camera.viewport.laneWidthMeters,
      visibleDepthMeters: g.camera.viewport.visibleDepthMeters,
      /**
       * Accumulated GAME time in seconds, which is not wall-clock time below 20fps.
       *
       * A frame is capped at 50ms of simulated time, so a browser under load runs the game slower
       * than real time. Any probe that measures a duration the game itself produces -- an
       * acceleration ramp, a cooldown, an animation -- must use this clock, not `performance.now()`,
       * or it will report the frame rate instead of the game.
       */
      gameSeconds: g.elapsed,
      /**
       * Hazard readout. The comedy beats are counted rather than merely triggered because the design
       * treats them as content: a hazard that never produces its reaction is a hazard that has not
       * been finished, and a probe can check they actually happen in a run.
       */
      hazards: {
        active: g.hazards.hazards.length,
        /** How many are on their way out because the gun finished them: `fleeing`, not dead. */
        leaving: g.hazards.hazards.filter((h) => h.flee).length,
        charges: g.hazards.charges,
        byKind: g.hazards.hazards.reduce<Record<string, number>>((acc, h) => {
          acc[h.kind] = (acc[h.kind] ?? 0) + 1;
          return acc;
        }, {}),
        comedyBeats: g.comedyBeats,
        lastBeat: g.lastComedyBeat,
        /** Monotonic counters, for transient things a boolean sample would miss. */
        grabs: g.hazards.grabs,
        baits: g.hazards.baits,
        /**
         * Hazards eaten this run: the food-chain reversal.
         *
         * Monotonic because the hazard is REMOVED on the frame it is eaten, so "is it still in the list" cannot
         * answer whether it was eaten or simply drifted off screen.
         */
        eaten: g.hazards.eaten,
        /**
         * Creatures driven off by the gun, and hits that landed without finishing one.
         *
         * Monotonic for the same reason as `eaten`: a creature that has been driven off is out of the list within a
         * second, so nothing sampled afterwards can prove it happened.
         */
        fled: g.hazards.fled,
        damaged: g.hazards.damaged,
      },      /**
       * The suction field, so a probe can assert the pull and the cost without inferring them from motion.
       *
       * `radiusFraction` is the config-derived reach, and `moveFactor` is what the player's speed is currently
       * multiplied by -- the two halves of the mechanic, each stated rather than implied.
       */
      suction: {
        held: g.suctionUp,
        radiusFraction: suctionRadiusFraction(g.player.volume),
        moveFactor: g.player.suctionMoveFactor,
      },
      /**
       * The gun: how many rounds are in the air, and the two counters that make it answerable whether it fired and
       * whether it connected. Both monotonic, because a round lives for a couple of seconds at most.
       */
      bullets: {
        inFlight: g.bullets.bullets.length,
        fired: g.bullets.fired,
        hits: g.bullets.hits,
        /** Whether this run's bubble has the gun at all, so a probe can tell "off" from "not firing yet". */
        armed: g.bubbleType.firesBullets,
      },
      misfire: { remaining: +g.player.misfireSeconds.toFixed(3), inverted: g.player.misfiring },
      /** The obstacles, so a probe reads the state rather than inferring it from what is on screen. */
      obstacles: {
        active: g.obstacles.count,
        byKind: g.obstacles.obstacles.reduce<Record<string, number>>((acc, o) => {
          acc[o.kind] = (acc[o.kind] ?? 0) + 1;
          return acc;
        }, {}),
        broken: g.obstacles.broken,
        ramThreshold: mech.obstacles.ramVolumeThreshold,
        minGap: mech.obstacles.minGapFraction,
      },
      /** Fractional damage accumulated from a trash bag, so the drain can be observed directly. */
      trashDrain: +g.trashDrain.toFixed(3),
      /** Longest a trash bag has held on this run, so a grip's duration is observable. */
      maxGripSeconds: +g.hazards.hazards.reduce((m, h) => Math.max(m, h.gripSeconds), 0).toFixed(2),
      /** The player's movement penalty, so a slow can be observed rather than inferred. */
      slow: { remaining: +g.player.slowRemaining.toFixed(3), factor: g.player.slowFactor, impulseVy: +g.player.impulseVy.toFixed(2) },
      /**
       * This run's talent and the carried skill.
       *
       * Both are part of the run's identity, so a probe needs to see them to check that a talent's
       * upside AND its backlash are actually applied.
       */
      talent: {
        id: g.talentEffects.talent.id,
        name: g.talentEffects.talent.name,
        ascentMultiplier: g.talentEffects.ascentMultiplier,
        steerMultiplier: g.talentEffects.steerMultiplier,
        startVolume: g.talentEffects.startVolume,
        shrinkResistance: g.talentEffects.shrinkResistance,
      },
      skill: g.skill ? { id: g.skill.id, uses: g.skill.uses } : null,
      skillActivations: g.skillActivations,
      /** Fish-fart reflex count, so the talent's backlash can be observed rather than assumed. */
      farts: g.farts,
      /**
       * Emergence readout.
       *
       * The counters are the evidence that the design's centrepiece actually happens: a fish fed
       * enough to split, and collectables the swarm ate before the player could.
       */
      emergence: {
        fishSplits: g.hazards.splits,
        bubblesEatenByFish: g.hazards.bubblesEaten,
        fishCount: g.hazards.hazards.filter((h) => h.kind === 'fish').length,
        /** The perception radius the swarm is currently using, which grows with the player. */
        perceptionRadiusMeters: +g.hazards.perceptionRadius(g.player.volume).toFixed(1),
      },
      /** Scripted depth events, and which have fired. */
      events: { seen: g.eventsSeen, fired: [...g.eventsFired], last: g.lastEvent },
      /**
       * Audio and ending state.
       *
       * `audioRunning` is reported rather than assumed: browsers block audio until a real gesture, and
       * a game that claims to have sound while silently muted is worse than one that admits it.
       */
      audio: { muted: g.audioMuted, running: audio.isRunning },
      ending: { surfaced: g.surfaced, splash: +g.splash.toFixed(3), bestClimbed: Math.round(g.bestClimbed), bestVolume: +g.bestVolume.toFixed(2), bestScore: g.bestScore },
      score: { value: g.score.value, best: g.bestScore, byEvent: { ...g.score.ledger }, popups: g.popups.count },
      /**
       * The mutation ladder, as the probes and the console need it: where the bar stands, how many picks
       * are banked, and which graze/kill events have paid. `grazes` comes from the hazard field's own
       * counter, so it and the ledger cannot disagree about how many near-misses happened.
       */
      mutation: {
        value: +g.xp.value.toFixed(1),
        need: g.xp.need,
        level: g.xp.level,
        pending: g.xp.pending,
        grazes: g.hazards.grazes,
        ledger: { ...g.xp.ledger },
      },
      damagePopups: g.damagePopups.count,
      enemyBullets: { inFlight: g.enemyBullets.count, fired: g.enemyBullets.fired, hits: g.enemyBullets.hits },
      /** Active effect timers, so a skill that lasts can be observed while it runs. */
      activeSkill: g.player.skillId ? { id: g.player.skillId, remaining: +g.player.skillRemaining.toFixed(2) } : null,
      /** The bubble's growth stage: its speed tier, and how far into the next one it is. */
      stage: {
        stage: g.stage.stage,
        /**
         * The name of the current STATE, which is the growth stage for one type and the rage stage for the other.
         *
         * `bubbleStateName` rather than `stageName` so the readout cannot disagree with what is drawn: a volatile
         * bubble at 90 rage reports 失控 even though its growth stage is still 1.
         */
        name: stageName(g.stage.stage),
        absorbedInStage: g.stage.absorbedInStage,
        grows: g.bubbleType.growsByAbsorbing,
        neededForNext: g.stage.neededForNext,
        speedMultiplier: g.stage.speedMultiplier,
        /**
         * The whole appearance this frame paints with.
         *
         * The entire object rather than a couple of picked-out colours: a test that wants to check the stages are
         * distinguishable should read the same values the drawing code reads, so it cannot pass while the bubble
         * looks wrong. It is also what a tuner sees at a glance, in the console, for what actually loaded.
         */
        appearance: bubbleLook(g.bubbleType, g.stage.stage, g.rage.rage),
        /** The drawn radius as a fraction of the lane, which is also the radius the eating rules use. */
        radiusFraction: stageRadiusFraction(g.stage.stage, g.player.volume),
      },
      /**
       * Which bubble this run is, and the volatile one's resource.
       *
       * `controls` is reported so a probe can prove the LAYOUT changed with the type rather than assuming it: the
       * whole point of the per-type control list is that this array is different, and a test that read the type id
       * without reading this would pass while both types laid out the same buttons.
       */
      bubbleType: {
        id: g.bubbleType.id,
        name: g.bubbleType.name,
        controls: [...g.bubbleType.controls],
        hasSpit: hasControl(g.bubbleType, 'spit'),
        hasCompress: hasControl(g.bubbleType, 'compress'),
        hasCharge: hasControl(g.bubbleType, 'charge'),
        /** Whether it can swallow a creature at all. False means contact is damage, never a meal. */
        swallowsHazards: g.bubbleType.swallowsHazards,
        hitsToPop: g.bubbleType.hitsToPop,
      },
      rage: {
        value: +g.rage.rage.toFixed(2),
        fraction: +rageFraction(g.rage.rage).toFixed(3),
        safeSeconds: +g.rage.safeSeconds.toFixed(2),
        charging: g.charging,
        aiming: { x: +g.chargeAim.x.toFixed(2), y: +g.chargeAim.y.toFixed(2) },
        stageName: rageStageName(g.rage.rage),
        slamSeconds: +g.slamSeconds.toFixed(3),
        onSlam: g.onSlam,
        slams: g.slams,
        /** The burst: how many have fired, and what the last one did. */
        bursts: g.bursts,
        burstRadiusMeters: +(g.camera.viewport.laneWidthMeters * g.burstRadiusRatio).toFixed(1),
        waveAlive: g.burst !== null,
        lastBurstKills: g.burst?.kills ?? 0,
        lastBurstPushes: g.burst?.pushes ?? 0,
        /** Overload: full gauge, on the clock. `left` is what the HUD counts down. */
        overloaded: g.overloaded,
        overloadLeft: +g.rage.overloadLeft.toFixed(2),
      },
      phase: g.phase,
      volume: g.player.volume,
      /**
       * How many hits this bubble can still take.
       *
       * The TYPE's rule comes first, not the volume's: a type that declares `hitsToPop` has that many hits whatever it
       * has grown to, so reporting `hitsSurvived(volume)` for the plain bubble would say "6" about a bubble that dies
       * to one touch -- and a probe-facing number that lies is worse than no number.
       */
      hitsSurvived: g.bubbleType.hitsToPop ?? hitsSurvived(g.player.volume),
      invulnerable: g.invulnerable,
      bubbles: g.field.bubbles.length,
      lastEaten: g.lastEaten,
      stats: { ...g.stats },
      /**
       * Entity counts and the frame time, for the D7 performance pass.
       *
       * Reported from the game rather than recomputed by a probe, so a measurement always describes
       * the scene that actually exists.
       */
      report: {
        fps: +g.fps.toFixed(1),
        lastDeltaMs: +(g.lastDelta * 1000).toFixed(2),
        frames: g.frameCount,
        bubbles: g.field.bubbles.length,
        specks: g.field.specks.length,
        hazards: g.hazards.hazards.length,
      },
}
}
