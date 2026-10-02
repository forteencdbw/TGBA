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
     * The on-screen thumb wheel: a virtual analog stick at the bottom of the lane.
     *
     * Push direction and push distance map to direction and speed, so the wheel reaches exactly the keyboard's
     * full speed at full deflection -- they share one speed constant, which means changing device does not
     * change the feel and there is no second set of speed numbers to keep in sync.
     */
    wheel: {
      radiusRatio: number;
      maxRadiusPx: number;
      bottomInset: number;
      deadZoneRatio: number;
      idleAlpha: number;
      activeAlpha: number;
    };
  };
  collectables: {
    riseMin: number;
    riseMax: number;
    riseSpeedExponent: number;
    wobbleMin: number;
    wobbleMax: number;
  };
  hazards: {
    slowFactor: number;
    slowSeconds: number;
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
    bombfishFuseSeconds: number;
    bombfishDetonationHitPoints: number;
    bombfishBlastRadiusRatio: number;
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
  /** Destructible obstacles: crates to smash and coral to squeeze past. */
  obstacles: {
    health: Record<string, number>;
    radius: Record<string, number>;
    minGapFraction: number;
    projectileDamage: number;
    ramVolumeThreshold: number;
    ramDamagePerVolume: number;
    collideDamage: number;
    collideInvulnerableSeconds: number;
    crateColor: number;
    crateRimColor: number;
    coralColor: number;
    coralRimColor: number;
    crackWidthRatio: number;
    damagedDarken: number;
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
  };
  emergence: {
    fishPerceptionBaseMeters: number;
    fishPerceptionPerVolume: number;
    fishFeedToSplit: number;
    fishHardCap: number;
    seekBiggestRangeMeters: number;
  };
  level: {
    scrollSpeed: number;
  };
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

const REQUIRED: { path: string; check: (v: unknown) => boolean; describe: string }[] = [
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
  { path: 'movement.wheel.radiusRatio', check: (v) => typeof v === 'number' && v > 0.03 && v < 0.45, describe: 'a fraction of the lane width, above 0.03 and below 0.45' },
  { path: 'movement.wheel.maxRadiusPx', check: (v) => typeof v === 'number' && v >= 30, describe: 'a pixel radius of at least 30' },
  { path: 'movement.wheel.bottomInset', check: (v) => typeof v === 'number' && v >= 0, describe: 'a non-negative number of design pixels' },
  { path: 'movement.wheel.deadZoneRatio', check: (v) => typeof v === 'number' && v >= 0 && v < 0.6, describe: 'a fraction of the wheel radius, below 0.6' },
  { path: 'movement.wheel.idleAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'movement.wheel.activeAlpha', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity between 0 and 1' },
  { path: 'collectables.riseMin', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'collectables.riseMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.riseMin') as number), describe: 'at least riseMin' },
  { path: 'collectables.riseSpeedExponent', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'collectables.wobbleMin', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'collectables.wobbleMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.wobbleMin') as number), describe: 'at least wobbleMin' },
  { path: 'hazards.slowFactor', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a number above 0 and at most 1' },
  { path: 'hazards.slowSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.crabLaunchMps', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.launchDecaySeconds', check: (v) => typeof v === 'number' && v > 0.01, describe: 'seconds above 0.01' },
  { path: 'hazards.crabLaunchScreenBonus', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.crabArmDistanceMeters', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'hazards.crabFuseSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.trashDrainPerSecond', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.trashMinGripSeconds', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'hazards.urchinDrainPerSecond', check: (v) => typeof v === 'number' && v >= 0, describe: 'hit points per second, 0 or more; 0 makes the urchin harmless once swallowed' },
  { path: 'hazards.bombfishFuseSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'seconds, 0 or more; 0 makes a swallowed bomb fish inert' },
  { path: 'hazards.bombfishDetonationHitPoints', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of hit points, 0 or more' },
  { path: 'hazards.bombfishBlastRadiusRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 1.5, describe: 'a fraction of the lane width between 0 and 1.5; 0 makes its ammunition an ordinary pellet' },
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
  { path: 'audio.musicVolume', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'an opacity-like level between 0 and 1' },
  { path: 'obstacles.health', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to hit points' },
  { path: 'obstacles.radius', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to a radius fraction' },
  { path: 'obstacles.minGapFraction', check: (v) => typeof v === 'number' && v > 0.02 && v < 0.9, describe: 'a fraction above 0.02 and below 0.9' },
  { path: 'obstacles.projectileDamage', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'obstacles.ramVolumeThreshold', check: (v) => typeof v === 'number' && v >= 0, describe: 'a volume of 0 or more' },
  { path: 'obstacles.ramDamagePerVolume', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'obstacles.collideDamage', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'obstacles.collideInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'obstacles.crateColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.crateRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.coralColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.coralRimColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'obstacles.crackWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.5, describe: 'a stroke width ratio between 0 and 0.5' },  { path: 'obstacles.damagedDarken', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'emergence.fishPerceptionBaseMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'emergence.fishPerceptionPerVolume', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'emergence.fishFeedToSplit', check: (v) => typeof v === 'number' && v >= 2, describe: '2 or more, or nothing would ever split' },
  { path: 'emergence.fishHardCap', check: (v) => typeof v === 'number' && v >= 1, describe: '1 or more' },
  { path: 'emergence.seekBiggestRangeMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'level.scrollSpeed', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
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
  ['obstacles.crateColor', () => mech.obstacles.crateColor, (v: number) => (mech.obstacles.crateColor = v)],
  ['obstacles.crateRimColor', () => mech.obstacles.crateRimColor, (v: number) => (mech.obstacles.crateRimColor = v)],
  ['obstacles.coralColor', () => mech.obstacles.coralColor, (v: number) => (mech.obstacles.coralColor = v)],
  ['obstacles.coralRimColor', () => mech.obstacles.coralRimColor, (v: number) => (mech.obstacles.coralRimColor = v)],
] as const) {
  set(normaliseColour(get() as string | number, where));
}

/** True once the config has been parsed and checked. Exposed so a probe can prove it loaded. */
export const MECHANICS_LOADED = true;
