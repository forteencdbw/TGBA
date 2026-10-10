/**
 * The bubble's form: what the player is, as data -- and the ROUTES a run grows into.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------------------------
 * **The button layout belongs to the FORM, not to the game.** The devour route wants a suction field that
 * doubles as the skill button; the boil route wants a charge button and has no use for suction at all.
 * (Movement is not on this list: the phone steers by dragging anywhere on the screen, which needs no button.)
 *
 * The alternative -- one global set of buttons that each form reinterprets -- fails in a way that is easy to
 * predict and expensive to unpick. A form that must not fire a control the other one owns cannot say so through
 * a shared layout; per form, the control is simply absent from the list, and the drawing and the hit testing
 * both read that list. A rule that lives on the form cannot leak into the other one.
 *
 * ---------------------------------------------------------------------------------------------
 * BASE, THEN A ROUTE -- THE SECOND CUT
 * ---------------------------------------------------------------------------------------------
 * There is no character select any more. Every run starts as the SAME base bubble -- gun, movement, growth,
 * volume-as-health -- and its identity arrives in the water: the FIRST level-up offers three route cards, one
 * mandatory pick, and the run's bubble becomes `base + route` on the spot. The route's verbs appear (the touch
 * layer re-lays out mid-run), its palette may change, and its cards join the mutation pool while the other two
 * routes' cards never appear again this run.
 *
 * So this module is a DESCRIPTOR and nothing more: which controls exist, which palette paints the bubble, which
 * resource the HUD reports. Behaviour lives in the modules that already own it -- eating is `src/consumption.ts`,
 * rage is `src/rage.ts`.
 */

/**
 * The controls a form can ask for.
 *
 * Named as VERBS rather than as positions, because a position is the form's decision: `charge` is "the big
 * hold-and-release button on the right", and which corner that ends up in is the layout's business.
 */
export type ControlId =
  /**
   * The right-hand button: tap to spend a skill. Every form has one, because every form can carry a skill.
   *
   * There is no id for MOVEMENT. It is not a control a form can ask for or leave out: the phone steers by
   * dragging anywhere on the screen, which needs no button, no pad and therefore no entry here. See `src/touch.ts`.
   *
   * Separate from `suction` even though the two share a slot, and the separation is load-bearing rather than tidy:
   * both forms have the BUTTON, and only one has the FIELD. Folded into one id, the boil route's list would have
   * to include `suction` to get its skill button -- and then the button's press handler, which checks the field
   * first, would quietly claim the charge instead. That is exactly the bug this split fixes.
   */
  | 'skill'
  /** Hold to gather: the devour route's field, which is what the button's hold does for that form. */
  | 'suction'
  /**
   * Dormant, both of them: the stomach's verbs are gone with the inventory, no route asks for them, and the touch
   * layer still knows how to lay their buttons out. Kept as ids rather than deleted because a future route that
   * wants a tap-verb and a hold-verb will want exactly these two slots back.
   */
  | 'spit'
  | 'compress'
  /** Hold to wind up, release to slam. The boil route's verb. */
  | 'charge'
  /** Tap to spend the whole rage gauge as a shockwave. The boil route's other verb. */
  | 'burst';

/** The routes a run may commit to, at its first level-up. Keyed by their card, the HUD and the codex. */
export type RouteId = 'devour' | 'boil' | 'barrage';

/**
 * Which palette paints the bubble. See `bubbleLook`.
 *
 * Growth is the base palette -- volume is every bubble's business. The boil route swaps it for rage, because
 * boiling is that route's whole identity: the bubble's colour says how close to bursting it is.
 */
export type LookSource = 'growthStage' | 'rage';

export interface BubbleType {
  /** 'base' before a route is picked, the route's id after. */
  id: 'base' | RouteId;
  /** Shown wherever the form is named: the HUD prefix, the codex. */
  name: string;
  /** One line, in the player's terms: what this form is FOR. */
  tagline: string;
  /** The buttons and pads this form lays out. Order is irrelevant; the layout knows where each one goes. */
  controls: readonly ControlId[];
  /**
   * Whether this form's bubble fires the small-bubble bullets on its own.
   *
   * A form property rather than a global behaviour, for the same reason the control list is: "what can this
   * bubble do" is the question the whole module answers, and a mechanic that every form shares but cannot be
   * turned off is a mechanic nobody can take away again. `bullets.rateTiers` is the rate; this is the switch.
   */
  firesBullets: boolean;
  /** Where the bubble's colours come from. */
  look: LookSource;
  /**
   * Whether this form can SWALLOW a hazard at all: the food-chain reversal.
   *
   * The devour route's whole design is the reversal -- eat the thing that was hunting you, and the rewards land
   * on the spot (mass, score, mutation xp, a moment of immunity). Every other form takes the hit instead, which
   * is not a punishment: for the boil route it is where the rage comes from.
   *
   * What it does NOT gate: eating collectable bubbles. Growth is every bubble's business.
   */
  swallowsHazards: boolean;
  /**
   * How many hits this form SURVIVES, at any size, or null for the volumetric rule.
   *
   * `null` is every form that has shipped so far, and it means what the game has always meant: hit points ARE
   * volume, one hit costs `volume.hitCost`, so growing is what buys the right to be hit again. No route replaces
   * that rule -- a fixed count was the plain bubble's idea, and the plain bubble is gone with the character
   * select: a route is something ADDED to the base, and "fewer hit points than the base" is not a route.
   */
  hitsToPop: number | null;
  /**
   * Whether ABSORBING a collectable bubble makes this form grow.
   *
   * True for every form: bubbles are food, food is volume, and volume is both hit points and hitbox. That
   * tension -- bigger is stronger and harder to miss -- is the game's, before any route is picked.
   */
  growsByAbsorbing: boolean;
  /**
   * Whether this form has a resource the HUD reports, and what to call it.
   *
   * Null for the base bubble and every route but one: the boil route's is rage.
   */
  resource: { label: string } | null;
}

