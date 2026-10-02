import rawText from '../config/mechanics.json?raw';

/**
 * The hand-editable mechanics configuration.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------------------------
 * Every number that shapes the game lives in `config/mechanics.json`, which is JSON with `//` comments so each
 * value can carry a Chinese explanation next to it. The point is that tuning does not require reading or
 * editing TypeScript: open the file, change a number, save, and the page reloads.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PARSING IS DONE HERE RATHER THAN WITH JSON5
 * ---------------------------------------------------------------------------------------------
 * `JSON.parse` rejects comments and trailing commas, and both are essential for a file a human edits -- a
 * per-value explanation is the whole reason this beats a TypeScript constant. A dependency would do it, and
 * this project has exactly one runtime dependency by choice, so the stripping is done here instead. It is
 * about thirty lines and it FAILS LOUDLY, which is the property that matters: a mistyped number must not
 * silently fall back to a default, or the tuning file becomes a lie.
 *
 * The import uses `?raw` so Vite hands over the file's text. That is what makes a save hot-reload: the config
 * is a real module dependency, not something fetched at runtime.
 */

/**
 * Remove `//` comments from JSON text, WITHOUT touching anything inside a string.
 *
 * A naive `replace(/\/\/.*$/gm, '')` corrupts any value containing `//` -- a URL, or a comment inside a string.
 * So this walks the text and tracks whether it is inside a string literal. Trailing commas are removed by a
 * separate pass for the same reason.
 */
function stripJsonComments(text: string): string {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      // Skip to the end of the line, keeping the newline so line numbers stay honest in error messages.
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    out += c;
  }
  return out;
}

/** Remove a comma that is followed only by whitespace and a closing bracket or brace. */
function stripTrailingCommas(text: string): string {
  return text.replace(/,(\s*[}\]])/g, '$1');
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
   * Display colour and name per stage.
   *
   * `color` is authored as "#rrggbb" strings and CONVERTED to numbers during load, in place. The declared type
   * is therefore `number[]`: by the time anything can read it, the conversion has happened.
   */
  color: number[];
  name: string[];}

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
    touchDamping: number;
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
    `config/mechanics.json is invalid: ${message}\n` +
      'The file allows // comments and trailing commas. Check the value named above.',
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
  parsed = JSON.parse(stripTrailingCommas(stripJsonComments(rawText)));
} catch (e) {
  fail(`it is not valid JSON even after comments were removed (${(e as Error).message})`);
}

if (parsed === null || typeof parsed !== 'object') fail('the top level must be an object');

const REQUIRED: { path: string; check: (v: unknown) => boolean; describe: string }[] = [
  { path: 'stages.speedMultiplier', check: (v) => Array.isArray(v) && v.length >= 2 && v.every((n) => typeof n === 'number'), describe: 'an array of at least two numbers' },
  { path: 'stages.minSpeedMultiplier', check: (v) => typeof v === 'number' && v > 0 && v <= 1, describe: 'a number above 0 and at most 1' },
  { path: 'stages.absorbToStage2', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'stages.absorbToStage3', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'stages.growInvulnerableSeconds', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'stages.color', check: (v) => Array.isArray(v) && v.every((n) => typeof n === 'string' && /^#[0-9a-fA-F]{6}$/.test(n)), describe: 'an array of "#rrggbb" strings' },
  { path: 'stages.name', check: (v) => Array.isArray(v) && v.every((n) => typeof n === 'string'), describe: 'an array of names' },
  { path: 'volume.start', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.max', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.hitCost', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'volume.absorbEfficiency', check: (v) => typeof v === 'number' && v >= 0, describe: 'a number of 0 or more' },
  { path: 'volume.laneRatio', check: (v) => typeof v === 'number' && v > 0 && v < 0.5, describe: 'a small number above 0' },
  { path: 'movement.keyboardCrossingSeconds', check: (v) => typeof v === 'number' && v > 0.05, describe: 'seconds above 0.05' },
  { path: 'movement.verticalSpeedScale', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
  { path: 'movement.touchDamping', check: (v) => typeof v === 'number' && v > 0, describe: 'a number above 0' },
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
 * Colours are authored as "#rrggbb" strings and converted to the numbers Pixi wants, in place.
 *
 * Strings rather than numbers because JSON has no `0x` literal -- the first version of the file said
 * `0x9fe4ff` and was not valid JSON at all, which the loader caught and reported by key. A hex string is also
 * what a colour picker gives you, so it can be pasted straight in.
 */
mech.stages.color = (mech.stages.color as unknown as string[]).map((value, index) => {
  const parsedColour = Number.parseInt(value.slice(1), 16);
  if (!Number.isFinite(parsedColour)) fail(`stages.color[${index}] is "${value}", which is not a colour`);
  return parsedColour;
});

/** True once the config has been parsed and checked. Exposed so a probe can prove it loaded. */
export const MECHANICS_LOADED = true;
