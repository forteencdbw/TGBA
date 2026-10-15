import { Graphics } from 'pixi.js';
import { mech } from './config';
import { radiusOf, type BulletField } from './bullets';
import type { EnemyBulletField } from './enemyBullets';
import { chargeWindow, hazardBoxFractions, hazardSizeFraction, type Hazard, type HazardField, type HazardKind } from './hazards';
import type { ObstacleField } from './obstacles';

/**
 * The debug hitbox overlay: every collision shape in the game, drawn as an outline.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT IS FOR
 * ---------------------------------------------------------------------------------------------
 * "Does the thing LOOK as big as the thing that KILLS?" is a question the compiler cannot answer and a screenshot
 * cannot either, because the two numbers live in different places -- the art in `src/assets/`, the reach in
 * `config/mechanics.json5`. This draws the second one on top of the first, so the comparison is a glance instead of
 * an arithmetic.
 *
 * ---------------------------------------------------------------------------------------------
 * IT READS, IT DOES NOT DECIDE
 * ---------------------------------------------------------------------------------------------
 * Every shape here is built from the expression the collision itself is built from -- `h.radiusFraction`,
 * `radiusOf`, `stageRadiusFraction`, `graze.radiusMultiplier`. Nothing is duplicated and nothing is approximated, so
 * the line cannot drift away from the rule it depicts: if a hitbox is wrong, this shows the wrong value rather than
 * hiding it. That is the whole point of the tool, and it is why the drawing is a separate module rather than a few
 * lines inside each painter -- a painter knows what a creature LOOKS like, and this knows only what it reaches.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS NOT DRAWN, AND WHY
 * ---------------------------------------------------------------------------------------------
 * The BOSS's "aim here" ring is not drawn. `weakPointWidthRatio` is a STROKE WIDTH on a decorative circle -- there is
 * no weak-point collision anywhere in the game -- and a shape drawn in an overlay whose contract is "this is the
 * hitbox" would be the one lie the tool exists to catch. The bubble has no graze circle of its own either; a graze
 * ring belongs to the thing that went past.
 */

/**
 * Whether the overlay is on. Module state rather than a constructor argument, the same shape as `setReducedFlash`:
 * the setting is global, it is on or off for the whole game, and threading it through every painter would be five
 * copies of the same boolean.
 */
let DEBUG_HITBOXES = false;

/** @return the state it was set to, so a caller can report it without reading it back. */
export function setDebugHitboxes(on: boolean): boolean {
  DEBUG_HITBOXES = on;
  return DEBUG_HITBOXES;
}

export function isDebugHitboxes(): boolean {
  return DEBUG_HITBOXES;
}

/**
 * The kinds that are not alive: terrain, weather, and the two the game itself calls the environment's danmaku.
 *
 * A hand-written list because the code does not classify by this line anywhere -- `CREATURES` is a total record, so
 * every kind has a step function whether or not it is alive, and `health` is 0 for the invincible creatures (the
 * eel, the rot) as well as for the vent. The two colours exist because the owner asked for the distinction, so the
 * list is stated once, here, where the distinction is drawn.
 */
const ENVIRONMENT_KINDS: readonly HazardKind[] = ['vent', 'mineral', 'foam', 'rain'];

/** What the overlay needs to draw. Everything is already-built state: this module owns no entities. */
export interface HitboxScene {
  hazards: HazardField;
  obstacles: ObstacleField;
  bullets: BulletField;
  enemyBullets: EnemyBulletField;
  /** The bubble's COLLIDED radius in metres -- the same number `resolveContacts` uses. */
  playerX: number;
  playerY: number;
  playerRadius: number;
  laneWidth: number;
  /** The run's 大弹丸 multiplier, because the drawn round and the collided round are the same size. */
  bulletRadiusMultiplier: number;
}

