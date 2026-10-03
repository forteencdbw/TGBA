/**
 * Bubble types: what the player is, as data.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS, AND WHY IT CAME FIRST
 * ---------------------------------------------------------------------------------------------
 * The design document for the second bubble type ends with an architecture decision, and it is right: **the button
 * layout belongs to the TYPE, not to the game.** The devour bubble wants a suction field that doubles as the skill
 * button, and a spit/compress pair; the volatile bubble wants a charge button and has no use for spit or digest at
 * all. (Movement is not on this list: the phone steers by dragging anywhere on the screen, which needs no button.)
 *
 * The alternative -- one global set of buttons that each type reinterprets -- fails in a way that is easy to
 * predict and expensive to unpick. A type that must not fire a control the other type owns cannot say so through a
 * shared layout; per type, the control is simply absent from the list, and the drawing and the hit testing both
 * read that list. A rule that lives on the type cannot leak into the other type.
 *
 * So this module is deliberately a DESCRIPTOR and nothing more: which controls exist, which palette paints the
 * bubble, and which resource the HUD reports. Behaviour lives in the modules that already own it -- the devour
 * bubble's verbs are unchanged, and the volatile bubble's rage is in `src/rage.ts`.
 *
 * ---------------------------------------------------------------------------------------------
 * ADDING A THIRD TYPE
 * ---------------------------------------------------------------------------------------------
 * Add a row to `BUBBLE_TYPES`. The main menu draws its buttons from this list, the touch layer lays out whatever
 * controls the type names, and `e2e/bubble-types.spec.ts` fails if the list and the menu disagree. Nothing else
 * needs to know a new type exists.
 */

/**
 * The controls a type can ask for.
 *
 * Named as VERBS rather than as positions, because a position is the type's decision: `charge` is "the big
 * hold-and-release button on the right", and which corner that ends up in is the layout's business.
 */
export type ControlId =
  /**
   * The right-hand button: tap to spend a skill. Every type has one, because every type can carry a skill.
   *
   * There is no id for MOVEMENT. It is not a control a type can ask for or leave out: the phone steers by
   * dragging anywhere on the screen, which needs no button, no pad and therefore no entry here. See `src/touch.ts`.
   *
   * Separate from `suction` even though the two share a slot, and the separation is load-bearing rather than tidy:
   * both types have the BUTTON, and only one has the FIELD. Folded into one id, the volatile bubble's list would
   * have to include `suction` to get its skill button -- and then the button's press handler, which checks the field
   * first, would quietly claim the charge instead. That is exactly the bug this split fixes.
   */
  | 'skill'
  /** Hold to gather: the devour bubble's field, which is what the button's hold does for that type. */
  | 'suction'
  /** Tap to fire the oldest thing in the stomach. */
  | 'spit'
  /** Hold to digest. */
  | 'compress'
  /** Hold to wind up, release to slam. The volatile bubble's verb. */
  | 'charge'
  /** Tap to spend the whole rage gauge as a shockwave. The volatile bubble's other verb. */
  | 'burst';

export type BubbleTypeId = 'devour' | 'angry' | 'plain';

/**
 * Which palette paints the bubble. See `bubbleLook`.
 *
 * `plain` is not a growth palette with different numbers: the plain bubble's colours do not follow ANY state, because
 * it has no state worth advertising -- see `hitsToPop` and the config's note on the palette.
 */
export type LookSource = 'growthStage' | 'rage' | 'plain';

