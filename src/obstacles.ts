import { Graphics } from 'pixi.js';
import { OBSTACLE_KINDS, mech } from './mechanisms';

/**
 * The four kinds, and they are four different ANSWERS rather than four durability tiers.
 *
 *   crate  weak, and worth destroying -- a target for a spat crab, and free passage for anything big enough
 *   coral  tough, and worth AVOIDING -- the thing that makes being small an advantage
 *   wall   cannot be rammed at ANY size: the answer is ammunition, or the minimum gap
 *   net    soft and wraparound: it stops you and does not hurt you, and you tear it by pushing
 *
 * A player has to tell them apart at a glance, which is why their silhouettes differ as much as their numbers do.
 *
 * The union is DERIVED from the config's kind list rather than written twice, so adding a kind is one edit in
 * `mechanisms.ts` and the boot check there then insists on a health and a radius row for it.
 */
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];

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
  /**
   * Set while it is drifting in from a side, and null once it has settled where the level put it.
   *
   * Scenery is static in the water, so an obstacle that arrives from a side arrives ONCE and then stays: it drifts
   * to its authored x and stops, and from then on it behaves exactly like a crate the current carried down. There is
   * no `bottom` case -- scenery cannot swim up, and the loader refuses it rather than placing something that would
   * sink straight back out of the level.
   */
  entry: { speed: number; targetX: number } | null;
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
 * A charge attack arriving at an obstacle: flat damage, and whether it may break what no volume can.
 *
 * Deliberately NOT a volume and not a damage-per-frame: what a slam does is the bubble TYPE's business (the
 * volatile bubble computes it from rage), and this module only has to know that something hit hard and whether
 * that something is allowed to break a wall.
 */
