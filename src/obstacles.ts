import { Graphics } from 'pixi.js';
import { mech } from './mechanisms';

/**
 * The two kinds, and they pull in opposite directions on purpose.
 *
 *   crate  weak, and worth destroying -- a target for a spat crab, and free passage for anything big enough
 *   coral  tough, and worth AVOIDING -- the thing that makes being small an advantage
 *
 * A player has to tell them apart at a glance, which is why their silhouettes differ as much as their numbers do.
 */
export type ObstacleKind = 'crate' | 'coral';

/** A placed obstacle. */
export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  /** World position in metres. */
  x: number;
  y: number;
  /** Drawn and collided radius, as a fraction of the lane width. */
  radiusFraction: number;
  /** Remaining toughness. Reaches zero and the obstacle breaks. */
  health: number;
  /** Fraction, 0..1, of the original health. For the visual damage state. */
  healthFraction: number;
  /** Seconds since it appeared, for the coral's slow shimmer. */
  age: number;
}

/**
 * The obstacle field: spawning, damage, and collision.
 *
 * A field rather than loose state in the game, for the same reason the hazard and collectable fields exist: the
 * simulation should be testable without a player, and the game should decide what a collision MEANS while the
 * field decides what happened.
 *
 * Obstacles are the only thing in this game that is neither food nor threat but SCENERY, and the two kinds pull
 * in opposite directions on purpose:
 *
 *   crate  weak, and worth destroying -- a target for a spat crab, and free passage for anything big enough
 *   coral  tough, and worth AVOIDING -- the thing that makes being small an advantage
 *
 * Both are `Hazard`-shaped enough to reuse the level timeline, but they are not hazards and do not live in that
 * field: they never chase, never drain, and their interaction with the player is "blocked or broken".
 */

/** What happened when something hit an obstacle, for the game to turn into effects. */
export interface ObstacleHit {
  id: number;
  kind: ObstacleKind;
  /** True when this hit destroyed it. */
  broke: boolean;
}

/**
 * The rules that decide an outcome, as free functions rather than methods.
 *
 * Kept out of `ObstacleField` so the numbers can be asserted directly, without constructing a field or running a
 * simulation -- the config is the thing under test, and a test that has to build a world to read a constant is
 * testing two things at once.
 */
export function obstacleHealth(kind: ObstacleKind): number {
  return mech.obstacles.health[kind] ?? 1;
}

/** A kind's drawn and collided radius, as a fraction of the lane width. */
export function obstacleRadius(kind: ObstacleKind): number {
  return mech.obstacles.radius[kind] ?? 0.05;
}

/**
 * Damage a projectile does to an obstacle, from the ammunition's impact factor.
 *
 * Scaled by the impact so "the item keeps its own properties" extends to breaking things: a crab is a battering
 * ram and a jellyfish barely scratches the paint.
 */
export function projectileDamage(impact: number): number {
  return mech.obstacles.projectileDamage * impact;
}

/**
 * Damage the PLAYER does by running into an obstacle, or 0 when they are too small to matter.
 *
 * Proportional to how far past the threshold the player is, so "just big enough" is a scratch and a giant goes
 * straight through. Zero below the threshold is what makes a small player BLOCKED rather than damaging.
 */
export function ramDamage(playerVolume: number): number {
  if (playerVolume < mech.obstacles.ramVolumeThreshold) return 0;
  return (playerVolume - mech.obstacles.ramVolumeThreshold) * mech.obstacles.ramDamagePerVolume;
}

/**
 * Whether a row of obstacles leaves a gap wide enough to pass.
 *
 * The rule that keeps the level fair, and it lives here beside the numbers it depends on rather than in the level
 * file. A sealed row would make being small MANDATORY at that point rather than a choice, which turns the whole
 * "should I be big here" question into a requirement -- so this is checked at startup against every authored row.
 *
 * Checks the two ends and every gap between neighbours: a row can fail by being too dense in the middle just as
 * easily as by blocking an edge.
 */
