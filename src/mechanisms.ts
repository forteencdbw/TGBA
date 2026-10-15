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
  glowInnerAlpha: number;
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
  /**
   * The glow: one disc, no outer ring.
   *
   * There used to be two -- 1.55R and 1.18R -- and the outer one is gone because it is bigger than the collision
   * radius the bubble actually has. A player who reads its edge as their own boundary misjudges every graze they
   * attempt, and the fix for a wrong boundary is to remove it, not to shrink or dim it. The inner ring's 18%
   * overhang reads as a highlight in dark water rather than as a silhouette, so it stays.
   */
  glow: number;
  glowInnerAlpha: number;
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

/**
 * One animation as the config writes it, and the shape a creature's art points at for its idle, charge or death state.
 *
 * `framesPerSecond` and `maxSeconds` are both limits and the SHORTER one wins: the frame rate says how the animation should
 * read, and the ceiling says how long a state may hold the screen whatever the config says. A four-frame sheet at 4 fps is a
 * second; the same sheet at 0.5 fps is a creature frozen between two poses, which is what the ceiling is for.
 *
 * The frame INDEX is computed in exactly one place (`animationFrameAt` in `src/assets.ts`), so the idle loop, the hold on the
 * last frame of a death, and the cull that waits for a death to finish cannot disagree about how long an animation is.
 */
export interface AssetAnimation {
  /** One name per frame: a `{n}` pattern expanded to `1..count`, or the list of names itself. */
  frames: string | string[];
  /** How many frames a pattern expands to. Ignored when `frames` is a list. */
  count?: number;
  framesPerSecond: number;
  maxSeconds: number;
  /** Play once and hold the last frame rather than looping. For a death. */
  once?: boolean;
}

/**
 * The look and the timing of one kind of FLOATING NUMBER.
 *
 * One shape for every kind of number that drifts up from where something happened, because they are one mechanism: the
 * score popup and the damage popup differ only in what they say and how loud they say it. Two copies of these thirteen
 * fields would be two places to fix when the rise curve is wrong.
 */
export interface PopupStyle {
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
  /** Ceiling on popups of this style in flight: a guard against a loop, not a budget to spend. */
  max: number;
}

/**
 * One boss's complete dossier: where it holds station, what it is made of, and how it attacks.
 *
 * Split out of `Mechanisms.hazards` when the boss stopped being one creature. The six rows in `hazards.bosses` are
 * each one of these, and `hazards.boss` -- the tombstone -- is the seventh.
 */