export interface Slam {
  damage: number;
  /** Whether this type can break kinds whose `ramVolume` is null. See `angry.charge.slamBreaksUnrammable`. */
  breaksUnrammable: boolean;
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
 *
 * ---------------------------------------------------------------------------------------------
 * ZERO IS ALSO WHAT A WALL AND A NET ALWAYS GET
 * ---------------------------------------------------------------------------------------------
 * The threshold is per KIND (`ramVolume`), and for those two it is `null`: no volume smashes them. A wall wants
 * ammunition or the gap, and a net is not smashed at all -- it is torn, by pushing, for which `tornPerSecond` is
 * the rate. So the same function answers "how much does ramming this do", and for two kinds the answer is "nothing,
 * ever", which is a rule rather than a big number.
 */
export function ramDamage(playerVolume: number, kind: ObstacleKind): number {
  const threshold = ramVolumeFor(kind);
  if (threshold === null) return 0;
  if (playerVolume < threshold) return 0;
  return (playerVolume - threshold) * mech.obstacles.ramDamagePerVolume;
}

/**
 * What each obstacle kind is called on screen.
 *
 * Here rather than in the codex's prose or in a banner string, because a name that appears in two places is a name
 * that will disagree with itself: the codex card, the release banner and any future prompt all read this.
 */
export const OBSTACLE_NAMES: Record<ObstacleKind, string> = {
  crate: '木箱',
  coral: '珊瑚',
  wall: '封路木箱',
  net: '渔网',
};

/** A kind's display name. */
export function obstacleName(kind: ObstacleKind): string {
  return OBSTACLE_NAMES[kind] ?? kind;
}

/**
 * The volume needed to smash this kind, or null when nothing does.
 *
 * Spelled as `null` in the config rather than as an unreachably large number, because "unreachably large" stops
 * being true the moment `volume.max` is raised and nothing would have to be revisited.
 */
export function ramVolumeFor(kind: ObstacleKind): number | null {
  const override = mech.obstacles.ramVolume[kind];
  return override === undefined ? mech.obstacles.ramVolumeThreshold : override;
}

/**
 * What a frame of CONTACT does to this kind, in the same units as its `health`.
 *
 * Almost everything takes its damage from the ram, so this is zero for them -- contact alone does nothing and the
 * only ways through are smashing or going around. A net is the exception, and it is what makes a net a net: pushing
 * against it tears it at one point per second, so its `health` reads as "seconds of shoving".
 */
export function contactDamage(kind: ObstacleKind, dt: number): number {
  return touchTears(kind) ? dt : 0;
}

/** Whether pushing against this kind wears it down. True for exactly the kinds that cannot be rammed by size. */
export function touchTears(kind: ObstacleKind): boolean {
  return kind === 'net';
}

/** Whether touching this kind can hurt the player. A net never does; everything else does when it stops you. */
export function contactHurts(kind: ObstacleKind): boolean {
  return !touchTears(kind);
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

  /** Place one from the level timeline, optionally still drifting in from a side. */
  spawn(kind: ObstacleKind, x: number, y: number, entry?: { speed: number; targetX: number }): Obstacle {
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
      entry: entry ?? null,
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
    for (const o of this.obstacles) {
      o.age += dt;
      /**
       * A drifting arrival, which ENDS at the authored x.
       *
       * Clamped rather than free: a crate that kept its velocity after arriving would sail across the lane and out
       * the other side, which is not a piece of scenery, it is a moving obstacle -- a different mechanic, and one
       * nobody asked for. So it settles exactly where the level said, and from then on it is static.
       */
      if (o.entry) {
        const step = o.entry.speed * dt;
        const remaining = o.entry.targetX - o.x;
        if (Math.abs(remaining) <= step) {
          o.x = o.entry.targetX;
          o.entry = null;
        } else {
          o.x += Math.sign(remaining) * step;
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.y > min - 120 && o.y < max + 160);
  }

  /**
   * Whether an obstacle is in the way of a projectile at this point.
   *
   * The bullets are small bubbles rather than thrown creatures: scenery stops them (a crate in front of a fish
   * should stop what you are shooting at it) but they leave no mark on it. That needs its own query rather than
   * `hitByProjectile(..., 0)`, which would route a block through the damage code and make a zero-damage hit
   * indistinguishable from a real one in the counters.
   */
  blocks(x: number, y: number, hitRadius: number): boolean {
    for (const o of this.obstacles) {
      const r = mech.obstacles.radius[o.kind] ?? 0.05;
      const reach = hitRadius + r;
      const dx = o.x - x;
      const dy = o.y - y;
      if (dx * dx + dy * dy <= reach * reach) return true;
    }
    return false;
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
   * THREE OUTCOMES, and which one happens is the whole point of the mechanic:
   *
   *   big enough     ->  the obstacle takes ram damage, and a crate simply ceases to exist
   *   not big enough ->  the player is stopped by it and takes a hit
   *   soft (a net)   ->  the player is dragged, takes NOTHING, and tears it by pushing
   *
   * The "big enough" threshold is a volume, not a size comparison, so it is the same ladder the eating rules use
   * and the player can reason about it the same way. For a wall that ladder simply never arrives, and for a net it
   * does not apply at all.
   *
   * `dt` is here rather than in the caller because a net's tear IS a rate: the caller knows how much time passed,
   * but only this function knows which obstacle it was passing against.
   *
   * `slam` is the fourth answer, and it belongs to one bubble type: a charge that does a flat amount of damage to
   * whatever it touches, decided by RAGE rather than by volume. See `Slam`. It is passed in rather than computed
   * here because "how hard does this bubble hit" is the type's business, and this module is the only place that
   * knows which obstacle was touched.
   *
   * @return the hit if the player broke something, whether they were stopped, whether being stopped HURT, and
   *   whether something is dragging on them this frame.
   */
  resolvePlayer(
    x: number,
    y: number,
    playerRadius: number,
    playerVolume: number,
    invulnerable: boolean,
    dt: number,
    slam?: Slam,
  ): { hit: ObstacleHit | null; blocked: boolean; hurt: boolean; dragging: boolean } {
    for (const o of this.obstacles) {
      const r = mech.obstacles.radius[o.kind] ?? 0.05;
      const reach = playerRadius + r;
      const dx = o.x - x;
      const dy = o.y - y;
      if (dx * dx + dy * dy > reach * reach) continue;

      /**
       * A slam, first, because it OVERRIDES the ordinary rules rather than adding to them.
       *
       * The volatile bubble's charge is the design's "third answer" to a wall: where the devour bubble must find
       * ammunition or squeeze through the minimum gap, this one buys passage with rage. So the slam does not ask
       * whether the kind is rammable -- it asks only whether this type is allowed to break that kind at all
       * (`breaksUnrammable`), which is the one design decision the document flagged as needing to be made with the
       * mechanic rather than after it.
       */
      if (slam) {
        const rammable = ramVolumeFor(o.kind) !== null;
        if (!rammable && !slam.breaksUnrammable) continue;
        const hit = this.damage(o.id, slam.damage);
        // A slam never stops the bubble and never hurts it: it is the player's own committed attack, and being
        // stopped by the thing you just hit would make chaining impossible -- which is the whole feel of the verb.
        return { hit, blocked: false, hurt: false, dragging: false };
      }

      /**
       * Pushing, for the kinds that are torn rather than smashed.
       *
       * Checked BEFORE the ram, because a net is never rammed -- but the two are not exclusive in principle, and
       * the order states which rule wins if a kind were ever both.
       *
       * Note what this does NOT return: `blocked`. A net does not stop the player and does not hurt them. It DRAGS,
       * and `dragging` is how the game knows to slow them down -- which is the only thing that makes a net felt at
       * all. A soft obstacle that silently did nothing on contact would be indistinguishable from open water: the
       * player would fly through, tear nothing, and never learn it had been there.
       */
      const rub = contactDamage(o.kind, dt);
      if (rub > 0) {
        const hit = this.damage(o.id, rub);
        // Still intact, so still dragging. Torn through, and it lets go.
        //
        // `hit.broke`, NOT `!hit`: `damage` returns a hit object whether or not the thing died, so a bare
        // truthiness test reads as "already broken" on every frame of the tear and the drag is never applied. The
        // net still tore correctly, which is why this was invisible until a probe looked at the slow factor and
        // found it flat at 1.
        return { hit, blocked: false, hurt: false, dragging: hit?.broke !== true };
      }

      const ram = ramDamage(playerVolume, o.kind);
      if (ram > 0) {
        const hit = this.damage(o.id, ram);
        return { hit, blocked: false, hurt: false, dragging: false };
      }
      // Too small to matter: an invulnerable player still cannot pass through unharmed, they just do not get hurt
      // for trying.
      return { hit: null, blocked: !invulnerable, hurt: !invulnerable && contactHurts(o.kind), dragging: false };
    }
    return { hit: null, blocked: false, hurt: false, dragging: false };
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
    } else if (o.kind === 'wall') {
      const body = shade(mech.obstacles.wallColor, darken);
      const rim = shade(mech.obstacles.wallRimColor, darken);
      /**
       * The same wood, stacked as BOARDS.
       *
       * The rule this has to carry is "the crate you know, but it is not going anywhere in one push", so the material
       * stays the same and only the shape changes.
       *
       * It took three attempts to find a shape that says that. Four quarters read as a WINDOW (one object with a
       * thick frame); four quarters with plank lines inside read as a GRATING, which is the worst of the three --
       * a wall that looks like the net is a wall a player cannot identify at a glance, and the two are answered in
       * opposite ways. Horizontal boards share no shape with a rope mesh and no shape with a single crate.
       */
      const planks = 3;
      const plank = (r * 2) / planks;
      for (let i = 0; i < planks; i++) g.rect(o.x - r, o.y - r + i * plank, r * 2, plank);
      g.fill({ color: body, alpha: 0.92 });
      for (let i = 1; i < planks; i++) {
        g.moveTo(o.x - r, o.y - r + i * plank).lineTo(o.x + r, o.y - r + i * plank);
      }
      g.stroke({ color: rim, alpha: 0.8, width: r * 0.1 });
      g.rect(o.x - r, o.y - r, r * 2, r * 2).stroke({ color: rim, alpha: 0.95, width: r * 0.16 });
    } else if (o.kind === 'net') {
      /**
       * A mesh, and the hole GROWS as it tears.
       *
       * The tear is the whole interaction -- you hold a direction for a second and a half and it gives -- so it has
       * to be visible from the inside of it. A net that looked the same the whole time would read as "this is a wall
       * and the game is broken", which is the one failure a soft obstacle cannot afford.
       *
       * Drawn as whole grid lines with the middle ones omitted near the tear, so the hole is a real gap in the mesh
       * rather than a dot drawn on top of it.
       */
      const body = mech.obstacles.netColor;
      const rim = shade(mech.obstacles.netRimColor, darken);
      const mesh = mech.obstacles.netMesh;
      // 1 when whole, 0 when torn through: the radius of the intact ring around the hole.
      const torn = Math.min(1, damaged * 1.6);
      const hole = r * 0.9 * torn;
      g.rect(o.x - r, o.y - r, r * 2, r * 2).fill({ color: rim, alpha: 0.22 });
      for (let i = 0; i < mesh; i++) {
        const t = (i / (mesh - 1)) * 2 - 1; // -1..1 across the square
        const d = Math.abs(t * r);
        /**
         * Where this line meets the edge of the hole, or 0 when it misses the hole entirely.
         *
         * The exact chord rather than a flat `hole` radius: with a flat radius every line stops at the same distance
         * from the centre, so the "hole" comes out as a square-ish notch and the rope ends float away from the tear.
         * `sqrt(hole^2 - d^2)` is where a line at distance `d` actually leaves the circle, and it is automatically 0
         * for lines outside it -- which is why there is no separate skip case.
         */
        const gap = hole > 0 && d < hole ? Math.sqrt(hole * hole - d * d) : 0;
        for (const sign of [-1, 1] as const) {
          g.moveTo(o.x + t * r, o.y + sign * r);
          g.lineTo(o.x + t * r, o.y + sign * gap);
          g.moveTo(o.x + sign * r, o.y + t * r);
          g.lineTo(o.x + sign * gap, o.y + t * r);
        }
      }
      g.stroke({ color: body, alpha: 0.85, width: r * 0.09 });
      g.rect(o.x - r, o.y - r, r * 2, r * 2).stroke({ color: rim, alpha: 0.75, width: r * 0.11 });
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
