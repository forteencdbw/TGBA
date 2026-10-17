import { EntityField } from './entities';
import { seedMember } from './boids';
import { HazardField, KIND_TUNING, ventX, type Hazard, type HazardKind, type SpawnOptions } from './hazards';
import { isObstacleKind, ObstacleField } from './obstacles';
import { mech } from './mechanisms';
import { LEVEL, type LevelEntry, type ResolvedSide } from './levels';

/**
 * Where one timeline entry ended up.
 *
 * Exists because "enemies spawn in the middle of the screen" cannot be checked from a screenshot and is a single
 * comparison between two numbers, so every placement is recorded whether or not anyone is looking. `from` is the edge
 * it arrived from, which is what proves a block's `from` reached the game rather than being lost between the file and
 * the water.
 */
export interface SpawnRecord {
  kind: string;
  from: ResolvedSide;
  /** Where it actually spawned, which for a side or bottom entry is deliberately OFF the screen. */
  x: number;
  worldY: number;
  visibleTop: number;
  visibleBottom: number;
}

/**
 * The water as this rule sees it: what to place things in, and the one fact about the player that decides how big a
 * placed collectable is.
 *
 * This is the whole of what `placeEntry` needs from the game -- deliberately, because the rule used to be a method on
 * the class that owns the canvas, and a rule that can only run inside that class is a rule no probe can drive.
 */
export interface PlacedWorld {
  /** Collectables. A placed bubble is built by the field, because the field owns their motion. */
  field: EntityField;
  obstacles: ObstacleField;
  hazards: HazardField;
  /** The bubble's own radius fraction, from the stage: a placed collectable is sized as the player's would be. */
  playerRadiusFraction: number;
}

/**
 * Place one timeline entry, and say where it went.
 *
 * The timeline is the level, so this is where a level's content becomes live objects. Entries appear at the TOP of the
 * visible range and travel down with the scroll, rather than materialising at the player's distance.
 *
 * ---------------------------------------------------------------------------------------------
 * WHERE IT ARRIVES FROM, which decides the spawn position before anything else
 * ---------------------------------------------------------------------------------------------
 * `top` -- the classic case -- is placed at the top of the view and the current carries it down, so `worldY` is the
 * whole story.
 *
 * The other three need a position that is deliberately OFF the screen, because a creature that appears inside the view
 * has spawned rather than swum in. So: sides are placed outside the lane at a chosen screen height, and `bottom` is
 * placed below the view (and moves up -- see `advance` in `src/hazards.ts`). The visible range is passed IN rather than
 * computed here, because the caller is the only thing that knows the entry moment.
 *
 * Collectables go into the shared field; hazards are owned by the game, so the field hands them over rather
 * than building them.
 */
