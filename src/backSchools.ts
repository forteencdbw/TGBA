import { advanceLeader, createSchool, seedMember, steerSchool, type BoidState, type Flocker, type School } from './boids';
import { mech } from './mechanisms';

/**
 * Schools in the BACKGROUND: the same Boids simulation as the foreground school, with nothing in the game able to touch it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------------------------
 * A level block with `layer: 'back'` makes one of these. It has the same leader on the same spline and the same four forces as a
 * foreground school (`steerSchool` is the one function that steers both), and its fish are `BackFish`: a position, a velocity and
 * a picture. They are not `Hazard`s, so there is no hitbox, no bullet passes into them, nothing eats them and nothing reads
 * them to decide anything. That is by construction and not by a flag on a hazard that every system would have to remember to
 * check: the systems that ask "what is in the water" walk `HazardField.hazards`, and a background fish is not in it.
 *
 * They are drawn behind everything (`src/backSchoolLayer.ts`), and `distance` -- 0 near, 1 far -- decides how big and how dim:
 * see `backScaleAt` and `backTintAt`. Distance does NOT slow a school down. How fast it crosses is the path's, because the author
 * decides that and a school whose speed secretly depended on a second number would be a surprise.
 *
 * ---------------------------------------------------------------------------------------------
 * THEY ARE ON THE SCREEN
 * ---------------------------------------------------------------------------------------------
 * Like every creature, a school's path is drawn on the screen and not on the water: `update` is handed the camera's rise each
 * frame and moves the leader's anchor and every fish with it. The scroll is the level's progress and nothing else.
 *
 * They live INSIDE the hazard field object (`HazardField.back`) rather than beside it, because everything about their
 * lifetime is the hazard field's: it is reset with it, it is stepped by the same `update` with the same context, and it
 * stops when the hazards stop (a paused or ended level freezes the water, background included).
 */

/** One background fish: where it is, how it is moving, and nothing that makes it a thing in the game. */
export interface BackFish extends Flocker {
  boid: BoidState;
  /** Seconds its tail has been animating, from a random start so that no two tails are in step. */
  clock: number;
}

/** One background school: its invisible leader, its fish, and the two numbers that decide how it is drawn. */
export interface BackSchool {
  id: number;
  school: School;
  /** Which of the fish's looks it shows -- the block's `variety`. */
  variety: number;
  /** 0 (near) to 1 (far): the block's `distance`. */
  distance: number;
  members: BackFish[];
}

const lerp = (near: number, far: number, distance: number): number => near + (far - near) * Math.max(0, Math.min(1, distance));

/** How big a fish at this distance is, as a multiple of an ordinary fish: from `back.scaleNear` to `back.scaleFar`. */
export function backScaleAt(distance: number): number {
  const cfg = mech.hazards.boids.back;
  return lerp(cfg.scaleNear, cfg.scaleFar, distance);
}

/**
 * The colour a fish at this distance is multiplied by: white at the near end, `back.tint` at the far end, by `dimNear` to
 * `dimFar` of the way. One colour does both of the things distance does to a colour -- it darkens and it cools -- because
 * the tint is a dark, cool blue and the sprite is multiplied by it.
 */
export function backTintAt(distance: number): number {
  const cfg = mech.hazards.boids.back;
  const t = Math.max(0, Math.min(1, lerp(cfg.dimNear, cfg.dimFar, distance)));
  const mix = (shift: number): number => Math.round(255 + (((cfg.tint >> shift) & 255) - 255) * t);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}

export class BackSchools {
  readonly schools = new Map<number, BackSchool>();

  /** Every background fish alive, for a probe and for the diagnostics. */
  get fishCount(): number {
    let n = 0;
    for (const s of this.schools.values()) n += s.members.length;
    return n;
  }

  reset(): void {
    this.schools.clear();
  }

  /**
   * Add one fish to the school with this id, making the school first if it is the first of its fish to be placed.
   *
   * Called once per fish by the level's placement, exactly as a foreground school is built, so the two layers are placed by the
   * same loop. `startY` and `screen` are the placement's: the path's `y` is a fraction of a screen from where the school was put.
   * `size` is how many fish the block makes, which is what spaces the fish's depths evenly (see `seedMember`).
   */
  place(
    id: number,
    path: { points: readonly { x: number; y: number }[]; seconds: number },
    startY: number,
    laneWidth: number,
    screen: number,
    variety: number,
    distance: number,
    size: number,
    radiusFraction: number,
  ): BackFish {
    let entry = this.schools.get(id);
    if (!entry) {
      entry = { id, school: createSchool(id, path, startY, laneWidth, screen), variety, distance, members: [] };
      this.schools.set(id, entry);
    }
    const school = entry.school;
    const seed = seedMember(school, laneWidth, size);
    const fish: BackFish = {
      x: seed.x,
      y: seed.y,
      seed: Math.random() * Math.PI * 2,
      // Facing the school's way from the first frame, for the reason the foreground fish are: a fish with no heading is drawn
      // facing the way the picture was drawn, which is the wrong way for half the schools and would turn on its first step.
      heading: Math.abs(school.dirX) > 0.05 ? Math.sign(school.dirX) : 0,
      radiusFraction,
      flee: null,
      boid: { school: id, ...seed.boid },
      clock: Math.random() * 4,
    };
    entry.members.push(fish);
    return fish;
  }

  /**
   * One frame: carry everything with the camera, walk the leaders, steer the fish, move them, and retire the ones that left.
   *
   * `rise` is how far the camera climbed this frame (metres). The leader's anchor and its position both move, so the leader's
   * own velocity -- which is read from how far it moved -- stays the path's and does not pick up the camera's.
   */
  update(dt: number, laneWidth: number, min: number, max: number, rise: number): void {
    if (this.schools.size === 0) return;
    const screen = Math.max(1, max - min);
    for (const [id, entry] of this.schools) {
      if (entry.members.length === 0) {
        this.schools.delete(id);
        continue;
      }
      const school = entry.school;
      if (rise !== 0) {
        school.startY += rise;
        school.y += rise;
        for (const f of entry.members) f.y += rise;
      }
      advanceLeader(school, dt, laneWidth, screen);
      steerSchool(entry.members, school, dt, laneWidth);
      for (const f of entry.members) {
        f.x += f.boid.vx * dt;
        f.y += f.boid.vy * dt;
        f.clock += dt;
      }
      // The same two retirements a foreground fish gets: out of the lane sideways once it has been marked as leaving (see
      // `steerSchool`), and out of the vertical band the hazard field itself culls on.
      entry.members = entry.members.filter((f) => {
        if (f.flee === 'left' || f.flee === 'right') return false;
        return f.y > min - 80 && f.y < max + 120;
      });
    }
  }
}