export interface BossDossier {
  /**
   * Where it holds station above the player: a CEILING in metres, a fraction of the visible band, and a floor.
   *
   * All three are needed. The ceiling stops a huge window putting the fight absurdly far away, the ratio is
   * what keeps the boss ON SCREEN (the visible band shrinks as the window gets wider and shorter), and the floor
   * stops a short window putting it in the player's lap.
   */
  holdMeters: number;
  holdBandRatio: number;
  holdMinMeters: number;
  /** Lateral patrol: amplitude as a fraction of the lane width, and the period in seconds. */
  patrolAmplitude: number;
  patrolPeriodSeconds: number;
  /** How fast it tracks the player sideways, in lane widths per second. Kept below the player's own speed. */
  seekSpeedFactor: number;
  /** Body radius as a fraction of the lane width. Large on purpose: this is the level's answer, not another fish. */
  radiusRatio: number;
  colour: number;
  eyeColour: number;
  armourColour: number;
  weakPointWidthRatio: number;
  hitFlashColour: number;
  /** Intensity of the DRAWN body's flash, 0..1. The sprite path uses `hazardArt.*.spriteFlashScale` instead. */
  hitFlashStrength: number;
  /**
   * What multiplies `hitKnockback.meters` when the BOSS is shot.
   *
   * A per-kind knob rather than a table, because it is the only creature that does not ride the current: everything
   * else is shoved inside a drift it was already making, while a shove on the boss moves a hovering giant -- the same
   * metres read as a much bigger event, which is why its default is half.
   */
  knockbackScale: number;
  /**
   * The claw swing: how often it happens, when in the animation the grit leaves the claw, and where it goes.
   *
   * The boss is the only creature whose attack is an ANIMATION first and a hitbox second. Every other threat here
   * announces itself with drawn geometry (a bow, a telegraph arc, a brightening plume); the boss announces this one
   * by swinging its claw, which is why the moment the grit is released is expressed as a FRAME of `boss-attack`
   * rather than as a number of seconds. Two clocks would be two things to keep in agreement, and the art is the one
   * the player is actually reading.
   */
  /** Seconds between the end of one swing and the start of the next. */
  attackEverySeconds: number;
  /** Which frame of `animations.boss-attack` throws the grit -- the frame where the claw has just snapped shut. */
  attackSprayFrame: number;
  /** How many pieces of grit leave the claw in one swing. */
  attackSprayCount: number;
  /** The width the pieces are spread over, as a fraction of the lane, centred on the player's aim point. */
  attackSpraySpread: number;
  /** How far the grit takes to reach its target, in seconds. This is the dodge window. */
  attackSpraySeconds: number;
  /** Where the claw is, relative to the boss's own radius: +x is its front, -y is below it. */
  attackSprayFromX: number;
  attackSprayFromY: number;
  /** Bow of each piece's curve, as a fraction of the distance travelled. 0 is a straight line. */
  attackSprayBowRatio: number;
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
    eaten: number;
    boss: number;
    /**
     * The floating numbers that appear where points were earned.
     *
     * Presentation rather than rules, and a sibling of the prices rather than a separate group: those four are what a
     * run is worth, and these are how the player finds out that something just paid.
     */
    popups: PopupStyle;
  };
  /**
   * The floating numbers that appear where an enemy was HIT, saying how much that shot took off it.
   *
   * The same field draws both (see `src/numberPopups.ts`); this is the second style. Its own group rather than a row
   * inside `bullets`, because this is not a property of the gun -- it is the other half of the hit feedback that
   * `hitFlash` and `hitKnockback` already provide, and it is the only one of the three that says HOW MUCH.
   *
   * Smaller and shorter-lived than a score number on purpose. A kill is an event; a hit is a rate, and the gun lands
   * several a second, so these have to be readable at a glance without becoming the loudest thing on the screen.
   */
  damagePopups: PopupStyle;
  /**
   * Where the depth gauge sits, and how far in from the edge.
   *
   * A SIDE rather than two sets of coordinates, because the gauge and its landmark labels are one object: the labels
   * are anchored to the bar's inner edge, so moving the bar has to move them, and a config that could put the two in
   * different places would be a config that can put a label off the lane.
   */
  hud: {
    /** The boss health bar across the top, shown only while a boss is alive. `widthRatio` is a fraction of the LANE. */
    bossBar: {
      y: number;
      /** How much of the lane's width the bar spans. Measured against the lane, like the gauges below it. */
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
    /** The score readout, pinned to the top-left corner and on screen for the whole run. */
    score: {
      x: number;
      y: number;
      size: number;
      colour: number;
      alpha: number;
    };
    /**
     * The player's own health bar: the bottom-left corner, a fixed-length track plus a `3/5` label.
     *
     * Fixed LENGTH rather than fixed scale, because the two routes' health scales differ by ten times (a
     * non-growing route holds a flat 5, a growing one reaches 50). The track carries the proportion and the label
     * carries the absolute number, so "how much have I lost" and "how much is left" each get one channel.
     */
    healthBar: {
      /** From the lane's left edge, and from the canvas' bottom edge, in design pixels. */
      x: number;
      y: number;
      /** The track's length as a fraction of the lane, and its height in design pixels. */
      widthRatio: number;
      height: number;
      trackColour: number;
      trackAlpha: number;
      fillColour: number;
      fillAlpha: number;
      /** The fill swaps to this below `lowThreshold`, so "nearly out" is readable without reading the number. */
      lowColour: number;
      lowThreshold: number;
      borderColour: number;
      borderAlpha: number;
      /** The `3/5` label: size, colour, and its gap from the track's right end. */
      labelSize: number;
      labelColour: number;
      labelGap: number;
    };
    /**
     * The screen cracks, while the bubble is nearly broken.
     *
     * Drawn, not sourced: every non-creature thing in this game is Graphics (the water, the parallax, the specks,
     * the HUD), and cracks are a shape that follows the border -- a fixed-density bitmap would have to stretch
     * between a phone and a desktop, which is exactly what the art pipeline's one-density rule forbids.
     *
     * The colour is NOT here: the cracks take the current route's `hudColor`, so they are the same colour as the
     * bubble they are about.
     */
    brokenScreen: {
      /**
       * The health fraction below which cracks appear, and the one below which they stop growing.
       *
       * Two numbers rather than one because the warning has a beginning and a ceiling, and they are not the same event:
       * at 50% the screen says "you are in trouble", and by 30% it has said everything it is going to say. Below
       * `maxThreshold` the picture is FROZEN -- the player has 30% of their health left to spend and needs to see where
       * they are, not a screen that keeps getting busier.
       *
       * `maxThreshold` is deliberately equal to `healthBar.lowThreshold`, so the bar turning red lands exactly on the
       * cracks maxing out -- the red is "this is as bad as it gets" rather than a second, vaguer alarm.
       */
      threshold: number;
      maxThreshold: number;
      /** How far inward a crack may reach, as a fraction of the SHORTER screen side. */
      reachRatio: number;
      /** How many cracks at `threshold`, and how many at `maxThreshold`. Interpolated by strength. */
      crackCountNear: number;
      crackCountDeep: number;
      branchChance: number;
      /** How far along the main crack a branch leaves from, 0 at the wall and 1 at the tip. */
      branchAtRatio: number;
      branchLengthRatio: number;
      /** The WIDEST a branch may open, in radians. The magnitude is randomised between 75% and 100% of it. */
      branchAngleRadians: number;
      /** Polyline points per crack, how much each segment's length may vary, and how far it may turn (radians). */
      segmentsPerCrack: number;
      segmentJitter: number;
      segmentTurn: number;
      width: number;
      glowWidthRatio: number;
      glowAlphaRatio: number;
      alphaNear: number;
      alphaDeep: number;
      /** 0 re-rolls the shape every time the bubble enters the danger zone; anything else fixes it. */
      seed: number;
      /**
       * The four edge gradients: a second layer beside the cracks, and they say different things.
       *
       * The cracks say WHERE something broke (the lane's walls, in the bubble's own colours). This says THE PICTURE
       * IS CLOSING IN: one band per side, fading toward the centre, pulsing at a fixed rate. A fixed blue on
       * purpose -- two voices saying the same sentence cancel each other out.
       *
       * Also measured against the LANE, like the cracks: the two vertical bands sit on its walls and the two
       * horizontal ones span its width. See `buildBrokenVignette`.
       */
      vignette: {
        colour: number;
        alpha: number;
        /** How far each side reaches in: a fraction of the LANE's width for the sides, of the screen's height for top and bottom. */
        reachRatio: number;
        /** Pulses per second, and how deep the pulse goes (0 = steady, 1 = fully off at the trough). */
        pulseHz: number;
        pulseDepth: number;
      };
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
    max: number;
    laneRatio: number;
    /**
     * The health-fraction bands that decide a GROWING route's volume, low to high.
     *
     * Re-evaluated at two moments only -- the start of a level, and the pick of the route itself -- because a
     * hitbox that shrinks mid-fight invalidates the "how close can I get" judgement the player just made.
     */
    healthBands: { minRatio: number; volume: number }[];
    /** Hit points restored per point of a bubble's volume, for the route that eats its health back. */
    healthPerVolume: number;
  };
  /**
   * The hit points of a route that does NOT grow.
   *
   * A second health economy, and it exists for exactly the routes whose bubble never changes size: a bubble that
   * stays the same size cannot express "I am nearly dead" through its size, so the number needs its own home. The
   * growth routes keep `volume` as their health, where it belongs. See `config/mechanics.json5`.
   */
  health: {
    /** Starting maximum, in hit points. */
    start: number;
    /** What one 「修复血条」 pick restores. */
    healPerPick: number;
    /** What one 「血上限」 pick adds to the maximum. */
    maxPerPick: number;
    /**
     * The floor under one hit, as a fraction of the damage: `max(damage × this, damage - defense)`.
     *
     * Not "at least 1 point", which on a 100-point pool is barely a floor at all -- a 20-damage fish against a
     * player with 30 defence would cost 1 each, which is invulnerability with extra steps. This says DEFENCE MAY
     * EAT AT MOST NINETY PERCENT.
     */
    minDamageRatio: number;
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
   * The graze: a charge that passed close enough to hurt without hurting.
   *
   * One block for the whole mechanic because the mechanic is one sentence: a radius that is the contact
   * radius times a multiplier, a reward that arrives on the frame it happens, and a slow-motion beat that
   * is the dodge's own helping hand. See `config/mechanics.json5` for the reasoning behind each number.
   */
  graze: {
    /** The graze circle, as a multiple of the CONTACT radius (the player's plus the creature's). */
    radiusMultiplier: number;
    /** The whole world's timescale while the beat holds: 0.25 is a quarter speed. */
    slowFactor: number;
    /** How long the hard slow lasts, in real seconds. */
    slowSeconds: number;
    /** How long the ease back to full speed takes after that. */
    recoverSeconds: number;
    /**
     * The flash on the bubble's own edge, on the frame the graze lands.
     *
     * The third piece of the same feedback and the only one that lives ON the player: the word in the water says
     * what happened, the slow motion says look at it, and this says it was YOU that nearly got hit. Deliberately a
     * flash and not a standing circle -- a graze range drawn on screen would turn dodging into reading a gauge.
     */
    playerFlash: {
      seconds: number;
      colour: number;
      alpha: number;
      /** Stroke width, as a fraction of the bubble's radius. */
      widthRatio: number;
    };
  };
  /** The "擦边！！" text, in the water where the near-miss happened. See `graze` beside it. */
  grazePopups: PopupStyle;
  /**
   * Mutations: the in-run growth ladder.
   *
   * The XP economy (what pays, how fast the ladder climbs), the resume grace after a pick, and the HUD
   * gauge's looks. The pool itself is content and lives in `src/mutations.ts` beside the skills.
   */
  mutation: {
    /** Mutation points per second of simply being alive. The slowest source, by design. */
    autoPerSecond: number;
    /** Points per event, keyed by `XpEvent` in `src/xp.ts`. */
    gain: {
      drivenOff: number;
      eaten: number;
      graze: number;
      bulletGraze: number;
      pointBlank: number;
      defuse: number;
      boss: number;
    };
    /** The ladder: level N costs first × growth^(N-1). */
    first: number;
    growth: number;
    /** Invulnerability granted when the pick closes and the world resumes. */
    resumeInvulnerableSeconds: number;
    /**
     * The point-blank test: a gun kill inside contact-radius × this counts as 贴脸.
     *
     * Above 1, so "point blank" is a little wider than "touching" -- the bullet has to come from
     * somewhere, and the ring between the two is where the creature can still reach you.
     */
    pointBlankRadius: number;
    /** The three small skill callouts (擦 / 贴脸 / 拆弹) share one style, smaller than the graze's word. */
    callouts: PopupStyle;
    /** How much one pick of each numeric card is worth. The cards' text is content, in `src/mutations.ts`. */
    pool: {
      damagePerPick: number;
      steerPerPick: number;
      ascentPerPick: number;
      /** Extra DEFENSE per 「护甲」 pick, and per 「厚甲」 pick. See `src/health.ts` for the formula. */
      defensePerPick: number;
      defenseBigPerPick: number;
      invulnSecondsPerPick: number;
      ragePerPick: number;
      suctionPerPick: number;
      eatInvulnSecondsPerPick: number;
      /** The routes' own cards, below. Zero disables a card's growth without touching its text. */
      appetiteTiersPerPick: number;
      burstRadiusPerPick: number;
      rageDecayReductionPerPick: number;
      bulletSpeedPerPick: number;
      bulletRadiusPerPick: number;
      bulletRangePerPick: number;
      /**
       * The two cards that make a round's damage depend on the round's own state. See the config for the two
       * formulas; the reason there are two rates rather than one is that they read different things -- one the
       * round's growth in flight, the other the run's stacked speed bonus.
       */
      sizeDamagePerPick: number;
      speedDamagePerPick: number;
    };
    /** The gauge under the resource line. The same knobs the rage gauge has. */
    gauge: {
      widthRatio: number;
      height: number;
      gap: number;
      radius: number;
      trackColour: number;
      trackAlpha: number;
      trackStroke: number;
      trackStrokeAlpha: number;
      fillColour: number;
      fillAlpha: number;
      readyStroke: number;
      readyStrokeAlpha: number;
      labelSize: number;
      labelColour: number;
    };
  };
  /** Parallax: four layers of drifting motes, far to near, each at its own multiple of the world's scroll. */
  background: {
    /** One tile's height in screen heights. Above 1, so wrapping cannot leave a gap at an edge. */
    tileScreens: number;
    /** A multiplier on every layer's mote count -- the one dial for "how busy is the water". */
    countScale: number;
    /**
     * The layers, FARTHEST FIRST.
     *
     * Order is the drawing order as well as the meaning: the first row is painted first and therefore sits behind the
     * rest. `speedFactor` is a multiple of the level's own scroll; the last row is conventionally 1.0, the layer that
     * travels with the world.
     */
    layers: {
      speedFactor: number;
      count: number;
      sizeRatio: number;
      colour: number;
      alpha: number;
    }[];
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
        /**
         * Cadence. **0 is legal and means "this creature never fires on a timer"** -- the puffer's spikes
         * exist as a row (speed, shape, size) while their WHEN is the hit that answers, not the clock.
         */
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
        /**
         * This kind's round radius, as a fraction of the lane width. Falls back to the shared `radiusRatio`
         * when a row leaves it out; the pistol shrimp's cavitation bubble is the one that does not.
         */
        radiusRatio?: number;
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
    /** Per-kind radius as a fraction of the lane width: collision, drawing and the codex card all read this. */
    radius: Record<string, number>;
    /**
     * The boss: the one creature that does not belong to the current.
     *
     * It holds station above the player instead of drifting, so it cannot be outrun -- the fight ends when one of the
     * two of them does. Its health, name and arrival point are the LEVEL's (see `BossSpec`), because those are level
     * design; everything here is shared mechanics, and shared mechanics are now per-kind like every other creature's.
     */
    boss: BossDossier;
    /**
     * 六个 BOSS，一个 kind 一份完整档案。**键就是 hazard kind**，和 `hazards.radius`、`hazards.health`、
     * `hazardArt` 同一个写法。
     *
     * 这里从前只有一个 `hazardArt` 那样的共享档案加一个"关卡自己给颜色"的 `boss.colour`，结果是六场 BOSS 战里
     * 有五场是同一场画了六遍：决定它怎么动、怎么贴、怎么开火的每一个数都是共享的。拆开之后，一只 BOSS 的手感
     * 终于有地方可写——而**第一版六份值是一模一样的**，那是有意的：拆分必须先证明"行为没变"，再谈各不相同。
     */
    bosses: Record<string, BossDossier>;
    /** LEVEL 1's signature: the black smoker's lethal column. */
    vent: {
      /** The rock standing inside the lane against a wall. Always lethal, whether or not the plume is up. */
      baseRadiusRatio: number;
      /** Half-width of the equal-width capsule the plume's hitbox is; the drawing is the same band. */
      jetHalfWidthRatio: number;
      /**
       * How far the plume reaches, as a multiple of the lane width, PER AIM.
       *
       * Three keys rather than one because the two requirements cannot both be met by a single number: `flat` has to
       * reach past the far wall to span the lane, and a diagonal's horizontal reach is `length / sqrt(2)`, so
       * spanning would need it to be longer still -- which would close the lane for the diagonals too. See the config.
       */
      jetLengthRatio: { up: number; flat: number; down: number };
      /** The angle `up`/`down` make with the horizontal, in radians. 45 degrees by default. */
      diagonalRadians: number;
      /** Seconds of quiet after the vent appears before its cycle starts. A level may override it per vent. */
      startDelaySeconds: number;
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
      colour: number;
      rimColour: number;
      alpha: number;
      rimAlpha: number;
    };
    rain: {
      fallSpeedFactor: number;
      pushMeters: number;
      colour: number;
      lengthRatio: number;
    };
    torpedo: {
      runSpeedFactor: number;
      runMeters: number;
      seekSpeedFactor: number;
      seekSeconds: number;
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
    };
    slowFactor: number;
    slowSeconds: number;
    /**
     * How many bullet hits each kind of creature takes before it flees.
     *
     * Zero means the bullets pass through it: the default is that only fish are shootable, so that driving a
     * chaser off is a thing the player can do without every creature in the water becoming a target. Depleting it
     * does NOT kill the creature -- see `fleeSpeedFactor` and `HazardField`'s flee state.
     */
    health: Record<string, number>;
    /**
     * What each kind costs the player, in hit points, when it touches them.
     *
     * A second table beside `health` rather than a field inside each creature's own block, because the two answer
     * different questions: `health` is how many bullets drive it off, this is what it does to you. One table is
     * what makes "how much does a shark hurt, versus a tuna" readable at a glance -- scattered across twenty
     * blocks it was a thing you had to already know.
     *
     * The player's DEFENSE comes straight out of these (`max(damage × minDamageRatio, damage - defense)`), so
     * these numbers are also the scale the defence cards are priced against. See `src/health.ts`.
     */
    contactDamage: Record<string, number>;
    /**
     * Per-kind multiplier on the HITBOX, on top of the shape the sprite gives it. Absent means 1.
     *
     * A partial map, and the only table in this file that may be empty -- empty is the meaningful default ("nothing is
     * overridden"), where an empty `health` or `contactDamage` would be a table nobody filled in.
     *
     * Collision only: the art is sized by `radius × hazardArt.<kind>.scale`, which is what decides how big a creature
     * is DRAWN. This decides how much of that drawing can touch you, which is the one thing a picture cannot be asked
     * about -- a tail does not need to be lethal, and a small thing that behaves aggressively may deserve more than
     * its picture.
     */
    hitboxScale: Record<string, number>;
    /** How fast a creature that has had enough leaves, in SCREEN HEIGHTS per second: see the config's note. */
    fleeScreensPerSecond: number;
    /** How visible a creature is while it leaves, 0..1. The same drawing, dimmed, rather than a second palette. */
    fleeAlpha: number;
    /**
     * The super-school's Boids: how a block with `boids: true` swims. See the config's note at `hazards.boids`.
     *
     * Every length is a lane fraction and every rate is per second, so the same numbers are the same school on every
     * display.
     */
    boids: {
      /** Radius of the cloud a school is born in, around its leader's first point. */
      spawnSpread: number;
      /** The furthest a neighbour can be and still count, for alignment and cohesion (lane fraction). */
      neighbourRadius: number;
      /** How many of the nearest fish alignment and cohesion listen to. */
      neighbours: number;
      /** Neighbours closer than this push apart. */
      separationRadius: number;
      separationAccel: number;
      alignmentRate: number;
      cohesionAccel: number;
      /** How much harder cohesion pulls across the neighbours' heading than along it. 1 = the same, and the school is round. */
      cohesionAcrossRatio: number;
      /** How far the invisible leader reaches (lane fraction), and how hard it turns the velocity of the fish inside (per second). */
      leaderReach: number;
      leaderSteer: number;
      /** The only position term: past this distance from the leader (lane fraction) a weak pull begins, capped at `tetherAccel`. */
      leaderTether: number;
      tetherAccel: number;
      /** The leader waits for its school: it needs this many real fish in reach to walk at full pace, and never slows below this share of it. */
      leaderWantFish: number;
      leaderAllowAhead: number;
      leaderWaitFloor: number;
      /** The most the leader speeds up, as a multiple of its own pace, to take the front back when fish have got ahead of it. */
      leaderCatchUp: number;
      minSpeed: number;
      maxSpeed: number;
      /** The cap on the sum of all four, so a crowd cannot fling a fish. */
      maxAccel: number;
      /** A real fish's size relative to an ordinary one: the picture AND the hitbox. */
      scale: number;
      /** Each fish's own share of the leader's speed: 1 +/- this. */
      speedJitter: number;
      /** The leader's sideways snaking: its largest offset (lane fraction) and its main period. */
      wobbleAmplitude: number;
      wobbleSeconds: number;
      /** Depth: how thick the school is for separation (lane fraction), how far the far ones are dimmed, and to what. */
      depthRange: number;
      depthDim: number;
      depthTint: number;
      /**
       * Background schools (`layer: 'back'`): what a block's `distance` -- 0 near, 1 far -- turns into. Each pair is the value at
       * distance 0 and at distance 1, and everything between is a straight line; none of them changes how the school MOVES.
       */
      back: {
        /** Size relative to an ordinary fish, at the near end and the far end. */
        scaleNear: number;
        scaleFar: number;
        /** How much of `tint` the sprite is multiplied by, 0..1, at the near end and the far end. */
        dimNear: number;
        dimFar: number;
        /** The cold colour the far end is multiplied toward. */
        tint: number;
      };
    };
    /**
     * The crab, one block.
     *
     * The first creature to be grouped this way -- see the config's note at `hazards.crab`. Its four numbers used to be
     * flat keys on this object between the cross-creature ones, which is how a creature's facts end up spread across a
     * file: `crabLaunchMps` two lines from `trashDrainPerSecond`, and the fifth of them (`apexSeconds`) not in the file
     * at all but written into `src/hazards.ts` as a literal.
     */
    crab: {
      /** How close the crab must be to arm its fuse. */
      armDistanceMeters: number;
      /** Seconds from armed to detonation. */
      fuseSeconds: number;
      /** Launch speed imparted to the bubble, world metres per second. */
      launchMps: number;
      /** Seconds for that launch to reach the top of its arc. */
      apexSeconds: number;
      /** What the launch distance is multiplied by, on top of the world impulse. See the config's note. */
      launchScreenBonus: number;
    };
    launchDecaySeconds: number;
    /**
     * The trash bag: one block.
     *
     * These two are a PAIR -- a full grip deals `drainPerSecond * minGripSeconds` -- which is the argument for keeping
     * them in one place rather than as two flat keys whose relationship is a comment.
     */
    trash: { drainPerSecond: number; drainPerHit: number; minGripSeconds: number };
    /**
     * The eel: how long its BOLTS cost the player their steering.
     *
     * `boltShockSeconds` is its rounds landing on the player -- a loss of control the player dodges rather than
     * eats, now that swallowing is instant. At 0 that source alone is disabled.
     */
    eel: {
      boltShockSeconds: number;
      shockColor: number;
      shockWidthRatio: number;
    };
    /** The rot: what it multiplies the digestion rate by while it is inside. 1 means no effect. */
    /** The oil: the chance a spit attempt gets it out. 0 is a permanent clog, 1 is an ordinary item. */
    /**
     * THE GUNNERS' own knobs. Their bullets live in `enemyBullets.shooters`; these are the creature
     * halves -- how they ride the current, and each one's signature rule.
     */
    /** 射水鱼: only its drift. Its whole personality is in the shooter row. */
    archer: { driftFactor: number };
    /** 手枪虾: the elite loiters. */
    pistol: { driftFactor: number };
    /** 刺魨: the answer -- every hit taken is paid back in a ring of spikes, on a cooldown. */
    puffer: {
      driftFactor: number;
      countersWhenHit: boolean;
      counterCooldownSeconds: number;
      spikeCount: number;
    };
    /** 海星: the rosette -- how many directions, and how far it turns with every volley. */
    starfish: {
      driftFactor: number;
      volleyCount: number;
      volleySpinRadians: number;
    };

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
    /** What running into a collectable too big to eat costs, before defence. See the config's note. */
    bumpDamage: number;
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
  /**
   * The small bubbles the player's bubble fires on its own, continuously.
   *
   * The gun is the only projectile now that spitting is gone: ordinary fire that takes hit points off a creature
   * until it leaves, paid for with nothing but time.
   */
  bullets: {
    /** A file name in `src/assets/`, without its extension. Empty means the drawn dot. */
    image: string;
    imageAlpha: number;
    imageTint: number;
    /** A multiplier on the drawn radius, for art with padding around the ball. */
    imageScale: number;
    /**
     * The fire-rate LADDER: the first entry is what a run starts at, and each rate pickup moves up one.
     *
     * An array rather than a number plus a cap, because "how many tiers are there" and "how fast is each tier" are the
     * same fact: adding a tier is adding an entry and deleting one is deleting an entry. The FIRST entry being 0 is how
     * the whole weapon is switched off.
     */
    rateTiers: number[];
    /**
     * The speed curve, in lane widths (and lane widths per second squared): a round leaves at `speedStartPerSecond`
     * and accelerates until it reaches `speedMaxPerSecond`, on top of the level's own scroll.
     *
     * Three numbers rather than one because the SHAPE is the mechanic: what a round can do depends on how long it
     * spends in the water, and that is the area under this curve. See `src/bullets.ts`.
     */
    speedStartPerSecond: number;
    accelerationPerSecond: number;
    speedMaxPerSecond: number;
    /** The radius a round is BORN with, as a fraction of the lane width. */
    radiusRatio: number;
    /**
     * How much the radius grows per second in flight -- the whole reason a slow round becomes a big one.
     *
     * A function of AGE alone, not of speed: speed only matters through how long the round survives. There is no
     * ceiling, because the only real limit is `lifeSeconds` and a second one would cap the range card.
     */
    radiusGrowthPerSecond: number;
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
   * The player's own bubble art.
   *
   * A picture REPLACES the procedural look -- fill, rim, highlight and glow -- rather than sitting under it. The art the
   * owner supplies IS the bubble; painting the old rim on top would be two bubbles disagreeing about where the edge is.
   * `keepDetails` is there for art that is only the fill, with the rim still wanted.
   *
   * It is a top-level section rather than part of `stages.appearance` because it is not a stage: the same picture serves
   * every stage, and the stage colour still tints it. Per-stage art is the obvious next step, and this is the shape that
   * would grow into it.
   */
  playerBubble: {
    /** A file name in `src/assets/`, without its extension. Empty means the drawn bubble. */
    image: string;
    imageAlpha: number;
    imageTint: number;
    /** A multiplier on the drawn radius, for art with padding around the ball. */
    imageScale: number;
    /** Degrees clockwise. The world container is Y-flipped and that is compensated for; this is on top of it. */
    imageRotation: number;
    keepDetails: boolean;
  };
  /**
   * Pictures for a creature, by kind. Keys are `HazardKind`s; a kind without an entry is drawn as before.
   *
   * A picture REPLACES the procedural body (it is the creature), and the parts the art does not carry -- the anglerfish's
   * glowing lure -- are drawn on top from this same block.
   */
  /**
   * Which side of a creature's PICTURE is its front. Left is the default; a kind may override it.
   *
   * A creature is drawn mirrored when its front does not already point at the player, so this is the one fact the game needs
   * to know about a picture's orientation.
   */
  hazardFront: 'left' | 'right';
  /** How long a creature keeps a facing before it may change its mind. */
  hazardFacing: {
    cooldownSeconds: number;
    turnSeconds: number;
  };
  /**
   * Frame-by-frame animations, by name -- what a creature's art points at for a state it has more than one picture for.
   *
   * A frame list is written as a PATTERN plus a count (`"螃蟹-BOSS-待机-{n}"` with `count: 4`), because that is how the frames
   * are named on disk; a list of names works too when they are not numbered. The pictures are ordinary `src/assets/` files,
   * so the preload screen fetches them with everything else and Pixi's asset manager caches each one once.
   *
   * See `AssetAnimation` for what each field means and `animationFrameAt` for the one place the frame index is computed.
   */
  animations: Record<string, AssetAnimation>;
  hazardArt: Record<
    string,
    {
      /**
       * A picture name in `src/assets/`, or the NAME of an entry in `animations`.
       *
       * Required unless `variants` is present, which lists the looks instead.
       */
      move?: string;
      /**
       * Several looks for one kind, one of which an instance shows -- the fish are the case: a shoal of sardines and
       * a shoal of perch are the same creature to the game and two different things to look at.
       *
       * Which one is shown is the CREATURE's `variety`, decided where it is placed rather than where it is drawn, so
       * that a level's block can make a whole school agree. The list replaces `move`/`scale` rather than extending
       * them, so there is one place a look is written down and no way for the two to disagree.
       */
      variants?: readonly { move: string; scale: number }[];
      charge?: string;
      /** **攻击**: this creature throws something, and this is what it looks like while it does. */
      attack?: string;
      /** **死亡动画**: this creature DIES rather than leaving (the boss), and this is what it becomes. */
      dead?: string;
      /** Overrides `hazardFront` for this kind. */
      front?: 'left' | 'right';
      /**
       * A multiplier on `hitFlash.peakIntensity` for THIS kind, so a creature may ask for a gentler flash than the global.
       *
       * The boss uses it: it is a large target, so a wash at full strength covers the detail the owner drew. 1 is "the same
       * as everything else", 0 is "this one does not flash".
       */
      spriteFlashScale?: number;
      /**
       * Whether the picture turns to face the player. Default true, because a hunter should face what it hunts.
       *
       * Set it false for something that is usually NOT hunting anybody: most fish on screen are drifting, and a
       * drifter that swings round to stare at the bubble has a tell it was never meant to have. A kind that opts out
       * faces its own `heading` instead -- which way it is actually swimming -- and falls back to the artist's
       * orientation before it has swum anywhere.
       */
      facesPlayer?: boolean;
      /**
       * Radians per second the PICTURE turns about its own centre. Absent or 0 means it does not turn.
       *
       * Distinct from `KIND_TUNING[kind].spin`, which the drawn bodies use for their own shapes; this one turns the
       * sprite, so the two are only the same number when a kind happens to want the same rate in both.
       */
      spin?: number;
      /**
       * THE PICTURE'S ANGLE IS THE VOLLEY'S, and the picture is never mirrored.
       *
       * `spin` above is a RATE -- it turns the picture for ever, which is right for an urchin whose rotation IS its
       * animation. The starfish cannot use it. Its five arms ARE its next volley: `stepStarfish` fires along
       * `h.volleySpin + i * 72deg`, which is a STATE that jumps by a notch on each volley and starts at a random
       * angle. A rate cannot track a state -- the arms would sit at a fixed offset from the bullets and the picture
       * would lie about where the next five rounds are going, which is the one thing worse than no picture at all.
       *
       * So this says two things, and they are one statement because a picture like this has no front: the angle
       * comes from the volley, and the sprite is NOT mirrored. Mirroring is the other half of the same bug -- a
       * mirrored star still looks like a star, but its arms are on the wrong side, and 5-fold symmetry means the
       * error does not announce itself as "upside down".
       */
      volleyAligned?: boolean;
      /**
       * Where the picture's OWN first arm points, in the game's y-up convention. Only read when `volleyAligned`.
       *
       * The art is drawn however it was drawn, so this is the number that reconciles it with the volley's zero.
       * Which arm counts as "first" is arbitrary -- the arms are 72deg apart, so naming a different one shifts this
       * by a whole notch and moves every arm onto the next one of the same star, which is no change at all.
       */
      volleyBaseRadians?: number;
      /**
       * How long the `attack` picture stands, when that picture is a single file rather than an animation.
       *
       * An `attack` that names an `animations.<id>` already has its length -- that is what `maxSeconds` and
       * `framesPerSecond` are for -- and this is ignored for it. A single picture has no such clock, so a kind that
       * shows it must say how long "the swing" lasts.
       */
      attackSeconds?: number;
      /** Required unless `variants` is present, which carries a scale per look. */
      scale?: number;
      alpha: number;
      lure?: {
        stemAngle: number;
        stemFrom: number;
        stemLength: number;
        stemWidth: number;
        stemColour: number;
        bulbRadius: number;
        bulbColour: number;
        glowRadius: number;
        glowColour: number;
        glowAlpha: number;
        pulsePerSecond: number;
        pulseMin: number;
        pulseMax: number;
      };
    }
  >;
  /** The white flash anything shootable gives when a bullet lands: creatures AND breakable obstacles. */
  /** Hit particles: sparks on a hit, a ring of debris on a defeat. */
  /**
   * The bubble animation that follows every charge.
   *
   * One sprite in the default case (\`count: 1\`): the sheet is a LOOP played by the sprite, not a particle emitted into the
   * water, which is why there is a \`frameSeconds\` here and no emission rate or lifetime. The last four fields only do anything
   * once \`count\` is raised past 1 and the sprite becomes a cluster.
   */
  chargeTrail: {
    image: string;
    /** The sheet's layout. Frame order is left to right, then top to bottom: \`i = row * columns + column\`. */
    columns: number;
    rows: number;
    /** Seconds per frame while the sheet loops. */
    frameSeconds: number;
    /** How far behind the creature the bubble sits, as a multiple of its own size. */
    behindFactor: number;
    /** How many bubbles; 1 is a single tail sprite. */
    count: number;
    /** How much further each successive bubble sits, relative to its own size. */
    spread: number;
    /** Angular jitter of the cluster, in radians. */
    jitter: number;
    /** Random size variation, as a fraction. */
    scaleVariance: number;
    /** How much smaller each successive bubble is. */
    sizeFalloff: number;
    sizeRatio: number;
    alpha: number;
  };
  particles: {
    maxParticles: number;
    hitCount: number;
    hitSpeed: number;
    hitLife: number;
    hitSize: number;
    defeatCount: number;
    defeatSpeed: number;
    defeatLife: number;
    defeatSize: number;
    defeatColour: number;
    defeatJitter: number;
    drag: number;
    descentSpeed: number;
  };
  /**
   * The detonation ring: the circle a bomb fish draws where it went off.
   *
   * Not part of `particles`, because it is not a spray of anything -- it is a READING of how large that blast was, and
   * it is the only thing left on screen saying so once the creature is gone.
   */
  explosions: {
    seconds: number;
    strokeColour: number;
    strokeAlpha: number;
    strokeStartRatio: number;
    strokeEndRatio: number;
    strokeWidthRatio: number;
    coreColour: number;
    coreAlpha: number;
    coreStartRatio: number;
    coreEndRatio: number;
  };
  /**
   * The loading page: the full-screen backdrop, the bar, and the numbers under it.
   *
   * Every visual number lives here rather than in `src/loading.ts`, including the three GAPS: the block is centred as
   * a whole and its parts are placed from those, so tuning the spacing does not mean counting offsets in the drawing
   * code -- which is exactly what "the bar at exactly `height / 2`" used to be.
   */
  loading: {
    scrimColour: number;
    scrimAlpha: number;
    trackColour: number;
    barColour: number;
    barHeight: number;
    maxWidth: number;
    /** The page's heading, and the size and colour it is drawn at. */
    label: string;
    titleSize: number;
    titleColour: number;
    /** The percentage and the two number lines. */
    textColour: number;
    textSize: number;
    lineHeight: number;
    /** Title to bar, bar to percentage, percentage to the numbers, all in design pixels. */
    gapTitle: number;
    gapBar: number;
    gapStats: number;
    /** How many seconds of the download the reported rate is measured over. */
    speedWindowSeconds: number;
  };
  /**
   * The full-body white flash every hit gives: its shape, its strength, and how often it may restart.
   *
   * A CURVE rather than a countdown, and the three timing fields are that curve: rise to `peakIntensity` over the first
   * `riseFraction` of `seconds`, then ease out to nothing. See `flashIntensity` in `src/hazards.ts`, which is the one place
   * the shape is computed.
   */
  hitFlash: {
    /** How long one flash lasts. */
    seconds: number;
    /** The brightest it gets, 0..1, where 1 is a full white-out of the picture. 0 disables the flash entirely. */
    peakIntensity: number;
    /** The fraction of the life spent rising to that peak. The rest is the decay. */
    riseFraction: number;
    /**
     * Seconds before another hit may restart it.
     *
     * The reason this is not just a nicety: the gun fires many rounds a second, and without a floor each one restarted the
     * flash on the frame it landed -- so the creature sat at full brightness for as long as the player held fire, which
     * reads as a white body rather than as a hit.
     */
    cooldownSeconds: number;
    colour: number;
    alpha: number;
    radiusScale: number;
  };
  /**
   * What makes a hit a HEAVY one, and what a heavy one adds.
   *
   * Judged by damage rather than by weapon, so a future high-damage weapon is heavy without any code change, and so the
   * rule reads as "how hard did that land" rather than as a list of kinds. A heavy hit rings the body and nudges the
   * screen; a critical one does the same, harder.
   */
  hitFeedback: {
    /** Damage at or above this is heavy. */
    heavyDamage: number;
    /** Damage at or above this is a critical: the same marks, scaled by `damage / critDamage`. */
    critDamage: number;
    heavyOutlineColour: number;
    heavyOutlineAlpha: number;
    /** Where the ring sits, as a multiple of the body radius. Just outside it, so it reads as a ring round the creature. */
    heavyOutlineRadiusScale: number;
    /** Ring width as a fraction of the body radius. */
    heavyOutlineWidthRatio: number;
    /** How long the ring stays lit. */
    heavyOutlineSeconds: number;
    /** Design pixels of screen shake at full strength, and how long it lasts. 0 turns the shake off. */
    heavyShakePixels: number;
    heavyShakeSeconds: number;
  };
  /**
   * Being SHOT knocks a creature back a little.
   *
   * Top level beside `hitFlash` rather than inside `hazards`, because the two are halves of one thing -- what a landed
   * hit does to the creature -- and the config file keeps them side by side for that reason. Everything inside
   * `hazards` is a property of a KIND of creature; this is a property of being hit.
   *
   * Expressed as a TOTAL DISTANCE in metres, like the rage burst's `knockbackMeters` and unlike the crab's launch:
   * the thing the player is judging is "how far did that push it", and a distance says that directly. The recoil
   * is spent over `seconds`, so the two numbers together decide whether it reads as a nudge or as a shove.
   */
  hitKnockback: {
    /** Metres of recoil per landed hit. 0 turns it off: a hit is then only the flash. */
    meters: number;
    /** How long that distance takes to be covered. */
    seconds: number;
  };
  codex: {
    /** The full-screen preview's scrim. */
    previewScrimColour: number;
    previewScrimAlpha: number;
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
   * The settings panel's player-visible numbers.
   *
   * The panel's own FURNITURE is not here on purpose and never was -- the panel's box and each row's offset inside it
   * are proportional arithmetic against a size derived from the viewport, and they live in `src/settings.ts` beside the
   * arithmetic they have to agree with. What is here is the one thing in that panel the player looks AT: the level
   * pills, which have their own colours, sizes and wrapping.
   */
  settings: {
    /** The level row, which is a debug affordance on the panel rather than a menu row. */
    levels: {
      /** How many pills fit on a row. The wrap basis -- see `LevelPill` in `src/settings.ts`. */
      perRow: number;
      /** The widest a row may be, as a fraction of the panel's content width. */
      maxRowWidthRatio: number;
      rowHeight: number;
      radius: number;
      rowGap: number;
      textSize: number;
      selectedFill: number;
      selectedStroke: number;
      selectedTextColour: number;
      idleFill: number;
      idleStroke: number;
      idleTextColour: number;
    };
  };
  /**
   * The main menu: three stone buttons, the title, and the water behind them.
   *
   * The three buttons are PICTURES now (`src/assets/按钮-*.png`, three states each), so what is left here is their
   * shared WIDTH and the gap between them. Height is not a dial: each button is as tall as its own stone is, and the
   * three stones are three different shapes -- forcing one height on them would squash whichever two are not the
   * middle one.
   */
  menu: {
    /**
     * The height all three stones are drawn at, in design pixels.
     *
     * The shared dimension is the HEIGHT and not the width, and that is a correction rather than a preference: the
     * three pictures are three independent drawings with three different plate ratios, so a shared width gives them
     * three different heights -- and the lettering is painted ON the plate, so those heights are letter heights. The
     * owner saw it as "设置's text is bigger than 开始游戏's". Shared height, per-picture width.
     *
     * There is deliberately no width cap to go with it: width and text size are the same thing here, so any cap that
     * actually binds would shrink one button's text and put the bug back.
     */
    buttonHeight: number;
    buttonGap: number;
    /**
     * Whether the menu has a codex stone at all. False (the shipped value) builds no such button AND never loads the codex
     * module: it is switched off, not deleted, and nothing the game does depends on it. See `Game.loadCodex`.
     */
    codexEnabled: boolean;
    /** How far down the whole stone moves while pressed, in design pixels. */
    buttonPressDrop: number;
    /**
     * Where the GROUP -- title plus buttons, as one stack -- is centred vertically, as a fraction of screen height.
     *
     * The anchor is the group's centre rather than the buttons' top edge because `buttonHeight` is a dial: a number
     * pinned to the top edge stops meaning "centred" the moment the stack changes height, and "centred" is the thing
     * being asked for.
     */
    groupCentreRatio: number;
    /**
     * The title, which is a picture rather than a line of text.
     *
     * `titleAspect` looks like it should be readable off the picture -- and it is, once the picture has loaded. The
     * LAYOUT needs it before that, so it is stated here. See the config's own note.
     */
    titleWidthRatio: number;
    titleAspect: number;
    /** The gap between the title's bottom edge and the top of the first stone. */
    titleButtonGap: number;
    /**
     * The animated menu backdrop: decorative creatures swimming, and a coral bed in two layers.
     *
     * Every length is a fraction of the SCREEN (width for the speeds, height for how low the coral sits), so the whole
     * thing keeps its proportions when the window changes -- which for a menu means keeping its composure on a phone
     * and on a 1920-wide desktop.
     */
    backdrop: {
      minAlive: number;
      maxAlive: number;
      spawnGapSeconds: number;
      speedMin: number;
      speedMax: number;
      driftRatio: number;
      turnEverySeconds: number;
      fishTurnEverySeconds: number;
      turnBand: number;
      burstScale: number;
      burstSeconds: number;
      burstFallSeconds: number;
      burstEverySeconds: number;
      creatureScale: number;
      creatureAlpha: number;
      schoolChance: number;
      schoolMin: number;
      schoolMax: number;
      /**
       * The kinds that never arrive in a batch, by name.
       *
       * Strings rather than `HazardKind`s, and checked where the swimmers are listed rather than here: this file
       * cannot import `src/menuBackdrop.ts` without a cycle, so the rule below can only see the shape of the list.
       */
      loners: string[];
      fishSchoolChance: number;
      fishSchoolMin: number;
      fishSchoolMax: number;
      fishChance: number;
      crawlerSpeedScale: number;
      crawlerBandTop: number;
      backCoralCount: number;
      backCoralHalfWidth: number;
      backCoralBottom: number;
      frontCoralCount: number;
      frontCoralHalfWidth: number;
      frontCoralBottom: number;
      exitSeconds: number;
      fadeSeconds: number;
    };
    /**
     * The deep-sea lighting over the menu's water: a halo at the top, light shafts, and a mask that takes the bottom
     * to black.
     *
     * Three colours and a pile of fractions. What the numbers do not say is WHERE each piece is drawn, and that is
     * half of the effect -- see the layer order in `src/menuBackdrop.ts`, and the config's own note on why the mask
     * covers the water rather than the whole scene.
     */
    lighting: {
      glowColour: number;
      glowCentreY: number;
      glowRadius: number;
      glowAlpha: number;
      glowMidOffset: number;
      glowMidAlpha: number;
      glowPulse: number;
      glowDrift: number;
      glowSeconds: number;

      beamColour: number;
      beamCount: number;
      beamWidth: number;
      beamHeight: number;
      beamTop: number;
      beamFirstX: number;
      beamSpread: number;
      beamLean: number;
      beamPitch: number;
      beamNarrow: number;
      beamAlpha: number;
      beamFadeMidOffset: number;
      beamFadeMidAlpha: number;
      beamSway: number;
      beamSwaySeconds: number;
      beamWidthSeconds: number;
      beamDrift: number;
      beamDriftSeconds: number;
      beamPulse: number;
      beamPulseSeconds: number;

      darknessColour: number;
      darknessTopAlpha: number;
      darknessMidOffset: number;
      darknessMidAlpha: number;
    };
    /**
     * What drifts UPWARD through the menu's water -- suspended specks, and bubbles off the seabed.
     *
     * Sizes are fractions of the lane's width, like everything else that lives in the water; speeds are fractions of
     * the screen's height, like the lighting. Two different units in one block, which is why the config says so out
     * loud rather than leaving it to be worked out from the numbers.
     */
    water: {
      motes: {
        count: number;
        size: number;
        sizeVariance: number;
        speed: number;
        speedVariance: number;
        drift: number;
        colour: number;
        baseAlpha: number;
        litAlpha: number;
        fadeEdge: number;
      };
      bubbles: {
        /**
         * How many vents, and how many bubbles each lets go of.
         *
         * A RANGE rather than a count, because a fixed one makes every string identical: the density of the water is
         * part of what changes about it, and four strings of exactly four bubbles each is a pattern the eye catches.
         */
        vents: number;
        perStringMin: number;
        perStringMax: number;
        everySeconds: number;
        everyJitter: number;
        gap: number;
        /** The LARGEST bubble's diameter, as a fraction of the lane width -- the whole set's scale. */
        size: number;
        speed: number;
        speedJitter: number;
        accel: number;
        /** The wobble, randomised per bubble: amplitude, period, and how much each of those varies. */
        sway: number;
        swayJitter: number;
        swaySeconds: number;
        swaySecondsJitter: number;
        fadeEdge: number;
        /**
         * The two ends of the distance cue: the nearest vent's opacity and the furthest one's.
         *
         * OPACITY rather than a blur, and that is not a shortcut -- a blur would eat the pixel edges the twelve
         * drawings are made of. There is no `alpha` beside these because there is nothing left for it to multiply:
         * the pair IS a bubble's opacity, and a third number on top would be a second way to say the same thing.
         */
        nearAlpha: number;
        farAlpha: number;
        /** Multiplies the pictures' own colours. White is the identity and the default. */
        tint: number;
      };
    };
    /**
     * The bubbles coming off the interface itself: three on the title, one on each of the three stones.
     *
     * A SEPARATE BLOCK FROM `water.bubbles`, and they are not two views of one thing: those live in the lane, in a
     * container whose y is mirrored, and these live in the menu's own space and rise the other way up the screen. The
     * numbers overlap by coincidence -- a size, a speed, a wobble -- and are separate so either can be tuned without
     * dragging the other along.
     *
     * The SPOUTS' positions are not here: where a vent sits on a picture is a fact about that picture, like its
     * aspect, and it lives beside the picture in `src/menu.ts`.
     */
    /**
     * The caustics on the title: a cell net, mirrored into a tile and drifting over the stone.
     *
     * See `src/caustics.ts` for why it is mirrored rather than repeated and why there are two layers.
     */
    caustics: {
      /**
       * How wide one tile is drawn, in design pixels -- which IS the cell size, since the picture's cells are a fixed
       * fraction of its width. Moving it moves the cells, at the cost of a pixel picture being scaled off its grid.
       */
      tileWidth: number;
      /** Drift per second, as a fraction of the TITLE BOX's own width and height, so it survives a resize. */
      driftX: number;
      driftY: number;
      crossDriftX: number;
      crossDriftY: number;
      alpha: number;
      /** The second layer's opacity, as a fraction of the first's. */
      crossAlpha: number;
      /** The colour the veins are drawn in -- the light itself. */
      lightColor: number;
      /**
       * How far the flow warp moves a point, as a fraction of a tile's width; the wavelength of its ripples, as a fraction of
       * a tile; and the seconds one of its phases takes to go round (the four run at unrelated multiples of it).
       */
      warpAmount: number;
      warpWavelength: number;
      warpSeconds: number;
      /** How far the breathing stretch pulls (0.2 = 20% longer along its axis and 20% shorter across) and its period in seconds. */
      breatheAmount: number;
      breatheSeconds: number;
      /** The stretch axis of each layer, in degrees from the horizontal. */
      axisDegrees: number;
      crossAxisDegrees: number;
      /** The second layer's deformation clocks, as a fraction of the first's rate. */
      crossSpeedRatio: number;
    };
    uiBubbles: {
      everySeconds: number;
      everyJitter: number;
      size: number;
      speed: number;
      speedJitter: number;
      accel: number;
      /** How long a bubble takes to be blown up to full size, while it is already rising. */
      growSeconds: number;
      sway: number;
      swayJitter: number;
      swaySeconds: number;
      swaySecondsJitter: number;
      alpha: number;
      tint: number;
    };
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
    /** What running into one costs the player, before defence. One number, not a row per kind: see the config. */
    contactDamage: number;
    health: Record<string, number>;
    radius: Record<string, number>;
    /**
     * Per-kind override of the volume needed to ram it through, or `null` for "no ram ever".
     *
     * Keyed by kind and sparse: a kind that is happy with the shared `ramVolumeThreshold` simply is not listed.
     */
    ramVolume: Record<string, number | null>;
    minGapFraction: number;
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
    /**
     * Optional pictures, one row per kind, for obstacles drawn from art instead of from code.
     *
     * Sparse by design: a kind that is not listed keeps its drawn body, and a listed kind FALLS BACK to it while
     * the texture loads -- so "the picture has not arrived yet" can never be "the obstacle is invisible".
     *
     * `variants` is a list of FACES for the one kind: `image` is a picture name and only a picture name, and each
     * obstacle picks one by its own id. Same collision, same health, same break-up -- a thicket of coral is one
     * thing with several shapes, not several things.
     *
     * `swayDegrees`/`swaySeconds` are the whole animation -- the picture turns about its own bottom centre by that
     * many degrees, once every that many seconds. One picture plus a rotation rather than frames, because a
     * composed rotation keeps the body perfectly still while a generated frame set does not (measured: 30-40/255
     * mean difference between generated frames, against 1.4/255 for a composition).
     */
    art: Record<
      string,
      {
        variants: readonly { image: string; scale: number }[];
        alpha: number;
        swayDegrees: number;
        swaySeconds: number;
      }
    >;
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
      /** The wave's push, as total metres before mass and impact are applied. */
      knockbackMeters: number;
      /** How strong the push is relative to `knockbackMeters`, for the creatures the wave cannot destroy. */
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
      punishDamage: number;
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
  /**
   * Per-level background music: a bus volume and one synth recipe per level.
   *
   * A recipe rather than a file (see `src/music.ts`): this project has no binary assets, and a track described by four
   * numbers is one the level list can be edited against without leaving the config.
   */
  music: {
    volume: number;
    tracks: Record<string, MusicTrackConfig>;
  };
  /** The end-of-run summary panel, shown once all levels are cleared. */
  summary: {
    maxWidth: number;
    maxHeight: number;
    scoreSize: number;
    scoreColour: number;
    lineSize: number;
    lineColour: number;
    panelColour: number;
    panelRimColour: number;
    scrimColour: number;
    scrimAlpha: number;
    buttonColour: number;
    buttonLabel: string;
  };
  audio: {
    /** The level-cleared flourish: what it plays, and how long the sequence waits for it. */
    clearSting: {
      notes: number[];
      gapSeconds: number;
    };
    /** Extra beat after the flourish before the bubble starts to rise, in seconds. */
    clearHoldSeconds: number;
    /** How fast the bubble flies off the top of the screen when a level is cleared, in screen heights per second. */
    ascendScreensPerSecond: number;
    /**
     * Per-level background music: a bus volume and one synth recipe per level.
     *
     * A recipe rather than a file (see src/music.ts): this project has no binary assets, and a track described by
     * four numbers is one the level list can be edited against without leaving the config.
     */
    music: {
      volume: number;
      tracks: Record<string, MusicTrackConfig>;
    };
    /**
     * The background bed's level relative to the one-shot sounds.
     *
     * A separate gain node rather than a factor on the master, because the master carries the PLAYER's volume:
     * scaling it would take the effects down too, and a slider reading 100% should still mean "as loud as this
     * game goes".
     */
    musicVolume: number;
    /** The ambient bed's fixed level, 0..1. It used to follow depth; see udio.setAmbient. */
    ambientVolume: number;
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
  /** Defaults for how content arrives from the sides and from below. Per-level content lives in config/levels/*.json5. */
  spawning: {
    enterSpeedMps: number;
    offscreenMarginRatio: number;
    bottomMarginRatio: number;
    insideMarginRatio: number;
    entryDepth: number;
  };
  /**
   * The six skills, one block each, holding every number that decides how one feels.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THE KEYS ARE LISTED HERE RATHER THAN TYPED AS A Record
   * ---------------------------------------------------------------------------------------------
   * `SkillId` in `src/skills.ts` is the union of exactly these six names, and `src/skills.ts` reads
   * `mech.skills[id]` with an `id: SkillId`. Spelling the keys out means that adding a skill without giving it
   * numbers is a COMPILE error rather than a block of `undefined` at runtime -- the same guarantee
   * `KIND_TUNING` gets from its `Record<HazardKind, ...>` type, and the reason a missing row in a per-something
   * table is not a class of bug this project has to remember to guard.
   *
   * The names and the one-line blurbs are content and stay in `skills.ts`; this block is the balance.
   */
  skills: {
    dash: { uses: number; durationSeconds: number; ascentMultiplier: number };
    decoy: { uses: number; durationSeconds: number; decoyRadiusMeters: number; decoySeconds: number };
    vortex: { uses: number; durationSeconds: number; vortexRadiusMeters: number; vortexPullPerSecond: number };
    stink: { uses: number; durationSeconds: number; stinkRadiusMeters: number };
    shell: { uses: number; durationSeconds: number; invulnerableSeconds: number; shellRadiusMeters: number };
    burst: { uses: number; durationSeconds: number; burstRadiusMeters: number };
  };
  /**
   * The three talents, one block each. Same reason for the spelled-out keys as `skills` above.
   *
   * Half of each block is what the talent GIVES and half is what it COSTS; a talent whose cost is not in its block
   * is a talent whose cost is hidden somewhere else.
   */
  talents: {
    soda: { ascentMultiplier: number; steerPenalty: number };
    silt: { startVolume: number; defense: number };
    'fish-fart': { radiusMeters: number; cooldownSeconds: number; baitCount: number };
  };
  /**
   * The debug hitbox overlay: its line style and its colours, and nothing else.
   *
   * Visual numbers rather than mechanics, and they live here for the reason every other visual number does -- see
   * AGENTS.md. The two dash figures are here because a dashed circle is a different SHAPE from a solid one, and the
   * shape is what carries the meaning: solid is "this hurts", dashed is "this pays for a near miss".
   */
  debug: {
    width: number;
    alpha: number;
    dashLength: number;
    dashGap: number;
    creatureColour: number;
    environmentColour: number;
    obstacleColour: number;
    playerBulletColour: number;
    enemyBulletColour: number;
    playerColour: number;
    grazeColour: number;
  };
}

/** One level's music, as the config writes it. See `src/music.ts` for what each field does to the sound. */
export interface MusicTrackConfig {
  rootHz: number;
  stepPerMinute: number;
  stepsPerChord: number;
  chords: number[][];
  pattern: number[];
  wave: 'sine' | 'square' | 'sawtooth' | 'triangle';
  padWave: 'sine' | 'square' | 'sawtooth' | 'triangle';
  arpGain: number;
  padGain: number;
  noteSeconds: number;
  cutoffHz: number;
  detuneCents: number;
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
 * The rules for ONE floating-number style, so the score numbers and the damage numbers are validated identically.
 *
 * A generator rather than two lists: the styles are the same thirteen fields, and a rule added to one and forgotten in
 * the other is a config key that silently stops being checked -- which is how a mistyped number becomes a popup that
 * never appears. `score.popups` and `damagePopups` are the two callers.
 */
/**
 * The boss's rule set, one row per key, for whichever dossier `prefix` names.
 *
 * Twenty-three values are read by a boss fight, and they are the same twenty-three for every boss -- so they are
 * written once here and expanded per dossier: `hazards.boss` (the tombstone) and `hazards.bosses.<kind>` for each of
 * the six. This block had NO rules at all until it did, which is the shape of gap the coverage check at the end of this
 * file exists to find: twenty-three values read by the whole fight, none of which would have named itself if mistyped.
 *
 * WHICH dossiers exist is read out of the file rather than listed here (see `bossDossierKinds`), because a seventh
 * boss would otherwise need its kind name spelled in two languages -- and forgetting the second one is exactly the
 * failure this file is built to make loud rather than quiet.
 */
function bossRules(prefix: string): { path: string; check: (v: unknown) => boolean; describe: string }[] {
  return [
    { path: `${prefix}.holdMeters`, check: anyNumber, describe: 'metres' },
    { path: `${prefix}.holdBandRatio`, check: anyNumber, describe: 'a fraction of the visible depth' },
    { path: `${prefix}.holdMinMeters`, check: anyNumber, describe: 'metres' },
    { path: `${prefix}.patrolAmplitude`, check: anyNumber, describe: 'a lane fraction' },
    { path: `${prefix}.patrolPeriodSeconds`, check: anyNumber, describe: 'seconds' },
    { path: `${prefix}.seekSpeedFactor`, check: anyNumber, describe: 'lane widths per second' },
    { path: `${prefix}.radiusRatio`, check: anyNumber, describe: 'a lane fraction' },
    { path: `${prefix}.colour`, check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
    { path: `${prefix}.eyeColour`, check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
    { path: `${prefix}.armourColour`, check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
    { path: `${prefix}.weakPointWidthRatio`, check: anyNumber, describe: 'a lane fraction' },
    { path: `${prefix}.hitFlashColour`, check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
    { path: `${prefix}.hitFlashStrength`, check: anyNumber, describe: 'an intensity for the DRAWN boss body; 0 means it does not flash' },
    { path: `${prefix}.knockbackScale`, check: anyNumber, describe: 'a multiplier on hitKnockback.meters; the boss holds station, so 0.5 is a nudge rather than a shove' },
    { path: `${prefix}.attackEverySeconds`, check: anyNumber, describe: 'seconds between claw swings' },
    { path: `${prefix}.attackSprayFrame`, check: wholeNumber, describe: 'a frame number of the attack animation' },
    { path: `${prefix}.attackSprayCount`, check: wholeNumber, describe: 'a whole number of grit pieces; 0 makes the swing a pure animation' },
    { path: `${prefix}.attackSpraySpread`, check: anyNumber, describe: 'a lane fraction' },
    { path: `${prefix}.attackSpraySeconds`, check: anyNumber, describe: 'seconds of travel; this is the dodge window, so short is unfair and long is harmless' },
    { path: `${prefix}.attackSprayFromX`, check: anyNumber, describe: 'a multiple of the boss radius' },
    { path: `${prefix}.attackSprayFromY`, check: anyNumber, describe: 'a multiple of the boss radius; negative is below the body, which is where a claw is' },
    { path: `${prefix}.attackSprayBowRatio`, check: anyNumber, describe: 'a bow as a fraction of the distance travelled' },
  ];
}

/**
 * The boss dossiers the config actually declares, in file order.
 *
 * Asked of `parsed` rather than of a constant, and it is the one place this file reaches into the config to decide
 * what to VALIDATE. The alternative -- a hand-written list of six kinds -- is a parallel list, and a parallel list goes
 * stale in silence: a dossier added to the config but not to the list would be validated by nothing, and the coverage
 * check below cannot catch that on its own, because it checks the other direction.
 */
function bossDossierKinds(): string[] {
  const hazards = (parsed as { hazards?: { bosses?: Record<string, unknown> } } | null)?.hazards;
  const bosses = hazards?.bosses;
  return bosses && typeof bosses === 'object' ? Object.keys(bosses) : [];
}

function popupRules(prefix: string): { path: string; check: (v: unknown) => boolean; describe: string }[] {
  return [
    { path: `${prefix}.lifeSeconds`, check: anyNumber, describe: 'seconds' },
    { path: `${prefix}.risePx`, check: anyNumber, describe: 'design pixels' },
    { path: `${prefix}.riseEase`, check: anyNumber, describe: 'an exponent' },
    { path: `${prefix}.size`, check: anyNumber, describe: 'a font size' },
    { path: `${prefix}.colour`, check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
    { path: `${prefix}.alpha`, check: anyNumber, describe: 'an opacity' },
    { path: `${prefix}.weight`, check: (v) => v === 'bold' || v === 'normal', describe: "'bold' or 'normal'" },
    { path: `${prefix}.prefix`, check: (v) => typeof v === 'string' && v.length <= 8, describe: 'a string of at most 8 characters; the empty string is allowed' },
    { path: `${prefix}.fadeFrom`, check: anyNumber, describe: 'a fraction of the life' },
    { path: `${prefix}.fadeEase`, check: anyNumber, describe: 'an exponent' },
    { path: `${prefix}.anchorX`, check: anyNumber, describe: 'a fraction' },
    { path: `${prefix}.anchorY`, check: anyNumber, describe: 'a fraction' },
    { path: `${prefix}.max`, check: wholeNumber, describe: 'a whole number of popups; 0 turns this style of number off entirely' },
  ];
}

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
    if (!numbers.every((k) => typeof r[k] === 'number' && Number.isFinite(r[k] as number))) return false;
    return typeof r.bowRatio === 'number' && Number.isFinite(r.bowRatio);
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
    if (r.radiusRatio !== undefined && (typeof r.radiusRatio !== 'number' || !Number.isFinite(r.radiusRatio))) return false;
    return fields.every((k) => typeof r[k] === 'number' && Number.isFinite(r[k] as number));
  });
}

/**
 * True if `v` is a number at all -- the whole check, deliberately.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE IS NO RANGE HERE
 * ---------------------------------------------------------------------------------------------
 * There used to be one, per knob: `> 0.05 && < 8`, `>= 0 && <= 100000`, and so on, several hundred of them.
 * They were a guess at what the game could survive, written once and never revisited, and they fired on
 * TUNING rather than on breakage -- `radiusGrowthPerSecond: 0.187` is a perfectly playable number and it
 * was rejected because nobody had thought to allow it.
 *
 * A range in the validator is a second copy of the design, in a file nobody tunes. When the two disagree
 * the copy wins, and the person editing the actual config gets a page that will not start. That is worse
 * than the bad number it was guarding against, because a bad number is visible the moment you run and a
 * rejected good one looks like the game is broken.
 *
 * So: the numbers are the owner's, unchecked. The SHAPE still is not -- see the rules below, which still
 * insist a key exists, is the right type, and that structures (tables, bands, dossiers) are shaped the way
 * the readers assume. Those catch typos and half-edits, which is what a validator is for. `NaN` and
 * `Infinity` still fail, because `typeof v === 'number'` is not enough to exclude them and a NaN radius
 * is a genuinely broken game rather than a bold one.
 *
 * A function declaration, not a `const`, because the rule tables that call it are built earlier in the
 * file than this line and a `const` would still be in its temporal dead zone.
 */
function anyNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * True if `v` is a whole number, for the knobs that COUNT something rather than measure it.
 *
 * A count of spikes, gun rows, mesh lines or skill uses is not a magnitude, so this is not the range check that came
 * out of the rest of the file -- it is a statement about what the value IS. 6.5 spikes is not a bold piece of tuning,
 * it is a typo that reaches a `for` loop and rounds in a way nobody chose; the same reasoning keeps
 * `Number.isInteger` on an animation's frame count in `isAnimationTable`.
 *
 * The magnitude that used to sit beside it -- `>= 1 && <= 10`, `>= 2 && <= 24` and so on -- is gone with the rest:
 * ten spikes is the owner's business, one-and-a-half is not a number of spikes.
 */
function wholeNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v);
}

/** True if `v` is a usable colour: a JSON5 hex literal, or a "#rrggbb" string. */
function isColour(v: unknown): boolean {
  return (
    (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xffffff) ||
    (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v))
  );
}

/**
 * One creature's art for one state: a picture name in `src/assets/`, or the name of an entry in `animations`.
 *
 * Both are plain strings and they are resolved in that order (see `hazardArtState` in `src/hazards.ts`), which is what lets a
 * single-picture state stay a single line. A name with nothing behind it is caught at run time by `assetUrl`'s own warning,
 * naming the typo -- the config cannot see the directory.
 */
function isArtState(v: unknown): boolean {
  return typeof v === 'string' && v.length > 0;
}

/** The animations table: every row has a frame list and two positive limits. */
function isAnimationTable(v: unknown): boolean {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const rows = Object.values(v as Record<string, unknown>);
  return rows.every((row) => {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) return false;
    const r = row as Record<string, unknown>;
    const framesOk =
      (typeof r.frames === 'string' && r.frames.length > 0 && typeof r.count === 'number' && Number.isInteger(r.count)) ||
      (Array.isArray(r.frames) && r.frames.length >= 1 && r.frames.every((n) => typeof n === 'string' && n.length > 0));
    if (!framesOk) return false;
    if (r.once !== undefined && typeof r.once !== 'boolean') return false;
    return (
      typeof r.framesPerSecond === 'number' && Number.isFinite(r.framesPerSecond) &&
      typeof r.maxSeconds === 'number' && Number.isFinite(r.maxSeconds)
    );
  });
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
  { key: 'radius', what: 'radius multiplier', ok: anyNumber },
  // Colours: a JSON5 hex literal is a number, a colour picker gives a "#rrggbb" string. Both are fine.
  ...(['inner', 'rim', 'glow', 'sheen', 'specular', 'hudColor'] as const).map((key) => ({
    key,
    what: 'colour, either 0xrrggbb or "#rrggbb"',
    ok: (v: unknown) =>
      (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xffffff) ||
      (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)),
  })),
  ...(['innerAlpha', 'rimAlpha', 'glowInnerAlpha', 'innerRingAlpha', 'sheenAlpha', 'specularAlpha'] as const).map(
    (key) => ({
      key,
      what: 'opacity',
      ok: anyNumber,
    }),
  ),
  ...(['rimWidthRatio', 'innerRingWidthRatio'] as const).map((key) => ({
    key,
    what: 'stroke width as a fraction of the radius',
    ok: anyNumber,
  })),
  ...(['glowInnerRadiusRatio'] as const).map((key) => ({
    key,
    what: 'radius as a multiple of the bubble radius',
    ok: anyNumber,
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
  ...['drivenOff', 'absorb', 'eaten', 'boss'].map((event) => ({
    path: `score.${event}`,
    check: anyNumber,
    describe: 'points for this event; 0 takes the event out of the score',
  })),
  { path: 'enemyBullets.shooters', check: (v) => isShooterTable(v), describe: 'an object of hazard kind to a shooter row' },
  { path: 'enemyBullets.rangeMeters', check: anyNumber, describe: 'metres' },
  { path: 'enemyBullets.radiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'enemyBullets.lifeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'enemyBullets.coreColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'enemyBullets.rimColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'enemyBullets.rimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'charges.chargers', check: (v) => isChargerTable(v), describe: 'an object of hazard kind to { triggerMeters, telegraphSeconds, travelSeconds, bowRatio, cooldownSeconds, approach }' },
  ...['telegraphColour', 'trailColour'].map((key) => ({
    path: `charges.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or a "#rrggbb" string',
  })),
  ...['telegraphAlpha', 'trailAlpha'].map((key) => ({
    path: `charges.${key}`,
    check: anyNumber,
    describe: 'an opacity',
  })),
  { path: 'graze.radiusMultiplier', check: anyNumber, describe: 'a multiple of the contact radius' },
  { path: 'graze.slowFactor', check: anyNumber, describe: 'a timescale (1 is no slow at all)' },
  { path: 'graze.slowSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'graze.recoverSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'graze.playerFlash.seconds', check: anyNumber, describe: 'seconds' },
  { path: 'graze.playerFlash.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'graze.playerFlash.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'graze.playerFlash.widthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  ...popupRules('grazePopups'),
  { path: 'mutation.autoPerSecond', check: anyNumber, describe: 'mutation points per second' },
  ...['drivenOff', 'eaten', 'graze', 'bulletGraze', 'pointBlank', 'defuse', 'boss'].map((event) => ({
    path: `mutation.gain.${event}`,
    check: anyNumber,
    describe: 'mutation points for this event; 0 takes the event out of the economy',
  })),
  { path: 'mutation.pointBlankRadius', check: anyNumber, describe: 'a multiple of the contact radius' },
  ...popupRules('mutation.callouts'),
  { path: 'mutation.first', check: anyNumber, describe: 'the cost of the first level' },
  { path: 'mutation.growth', check: anyNumber, describe: 'the per-level cost multiplier' },
  { path: 'mutation.resumeInvulnerableSeconds', check: anyNumber, describe: 'seconds' },
  ...[
    'damagePerPick',
    'steerPerPick',
    'ascentPerPick',
    'invulnSecondsPerPick',
    'ragePerPick',
    'suctionPerPick',
    'eatInvulnSecondsPerPick',
    'appetiteTiersPerPick',
    'burstRadiusPerPick',
    'rageDecayReductionPerPick',
    'bulletSpeedPerPick',
    'bulletRadiusPerPick',
    'bulletRangePerPick',
    'sizeDamagePerPick',
    'speedDamagePerPick',
  ].map((key) => ({
    path: `mutation.pool.${key}`,
    check: anyNumber,
    describe: 'a per-pick amount',
  })),
  /**
   * The two defence cards, OUTSIDE the list above and on a wider range.
   *
   * The list's ceiling of 5 is a guard against a multiplier typed as a percentage (0.15 written as 15). Defence
   * is not a multiplier -- it is hit points subtracted from each blow -- so its cards are allowed to grow well
   * past 5 without that guard losing its point. See `src/health.ts`.
   */
  { path: 'mutation.pool.defensePerPick', check: anyNumber, describe: 'defence points' },
  { path: 'mutation.pool.defenseBigPerPick', check: anyNumber, describe: 'defence points' },
  { path: 'mutation.gauge.widthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'mutation.gauge.height', check: anyNumber, describe: 'design pixels' },
  { path: 'mutation.gauge.gap', check: anyNumber, describe: 'design pixels' },
  { path: 'mutation.gauge.radius', check: anyNumber, describe: 'design pixels' },
  { path: 'mutation.gauge.trackColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'mutation.gauge.trackAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'mutation.gauge.trackStroke', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'mutation.gauge.trackStrokeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'mutation.gauge.fillColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'mutation.gauge.fillAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'mutation.gauge.readyStroke', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'mutation.gauge.readyStrokeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'mutation.gauge.labelSize', check: anyNumber, describe: 'a font size' },
  { path: 'mutation.gauge.labelColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  ...popupRules('score.popups'),
  ...popupRules('damagePopups'),
  { path: 'hud.resultsCard.size', check: anyNumber, describe: 'a font size' },
  { path: 'hud.resultsCard.yRatio', check: anyNumber, describe: 'a fraction of the canvas height' },
  { path: 'hud.resultsCard.widthRatio', check: anyNumber, describe: 'a fraction of the canvas width' },
  { path: 'hud.score.x', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.score.y', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.score.size', check: anyNumber, describe: 'a font size' },
  { path: 'hud.score.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.score.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.healthBar.x', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.healthBar.y', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.healthBar.widthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hud.healthBar.height', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.healthBar.trackColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.healthBar.trackAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.healthBar.fillColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.healthBar.fillAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.healthBar.lowColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.healthBar.lowThreshold', check: anyNumber, describe: 'a proportion' },
  { path: 'hud.healthBar.borderColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.healthBar.borderAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.healthBar.labelSize', check: anyNumber, describe: 'a font size' },
  { path: 'hud.healthBar.labelColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.healthBar.labelGap', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.brokenScreen.threshold', check: anyNumber, describe: 'a health proportion, where the warning starts' },
  { path: 'hud.brokenScreen.maxThreshold', check: anyNumber, describe: 'a health proportion, where the warning maxes out' },
  { path: 'hud.brokenScreen.reachRatio', check: anyNumber, describe: 'a fraction of the short screen side' },
  { path: 'hud.brokenScreen.crackCountNear', check: anyNumber, describe: 'a crack count' },
  { path: 'hud.brokenScreen.crackCountDeep', check: anyNumber, describe: 'a crack count' },
  { path: 'hud.brokenScreen.branchChance', check: anyNumber, describe: 'a probability' },
  { path: 'hud.brokenScreen.branchAtRatio', check: anyNumber, describe: 'a fraction along the main crack' },
  { path: 'hud.brokenScreen.branchLengthRatio', check: anyNumber, describe: 'a length ratio' },
  { path: 'hud.brokenScreen.branchAngleRadians', check: anyNumber, describe: 'radians' },
  { path: 'hud.brokenScreen.segmentsPerCrack', check: anyNumber, describe: 'a segment count' },
  { path: 'hud.brokenScreen.segmentJitter', check: anyNumber, describe: 'a proportion' },
  { path: 'hud.brokenScreen.segmentTurn', check: anyNumber, describe: 'radians' },
  { path: 'hud.brokenScreen.width', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.brokenScreen.glowWidthRatio', check: anyNumber, describe: 'a width multiple' },
  { path: 'hud.brokenScreen.glowAlphaRatio', check: anyNumber, describe: 'an opacity proportion' },
  { path: 'hud.brokenScreen.alphaNear', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.brokenScreen.alphaDeep', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.brokenScreen.seed', check: anyNumber, describe: 'a number of 0 or more (0 means re-roll each time)' },
  { path: 'hud.brokenScreen.vignette.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.brokenScreen.vignette.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.brokenScreen.vignette.reachRatio', check: anyNumber, describe: 'a fraction of an edge' },
  { path: 'hud.brokenScreen.vignette.pulseHz', check: anyNumber, describe: 'pulses per second (0 is steady)' },
  { path: 'hud.brokenScreen.vignette.pulseDepth', check: anyNumber, describe: 'a proportion' },
  { path: 'hud.bossBar.y', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.bossBar.widthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hud.bossBar.height', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.bossBar.nameSize', check: anyNumber, describe: 'a font size' },
  { path: 'hud.bossBar.nameOffset', check: anyNumber, describe: 'design pixels' },
  { path: 'hud.bossBar.nameColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.fillColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.backColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.backAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hud.bossBar.borderColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hud.bossBar.borderAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'touch.buttonRadius', check: anyNumber, describe: 'design pixels' },
  { path: 'touch.buttonMaxRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'touch.rightInset', check: anyNumber, describe: 'design pixels' },
  { path: 'touch.bottomInset', check: anyNumber, describe: 'design pixels' },
  { path: 'touch.buttonGap', check: anyNumber, describe: 'design pixels' },
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
  { path: 'stages.minSpeedMultiplier', check: anyNumber, describe: 'a number' },
  { path: 'stages.absorbToStage2', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'stages.absorbToStage3', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'stages.growInvulnerableSeconds', check: anyNumber, describe: 'a number of 0 or more' },
  {
    path: 'stages.appearance',
    check: (v) => Array.isArray(v) && v.length >= 2 && v.every((s) => s !== null && typeof s === 'object'),
    describe: 'an array of at least two stage objects',
  },
  { path: 'volume.max', check: anyNumber, describe: 'a number' },
  /**
   * The band table, checked as an array of objects because a half-written row is the failure mode that matters:
   * a band missing `volume` would read as `undefined` and put the bubble at NaN radius, which is a bubble nobody
   * can see or hit.
   */
  { path: 'volume.healthBands', check: (v) => Array.isArray(v) && v.length >= 1 && v.every((b) => b !== null && typeof b === 'object' && typeof (b as { minRatio: unknown }).minRatio === 'number' && typeof (b as { volume: unknown }).volume === 'number'), describe: 'an array of { minRatio, volume } bands, lowest first' },
  { path: 'volume.healthPerVolume', check: anyNumber, describe: 'hit points per volume point' },
  { path: 'volume.laneRatio', check: anyNumber, describe: 'a small number' },
  { path: 'health.start', check: anyNumber, describe: 'hit points' },
  { path: 'health.minDamageRatio', check: anyNumber, describe: 'a fraction of the damage' },
  { path: 'health.healPerPick', check: anyNumber, describe: 'points' },
  { path: 'health.maxPerPick', check: anyNumber, describe: 'points' },
  { path: 'movement.keyboardCrossingSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'movement.verticalSpeedScale', check: anyNumber, describe: 'a number' },
  { path: 'movement.drag.sensitivity', check: anyNumber, describe: 'a displacement multiplier; 1 is finger-for-finger' },
  { path: 'movement.drag.penaltiesApply', check: (v) => typeof v === 'boolean', describe: 'true or false; false keeps the drag a strict 1:1 with the finger' },
  { path: 'background.tileScreens', check: anyNumber, describe: 'screen heights' },
  { path: 'background.countScale', check: anyNumber, describe: 'a multiplier' },
  {
    path: 'background.layers',
    check: (v) =>
      Array.isArray(v) &&
      v.length === 4 &&
      v.every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        return (
          typeof r.speedFactor === 'number' &&
          r.speedFactor >= 0 &&
          r.speedFactor <= 3 &&
          typeof r.count === 'number' &&
          Number.isInteger(r.count) &&
          r.count >= 0 &&
          r.count <= 400 &&
          typeof r.sizeRatio === 'number' &&
          r.sizeRatio >= 0 &&
          r.sizeRatio <= 0.1 &&
          isColour(r.colour) &&
          typeof r.alpha === 'number' &&
          r.alpha >= 0 &&
          r.alpha <= 1
        );
      }),
    describe: 'exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }',
  },
  { path: 'collectables.riseMin', check: anyNumber, describe: 'a number' },
  { path: 'background.tileScreens', check: anyNumber, describe: 'screen heights' },
  { path: 'background.countScale', check: anyNumber, describe: 'a multiplier' },
  {
    path: 'background.layers',
    check: (v) =>
      Array.isArray(v) &&
      v.length === 4 &&
      v.every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        return (
          typeof r.speedFactor === 'number' &&
          r.speedFactor >= 0 &&
          r.speedFactor <= 3 &&
          typeof r.count === 'number' &&
          Number.isInteger(r.count) &&
          r.count >= 0 &&
          r.count <= 400 &&
          typeof r.sizeRatio === 'number' &&
          r.sizeRatio >= 0 &&
          r.sizeRatio <= 0.1 &&
          isColour(r.colour) &&
          typeof r.alpha === 'number' &&
          r.alpha >= 0 &&
          r.alpha <= 1
        );
      }),
    describe: 'exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }',
  },
  { path: 'collectables.riseMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.riseMin') as number), describe: 'at least riseMin' },
  { path: 'background.tileScreens', check: anyNumber, describe: 'screen heights' },
  { path: 'background.countScale', check: anyNumber, describe: 'a multiplier' },
  {
    path: 'background.layers',
    check: (v) =>
      Array.isArray(v) &&
      v.length === 4 &&
      v.every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        return (
          typeof r.speedFactor === 'number' &&
          r.speedFactor >= 0 &&
          r.speedFactor <= 3 &&
          typeof r.count === 'number' &&
          Number.isInteger(r.count) &&
          r.count >= 0 &&
          r.count <= 400 &&
          typeof r.sizeRatio === 'number' &&
          r.sizeRatio >= 0 &&
          r.sizeRatio <= 0.1 &&
          isColour(r.colour) &&
          typeof r.alpha === 'number' &&
          r.alpha >= 0 &&
          r.alpha <= 1
        );
      }),
    describe: 'exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }',
  },
  { path: 'collectables.riseSpeedExponent', check: anyNumber, describe: 'a number' },
  { path: 'background.tileScreens', check: anyNumber, describe: 'screen heights' },
  { path: 'background.countScale', check: anyNumber, describe: 'a multiplier' },
  {
    path: 'background.layers',
    check: (v) =>
      Array.isArray(v) &&
      v.length === 4 &&
      v.every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        return (
          typeof r.speedFactor === 'number' &&
          r.speedFactor >= 0 &&
          r.speedFactor <= 3 &&
          typeof r.count === 'number' &&
          Number.isInteger(r.count) &&
          r.count >= 0 &&
          r.count <= 400 &&
          typeof r.sizeRatio === 'number' &&
          r.sizeRatio >= 0 &&
          r.sizeRatio <= 0.1 &&
          isColour(r.colour) &&
          typeof r.alpha === 'number' &&
          r.alpha >= 0 &&
          r.alpha <= 1
        );
      }),
    describe: 'exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }',
  },
  { path: 'collectables.wobbleMin', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'background.tileScreens', check: anyNumber, describe: 'screen heights' },
  { path: 'background.countScale', check: anyNumber, describe: 'a multiplier' },
  {
    path: 'background.layers',
    check: (v) =>
      Array.isArray(v) &&
      v.length === 4 &&
      v.every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        return (
          typeof r.speedFactor === 'number' &&
          r.speedFactor >= 0 &&
          r.speedFactor <= 3 &&
          typeof r.count === 'number' &&
          Number.isInteger(r.count) &&
          r.count >= 0 &&
          r.count <= 400 &&
          typeof r.sizeRatio === 'number' &&
          r.sizeRatio >= 0 &&
          r.sizeRatio <= 0.1 &&
          isColour(r.colour) &&
          typeof r.alpha === 'number' &&
          r.alpha >= 0 &&
          r.alpha <= 1
        );
      }),
    describe: 'exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }',
  },
  { path: 'collectables.wobbleMax', check: (v) => typeof v === 'number' && v >= (readRaw('collectables.wobbleMin') as number), describe: 'at least wobbleMin' },
  { path: 'hazards.radius', check: (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.values(v as Record<string, unknown>).every((n) => typeof n === 'number' && n > 0.001 && n <= 0.5), describe: 'an object of kind -> radius fraction between 0.001 and 0.5' },
  { path: 'hazards.vent.baseRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.vent.jetHalfWidthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  // Three rows rather than one, because `jetLengthRatio` is an object rather than a number -- the coverage check wants
  // every leaf named, and each aim is its own leaf.
  { path: 'hazards.vent.jetLengthRatio.up', check: anyNumber, describe: 'a multiple of the lane width' },
  { path: 'hazards.vent.jetLengthRatio.flat', check: anyNumber, describe: 'a multiple of the lane width' },
  { path: 'hazards.vent.jetLengthRatio.down', check: anyNumber, describe: 'a multiple of the lane width' },
  { path: 'hazards.vent.diagonalRadians', check: anyNumber, describe: 'radians' },
  { path: 'hazards.vent.startDelaySeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.vent.periodSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.vent.activeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.vent.warnSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.vent.plumeColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.glowColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.edgeColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.vent.edgeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hazards.mineral.riseSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.mineral.wobbleAmplitude', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.mineral.wobblePeriodSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.mineral.lifeMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.shrimp.driftSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.angler.driftFactor', check: anyNumber, describe: 'a fraction of the current' },
  { path: 'hazards.angler.lureMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.angler.telegraphSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.angler.travelSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.angler.cooldownSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.angler.bowRatio', check: anyNumber, describe: 'a curve amount from -2 to 2' },
  { path: 'hazards.angler.lureColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.angler.lureRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.angler.lurePulsePerSecond', check: anyNumber, describe: 'cycles per second' },
  { path: 'hazards.angler.lureOffsetRatio', check: anyNumber, describe: 'a multiple of the body radius' },
  { path: 'hazards.zapper.ringRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.zapper.ringDamage', check: anyNumber, describe: 'hit points' },
  { path: 'hazards.zapper.ringSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.zapper.ringCooldownSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.zapper.dischargesWhenHit', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'hazards.zapper.bellColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.zapper.ringColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.zapper.ringAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hazards.charge.max', check: anyNumber, describe: 'a number' },
  { path: 'hazards.charge.chainAt', check: anyNumber, describe: 'a threshold' },
  { path: 'hazards.charge.perRingHit', check: anyNumber, describe: 'charge' },
  { path: 'hazards.charge.perSecondNearZapper', check: anyNumber, describe: 'charge per second' },
  { path: 'hazards.charge.decayPerSecond', check: anyNumber, describe: 'charge per second' },
  { path: 'hazards.charge.nearMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.charge.chainRangeMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.charge.chainJumpMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.charge.chainDamage', check: anyNumber, describe: 'hit points' },
  { path: 'hazards.charge.chainMaxTargets', check: wholeNumber, describe: 'a whole number of targets' },
  { path: 'hazards.charge.chainSelfDamage', check: anyNumber, describe: 'hit points' },
  { path: 'hazards.charge.bubbleRingColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.charge.bubbleRingWidthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.charge.burstColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.charge.burstAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hazards.charge.burstSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.foam.radiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.foam.lifeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.foam.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.foam.rimColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.foam.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hazards.foam.rimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hazards.rain.fallSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.rain.pushMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.rain.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.rain.lengthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.torpedo.runSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.torpedo.runMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.torpedo.seekSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.torpedo.seekSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.bombfish.seekSpeedFactor', check: anyNumber, describe: 'lane widths per second' },
  { path: 'hazards.bombfish.armMeters', check: anyNumber, describe: 'metres' },
  { path: 'hazards.bombfish.fuseSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.bombfish.blastRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'hazards.bombfish.blastDamage', check: anyNumber, describe: 'hit points' },
  { path: 'hazards.bombfish.blastShakePixels', check: anyNumber, describe: 'design pixels; 0 disables the shake' },
  { path: 'hazards.bombfish.blastShakeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.slowFactor', check: anyNumber, describe: 'a number' },
  { path: 'hazards.slowSeconds', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'hazards.health', check: (v) => isNumberTable(v) && Object.values(v as Record<string, number>).every((n) => n >= 0), describe: 'an object of hazard kind to hit points, e.g. { fish: 3, jelly: 0 }; 0 means the bullets pass through' },
  /**
   * The hitbox multiplier table. The one rule in this file that accepts an EMPTY object, and that is not laxness --
   * empty means "no creature overrides its shape", which is the default rather than an omission. It still checks the
   * types, and a boot check below refuses a key that is not a hazard kind, which is the failure that would otherwise
   * be silent: a typo'd kind would multiply nothing and read as a knob that does nothing.
   */
  { path: 'hazards.hitboxScale', check: (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.values(v as Record<string, unknown>).every((n) => typeof n === 'number' && Number.isFinite(n)), describe: 'an object of hazard kind to a hitbox multiplier; anything not listed is 1' },
  { path: 'hazards.contactDamage', check: (v) => isNumberTable(v) && Object.values(v as Record<string, number>).every((n) => n >= 0 && n <= 400), describe: 'an object of hazard kind to the hit points it costs the player, e.g. { fish: 20, whale: 35 }; defence comes straight out of these' },
  { path: 'hazards.fleeScreensPerSecond', check: anyNumber, describe: 'screen heights per second; 0.9 is about a second to leave the screen' },
  { path: 'hazards.fleeAlpha', check: anyNumber, describe: 'an opacity for a creature that is leaving' },
  /**
   * The Boids school. One row per key, each with the unit it is in -- they are all lane fractions or per-second rates, and
   * a rate read as a length (or the reverse) is the mistake a bare `anyNumber` would let through. The boot checks below the
   * table refuse the combinations that make the school meaningless.
   */
  ...(
    [
      ['spawnSpread', 'a fraction of the lane width, the radius of the cloud a school is born in'],
      ['neighbourRadius', 'a fraction of the lane width, how far a fish sees its neighbours'],
      ['separationRadius', 'a fraction of the lane width; closer neighbours push apart'],
      ['separationAccel', 'lane widths per second squared'],
      ['alignmentRate', 'per second; how fast velocity is pulled toward the neighbours\' average'],
      ['cohesionAccel', 'lane widths per second squared'],
      ['leaderReach', 'a fraction of the lane width: only fish this close to the invisible leader feel it'],
      ['leaderSteer', "per second; how hard a fish in reach turns toward the leader's velocity"],
      ['leaderTether', 'a fraction of the lane width: past this distance a weak pull toward the leader begins'],
      ['tetherAccel', 'lane widths per second squared; the cap on that pull'],
      ['leaderWaitFloor', 'a share of the leader\'s own pace, above 0 and at most 1: the slowest it walks while it waits for its school'],
      ['minSpeed', 'lane widths per second; a school never hovers'],
      ['maxSpeed', 'lane widths per second'],
      ['maxAccel', 'lane widths per second squared; the cap on the sum of all four forces'],
      ['speedJitter', "a fraction of the leader's speed; 0 makes every fish identical"],
      ['wobbleAmplitude', 'a fraction of the lane width; 0 disables the snaking'],
      ['wobbleSeconds', 'seconds, the main period of the snaking'],
      ['depthRange', 'a fraction of the lane width, the thickness of the school in depth'],
    ] as const
  ).map(([key, describe]) => ({
    path: `hazards.boids.${key}`,
    check: (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    describe: `${describe}; 0 or more`,
  })),
  { path: 'hazards.boids.scale', check: (v) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 2, describe: 'a size multiplier above 0, up to 2; 1 is an ordinary fish' },
  { path: 'hazards.boids.depthDim', check: (v) => typeof v === 'number' && v >= 0 && v <= 1, describe: 'a fraction from 0 (no dimming) to 1' },
  { path: 'hazards.boids.depthTint', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  ...(
    [
      ['scaleNear', 'a size multiplier above 0, up to 2: how big a fish at distance 0 is'],
      ['scaleFar', 'a size multiplier above 0, up to 2: how big a fish at distance 1 is'],
    ] as const
  ).map(([key, describe]) => ({
    path: `hazards.boids.back.${key}`,
    check: (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 2,
    describe,
  })),
  ...(
    [
      ['dimNear', 'a fraction from 0 to 1: how far toward `tint` a fish at distance 0 is'],
      ['dimFar', 'a fraction from 0 to 1: how far toward `tint` a fish at distance 1 is'],
    ] as const
  ).map(([key, describe]) => ({
    path: `hazards.boids.back.${key}`,
    check: (v: unknown) => typeof v === 'number' && v >= 0 && v <= 1,
    describe,
  })),
  { path: 'hazards.boids.back.tint', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.boids.neighbours', check: (v) => wholeNumber(v) && (v as number) >= 1 && (v as number) <= 30, describe: 'a whole number from 1 to 30: how many of the nearest fish alignment and cohesion listen to' },
  { path: 'hazards.boids.cohesionAcrossRatio', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 20, describe: 'a ratio from 1 (round) to 20: how much harder cohesion pulls across the neighbours\' heading than along it' },
  { path: 'hazards.boids.leaderAllowAhead', check: (v) => wholeNumber(v) && (v as number) >= 0, describe: 'a whole number of real fish that may be ahead of the leader before it speeds up to take the front back' },
  { path: 'hazards.boids.leaderCatchUp', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 4, describe: 'a multiple from 1 (never speeds up) to 4: the most the leader speeds up, as a multiple of its own pace' },
  { path: 'hazards.boids.leaderWantFish', check: (v) => wholeNumber(v) && (v as number) >= 1, describe: 'a whole number of real fish the leader needs in reach to walk at full pace' },
  /** The crab: one row per key of its own block, for the reason the config gives at `hazards.crab`. */
  { path: 'hazards.crab.armDistanceMeters', check: anyNumber, describe: 'metres of 0 or more; the distance at which the fuse is lit' },
  { path: 'hazards.crab.fuseSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.crab.launchMps', check: anyNumber, describe: 'metres per second, 0 or more' },
  { path: 'hazards.crab.apexSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.crab.launchScreenBonus', check: anyNumber, describe: 'a multiplier of 0 or more' },
  { path: 'hazards.launchDecaySeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.trash.drainPerSecond', check: anyNumber, describe: 'hit points per second' },
  { path: 'hazards.trash.drainPerHit', check: anyNumber, describe: 'hit points' },
  { path: 'hazards.trash.minGripSeconds', check: anyNumber, describe: 'seconds' },

{ path: 'hazards.eel.boltShockSeconds', check: anyNumber, describe: "seconds between 0 and 10; 0 disables the control loss an eel's bolt causes" },
  ...['archer', 'pistol', 'puffer', 'starfish'].map((kind) => ({
    path: `hazards.${kind}.driftFactor`,
    check: anyNumber,
    describe: 'a multiple of the current; smaller loiters longer',
  })),
  { path: 'hazards.puffer.countersWhenHit', check: (v) => typeof v === 'boolean', describe: 'whether a hit is answered with a ring of spikes' },
  { path: 'hazards.puffer.counterCooldownSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hazards.puffer.spikeCount', check: wholeNumber, describe: 'a whole number of spikes' },
  { path: 'hazards.starfish.volleyCount', check: wholeNumber, describe: 'a whole number of directions' },
  { path: 'hazards.starfish.volleySpinRadians', check: anyNumber, describe: 'radians; 0 means the rosette never turns' },
  { path: 'hazards.eel.shockColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'hazards.eel.shockWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'hazards.invulnerableSeconds', check: anyNumber, describe: 'a number of 0 or more' },
  /**
   * Consumption. The two per-kind tables are checked for PRESENCE of every hazard kind rather than for any
   * particular key set, because the kinds live in `src/hazards.ts` and a new one added there without a row here
   * would otherwise make that hazard silently inedible -- a content bug with no error, which is the worst kind.
   * The loader cannot enumerate the kinds itself, so the check is that the tables agree with EACH OTHER.
   */
  {
    path: 'consumption.tierVolume',
    check: (v) => Array.isArray(v) && v.length >= 2 && v.every((n) => typeof n === 'number' && Number.isFinite(n)) && (v as number[])[0] === 0,
    describe: 'an array of volumes, at least two, starting at 0 (index 0 is tier 1)',
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
  { path: 'consumption.massEfficiency', check: anyNumber, describe: 'a number' },
  { path: 'consumption.bumpDamage', check: anyNumber, describe: 'hit points' },
  { path: 'consumption.eatInvulnerableSeconds', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'consumption.marker.edibleColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'consumption.marker.widthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'consumption.marker.edibleAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'consumption.marker.blockedAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'consumption.marker.showBlocked', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'suction.radiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'suction.radiusPerVolume', check: anyNumber, describe: 'fraction of the lane width' },
  { path: 'suction.maxRadiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'suction.pullPerSecond', check: anyNumber, describe: 'a number' },
  { path: 'suction.heavyRatio', check: anyNumber, describe: 'a ratio' },
  { path: 'suction.heavyFloor', check: anyNumber, describe: 'a fraction' },
  { path: 'suction.moveSpeedFactor', check: anyNumber, describe: 'a fraction' },
  { path: 'suction.fieldColor', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'suction.fieldAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'suction.fieldWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'suction.tetherAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'suction.tetherWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'bullets.image', check: (v) => typeof v === 'string', describe: 'a file name in src/assets/ without its extension, or an empty string for the drawn dot' },
  { path: 'bullets.imageAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'bullets.imageTint', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'bullets.imageScale', check: anyNumber, describe: 'a multiplier' },
  { path: 'bullets.rateTiers', check: (v) => Array.isArray(v) && v.length >= 1 && v.every((n) => typeof n === 'number' && Number.isFinite(n)), describe: 'a non-empty list of rounds-per-second values, one per rate tier; the FIRST is what a run starts at' },
  { path: 'bullets.speedStartPerSecond', check: anyNumber, describe: 'lane widths per second' },
  { path: 'bullets.accelerationPerSecond', check: anyNumber, describe: 'lane widths per second squared' },
  { path: 'bullets.speedMaxPerSecond', check: anyNumber, describe: 'lane widths per second' },
  { path: 'bullets.radiusRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'bullets.radiusGrowthPerSecond', check: anyNumber, describe: 'a fraction of the lane width per second' },
  { path: 'bullets.upgradeSpreadRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'bullets.maxStreams', check: wholeNumber, describe: 'a whole number of gun rows' },
  { path: 'bullets.damage', check: anyNumber, describe: 'a number of hit points' },
  { path: 'bullets.lifeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'bullets.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'bullets.rimAlpha', check: anyNumber, describe: 'an opacity' },
  ...(['colour', 'rimColour'] as const).map((key) => ({
    path: `bullets.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  {
    path: 'hazardArt',
    check: (v) => {
      if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
      return Object.values(v as Record<string, unknown>).every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        // `front` and `charge` are checked here rather than left to the shape check above, because they are the two keys
        // a row can get wrong in a way that shows: a mirrored picture, or a charging creature that keeps its swimming
        // pose. `charge` is optional -- a creature with no wind-up pose is the normal case.
        if (r.front !== undefined && r.front !== 'left' && r.front !== 'right') return false;
        if (r.charge !== undefined && !isArtState(r.charge)) return false;
        if (r.dead !== undefined && !isArtState(r.dead)) return false;
        if (r.spriteFlashScale !== undefined && (typeof r.spriteFlashScale !== 'number' || !Number.isFinite(r.spriteFlashScale))) return false;
        if (r.spin !== undefined && (typeof r.spin !== 'number' || !Number.isFinite(r.spin))) return false;
        if (r.volleyAligned !== undefined && typeof r.volleyAligned !== 'boolean') return false;
        // A finite radians value. Any angle is legal -- a base of 400deg is a base of 40deg -- so this only has to
        // catch a string or a NaN, both of which would reach the sprite's `rotation` and turn the arms into nothing.
        if (r.volleyBaseRadians !== undefined && (typeof r.volleyBaseRadians !== 'number' || !Number.isFinite(r.volleyBaseRadians))) return false;
        if (r.facesPlayer !== undefined && typeof r.facesPlayer !== 'boolean') return false;
        if (r.attackSeconds !== undefined && (typeof r.attackSeconds !== 'number' || !Number.isFinite(r.attackSeconds))) return false;
        /**
         * EITHER a single look or a LIST of them, and never a quiet mixture of the two.
         *
         * A row with `variants` carries no `move`/`scale` of its own, and a row without them must carry both. Making
         * that exclusive is what lets the painter resolve a look without a fallback worth worrying about: `move ?? ''`
         * and `scale ?? 1` would otherwise be two defaults that can hide a row written wrongly.
         */
        const variants = r.variants;
        if (variants !== undefined) {
          if (!Array.isArray(variants) || variants.length === 0) return false;
          if (r.move !== undefined || r.scale !== undefined) return false;
          if (!variants.every((v) => v && typeof v === 'object' && isArtState(v.move) && typeof v.scale === 'number' && Number.isFinite(v.scale))) return false;
        } else if (!isArtState(r.move) || typeof r.scale !== 'number' || !Number.isFinite(r.scale)) {
          return false;
        }
        return typeof r.alpha === 'number' && Number.isFinite(r.alpha);
      });
    },
    describe: 'an object of kind -> { move, scale } or { variants: [{ move, scale }], and either way charge?, attack?, dead?, front?, spriteFlashScale?, spin?, volleyAligned?, volleyBaseRadians?, attackSeconds?, alpha, lure? }, where each state is a picture name or an animation',
  },
  {
    path: 'animations',
    check: (v) => isAnimationTable(v),
    describe: 'an object of animation name -> { frames, count?, framesPerSecond, maxSeconds, once? }; `frames` is a "{n}" pattern plus `count`, or a list of picture names',
  },
  { path: 'hazardFront', check: (v) => v === 'left' || v === 'right', describe: '"left" or "right": which way round a creature with a picture counts as facing' },
  { path: 'hazardFacing.cooldownSeconds', check: anyNumber, describe: 'seconds; 0 lets a creature turn every frame' },
  { path: 'hazardFacing.turnSeconds', check: anyNumber, describe: 'seconds; 0 turns instantly with no animation' },
  { path: 'angry.look.inner', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  // The boss dossiers, expanded: the tombstone's row, then one per kind the file declares.
  ...bossRules('hazards.boss'),
  ...bossDossierKinds().flatMap((kind) => bossRules(`hazards.bosses.${kind}`)),
  { path: 'chargeTrail.image', check: (v) => typeof v === 'string', describe: 'a file name in src/assets/ without its extension, or an empty string to disable it' },
  { path: 'chargeTrail.columns', check: wholeNumber, describe: 'whole columns' },
  { path: 'chargeTrail.rows', check: wholeNumber, describe: 'whole rows' },
  { path: 'chargeTrail.count', check: wholeNumber, describe: 'whole bubbles' },
  { path: 'chargeTrail.spread', check: anyNumber, describe: 'a multiple' },
  { path: 'chargeTrail.jitter', check: anyNumber, describe: 'radians of jitter' },
  { path: 'chargeTrail.scaleVariance', check: anyNumber, describe: 'a fraction' },
  { path: 'chargeTrail.sizeFalloff', check: anyNumber, describe: 'a fraction' },
  { path: 'chargeTrail.behindFactor', check: anyNumber, describe: 'a multiple' },
  { path: 'chargeTrail.frameSeconds', check: anyNumber, describe: 'seconds per frame' },
  { path: 'chargeTrail.sizeRatio', check: anyNumber, describe: 'a lane fraction' },
  { path: 'chargeTrail.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'particles.maxParticles', check: anyNumber, describe: 'a count' },
  { path: 'particles.hitCount', check: anyNumber, describe: 'a count' },
  { path: 'particles.hitSpeed', check: anyNumber, describe: 'metres per second' },
  { path: 'particles.hitLife', check: anyNumber, describe: 'seconds' },
  { path: 'particles.hitSize', check: anyNumber, describe: 'metres' },
  { path: 'particles.defeatCount', check: anyNumber, describe: 'a count' },
  { path: 'particles.defeatSpeed', check: anyNumber, describe: 'metres per second' },
  { path: 'particles.defeatLife', check: anyNumber, describe: 'seconds' },
  { path: 'particles.defeatSize', check: anyNumber, describe: 'metres' },
  { path: 'particles.defeatColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'particles.defeatJitter', check: anyNumber, describe: 'radians of jitter' },
  { path: 'particles.drag', check: anyNumber, describe: 'a per-frame retention' },
  { path: 'particles.descentSpeed', check: anyNumber, describe: 'metres per second' },
  /** The detonation ring, one row per value: see the config's note at `explosions`. */
  { path: 'explosions.seconds', check: anyNumber, describe: 'seconds' },
  { path: 'explosions.strokeColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'explosions.strokeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'explosions.strokeStartRatio', check: anyNumber, describe: 'a multiple of the blast radius' },
  { path: 'explosions.strokeEndRatio', check: anyNumber, describe: 'a multiple of the blast radius' },
  { path: 'explosions.strokeWidthRatio', check: anyNumber, describe: 'a stroke width as a fraction of the radius' },
  { path: 'explosions.coreColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'explosions.coreAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'explosions.coreStartRatio', check: anyNumber, describe: 'a multiple of the blast radius' },
  { path: 'explosions.coreEndRatio', check: anyNumber, describe: 'a multiple of the blast radius' },
  { path: 'loading.scrimColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'loading.scrimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'loading.trackColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'loading.barColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'loading.barHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'loading.maxWidth', check: anyNumber, describe: 'design pixels' },
  { path: 'loading.label', check: (v) => typeof v === 'string', describe: 'a string' },
  { path: 'loading.titleSize', check: anyNumber, describe: 'a font size' },
  { path: 'loading.titleColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'loading.textColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'loading.textSize', check: anyNumber, describe: 'a font size' },
  { path: 'loading.lineHeight', check: anyNumber, describe: 'a line height design pixels' },
  { path: 'loading.gapTitle', check: anyNumber, describe: 'design pixels' },
  { path: 'loading.gapBar', check: anyNumber, describe: 'design pixels' },
  { path: 'loading.gapStats', check: anyNumber, describe: 'design pixels' },
  { path: 'loading.speedWindowSeconds', check: anyNumber, describe: 'seconds that the reported rate is averaged over' },
  { path: 'hitFlash.seconds', check: anyNumber, describe: 'seconds' },
  { path: 'hitFlash.peakIntensity', check: anyNumber, describe: 'an intensity; 0 disables the full-body flash' },
  { path: 'hitFlash.riseFraction', check: anyNumber, describe: 'a fraction of the flash spent rising to its peak' },
  { path: 'hitFlash.cooldownSeconds', check: anyNumber, describe: 'seconds; 0 lets every hit restart the flash' },
  { path: 'hitFlash.colour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'hitFlash.alpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hitFlash.radiusScale', check: anyNumber, describe: 'a multiplier' },
  { path: 'hitFeedback.heavyDamage', check: anyNumber, describe: 'damage at which a hit counts as heavy' },
  { path: 'hitFeedback.critDamage', check: anyNumber, describe: 'damage at which a hit counts as critical; should be above heavyDamage' },
  { path: 'hitFeedback.heavyOutlineColour', check: isColour, describe: 'a colour, either 0xrrggbb or a "#rrggbb" string' },
  { path: 'hitFeedback.heavyOutlineAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'hitFeedback.heavyOutlineRadiusScale', check: anyNumber, describe: 'a multiple of the body radius' },
  { path: 'hitFeedback.heavyOutlineWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'hitFeedback.heavyOutlineSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hitFeedback.heavyShakePixels', check: anyNumber, describe: 'design pixels; 0 disables the heavy hit shake' },
  { path: 'hitFeedback.heavyShakeSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'hitKnockback.meters', check: anyNumber, describe: 'metres of recoil per landed hit; 0 turns the knockback off' },
  { path: 'hitKnockback.seconds', check: anyNumber, describe: 'seconds, over which the recoil is spent' },
  { path: 'playerBubble.image', check: (v) => typeof v === 'string', describe: 'a file name in src/assets/ without its extension, or an empty string for the drawn bubble' },
  { path: 'playerBubble.imageAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'playerBubble.imageTint', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'playerBubble.imageRotation', check: anyNumber, describe: 'degrees' },
  { path: 'playerBubble.imageScale', check: anyNumber, describe: 'a multiplier' },
  { path: 'playerBubble.keepDetails', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'codex.previewScrimColour', check: isColour, describe: 'a colour, either 0xrrggbb or a #rrggbb string' },
  { path: 'codex.previewScrimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'codex.columns', check: wholeNumber, describe: 'a whole number of columns' },
  { path: 'codex.rows', check: wholeNumber, describe: 'a whole number of rows' },
  { path: 'codex.margin', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.gap', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.headerHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.footerHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.titleSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.titleY', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.tabHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.tabGap', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.tabTextSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.pageTextSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.cardRadius', check: anyNumber, describe: 'a corner radius' },
  { path: 'codex.cardFillAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'codex.cardStrokeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'codex.cardPad', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.iconSize', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.nameSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.taglineSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.factSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.factLeading', check: anyNumber, describe: 'line spacing' },
  { path: 'codex.factLabelWidth', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.noteSize', check: anyNumber, describe: 'a font size' },
  { path: 'codex.noteLeading', check: anyNumber, describe: 'line spacing' },
  { path: 'codex.noteBulletIndent', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.buttonHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.buttonPad', check: anyNumber, describe: 'design pixels' },
  { path: 'codex.buttonRadius', check: anyNumber, describe: 'a corner radius' },
  { path: 'codex.buttonTextSize', check: anyNumber, describe: 'a font size' },
  ...CODEX_COLOURS.map((key) => ({
    path: `codex.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'menu.buttonHeight', check: anyNumber, describe: 'the shared height of the three stones, in design pixels' },
  { path: 'menu.buttonGap', check: anyNumber, describe: 'design pixels' },
  { path: 'menu.codexEnabled', check: (v) => typeof v === 'boolean', describe: 'true or false: whether the main menu has a codex button (false also keeps the codex module from loading)' },
  { path: 'menu.buttonPressDrop', check: anyNumber, describe: 'design pixels' },
  { path: 'menu.groupCentreRatio', check: anyNumber, describe: 'a fraction of the screen height' },
  { path: 'menu.titleWidthRatio', check: anyNumber, describe: 'a fraction of the lane width' },
  { path: 'menu.titleAspect', check: anyNumber, describe: 'width divided by height of the title picture' },
  { path: 'menu.titleButtonGap', check: anyNumber, describe: 'design pixels' },
  /**
   * The menu backdrop's numbers, in one block.
   *
   * A loop rather than seventeen rows: they are one feature, every one of them is a plain length or rate, and the
   * whole block lives or dies together -- which is what makes a list here safe where the per-kind tables elsewhere are
   * not.
   */
  ...[
    ['minAlive', 'a count of creatures'],
    ['maxAlive', 'a count of creatures'],
    ['spawnGapSeconds', 'seconds'],
    ['speedMin', 'screen widths per second'],
    ['speedMax', 'screen widths per second'],
    ['driftRatio', 'a fraction of the horizontal speed'],
    ['turnEverySeconds', 'seconds'],
    ['fishTurnEverySeconds', 'seconds'],
    ['turnBand', 'a fraction of the screen width'],
    ['burstScale', 'a speed multiple'],
    ['burstSeconds', 'seconds at full speed'],
    ['burstFallSeconds', 'seconds spent slowing back down'],
    ['burstEverySeconds', 'seconds'],
    ['creatureScale', 'a size multiple'],
    ['creatureAlpha', 'an opacity'],
    ['schoolChance', 'a probability'],
    ['schoolMin', 'a count of creatures'],
    ['schoolMax', 'a count of creatures'],
    ['fishSchoolChance', 'a probability'],
    ['fishSchoolMin', 'a count of creatures'],
    ['fishSchoolMax', 'a count of creatures'],
    ['fishChance', 'a probability'],
    ['crawlerSpeedScale', 'a speed multiple'],
    ['crawlerBandTop', 'a fraction of the screen height'],
    ['backCoralCount', 'a count of corals'],
    ['backCoralHalfWidth', 'a fraction of the screen width'],
    ['backCoralBottom', 'a fraction of the screen height; negative is below the edge'],
    ['frontCoralCount', 'a count of corals'],
    ['frontCoralHalfWidth', 'a fraction of the screen width'],
    ['frontCoralBottom', 'a fraction of the screen height; negative is below the edge'],
    ['exitSeconds', 'seconds'],
    ['fadeSeconds', 'seconds'],
  ].map(([key, describe]) => ({ path: `menu.backdrop.${key}`, check: anyNumber, describe: describe as string })),
  /**
   * The loner list, which is a list rather than a number.
   *
   * Its CONTENTS are not this file's to check: whether a name is one of the creatures that actually swims in the menu
   * is known only where that list is, and a wrong name there is a knob that does nothing at all while looking like it
   * does something. See the note in `src/menuBackdrop.ts`.
   */
  {
    path: 'menu.backdrop.loners',
    check: (v) => Array.isArray(v) && v.every((k) => typeof k === 'string'),
    describe: 'a list of hazard kind names that never arrive in a batch',
  },
  /**
   * The deep-sea lighting, the same way -- except for the three COLOURS, which are out of the loop.
   *
   * `isColour` is a different check from `anyNumber`, and the loop's whole point is that every row in it is the same
   * kind of thing; folding a colour in would make one row the odd one out in a list nobody would think to read twice.
   */
  { path: 'menu.lighting.glowColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'menu.lighting.beamColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'menu.lighting.darknessColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  ...[
    ['glowCentreY', 'a fraction of the screen height; negative is above the top'],
    ['glowRadius', 'a fraction of the screen'],
    ['glowAlpha', 'an opacity'],
    ['glowMidOffset', 'a fraction along the gradient'],
    ['glowMidAlpha', 'an opacity'],
    ['glowPulse', 'a fraction of the base brightness'],
    ['glowDrift', 'a fraction of the screen height'],
    ['glowSeconds', 'seconds'],
    ['beamCount', 'a count of beams'],
    ['beamWidth', 'a fraction of the lane width'],
    ['beamHeight', 'a fraction of the screen height'],
    ['beamTop', 'a fraction of the screen height; negative is above the top'],
    ['beamFirstX', 'a fraction of the lane width'],
    ['beamSpread', 'a fraction of the lane width'],
    ['beamLean', 'radians'],
    ['beamPitch', 'radians'],
    ['beamNarrow', 'a fraction of the beam width'],
    ['beamAlpha', 'an opacity'],
    ['beamFadeMidOffset', 'a fraction along the beam'],
    ['beamFadeMidAlpha', 'a fraction'],
    ['beamSway', 'radians'],
    ['beamSwaySeconds', 'seconds'],
    ['beamWidthSeconds', 'seconds'],
    ['beamDrift', 'a fraction of the lane width'],
    ['beamDriftSeconds', 'seconds'],
    ['beamPulse', 'an opacity'],
    ['beamPulseSeconds', 'seconds'],
    ['darknessTopAlpha', 'an opacity'],
    ['darknessMidOffset', 'a fraction of the screen height'],
    ['darknessMidAlpha', 'an opacity'],
  ].map(([key, describe]) => ({ path: `menu.lighting.${key}`, check: anyNumber, describe: describe as string })),
  /**
   * The specks and the bubbles, the same way -- with their two colours out of the loop for the same reason.
   *
   * The bubble's is `tint` rather than `colour` now: the pictures carry their own colours, so this one MULTIPLIES
   * them rather than being them, and its default of white is the identity. A key called `colour` whose default meant
   * "no colour" would be the wrong word for the thing.
   */
  { path: 'menu.water.motes.colour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'menu.water.bubbles.tint', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  ...[
    ['count', 'a count of specks'],
    ['size', 'a fraction of the lane width'],
    ['sizeVariance', 'a fraction of the size'],
    ['speed', 'screen heights per second'],
    ['speedVariance', 'a fraction of the speed'],
    ['drift', 'a fraction of the lane width per second'],
    ['baseAlpha', 'an opacity; the speck with no light on it'],
    ['litAlpha', 'an opacity; what the brightest light adds'],
    ['fadeEdge', 'a fraction of the screen height'],
  ].map(([key, describe]) => ({ path: `menu.water.motes.${key}`, check: anyNumber, describe: describe as string })),
  ...[
    ['vents', 'a count of vents'],
    ['perStringMin', 'a count of bubbles'],
    ['perStringMax', 'a count of bubbles'],
    ['everySeconds', 'seconds'],
    ['everyJitter', 'a fraction of the interval'],
    ['gap', 'a fraction of the screen height'],
    ['size', 'the largest bubble\'s diameter, as a fraction of the lane width'],
    ['speed', 'screen heights per second'],
    ['speedJitter', 'a fraction of the speed'],
    ['accel', 'a multiple per second'],
    ['sway', 'a fraction of the lane width'],
    ['swayJitter', 'a fraction of the swell'],
    ['swaySeconds', 'seconds'],
    ['swaySecondsJitter', 'a fraction of the period'],
    ['fadeEdge', 'a fraction of the screen height'],
    ['nearAlpha', 'an opacity; the nearest vent'],
    ['farAlpha', 'an opacity; the furthest vent'],
  ].map(([key, describe]) => ({ path: `menu.water.bubbles.${key}`, check: anyNumber, describe: describe as string })),
  ...[
    ['everySeconds', 'seconds'],
    ['everyJitter', 'a fraction of the interval'],
    ['size', "the largest bubble's diameter, as a fraction of the screen width"],
    ['speed', 'screen heights per second'],
    ['speedJitter', 'a fraction of the speed'],
    ['accel', 'a multiple per second'],
    ['growSeconds', 'seconds'],
    ['sway', 'a fraction of the screen width'],
    ['swayJitter', 'a fraction of the swell'],
    ['swaySeconds', 'seconds'],
    ['swaySecondsJitter', 'a fraction of the period'],
    ['alpha', 'an opacity'],
  ].map(([key, describe]) => ({ path: `menu.uiBubbles.${key}`, check: anyNumber, describe: describe as string })),
  { path: 'menu.uiBubbles.tint', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  ...[
    ['tileWidth', 'design pixels'],
    ['driftX', 'a fraction of the box width per second'],
    ['driftY', 'a fraction of the box height per second'],
    ['crossDriftX', 'a fraction of the box width per second'],
    ['crossDriftY', 'a fraction of the box height per second'],
    ['alpha', 'an opacity'],
    ['crossAlpha', "a fraction of the first layer's opacity"],
    ['axisDegrees', 'degrees from the horizontal'],
    ['crossAxisDegrees', 'degrees from the horizontal'],
  ].map(([key, describe]) => ({ path: `menu.caustics.${key}`, check: anyNumber, describe: describe as string })),
  { path: 'menu.caustics.lightColor', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'menu.caustics.warpAmount', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 0.2, describe: 'a fraction of a tile, 0 to 0.2: how far the flow warp moves a point (0 turns it off)' },
  { path: 'menu.caustics.warpWavelength', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0.05 && v <= 2, describe: 'a fraction of a tile, 0.05 to 2: the wavelength of the warp ripples' },
  { path: 'menu.caustics.warpSeconds', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0.5 && v <= 120, describe: 'seconds, 0.5 to 120: how long a warp phase takes to go round' },
  { path: 'menu.caustics.breatheAmount', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 0.8, describe: 'a fraction, 0 to 0.8: how far the breathing stretch pulls (0 turns it off)' },
  { path: 'menu.caustics.breatheSeconds', check: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0.5 && v <= 120, describe: 'seconds, 0.5 to 120: one breath of the stretch' },
  { path: 'menu.caustics.crossSpeedRatio', check: (v) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 4, describe: "a ratio above 0, up to 4: the second layer's deformation rate as a share of the first's" },
  ...[
    ['perRow', 'how many pills fit on a row'],
    ['maxRowWidthRatio', 'a fraction of the panel content width'],
    ['rowHeight', 'design pixels'],
    ['radius', 'a corner radius'],
    ['rowGap', 'design pixels'],
    ['textSize', 'a font size'],
  ].map(([key, describe]) => ({ path: `settings.levels.${key}`, check: anyNumber, describe: describe as string })),
  ...[
    'selectedFill',
    'selectedStroke',
    'selectedTextColour',
    'idleFill',
    'idleStroke',
    'idleTextColour',
  ].map((key) => ({
    path: `settings.levels.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'audio.clearSting.notes', check: (v) => Array.isArray(v) && v.length >= 1 && v.every((n) => typeof n === 'number' && Number.isFinite(n)), describe: 'a non-empty list of semitone offsets from the track root' },
  { path: 'audio.clearSting.gapSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'audio.clearHoldSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'audio.ascendScreensPerSecond', check: anyNumber, describe: 'screen heights per second' },
  { path: 'summary.maxWidth', check: anyNumber, describe: 'design pixels' },
  { path: 'summary.maxHeight', check: anyNumber, describe: 'design pixels' },
  { path: 'summary.scoreSize', check: anyNumber, describe: 'a font size' },
  { path: 'summary.scoreColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.lineSize', check: anyNumber, describe: 'a font size' },
  { path: 'summary.lineColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.panelColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.panelRimColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.scrimColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.scrimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'summary.buttonColour', check: isColour, describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'summary.buttonLabel', check: (v) => typeof v === 'string' && v.length >= 1, describe: 'a non-empty label' },
  { path: 'audio.music.volume', check: anyNumber, describe: 'a level' },
  {
    path: 'audio.music.tracks',
    check: (v) =>
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      Object.values(v as Record<string, unknown>).every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        const waveOk = (w: unknown) => w === 'sine' || w === 'square' || w === 'sawtooth' || w === 'triangle';
        return (
          typeof r.rootHz === 'number' &&
          r.rootHz > 20 &&
          r.rootHz < 2000 &&
          typeof r.stepPerMinute === 'number' &&
          r.stepPerMinute > 4 &&
          r.stepPerMinute <= 600 &&
          typeof r.stepsPerChord === 'number' &&
          Number.isInteger(r.stepsPerChord) &&
          r.stepsPerChord >= 1 &&
          r.stepsPerChord <= 32 &&
          Array.isArray(r.chords) &&
          r.chords.length >= 1 &&
          r.chords.every((c) => Array.isArray(c) && c.length >= 1 && c.every((n) => typeof n === 'number')) &&
          Array.isArray(r.pattern) &&
          r.pattern.length >= 1 &&
          r.pattern.every((n) => typeof n === 'number' && Number.isInteger(n)) &&
          waveOk(r.wave) &&
          waveOk(r.padWave) &&
          typeof r.arpGain === 'number' &&
          r.arpGain >= 0 &&
          r.arpGain <= 1 &&
          typeof r.padGain === 'number' &&
          r.padGain >= 0 &&
          r.padGain <= 1 &&
          typeof r.noteSeconds === 'number' &&
          r.noteSeconds > 0.02 &&
          r.noteSeconds <= 8 &&
          typeof r.cutoffHz === 'number' &&
          r.cutoffHz >= 80 &&
          r.cutoffHz <= 12000 &&
          typeof r.detuneCents === 'number' &&
          Math.abs(r.detuneCents) <= 100
        );
      }),
    describe: 'an object of level id to a music recipe (rootHz, stepPerMinute, stepsPerChord, chords, pattern, wave, padWave, arpGain, padGain, noteSeconds, cutoffHz, detuneCents)',
  },
  { path: 'audio.ambientVolume', check: anyNumber, describe: 'a level' },
  { path: 'audio.musicVolume', check: anyNumber, describe: 'an opacity-like level' },
  { path: 'audio.bulletHitVolume', check: anyNumber, describe: 'a level; 0 mutes the bullet hit' },
  { path: 'audio.bulletFireVolume', check: anyNumber, describe: 'a level; 0 mutes the shot' },
  { path: 'obstacles.contactDamage', check: anyNumber, describe: 'hit points' },
  { path: 'obstacles.health', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to hit points' },
  { path: 'obstacles.radius', check: (v) => isNumberTable(v) && Object.keys(v).length >= 1, describe: 'an object of obstacle kind to a radius fraction' },
  {
    path: 'obstacles.ramVolume',
    check: (v) =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.entries(v as Record<string, unknown>).every(([, x]) => x === null || (typeof x === 'number' && Number.isFinite(x))),
    describe: 'an object of obstacle kind to a volume, or to null for "cannot be rammed at all"',
  },
  { path: 'obstacles.minGapFraction', check: anyNumber, describe: 'a fraction' },
  { path: 'obstacles.ramVolumeThreshold', check: anyNumber, describe: 'a volume of 0 or more' },
  { path: 'obstacles.ramDamagePerVolume', check: anyNumber, describe: 'a number' },
  { path: 'obstacles.collideDamage', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'obstacles.collideInvulnerableSeconds', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'obstacles.netDrag', check: anyNumber, describe: 'a speed multiplier' },
  { path: 'obstacles.netDragSeconds', check: anyNumber, describe: 'a number of 0 or more' },
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
  { path: 'obstacles.netMesh', check: wholeNumber, describe: 'a whole number of mesh lines' },
  { path: 'obstacles.crackWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },  { path: 'obstacles.damagedDarken', check: anyNumber, describe: 'a fraction' },
  {
    path: 'obstacles.art',
    check: (v) => {
      if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
      return Object.values(v as Record<string, unknown>).every((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
        const r = row as Record<string, unknown>;
        if (!Array.isArray(r.variants) || r.variants.length === 0) return false;
        if (!r.variants.every((v) => v && typeof v === 'object' && typeof v.image === 'string' && v.image.length > 0 && typeof v.scale === 'number' && Number.isFinite(v.scale))) return false;
        return (
          typeof r.alpha === 'number' && Number.isFinite(r.alpha) &&
          typeof r.swayDegrees === 'number' && Number.isFinite(r.swayDegrees) &&
          typeof r.swaySeconds === 'number' && Number.isFinite(r.swaySeconds)
        );
      });
    },
    describe: 'an object of obstacle kind -> { variants: [{ image, scale }], alpha, swayDegrees, swaySeconds }; each obstacle picks one variant by its own id',
  },
  { path: 'emergence.fishPerceptionBaseMeters', check: anyNumber, describe: 'a number' },
  { path: 'emergence.fishPerceptionPerVolume', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'emergence.fishFeedToSplit', check: anyNumber, describe: '2 or more, or nothing would ever split' },
  { path: 'emergence.fishHardCap', check: anyNumber, describe: '1 or more' },
  { path: 'emergence.seekBiggestRangeMeters', check: anyNumber, describe: 'a number' },
  { path: 'spawning.enterSpeedMps', check: anyNumber, describe: 'a number' },
  { path: 'spawning.offscreenMarginRatio', check: anyNumber, describe: 'a fraction' },
  { path: 'spawning.bottomMarginRatio', check: anyNumber, describe: 'a fraction' },
  { path: 'spawning.insideMarginRatio', check: anyNumber, describe: 'a fraction' },
  { path: 'spawning.entryDepth', check: anyNumber, describe: 'a fraction' },
  // --- the volatile bubble. Colours and the appearance rows have their own checks below. ---
  { path: 'angry.rage.max', check: anyNumber, describe: 'a number' },
  { path: 'angry.rage.perHit', check: anyNumber, describe: 'a number, or no hit would ever matter' },
  { path: 'angry.rage.decayPerSecond', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'angry.rage.decayDelaySeconds', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'angry.charge.launchScreenSpeed', check: anyNumber, describe: 'a number' },
  { path: 'angry.charge.launchLateralSpeed', check: anyNumber, describe: 'a number' },
  { path: 'angry.charge.slamSeconds', check: anyNumber, describe: 'a number' },
  { path: 'angry.charge.slamDamageBase', check: anyNumber, describe: 'a number' },
  { path: 'angry.charge.slamRageScale', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'angry.charge.rageCostPerHit', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'angry.charge.rageCostPerBreak', check: anyNumber, describe: 'a number of 0 or more' },
  { path: 'angry.charge.slamBreaksUnrammable', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'angry.charge.defaultAimX', check: anyNumber, describe: 'a direction' },
  { path: 'angry.charge.defaultAimY', check: anyNumber, describe: 'a direction' },
  { path: 'angry.slamRadiusBonus', check: anyNumber, describe: 'a fraction' },
  { path: 'angry.burst.radiusBaseRatio', check: anyNumber, describe: 'a fraction of the lane' },
  { path: 'angry.burst.radiusMaxRatio', check: anyNumber, describe: 'a fraction of the lane' },
  { path: 'angry.burst.obstacleDamage', check: anyNumber, describe: 'a number' },
  { path: 'angry.burst.knockbackMeters', check: anyNumber, describe: 'a number' },
  { path: 'angry.burst.pushImpact', check: anyNumber, describe: 'a number' },
  {
    path: 'angry.burst.hazardMode',
    check: (v) =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.values(v as Record<string, unknown>).every((x) => x === 'destroy' || x === 'push'),
    describe: 'an object of hazard kind to "destroy" or "push"',
  },
  { path: 'angry.burst.waveSeconds', check: anyNumber, describe: 'a number' },
  { path: 'angry.burst.waveWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'angry.burst.waveColour', check: (v) => isColour(v), describe: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { path: 'angry.gauge.widthRatio', check: anyNumber, describe: 'a fraction of the lane' },
  { path: 'angry.overload.seconds', check: anyNumber, describe: 'a number' },
  { path: 'angry.overload.steerFactor', check: anyNumber, describe: 'a speed multiplier' },
  { path: 'angry.overload.radiusBonus', check: anyNumber, describe: 'a fraction' },
  { path: 'angry.overload.ramDamage', check: anyNumber, describe: 'a number' },
  { path: 'angry.overload.releaseHealth', check: anyNumber, describe: 'a number' },
  { path: 'angry.overload.punishDamage', check: anyNumber, describe: 'hit points' },
  { path: 'angry.gauge.height', check: anyNumber, describe: 'design pixels' },
  { path: 'angry.gauge.gap', check: anyNumber, describe: 'design pixels' },
  { path: 'angry.gauge.radius', check: anyNumber, describe: 'a corner radius' },
  { path: 'angry.gauge.trackAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.gauge.trackStrokeAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.gauge.fillAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.gauge.tickAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.gauge.tickWidth', check: anyNumber, describe: 'a stroke width' },
  ...(['trackColour', 'trackStroke', 'tickColour'] as const).map((key) => ({
    path: `angry.gauge.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
  { path: 'angry.look.radius', check: anyNumber, describe: 'a multiplier' },
  { path: 'angry.look.innerAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.look.rimAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.look.rimWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'angry.look.glowInnerAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.look.glowInnerRadiusRatio', check: anyNumber, describe: 'a radius ratio' },
  { path: 'angry.look.innerRing', check: (v) => typeof v === 'boolean', describe: 'true or false' },
  { path: 'angry.look.innerRingAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.look.innerRingWidthRatio', check: anyNumber, describe: 'a stroke width ratio' },
  { path: 'angry.look.sheenAlpha', check: anyNumber, describe: 'an opacity' },
  { path: 'angry.look.specularAlpha', check: anyNumber, describe: 'an opacity' },

  /**
   * --- the skills and the talents ---
   *
   * One row per NUMBER rather than one per block, for the reason the appearance arrays have one row per key: the
   * failure this table exists for is a hand-edit that is out of range, and "skills.dash is invalid" would leave the
   * owner hunting. Disjoint ranges on purpose -- `uses` is a whole number of presses and `ascentMultiplier` is a
   * speed, and a row that accepted both would be a row that catches neither.
   */
  { path: 'skills.dash.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.dash.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.dash.ascentMultiplier', check: anyNumber, describe: 'an ascent multiplier' },

  { path: 'skills.decoy.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.decoy.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.decoy.decoyRadiusMeters', check: anyNumber, describe: 'metres' },
  { path: 'skills.decoy.decoySeconds', check: anyNumber, describe: 'seconds' },

  { path: 'skills.vortex.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.vortex.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.vortex.vortexRadiusMeters', check: anyNumber, describe: 'metres' },
  { path: 'skills.vortex.vortexPullPerSecond', check: anyNumber, describe: 'a pull of 0.1 to 20 times the distance per second' },

  { path: 'skills.stink.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.stink.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.stink.stinkRadiusMeters', check: anyNumber, describe: 'metres' },

  { path: 'skills.shell.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.shell.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.shell.invulnerableSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'skills.shell.shellRadiusMeters', check: anyNumber, describe: 'metres' },

  { path: 'skills.burst.uses', check: wholeNumber, describe: 'a whole number of uses' },
  { path: 'skills.burst.durationSeconds', check: anyNumber, describe: 'seconds; 0 means the effect is instant' },
  { path: 'skills.burst.burstRadiusMeters', check: anyNumber, describe: 'metres' },

  { path: 'talents.soda.ascentMultiplier', check: anyNumber, describe: 'an ascent multiplier' },
  { path: 'talents.soda.steerPenalty', check: anyNumber, describe: 'a fraction of the steering authority' },
  { path: 'talents.silt.startVolume', check: anyNumber, describe: 'a starting volume' },
  { path: 'talents.silt.defense', check: anyNumber, describe: 'defence points' },
  { path: 'talents.fish-fart.radiusMeters', check: anyNumber, describe: 'metres' },
  { path: 'talents.fish-fart.cooldownSeconds', check: anyNumber, describe: 'seconds' },
  { path: 'talents.fish-fart.baitCount', check: wholeNumber, describe: 'a whole number of bait bubbles' },

  /**
   * The debug overlay. Every key is either a length or a colour, so the table is two loops rather than eleven rows --
   * and `debug` is the one section whose keys are all the same kind, which is what makes that safe to do.
   */
  ...[
    ['width', 'design pixels'],
    ['alpha', 'an opacity'],
    ['dashLength', 'design pixels'],
    ['dashGap', 'design pixels'],
  ].map(([key, describe]) => ({ path: `debug.${key}`, check: anyNumber, describe: describe as string })),
  ...[
    'creatureColour',
    'environmentColour',
    'obstacleColour',
    'playerBulletColour',
    'enemyBulletColour',
    'playerColour',
    'grazeColour',
  ].map((key) => ({
    path: `debug.${key}`,
    check: isColour,
    describe: 'a colour, either 0xrrggbb or "#rrggbb"',
  })),
];

/**
 * The parts of the file that are validated AS A WHOLE rather than one path at a time.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS LIST EXISTS
 * ---------------------------------------------------------------------------------------------
 * `REQUIRED` says "this path must be there, and look like this". It cannot say the reverse: that a path in the FILE has
 * a rule at all. So a knob added to `config/mechanics.json5` and read by code, with no row above, was validated by
 * nothing -- and a knob added to the file and read by NOBODY was not even noticed, which is the mistake this project
 * calls out everywhere else (a misspelled key is silently ignored).
 *
 * The check below walks every leaf of the parsed file and demands one of:
 *
 *   - a `REQUIRED` row for that exact path, or
 *   - an entry here for that path or an ancestor of it, saying which pass does validate it.
 *
 * Every entry therefore has to NAME its pass, because "listed here" with no reason is how an exception becomes a hole.
 * Arrays are leaves for this purpose: `stages.speedMultiplier` is checked as a list, not index by index.
 */
const VALIDATED_AS_A_WHOLE: readonly { path: string; by: string }[] = [
  // The two appearance arrays: one pass per KEY, naming the stage and the key, so a mistake is a message rather than a
  // hunt through thirty values. See APPEARANCE_RULES and RAGE_APPEARANCE_RULES. (`stages.appearance` also has a
  // whole-block rule; the rage one does not, which is the asymmetry this list is for.)
  { path: 'angry.appearance', by: 'RAGE_APPEARANCE_RULES, key by key' },
];

/**
 * Walk the parsed file to its leaves, so the check below can ask about each one.
 *
 * Arrays and scalars are leaves: a list is validated as a list, and its elements are not paths anyone can name in a
 * rule. An empty block is a leaf too -- a block with nothing in it is worth naming.
 */
function leavesOf(value: unknown, path: string, out: string[]): void {
  const isBranch =
    value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
  if (!isBranch) {
    out.push(path);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    leavesOf(child, path ? `${path}.${key}` : key, out);
  }
}

if (parsed === null || typeof parsed !== 'object') fail('the top level must be an object');

for (const rule of REQUIRED) {
  const value = readRaw(rule.path);
  if (value === undefined) fail(`"${rule.path}" is missing. It should be ${rule.describe}.`);
  if (!rule.check(value)) fail(`"${rule.path}" is ${JSON.stringify(value)}, but it should be ${rule.describe}.`);
}

/**
 * And the reverse of the loop above: every value in the FILE has a rule.
 *
 * Runs after it so that a key which is simply MISSING gets that message -- the more specific one -- rather than being
 * reported as a stray on the other side.
 *
 * The other direction that is deliberately NOT checked: a rule whose key the file does not have. That was here, and it
 * could never say anything the loop above does not say better ("…is missing. It should be …").
 */
{
  const ruled = REQUIRED.map((rule) => rule.path);
  /**
   * A rule covers a leaf when it names that leaf OR an ANCESTOR of it: a rule for `hazardArt` that checks the whole
   * block is a rule about every key inside it, and demanding one row per art key as well would be the parallel-list
   * problem this check exists to catch.
   */
  const covered = (leaf: string): boolean => {
    const byPrefix = (path: string): boolean => leaf === path || leaf.startsWith(`${path}.`);
    return ruled.some(byPrefix) || VALIDATED_AS_A_WHOLE.some((entry) => byPrefix(entry.path));
  };

  const leaves: string[] = [];
  leavesOf(parsed, '', leaves);
  const unaccounted = leaves.filter((leaf) => !covered(leaf));
  if (unaccounted.length) {
    fail(
      `${unaccounted.length} value(s) in the file are validated by nothing: ${unaccounted.join(', ')}. ` +
        'Every knob needs a rule in REQUIRED (so a bad value names itself), or an entry in VALIDATED_AS_A_WHOLE saying ' +
        'which pass does check it. An unvalidated key is a key that silently does nothing when it is misspelled.',
    );
  }
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
  { key: 'minRage', ok: anyNumber, what: 'a rage of 0 or more' },
  { key: 'rim', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'glow', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'sheen', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'specular', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'hudColor', ok: isColour, what: 'a colour, either 0xrrggbb or "#rrggbb"' },
  { key: 'shake', ok: anyNumber, what: 'a fraction' },
  { key: 'swell', ok: anyNumber, what: 'a fraction' },
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
 * The same completeness rule for the damage table, and the reason it is a SEPARATE check rather than a second row
 * of the one above: the two tables answer different questions and a kind can legitimately appear in one and not
 * the other's mind. `health: 0` means "immune to bullets"; there is no equivalent for damage -- every creature
 * that can touch you has a number, and a missing row would read as "this one cannot hurt you", which is a thing
 * the game does not have.
 */
{
  const rows = Object.keys(mech.hazards.contactDamage).sort();
  const kinds = Object.keys(mech.consumption.mass).sort();
  const missing = kinds.filter((k) => !rows.includes(k));
  const extra = rows.filter((k) => !kinds.includes(k));
  if (missing.length || extra.length) {
    fail(
      'hazards.contactDamage must state a damage for every hazard kind' +
        (missing.length ? `; missing: ${missing.join(', ')}` : '') +
        (extra.length ? `; not a hazard kind: ${extra.join(', ')}` : ''),
    );
  }
}

/**
 * Every kind named in the hitbox multiplier table must be a real one.
 *
 * The table may be empty -- that is the default -- but it may not contain a NAME THAT IS NOT A CREATURE. The failure
 * is the quiet kind in the same way the shooter list's is: a typo would multiply nothing, the creature would keep the
 * shape its sprite gives it, and the only evidence would be that a knob at the top of a file did nothing when it was
 * turned. Nothing about that reads as a config error from inside the game.
 */
{
  const kinds = Object.keys(mech.consumption.mass);
  const unknown = Object.keys(mech.hazards.hitboxScale).filter((k) => !kinds.includes(k));
  if (unknown.length) {
    fail(`hazards.hitboxScale names something that is not a hazard kind: ${unknown.join(', ')}`);
  }
}

/**
 * Every kind named as a charger or a shooter must be a real creature.
 *
 * The failure this prevents is quiet in both directions: a typo in `charges.kinds` means nothing ever charges and the
 * feature looks broken, and a kind that was renamed leaves a name behind that nobody notices. Neither has a symptom
 * on screen, so it has to be a boot error.
 *
 * The shooters half was claimed by the comment but never actually checked (found while adding the gunners):
 * a typo'd shooter row is a creature that silently never fires, which is the same quiet failure one table over.
 */
{
  const kinds = Object.keys(mech.consumption.mass);
  const unknownChargers = Object.keys(mech.charges.chargers).filter((k) => !kinds.includes(k));
  if (unknownChargers.length) {
    fail(`charges.chargers names something that is not a hazard kind: ${unknownChargers.join(', ')}`);
  }
  const unknownShooters = Object.keys(mech.enemyBullets.shooters).filter((k) => !kinds.includes(k));
  if (unknownShooters.length) {
    fail(`enemyBullets.shooters names something that is not a hazard kind: ${unknownShooters.join(', ')}`);
  }
}

/**
 * The Boids numbers must describe a school that can exist.
 *
 * Each is range-checked on its own by its rule; these are the relations BETWEEN them, which a per-key rule cannot see:
 * a floor above the ceiling is a speed no fish can have, a push radius wider than the view makes alignment and cohesion
 * act on fish the separation has already flung apart, and a zero ceiling is a school that never moves.
 */
{
  const b = mech.hazards.boids;
  if (b.minSpeed > b.maxSpeed) fail(`hazards.boids.minSpeed (${b.minSpeed}) is above maxSpeed (${b.maxSpeed})`);
  if (!(b.maxSpeed > 0)) fail('hazards.boids.maxSpeed must be above 0, or the school never moves');
  if (b.separationRadius > b.neighbourRadius) {
    fail(`hazards.boids.separationRadius (${b.separationRadius}) is wider than neighbourRadius (${b.neighbourRadius})`);
  }
  if (!(b.maxAccel > 0)) fail('hazards.boids.maxAccel must be above 0, or no force can ever act');
  if (!(b.wobbleSeconds > 0)) fail('hazards.boids.wobbleSeconds must be above 0: it is a period');
  if (b.back.scaleFar > b.back.scaleNear) fail(`hazards.boids.back.scaleFar (${b.back.scaleFar}) is above scaleNear (${b.back.scaleNear}): a far fish would be bigger than a near one`);
  if (b.back.dimFar < b.back.dimNear) fail(`hazards.boids.back.dimFar (${b.back.dimFar}) is below dimNear (${b.back.dimNear}): a far fish would be brighter than a near one`);
  if (!(b.leaderWaitFloor > 0) || b.leaderWaitFloor > 1) fail(`hazards.boids.leaderWaitFloor (${b.leaderWaitFloor}) must be above 0 and at most 1: at 0 the leader would stop for good the moment it lost its school`);
  if (!(b.leaderReach > 0)) fail('hazards.boids.leaderReach must be above 0, or the leader reaches no fish and the school does not follow it');
  if (b.leaderTether < b.leaderReach) {
    fail(`hazards.boids.leaderTether (${b.leaderTether}) is inside leaderReach (${b.leaderReach}): the tether would pull fish the leader is already steering`);
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
  ['hazards.eel.shockColor', () => mech.hazards.eel.shockColor, (v: number) => (mech.hazards.eel.shockColor = v)],
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
/** True once the config has been parsed and checked. Exposed so a probe can prove it loaded. */
export const MECHANICS_LOADED = true;

