import { EntityField } from './entities';
import { HazardField, type Hazard, type HazardKind, type SpawnOptions } from './hazards';
import { isObstacleKind, ObstacleField } from './obstacles';
import { mech } from './mechanisms';
import { LEVEL, PICKUP_KINDS, type EntrySide, type LevelEntry, type PickupKind } from './levels';
import type { SkillId } from './skills';

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
  from: EntrySide;
  /** Where it actually spawned, which for a side or bottom entry is deliberately OFF the screen. */
  x: number;
  worldY: number;
  visibleTop: number;
  visibleBottom: number;
}

/**
 * A skill lying in the water, waiting to be taken.
 *
 * The skill is rolled when it is COLLECTED, not when it is created -- see `placeEntry` -- so `id` starts null.
 */
export interface PickupDrop {
  kind: PickupKind;
  id: SkillId | null;
  x: number;
  y: number;
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
  /** Skills in the water, appended rather than assigned. */
  pickupDrops: PickupDrop[];
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
 * Collectables go into the shared field; hazards and skills are owned by the game, so the field hands them over rather
 * than building them.
 */
export function placeEntry(
  entry: LevelEntry,
  worldY: number,
  view: { min: number; max: number },
  laneWidth: number,
  world: PlacedWorld,
): SpawnRecord {
  const side = entry.from ?? 'top';
  let spawnX = entry.x * laneWidth;
  let spawnY = worldY;
  if (side === 'left' || side === 'right') {
    const off = laneWidth * mech.spawning.offscreenMarginRatio;
    spawnX = side === 'left' ? -off : laneWidth + off;
    spawnY = view.min + (entry.depth ?? mech.spawning.entryDepth) * (view.max - view.min);
  } else if (side === 'bottom') {
    spawnY = view.min - laneWidth * mech.spawning.bottomMarginRatio;
  }
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
    world.field.bubbles.push(world.field.bubbleFromEntry({ ...entry, at: spawnY }, laneWidth, world.playerRadiusFraction));
    return record;
  }
  if ((PICKUP_KINDS as readonly string[]).includes(entry.kind)) {
    // APPENDED, not assigned: a level may place several, and one silently replacing another is how a pickup came to
    // vanish on the player (see `pickupDrops`).
    // A pickup sits where the level put it and drifts down with the water, waiting to be taken.
    world.pickupDrops.push({
      kind: entry.kind as PickupKind,
      x: spawnX,
      y: spawnY,
      // The skill is rolled when it is COLLECTED, not when it is created: granting it here would
      // decide the player's next twenty seconds before they had even seen the pickup.
      id: null,
    });
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
      side === 'left' || side === 'right' ? { speed: entry.enterSpeed ?? mech.spawning.enterSpeedMps, targetX: entry.x * laneWidth } : undefined,
    );
    return record;
  }
  // Everything left is a creature: the pickups, the collectables and the scenery have all returned above.
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
  const path: Hazard['path'] = pathSpec
    ? {
        points: pathSpec.points,
        seconds: pathSpec.seconds,
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
  // The block's look, carried to the creature that has to draw it. Undefined for anything that is not a hazard.
  if (entry.variety !== undefined) opts.variety = entry.variety;
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
