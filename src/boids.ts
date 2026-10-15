import { mech } from './mechanisms';
import type { Hazard } from './hazards';
import { pathPoint } from './spline';

/**
 * Boids for the super-school: a few hundred small fish that swim as one body.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS A SCHOOL HERE
 * ---------------------------------------------------------------------------------------------
 * A school is a spline-walking LEADER that nobody can see, and a crowd of ordinary fish pulled toward it. The leader is
 * the spline's creature (it walks a `path`, with the same coordinates and the same Catmull-Rom curve every other pathed
 * creature uses); the fish are the Boids.
 *
 * It is a leader rather than "the first fish leads" because a fish can be shot. The first one dying would have to hand
 * the lead on, and the school would trail off behind whichever fish inherited it; an invisible leader cannot be killed,
 * so the school's route is the level's route however many of it are gone.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO KINDS OF FISH IN ONE SCHOOL
 * ---------------------------------------------------------------------------------------------
 * The REAL ones are `Hazard`s: they hurt, can be shot, and are steered by the four forces below. Behind them swim the
 * DECOR fish, which are not hazards at all -- no hitbox, nothing shoots them, they exert no force and feel none -- and
 * which are only there so that a school reads as hundreds. A decor fish is a point that chases a place relative to the
 * leader, so a hundred and sixty of them cost one multiply-add each. They belong to the school (`School.decor`) and are
 * drawn by `src/schoolDecor.ts`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FOUR FORCES (real fish)
 * ---------------------------------------------------------------------------------------------
 *   separation   neighbours closer than `separationRadius` push apart, harder the closer they are -- measured in THREE
 *                dimensions, see below
 *   alignment    the velocity is pulled toward the neighbours' average
 *   cohesion     the position is pulled toward the neighbours' centroid
 *   leader       a spring on the position and a damper on the velocity, toward the leader -- a stiffer spring across the
 *                leader's heading than along it, which is what makes the school long rather than round
 *
 * They are ACCELERATIONS, summed and then capped at `maxAccel`, and the speed is clamped between a floor and a ceiling.
 *
 * WHAT MAKES IT NOT A RIGID BODY: every fish has its own `speedVar` (the leader's speed it tries to match, so a fast one
 * drifts forward through the cloud and falls back as the spring pulls it in), its own `home` (the place ACROSS the
 * stream it is pulled to, instead of the centreline, so the cloud is a band with an inside), and the leader itself
 * snakes sideways on a slow noise (`wobble*`).
 *
 * ---------------------------------------------------------------------------------------------
 * DEPTH, WHICH IS FIXED
 * ---------------------------------------------------------------------------------------------
 * Every real fish has a depth `d` (0 near, 1 far) that never changes. It is used for exactly two things: the
 * separation distance includes it, so fish at different depths do not push each other and can overlap on the screen
 * without the school thinning out; and the painter dims the far ones. There are no z dynamics -- no spring, no bound --
 * because a z that moves is a z that drifts off into a haze, and nothing here needs it to move.
 *
 * Every length is a LANE fraction (the lane is a fixed 361 m wide, so a lane fraction is the same school on every
 * display) and positions are the water's own metres.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS NOT HERE
 * ---------------------------------------------------------------------------------------------
 * Nothing looks at the player. The school does not chase and does not flee: it is a thing in the level that you go
 * through or around, like a fish string on a spline, only with a body.
 */

/** One real member's state: its school, its velocity in metres per second, and the three numbers that make it itself. */
export interface BoidState {
  school: number;
  vx: number;
  vy: number;
  /** The fraction of the leader's speed this fish tries to match: 1 +/- `speedJitter`. */
  speedVar: number;
  /** Where ACROSS the stream it wants to be, as a signed lane fraction from the leader's line. */
  home: number;
  /** Depth, 0 (near) to 1 (far). Fixed for life. */
  d: number;
}

