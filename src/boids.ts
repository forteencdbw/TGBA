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
 *   leader       the fish NEAR the leader turn their velocity toward the leader's. Only those: a fish further than
 *                `leaderReach` feels nothing from the leader at all, and follows its neighbours
 *
 * They are ACCELERATIONS, summed and then capped at `maxAccel`, and the speed is clamped between a floor and a ceiling.
 *
 * WHY THE LEADER ONLY REACHES A FEW FISH: the first version pulled every fish toward the leader's position and velocity
 * with a spring, each frame. When the leader turned, all of the fish received the same instruction in the same frame, so
 * the whole school turned at once (measured: head and tail within 0.03 s of each other) and sat in a fixed shape round a
 * point, which is not what a school does. A real school turns because the fish at the front turn and the ones behind
 * them follow what they see -- the turn is passed back, fish to fish, at the speed `alignmentRate` carries it. So the
 * leader steers the few inside its reach, and everything else is the neighbours' business.
 *
 * Far past `leaderReach`, at `leaderTether`, a weak pull toward the leader's position takes over: nothing in a school
 * that only looks at its neighbours keeps a straggler from being left behind for good, and a fish that has been left
 * behind by the length of a lane is not part of the school any more. It is zero everywhere inside `leaderTether`.
 *
 * WHY THE NEIGHBOURS ARE THE NEAREST FEW, AND NOT EVERYONE WITHIN A DISTANCE: a metric radius makes the number of fish a fish
 * listens to depend on how crowded it is. In a dense school every fish hears most of the school, the average it aligns to is
 * nearly the whole school's, and a turn arrives everywhere at about once -- measured: a tail-to-head delay of 0.03 s, with
 * the same rules giving 1.9 s in a thin school. Real flocks listen to a fixed number of nearest neighbours (about seven)
 * wherever they are, so the turn travels at one speed whatever the density. `neighbourRadius` is still there, as the
 * furthest a neighbour can be and still count.
 *
 * WHAT MAKES IT NOT A RIGID BODY: every fish has its own `speedVar` (the leader's speed it tries to match while it is in
 * reach), and the leader itself snakes sideways on a slow noise (`wobble*`).
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

/** One real member's state: its school, its velocity in metres per second, and the two numbers that make it itself. */
export interface BoidState {
  school: number;
  vx: number;
  vy: number;
  /** The fraction of the leader's speed this fish tries to match while it is in reach: 1 +/- `speedJitter`. */
  speedVar: number;
  /** Depth, 0 (near) to 1 (far). Fixed for life. */
  d: number;
}

/**
 * One background fish: it swims with the real fish nearest to it, and keeps its own place relative to them.
 *
 * Not a hazard and not simulated beyond that -- no forces, nothing shoots it. What it follows is the nearest few REAL
 * fish (`decor.neighbours`), not the leader, so a turn reaches the background by the same route it reaches the rest of the
 * school: from the front, fish to fish.
 */
export interface DecorFish {
  x: number;
  y: number;
  /** Its velocity in metres per second: it takes the average of the real fish round it, and keeps it when there are none. */
  vx: number;
  vy: number;
  /** The place it keeps relative to the real fish round it, as lane fractions along and across THEIR heading. */
  along: number;
  across: number;
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
  /**
   * How many real fish were inside the leader's reach on the last step: what the leader waits on.
   *
   * Infinity while there is nobody to wait for (a fresh school, or one with no real fish left), so the leader walks at its own
   * pace then. See `advanceLeader`.
   */
  inReach: number;
  /** How many real fish were AHEAD of the leader (along its heading) on the last step: the other thing it waits on. */
  ahead: number;
  /** How many real fish have been seeded, which is how `seedMember` knows which depth is next. */
  seeded: number;
  /** The background fish. */
  decor: DecorFish[];
  /** Seconds since the leader parked, which keeps the background's clock (its tails, its breathing) running. */
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
    inReach: Number.POSITIVE_INFINITY,
    ahead: 0,
    seeded: 0,
    decor: [],
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
      x: school.x + Math.cos(bornAngle) * bornRadius,
      y: school.y + Math.sin(bornAngle) * bornRadius,
      vx: school.vx,
      vy: school.vy,
      along: (Math.random() - 0.5) * decor.alongSpread,
      across: (Math.random() * 2 - 1) * decor.bandHalfWidth,
      phase: Math.random() * Math.PI * 2,
      freqA: (Math.PI * 2) / (decor.breatheSeconds * (0.7 + Math.random() * 0.6)),
      freqB: (Math.PI * 2) / (decor.breatheSeconds * (0.7 + Math.random() * 0.6)),
      follow: decor.follow * (1 + (Math.random() * 2 - 1) * decor.followJitter),
      clock: Math.random() * 4,
    };
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
 * velocity -- plus its own two numbers.
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
  // The cloud is centred one radius BEHIND the leader, so the leader is at its front edge. A cloud centred on the leader
  // puts half the school ahead of it, and a leader that stays at the front (see `advanceLeader`) would then wait for fish
  // that never come back.
  const behind = cfg.spawnSpread * laneWidth;
  return {
    x: school.x - school.dirX * behind + Math.cos(angle) * radius,
    y: school.y - school.dirY * behind + Math.sin(angle) * radius,
    vx: school.vx * speedVar,
    vy: school.vy * speedVar,
    boid: {
      vx: school.vx * speedVar,
      vy: school.vy * speedVar,
      speedVar,
      d: 1 - (index + 0.5) / Math.max(1, count),
    },
  };
}