export function rowGapIsPassable(occupied: readonly { x: number; radius: number }[]): boolean {
  if (!occupied.length) return true;
  const required = mech.obstacles.minGapFraction;
  const sorted = [...occupied].sort((a, b) => a.x - b.x);

  // The gaps at the two edges, measured from the lane's bounds.
  if (sorted[0]!.x - sorted[0]!.radius > required) return true;
  const last = sorted[sorted.length - 1]!;
  if (1 - (last.x + last.radius) > required) return true;

  for (let i = 1; i < sorted.length; i++) {
    const left = sorted[i - 1]!;
    const right = sorted[i]!;
    if (right.x - right.radius - (left.x + left.radius) > required) return true;
  }
  return false;
}

export class ObstacleField {
  obstacles: Obstacle[] = [];
  /** Monotonic count of obstacles broken, so a test can prove one was destroyed rather than merely hit. */
  broken = 0;

  private nextId = 1;

  reset(): void {
    this.obstacles = [];
    this.broken = 0;
  }

  /** Place one from the level timeline. */
  spawn(kind: ObstacleKind, x: number, y: number): Obstacle {
    const health = obstacleHealth(kind);
    const obstacle: Obstacle = {
      id: this.nextId++,
      kind,
      x,
      y,
      radiusFraction: obstacleRadius(kind),
      health,
      healthFraction: 1,
      age: 0,
    };
    this.obstacles.push(obstacle);
    return obstacle;
  }

  /**
   * Apply damage and report what broke.
   *
   * @return the hit, or null when the obstacle was already gone. Returning rather than mutating-and-hoping means
   *   the caller learns about the break on the frame it happens, which is when the visual and the sound belong.
   */
  damage(id: number, amount: number): ObstacleHit | null {
    const obstacle = this.obstacles.find((o) => o.id === id);
    if (!obstacle) return null;
    obstacle.health -= amount;
    obstacle.healthFraction = Math.max(0, obstacle.health / Math.max(0.0001, obstacleHealth(obstacle.kind)));
    if (obstacle.health > 0) return { id, kind: obstacle.kind, broke: false };
    this.obstacles = this.obstacles.filter((o) => o.id !== id);
    this.broken++;
    return { id, kind: obstacle.kind, broke: true };
  }

  /**
   * Tick ages and retire anything that has left the working area.
   *
   * `min`/`max` are the visible world range; the margin matches the hazard field's, so an obstacle reacts to the
   * camera at the same distance everything else does.
   */
  update(dt: number, min: number, max: number): void {
    for (const o of this.obstacles) o.age += dt;
    this.obstacles = this.obstacles.filter((o) => o.y > min - 120 && o.y < max + 160);
  }

  /**
   * Resolve a projectile against the obstacles.
   *
   * @return the hit, or null when nothing was in the way.
   */
  hitByProjectile(x: number, y: number, hitRadius: number, impact: number): ObstacleHit | null {
    for (const o of this.obstacles) {
      const r = mech.obstacles.radius[o.kind] ?? 0.05;
      const reach = hitRadius + r;
      const dx = o.x - x;
      const dy = o.y - y;
      if (dx * dx + dy * dy > reach * reach) continue;
      return this.damage(o.id, projectileDamage(impact));
    }
    return null;
  }