/** One background fish: a point that follows a place relative to the leader. Nothing else about it is simulated. */
export interface DecorFish {
  x: number;
  y: number;
  /** The place it wants, as lane fractions along and across the leader's heading. */
  along: number;
  across: number;
  /** Where it is BORN, as a metre offset from the leader: a small cloud, like the real fish's. Faded out as it unfolds. */
  bornX: number;
  bornY: number;
  /** Its own phase and the two breathing frequencies (rad/s), so no two move together. */
  phase: number;
  freqA: number;
  freqB: number;
  /** How fast it closes on its place, 1/s: `decor.follow` with its own jitter. */
  follow: number;
  /** Its own tail-animation offset in seconds, so the tails are not in step. */
  clock: number;
}

/** The invisible leader of one school, and the spline it walks. */
export interface School {
  id: number;
  /** The level's own waypoints, by reference: a hundred members on one path still share one spline. */
  points: readonly { x: number; y: number }[];
  seconds: number;
  /** Which of the fish's looks this school shows -- the block's `variety`, so the decor matches the real fish. */
  variety: number;
  /** Seconds since the school was placed. */
  elapsed: number;
  /** The water's height at the moment the school was placed: the path's `y` is measured from here. */
  startY: number;
  /** The leader's position and velocity, in metres and metres per second. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** The way the leader is travelling, as a unit vector: what "along" and "across" are measured against. */
  dirX: number;
  dirY: number;
  /** Set once the leader has reached the end of the spline, where it stops. */
  finished: boolean;
  /** Where the sideways snaking is in its cycle, random per school so two schools never snake together. */
  wobblePhase: number;
  /** How many real fish have been seeded, which is how `seedMember` knows which depth is next. */
  seeded: number;
  /** The background fish. */
  decor: DecorFish[];
  /** The leader's last speed and the time it stopped, so decor fish can keep swimming OUT once the leader parks. */
  exitSpeed: number;
  exitElapsed: number;
}

/**
 * The leader's place at a moment of the spline, in the water's metres. Same coordinates as a pathed creature, plus the
 * snaking: a sideways offset along the spline's own normal, from two sines of unrelated periods so it never repeats
 * visibly, faded in over the first and out over the last of the path so the school is not kinked where it starts or
 * where it leaves.
 */
function leaderAt(
  school: Pick<School, 'points' | 'startY' | 'seconds' | 'wobblePhase'>,
  t: number,
  laneWidth: number,
  screen: number,
): { x: number; y: number } {
  const p = pathPoint(school.points, t);
  let x = p.x * laneWidth;
  let y = school.startY + p.y * screen;
  const cfg = mech.hazards.boids;
  if (cfg.wobbleAmplitude > 0) {
    const eps = 0.01;
    const a = pathPoint(school.points, Math.max(0, t - eps));
    const b = pathPoint(school.points, Math.min(1, t + eps));
    const tx = (b.x - a.x) * laneWidth;
    const ty = (b.y - a.y) * screen;
    const len = Math.hypot(tx, ty);
    if (len > 1e-6) {
      const clock = (t * school.seconds * 2 * Math.PI) / Math.max(0.1, cfg.wobbleSeconds);
      const noise = 0.6 * Math.sin(clock + school.wobblePhase) + 0.4 * Math.sin(clock * 2.7 + school.wobblePhase * 1.9);
      const fade = Math.min(1, t / 0.15, (1 - t) / 0.15);
      const amount = noise * Math.max(0, fade) * cfg.wobbleAmplitude * laneWidth;
      x += (-ty / len) * amount;
      y += (tx / len) * amount;
    }
  }
  return { x, y };
}

/**
 * A new school, with its leader on the first point of the spline and already moving at the speed the spline starts at.
 *
 * Moving from the start matters: a school born with its leader at rest would have its first fish pulled to a stationary
 * point while the leader accelerated away from them, and the school would be strung out behind it for its first seconds.
 *
 * The decor fish are made here too, already standing on their places: a decor fish that had to swim to its place would
 * be seen arriving from the leader's own point, which is a puff of fish out of nothing.
 */