/** Trace a circle's outline without filling it. */
function outlineCircle(g: Graphics, x: number, y: number, r: number): void {
  // A zero or negative radius is a legal config now, and `circle` with one of those draws nothing useful.
  if (!(r > 0)) return;
  g.circle(x, y, r);
}

/** Trace an axis-aligned box's outline. The shape a creature with art is hit as. */
function outlineBox(g: Graphics, x: number, y: number, halfW: number, halfH: number): void {
  if (!(halfW > 0) || !(halfH > 0)) return;
  g.rect(x - halfW, y - halfH, halfW * 2, halfH * 2);
}

/**
 * ONE creature's collision shape, which is whichever one the collision itself will use.
 *
 * Asking the same function the contact test asks is not a convenience -- it is the only way the line and the rule can
 * be guaranteed to be the same thing. A creature with art is a box; one without is the circle the drawing falls back
 * to; a vent is neither and has its own case.
 */
function outlineHazard(g: Graphics, h: Hazard, laneWidth: number): void {
  const box = hazardBoxFractions(h.kind, h.variety, h.scale);
  if (box) outlineBox(g, h.x, h.y, box.halfW * laneWidth, box.halfH * laneWidth);
  // The circle the no-art kinds collide as, at the size the multiplier leaves it.
  else outlineCircle(g, h.x, h.y, laneWidth * hazardSizeFraction(h.kind, h.scale));
}

/**
 * Trace a circle as a ring of dashes.
 *
 * Dashed rather than solid because the two kinds of circle mean different things -- solid is "this hurts", dashed is
 * "this pays for a near miss" -- and a second solid colour would read as a second kind of danger.
 *
 * Each dash is a short polyline rather than an `arc`, which is the boring choice on purpose: an arc continues from
 * whatever point the path is at, so laying N of them down as separate subpaths means getting `moveTo` exactly right N
 * times, and a ring that renders as one long spiral is a very silly way to spend an afternoon.
 */
function dashedCircle(g: Graphics, x: number, y: number, r: number, dash: number, gap: number): void {
  if (!(r > 0) || !(dash > 0)) return;
  const step = dash + Math.max(0.5, gap);
  // A cap on the count rather than on the radius: an enormous circle with 6px dashes would be thousands of
  // instructions, and the whole overlay is drawn every frame.
  const count = Math.min(180, Math.max(4, Math.floor((2 * Math.PI * r) / step)));
  const span = (2 * Math.PI) / count;
  for (let i = 0; i < count; i++) {
    const a0 = i * span;
    const a1 = a0 + span * (dash / step);
    const pieces = 4;
    g.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r);
    for (let p = 1; p <= pieces; p++) {
      const a = a0 + ((a1 - a0) * p) / pieces;
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
  }
}

/**
 * Whether a creature's graze ring is live right now.
 *
 * Deliberately the same five conditions the collision uses. A ring drawn for a creature that has not started its
 * charge, or that has already been grazed, would promise points the game will not pay -- and the whole point of
 * showing the ring is to answer "why did that count".
 */
function grazeLive(h: Hazard): boolean {
  return !!h.charge && !h.charge.grazed && !h.charge.hitPlayer && h.charge.elapsed >= chargeWindow(h.kind).telegraphSeconds;
}

/**
 * Draw every collision shape in the scene.
 *
 * Grouped by colour rather than by entity, so the whole overlay is seven strokes instead of one per creature: the
 * path accumulates until a `stroke` consumes it, and a creature-by-creature loop would emit one draw call per fish.
 */
