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
    invulnerableSeconds: number;
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
  { path: 'hazards.invulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
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
 * Check the appearance array key by key, so a mistake names the STAGE and the KEY it is about.
 *
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
const COLOUR_KEYS = ['inner', 'rim', 'glow', 'sheen', 'specular', 'hudColor'] as const;

for (const stage of mech.stages.appearance as unknown as Record<string, string | number>[]) {
  for (const key of COLOUR_KEYS) {
    const value = stage[key];
    if (typeof value === 'number') continue;
    const parsedColour = Number.parseInt(String(value).slice(1), 16);
    if (!Number.isFinite(parsedColour)) fail(`stages.appearance[].${key} is "${value}", which is not a colour`);
    stage[key] = parsedColour;
  }
}

/** True once the config has been parsed and checked. Exposed so a probe can prove it loaded. */
export const MECHANICS_LOADED = true;
