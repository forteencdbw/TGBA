import type { Graphics } from 'pixi.js';
import { mech } from './mechanisms';

/**
 * The paralysis cue: a jagged, strobing ring with a few bolts off the rim.
 *
 * ONE drawing, used by both things that can be paralysed -- the player's bubble and the eel's rounds. The round wears
 * it so the shot advertises what it does before it lands; the bubble wears it while the effect is running. They have
 * to be the same picture or the round stops being a promise about the bubble.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT IS THIS SHAPE
 * ---------------------------------------------------------------------------------------------
 * Every other penalty in this game changes what the bubble does; this one changes what the CONTROLS do, and that is
 * the only failure a player will read as the game being broken. So it has to be unmistakable and instant: a spiky
 * ring that strobes while the inversion lasts, drawn on the thing itself rather than anywhere else, because the
 * player's hands are already being told the wrong thing and this is the only other source of truth.
 *
 * Drawn as a polygon rather than a circle because a smooth ring reads as a status effect and a JAGGED one reads as
 * electricity -- the same reason the urchin is drawn as needles: silhouette first, colour second.
 *
 * @param radius the radius of the thing being ringed: the bubble's own radius, or the round's DRAWN half-width (the
 *   lightning cluster is wider than its hitbox, so a ring on the hitbox would disappear inside it).
 * @param time seconds; drives the strobe and the rotation of the bolts. The player passes the run's elapsed time and
 *   a round passes its own age, so every round flickers on its own clock rather than in lockstep.
 * @param alpha the wearer's own opacity, so the cue fades with the bubble during the intro.
 */
export function paintParalysisRing(
  g: Graphics,
  x: number,
  y: number,
  radius: number,
  time: number,
  alpha = 1,
): void {
  const cfg = mech.hazards.eel;
  const strobe = 0.45 + 0.55 * Math.abs(Math.sin(time * 34));
  const points: number[] = [];
  const steps = 22;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    // Alternating in and out, so the ring is a sawtooth rather than a circle with a wobble.
    const jag = i % 2 === 0 ? 1.34 : 1.2;
    points.push(x + Math.cos(a) * radius * jag, y + Math.sin(a) * radius * jag);
  }
  points.push(points[0]!, points[1]!);
  g.poly(points);
  g.stroke({ color: cfg.paralysisColour, alpha: strobe * alpha, width: radius * cfg.paralysisWidthRatio });
  // A few bolts off the rim, so it reads as discharge rather than as a decorative outline.
  for (let i = 0; i < 3; i++) {
    const a = time * 5 + (i / 3) * Math.PI * 2;
    g.moveTo(x + Math.cos(a) * radius * 1.3, y + Math.sin(a) * radius * 1.3)
      .lineTo(x + Math.cos(a + 0.35) * radius * 1.75, y + Math.sin(a + 0.35) * radius * 1.75)
      .stroke({ color: cfg.paralysisColour, alpha: 0.7 * strobe * alpha, width: radius * cfg.paralysisWidthRatio * 0.6 });
  }
}