export function paintHitboxes(g: Graphics, s: HitboxScene): void {
  const cfg = mech.debug;
  const stroke = (colour: number): void => void g.stroke({ color: colour, alpha: cfg.alpha, width: cfg.width });

  // --- creatures, and the environment, which share a field -----------------------------------------------
  for (const h of s.hazards.hazards) {
    if (ENVIRONMENT_KINDS.includes(h.kind)) continue;
    outlineHazard(g, h, s.laneWidth);
  }
  stroke(cfg.creatureColour);

  for (const h of s.hazards.hazards) {
    if (!ENVIRONMENT_KINDS.includes(h.kind)) continue;
    /**
     * The environment is drawn with the same helper as the creatures, because the SHAPE does not follow the colour.
     *
     * The two-colour split is about what a thing IS -- terrain and weather versus something alive -- and the box is
     * about what its picture occupies. `mineral` is grit with a picture, so its collision is a (near-square) box even
     * though it is painted in the environment's colour, and an overlay that rounded it off would be the one thing this
     * module exists not to do.
     */
    if (!h.vent) {
      outlineHazard(g, h, s.laneWidth);
      continue;
    }
    outlineCircle(g, h.x, h.y, s.laneWidth * h.radiusFraction);
    if (!h.vent) continue;
    /*
     * A vent is not a circle, and this is the shape the last change to it was about: a ROCK that is always solid,
     * plus a JET that is only there while it erupts. Drawn from `h.vent`, which is where the collision reads them,
     * so the capsule on screen is the capsule that burns.
     */
    const half = s.laneWidth * mech.hazards.vent.jetHalfWidthRatio;
    const len = s.laneWidth * h.vent.lengthRatio;
    const tipX = h.x + h.vent.aimX * len;
    const tipY = h.y + h.vent.aimY * len;
    const px = -h.vent.aimY * half;
    const py = h.vent.aimX * half;
    g.moveTo(h.x + px, h.y + py).lineTo(tipX + px, tipY + py);
    g.moveTo(h.x - px, h.y - py).lineTo(tipX - px, tipY - py);
    // The far cap, so the band's end reads as a rounded end and not as a line that stopped.
    outlineCircle(g, tipX, tipY, half);
  }
  stroke(cfg.environmentColour);

  // --- scenery the bubble can ram ------------------------------------------------------------------------
  for (const o of s.obstacles.obstacles) outlineCircle(g, o.x, o.y, s.laneWidth * o.radiusFraction);
  stroke(cfg.obstacleColour);

  // --- the two kinds of round ----------------------------------------------------------------------------
  // The player's grow with age, so they are asked for per round; the enemies' are fixed at spawn.
  for (const b of s.bullets.bullets) outlineCircle(g, b.x, b.y, radiusOf(b, s.laneWidth, s.bulletRadiusMultiplier));
  stroke(cfg.playerBulletColour);

  for (const b of s.enemyBullets.bullets) outlineCircle(g, b.x, b.y, s.laneWidth * b.radiusRatio);
  stroke(cfg.enemyBulletColour);

  // --- the bubble ----------------------------------------------------------------------------------------
  outlineCircle(g, s.playerX, s.playerY, s.playerRadius);
  stroke(cfg.playerColour);

  // --- the near-miss rings, which are a second and larger circle around the same test --------------------
  for (const h of s.hazards.hazards) {
    if (!grazeLive(h)) continue;
    const reach = s.playerRadius + s.laneWidth * hazardSizeFraction(h.kind, h.scale);
    const extra = reach * (mech.graze.radiusMultiplier - 1);
    const box = hazardBoxFractions(h.kind, h.variety, h.scale);
    if (box) {
      // The box pushed out by the same `extra` the collision pushes it out by, so the dashed band is the band.
      outlineBox(g, h.x, h.y, box.halfW * s.laneWidth + extra, box.halfH * s.laneWidth + extra);
    } else {
      dashedCircle(g, h.x, h.y, reach * mech.graze.radiusMultiplier, cfg.dashLength, cfg.dashGap);
    }
  }
  for (const b of s.enemyBullets.bullets) {
    if (b.grazed) continue;
    const reach = s.playerRadius + s.laneWidth * b.radiusRatio;
    dashedCircle(g, b.x, b.y, reach * mech.graze.radiusMultiplier, cfg.dashLength, cfg.dashGap);
  }
  stroke(cfg.grazeColour);
}