export function createSchool(
  id: number,
  path: { points: readonly { x: number; y: number }[]; seconds: number },
  startY: number,
  laneWidth: number,
  screen: number,
  variety: number,
  decorCount: number,
): School {
  const seconds = Math.max(0.1, path.seconds);
  const school: School = {
    id,
    points: path.points,
    seconds,
    variety,
    elapsed: 0,
    startY,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dirX: -1,
    dirY: 0,
    finished: false,
    wobblePhase: Math.random() * Math.PI * 2,
    seeded: 0,
    decor: [],
    exitSpeed: 0,
    exitElapsed: 0,
  };
  const here = leaderAt(school, 0, laneWidth, screen);
  // The speed the curve starts at, measured over a hundredth of its length: the derivative, without writing one out.
  const eps = 0.01;
  const ahead = leaderAt(school, eps, laneWidth, screen);
  school.x = here.x;
  school.y = here.y;
  school.vx = (ahead.x - here.x) / (eps * seconds);
  school.vy = (ahead.y - here.y) / (eps * seconds);
  setDirection(school);

  const decor = mech.hazards.boids.decor;
  for (let i = 0; i < decorCount; i++) {
    // Born in a cloud round the leader, like the real fish -- NOT on its place in the finished school, which reaches half a
    // lane ahead of the leader and was on the screen before the leader was.
    const bornRadius = mech.hazards.boids.spawnSpread * laneWidth * Math.sqrt(Math.random());
    const bornAngle = Math.random() * Math.PI * 2;
    const fish: DecorFish = {
      x: 0,
      y: 0,
      bornX: Math.cos(bornAngle) * bornRadius,
      bornY: Math.sin(bornAngle) * bornRadius,
      along: (Math.random() - 0.5) * decor.alongSpread,
      across: (Math.random() * 2 - 1) * decor.bandHalfWidth,
      phase: Math.random() * Math.PI * 2,
      freqA: (Math.PI * 2) / (decor.breatheSeconds * (0.7 + Math.random() * 0.6)),
      freqB: (Math.PI * 2) / (decor.breatheSeconds * (0.7 + Math.random() * 0.6)),
      follow: decor.follow * (1 + (Math.random() * 2 - 1) * decor.followJitter),
      clock: Math.random() * 4,
    };
    const at = decorTarget(school, fish, laneWidth);
    fish.x = at.x;
    fish.y = at.y;
    school.decor.push(fish);
  }
  return school;
}

/** Remember which way the leader is going, so a stopped leader keeps the heading it had instead of losing its axis. */
function setDirection(school: School): void {
  const speed = Math.hypot(school.vx, school.vy);
  if (speed > 1e-6) {
    school.dirX = school.vx / speed;
    school.dirY = school.vy / speed;
  }
}

/**
 * Where a new real member is born, and how it is moving: somewhere in the cloud around the leader, at the leader's
 * velocity -- plus its own three numbers.
 *
 * Uniform over the DISC (the square root), not over the radius: a uniform radius piles the fish at the centre, and a
 * school that is born as a dense ball then bursts apart under its own separation.
 *
 * Its DEPTH is its place in the order it is made: the first fish is the farthest and the last the nearest, evenly
 * spread. The painter draws sprites in the order they were created, so "far ones first" is true without a sort -- and
 * evenly spread is what a random depth would only be on average.
 */
export function seedMember(
  school: School,
  laneWidth: number,
  count: number,
): { x: number; y: number; vx: number; vy: number; boid: Omit<BoidState, 'school'> } {
  const cfg = mech.hazards.boids;
  const radius = cfg.spawnSpread * laneWidth * Math.sqrt(Math.random());
  const angle = Math.random() * Math.PI * 2;
  const index = school.seeded++;
  const speedVar = 1 + (Math.random() * 2 - 1) * cfg.speedJitter;
  return {
    x: school.x + Math.cos(angle) * radius,
    y: school.y + Math.sin(angle) * radius,
    vx: school.vx * speedVar,
    vy: school.vy * speedVar,
    boid: {
      vx: school.vx * speedVar,
      vy: school.vy * speedVar,
      speedVar,
      home: (Math.random() * 2 - 1) * cfg.bandHalfWidth,
      d: 1 - (index + 0.5) / Math.max(1, count),
    },
  };
}