export interface BubbleType {
  id: BubbleTypeId;
  /** Shown on the menu's selector. */
  name: string;
  /** One line under the selector: what this bubble is FOR, in the player's terms. */
  tagline: string;
  /**
   * The control hint under the menu's buttons.
   *
   * Per type rather than global, because the control scheme is the thing that differs most between them: a hint
   * that named the spit button while the volatile bubble has no spit button would be actively misleading.
   */
  hint: string;
  /** The buttons and pads this type lays out. Order is irrelevant; the layout knows where each one goes. */
  controls: readonly ControlId[];
  /**
   * Whether this type's bubble fires the small-bubble bullets on its own.
   *
   * A type property rather than a global behaviour, for the same reason the control list is: "what can this bubble
   * do" is the question the whole module answers, and a mechanic that every type shares but cannot be turned off is
   * a mechanic nobody can take away again. `bullets.perSecond` is the rate; this is the switch.
   */
  firesBullets: boolean;
  /** Where the bubble's colours come from. */
  look: LookSource;
  /**
   * Whether this type can SWALLOW a hazard at all: the stomach, and with it the over-eating fuse.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS IS A TYPE PROPERTY RATHER THAN A DETAIL OF THE EATING RULES
   * ---------------------------------------------------------------------------------------------
   * The devour bubble's whole design is the reversal: eat the thing that was hunting you, then deal with what it does
   * once it is inside. The volatile bubble has no such mechanic -- it has no spit and no digest, so a creature in its
   * stomach has no way out and the fuse burns down to a guaranteed death. It was swallowing enemies and exploding
   * from the inside, which reads as "this character is broken" rather than as a design.
   *
   * So swallowing hazards is opt-in per type, and `e2e/bubble-types.spec.ts` enforces the rule that makes it safe: a
   * type that swallows must have the verbs to get things back OUT. Nothing swallows without an exit.
   *
   * What it does NOT gate: eating collectable bubbles. Growth is every bubble's business, and the volatile one
   * gathers by touch -- clumsily, which is its design ("poor at precise collecting").
   */
  swallowsHazards: boolean;
  /**
   * How many hits this type SURVIVES, at any size, or null for the volumetric rule.
   *
   * ---------------------------------------------------------------------------------------------
   * WHY THIS IS A TYPE PROPERTY RATHER THAN A NUMBER IN THE CONFIG
   * ---------------------------------------------------------------------------------------------
   * `null` is every bubble that has shipped so far, and it means what the game has always meant: hit points ARE
   * volume, one hit costs `volume.hitCost`, so growing is what buys the right to be hit again. That is the devour
   * bubble's reward for eating and the volatile bubble's consolation for having no stomach.
   *
   * A NUMBER replaces that rule with a count: this type takes that many hits and pops, whatever it has grown to. The
   * plain bubble is the reason it exists -- its whole design is that a touch is fatal and that nothing it does changes
   * that -- and it belongs beside `swallowsHazards` rather than in `mechanics.json5` because it is not a balance knob,
   * it is what the character IS. A type is not a preset of the game's rules; it is allowed to have a different one.
   *
   * The consequence is worth stating: for a type with a fixed count, growing is PURE COST -- a bigger hitbox and a
   * slower bubble for no extra survivability. That is coherent (a plain bubble wants to stay small) but it is a real
   * design consequence, not a rounding error.
   */
  hitsToPop: number | null;
  /**
   * Whether ABSORBING a collectable bubble makes this type grow.
   *
   * ---------------------------------------------------------------------------------------------
   * TRUE IS THE GAME'S ORIGINAL RULE, AND FALSE IS A CHARACTER THAT DOES NOT HAVE IT
   * ---------------------------------------------------------------------------------------------
   * Growth is what "devouring" means for the first bubble: bubbles are food, food is volume, and volume is both your
   * hit points and your hitbox. The volatile bubble keeps it because it has to gather SOMETHING by touching it --
   * "poor at precise collecting" is its weakness, not "cannot collect at all".
   *
   * The plain bubble does not, and that is the whole of its design: it has one hit point at any size, so growing
   * would buy it nothing and cost it everything (a bigger hitbox, a slower bubble, and a stage penalty on top). A
   * type that cannot get anything out of food does not eat food -- it collects it, and gets points. So absorbing
   * still removes the bubble and still pays, and what it pays in is `score.absorb` instead of size.
   *
   * Deliberately NOT a config number, for the same reason as `swallowsHazards`: this is not a balance knob, it is
   * whether the character grows at all. Its PRICE is the config's business.
   */
  growsByAbsorbing: boolean;
  /**
   * Whether this type has a resource the HUD reports, and what to call it.
   *
   * Null for the devour bubble: it has no second meter, and inventing one would be inventing a mechanic. The
   * volatile bubble's is rage.
   */
  resource: { label: string } | null;
}

/**
 * The bubble types, in menu order.
 *
 * The devour bubble is first because it is the game's original design and the simpler one to learn: eat, grow, and
 * pay for it with speed. The volatile bubble is second, and reads as the advanced option. The plain bubble is last:
 * it is the one with nothing to learn, and putting it between the two that have mechanics would make the menu read as
 * a difficulty list with a gap in it.
 */