export function placeEntry(
  entry: LevelEntry,
  worldY: number,
  view: { min: number; max: number },
  laneWidth: number,
  world: PlacedWorld,
  /**
   * Whether this BLOCK is mirrored this time.
   *
   * Rolled once per authored block by `Run`, and shared by every entry the block expanded to -- that is what keeps a
   * barrier's gap and a school's path in one piece. `false` is the deterministic default, so probes that call this
   * directly keep the authored orientation.
   */
  flip = false,
): SpawnRecord {
  /**
   * THE MIRROR, in one place.
   *
   * `flip` is the whole of the "direction is random" feature: it swaps a random side, mirrors every x about the lane,
   * and mirrors the spline's x. Explicit `left`/`right` sides are NOT swapped -- the file said where, so the file
   * wins -- but their landing x still mirrors, because `x` is a coordinate rather than a side.
   */
  const authoredFrom = entry.from ?? 'top';
  const side: ResolvedSide = authoredFrom === 'random' ? (flip ? 'right' : 'left') : authoredFrom;
  const mirrored = (fraction: number): number => (flip ? 1 - fraction : fraction);
  let spawnX = mirrored(entry.x) * laneWidth;
  /**
   * A TOP entry may be handed a spot above the view, so whatever it reaches downward enters first.
   *
   * Only the `top` side uses this; the side and bottom branches below overwrite `spawnY` with their own edge, and
   * the loader refuses `aboveMeters` on those entries rather than letting it do nothing.
   */
  let spawnY = worldY + (entry.aboveMeters ?? 0);
  if (side === 'left' || side === 'right') {
    const off = laneWidth * mech.spawning.offscreenMarginRatio;
    spawnX = side === 'left' ? -off : laneWidth + off;
    spawnY = view.min + (entry.depth ?? mech.spawning.entryDepth) * (view.max - view.min);
  } else if (side === 'bottom') {
    spawnY = view.min - laneWidth * mech.spawning.bottomMarginRatio;
  }
  /**
   * A VENT'S position comes from the wall it named, never from `entry.x`.
   *
   * This is the one place the "vents are on a wall" rule is enforced in space, and it is applied AFTER the entry
   * block above so that nothing a level writes about arrival can move it into the middle. The loader refuses a vent
   * with `from`, so by the time this runs the derivation is the only thing that could have decided the position.
   * An omitted or `'random'` side uses this block's coin; an explicit one keeps its wall.
   */
  const authoredVentSide = entry.kind === 'vent' ? entry.side : undefined;
  const ventSide =
    entry.kind === 'vent'
      ? authoredVentSide === 'random' || authoredVentSide === undefined
        ? flip
          ? 'right'
          : 'left'
        : authoredVentSide
      : null;
  if (ventSide) spawnX = ventX(ventSide, laneWidth);
  const entering = side === 'top' ? null : { from: side, speed: entry.enterSpeed ?? mech.spawning.enterSpeedMps };

  const record: SpawnRecord = {
    kind: entry.kind,
    from: side,
    x: +spawnX.toFixed(1),
    worldY: +spawnY.toFixed(1),
    visibleTop: +view.max.toFixed(1),
    visibleBottom: +view.min.toFixed(1),
  };

  if (entry.kind === 'bubble') {
    // The field insets a collectable by its own radius; mirroring the FRACTION keeps that inset from the far edge.
    world.field.bubbles.push(
      world.field.bubbleFromEntry({ ...entry, x: mirrored(entry.x), at: spawnY }, laneWidth, world.playerRadiusFraction),
    );
    return record;
  }
  /**
   * Anything in the obstacle list IS an obstacle, asked of the list rather than enumerated.
   *
   * The two-kind version of this was kind === 'crate' || kind === 'coral', which is the kind of check that fails
   * quietly: a new obstacle kind would fall through to makeHazard and become a creature with an obstacle's name,
   * which would place, move and collide as a hazard while looking like scenery. Asking OBSTACLE_KINDS means the
   * fall-through cannot happen, because there is nothing left for it to fall through to.
   */
  if (isObstacleKind(entry.kind)) {
    // Scenery only ever drifts in from a side; the loader refuses a `bottom` obstacle, so `entering` here is
    // either null or a horizontal drift whose target is the entry's authored x.
    world.obstacles.spawn(
      entry.kind,
      spawnX,
      spawnY,
      side === 'left' || side === 'right'
        ? { speed: entry.enterSpeed ?? mech.spawning.enterSpeedMps, targetX: mirrored(entry.x) * laneWidth }
        : undefined,
    );
    return record;
  }
  // Everything left is a creature: the collectables and the scenery have all returned above.
  /**
   * A creature on a path carries the spline, anchored at where it spawned.
   *
   * The waypoints are RELATIVE to the spawn point (`x` a lane fraction, `y` a screen fraction, positive upward), so one
   * authored weave can be placed anywhere in the level without being re-authored -- and the same path works at any
   * scroll speed, because the world keeps moving underneath it.
   *
   * The member's place in the string is a DELAY, not an offset along the curve: `elapsed` starts negative by its turn,
   * so it waits at the head of the curve -- which is off-screen, where a queue belongs -- and then swims the whole
   * line. Seeding it part-way along instead meant most of a string simply appeared in the middle of its own path.
   */
  const pathSpec = entry.path ? LEVEL.paths?.[entry.path] : undefined;
  /**
   * The spline is authored as an ABSOLUTE lane fraction, not relative to the spawn, so its mirror is `1 - x` on every
   * waypoint. `y` is a screen fraction and is untouched: the mirror is horizontal.
   */
  const mirroredPath = pathSpec
    ? {
        seconds: pathSpec.seconds,
        points: flip ? pathSpec.points.map((point) => ({ x: 1 - point.x, y: point.y })) : pathSpec.points,
      }
    : undefined;
  /**
   * A BOIDS fish does not carry the spline; its school's invisible leader does.
   *
   * The first member to be placed makes the school (`joinSchool`) and the rest find it by the block's number, so the whole
   * block shares one leader that is stepped once a frame. The fish is born in a cloud round the leader, at the leader's
   * velocity, and has no `path` of its own: that is what keeps `advanceKind` from walking it along the curve as well.
   */
  if (entry.school !== undefined && mirroredPath && entry.layer === 'back') {
    /**
     * A BACKGROUND school's fish are not hazards: they go to the back-school field, which has no hitbox and nothing that reads it.
     * Placed by the same loop and the same birth rules as a foreground school (a cloud behind an invisible leader, facing the
     * way it is going), so the two layers cannot drift apart in how they begin.
     */
    const fish = world.hazards.back.place(
      entry.school,
      mirroredPath,
      spawnY,
      laneWidth,
      view.max - view.min,
      entry.variety ?? 0,
      entry.distance ?? 0,
      entry.schoolSize ?? 1,
      KIND_TUNING.fish.radius,
    );
    return { ...record, x: +fish.x.toFixed(1), worldY: +fish.y.toFixed(1) };
  }
  if (entry.school !== undefined && mirroredPath) {
    const school = world.hazards.joinSchool(entry.school, mirroredPath, spawnY, laneWidth, view.max - view.min);
    const seed = seedMember(school, laneWidth, entry.schoolSize ?? 1);
    // Facing the school's way from the first frame: a fish placed with no heading is drawn facing left (the picture as it was
    // drawn), which is the wrong way for a school going right and would turn round on its first step.
    const facing = Math.abs(school.dirX) > 0.05 ? Math.sign(school.dirX) : 0;
    const hazard = world.hazards.spawnAt(entry.kind as HazardKind, seed.x, seed.y, {
      boid: { school: entry.school, ...seed.boid },
      scale: mech.hazards.boids.scale,
      ...(entry.aboveMeters !== undefined ? { aboveMeters: entry.aboveMeters } : {}),
      ...(entry.variety !== undefined ? { variety: entry.variety } : {}),
    });
    hazard.heading = facing;
    world.hazards.hazards.push(hazard);
    return { ...record, x: +seed.x.toFixed(1), worldY: +seed.y.toFixed(1) };
  }
  const path: Hazard['path'] = mirroredPath
    ? {
        points: mirroredPath.points,
        seconds: mirroredPath.seconds,
        // NEGATIVE while it waits its turn at the head of the curve. `pathPoint` is clamped at 0 there, so a member
        // that has not set off yet simply sits at the start -- off-screen, which is the only place a queue can wait.
        elapsed: -(entry.pathDelaySeconds ?? 0),
        startX: spawnX,
        startY: spawnY,
      }
    : null;
  const opts: SpawnOptions = {};
  if (entering) opts.entry = entering;
  if (path) opts.path = path;
  if (entry.aboveMeters !== undefined) opts.aboveMeters = entry.aboveMeters;
  // The block's look, carried to the creature that has to draw it. Undefined for anything that is not a hazard.
  if (entry.variety !== undefined) opts.variety = entry.variety;
  // A vent's geometry, carried the same way: the wall decides the plume's direction as well as its position.
  if (ventSide) {
    opts.side = ventSide;
    if (entry.aim !== undefined) opts.aim = entry.aim;
    if (entry.startDelaySeconds !== undefined) opts.startDelaySeconds = entry.startDelaySeconds;
  }
  /**
   * Clamped into the lane ONLY when it is not arriving.
   *
   * A side entry is placed outside the lane on purpose, so clamping it would put it exactly on the edge -- the one
   * place the player would see it appear. The entry motion is what brings it inside.
   */
  const placedX = entering ? spawnX : Math.max(0, Math.min(laneWidth, spawnX));
  world.hazards.hazards.push(world.hazards.spawnAt(entry.kind as HazardKind, placedX, spawnY, opts));
  return record;
}