/** Walk the leader along the spline. It stops at the end rather than leaving: see `steerSchool` for how the school goes. */
export function advanceLeader(school: School, dt: number, laneWidth: number, screen: number): void {
  if (dt <= 0) return;
  if (school.finished) {
    school.exitElapsed += dt;
    return;
  }
  school.elapsed += dt;
  const t = Math.min(1, school.elapsed / school.seconds);
  const at = leaderAt(school, t, laneWidth, screen);
  // The speed BEFORE this step, kept for the end: the frame the path runs out is usually a frame in which the leader has
  // nowhere left to go, so its velocity from that frame alone is zero and says nothing about how fast it was swimming.
  const priorSpeed = Math.hypot(school.vx, school.vy);
  school.vx = (at.x - school.x) / dt;
  school.vy = (at.y - school.y) / dt;
  school.x = at.x;
  school.y = at.y;
  setDirection(school);
  if (t >= 1) {
    school.finished = true;
    school.exitSpeed = Math.max(priorSpeed, Math.hypot(school.vx, school.vy));
    school.exitElapsed = 0;
    school.vx = 0;
    school.vy = 0;
  }
}

/**
 * Where a decor fish wants to be, in the water's metres.
 *
 * The leader's point (or, once the leader has parked, the point it WOULD be at had it carried on along its last
 * heading at its last speed -- so the background leaves the way it came, rather than bunching up round a stopped point
 * off the edge of the screen), plus the fish's own place along and across the heading, plus two slow breathing
 * oscillations on those offsets.
 */
function decorTarget(school: School, fish: DecorFish, laneWidth: number): { x: number; y: number } {
  const decor = mech.hazards.boids.decor;
  const clock = school.elapsed + school.exitElapsed;
  const carry = school.finished ? school.exitSpeed * school.exitElapsed : 0;
  /**
   * THE UNFOLDING: the school's shape is blended in from a small cloud over `unfoldSeconds`.
   *
   * At 0 every decor fish is at its birth offset from the leader -- inside the cloud the real fish are born in, which is off
   * the screen -- and at 1 it is on its own place in the finished school. Without the blend the front of the school, which
   * reaches half a lane ahead of the leader, was already on the screen when the leader had not yet arrived: fish out of
   * nothing. Smoothstep, so the fan-out starts and ends gently rather than as a burst.
   */
  const raw = decor.unfoldSeconds > 0 ? Math.min(1, clock / decor.unfoldSeconds) : 1;
  const u = raw * raw * (3 - 2 * raw);
  const along = (fish.along + decor.breatheAmplitude * Math.sin(clock * fish.freqA + fish.phase)) * laneWidth * u + carry;
  const across = (fish.across + decor.breatheAmplitude * Math.cos(clock * fish.freqB + fish.phase * 1.7)) * laneWidth * u;
  return {
    x: school.x + school.dirX * along - school.dirY * across + fish.bornX * (1 - u),
    y: school.y + school.dirY * along + school.dirX * across + fish.bornY * (1 - u),
  };
}

/**
 * Move every decor fish toward its place, and retire the ones that have left.
 *
 * A first-order lag rather than a snap: the fish trail the leader through a turn and catch up on the straight, which is
 * what makes a school bend. A fish is retired the way a real one is -- once the leader has parked and it is out past
 * the lane, or once it has sunk out of the vertical band the hazard field itself culls on.
 */
