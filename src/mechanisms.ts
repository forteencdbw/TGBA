import JSON5 from 'json5';
import rawText from '../config/mechanics.json5?raw';

/**
 * The hand-editable mechanics configuration.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------------------------
 * Every number that shapes the game lives in `config/mechanics.json5`, each with a Chinese explanation next to
 * it. The point is that tuning does not require reading or editing TypeScript: open the file, change a number,
 * save, and the page reloads.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY JSON5
 * ---------------------------------------------------------------------------------------------
 * The file format has to allow comments -- a per-value explanation is the whole reason this beats a TypeScript
 * constant -- and comments are not JSON. JSON5 also brings trailing commas, unquoted keys and hex literals,
 * which is exactly what a hand-edited file wants, and it removes the need for this project to hand-roll a
 * parser it would then have to maintain.
 *
 * It is a DEV dependency in spirit but gets bundled, because it runs in the page. Measured: about 20 kB
 * minified. That is the price of a config file a human can edit, and it is paid once.
 *
 * The import uses `?raw` so Vite hands over the file's TEXT rather than trying to treat `.json5` as a module.
 * That is also what makes a save hot-reload: the config is a real module dependency.
 */

/**
 * One growth stage's appearance, as the config file writes it.
 *
 * Colours accept EITHER a JSON5 hex literal (`0x9fe4ff`, a number) OR a `"#rrggbb"` string, since a colour picker
 * hands you the latter and neither form should be an error. Both become numbers after validation.
 *
 * A whole object per stage rather than parallel arrays: changing one stage must not mean counting the index
 * across a dozen lists, and adding a stage must not mean editing all of them.
 */
/**
 * One rage stage's colours, and the two numbers that make anger VISIBLE rather than merely enumerated.
 *
 * Only what changes with rage lives here; the geometry is shared in `RageLook`. `shake` and `swell` are the two
 * that carry "this bubble is about to go off" without drawing a face on it -- the design document is explicit that
 * a bubble with features stops reading as a bubble.
 */
export interface RageAppearance {
  name: string;
  /** The rage at which this stage takes over. Ordered ascending. */
  minRage: number;
  rim: number;
  glow: number;
  sheen: number;
  specular: number;
  hudColor: number;
  /** Lateral jitter as a fraction of the lane width. */
  shake: number;
  /** Periodic radius swell, as a fraction of the radius. */
  swell: number;
}

/** The geometry and opacities the rage stages share. See `RageAppearance` for why the colours are not here. */
export interface RageLook {
  radius: number;
  inner: number;
  innerAlpha: number;
  rimAlpha: number;
  rimWidthRatio: number;
  glowOuterAlpha: number;
  glowInnerAlpha: number;
  glowOuterRadiusRatio: number;
  glowInnerRadiusRatio: number;
  innerRing: boolean;
  innerRingAlpha: number;
  innerRingWidthRatio: number;
  sheenAlpha: number;
  specularAlpha: number;
}

export interface StageAppearance {
  /** Visual radius multiplier, on top of the radius the volume already gives. Affects the hitbox too. */
  radius: number;
  /** Interior fill, and its opacity. Wants to be near-white; see the config's comment for why. */
  inner: number;
  innerAlpha: number;
  /** The silhouette: the main hue carrier. */
  rim: number;
  rimAlpha: number;
  rimWidthRatio: number;
  /** The glow. Wants to be bright rather than saturated: it sits over the interior and sets its brightness. */
  glow: number;
  glowOuterAlpha: number;
  glowInnerAlpha: number;
  glowOuterRadiusRatio: number;
  glowInnerRadiusRatio: number;
  /** A second thin ring inside the rim, from stage 2. A SHAPE cue, for telling warm hues apart. */
  innerRing: boolean;
  innerRingAlpha: number;
  innerRingWidthRatio: number;
  /** The offset highlight and the specular dots. */
  sheen: number;
  sheenAlpha: number;
  specular: number;
  specularAlpha: number;
  /** The colour for the HUD's stage label, which sits on a dark HUD rather than in dark water. */
  hudColor: number;
  /** The stage's display name. */
  name: string;
}

export interface StageConfig {
  /** Movement speed multiplier per stage. Index 0 is stage 1. */
  speedMultiplier: number[];
  /** Floor on the multiplier, so a future curve cannot make the bubble uncontrollable. */
  minSpeedMultiplier: number;
  /** Collectables absorbed to reach stage 2, and then to reach stage 3. */
  absorbToStage2: number;
  absorbToStage3: number;
  /** Brief invulnerability when growing, so growing is not instantly punished. */
  growInvulnerableSeconds: number;
  /**
   * Per-stage appearance.
   *
   * TWO INDEPENDENT VISUAL SIGNALS, deliberately. `volume` grows the bubble CONTINUOUSLY, so size alone cannot
   * distinguish "just reached stage 2" from "stage 2 plus five more collectables". The stage colour is discrete
   * and answers "which stage am I in"; the radius answers "how big am I now". The player needs both.
   *
   * Shorter lists fall back to the last entry, so adding a stage without styling it is not an error.
   */
  appearance: StageAppearance[];
}

