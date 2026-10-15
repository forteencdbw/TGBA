import { mech } from './mechanisms';
import type { Hazard } from './hazards';
import { pathPoint } from './spline';

/**
 * Boids for the super-school: fifty small fish that swim as one body.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS A SCHOOL HERE
 * ---------------------------------------------------------------------------------------------
 * A school is a spline-walking LEADER that nobody can see, and a crowd of ordinary fish pulled toward it. The leader is
 * the spline's creature (it is the one thing in the water that follows a `path`, with the same coordinates and the same
 * Catmull-Rom curve every other pathed creature uses); the fish are the Boids.
 *
 * It is a leader rather than "the first fish leads" because a fish can be shot. The first one dying would have to hand
 * the lead on, and the school would trail off behind whichever fish inherited it; an invisible leader cannot be killed,
 * so the school's route is the level's route however many of it are gone.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FOUR FORCES
 * ---------------------------------------------------------------------------------------------
 *   separation   neighbours closer than `separationRadius` push apart, harder the closer they are
 *   alignment    the velocity is pulled toward the neighbours' average
 *   cohesion     the position is pulled toward the neighbours' centroid
 *   leader       a spring on the position and a damper on the velocity, toward the leader
 *
 * They are ACCELERATIONS, summed and then capped at `maxAccel`, and the speed is clamped between a floor and a ceiling.
 * Written as accelerations rather than as "desired velocity minus velocity" steering because the numbers read as what
 * they do: a spring constant is how hard the leader pulls, in a unit anybody can check.
 *
 * Every length is a LANE fraction (the lane is a fixed 361 m wide, so a lane fraction is the same school on every
 * display) and positions are the water's own metres.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS NOT HERE
 * ---------------------------------------------------------------------------------------------
 * Nothing looks at the player. The school does not chase and does not flee: it is a thing in the level that you go
 * through or around, like a fish string on a spline, only with a body. (`stepFish`'s perception radius belongs to the
 * ordinary fish and does not apply.)
 */

/** One member's state: which school it belongs to, and its velocity in metres per second. */
export interface BoidState {
  school: number;
  vx: number;
  vy: number;
}

/** The invisible leader of one school, and the spline it walks. */
export interface School {
  id: number;
  /** The level's own waypoints, by reference: a hundred members on one path still share one spline. */
  points: readonly { x: number; y: number }[];
  seconds: number;
  /** Seconds since the school was placed. */
  elapsed: number;
  /** The water's height at the moment the school was placed: the path's `y` is measured from here. */
  startY: number;
  /** The leader's position and velocity, in metres and metres per second. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Set once the leader has reached the end of the spline, where it stops. */
  finished: boolean;
}

/** The leader's place at a moment of the spline, in the water's metres. Same coordinates as a pathed creature. */
function leaderAt(school: Pick<School, 'points' | 'startY'>, t: number, laneWidth: number, screen: number): { x: number; y: number } {
  const p = pathPoint(school.points, t);
  return { x: p.x * laneWidth, y: school.startY + p.y * screen };
}

/**
 * A new school, with its leader on the first point of the spline and already moving at the speed the spline starts at.
 *
 * Moving from the start matters: a school born with its leader at rest would have its first fish pulled to a stationary
 * point while the leader accelerated away from them, and the school would be strung out behind it for its first seconds.
 */
export function createSchool(
  id: number,
  path: { points: readonly { x: number; y: number }[]; seconds: number },
  startY: number,
  laneWidth: number,
  screen: number,
): School {
  const seconds = Math.max(0.1, path.seconds);
  const school: School = { id, points: path.points, seconds, elapsed: 0, startY, x: 0, y: 0, vx: 0, vy: 0, finished: false };
  const here = leaderAt(school, 0, laneWidth, screen);
  // The speed the curve starts at, measured over a hundredth of its length: the derivative, without writing one out.
  const eps = 0.01;
  const ahead = leaderAt(school, eps, laneWidth, screen);
  school.x = here.x;
  school.y = here.y;
  school.vx = (ahead.x - here.x) / (eps * seconds);
  school.vy = (ahead.y - here.y) / (eps * seconds);
  return school;
}

/**
 * Where a new member is born, and how it is moving: somewhere in the cloud around the leader, at the leader's velocity.
 *
 * Uniform over the DISC (the square root), not over the radius: a uniform radius piles the fish at the centre, and a
 * school that is born as a dense ball then bursts apart under its own separation.
 */
export function seedMember(school: School, laneWidth: number): { x: number; y: number; vx: number; vy: number } {
  const radius = mech.hazards.boids.spawnSpread * laneWidth * Math.sqrt(Math.random());
  const angle = Math.random() * Math.PI * 2;
  return {
    x: school.x + Math.cos(angle) * radius,
    y: school.y + Math.sin(angle) * radius,
    vx: school.vx,
    vy: school.vy,
  };
}

/** Walk the leader along the spline. It stops at the end rather than leaving: see `steerSchool` for how the school goes. */
export function advanceLeader(school: School, dt: number, laneWidth: number, screen: number): void {
  if (school.finished || dt <= 0) return;
  school.elapsed += dt;
  const t = Math.min(1, school.elapsed / school.seconds);
  const at = leaderAt(school, t, laneWidth, screen);
  school.vx = (at.x - school.x) / dt;
  school.vy = (at.y - school.y) / dt;
  school.x = at.x;
  school.y = at.y;
  if (t >= 1) {
    school.finished = true;
    school.vx = 0;
    school.vy = 0;
  }
}

