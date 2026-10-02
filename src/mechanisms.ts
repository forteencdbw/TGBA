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
export const OBSTACLE_KINDS = ['crate', 'coral', 'wall', 'net'] as const;

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
  { path: 'obstacles.netMesh', check: (v) => typeof v === 'number' && Number.isInteger(v) && v >= 2 && v <= 10, describe: 'a whole number of mesh lines between 2 and 10' },
  { path: 'obstacles.crackWidthRatio', check: (v) => typeof v === 'number' && v >= 0 && v <= 0.5, describe: 'a stroke width ratio between 0 and 0.5' },  { path: 'obstacles.damagedDarken', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction between 0 and 1' },
  { path: 'emergence.fishPerceptionBaseMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'emergence.fishPerceptionPerVolume', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'emergence.fishFeedToSplit', check: (v) => typeof v === 'number' && v >= 2, describe: '2 or more, or nothing would ever split' },
  { path: 'emergence.fishHardCap', check: (v) => typeof v === 'number' && v >= 1, describe: '1 or more' },
  { path: 'emergence.seekBiggestRangeMeters', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'level.scrollSpeed', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
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