export interface Mechanisms {
  /**
   * What a run is worth, per event. The keys are `ScoreEvent` in `src/score.ts`.
   *
   * Every event is required rather than optional, and a value of 0 is how an event is taken OUT of the game: a
   * missing row would be indistinguishable from a deliberate zero, and "shooting stopped giving points" would then
   * have two very different explanations.
   */
  score: {
    drivenOff: number;
    absorb: number;
    skill: number;
    eaten: number;
    boss: number;
    /**
     * The floating numbers that appear where points were earned.
     *
     * Presentation rather than rules, and a sibling of the prices rather than a separate group: those four are what a
     * run is worth, and these are how the player finds out that something just paid.
     */
    popups: {
      lifeSeconds: number;
      /** Design pixels of upward drift over that life. */
      risePx: number;
      /** Exponent on the progress: 1 linear, below 1 fast-then-slow, above 1 slow-then-fast. */
      riseEase: number;
      size: number;
      colour: number;
      /** Base opacity, which the fade then scales. */
      alpha: number;
      weight: 'bold' | 'normal';
      /** Text before the number. `+` by default, so it reads as "that earned 50" rather than "the score is 50". */
      prefix: string;
      /** Fraction of the life held at full brightness before the fade starts. */
      fadeFrom: number;
      /** Exponent on the fade's progress: 1 linear, above 1 holds bright then drops, below 1 fades early. */
      fadeEase: number;
      /** Where the EVENT's position sits inside the label: 0 is the left/top edge, 0.5 the middle. */
      anchorX: number;
      anchorY: number;
      /** Ceiling on popups in flight: a guard against a scoring loop, not a budget to spend. */
      max: number;
    };
  };
  /**
   * Where the depth gauge sits, and how far in from the edge.
   *
   * A SIDE rather than two sets of coordinates, because the gauge and its landmark labels are one object: the labels
   * are anchored to the bar's inner edge, so moving the bar has to move them, and a config that could put the two in
   * different places would be a config that can put a label off the lane.
   */
  hud: {
    /** The boss health bar across the top, shown only while a boss is alive. */
    bossBar: {
      y: number;
      widthRatio: number;
      height: number;
      nameSize: number;
      nameOffset: number;
      nameColour: number;
      fillColour: number;
      backColour: number;
      backAlpha: number;
      borderColour: number;
      borderAlpha: number;
    };
    /**
     * The run's progress chart: one pip per level, filled as the run clears them.
     *
     * It answers "how far has THIS RUN got", which is a different fact from the boss bar's "how far has this level got"
     * -- and the two are shown together on purpose, because after a boss dies the first one changes and the second one
     * resets.
     */
    progressChart: {
      y: number;
      pipRadius: number;
      pipGap: number;
      rightInset: number;
      doneColour: number;
      doneAlpha: number;
      pendingColour: number;
      pendingAlpha: number;
      currentColour: number;
      currentAlpha: number;
      labelSize: number;
      labelColour: number;
    };
    /** The score readout, pinned to the top-left corner and on screen for the whole run. */
    score: {
      x: number;
      y: number;
      size: number;
      colour: number;
      alpha: number;
    };
    /**
     * The results card: the lines shown when a run ends.
     *
     * `widthRatio` is the reason this is in the config at all. The card used to be sized by the WORLD zoom alone,
     * which says nothing about how wide a line of text may be -- so adding one more fact to a line pushed it off both
     * edges of the screen. A wrap width expressed in screen terms is the fix, and a wrap width is a number the owner
     * will want to move.
     */
    resultsCard: {
      size: number;
      /** The card's centre, as a fraction of the canvas height. */
      yRatio: number;
      /** How much of the screen's width one line may use before it wraps. */
      widthRatio: number;
    };
  };
  /**
   * The touch buttons: one vertical column on the right edge of the lane.
   *
   * All of them in a column rather than split between the corners, which frees the whole left and middle of the
   * screen for the steering drag -- a finger never has to dodge a button, and the buttons never sit under the bubble.
   * Every value is design pixels (scaled by `designScale`) except the cap, which is a fraction of the lane.
   */
  touch: {
    buttonRadius: number;
    /** Ceiling on the radius as a fraction of the lane width, for lanes too narrow for the design size. */
    buttonMaxRadiusRatio: number;
    rightInset: number;
    bottomInset: number;
    /** Edge-to-edge gap between two buttons in the column. */
    buttonGap: number;
  };
  /**
   * The two font stacks every label in the game is built from.
   *
   * `fontFamily` must name a font that HAS the Chinese glyphs first, and that is not a style preference: Pixi
   * measures the line box from the FIRST family (it measures `|ÉqÅM`) while the Chinese glyphs are drawn by
   * whatever fallback font supplies them. Put a Latin-only monospace first and the measured ascent is shorter
   * than the glyphs, so the tops of the characters are clipped by the text's own canvas. See the config file.
   */
  text: {
    fontFamily: string;
    /** ASCII-only text whose column alignment depends on a monospace face: the debug readout. */
    monoFontFamily: string;
  };
  stages: StageConfig;
  volume: {
    start: number;
    max: number;
    hitCost: number;
    absorbEfficiency: number;
    laneRatio: number;
  };
  movement: {
    keyboardCrossingSeconds: number;
    verticalSpeedScale: number;
    /**
     * The touch drag: the phone's only way to move, and a POSITION rather than a throttle.
     *
     * A finger anywhere on the screen moves the bubble by the distance the finger moved, from wherever the bubble
     * already is -- not to where the finger is. `sensitivity` 1 is that 1:1 contract, and `penaltiesApply` decides
     * whether the growth stage, the suction field and the slows are allowed to shrink the distance (they do not, by
     * default, because shrinking it would break the 1:1 promise). See the config file.
     */
    drag: {
      sensitivity: number;
      penaltiesApply: boolean;
    };
  };
  /**
   * The dropped pickups: one row per pickup kind, plus the pulse they share.
   *
   * A table of looks rather than two sets of hardcoded numbers, because the two pickups must be told apart at a
   * glance in peripheral vision and that is exactly the kind of thing the owner will want to re-tune. Shape does most
   * of the work (a diamond versus stacked arrows); colour confirms it.
   */
  pickups: {
    pulsePerSecond: number;
    skill: PickupLook;
    upgrade: PickupLook;
    /** Fire-rate upgrade: a different shape AND hue from the rows one, so the two never blur together. */
    rate: PickupLook;
  };
  collectables: {
    riseMin: number;
    riseMax: number;
    riseSpeedExponent: number;
    wobbleMin: number;
    wobbleMax: number;
  };
  /**
   * Enemy fire: which creatures shoot, how often, how fast, and what a round costs.
   *
   * The table is a SUBSET of the kinds on purpose -- most creatures do not shoot -- so an absent row means "no gun",
   * and the boot check below only demands that every row names a real creature.
   */
  enemyBullets: {
    shooters: Record<
      string,
      {
        perSecond: number;
        /** Lane widths per second. Kept below the player's own lateral speed, or the dodge is not available. */
        speedPerSecond: number;
        /** Rounds per shot. Above 1 they fan out by `spreadRadians`. */
        spread: number;
        spreadRadians: number;
        /** Hit points a round takes off. */
        damage: number;
        /** How the round is drawn. Defaults to `bolt` when a row leaves it out. */
        shape?: 'bolt' | 'spike';
      }
    >;
    /** A creature only opens fire from inside this distance, so nothing arrives from off screen. */
    rangeMeters: number;
    radiusRatio: number;
    lifeSeconds: number;
    coreColour: number;
    rimColour: number;
    rimAlpha: number;
  };
  /**
   * The charging lunge: a creature that hunts aims at where the player was, telegraphs the curve, and commits.
   *
   * The curve is fixed at the moment the wind-up starts, which is what makes it fair: the player always gets a
   * window, and the only answer is to MOVE during it. A curve rather than a straight line because a straight line is
   * answered by "stand aside" at a glance, while a bowed one has to be read.
   */
  charges: {
    /**
     * Who lunges, and how -- one row per kind, so two creatures can threaten in two directions.
     *
     * A table rather than a name list because the interesting part is that they differ: the fish dives from where it
     * is, and the jellyfish sweeps in from the SIDE, which asks the player for a different dodge. Every row is
     * cross-checked against the real hazard kinds at load.
     */
    chargers: Record<
      string,
      {
        triggerMeters: number;
        /** The player's reaction window, in seconds. */
        telegraphSeconds: number;
        travelSeconds: number;
        /** Bow of the curve as a fraction of the charge distance. 0 is a straight line. */
        bowRatio: number;
        cooldownSeconds: number;
        /** `dive` comes straight from where the creature is; `side` retreats to the flank and sweeps across. */
        approach: 'dive' | 'side';
      }
    >;
    telegraphColour: number;
    telegraphAlpha: number;
    trailColour: number;
    trailAlpha: number;
  };
  hazards: {
    /**
     * The bomb fish, in all three of its roles: hunting outside, a lit fuse inside, a grenade when spat.
     *
     * One group because they are one creature's behaviour, and because a reader looking for "how long until the bomb
     * fish goes off" should not have to know whether that is a stomach number or an ocean one.
     */
    /**
     * The boss: the one creature that does not belong to the current.
     *
     * It holds station above the player instead of drifting, so it cannot be outrun -- the fight ends when one of the
     * two of them does. Its health, name and arrival point are the LEVEL's (see `BossSpec`), because those are level
     * design; everything here is shared mechanics.
     */
    boss: {
      /** Metres above the player it holds. Too far and it leaves the visible band; too near and it is a wall. */
      holdMeters: number;
      /** Lateral patrol: amplitude as a fraction of the lane width, and the period in seconds. */
      patrolAmplitude: number;
      patrolPeriodSeconds: number;
      /** How fast it tracks the player sideways, in lane widths per second. Kept below the player's own speed. */
      seekSpeedFactor: number;
      contactDamage: number;
      /** Body radius as a fraction of the lane width. Large on purpose: this is the level's answer, not another fish. */
      radiusRatio: number;
      colour: number;
      eyeColour: number;
      armourColour: number;
      hitFlashSeconds: number;
      weakPointWidthRatio: number;
      hitFlashColour: number;
    };
    /** LEVEL 1's signature: the black smoker's lethal column. */
    vent: {
      radiusRatio: number;
      contactDamage: number;
      periodSeconds: number;
      activeSeconds: number;
      warnSeconds: number;
      plumeColour: number;
      glowColour: number;
      edgeColour: number;
      edgeAlpha: number;
    };
    /** Mineral grit on the heat flow: slow, fragile, and mostly in the way. */
    mineral: {
      riseSpeedFactor: number;
      wobbleAmplitude: number;
      wobblePeriodSeconds: number;
      lifeMeters: number;
    };
    shrimp: {
      driftSpeedFactor: number;
      contactDamage: number;
    };
    angler: {
      driftFactor: number;
      lureMeters: number;
      telegraphSeconds: number;
      travelSeconds: number;
      cooldownSeconds: number;
      bowRatio: number;
      lureColour: number;
      lureRadiusRatio: number;
      lurePulsePerSecond: number;
      lureOffsetRatio: number;
    };
    /** LEVEL 3: a jellyfish that discharges when touched or shot -- the ignition source for the chain. */
    zapper: {
      ringRadiusRatio: number;
      ringDamage: number;
      ringSeconds: number;
      ringCooldownSeconds: number;
      dischargesWhenHit: boolean;
      bellColour: number;
      ringColour: number;
      ringAlpha: number;
    };
    /**
     * LEVEL 3's signature: the bubble accumulates charge, and a charged bubble ignites the water.
     *
     * One number on the player, and three uses: it makes the jellies dangerous, it makes the player's own body a
     * weapon, and (because a discharge kills whatever it reaches) it is how a blocked route is opened. The same
     * mechanic paying three ways is why it is worth a HUD ring rather than a status line.
     */
    charge: {
      max: number;
      chainAt: number;
      perRingHit: number;
      perSecondNearZapper: number;
      decayPerSecond: number;
      nearMeters: number;
      chainRangeMeters: number;
      chainJumpMeters: number;
      chainDamage: number;
      chainMaxTargets: number;
      chainSelfDamage: number;
      bubbleRingColour: number;
      bubbleRingWidthRatio: number;
      burstColour: number;
      burstAlpha: number;
      burstSeconds: number;
    };
    /** LEVEL 6: foam that looks like the player's own bubble, and rain that presses them back down. */
    foam: {
      radiusRatio: number;
      lifeSeconds: number;
      contactDamage: number;
      colour: number;
      rimColour: number;
      alpha: number;
      rimAlpha: number;
    };
    rain: {
      fallSpeedFactor: number;
      pushMeters: number;
      contactDamage: number;
      colour: number;
      lengthRatio: number;
    };
    torpedo: {
      runSpeedFactor: number;
      runMeters: number;
      seekSpeedFactor: number;
      seekSeconds: number;
      contactDamage: number;
    };
    bombfish: {
      /** Toward the player, in lane widths per second. Kept below the player's own lateral speed, so it can be fled. */
      seekSpeedFactor: number;
      /** Inside this distance it lights its fuse. */
      armMeters: number;
      /** The fuse, in seconds: the player's last chance to leave or to shoot it. */
      fuseSeconds: number;
      /** Damage radius of the blast, as a fraction of the lane width. */
      blastRadiusRatio: number;
      blastDamage: number;
      /** Design pixels of screen shake at the moment of the blast, and how long it lasts. 0 turns it off. */
      blastShakePixels: number;
      blastShakeSeconds: number;
      /** The fuse while it is IN the stomach, and what that costs. */
      stomachFuseSeconds: number;
      detonationHitPoints: number;
      /** Blast radius when a SPAT one hits something: the grenade's payoff. */
      grenadeBlastRadiusRatio: number;
    };
    slowFactor: number;
    slowSeconds: number;
    /** Hit points a jellyfish sting costs, on top of the slow. */
    jellyContactDamage: number;
    /**
     * How many bullet hits each kind of creature takes before it flees.
     *
     * Zero means the bullets pass through it: the default is that only fish are shootable, so that driving a
     * chaser off is a thing the player can do without every creature in the water becoming a target. Depleting it
     * does NOT kill the creature -- see `fleeSpeedFactor` and `HazardField`'s flee state.
     */
    health: Record<string, number>;
    /** How fast a creature that has had enough leaves, in SCREEN HEIGHTS per second: see the config's note. */
    fleeScreensPerSecond: number;
    /** How visible a creature is while it leaves, 0..1. The same drawing, dimmed, rather than a second palette. */
    fleeAlpha: number;
    crabLaunchMps: number;
    launchDecaySeconds: number;
    crabLaunchScreenBonus: number;
    crabArmDistanceMeters: number;
    crabFuseSeconds: number;
    trashDrainPerSecond: number;
    trashMinGripSeconds: number;
    /**
     * Negative food: edible, but it keeps acting once it is inside.
     *
     * These are the risk decisions the design wants -- without them swallowing is a pure gain and the player never
     * has to think about whether a thing is worth eating. Both creatures are also ordinary hazards below their
     * tier, which follows from the reversal rule rather than being a second rule.
     */
    urchinDrainPerSecond: number;


    /** The eel: how often it shocks, and for how long. Zero duration disables the side effect entirely. */
    eelShockPeriodSeconds: number;
    eelShockSeconds: number;
    /** The rot: what it multiplies the digestion rate by while it is inside. 1 means no effect. */
    rotDigestScale: number;
    /** The oil: the chance a spit attempt gets it out. 0 is a permanent clog, 1 is an ordinary item. */
    oilSpitChance: number;
    /** The cue that must exist: the electric shock on the bubble is the only warning that the controls are broken. */
    eelShockColor: number;
    eelShockWidthRatio: number;
    invulnerableSeconds: number;
  };
  /** Consuming hazards: the food-chain reversal. */
  consumption: {
    /**
     * The volume ladder. Index 0 is tier 1, so the array length is the number of tiers and each value is the
     * volume that ENTERS that tier.
     *
     * Its own ladder rather than the growth stages, because stages advance by absorption COUNT while volume
     * accumulates by size -- see `src/consumption.ts` for what went wrong when the two were conflated.
     */
    tierVolume: number[];
    /** Mass (in volume terms) of each hazard kind. */
    mass: Record<string, number>;
    /** The volume tier at which each hazard kind becomes edible. */
    edibleAtTier: Record<string, number>;
    massEfficiency: number;
    eatInvulnerableSeconds: number;
    marker: {
      edibleColor: number;
      widthRatio: number;
      edibleAlpha: number;
      blockedAlpha: number;
      showBlocked: boolean;
    };
  };
  /** Long-press suction: pulling light things toward the bubble. */
  suction: {
    radiusRatio: number;
    radiusPerVolume: number;
    maxRadiusRatio: number;
    pullPerSecond: number;
    heavyRatio: number;
    heavyFloor: number;
    /** How much of the player's movement speed survives while sucking. */
    moveSpeedFactor: number;
    fieldColor: number;
    fieldAlpha: number;
    fieldWidthRatio: number;
    tetherAlpha: number;
    tetherWidthRatio: number;
  };
  /** Spitting a swallowed hazard back out as a projectile. */
  spit: {
    capacity: number;
    /** The over-eating fuse: seconds from a full stomach to a burst. 0 disables the whole mechanic. */
    overloadFuseSeconds: number;
    overloadMoveSpeedFactor: number;
    overloadSuctionFactor: number;
    bulgePerItem: number;
    bulgeMax: number;
    pulseHz: number;
    rimColor: number;
    panicBelowFraction: number;
    panicPulseFactor: number;
    speedPerSecond: number;
    decaySeconds: number;
    hitRadiusRatio: number;
    knockbackMeters: number;
    spitInvulnerableSeconds: number;
    emptyCooldownSeconds: number;
    trailAlpha: number;
    trailWidthRatio: number;
    glowAlpha: number;
    glowRadiusRatio: number;
  };
  /**
   * The small bubbles the player's bubble fires on its own, continuously.
   *
   * A second KIND of projectile, not a second tuning of `spit`: a spat hazard is thrown back at what it came from
   * and knocks it around, while these are ordinary fire that takes hit points off a creature until it leaves. The
   * two coexist because they cost different things -- a stomach slot versus nothing but time.
   */
  bullets: {
    /**
     * The fire-rate LADDER: the first entry is what a run starts at, and each rate pickup moves up one.
     *
     * An array rather than a number plus a cap, because "how many tiers are there" and "how fast is each tier" are the
     * same fact: adding a tier is adding an entry and deleting one is deleting an entry. The FIRST entry being 0 is how
     * the whole weapon is switched off.
     */
    rateTiers: number[];
    /** Speed as a fraction of the lane width per second, on top of the level's own scroll. */
    speedPerSecond: number;
    radiusRatio: number;
    /** Hit points off a creature per hit, against `hazards.health`. */
    damage: number;
    /** Seconds in flight before a round disappears, which is also its range. */
    lifeSeconds: number;
    /**
     * Lateral gap between gun rows once the upgrade is taken, as a fraction of the lane width.
     *
     * The two streams have to be far enough apart to read as two, and close enough that the gap between them is not a
     * corridor the player is forced into -- the lane is also where the enemies are.
     */
    upgradeSpreadRatio: number;
    /** Rows the gun can reach. 2 is what one upgrade promises; higher makes the pickup stack. */
    maxStreams: number;
    colour: number;
    alpha: number;
    rimColour: number;
    rimAlpha: number;
  };
  /**
   * Digesting the stomach's contents: the third way out of a full stomach.
   *
   * Spitting is instant and yields ammunition; digesting is slow and yields RANK; ignoring it bursts the bubble.
   * There is deliberately no "how much does digesting shrink me" value here -- an item records the volume it
   * added when it was swallowed, and digesting pays that back in proportion to progress. See `src/spit.ts`.
   */
  digest: {
    /** Fraction of the oldest item digested per second while the compress control is NOT held. */
    passivePerSecond: number;
    /** Fraction per second while it IS held. Must be fast enough to defuse a full stomach before the fuse runs out. */
    compressPerSecond: number;
    /** Growth energy per unit of digested mass. Below 1 means digesting loses something. */
    energyPerMass: number;
    /** Growth energy that buys one tier of eating rank. */
    energyPerTier: number;
    /** Ceiling on the rank digestion can buy, so volume stays the gate it was designed to be. */
    maxTierBonus: number;
    /** EXTRA hit points a hit costs while digesting. 1 doubles the damage taken. */
    extraHitPoints: number;
    /** The rim pulse while compressing: its frequency, how deep it oscillates, and the colour it swaps the rim to. */
    pulseHz: number;
    pulseDepth: number;
    rimColor: number;
  };
  /**
   * Marking what is in the stomach, on the bubble's rim.
   *
   * Once the contents keep acting from inside, "what is in there" stops being trivia and becomes information the
   * player has to have: a fuse burning where they cannot see it is an ambush rather than a decision.
   */
  stomach: {
    markerRadiusRatio: number;
    markerOrbitRatio: number;
    markerAlpha: number;
    markerMinSpreadRadians: number;
    fuseBlinkHz: number;
    fusePanicSeconds: number;
  };
  /**
   * The codex page: a paged card list reached from the main menu.
   *
   * Only LAYOUT and colour here. Every number ON a card is read from the section it belongs to, so the page cannot
   * describe a game that no longer exists -- see `src/codex.ts`.
   */
  codex: {
    columns: number;
    rows: number;
    margin: number;
    gap: number;
    headerHeight: number;
    footerHeight: number;
    titleSize: number;
    titleY: number;
    titleColour: number;
    tabHeight: number;
    tabGap: number;
    tabTextSize: number;
    tabFill: number;
    tabStroke: number;
    tabTextColour: number;
    activeTabFill: number;
    activeTabStroke: number;
    activeTabTextColour: number;
    pageTextSize: number;
    pageTextColour: number;
    cardRadius: number;
    cardFill: number;
    cardFillAlpha: number;
    cardStroke: number;
    cardStrokeAlpha: number;
    cardPad: number;
    iconSize: number;
    nameSize: number;
    nameColour: number;
    taglineSize: number;
    taglineColour: number;
    factSize: number;
    factLeading: number;
    factLabelWidth: number;
    factLabelColour: number;
    factValueColour: number;
    noteSize: number;
    noteColour: number;
    noteLeading: number;
    noteBulletIndent: number;
    buttonHeight: number;
    buttonPad: number;
    buttonRadius: number;
    buttonFill: number;
    buttonStroke: number;
    buttonTextColour: number;
    buttonTextSize: number;
    collectableColour: number;
    skillColour: number;
    talentColour: number;
  };
  /**
   * The main menu's two buttons.
   *
   * Geometry is SHARED between them on purpose: two buttons at slightly different sizes read as a menu that is out
   * of alignment rather than as a hierarchy, and the hierarchy is already carried by fill versus outline.
   */
  menu: {
    buttonWidthRatio: number;
    buttonMaxWidth: number;
    buttonHeight: number;
    buttonRadius: number;
    buttonGap: number;
    primaryFill: number;
    primaryPressedFill: number;
    primaryTextColour: number;
    primaryTextSize: number;
    secondaryFill: number;
    secondaryPressedFill: number;
    secondaryStroke: number;
    secondaryStrokeAlpha: number;
    secondaryTextColour: number;
    secondaryTextSize: number;
    buttonStroke: number;
    buttonStrokeAlpha: number;
    /** The bubble-type selector: its geometry, and the two states a type button can be in. */
    typeRowHeight: number;
    typeRowGap: number;
    typeRowTopGap: number;
    taglineGap: number;
    typeTextSize: number;
    taglineSize: number;
    typeSelectedFill: number;
    typeSelectedStroke: number;
    typeSelectedTextColour: number;
    typeIdleFill: number;
    typeIdleStroke: number;
    typeIdleTextColour: number;
    /** The level row: one pill per level, with a selected, an idle and a locked state. */
    levelRowHeight: number;
    levelRowGap: number;
    levelRowTopGap: number;
    levelTextSize: number;
    levelNoteSize: number;
    levelMaxWidthRatio: number;
    /** The narrowest a level pill may be, as a fraction of the menu width. Decides how many fit per row. */
    levelMinWidthRatio: number;
    levelSelectedFill: number;
    levelSelectedStroke: number;
    levelSelectedTextColour: number;
    levelIdleFill: number;
    levelIdleStroke: number;
    levelIdleTextColour: number;
    levelLockedFill: number;
    levelLockedStroke: number;
    levelLockedTextColour: number;
    levelNoteColour: number;
    levelUnlockColour: number;
  };
  /**
   * Obstacles: what is in the water that is neither food nor threat, but scenery you have to answer.
   *
   * Four kinds, and they are four DIFFERENT ANSWERS rather than four durability tiers -- see the config block for the
   * table. The kind list itself is `OBSTACLE_KINDS`, below, because the config tables and the `ObstacleKind` union
   * have to agree and one list that both derive from is the only way to make that a compile or boot error instead of
   * a silent default.
   */
  obstacles: {
    health: Record<string, number>;
    radius: Record<string, number>;
    /**
     * Per-kind override of the volume needed to ram it through, or `null` for "no ram ever".
     *
     * Keyed by kind and sparse: a kind that is happy with the shared `ramVolumeThreshold` simply is not listed.
     */
    ramVolume: Record<string, number | null>;
    minGapFraction: number;
    projectileDamage: number;
    ramVolumeThreshold: number;
    ramDamagePerVolume: number;
    collideDamage: number;
    collideInvulnerableSeconds: number;
    /** Speed multiplier while inside a net, and how long the drag lingers after leaving one. */
    netDrag: number;
    netDragSeconds: number;
    crateColor: number;
    crateRimColor: number;
    coralColor: number;
    coralRimColor: number;
    wallColor: number;
    wallRimColor: number;
    netColor: number;
    netRimColor: number;
    /** Mesh lines each way in a net's drawn grid. */
    netMesh: number;
    /** LEVEL 1's tube worms: pale tubes on a dark base. */
    tubeColor: number;
    tubeRimColor: number;
    crackWidthRatio: number;
    damagedDarken: number;
  };
  /**
   * The volatile bubble: the second playable type.
   *
   * Its own APPEARANCE NAMESPACE, which is the answer to the design document's first open question. The growth
   * stages own the devour bubble's colour (cyan -> gold -> pink); rage wants blue -> orange -> red -> crimson, and
   * both cannot have the same canvas. Since a run picks one type (see the main menu), each type carries its own
   * palette and they never meet.
   *
   * `look` holds the geometry the four rage stages share and `appearance` holds only what changes with rage, so
   * retuning the glow means editing one number rather than four.
   */
  /**
   * The plain bubble's palette: the hue carriers, and nothing else.
   *
   * Only three numbers, because only three things are the bubble's HUE -- the rim, the outer glow and the HUD's state
   * dot. The radius, the inner ring and every alpha still come from the growth stages: the plain bubble grows and eats
   * the same speed tiers as the devour bubble, and what it lacks is a state worth colouring for.
   *
   * Its hit points (one, at any size) are NOT here: that is what the character IS, so it lives on the type in
   * `src/bubbleTypes.ts` beside `swallowsHazards`.
   */
  plain: {
    look: {
      rim: number;
      glow: number;
      hudColor: number;
    };
  };
  angry: {
    rage: {
      max: number;
      /** Rage gained from one non-fatal hit. The design's number: four hits to overload. */
      perHit: number;
      decayPerSecond: number;
      /** How long the player must go untouched before rage starts falling. */
      decayDelaySeconds: number;
    };
    charge: {
      launchScreenSpeed: number;
      launchLateralSpeed: number;
      /** How long after release a contact still counts as a slam. */
      slamSeconds: number;
      slamDamageBase: number;
      slamRageScale: number;
      rageCostPerHit: number;
      rageCostPerBreak: number;
      /** Whether a slam can break what no volume can smash (`obstacles.ramVolume` null). */
      slamBreaksUnrammable: boolean;
      defaultAimX: number;
      defaultAimY: number;
    };
    /** One row per rage stage, ordered by `minRage`. */
    appearance: RageAppearance[];
    look: RageLook;
    slamRadiusBonus: number;
    /** The rage burst: a radial spend of the whole gauge. See the config block for the reasoning. */
    burst: {
      radiusBaseRatio: number;
      radiusMaxRatio: number;
      obstacleDamage: number;
      /** Push strength for the creatures the wave cannot destroy, in the spit knockback's own units. */
      pushImpact: number;
      /** Per hazard kind: what a wave does to it. */
      hazardMode: Record<string, 'destroy' | 'push'>;
      waveSeconds: number;
      waveWidthRatio: number;
      waveColour: number;
    };
    /** Overload: the state a full gauge puts the bubble in, and the price of not spending it. */
    overload: {
      seconds: number;
      steerFactor: number;
      radiusBonus: number;
      ramDamage: number;
      releaseHealth: number;
      punishHits: number;
    };
    /** The rage gauge on the HUD: a bar, drawn only for a type that has a resource. */
    gauge: {
      widthRatio: number;
      height: number;
      gap: number;
      radius: number;
      trackColour: number;
      trackAlpha: number;
      trackStroke: number;
      trackStrokeAlpha: number;
      fillAlpha: number;
      tickColour: number;
      tickAlpha: number;
      tickWidth: number;
    };
  };
  /** Audio levels that are not the player's own volume. */
  audio: {
    /**
     * The background bed's level relative to the one-shot sounds.
     *
     * A separate gain node rather than a factor on the master, because the master carries the PLAYER's volume:
     * scaling it would take the effects down too, and a slider reading 100% should still mean "as loud as this
     * game goes".
     */
    musicVolume: number;
    /**
     * How loud one small-bubble round landing on a creature is.
     *
     * In the config rather than beside the other synthesis numbers because it is the one cue that fires several
     * times a second: its level decides whether the mix holds together, which makes it a balance value rather than
     * a sound-design one.
     */
    bulletHitVolume: number;
    /** How loud a round leaving the muzzle is. Quieter than the hit: the shot is the rhythm, the hit is the news. */
    bulletFireVolume: number;
  };
  emergence: {
    fishPerceptionBaseMeters: number;
    fishPerceptionPerVolume: number;
    fishFeedToSplit: number;
    fishHardCap: number;
    seekBiggestRangeMeters: number;
  };
  /** Defaults for how content arrives from the sides and from below. Per-level content lives in levels.json5. */
  spawning: {
    enterSpeedMps: number;
    offscreenMarginRatio: number;
    bottomMarginRatio: number;
    insideMarginRatio: number;
    entryDepth: number;
  };
}