/**
 * The one form a run starts as, and the one it keeps if nothing is ever added to it.
 *
 * Skill button (a carried skill is an item, not an ability), the gun, growth, volume-as-health, the growth
 * palette. No field, no swallow, no rage -- everything beyond this is a ROUTE, and the route is chosen in the
 * water rather than on the menu.
 */
export const BASE_TYPE: BubbleType = {
  id: 'base',
  name: '小气泡',
  tagline: '枪、成长、还有你的操作 —— 身份等到水里再定',
  controls: ['skill'],
  look: 'growthStage',
  swallowsHazards: false,
  firesBullets: true,
  resource: null,
  hitsToPop: null,
  growsByAbsorbing: true,
};

/** A route: what the run's bubble BECOMES, the moment its card is picked. */
export interface Route {
  id: RouteId;
  /** The short name, everywhere: the card, the HUD prefix, the codex. */
  name: string;
  /** The card's title: the route's thesis in four words. */
  title: string;
  /** The card's line: what picking this means, in the player's terms. */
  blurb: string;
  /** The buttons the form lays out from the moment of the pick. */
  controls: readonly ControlId[];
  /** Where the form's colours come to from the pick. */
  look: LookSource;
  /** Whether the form can swallow hazards. */
  swallowsHazards: boolean;
  /** The HUD's second resource, if the route brings one. */
  resource: { label: string } | null;
}

/**
 * The routes, in card order.
 *
 * Each one is base-plus: the fields below REPLACE the base form's on the pick, and everything the base has
 * that a route does not name (growth, the gun, volume-as-health) simply stays. A route is an identity ADDED,
 * never a rule taken away -- the one design line that keeps "base first, route second" honest.
 */
export const ROUTES: readonly Route[] = [
  {
    id: 'devour',
    name: '吞噬',
    title: '食物链反转',
    blurb: '吃掉一切，越大越强 —— 代价是越来越难躲',
    /**
     * The suction field joins the skill button (one button, two halves: tap is the skill, hold is the field), and
     * touching a creature you can eat is a meal settled on the spot.
     */
    controls: ['skill', 'suction'],
    look: 'growthStage',
    swallowsHazards: true,
    resource: null,
  },
  {
    id: 'boil',
    name: '沸腾',
    title: '以怒为刃',
    blurb: '越挨打越烫，把怒气撞出去 —— 怒气不看体积',
    /**
     * Wind up, release, slam; the burst spends the whole gauge. The palette switches to rage on the pick, because
     * "how close to boiling am I" is this route's one question and the bubble answers it in colour.
     */
    controls: ['skill', 'charge', 'burst'],
    look: 'rage',
    swallowsHazards: false,
    resource: { label: '怒气' },
  },
  {
    id: 'barrage',
    name: '弹幕',
    title: '火力压制',
    blurb: '小泡泡又快又密，答案全在水里 —— 枪管立刻 +1',
    /**
     * No new buttons: this route's verb is the gun the base already had, deepened. Its cards widen what the gun
     * IS -- faster, fatter, farther -- rather than what else the bubble can do.
     */
    controls: ['skill'],
    look: 'growthStage',
    swallowsHazards: false,
    resource: null,
  },
];

export function findRoute(id: string): Route | undefined {
  return ROUTES.find((route) => route.id === id);
}

/** The form a run's bubble takes the moment a route is picked: the base, plus the route's answers. */
export function formForRoute(route: Route): BubbleType {
  return {
    ...BASE_TYPE,
    id: route.id,
    name: route.name,
    tagline: route.blurb,
    controls: route.controls,
    look: route.look,
    swallowsHazards: route.swallowsHazards,
    resource: route.resource,
  };
}

/** The form a run gets when nothing has been picked, and the fallback for an unknown id. */
export function defaultBubbleType(): BubbleType {
  return BASE_TYPE;
}

/** Whether a form lays out a given control. */
export function hasControl(type: BubbleType, control: ControlId): boolean {
  return type.controls.includes(control);
}

/**
 * Whether a form has a given VERB, which is not always the same question as whether it has the button.
 *
 * Asked by the game before it reads an input flag, and it is what stops a keyboard player who has learned `K`
 * for the burst from firing it on a form that has no rage to spend. The button list alone would leave that hole
 * open, because the keyboard does not go through the buttons.
 */
export function hasVerb(type: BubbleType, verb: 'suction' | 'spit' | 'compress' | 'charge' | 'burst'): boolean {
  return type.controls.includes(verb);
}