/**
 * Walk the leader along the spline. It stops at the end rather than leaving: see `steerSchool` for how the school goes.
 *
 * THE LEADER STAYS AT THE FRONT OF ITS SCHOOL. It only steers the fish inside its reach, so it has to be where it can steer
 * the ones that matter:
 *   - if it walked away from the school it would soon have nobody in reach, and the school would go on in a straight line
 *     on its momentum -- on a bend, straight off the path. So it slows when fewer than `leaderWantFish` real fish are in reach.
 *   - if it fell back into the school, the fish AHEAD of it would be out of its reach and have no neighbours in front to
 *     follow: the front of the school would be the last part to turn, which is backwards. So it slows when more than
 *     `leaderAllowAhead` real fish are ahead of it, and lets the school's front come back to it.
 * Either way the pace drops to at least `leaderWaitFloor` of its own. The path takes as long as the school takes, which is
 * never less than `seconds`.
 */
export function advanceLeader(school: School, dt: number, laneWidth: number, screen: number): void {
  if (dt <= 0) return;
  if (school.finished) {
    school.exitElapsed += dt;
    return;
  }
  const cfg = mech.hazards.boids;
  const reachPace = Math.min(1, school.inReach / Math.max(1, cfg.leaderWantFish));
  const aheadPace = school.ahead <= cfg.leaderAllowAhead ? 1 : cfg.leaderAllowAhead / school.ahead;
  const pace = Math.max(cfg.leaderWaitFloor, Math.min(reachPace, aheadPace));
  school.elapsed += dt * pace;
  const t = Math.min(1, school.elapsed / school.seconds);
  const at = leaderAt(school, t, laneWidth, screen);
  school.vx = (at.x - school.x) / dt;
  school.vy = (at.y - school.y) / dt;
  school.x = at.x;
  school.y = at.y;
  setDirection(school);
  if (t >= 1) {
    school.finished = true;
    school.exitElapsed = 0;
    // The leader parks, but its heading is kept: a school leaves the way it was going, and `dirX` is what the fish and the
    // background are measured against.
    school.vx = 0;
    school.vy = 0;
  }
}

/**
 * Move every background fish, and retire the ones that have left.
 *
 * Each one finds the `decor.neighbours` real fish nearest to it and does two things with them:
 *   - takes their AVERAGE VELOCITY (by `follow`, per second), so it swims where they swim -- and turns when they turn,
 *     which is after the front of the school has, not at the moment the leader does;
 *   - keeps its own place relative to their average position, along and across the way they are going.
 * Moving at their velocity and correcting toward the place, rather than only chasing the place, is what keeps it from
 * trailing behind by the speed over `follow`: a fish that only chases always lags.
 *
 * THE UNFOLDING: the place is blended in over `unfoldSeconds`. At 0 the fish is simply among the real ones -- inside the
 * cloud the school is born in, which is off the screen -- and at 1 it is on its own place round them, half a lane ahead
 * and behind. Without the blend the front of the school was on the screen before the leader had arrived: fish out of nothing.
 * Smoothstep, so the fan-out starts and ends gently rather than as a burst.
 *
 * With no real fish left (all shot, or all gone) a background fish keeps the velocity it had. It is retired the way a real one
 * is: once the leader has parked and it is out past the lane, or once it has sunk out of the vertical band the hazard field
 * itself culls on.
 *
 * Cost: each background fish looks at every real fish once -- 160 x 120 = 19,200 distance tests for a school of the debug
 * level, a fraction of a millisecond.
 */