/** How a dropped pickup is painted. Radii are fractions of the lane width. */
export interface PickupLook {
  radiusRatio: number;
  haloColour: number;
  haloAlpha: number;
  coreColour: number;
  coreAlpha: number;
  rimColour: number;
  rimAlpha: number;
}

/** Throw with the offending key named, so a typo in the file is a message rather than a mystery. */
function fail(message: string): never {
  throw new Error(
    `config/mechanics.json5 is invalid: ${message}\n` +
      'The file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.',
  );
}

/** True if `v` is a non-empty object whose values are all finite numbers. */
function isNumberTable(v: unknown): v is Record<string, number> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const values = Object.values(v as Record<string, unknown>);
  return values.length > 0 && values.every((n) => typeof n === 'number' && Number.isFinite(n));
}

/**
 * True if every row of the enemy-shooters table is a complete, sane row.
 *
 * Checked field by field rather than as "an object", because these five numbers ARE a difficulty: a row missing its
 * `speedPerSecond` would fire a round that goes nowhere, and a missing `perSecond` would divide by zero into an
 * infinite cadence. Both fail as "the game feels broken" rather than as an error message, which is the shape this
 * project turns into a boot failure everywhere else.
 */
/**
 * True if every row of the chargers table is a complete, sane row.
 *
 * The same reasoning as the shooters table: a row missing its `telegraphSeconds` would lunge with no warning at all,
 * and one missing `travelSeconds` would divide by zero into an instant teleport onto the player. Both read as "that
 * was unfair" rather than as an error, which is exactly the class of failure this project makes a boot error.
 */