/**
 * Steer every member of one school for this frame, and retire the ones that have left.
 *
 * Writes the new VELOCITY into each member (`h.boid`) and its `heading`; moving the fish is the hazard field's, which
 * integrates it in `advanceKind` AFTER the states that override a creature's motion (leaving, a recoil), so a shot fish
 * is still shoved and still driven off and the school does not fight it.
 *
 * `members` is every live, un-fled member: the caller has already left the rest out, so a fish that has been driven off
 * is neither pulled back into the school nor counted as a neighbour.
 *
 * O(n²) over the school, which is 2,500 distance tests at fifty fish -- cheaper than the sprites they drive.
 */
export function steerSchool(members: readonly Hazard[], school: School, dt: number, laneWidth: number): void {
  const cfg = mech.hazards.boids;
  const neighbourR = cfg.neighbourRadius * laneWidth;
  const neighbourSq = neighbourR * neighbourR;
  const separationR = cfg.separationRadius * laneWidth;
  const separationSq = separationR * separationR;
  const maxSpeed = cfg.maxSpeed * laneWidth;
  const minSpeed = cfg.minSpeed * laneWidth;
  const maxAccel = cfg.maxAccel * laneWidth;
  const sepAccel = cfg.separationAccel * laneWidth;
  const cohAccel = cfg.cohesionAccel * laneWidth;

  for (const a of members) {
    const boid = a.boid;
    if (!boid) continue;
    let sepX = 0;
    let sepY = 0;
    let avgVx = 0;
    let avgVy = 0;
    let centreX = 0;
    let centreY = 0;
    let seen = 0;
    for (const b of members) {
      if (a === b || !b.boid) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > neighbourSq) continue;
      seen++;
      avgVx += b.boid.vx;
      avgVy += b.boid.vy;
      centreX += b.x;
      centreY += b.y;
      if (distSq < separationSq) {
        // Away from the neighbour, linearly stronger as it gets closer. Two fish exactly on top of each other have no
        // "away", so one is picked at random rather than dividing by zero and returning NaN into the whole school.
        const dist = Math.sqrt(distSq);
        const push = (1 - dist / separationR) * sepAccel;
        if (dist > 1e-6) {
          sepX -= (dx / dist) * push;
          sepY -= (dy / dist) * push;
        } else {
          const angle = Math.random() * Math.PI * 2;
          sepX += Math.cos(angle) * push;
          sepY += Math.sin(angle) * push;
        }
      }
    }

    // Leader: a spring on the position, a damper on the velocity.
    let ax = cfg.leaderSpring * (school.x - a.x) + cfg.leaderDamp * (school.vx - boid.vx);
    let ay = cfg.leaderSpring * (school.y - a.y) + cfg.leaderDamp * (school.vy - boid.vy);
    ax += sepX;
    ay += sepY;
    if (seen > 0) {
      // Alignment: toward the neighbours' average velocity.
      ax += cfg.alignmentRate * (avgVx / seen - boid.vx);
      ay += cfg.alignmentRate * (avgVy / seen - boid.vy);
      // Cohesion: toward their centroid, at full strength once it is a neighbour-radius away and fading to nothing on top
      // of it. A force that grew with distance without bound would pull a straggler across the screen in one frame.
      const toX = centreX / seen - a.x;
      const toY = centreY / seen - a.y;
      const toLen = Math.hypot(toX, toY);
      if (toLen > 1e-6) {
        const pull = Math.min(1, toLen / neighbourR) * cohAccel;
        ax += (toX / toLen) * pull;
        ay += (toY / toLen) * pull;
      }
    }

    const accel = Math.hypot(ax, ay);
    if (accel > maxAccel) {
      ax *= maxAccel / accel;
      ay *= maxAccel / accel;
    }
    boid.vx += ax * dt;
    boid.vy += ay * dt;

    const speed = Math.hypot(boid.vx, boid.vy);
    if (speed > maxSpeed) {
      boid.vx *= maxSpeed / speed;
      boid.vy *= maxSpeed / speed;
    } else if (speed < minSpeed) {
      // A fish that has come to rest has no direction to speed up in; it takes the leader's, or any, rather than staying put.
      const heading = speed > 1e-6 ? { x: boid.vx / speed, y: boid.vy / speed } : { x: Math.cos(a.seed), y: Math.sin(a.seed) };
      boid.vx = heading.x * minSpeed;
      boid.vy = heading.y * minSpeed;
    }

    // Which way it is drawn facing: the way it is swimming, once it is swimming sideways enough to say.
    if (Math.abs(boid.vx) > 0.01 * laneWidth) a.heading = Math.sign(boid.vx);

    /**
     * THE SCHOOL LEAVES BY THE SIDE ONCE THE LEADER HAS STOPPED.
     *
     * The leader parks at the end of the spline, which is outside the lane (every path ends beyond an edge -- see the
     * level files), and the school gathers round it. A fish that is out past the lane by more than it is wide is retired the
     * way a driven-off one is, sideways, which is what the hazard field's own cull already removes: without it the
     * whole school would hang off-screen at the end of its path, alive, until the scroll carried it out of the
     * vertical band -- fifty creatures counted as active and tested for contact the whole time.
     */
    if (school.finished) {
      const margin = laneWidth * a.radiusFraction * 3;
      if (a.x < -margin) a.flee = 'left';
      else if (a.x > laneWidth + margin) a.flee = 'right';
    }
  }
}
