/**
 * Bubble types: what the player is, as data.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS, AND WHY IT CAME FIRST
 * ---------------------------------------------------------------------------------------------
 * The design document for the second bubble type ends with an architecture decision, and it is right: **the button
 * layout belongs to the TYPE, not to the game.** The devour bubble wants a wheel, a suction field that doubles as
 * the skill button, and a spit/compress pair; the volatile bubble wants a wheel and a charge button and has no use
 * for spit or digest at all.
 *
 * The alternative -- one global set of buttons that each type reinterprets -- fails in a way that is easy to
 * predict and expensive to unpick. The volatile bubble locks its aim while charging, so its wheel has to freeze;
 * with a global wheel that becomes a special case ("the wheel is frozen when..."), and with a per-type control list
 * the type simply has a wheel that it stops reading. A rule that lives on the type cannot leak into the other type.
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
  /** The thumb wheel. Every type has one, and every type reads it the same way. */
  | 'wheel'
  /**
   * The right-hand button: tap to spend a skill. Every type has one, because every type can carry a skill.
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

export type BubbleTypeId = 'devour' | 'angry';

/** Which palette paints the bubble. See `bubbleLook`. */
export type LookSource = 'growthStage' | 'rage';

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
  /** Where the bubble's colours come from. */
  look: LookSource;
  /**
   * Whether this type has a resource the HUD reports, and what to call it.
   *
   * Null for the devour bubble: it has no second meter, and inventing one would be inventing a mechanic. The
   * volatile bubble's is rage.
   */
  resource: { label: string } | null;
}

/**
 * The two types, in menu order.
 *
 * The devour bubble is first because it is the game's original design and the simpler one to learn: eat, grow, and
 * pay for it with speed. The volatile bubble is second, and reads as the advanced option.
 */
export const BUBBLE_TYPES: readonly BubbleType[] = [
  {
    id: 'devour',
    name: '吞噬气泡',
    tagline: '吃掉一切，越大越强 —— 代价是越来越难躲',
    hint: 'WASD / 方向键移动   ·   吸附：按住右下   ·   喷吐：K   ·   消化：按住 L',
    controls: ['wheel', 'skill', 'suction', 'spit', 'compress'],
    look: 'growthStage',
    resource: null,
  },
  {
    id: 'angry',
    name: '暴躁气泡',
    tagline: '挨打积怒，把怒气撞出去 —— 怒气不看体积，一次爆干净',
    hint: 'WASD / 方向键移动   ·   蓄力：按住右下，松手冲撞   ·   爆破：K / 左下   ·   技能：轻点右下',
    /**
     * No spit, no compress, and no suction field.
     *
     * Not an omission: eating in this game is a CONTACT rule, and suction is only a magnet on top of it. So the
     * volatile bubble still eats by touching food -- badly, which is what the design asks for ("poor at precise
     * collecting") -- and its one deliberate verb is the charge.
     */
    controls: ['wheel', 'skill', 'charge', 'burst'],
    look: 'rage',
    resource: { label: '怒气' },
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