function isChargerTable(v: unknown): boolean {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const rows = Object.values(v as Record<string, unknown>);
  if (rows.length === 0) return false;
  const numbers = ['triggerMeters', 'telegraphSeconds', 'travelSeconds', 'cooldownSeconds'] as const;
  return rows.every((row) => {
    if (row === null || typeof row !== 'object') return false;
    const r = row as Record<string, unknown>;
    if (!numbers.every((k) => typeof r[k] === 'number' && Number.isFinite(r[k] as number) && (r[k] as number) >= 0)) return false;
    return typeof r.bowRatio === 'number' && Number.isFinite(r.bowRatio) && Math.abs(r.bowRatio) <= 2;
  });
}

function isShooterTable(v: unknown): boolean {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const rows = Object.values(v as Record<string, unknown>);
  if (rows.length === 0) return false;
  const fields = ['perSecond', 'speedPerSecond', 'spread', 'spreadRadians', 'damage'] as const;
  return rows.every((row) => {
    if (row === null || typeof row !== 'object') return false;
    const r = row as Record<string, unknown>;
    if (r.shape !== undefined && r.shape !== 'bolt' && r.shape !== 'spike') return false;
    return fields.every((k) => typeof r[k] === 'number' && Number.isFinite(r[k] as number) && (r[k] as number) >= 0);
  });
}

/** True if `v` is a usable colour: a JSON5 hex literal, or a "#rrggbb" string. */
function isColour(v: unknown): boolean {
  return (
    (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xffffff) ||
    (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v))
  );
}