  /**
   * Resolve the player against the obstacles.
   *
   * TWO OUTCOMES, and which one happens is the whole point of the mechanic:
   *
   *   big enough   ->  the obstacle takes ram damage, and a crate simply ceases to exist
   *   not big enough ->  the player is stopped by it and takes a hit
   *
   * The "big enough" threshold is a volume, not a size comparison, so it is the same ladder the eating rules use
   * and the player can reason about it the same way.
   *
   * @return the hit if the player broke something, or a `blocked` result when they could not.
   */
  resolvePlayer(
    x: number,
    y: number,
    playerRadius: number,
    playerVolume: number,
    invulnerable: boolean,
  ): { hit: ObstacleHit | null; blocked: boolean } {
    for (const o of this.obstacles) {
      const r = mech.obstacles.radius[o.kind] ?? 0.05;
      const reach = playerRadius + r;
      const dx = o.x - x;
      const dy = o.y - y;
      if (dx * dx + dy * dy > reach * reach) continue;

      const ram = ramDamage(playerVolume);
      if (ram > 0) {
        const hit = this.damage(o.id, ram);
        return { hit, blocked: false };
      }
      // Too small to matter: an invulnerable player still cannot pass, they just do not get hurt for trying.
      return { hit: null, blocked: !invulnerable };
    }
    return { hit: null, blocked: false };
  }

  /** Test hook: how many are alive. */
  get count(): number {
    return this.obstacles.length;
  }
}

/**
 * Draw the obstacles.
 *
 * Crates are boxy and coral is organic, and the difference matters: the player has to tell at a glance which one
 * is worth shooting and which one is worth avoiding. Damage shows as cracks rather than as a health bar, because
 * a bar on every crate would be more UI than scenery.
 */
export function paintObstacles(g: Graphics, field: ObstacleField, laneWidth: number): void {
  for (const o of field.obstacles) {
    const r = laneWidth * o.radiusFraction;
    const damaged = 1 - o.healthFraction;
    const darken = 1 - damaged * mech.obstacles.damagedDarken;

    if (o.kind === 'crate') {
      const body = shade(mech.obstacles.crateColor, darken);
      const rim = shade(mech.obstacles.crateRimColor, darken);
      // A box, with plank lines so it reads as wood rather than as a generic square.
      g.rect(o.x - r, o.y - r, r * 2, r * 2).fill({ color: body, alpha: 0.9 });
      g.rect(o.x - r, o.y - r, r * 2, r * 2).stroke({ color: rim, alpha: 0.95, width: r * 0.16 });
      g.moveTo(o.x - r, o.y).lineTo(o.x + r, o.y);
      g.moveTo(o.x, o.y - r).lineTo(o.x, o.y + r);
      g.stroke({ color: rim, alpha: 0.6, width: r * 0.1 });
    } else {
      const body = shade(mech.obstacles.coralColor, darken);
      const rim = shade(mech.obstacles.coralRimColor, darken);
      // A blob with branches: coral is a thing that grows, not a thing that was built.
      g.circle(o.x, o.y, r).fill({ color: body, alpha: 0.85 });
      g.circle(o.x, o.y, r).stroke({ color: rim, alpha: 0.95, width: r * 0.16 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + o.age * 0.2;
        g.moveTo(o.x + Math.cos(a) * r * 0.5, o.y + Math.sin(a) * r * 0.5);
        g.lineTo(o.x + Math.cos(a) * r * 1.35, o.y + Math.sin(a) * r * 1.35);
      }
      g.stroke({ color: rim, alpha: 0.7, width: r * 0.12 });
    }

    // Cracks, proportional to the damage taken. Drawn as radial nicks so a fresh crate has none at all.
    if (damaged > 0.05) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + o.id;
        const outer = r * (0.55 + 0.4 * damaged);
        g.moveTo(o.x + Math.cos(a) * r * 0.25, o.y + Math.sin(a) * r * 0.25);
        g.lineTo(o.x + Math.cos(a) * outer, o.y + Math.sin(a) * outer);
      }
      g.stroke({ color: 0x101820, alpha: 0.5 * damaged, width: r * mech.obstacles.crackWidthRatio });
    }
  }
}

/** Multiply a packed colour's channels, for the "damaged things look darker" cue. */
function shade(colour: number, factor: number): number {
  const r = Math.max(0, Math.min(255, Math.round(((colour >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((colour >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((colour & 255) * factor)));
  return (r << 16) | (g << 8) | b;
}
