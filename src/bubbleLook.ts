import { mech, type StageAppearance } from './mechanisms';
import type { BubbleType } from './bubbleTypes';
import { rageAppearance, rageColor, rageLook, rageStageName } from './rage';
import { stageAppearance } from './stages';

/**
 * What paints the bubble, per type.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PROBLEM THIS SOLVES
 * ---------------------------------------------------------------------------------------------
 * The design document's FIRST open question was that the two types want the same canvas: growth stages carry the
 * devour bubble's colour (cyan -> gold -> pink) and rage wants blue -> orange -> red -> crimson. One bubble, one set
 * of pixels, two systems with something to say about them.
 *
 * The answer is the type's own palette namespace, and it is why this module exists rather than a branch inside
 * `drawBubble`: the drawing code asks "what does the bubble look like right now", gets ONE object back, and never
 * learns that there are two systems. Whichever type is running answers that question in its own terms -- growth
 * stages for one, rage for the other -- and neither can leak into the other's look.
 *
 * Rage stages carry a little more than the growth stages do (`shake`, `swell`), which is why the result is an
 * extension of `StageAppearance` rather than the bare type. The extra two are read only by the volatile bubble's
 * drawing code, and `shake`/`swell` are zero for every growth stage.
 */
export interface BubbleLook extends StageAppearance {
  /**
   * Lateral jitter, as a fraction of the lane width, and a periodic radius swell as a fraction of the radius.
   *
   * Zero for the devour bubble. These are how anger is made VISIBLE without drawing a face on the bubble -- see the
   * design document's note that features would stop it reading as a bubble.
   */
  shake: number;
  swell: number;
}

/**
 * The look for the current frame.
 *
 * @param type the running type
 * @param stage the growth stage, used only by the devour bubble
 * @param rage current rage, used only by the volatile bubble
 */
export function bubbleLook(type: BubbleType, stage: number, rage: number): BubbleLook {
  if (type.look === 'rage') {
    const row = rageAppearance(rage);
    const look = rageLook();
    return {
      radius: look.radius,
      inner: look.inner,
      innerAlpha: look.innerAlpha,
      rim: row.rim,
      rimAlpha: look.rimAlpha,
      rimWidthRatio: look.rimWidthRatio,
      glow: row.glow,
      glowOuterAlpha: look.glowOuterAlpha,
      glowInnerAlpha: look.glowInnerAlpha,
      glowOuterRadiusRatio: look.glowOuterRadiusRatio,
      glowInnerRadiusRatio: look.glowInnerRadiusRatio,
      innerRing: look.innerRing,
      innerRingAlpha: look.innerRingAlpha,
      innerRingWidthRatio: look.innerRingWidthRatio,
      sheen: row.sheen,
      sheenAlpha: look.sheenAlpha,
      specular: row.specular,
      specularAlpha: look.specularAlpha,
      hudColor: row.hudColor,
      name: row.name,
      shake: row.shake,
      swell: row.swell,
    };
  }
  const grown = stageAppearance(stage);
  return { ...grown, shake: 0, swell: 0 };
}

/**
 * The periodic swell, as a multiplier on the DRAWN radius only.
 *
 * ---------------------------------------------------------------------------------------------
 * THIS IS THE ONE PLACE THE DRAWN RADIUS IS NOT THE HITBOX, AND IT IS DELIBERATE
 * ---------------------------------------------------------------------------------------------
 * The project's rule is that the bubble is exactly as big as it looks, because a bubble drawn larger than it
 * collides makes a player believe they are safe when they are not. That rule is about the STEADY state, and this is
 * a pulse: the design asks for "periodic swelling at full rage", and the honest way to have it without breaking the
 * rule is to swell the drawing and leave the eating and contact radius alone.
 *
 * The alternative -- swelling the real radius -- would make "can I eat this bubble" flicker at the pulse rate, which
 * is a much worse thing to do to a player than a drawing that breathes. The amplitude is deliberately small (a few
 * percent) so the two never look like different objects.
 */
export function bubbleSwell(look: BubbleLook, elapsed: number): number {
  if (look.swell <= 0) return 1;
  // Half a second per breath, and never below 1: the bubble swells and relaxes rather than shrinking and growing,
  // so the drawn size is never SMALLER than the hitbox.
  return 1 + look.swell * (0.5 + 0.5 * Math.sin(elapsed * Math.PI * 4));
}

/**
 * Lateral jitter for the drawn position, as a fraction of the lane width.
 *
 * Also drawing-only, and for the same reason as the swell: it is a tremor, not a movement. Two frequencies that do
 * not divide each other, so the shake does not read as a loop.
 */
export function bubbleShake(look: BubbleLook, elapsed: number): number {
  if (look.shake <= 0) return 0;
  return look.shake * (Math.sin(elapsed * 37) + 0.6 * Math.sin(elapsed * 61));
}

/** The colour the HUD should label this type's state with. */
export function bubbleStateColor(type: BubbleType, stage: number, rage: number): number {
  return type.look === 'rage' ? rageColor(rage) : (mech.stages.appearance[Math.min(stage - 1, mech.stages.appearance.length - 1)]?.hudColor ?? 0xffffff);
}

/** The name of the state the HUD should show: the growth stage, or the rage stage. */
export function bubbleStateName(type: BubbleType, stage: number, rage: number): string {
  return type.look === 'rage' ? rageStageName(rage) : (mech.stages.appearance[Math.min(stage - 1, mech.stages.appearance.length - 1)]?.name ?? '');
}