export function advanceDecor(
  school: School,
  members: readonly Hazard[],
  dt: number,
  laneWidth: number,
  view: { min: number; max: number },
): void {
  if (school.decor.length === 0 || dt <= 0) return;
  const cfg = mech.hazards.boids.decor;
  const margin = laneWidth * cfg.exitMargin;
  const want = Math.max(1, Math.round(cfg.neighbours));
  const clock = school.elapsed + school.exitElapsed;
  const raw = cfg.unfoldSeconds > 0 ? Math.min(1, clock / cfg.unfoldSeconds) : 1;
  const unfold = raw * raw * (3 - 2 * raw);
  // The nearest few, kept as parallel small arrays so a frame allocates nothing.
  const nearD = new Array<number>(want);
  const nearI = new Array<number>(want);
  school.decor = school.decor.filter((fish) => {
    let found = 0;
    for (let i = 0; i < members.length; i++) {
      const m = members[i]!;
      const d = (m.x - fish.x) ** 2 + (m.y - fish.y) ** 2;
      if (found < want) {
        let at = found++;
        while (at > 0 && nearD[at - 1]! > d) {
          nearD[at] = nearD[at - 1]!;
          nearI[at] = nearI[at - 1]!;
          at--;
        }
        nearD[at] = d;
        nearI[at] = i;
      } else if (d < nearD[want - 1]!) {
        let at = want - 1;
        while (at > 0 && nearD[at - 1]! > d) {
          nearD[at] = nearD[at - 1]!;
          nearI[at] = nearI[at - 1]!;
          at--;
        }
        nearD[at] = d;
        nearI[at] = i;
      }
    }
    if (found > 0) {
      let px = 0;
      let py = 0;
      let vx = 0;
      let vy = 0;
      for (let k = 0; k < found; k++) {
        const m = members[nearI[k]!]!;
        px += m.x;
        py += m.y;
        vx += m.boid!.vx;
        vy += m.boid!.vy;
      }
      px /= found;
      py /= found;
      vx /= found;
      vy /= found;
      const speed = Math.hypot(vx, vy);
      const dx = speed > 1e-6 ? vx / speed : school.dirX;
      const dy = speed > 1e-6 ? vy / speed : school.dirY;
      const along = (fish.along + cfg.breatheAmplitude * Math.sin(clock * fish.freqA + fish.phase)) * laneWidth * unfold;
      const across = (fish.across + cfg.breatheAmplitude * Math.cos(clock * fish.freqB + fish.phase * 1.7)) * laneWidth * unfold;
      const k = 1 - Math.exp(-fish.follow * dt);
      fish.vx += (vx - fish.vx) * k;
      fish.vy += (vy - fish.vy) * k;
      const tx = px + dx * along - dy * across;
      const ty = py + dy * along + dx * across;
      fish.x += fish.vx * dt + (tx - fish.x) * k;
      fish.y += fish.vy * dt + (ty - fish.y) * k;
    } else {
      fish.x += fish.vx * dt;
      fish.y += fish.vy * dt;
    }
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
  // Alignment and cohesion look at the K NEAREST fish, not at every fish within a distance -- see the header's note on why.
  const want = Math.max(1, Math.round(cfg.neighbours));
  const nearD = new Float64Array(want);
  const nearB = new Array<Hazard>(want);
  const separationR = cfg.separationRadius * laneWidth;
  const separationSq = separationR * separationR;
  const maxSpeed = cfg.maxSpeed * laneWidth;
  const minSpeed = cfg.minSpeed * laneWidth;
  const maxAccel = cfg.maxAccel * laneWidth;
  const sepAccel = cfg.separationAccel * laneWidth;
  const cohAccel = cfg.cohesionAccel * laneWidth;
  // The thickness of the school in the depth direction, in metres: what a depth of 1 is worth in the distance.
  const depthM = cfg.depthRange * laneWidth;
  const reach = cfg.leaderReach * laneWidth;
  const tether = cfg.leaderTether * laneWidth;
  const tetherAccel = cfg.tetherAccel * laneWidth;

  let inReach = 0;
  let ahead = 0;
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
      // Keep the `want` nearest, in order: an insertion into a tiny sorted list, which allocates nothing.
      if (seen < want || distSq < nearD[want - 1]!) {
        let at = seen < want ? seen++ : want - 1;
        while (at > 0 && nearD[at - 1]! > distSq) {
          nearD[at] = nearD[at - 1]!;
          nearB[at] = nearB[at - 1]!;
          at--;
        }
        nearD[at] = distSq;
        nearB[at] = b;
      }
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
     * The leader reaches only the fish near it, and only turns their VELOCITY.
     *
     * Inside `leaderReach` the fish is steered toward `speedVar` times the leader's velocity, by `leaderSteer` per second and
     * fading linearly to nothing at the edge of the reach -- so there is no position in it, nothing to pull back to, and no
     * edge where a fish is suddenly grabbed. Outside it the leader is not consulted at all: that fish turns because the
     * fish it can see have turned. See the header of this file for why.
     *
     * Past `leaderTether` there is a weak pull toward the leader's position, growing with how far past it the fish is and
     * capped at `tetherAccel`. It is the only position term, it is zero for any fish still in the school, and it exists so
     * that a straggler cannot be lost for good.
     */
    let ax = 0;
    let ay = 0;
    const toLeaderX = school.x - a.x;
    const toLeaderY = school.y - a.y;
    const leaderDist = Math.hypot(toLeaderX, toLeaderY);
    if (toLeaderX * school.dirX + toLeaderY * school.dirY < 0) ahead++;
    if (leaderDist < reach) {
      inReach++;
      const weight = (1 - leaderDist / reach) * cfg.leaderSteer;
      ax += weight * (school.vx * boid.speedVar - boid.vx);
      ay += weight * (school.vy * boid.speedVar - boid.vy);
    }
    if (leaderDist > tether) {
      const pull = Math.min(1, (leaderDist - tether) / Math.max(1e-6, tether)) * tetherAccel;
      ax += (toLeaderX / leaderDist) * pull;
      ay += (toLeaderY / leaderDist) * pull;
    }
    ax += sepX;
    ay += sepY;
    for (let k = 0; k < seen; k++) {
      const n = nearB[k]!;
      avgVx += n.boid!.vx;
      avgVy += n.boid!.vy;
      centreX += n.x;
      centreY += n.y;
    }
    if (seen > 0) {
      // Alignment: toward the neighbours' average velocity.
      ax += cfg.alignmentRate * (avgVx / seen - boid.vx);
      ay += cfg.alignmentRate * (avgVy / seen - boid.vy);
      // Cohesion: toward their centroid, at full strength once it is a neighbour-radius away and fading to nothing on top
      // of it. A force that grew with distance without bound would pull a straggler across the screen in one frame.
      let toX = centreX / seen - a.x;
      let toY = centreY / seen - a.y;
      /**
       * Cohesion pulls harder ACROSS the way the neighbours are going than ALONG it (`cohesionAcrossRatio`).
       *
       * That is what makes a school a stream rather than a ball, and it does it with the neighbours alone -- the way they
       * are going is their average velocity, so there is no leader and no fixed point in it. The first version made the stream
       * with springs to the leader, and a spring to a point is what made the whole school turn in one frame.
       */
      const speed = Math.hypot(avgVx, avgVy);
      if (cfg.cohesionAcrossRatio !== 1 && speed > 1e-6) {
        const hx = avgVx / speed;
        const hy = avgVy / speed;
        const along = toX * hx + toY * hy;
        const acrossX = toX - along * hx;
        const acrossY = toY - along * hy;
        toX = along * hx + acrossX * cfg.cohesionAcrossRatio;
        toY = along * hy + acrossY * cfg.cohesionAcrossRatio;
      }
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
     * Which way it is drawn facing: the way its NEIGHBOURS are going, and not the way this fish happens to be moving this
     * frame.
     *
     * Its own velocity was the first answer, and a fish born inside the dense cloud is thrown about by separation for the
     * first moments -- enough to send some of them backward for a few frames, which flipped the picture round to face the
     * leader. Then it was the leader's heading, which is steady but is also the one thing in the school that turns in the
     * same frame for everybody. The average of the fish round it is both: steady (separation pushes cancel in an
     * average) and passed back through the school, so a fish turns round after the ones in front of it have.
     */
    const looking = seen > 0 ? avgVx / seen : boid.vx;
    if (Math.abs(looking) > 0.05 * laneWidth) a.heading = Math.sign(looking);

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
  school.inReach = inReach;
  school.ahead = ahead;
}