/** Read a value by dotted path, used by the validation pass below. */
function readRaw(path: string): unknown {
  let node: unknown = parsed;
  for (const key of path.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/**
 * Parse FIRST, then build the rules.
 *
 * The order is not stylistic: the rules capture the parsed values in their closures (the cross-field checks
 * like "wobbleMax must be at least wobbleMin"), so building them before parsing would read a `let` that is
 * still in its temporal dead zone.
 */
let parsed: unknown;
try {
  parsed = JSON5.parse(rawText);
} catch (e) {
  fail(`it is not valid JSON5 (${(e as Error).message})`);
}

if (parsed === null || typeof parsed !== 'object') fail('the top level must be an object');

/**
 * Per-key rules for a stage's appearance object.
 *
 * One entry per key so a mistake NAMES the key it is about. A single "appearance is invalid" check would leave
 * the owner hunting through thirty values, and the whole point of a hand-edited config is that a typo is a
 * message rather than a mystery.
 */
const APPEARANCE_RULES: { key: string; what: string; ok: (v: unknown) => boolean }[] = [
  { key: 'radius', what: 'radius multiplier, above 0.05 and under 8', ok: (v) => typeof v === 'number' && v > 0.05 && v < 8 },
  // Colours: a JSON5 hex literal is a number, a colour picker gives a "#rrggbb" string. Both are fine.
  ...(['inner', 'rim', 'glow', 'sheen', 'specular', 'hudColor'] as const).map((key) => ({
    key,
    what: 'colour, either 0xrrggbb or "#rrggbb"',
    ok: (v: unknown) =>
      (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xffffff) ||
      (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)),
  })),
  ...(['innerAlpha', 'rimAlpha', 'glowOuterAlpha', 'glowInnerAlpha', 'innerRingAlpha', 'sheenAlpha', 'specularAlpha'] as const).map(
    (key) => ({
      key,
      what: 'opacity between 0 and 1',
      ok: (v: unknown) => typeof v === 'number' && v >= 0 && v <= 1,
    }),
  ),
  ...(['rimWidthRatio', 'innerRingWidthRatio'] as const).map((key) => ({
    key,
    what: 'stroke width as a fraction of the radius, between 0.01 and 0.5',
    ok: (v: unknown) => typeof v === 'number' && v >= 0.01 && v <= 0.5,
  })),
  ...(['glowOuterRadiusRatio', 'glowInnerRadiusRatio'] as const).map((key) => ({
    key,
    what: 'radius as a multiple of the bubble radius, at least 1',
    ok: (v: unknown) => typeof v === 'number' && v >= 1 && v <= 4,
  })),
  { key: 'innerRing', what: 'true or false', ok: (v) => typeof v === 'boolean' },
  { key: 'name', what: 'the stage name shown on the HUD', ok: (v) => typeof v === 'string' && v.length > 0 },
];

/**
 * The codex page's colours, as one list.
 *
 * Twenty-one keys, and every one of them has to be validated AND normalised. Two hand-written lists that have to
 * agree is exactly how `marker.edibleColor` once ended up validated but never converted -- writing `"#rrggbb"`
 * would then have handed Pixi a string, with nothing to see but a wrong-looking page. One list, used for both.
 */
const CODEX_COLOURS = [
  'titleColour',
  'tabFill',
  'tabStroke',
  'tabTextColour',
  'activeTabFill',
  'activeTabStroke',
  'activeTabTextColour',
  'pageTextColour',
  'cardFill',
  'cardStroke',
  'nameColour',
  'taglineColour',
  'factLabelColour',
  'factValueColour',
  'noteColour',
  'buttonFill',
  'buttonStroke',
  'buttonTextColour',
  'collectableColour',
  'skillColour',
  'talentColour',
] as const;

/**
 * The obstacle kinds, as the single list both the config's tables and the `ObstacleKind` union derive from.
 *
 * `ObstacleType` in `src/obstacles.ts` is `(typeof OBSTACLE_KINDS)[number]`, so adding a kind here is what makes it
 * a kind, and the boot check below then demands a `health` and a `radius` row for it. That combination is the point:
 * the lookups used to carry `?? 1` and `?? 0.05` fallbacks, which meant a kind with no row would quietly be a
 * one-hit-point obstacle instead of an error -- a content bug with no symptom, which is the shape this project
 * guards everywhere else.
 */
export const OBSTACLE_KINDS = ['crate', 'coral', 'wall', 'net', 'tube'] as const;

const REQUIRED: { path: string; check: (v: unknown) => boolean; describe: string }[] = [
  ...['drivenOff', 'absorb', 'skill', 'eaten', 'boss'].map((event) => ({
    path: `score.${event}`,
    check: (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100000,
    describe: 'points for this event, between 0 and 100000; 0 takes the event out of the score',
  })),
  { path: 'enemyBullets.shooters', check: (v) => isShooterTable(v), describe: 'an object of hazard kind to a shooter row' },
  { path: 'enemyBullets.rangeMeters', check: (v) => typeof v === 'number' && v >= 40 && v <= 2000, describe: 'metres between 40 and 2000' },
  { path: 'enemyBullets.radiusRatio', check: (v) => typeof v === 'number' && v > 0.002 && v < 0.2, describe: 'a fraction of the lane width above 0.002 and below 0.2' },
  { path: 'enemyBullets.lifeSeconds', check: (v) => typeof v === 'number' && v >= 0.5 && v <= 30, describe: 'seconds between 0.5 and 30' },
  { path: 'enemyBullets.coreColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'enemyBullets.rimColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'enemyBullets.rimAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'charges.chargers', check: (v) => isChargerTable(v), describe: 'an object of hazard kind to { triggerMeters, telegraphSeconds, travelSeconds, bowRatio, cooldownSeconds, approach }' },
  ...['telegraphColour', 'trailColour'].map((key) => ({
    path: `charges.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or a "#rrggbb" string',
  })),
  ...['telegraphAlpha', 'trailAlpha'].map((key) => ({
    path: `charges.${key}`,
    check: (v: unknown) => typeof v === 'number' && v >= 0 && v <= 1,
    describe: 'an opacity between 0 and 1',
  })),
  { path: 'score.popups.riseEase', check: (v) => typeof v === 'number' && v > 0.05 && v <= 6, describe: 'an exponent above 0.05 and at most 6' },
  { path: 'score.popups.alpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'score.popups.weight', check: (v) => v === 'bold' || v === 'normal', describe: "'bold' or 'normal'" },
  { path: 'score.popups.prefix', check: (v) => typeof v === 'string' && v.length <= 8, describe: 'a string of at most 8 characters; the empty string is allowed' },
  { path: 'score.popups.fadeEase', check: (v) => typeof v === 'number' && v > 0.05 && v <= 6, describe: 'an exponent above 0.05 and at most 6' },
  { path: 'score.popups.anchorX', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'score.popups.anchorY', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'score.popups.lifeSeconds', check: (v) => typeof v === 'number' && v > 0.2 && v <= 12, describe: 'seconds above 0.2 and at most 12' },
  { path: 'score.popups.risePx', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'design pixels between 0 and 200' },
  { path: 'score.popups.size', check: (v) => typeof v === 'number' && v >= 8 && v <= 48, describe: 'a font size between 8 and 48' },
  { path: 'score.popups.colour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'score.popups.fadeFrom', check: (v) => typeof v === 'number' && v >= 0 && v < 1, describe: 'a fraction of the life, at least 0 and below 1' },
  { path: 'score.popups.max', check: (v) => typeof v === 'number' && v >= 1 && v <= 200, describe: 'a whole number of popups between 1 and 200' },
  ...['rim', 'glow', 'hudColor'].map((key) => ({
    path: `plain.look.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or a "#rrggbb" string',
  })),
  { path: 'hud.resultsCard.size', check: (v) => typeof v === 'number' && v >= 10 && v <= 60, describe: 'a font size between 10 and 60' },
  { path: 'hud.resultsCard.yRatio', check: (v) => typeof v === 'number' && v >= 0.05 && v <= 0.9, describe: 'a fraction of the canvas height between 0.05 and 0.9' },
  { path: 'hud.resultsCard.widthRatio', check: (v) => typeof v === 'number' && v >= 0.3 && v <= 1, describe: 'a fraction of the canvas width between 0.3 and 1' },
  { path: 'hud.progressChart.y', check: (v) => typeof v === 'number' && v >= 0 && v <= 400, describe: 'design pixels between 0 and 400' },
  { path: 'hud.progressChart.pipRadius', check: (v) => typeof v === 'number' && v >= 1 && v <= 30, describe: 'design pixels between 1 and 30' },
  { path: 'hud.progressChart.pipGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'design pixels between 0 and 60' },
  { path: 'hud.progressChart.rightInset', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'design pixels between 0 and 200' },
  { path: 'hud.progressChart.doneColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.progressChart.doneAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hud.progressChart.pendingColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.progressChart.pendingAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hud.progressChart.currentColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.progressChart.currentAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hud.progressChart.labelSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 40, describe: 'a font size between 8 and 40' },
  { path: 'hud.progressChart.labelColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.score.x', check: (v) => typeof v === 'number' && v >= 0 && v <= 400, describe: 'design pixels between 0 and 400' },
  { path: 'hud.score.y', check: (v) => typeof v === 'number' && v >= 0 && v <= 400, describe: 'design pixels between 0 and 400' },
  { path: 'hud.score.size', check: (v) => typeof v === 'number' && v >= 8 && v <= 60, describe: 'a font size between 8 and 60' },
  { path: 'hud.score.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.score.alpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hud.bossBar.y', check: (v) => typeof v === 'number' && v >= 0 && v <= 400, describe: 'design pixels between 0 and 400' },
  { path: 'hud.bossBar.widthRatio', check: (v) => typeof v === 'number' && v > 0.1 && v <= 1, describe: 'a fraction of the canvas width above 0.1 and at most 1' },
  { path: 'hud.bossBar.height', check: (v) => typeof v === 'number' && v >= 2 && v <= 60, describe: 'design pixels between 2 and 60' },
  { path: 'hud.bossBar.nameSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 60, describe: 'a font size between 8 and 60' },
  { path: 'hud.bossBar.nameOffset', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'design pixels between 0 and 200' },
  { path: 'hud.bossBar.nameColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.fillColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.backColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.backAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hud.bossBar.borderColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.borderAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'touch.buttonRadius', check: (v) => typeof v === 'number' && v >= 16 && v <= 80, describe: 'design pixels between 16 and 80' },
  { path: 'touch.buttonMaxRadiusRatio', check: (v) => typeof v === 'number' && v > 0.03 && v < 0.45, describe: 'a fraction of the lane width, above 0.03 and below 0.45' },
  { path: 'touch.rightInset', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'touch.bottomInset', check: (v) => typeof v === 'number' && v >= 0 && v <= 120, describe: 'design pixels between 0 and 120' },
  { path: 'touch.buttonGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'design pixels between 0 and 60' },
  {
    path: 'text.fontFamily',
    check: (v) => typeof v === 'string' && v.trim().length > 0,
    describe: 'a CSS font-family list, with a font that has the Chinese glyphs FIRST',
  },
  {
    path: 'text.monoFontFamily',
    check: (v) => typeof v === 'string' && v.trim().length > 0,
    describe: 'a CSS font-family list for ASCII-only text (the debug readout)',
  },
  { path: 'stages.speedMultiplier', check: (v) => Array.isArray(v) && v.length >= 2 && v.every((n) => typeof n === 'number'), describe: 'an array of at least two numbers' },
  { path: 'stages.minSpeedMultiplier', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a number above 0 and at most 1' },
  { path: 'stages.absorbToStage2', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'stages.absorbToStage3', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'stages.growInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  {
    path: 'stages.appearance',
    check: (v) => Array.isArray(v) && v.length >= 2 && v.every((s) => s !== null && typeof s === 'object'),
    describe: 'an array of at least two stage objects',
  },
  { path: 'volume.start', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.max', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.hitCost', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.absorbEfficiency', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'volume.laneRatio', check: (v) => typeof v === 'number' && v > 0 && v < 0.5, describe: 'a small number above 0' },
  { path: 'movement.keyboardCrossingSeconds', check: (v) => typeof v === 'number' && v > 0.05, describe: 'seconds above 0.05' },
  { path: 'movement.verticalSpeedScale', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'movement.drag.sensitivity', check: (v) => typeof v === 'number' && v > 0 && v <= 4, describe: 'a displacement multiplier above 0 and at most 4; 1 is finger-for-finger' },
  { path: 'movement.drag.penaltiesApply', check: (v) => typeof v === 'boolean', describe: 'true or false; false keeps the drag a strict 1:1 with the finger' },
  { path: 'collectables.riseMin', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'collectables.riseMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.riseMin') as number), describe: 'at least riseMin' },
  { path: 'collectables.riseSpeedExponent', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'collectables.wobbleMin', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'collectables.wobbleMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.wobbleMin') as number), describe: 'at least wobbleMin' },
  { path: 'hazards.vent.radiusRatio', check: (v) => typeof v === 'number' && v > 0.01 && v <= 0.5, describe: 'a fraction of the lane width above 0.01 and at most 0.5' },
  { path: 'hazards.vent.contactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 50, describe: 'hit points between 0 and 50' },
  { path: 'hazards.vent.periodSeconds', check: (v) => typeof v === 'number' && v >= 0.5 && v <= 60, describe: 'seconds between 0.5 and 60' },
  { path: 'hazards.vent.activeSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'seconds between 0 and 60' },
  { path: 'hazards.vent.warnSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'seconds between 0 and 10' },
  { path: 'hazards.vent.plumeColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.glowColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.edgeColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.edgeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hazards.mineral.riseSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.mineral.wobbleAmplitude', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction of the lane width between 0 and 1' },
  { path: 'hazards.mineral.wobblePeriodSeconds', check: (v) => typeof v === 'number' && v >= 0.2 && v <= 30, describe: 'seconds between 0.2 and 30' },
  { path: 'hazards.mineral.lifeMeters', check: (v) => typeof v === 'number' && v >= 50 && v <= 5000, describe: 'metres between 50 and 5000' },
  { path: 'hazards.shrimp.driftSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.shrimp.contactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.angler.driftFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'a fraction of the current between 0 and 3' },
  { path: 'hazards.angler.lureMeters', check: (v) => typeof v === 'number' && v >= 20 && v <= 800, describe: 'metres between 20 and 800' },
  { path: 'hazards.angler.telegraphSeconds', check: (v) => typeof v === 'number' && v > 0.1 && v <= 5, describe: 'seconds above 0.1 and at most 5' },
  { path: 'hazards.angler.travelSeconds', check: (v) => typeof v === 'number' && v > 0.05 && v <= 5, describe: 'seconds above 0.05 and at most 5' },
  { path: 'hazards.angler.cooldownSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 30, describe: 'seconds between 0 and 30' },
  { path: 'hazards.angler.bowRatio', check: (v) => typeof v === 'number' && Math.abs(v) <= 2, describe: 'a curve amount from -2 to 2' },
  { path: 'hazards.angler.lureColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.angler.lureRadiusRatio', check: (v) => typeof v === 'number' && v > 0.002 && v <= 0.2, describe: 'a fraction of the lane width above 0.002 and at most 0.2' },
  { path: 'hazards.angler.lurePulsePerSecond', check: (v) => typeof v === 'number' && v >= 0 && v <= 20, describe: 'cycles per second between 0 and 20' },
  { path: 'hazards.angler.lureOffsetRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'a multiple of the body radius between 0 and 3' },
  { path: 'hazards.zapper.ringRadiusRatio', check: (v) => typeof v === 'number' && v > 0.02 && v <= 1.5, describe: 'a fraction of the lane width above 0.02 and at most 1.5' },
  { path: 'hazards.zapper.ringDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.zapper.ringSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 5, describe: 'seconds between 0 and 5' },
  { path: 'hazards.zapper.ringCooldownSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'seconds between 0 and 10' },
  { path: 'hazards.zapper.dischargesWhenHit', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'hazards.zapper.bellColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.zapper.ringColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.zapper.ringAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hazards.charge.max', check: (v) => typeof v === 'number' && v > 0 && v <= 1000, describe: 'a number above 0 and at most 1000' },
  { path: 'hazards.charge.chainAt', check: (v) => typeof v === 'number' && v >= 0 && v <= 1000, describe: 'a threshold between 0 and 1000' },
  { path: 'hazards.charge.perRingHit', check: (v) => typeof v === 'number' && v >= 0 && v <= 1000, describe: 'charge between 0 and 1000' },
  { path: 'hazards.charge.perSecondNearZapper', check: (v) => typeof v === 'number' && v >= 0 && v <= 1000, describe: 'charge per second between 0 and 1000' },
  { path: 'hazards.charge.decayPerSecond', check: (v) => typeof v === 'number' && v >= 0 && v <= 1000, describe: 'charge per second between 0 and 1000' },
  { path: 'hazards.charge.nearMeters', check: (v) => typeof v === 'number' && v >= 0 && v <= 2000, describe: 'metres between 0 and 2000' },
  { path: 'hazards.charge.chainRangeMeters', check: (v) => typeof v === 'number' && v >= 0 && v <= 2000, describe: 'metres between 0 and 2000' },
  { path: 'hazards.charge.chainJumpMeters', check: (v) => typeof v === 'number' && v >= 0 && v <= 2000, describe: 'metres between 0 and 2000' },
  { path: 'hazards.charge.chainDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 100, describe: 'hit points between 0 and 100' },
  { path: 'hazards.charge.chainMaxTargets', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 64, describe: 'a whole number of targets between 1 and 64' },
  { path: 'hazards.charge.chainSelfDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.charge.bubbleRingColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.charge.bubbleRingWidthRatio', check: (v) => typeof v === 'number' && v > 0.001 && v <= 0.4, describe: 'a fraction of the lane width above 0.001 and at most 0.4' },
  { path: 'hazards.charge.burstColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.charge.burstAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hazards.charge.burstSeconds', check: (v) => typeof v === 'number' && v >= 0.05 && v <= 5, describe: 'seconds between 0.05 and 5' },
  { path: 'hazards.foam.radiusRatio', check: (v) => typeof v === 'number' && v > 0.005 && v <= 0.3, describe: 'a fraction of the lane width above 0.005 and at most 0.3' },
  { path: 'hazards.foam.lifeSeconds', check: (v) => typeof v === 'number' && v >= 0.2 && v <= 60, describe: 'seconds between 0.2 and 60' },
  { path: 'hazards.foam.contactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.foam.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.foam.rimColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.foam.alpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hazards.foam.rimAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'hazards.rain.fallSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.rain.pushMeters', check: (v) => typeof v === 'number' && v >= 0 && v <= 2000, describe: 'metres between 0 and 2000' },
  { path: 'hazards.rain.contactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.rain.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.rain.lengthRatio', check: (v) => typeof v === 'number' && v > 0.005 && v <= 0.6, describe: 'a fraction of the lane width above 0.005 and at most 0.6' },
  { path: 'hazards.torpedo.runSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.torpedo.runMeters', check: (v) => typeof v === 'number' && v >= 0 && v <= 2000, describe: 'metres between 0 and 2000' },
  { path: 'hazards.torpedo.seekSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.torpedo.seekSeconds', check: (v) => typeof v === 'number' && v >= 0.5 && v <= 60, describe: 'seconds between 0.5 and 60' },
  { path: 'hazards.torpedo.contactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.bombfish.seekSpeedFactor', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'lane widths per second between 0 and 3' },
  { path: 'hazards.bombfish.armMeters', check: (v) => typeof v === 'number' && v >= 10 && v <= 600, describe: 'metres between 10 and 600' },
  { path: 'hazards.bombfish.fuseSeconds', check: (v) => typeof v === 'number' && v > 0.2 && v <= 15, describe: 'seconds above 0.2 and at most 15' },
  { path: 'hazards.bombfish.blastRadiusRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction of the lane width between 0 and 1' },
  { path: 'hazards.bombfish.blastDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10' },
  { path: 'hazards.bombfish.blastShakePixels', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'design pixels between 0 and 40; 0 disables the shake' },
  { path: 'hazards.bombfish.blastShakeSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 2, describe: 'seconds between 0 and 2' },
  { path: 'hazards.bombfish.stomachFuseSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.bombfish.detonationHitPoints', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.bombfish.grenadeBlastRadiusRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'hazards.jellyContactDamage', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'hit points between 0 and 10; 0 makes a jellyfish a pure slow again' },
  { path: 'hazards.slowFactor', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a number above 0 and at most 1' },
  { path: 'hazards.slowSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.health', check: (v) => isNumberTable(v) && Object.values(v as Record<string, number>).every((n) => n >= 0), describe: 'an object of hazard kind to hit points, e.g. { fish: 3, jelly: 0 }; 0 means the bullets pass through' },
  { path: 'hazards.fleeScreensPerSecond', check: (v) => typeof v === 'number' && v > 0.05 && v <= 8, describe: 'screen heights per second, above 0.05 and at most 8; 0.9 is about a second to leave the screen' },
  { path: 'hazards.fleeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1 for a creature that is leaving' },
  { path: 'hazards.crabLaunchMps', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.launchDecaySeconds', check: (v) => typeof v === 'number' && v > 0.01, describe: 'seconds above 0.01' },
  { path: 'hazards.crabLaunchScreenBonus', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.crabArmDistanceMeters', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.crabFuseSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.trashDrainPerSecond', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.trashMinGripSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.urchinDrainPerSecond', check: (v) => typeof v === 'number' && v >= 0, describe: 'hit points per second, 0 or more; 0 makes the urchin harmless once swallowed' },



  { path: 'hazards.eelShockPeriodSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'seconds above 0' },
  { path: 'hazards.eelShockSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 10, describe: 'seconds between 0 and 10; 0 disables the eel\'s loss of control' },
  { path: 'hazards.rotDigestScale', check: (v) => typeof v === 'number' && v >= 0 && v <= 2, describe: 'a multiplier between 0 and 2; 1 means the rot does not slow digestion' },
  { path: 'hazards.oilSpitChance', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a probability between 0 and 1; 0 is a permanent clog' },
  { path: 'hazards.eelShockColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.eelShockWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.6, describe: 'a stroke width ratio between 0 and 0.6' },
  { path: 'hazards.invulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  /**
   * Consumption. The two per-kind tables are checked for PRESENCE of every hazard kind rather than for any
   * particular key set, because the kinds live in `src/hazards.ts` and a new one added there without a row here
   * would otherwise make that hazard silently inedible -- a content bug with no error, which is the worst kind.
   * The loader cannot enumerate the kinds itself, so the check is that the tables agree with EACH OTHER.
   */
  {
    path: 'consumption.tierVolume',
    check: (v) => Array.isArray(v) && v.length >= 2 && v.every((n) => typeof n === 'number' && n >= 0) && (v as number[])[0] === 0,
    describe: 'an array of at least two non-negative volumes, starting at 0 (index 0 is tier 1)',
  },
  {
    path: 'consumption.mass',
    check: (v) => isNumberTable(v) && Object.keys(v).length >= 1,
    describe: 'an object of hazard kind to mass, e.g. { fish: 0.28, jelly: 0.42 }',
  },
  {
    path: 'consumption.edibleAtTier',
    check: (v) => isNumberTable(v) && Object.keys(v).length >= 1,
    describe: 'an object of hazard kind to the volume tier that can eat it',
  },
  { path: 'consumption.massEfficiency', check: (v) => typeof v === 'number' && v > 0 && v <= 2, describe: 'a number above 0 and at most 2' },
  { path: 'consumption.eatInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'consumption.marker.edibleColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'consumption.marker.widthRatio', check: (v) => typeof v === 'number' && v >= 0.01 && v <= 0.6, describe: 'a stroke width ratio between 0.01 and 0.6' },
  { path: 'consumption.marker.edibleAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'consumption.marker.blockedAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'consumption.marker.showBlocked', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'suction.radiusRatio', check: (v) => typeof v === 'number' && v > 0.02 && v < 1, describe: 'a fraction of the lane width, above 0.02 and below 1' },
  { path: 'suction.radiusPerVolume', check: (v) => typeof v === 'number' && v >= 0, describe: 'a non-negative fraction of the lane width' },
  { path: 'suction.maxRadiusRatio', check: (v) => typeof v === 'number' && v > 0.02 && v <= 1.5, describe: 'a fraction of the lane width, above 0.02 and at most 1.5' },
  { path: 'suction.pullPerSecond', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'suction.heavyRatio', check: (v) => typeof v === 'number' && v > 1, describe: 'a ratio above 1' },
  { path: 'suction.heavyFloor', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'suction.moveSpeedFactor', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction above 0 and at most 1' },
  { path: 'suction.fieldColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'suction.fieldAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'suction.fieldWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.6, describe: 'a stroke width ratio between 0 and 0.6' },
  { path: 'suction.tetherAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'suction.tetherWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.6, describe: 'a stroke width ratio between 0 and 0.6' },
  { path: 'spit.capacity', check: (v) => typeof v === 'number' && v >= 1 && v <= 12, describe: 'a whole number of items, at least 1' },
  { path: 'spit.overloadFuseSeconds', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'seconds between 0 and 60; 0 disables the over-eating mechanic' },
  { path: 'spit.overloadMoveSpeedFactor', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction above 0 and at most 1' },
  { path: 'spit.overloadSuctionFactor', check: (v) => typeof v === 'number' && v >= 1 && v <= 4, describe: 'a multiple of at least 1' },
  { path: 'spit.bulgePerItem', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.5, describe: 'a fraction between 0 and 0.5' },
  { path: 'spit.bulgeMax', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'spit.pulseHz', check: (v) => typeof v === 'number' && v > 0 && v <= 20, describe: 'a frequency above 0 and at most 20' },
  { path: 'spit.rimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'spit.panicBelowFraction', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction above 0 and at most 1' },
  { path: 'spit.panicPulseFactor', check: (v) => typeof v === 'number' && v >= 1 && v <= 6, describe: 'a multiple of at least 1' },
  { path: 'spit.speedPerSecond', check: (v) => typeof v === 'number' && v > 0 && v <= 6, describe: 'a number above 0, at most 6' },
  { path: 'spit.decaySeconds', check: (v) => typeof v === 'number' && v > 0.02, describe: 'seconds above 0.02' },
  { path: 'spit.hitRadiusRatio', check: (v) => typeof v === 'number' && v > 0.005 && v <= 0.5, describe: 'a fraction of the lane width between 0.005 and 0.5' },
  { path: 'spit.knockbackMeters', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'spit.spitInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'spit.emptyCooldownSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'spit.trailAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'spit.trailWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a ratio between 0 and 1' },
  { path: 'spit.glowAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'spit.glowRadiusRatio', check: (v) => typeof v === 'number' && v >= 1 && v <= 4, describe: 'a radius multiple of at least 1' },
  { path: 'bullets.rateTiers', check: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 8 && v.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 30), describe: 'a non-empty list of up to 8 rounds-per-second values between 0 and 30; the FIRST is what a run starts at' },
  { path: 'bullets.speedPerSecond', check: (v) => typeof v === 'number' && v > 0 && v <= 8, describe: 'lane widths per second, above 0 and at most 8' },
  { path: 'bullets.radiusRatio', check: (v) => typeof v === 'number' && v > 0.001 && v <= 0.1, describe: 'a fraction of the lane width, above 0.001 and at most 0.1' },
  { path: 'bullets.upgradeSpreadRatio', check: (v) => typeof v === 'number' && v > 0.005 && v < 0.3, describe: 'a fraction of the lane width above 0.005 and below 0.3' },
  { path: 'pickups.pulsePerSecond', check: (v) => typeof v === 'number' && v >= 0 && v <= 20, describe: 'cycles per second between 0 and 20' },
  ...[`${'skill'}`, `${'upgrade'}`].flatMap((kind) => [
    { path: `pickups.${kind}.radiusRatio`, check: (v: unknown) => typeof v === 'number' && v > 0.005 && v < 0.3, describe: 'a fraction of the lane width above 0.005 and below 0.3' },
    ...[`${'haloColour'}`, `${'coreColour'}`, `${'rimColour'}`].map((key) => ({
      path: `pickups.${kind}.${key}`,
      check: isColour,
      describe: 'a colour, either 0xrrggbb or a "#rrggbb" string',
    })),
    ...[`${'haloAlpha'}`, `${'coreAlpha'}`, `${'rimAlpha'}`].map((key) => ({
      path: `pickups.${kind}.${key}`,
      check: (v: unknown) => typeof v === 'number' && v >= 0 && v <= 1,
      describe: 'an opacity between 0 and 1',
    })),
  ]),
  { path: 'bullets.maxStreams', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 8, describe: 'a whole number of gun rows between 1 and 8' },
  { path: 'bullets.damage', check: (v) => typeof v === 'number' && v > 0, describe: 'a number of hit points above 0' },
  { path: 'bullets.lifeSeconds', check: (v) => typeof v === 'number' && v > 0.05 && v <= 10, describe: 'seconds above 0.05 and at most 10' },
  { path: 'bullets.alpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'bullets.rimAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  ...(['colour', 'rimColour'] as const).map((key) => ({
    path: `bullets.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'digest.passivePerSecond', check: (v) => typeof v === 'number' && v >= 0 && v <= 5, describe: 'a fraction per second between 0 and 5; 0 means "only while compressing"' },
  { path: 'digest.compressPerSecond', check: (v) => typeof v === 'number' && v > 0 && v <= 10, describe: 'a fraction per second above 0 and at most 10' },
  { path: 'digest.energyPerMass', check: (v) => typeof v === 'number' && v >= 0 && v <= 5, describe: 'a number between 0 and 5' },
  { path: 'digest.energyPerTier', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'digest.maxTierBonus', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10, describe: 'a whole number of tiers between 0 and 10' },
  { path: 'digest.extraHitPoints', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10, describe: 'a whole number of extra hit points between 0 and 10' },
  { path: 'digest.pulseHz', check: (v) => typeof v === 'number' && v > 0 && v <= 20, describe: 'a frequency above 0 and at most 20' },
  { path: 'digest.pulseDepth', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'digest.rimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'stomach.markerRadiusRatio', check: (v) => typeof v === 'number' && v > 0.02 && v < 0.6, describe: 'a fraction of the bubble radius, above 0.02 and below 0.6' },
  { path: 'stomach.markerOrbitRatio', check: (v) => typeof v === 'number' && v >= 0.3 && v <= 1.5, describe: 'a multiple of the bubble radius between 0.3 and 1.5' },
  { path: 'stomach.markerAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'stomach.markerMinSpreadRadians', check: (v) => typeof v === 'number' && v > 0 && v < 6.28, describe: 'an angle in radians, above 0 and below a full turn' },
  { path: 'stomach.fuseBlinkHz', check: (v) => typeof v === 'number' && v > 0 && v <= 20, describe: 'a frequency above 0 and at most 20' },
  { path: 'stomach.fusePanicSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'seconds above 0' },
  { path: 'codex.columns', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 4, describe: 'a whole number of columns between 1 and 4' },
  { path: 'codex.rows', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 6, describe: 'a whole number of rows between 1 and 6' },
  { path: 'codex.margin', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'codex.gap', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'design pixels between 0 and 40' },
  { path: 'codex.headerHeight', check: (v) => typeof v === 'number' && v >= 40 && v <= 300, describe: 'design pixels between 40 and 300' },
  { path: 'codex.footerHeight', check: (v) => typeof v === 'number' && v >= 20 && v <= 200, describe: 'design pixels between 20 and 200' },
  { path: 'codex.titleSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 48, describe: 'a font size between 8 and 48' },
  { path: 'codex.titleY', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'design pixels between 0 and 200' },
  { path: 'codex.tabHeight', check: (v) => typeof v === 'number' && v >= 10 && v <= 80, describe: 'design pixels between 10 and 80' },
  { path: 'codex.tabGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 24, describe: 'design pixels between 0 and 24' },
  { path: 'codex.tabTextSize', check: (v) => typeof v === 'number' && v >= 6 && v <= 32, describe: 'a font size between 6 and 32' },
  { path: 'codex.pageTextSize', check: (v) => typeof v === 'number' && v >= 6 && v <= 32, describe: 'a font size between 6 and 32' },
  { path: 'codex.cardRadius', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'a corner radius between 0 and 40' },
  { path: 'codex.cardFillAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'codex.cardStrokeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'codex.cardPad', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'design pixels between 0 and 40' },
  { path: 'codex.iconSize', check: (v) => typeof v === 'number' && v >= 12 && v <= 120, describe: 'design pixels between 12 and 120' },
  { path: 'codex.nameSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 40, describe: 'a font size between 8 and 40' },
  { path: 'codex.taglineSize', check: (v) => typeof v === 'number' && v >= 6 && v <= 32, describe: 'a font size between 6 and 32' },
  { path: 'codex.factSize', check: (v) => typeof v === 'number' && v >= 5 && v <= 32, describe: 'a font size between 5 and 32' },
  { path: 'codex.factLeading', check: (v) => typeof v === 'number' && v >= 6 && v <= 40, describe: 'line spacing between 6 and 40' },
  { path: 'codex.factLabelWidth', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'design pixels between 0 and 200' },
  { path: 'codex.noteSize', check: (v) => typeof v === 'number' && v >= 5 && v <= 32, describe: 'a font size between 5 and 32' },
  { path: 'codex.noteLeading', check: (v) => typeof v === 'number' && v >= 6 && v <= 40, describe: 'line spacing between 6 and 40' },
  { path: 'codex.noteBulletIndent', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'design pixels between 0 and 60' },
  { path: 'codex.buttonHeight', check: (v) => typeof v === 'number' && v >= 12 && v <= 90, describe: 'design pixels between 12 and 90' },
  { path: 'codex.buttonPad', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'codex.buttonRadius', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'a corner radius between 0 and 40' },
  { path: 'codex.buttonTextSize', check: (v) => typeof v === 'number' && v >= 6 && v <= 32, describe: 'a font size between 6 and 32' },
  ...CODEX_COLOURS.map((key) => ({
    path: `codex.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'menu.buttonWidthRatio', check: (v) => typeof v === 'number' && v > 0.1 && v < 1, describe: 'a fraction of the lane width, above 0.1 and below 1' },
  { path: 'menu.buttonMaxWidth', check: (v) => typeof v === 'number' && v >= 60 && v <= 600, describe: 'a pixel width between 60 and 600' },
  { path: 'menu.buttonHeight', check: (v) => typeof v === 'number' && v >= 20 && v <= 120, describe: 'a pixel height between 20 and 120' },
  { path: 'menu.buttonRadius', check: (v) => typeof v === 'number' && v >= 0 && v <= 60, describe: 'a corner radius between 0 and 60' },
  { path: 'menu.buttonGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'menu.primaryTextSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 48, describe: 'a font size between 8 and 48' },
  { path: 'menu.secondaryTextSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 48, describe: 'a font size between 8 and 48' },
  { path: 'menu.secondaryStrokeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'menu.buttonStrokeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  // The two selector rows on the menu: the bubble types, and the levels.
  { path: 'menu.typeRowHeight', check: (v) => typeof v === 'number' && v > 4 && v <= 200, describe: 'a number above 4 and at most 200' },
  { path: 'menu.typeRowGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'a number between 0 and 200' },
  { path: 'menu.typeRowTopGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 600, describe: 'a number between 0 and 600' },
  { path: 'menu.taglineGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'a number between 0 and 200' },
  { path: 'menu.typeTextSize', check: (v) => typeof v === 'number' && v > 4 && v <= 60, describe: 'a number above 4 and at most 60' },
  { path: 'menu.taglineSize', check: (v) => typeof v === 'number' && v > 4 && v <= 60, describe: 'a number above 4 and at most 60' },
  { path: 'menu.levelRowHeight', check: (v) => typeof v === 'number' && v > 4 && v <= 200, describe: 'a number above 4 and at most 200' },
  { path: 'menu.levelRowGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 200, describe: 'a number between 0 and 200' },
  { path: 'menu.levelRowTopGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 600, describe: 'a number between 0 and 600' },
  { path: 'menu.levelTextSize', check: (v) => typeof v === 'number' && v > 4 && v <= 60, describe: 'a number above 4 and at most 60' },
  { path: 'menu.levelNoteSize', check: (v) => typeof v === 'number' && v > 4 && v <= 60, describe: 'a number above 4 and at most 60' },
  { path: 'menu.levelMinWidthRatio', check: (v) => typeof v === 'number' && v >= 0.05 && v <= 1, describe: 'a fraction of the menu width between 0.05 and 1' },
  { path: 'menu.levelMaxWidthRatio', check: (v) => typeof v === 'number' && v > 0.05 && v <= 1, describe: 'a fraction above 0.05 and at most 1' },
  ...[
    'typeSelectedFill',
    'typeSelectedStroke',
    'typeSelectedTextColour',
    'typeIdleFill',
    'typeIdleStroke',
    'typeIdleTextColour',
    'levelSelectedFill',
    'levelSelectedStroke',
    'levelSelectedTextColour',
    'levelIdleFill',
    'levelIdleStroke',
    'levelIdleTextColour',
    'levelLockedFill',
    'levelLockedStroke',
    'levelLockedTextColour',
    'levelNoteColour',
    'levelUnlockColour',
  ].map((key) => ({
    path: `menu.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  ...[
    'primaryFill',
    'primaryPressedFill',
    'primaryTextColour',
    'secondaryFill',
    'secondaryPressedFill',
    'secondaryStroke',
    'secondaryTextColour',
    'buttonStroke',
  ].map((key) => ({
    path: `menu.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'audio.musicVolume', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity-like level between 0 and 1' },
  { path: 'audio.bulletHitVolume', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a level between 0 and 1; 0 mutes the bullet hit' },
  { path: 'audio.bulletFireVolume', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a level between 0 and 1; 0 mutes the shot' },
  { path: 'obstacles.health', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to hit points' },
  { path: 'obstacles.radius', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to a radius fraction' },
  {
    path: 'obstacles.ramVolume',
    check: (v) =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.entries(v as Record<string, unknown>).every(([, x]) => x === null || (typeof x === 'number' && x >= 0)),
    describe: 'an object of obstacle kind to a volume, or to null for "cannot be rammed at all"',
  },
  { path: 'obstacles.minGapFraction', check: (v) => typeof v === 'number' && v > 0.02 && v < 0.9, describe: 'a fraction above 0.02 and below 0.9' },
  { path: 'obstacles.projectileDamage', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'obstacles.ramVolumeThreshold', check: (v) => typeof v === 'number' && v >= 0, describe: 'a volume of 0 or more' },
  { path: 'obstacles.ramDamagePerVolume', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'obstacles.collideDamage', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'obstacles.collideInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'obstacles.netDrag', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a speed multiplier above 0 and at most 1' },
  { path: 'obstacles.netDragSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'obstacles.crateColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.crateRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.coralColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.coralRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.wallColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.wallRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.netColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.netRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.tubeColor', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.tubeRimColor', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.netMesh', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 2 && v <= 10, describe: 'a whole number of mesh lines between 2 and 10' },
  { path: 'obstacles.crackWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.5, describe: 'a stroke width ratio between 0 and 0.5' },  { path: 'obstacles.damagedDarken', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'emergence.fishPerceptionBaseMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'emergence.fishPerceptionPerVolume', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'emergence.fishFeedToSplit', check: (v) => typeof v === 'number' && v >= 2, describe: '2 or more, or nothing would ever split' },
  { path: 'emergence.fishHardCap', check: (v) => typeof v === 'number' && v >= 1, describe: '1 or more' },
  { path: 'emergence.seekBiggestRangeMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'spawning.enterSpeedMps', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'spawning.offscreenMarginRatio', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction above 0 and at most 1' },
  { path: 'spawning.bottomMarginRatio', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction above 0 and at most 1' },
  { path: 'spawning.insideMarginRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.5, describe: 'a fraction between 0 and 0.5' },
  { path: 'spawning.entryDepth', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  // --- the volatile bubble. Colours and the appearance rows have their own checks below. ---
  { path: 'angry.rage.max', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.rage.perHit', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0, or no hit would ever matter' },
  { path: 'angry.rage.decayPerSecond', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'angry.rage.decayDelaySeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'angry.charge.launchScreenSpeed', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.charge.launchLateralSpeed', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.charge.slamSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.charge.slamDamageBase', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.charge.slamRageScale', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'angry.charge.rageCostPerHit', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'angry.charge.rageCostPerBreak', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'angry.charge.slamBreaksUnrammable', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'angry.charge.defaultAimX', check: (v) => typeof v === 'number' && v >= -1 && v <= 1, describe: 'a direction between -1 and 1' },
  { path: 'angry.charge.defaultAimY', check: (v) => typeof v === 'number' && v >= -1 && v <= 1, describe: 'a direction between -1 and 1' },
  { path: 'angry.slamRadiusBonus', check: (v) => typeof v === 'number' && v >= 0 && v <= 3, describe: 'a fraction between 0 and 3' },
  { path: 'angry.burst.radiusBaseRatio', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a fraction of the lane above 0 and at most 1' },
  { path: 'angry.burst.radiusMaxRatio', check: (v) => typeof v === 'number' && v > 0 && v <= 2, describe: 'a fraction of the lane above 0 and at most 2' },
  { path: 'angry.burst.obstacleDamage', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.burst.pushImpact', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  {
    path: 'angry.burst.hazardMode',
    check: (v) =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.values(v as Record<string, unknown>).every((x) => x === 'destroy' || x === 'push'),
    describe: 'an object of hazard kind to "destroy" or "push"',
  },
  { path: 'angry.burst.waveSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.burst.waveWidthRatio', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a stroke width ratio above 0 and at most 1' },
  { path: 'angry.burst.waveColour', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'angry.gauge.widthRatio', check: (v) => typeof v === 'number' && v > 0.05 && v <= 1, describe: 'a fraction of the lane above 0.05 and at most 1' },
  { path: 'angry.overload.seconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.overload.steerFactor', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a speed multiplier above 0 and at most 1' },
  { path: 'angry.overload.radiusBonus', check: (v) => typeof v === 'number' && v >= 0 && v <= 2, describe: 'a fraction between 0 and 2' },
  { path: 'angry.overload.ramDamage', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.overload.releaseHealth', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'angry.overload.punishHits', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 20, describe: 'a whole number of hit points between 0 and 20' },
  { path: 'angry.gauge.height', check: (v) => typeof v === 'number' && v >= 2 && v <= 40, describe: 'design pixels between 2 and 40' },
  { path: 'angry.gauge.gap', check: (v) => typeof v === 'number' && v >= 0 && v <= 40, describe: 'design pixels between 0 and 40' },
  { path: 'angry.gauge.radius', check: (v) => typeof v === 'number' && v >= 0 && v <= 20, describe: 'a corner radius between 0 and 20' },
  { path: 'angry.gauge.trackAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.gauge.trackStrokeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.gauge.fillAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.gauge.tickAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.gauge.tickWidth', check: (v) => typeof v === 'number' && v >= 0 && v <= 6, describe: 'a stroke width between 0 and 6' },
  ...(['trackColour', 'trackStroke', 'tickColour'] as const).map((key) => ({
    path: `angry.gauge.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'angry.look.radius', check: (v) => typeof v === 'number' && v > 0 && v <= 4, describe: 'a multiplier above 0 and at most 4' },
  { path: 'angry.look.innerAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.rimAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.rimWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.6, describe: 'a stroke width ratio between 0 and 0.6' },
  { path: 'angry.look.glowOuterAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.glowInnerAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.glowOuterRadiusRatio', check: (v) => typeof v === 'number' && v >= 1 && v <= 4, describe: 'a radius ratio between 1 and 4' },
  { path: 'angry.look.glowInnerRadiusRatio', check: (v) => typeof v === 'number' && v >= 1 && v <= 4, describe: 'a radius ratio between 1 and 4' },
  { path: 'angry.look.innerRing', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'angry.look.innerRingAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.innerRingWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.6, describe: 'a stroke width ratio between 0 and 0.6' },
  { path: 'angry.look.sheenAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'angry.look.specularAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  // --- the menu's bubble-type selector ---
  { path: 'menu.typeRowHeight', check: (v) => typeof v === 'number' && v >= 16 && v <= 100, describe: 'a pixel height between 16 and 100' },
  { path: 'menu.typeRowGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'menu.typeRowTopGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 120, describe: 'design pixels between 0 and 120' },
  { path: 'menu.taglineGap', check: (v) => typeof v === 'number' && v >= 0 && v <= 80, describe: 'design pixels between 0 and 80' },
  { path: 'menu.typeTextSize', check: (v) => typeof v === 'number' && v >= 8 && v <= 40, describe: 'a font size between 8 and 40' },
  { path: 'menu.taglineSize', check: (v) => typeof v === 'number' && v >= 6 && v <= 32, describe: 'a font size between 6 and 32' },
  ...([
    'typeSelectedFill',
    'typeSelectedStroke',
    'typeSelectedTextColour',
    'typeIdleFill',
    'typeIdleStroke',
    'typeIdleTextColour',
  ] as const).map((key) => ({
    path: `menu.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
];

if (parsed === null || typeof parsed !== 'object') fail('the top level must be an object');

for (const rule of REQUIRED) {
  const value = readRaw(rule.path);
  if (value === undefined) fail(`"${rule.path}" is missing. It should be ${rule.describe}.`);
  if (!rule.check(value)) fail(`"${rule.path}" is ${JSON.stringify(value)}, but it should be ${rule.describe}.`);
}

/** The validated configuration. Mutating this at runtime still works, and is how live tuning is done. */
export const mech = parsed as Mechanisms;

/**
 * Every obstacle kind must have a `health` and a `radius` row, and the `ramVolume` overrides must name real kinds.
 *
 * The generic rules above can only see that these are tables of numbers. Whether they cover the KINDS is the check
 * they cannot make, and it guards a failure with no symptom: the lookups in `src/obstacles.ts` fall back to 1 hit
 * point and a 0.05 radius, so an obstacle with no row would be a weak obstacle rather than a broken one -- it would
 * place, draw, collide and break, and nobody would ever know the row was missing.
 *
 * The reverse direction is checked too, because a typo in a key (`"corral"`) is exactly as silent and rather more
 * likely.
 */
for (const table of ['health', 'radius'] as const) {
  const rows = Object.keys(mech.obstacles[table]).sort();
  const wanted = [...OBSTACLE_KINDS].sort();
  const missing = wanted.filter((k) => !rows.includes(k));
  const extra = rows.filter((k) => !(wanted as string[]).includes(k));
  if (missing.length || extra.length) {
    fail(
      `obstacles.${table} must have exactly one row per obstacle kind` +
        (missing.length ? `; missing: ${missing.join(', ')}` : '') +
        (extra.length ? `; not a kind: ${extra.join(', ')}` : ''),
    );
  }
}
{
  const rows = Object.keys(mech.obstacles.ramVolume);
  const extra = rows.filter((k) => !(OBSTACLE_KINDS as readonly string[]).includes(k));
  if (extra.length) fail(`obstacles.ramVolume names kinds that do not exist: ${extra.join(', ')}`);
}

/**
 * The two consumption tables must describe the SAME set of hazard kinds.
 *
 * This is the check the generic rules cannot make, and it guards a failure with no symptom: a hazard with a mass
 * but no `edibleAtTier` row would simply never become edible, so the mechanic would appear to work while one
 * creature silently stayed a pure threat forever. Nothing would error and nothing would look wrong.
 */
const massKinds = Object.keys(mech.consumption.mass).sort();
const tierKinds = Object.keys(mech.consumption.edibleAtTier).sort();
if (massKinds.join(',') !== tierKinds.join(',')) {
  const missingTier = massKinds.filter((k) => !tierKinds.includes(k));
  const missingMass = tierKinds.filter((k) => !massKinds.includes(k));
  fail(
    'consumption.mass and consumption.edibleAtTier must list the same hazard kinds' +
      (missingTier.length ? `; missing from edibleAtTier: ${missingTier.join(', ')}` : '') +
      (missingMass.length ? `; missing from mass: ${missingMass.join(', ')}` : ''),
  );
}

/**
 * Every named tier must exist on the ladder.
 *
 * A hazard asking for tier 6 on a five-rung ladder would be edible only if the player could reach a tier that
 * does not exist -- so it would be permanently inedible, with no error and nothing visibly wrong. The same
 * silent-content-bug shape as a missing table row, guarded the same way.
 */
for (const [kind, tier] of Object.entries(mech.consumption.edibleAtTier)) {
  if (tier < 1 || tier > mech.consumption.tierVolume.length) {
    fail(
      `consumption.edibleAtTier.${kind} is ${tier}, but consumption.tierVolume defines only ` +
        `${mech.consumption.tierVolume.length} tiers (1..${mech.consumption.tierVolume.length})`,
    );
  }
}

/**
 * Check the appearance array key by key, so a mistake names the STAGE and the KEY it is about.
 * Kept out of the generic rules above because it is the file's only COMPOSITE value: thirty values across three
 * stages, where "the appearance is invalid" would leave the owner hunting through all of them. Naming the stage
 * and the key is the whole reason a hand-edited config beats a constant, and it is what caught the last bug --
 * a stale `stages.name` rule that pointed straight at the key that had moved.
 */
const appearances = mech.stages.appearance as unknown as Record<string, unknown>[];
appearances.forEach((stage, index) => {
  for (const rule of APPEARANCE_RULES) {
    const value = stage[rule.key];
    if (value === undefined) fail(`stages.appearance[${index}].${rule.key} is missing. It should be ${rule.what}.`);
    if (!rule.ok(value)) {
      fail(`stages.appearance[${index}].${rule.key} is ${JSON.stringify(value)}, but it should be ${rule.what}.`);
    }
  }
});

/**
 * Normalise every colour to the number Pixi wants, in place.
 *
 * Both forms are accepted because JSON5 gives you the choice: `0x9fe4ff` is a plain number, and a `"#rrggbb"`
 * string is what a colour picker gives you. Neither should be a mistake, so both are converted here rather than
 * the file having to know which one the loader prefers.
 */
/**
 * Normalise a colour to the number Pixi wants.
 *
 * Both forms are accepted because JSON5 gives you the choice: `0x9fe4ff` is a plain number, and a `"#rrggbb"`
 * string is what a colour picker gives you. Neither should be a mistake, so both are converted here rather than
 * the file having to know which one the loader prefers.
 */
function normaliseColour(value: string | number, where: string): number {
  if (typeof value === 'number') return value;
  const parsed = Number.parseInt(value.slice(1), 16);
  if (!Number.isFinite(parsed)) fail(`${where} is "${value}", which is not a colour`);
  return parsed;
}

const APPEARANCE_COLOUR_KEYS = ['inner', 'rim', 'glow', 'sheen', 'specular', 'hudColor'] as const;

(mech.stages.appearance as unknown as Record<string, string | number>[]).forEach((stage, index) => {
  for (const key of APPEARANCE_COLOUR_KEYS) {
    stage[key] = normaliseColour(stage[key]!, `stages.appearance[${index}].${key}`);
  }
});

/**
 * The rage stages, checked and converted.
 *
 * Same shape of check as the growth stages above and for the same reason -- it is the file's other composite value,
 * so "the appearance is invalid" would leave the owner hunting through four rows of nine keys. The colour keys
 * differ (no `inner`, because the interior stays near-white at every rage level; see the config's comment), so the
 * list is its own rather than shared.
 */
const RAGE_APPEARANCE_RULES: { key: string; ok: (v: unknown) => boolean; what: string }[] = [
  { key: 'name', ok: (v) => typeof v === 'string' && v.length > 0, what: 'a non-empty name' },
  { key: 'minRage', ok: (v) => typeof v === 'number' && v >= 0, what: 'a rage of 0 or more' },
  { key: 'rim', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'glow', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'sheen', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'specular', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'hudColor', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'shake', ok: (v) => typeof v === 'number' && v >= 0 && v <= 0.3, what: 'a fraction between 0 and 0.3' },
  { key: 'swell', ok: (v) => typeof v === 'number' && v >= 0 && v <= 1, what: 'a fraction between 0 and 1' },
];

const RAGE_COLOUR_KEYS = ['rim', 'glow', 'sheen', 'specular', 'hudColor'] as const;

(mech.angry.appearance as unknown as Record<string, unknown>[]).forEach((stage, index) => {
  for (const rule of RAGE_APPEARANCE_RULES) {
    const value = stage[rule.key];
    if (value === undefined) fail(`angry.appearance[${index}].${rule.key} is missing. It should be ${rule.what}.`);
    if (!rule.ok(value)) {
      fail(`angry.appearance[${index}].${rule.key} is ${JSON.stringify(value)}, but it should be ${rule.what}.`);
    }
  }
  const bag = stage as unknown as Record<string, string | number>;
  for (const key of RAGE_COLOUR_KEYS) bag[key] = normaliseColour(bag[key]!, `angry.appearance[${index}].${key}`);
});

{
  const bag = mech.angry.look as unknown as Record<string, string | number>;
  bag.inner = normaliseColour(bag.inner!, 'angry.look.inner');
}

/** The burst's wave colour, converted like every other colour. */
mech.angry.burst.waveColour = normaliseColour(mech.angry.burst.waveColour as string | number, 'angry.burst.waveColour');

{
  const bag = mech.angry.gauge as unknown as Record<string, string | number>;
  for (const key of ['trackColour', 'trackStroke', 'tickColour']) {
    bag[key] = normaliseColour(bag[key]!, `angry.gauge.${key}`);
  }
}

/**
 * Every hazard kind must say what a burst does to it.
 *
 * The failure this prevents has no symptom at all: a creature missing from `hazardMode` would be quietly immune to
 * the wave, and "the burst does not clear urchins" would look like a design choice rather than a missing row. The
 * two-way check also catches a typo'd kind, which is the likelier mistake.
 *
 * It runs against the same hazard kind list the consumption tables use, so "what kinds exist" still has one answer
 * in this file.
 */
{
  const rows = Object.keys(mech.angry.burst.hazardMode).sort();
  const kinds = Object.keys(mech.consumption.mass).sort();
  const missing = kinds.filter((k) => !rows.includes(k));
  const extra = rows.filter((k) => !kinds.includes(k));
  if (missing.length || extra.length) {
    fail(
      'angry.burst.hazardMode must say what a wave does to every hazard kind' +
        (missing.length ? `; missing: ${missing.join(', ')}` : '') +
        (extra.length ? `; not a hazard kind: ${extra.join(', ')}` : ''),
    );
  }
}

/**
 * Every hazard kind must state its hit points, the same way it must state what a burst does to it.
 *
 * A missing row would read as a design choice rather than as a missing line of config: the creature would simply be
 * immune to the bullets, and nobody would be able to tell that from "this one is not shootable on purpose" -- which
 * is itself a legitimate setting, and exactly why it has to be written down as a `0` instead of left out.
 */
{
  const rows = Object.keys(mech.hazards.health).sort();
  const kinds = Object.keys(mech.consumption.mass).sort();
  const missing = kinds.filter((k) => !rows.includes(k));
  const extra = rows.filter((k) => !kinds.includes(k));
  if (missing.length || extra.length) {
    fail(
      'hazards.health must state hit points for every hazard kind (0 = immune to the bullets)' +
        (missing.length ? `; missing: ${missing.join(', ')}` : '') +
        (extra.length ? `; not a hazard kind: ${extra.join(', ')}` : ''),
    );
  }
}

/**
 * Every kind named as a charger or a shooter must be a real creature.
 *
 * The failure this prevents is quiet in both directions: a typo in `charges.kinds` means nothing ever charges and the
 * feature looks broken, and a kind that was renamed leaves a name behind that nobody notices. Neither has a symptom
 * on screen, so it has to be a boot error.
 */
{
  const kinds = Object.keys(mech.consumption.mass);
  const unknown = Object.keys(mech.charges.chargers).filter((k) => !kinds.includes(k));
  if (unknown.length) {
    fail(`charges.chargers names something that is not a hazard kind: ${unknown.join(', ')}`);
  }
}

/**
 * The rage stages must be ordered, start at 0, and stay under the maximum.
 *
 * A list out of order would make `rageStageFor` return whichever row happened to be last rather than the highest
 * threshold reached -- so a player at full rage could be drawn calm, and nothing about that failure would look like
 * a config error. Starting at 0 matters for the same reason: there has to be something to show at zero rage.
 */
{
  const rows = mech.angry.appearance;
  if (!rows.length) fail('angry.appearance must have at least one row');
  if (rows[0]!.minRage !== 0) fail(`angry.appearance[0].minRage is ${rows[0]!.minRage}, but the first row must start at 0`);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]!.minRage <= rows[i - 1]!.minRage) {
      fail(
        `angry.appearance[${i}].minRage is ${rows[i]!.minRage}, which is not above ` +
          `angry.appearance[${i - 1}].minRage (${rows[i - 1]!.minRage}); the rows must ascend`,
      );
    }
  }
  const top = rows[rows.length - 1]!.minRage;
  if (top > mech.angry.rage.max) {
    fail(`angry.appearance's last stage starts at ${top}, above angry.rage.max (${mech.angry.rage.max}) -- unreachable`);
  }
}

/**
 * Every OTHER colour in the config, converted too.
 *
 * Gathered in one list rather than converted where it is defined, because the failure this prevents is silent:
 * `marker.edibleColor` was VALIDATED as a colour but never converted, so writing it as a `"#rrggbb"` string
 * would have handed Pixi a string. A shared list makes a new colour hard to forget.
 */
for (const [where, get, set] of [
  ['consumption.marker.edibleColor', () => mech.consumption.marker.edibleColor, (v: number) => (mech.consumption.marker.edibleColor = v)],
  ['suction.fieldColor', () => mech.suction.fieldColor, (v: number) => (mech.suction.fieldColor = v)],
  ['spit.rimColor', () => mech.spit.rimColor, (v: number) => (mech.spit.rimColor = v)],
  ['digest.rimColor', () => mech.digest.rimColor, (v: number) => (mech.digest.rimColor = v)],
  ['hazards.eelShockColor', () => mech.hazards.eelShockColor, (v: number) => (mech.hazards.eelShockColor = v)],
  ['obstacles.crateColor', () => mech.obstacles.crateColor, (v: number) => (mech.obstacles.crateColor = v)],
  ['obstacles.crateRimColor', () => mech.obstacles.crateRimColor, (v: number) => (mech.obstacles.crateRimColor = v)],
  ['obstacles.coralColor', () => mech.obstacles.coralColor, (v: number) => (mech.obstacles.coralColor = v)],
  ['obstacles.coralRimColor', () => mech.obstacles.coralRimColor, (v: number) => (mech.obstacles.coralRimColor = v)],
  ['obstacles.wallColor', () => mech.obstacles.wallColor, (v: number) => (mech.obstacles.wallColor = v)],
  ['obstacles.wallRimColor', () => mech.obstacles.wallRimColor, (v: number) => (mech.obstacles.wallRimColor = v)],
  ['obstacles.netColor', () => mech.obstacles.netColor, (v: number) => (mech.obstacles.netColor = v)],
  ['obstacles.netRimColor', () => mech.obstacles.netRimColor, (v: number) => (mech.obstacles.netRimColor = v)],
] as const) {
  set(normaliseColour(get() as string | number, where));
}

/**
 * The codex page's colours, converted from the same list the validation uses.
 *
 * A loop over the key list rather than twenty-one more tuple entries, so a new colour in that block cannot be
 * validated without also being converted.
 */
{
  const bag = mech.codex as unknown as Record<string, string | number>;
  for (const key of CODEX_COLOURS) bag[key] = normaliseColour(bag[key]!, `codex.${key}`);
}

/**
 * The menu's colours, converted too.
 *
 * A second list rather than an entry in the shared one above, because these live under a different block and the
 * tuple in that loop carries a getter and a setter per colour -- eight more of those would be eight more chances to
 * copy one wrong. Same shape as the codex loop, and the same guarantee: a colour validated is a colour converted.
 */
{
  const bag = mech.menu as unknown as Record<string, string | number>;
  for (const key of [
    'typeSelectedFill',
    'typeSelectedStroke',
    'typeSelectedTextColour',
    'typeIdleFill',
    'typeIdleStroke',
    'typeIdleTextColour',
    'primaryFill',
    'primaryPressedFill',
    'primaryTextColour',
    'secondaryFill',
    'secondaryPressedFill',
    'secondaryStroke',
    'secondaryTextColour',
    'buttonStroke',
  ]) {
    bag[key] = normaliseColour(bag[key]!, `menu.${key}`);
  }
}

/** True once the config has been parsed and checked. Exposed so a probe can prove it loaded. */
export const MECHANICS_LOADED = true;








