export const BUBBLE_TYPES: readonly BubbleType[] = [
  {
    id: 'devour',
    name: '吞噬气泡',
    tagline: '吃掉一切，越大越强 —— 代价是越来越难躲',
    hint: 'WASD / 方向键移动   ·   右侧按钮（下→上）：技能/吸附 · 喷吐 · 消化',
    controls: ['skill', 'suction', 'spit', 'compress'],
    look: 'growthStage',
    // The original design: the reversal IS the mechanic, and both exits are one button away.
    swallowsHazards: true,
    /**
     * The gun, on by default.
     *
     * It gives the first bubble an answer to a fish it is not yet big enough to eat: shoot it until it leaves. That
     * is the third way out of an encounter -- be eaten, be dodged, or be driven off -- and without it a small bubble
     * has only one answer to everything, which is to run.
     */
    firesBullets: true,
    resource: null,
    hitsToPop: null,
    growsByAbsorbing: true,
  },
  {
    id: 'angry',
    name: '暴躁气泡',
    tagline: '挨打积怒，把怒气撞出去 —— 怒气不看体积，一次爆干净',
    hint: 'WASD / 方向键移动   ·   右侧按钮（下→上）：技能 · 蓄力冲撞（按住再松手）· 爆破',
    /**
     * No stomach, no suction field, and neither of the stomach's verbs.
     *
     * It still eats COLLECTABLE bubbles -- growth is every bubble's business, and it gathers by touch rather than by
     * pulling, which is the design's "poor at precise collecting". What it does not do is swallow CREATURES: see
     * `swallowsHazards`.
     */
    controls: ['skill', 'charge', 'burst'],
    look: 'rage',
    /**
     * No stomach, and therefore no over-eating fuse: an enemy it touches is an enemy that HITS it.
     *
     * That is not a punishment -- it is where its rage comes from. The design's own closing line is "let them hit
     * you, then ram it all back", and a bubble that could eat them would have no reason to be hit. It also has
     * nowhere to put them: no spit, no digest, so a swallowed creature would be a guaranteed death by fuse.
     */
    swallowsHazards: false,
    /**
     * And the same gun.
     *
     * Kept on for the second bubble deliberately: the gun is the DEFAULT, and a type that had to opt back IN to the
     * game's basic verb would make the volatile bubble feel like a different game rather than a different
     * character. The design's answer to a fish is still to be hit by it -- the gun just means a swarm can be carved
     * down on the way in. Turn this off to make it purely a contact fighter.
     */
    firesBullets: true,
    resource: { label: '怒气' },
    hitsToPop: null,
    growsByAbsorbing: true,
  },
  {
    id: 'plain',
    name: '普通气泡',
    tagline: '什么都不会，一滴血 —— 碰到就破',
    hint: 'WASD / 方向键移动   ·   右侧按钮：技能（捡到才有）',
    /**
     * The skill button, and nothing else.
     *
     * Not a compromise: `skill` is the button every type has because every type can CARRY a skill, and a carried skill
     * is an item the level handed over rather than an ability of the character. What this type has none of is the
     * verbs -- no suction field, no spit, no digest, no charge, no burst -- which is what "no special abilities" means
     * when the alternative reading would leave a collected skill unusable, and a pickup that does nothing is worse
     * than no pickup at all.
     */
    controls: ['skill'],
    look: 'plain',
    /**
     * No stomach, and therefore no over-eating fuse either.
     *
     * The same answer as the volatile bubble, for a stronger reason: this bubble has no verb that could get a
     * swallowed creature back OUT, and the repo's rule is that nothing swallows without an exit.
     */
    swallowsHazards: false,
    /**
     * The gun stays on, and it is the one thing standing between this type and a game with no decisions in it.
     *
     * With one hit point and no verbs, every creature is a lethal obstacle and the only move is to run; the gun is
     * what makes distance a resource the player can spend. It is also the game's default weapon rather than an
     * ability of a character, so leaving it off would not make the type plainer -- it would make it a different game.
     */
    firesBullets: true,
    resource: null,
    /**
     * ONE hit, whatever it grows to.
     *
     * The literal reading of the design, and the reason `hitsToPop` exists: the volumetric rule would quietly give a
     * grown plain bubble more lives, which is the one thing this type is not allowed to have.
     */
    hitsToPop: 1,
    /**
     * And no growth at all: absorbing a bubble removes it and pays points, and the bubble stays the size it was.
     *
     * The bug this fixes: it grew like the devour bubble, which meant it was quietly playing the devour bubble's
     * game -- eat, grow, take more hits -- while its whole design is that one touch is fatal at any size. Growing
     * gave it nothing and cost it a bigger hitbox and a slower bubble.
     */
    growsByAbsorbing: false,
  },
];

export function findBubbleType(id: string): BubbleType | undefined {
  return BUBBLE_TYPES.find((type) => type.id === id);
}

/** The type a run gets when nothing has been chosen, and the fallback for an unknown id. */
export function defaultBubbleType(): BubbleType {
  return BUBBLE_TYPES[0]!;
}

/** Whether a type lays out a given control. */
export function hasControl(type: BubbleType, control: ControlId): boolean {
  return type.controls.includes(control);
}

/**
 * Whether a type has a given VERB, which is not always the same question as whether it has the button.
 *
 * Asked by the game before it reads an input flag, and it is what stops a keyboard player who has learned `K` for
 * spit from firing a stomach the volatile bubble does not have. The button list alone would leave that hole open,
 * because the keyboard does not go through the buttons.
 */
export function hasVerb(type: BubbleType, verb: 'suction' | 'spit' | 'compress' | 'charge' | 'burst'): boolean {
  return type.controls.includes(verb);
}