export function advanceDecor(school: School, dt: number, laneWidth: number, view: { min: number; max: number }): void {
  if (school.decor.length === 0 || dt <= 0) return;
  const margin = laneWidth * mech.hazards.boids.decor.exitMargin;
  school.decor = school.decor.filter((fish) => {
    const at = decorTarget(school, fish, laneWidth);
    const k = 1 - Math.exp(-fish.follow * dt);
    fish.x += (at.x - fish.x) * k;
    fish.y += (at.y - fish.y) * k;
    if (fish.y < view.min - 80 || fish.y > view.max + 120) return false;
    if (school.finished && (fish.x < -margin || fish.x > laneWidth + margin)) return false;
    return true;
  });
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
 * O(n^2) over the school -- 14,400 distance tests at 120 fish, which is a fraction of a millisecond and cheaper than the
 * sprites they drive.
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
  // The thickness of the school in the depth direction, in metres: what a depth of 1 is worth in the distance.
  const depthM = cfg.depthRange * laneWidth;
  // The leader's line across its heading, for the fish's own place in the band.
  const perpX = -school.dirY;
  const perpY = school.dirX;

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
      // Separation is the only force that sees depth: two fish a whole depth apart need only be `separationR` apart
      // in THREE dimensions, so on the screen they may lie on top of each other.
      const dz = (b.boid.d - boid.d) * depthM;
      const dist3Sq = distSq + dz * dz;
      if (dist3Sq < separationSq) {
        const dist3 = Math.sqrt(dist3Sq);
        const push = (1 - dist3 / separationR) * sepAccel;
        // Only the on-screen part of the push is used: the depth part has nowhere to go, because depth is fixed.
        const planar = Math.sqrt(distSq);
        if (planar > 1e-6) {
          sepX -= (dx / planar) * push;
          sepY -= (dy / planar) * push;
        } else {
          // Two fish exactly on top of each other have no "away", so one is picked at random rather than dividing by
          // zero and returning NaN into the whole school.
          const angle = Math.random() * Math.PI * 2;
          sepX += Math.cos(angle) * push;
          sepY += Math.sin(angle) * push;
        }
      }
    }

    /**
     * Leader: a spring on the position, a damper on the velocity -- and the spring is TWO springs.
     *
     * The offset from the fish's OWN place in the band is split along the leader's heading and across it, and the
     * across half is pulled harder (`leaderCrossSpring` against `leaderSpring`). That is the whole of the school's
     * SHAPE: a stiff cross spring and a soft along spring make the cloud a stream, long in the direction it is going and
     * narrow across it, where one spring for both makes a round ball. The place in the band is `home`, so the stream has
     * an inside; the damper matches `speedVar` times the leader's speed, so the fish drift through each other along it.
     */
    const offX = school.x + perpX * boid.home * laneWidth - a.x;
    const offY = school.y + perpY * boid.home * laneWidth - a.y;
    const along = offX * school.dirX + offY * school.dirY;
    const acrossX = offX - along * school.dirX;
    const acrossY = offY - along * school.dirY;
    let ax =
      cfg.leaderSpring * along * school.dirX + cfg.leaderCrossSpring * acrossX + cfg.leaderDamp * (school.vx * boid.speedVar - boid.vx);
    let ay =
      cfg.leaderSpring * along * school.dirY + cfg.leaderCrossSpring * acrossY + cfg.leaderDamp * (school.vy * boid.speedVar - boid.vy);
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

    /**
     * Which way it is drawn facing: the way the SCHOOL is going, and not the way this fish happens to be moving this frame.
     *
     * It used to be the fish's own velocity, and a fish born inside the dense cloud is thrown about by separation for the
     * first moments -- enough to send some of them backward for a few frames, which flipped the picture round to face the
     * leader. A fish in a school faces the school's way; `dirX` only changes when the leader itself turns, and then the
     * whole school turns with it.
     */
    if (Math.abs(school.dirX) > 0.05) a.heading = Math.sign(school.dirX);

    /**
     * THE SCHOOL LEAVES BY THE SIDE ONCE THE LEADER HAS STOPPED.
     *
     * The leader parks at the end of the spline, which is outside the lane (every path ends beyond an edge -- see the
     * level files), and the school gathers round it. A fish that is out past the lane by more than it is wide is retired the
     * way a driven-off one is, sideways, which is what the hazard field's own cull already removes: without it the
     * whole school would hang off-screen at the end of its path, alive, until the scroll carried it out of the
     * vertical band -- creatures counted as active and tested for contact the whole time.
     */
    if (school.finished) {
      const margin = laneWidth * a.radiusFraction * 3;
      if (a.x < -margin) a.flee = 'left';
      else if (a.x > laneWidth + margin) a.flee = 'right';
    }
  }
}
