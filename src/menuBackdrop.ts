import { Container, Graphics } from 'pixi.js';
import { mech } from './config';
import { HazardField, paintHazards, type Hazard, type HazardKind } from './hazards';
import { ObstacleField, paintObstacles } from './obstacles';

/**
 * The animated backdrop behind the main menu: creatures swimming past, and a coral bed in two layers.
 *
 * ---------------------------------------------------------------------------------------------
 * IT IS THE MENU'S OWN WORLD, AND THE GAME'S OWN PICTURES
 * ---------------------------------------------------------------------------------------------
 * The fields here belong to the menu -- the run's `HazardField` is untouched, and nothing about a decorative fish can
 * reach the water a run will start in. What IS shared is the drawing: `paintHazards` and `paintObstacles` take a field
 * and a lane width and nothing else, so the shark drifting past the title is the same art, the same animation and the
 * same painter as the shark that will later charge at the player.
 *
 * Which is the point. A hand-rolled menu fish would be a second implementation of "what a creature looks like", and it
 * would drift away from the first one the day either changed.
 *
 * ---------------------------------------------------------------------------------------------
 * THE LAYERS, AND WHY THERE ARE THREE
 * ---------------------------------------------------------------------------------------------
 *   back coral    -- far, small: the reef the water sits on
 *   the swimmers
 *   front coral   -- near, larger, lower: a fish that passes behind it is a fish at depth
 *
 * The two beds are separate fields rather than one drawn twice, because their corals are different SIZES and a coral's
 * size is a property of the coral.
 *
 * ---------------------------------------------------------------------------------------------
 * THE Y AXIS IS INVERTED HERE, ON PURPOSE
 * ---------------------------------------------------------------------------------------------
 * The painters measure y in metres UP from the seabed, which is the world's convention everywhere else in the project.
 * The container is flipped and moved to the bottom edge so that convention holds unchanged -- a decorative creature at
 * y = 100 is 100 pixels above the bottom of the screen -- rather than making the painters learn a second one.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE ARE NO `vx` FIELDS TO REUSE
 * ---------------------------------------------------------------------------------------------
 * A hazard has no velocity: in the water, a creature's motion is computed per frame from the run's context by its own
 * step function, and `HazardField.update` is what drives it. None of that is running here, so the speed of each
 * swimmer is kept in a map beside it rather than invented as a field on `Hazard` -- the painters do not read a
 * velocity, and a field only this module understands would be one more thing a future reader has to find out about.
 */

/**
 * What may swim in the backdrop: everything that is ALIVE and is an ordinary enemy.
 *
 * Three exclusions, each for its own reason. BOSSES, because a boss arriving is a beat the game spends a whole level
 * building up to, and a giant crab drifting past the title screen spends it for nothing. The ENVIRONMENT -- vents,
 * grit, foam, rain -- because those are terrain and weather rather than enemies. And `trash`/`rot`/`oil`, which are
 * hazards the player eats or avoids rather than things that swim.
 */
const SWIMMERS: readonly HazardKind[] = [
  'fish',
  'tuna',
  'jelly',
  'crab',
  'urchin',
  'bombfish',
  'eel',
  'angler',
  'torpedo',
  'zapper',
  'shrimp',
  'dolphin',
  'octopus',
  'shark',
  'whale',
  'archer',
  'pistol',
  'puffer',
  'starfish',
];

export class MenuBackdrop {
  readonly root = new Container();
  /**
   * Three containers rather than three bare Graphics, because a sprite lands in its painter's PARENT.
   *
   * `paintHazards` inserts each creature's sprite into `g.parent` at `g`'s index, so the Graphics' parent is what the
   * sprites actually live in -- and that is what has to be depth-ordered and faded. Alpha on the bare Graphics would
   * have applied to nothing.
   */
  private readonly backLayer = new Container();
  private readonly swimLayer = new Container();
  private readonly frontLayer = new Container();
  private readonly backGfx = new Graphics();
  private readonly swimGfx = new Graphics();
  private readonly frontGfx = new Graphics();
  private readonly swimmers = new HazardField();
  private readonly backBed = new ObstacleField();
  private readonly frontBed = new ObstacleField();
  /** Speed per swimmer, keyed by hazard id. See the note at the top of the file. */
  private readonly velocity = new Map<number, { vx: number; vy: number }>();

  private width = 0;
  private height = 0;
  private elapsed = 0;
  private sinceSpawn = 0;
  /** Seconds left of the exit; negative once it has finished, which is what `finished` reads. */
  private exitLeft = 0;
  private fade = 1;

  constructor() {
    // Display order IS depth order, and `paintHazards` inserts its sprites into this container at the swim layer's
    // index -- so they land between the two beds without anything having to be re-sorted.
    this.backLayer.addChild(this.backGfx);
    this.swimLayer.addChild(this.swimGfx);
    this.frontLayer.addChild(this.frontGfx);
    this.root.addChild(this.backLayer, this.swimLayer, this.frontLayer);
    this.root.scale.set(1, -1);
  }

  /**
   * Rebuild for a new screen size.
   *
   * The corals are laid out once per size rather than per frame: they do not move, so where they are is a property of
   * the window. The lane the painters are handed is the full screen WIDTH, which is what makes every length in the
   * config a fraction of the screen and the backdrop keep its proportions when the window changes.
   */
  layout(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.root.position.set(0, height);
    const cfg = mech.menu.backdrop;
    this.bed(this.backBed, cfg.backCoralCount, cfg.backCoralHalfWidth, cfg.backCoralBottom);
    this.bed(this.frontBed, cfg.frontCoralCount, cfg.frontCoralHalfWidth, cfg.frontCoralBottom);
  }

  /** One row of corals, evenly spaced with a little jitter so it does not read as a fence. */
  private bed(field: ObstacleField, count: number, halfWidth: number, bottom: number): void {
    field.obstacles.length = 0;
    const n = Math.max(0, Math.round(count));
    for (let i = 0; i < n; i++) {
      const slot = this.width / Math.max(1, n);
      const x = (i + 0.5) * slot + (Math.random() - 0.5) * slot * 0.6;
      const y = bottom * this.height + (Math.random() - 0.5) * this.height * 0.03;
      /**
       * `radiusFraction` is set to the half-width directly, and the coral's own art scale is left alone.
       *
       * Nothing collides with these, so the only job that number has here is deciding how big the picture is -- and
       * the per-variant scale (1.07 to 1.46) then spreads a row of one number into a reef of several sizes. That is
       * the same variety a level gets for free from its own spacing.
       */
      const o = field.spawn('coral', x, y);
      o.radiusFraction = halfWidth;
      // The beds never take damage, and a flash would be a lie about a menu.
      o.healthFraction = 1;
    }
  }

  /** Whether the exit has finished and the menu may hand over to the run. */
  get finished(): boolean {
    return this.exitLeft < 0;
  }

  /** Whether it is on its way out. The menu uses it to refuse a second start. */
  get exiting(): boolean {
    return this.exitLeft !== 0;
  }

  /**
   * Start the exit: nothing new arrives, everything turns for the nearest edge, and a countdown runs.
   *
   * THE COUNTDOWN IS THE POINT. Waiting for the last creature to actually leave would mean waiting for whichever one
   * arrived most recently, and a slow fish that entered at the far edge is five or ten seconds of nothing. So the turn
   * is real and the wait is capped: whoever has gone has gone, and the rest stop being drawn when the clock runs out.
   * The layer fades over the same window, so the handover is a fade rather than a cut.
   */
  beginExit(): void {
    if (this.exiting) return;
    this.exitLeft = Math.max(0.01, mech.menu.backdrop.exitSeconds);
    for (const h of this.swimmers.hazards) {
      const speed = Math.abs(this.velocity.get(h.id)?.vx ?? 0.1) || 0.1;
      const dir = h.x < this.width / 2 ? 1 : -1;
      this.velocity.set(h.id, { vx: speed * dir, vy: 0 });
      this.faceTravel(h, dir);
    }
  }

  /** Put the backdrop back the way it starts: nothing swimming, the beds where they are. */
  reset(): void {
    this.swimmers.hazards.length = 0;
    this.velocity.clear();
    this.exitLeft = 0;
    this.fade = 1;
    this.sinceSpawn = 0;
    this.root.alpha = 1;
    this.root.visible = true;
  }

  update(dt: number): void {
    const cfg = mech.menu.backdrop;
    this.elapsed += dt;
    // Nothing is painted or moved until the first layout, because the lane is the screen width.
    if (!this.width || !this.height) return;

    if (this.exitLeft > 0) {
      this.exitLeft -= dt;
      this.fade = Math.max(0, this.fade - dt / Math.max(0.01, cfg.fadeSeconds));
    }
    this.root.alpha = this.fade;
    // The creatures' own brightness, separate from the exit fade: a backdrop should not compete with the title.
    this.swimLayer.alpha = cfg.creatureAlpha;

    this.sinceSpawn += dt;
    /**
     * Two thresholds, and they do different jobs.
     *
     * `maxAlive` is the ceiling and the gap is the pace: the backdrop fills up one arrival at a time rather than in a
     * burst. `minAlive` is the floor a menu should never be seen below, so it skips the wait -- which is also what
     * fills the screen in the first second after `layout`, instead of leaving the title over an empty sea.
     */
    const short = this.swimmers.hazards.length < cfg.minAlive;
    if (!this.exiting && this.swimmers.hazards.length < cfg.maxAlive && (short || this.sinceSpawn >= cfg.spawnGapSeconds)) {
      this.sinceSpawn = 0;
      this.spawnWave();
    }

    const margin = this.width * 0.15;
    for (let i = this.swimmers.hazards.length - 1; i >= 0; i--) {
      const h = this.swimmers.hazards[i]!;
      const v = this.velocity.get(h.id);
      if (!v) {
        this.swimmers.hazards.splice(i, 1);
        continue;
      }
      h.x += v.vx * dt * this.width;
      h.y += v.vy * dt * this.height;
      /**
       * THE ANIMATION CLOCK, and it is `phase`.
       *
       * In the water this is advanced by `HazardField.advanceKind` -- one line, for every kind -- and it is what
       * `hazardArtPose` hands the animation as its elapsed time. Nothing here runs the field's update, so without this
       * every decorative fish holds frame one for its whole crossing: a backdrop of statues.
       */
      h.phase += dt;
      // `heading` is the creature's own fact about which way it is going, and the painter reads it for anything that
      // does not look at a player -- so it has to follow the travel, not the exit direction.
      h.heading = v.vx >= 0 ? 1 : -1;
      if (h.x < -margin || h.x > this.width + margin || h.y < -this.height * 0.25 || h.y > this.height * 1.25) {
        this.velocity.delete(h.id);
        this.swimmers.hazards.splice(i, 1);
      }
    }

    this.backGfx.clear();
    this.swimGfx.clear();
    this.frontGfx.clear();
    paintObstacles(this.backGfx, this.backBed, this.width);
    /**
     * `playerX` is `NaN`, which is what the codex passes and means "nobody is in the room".
     *
     * The painter's facing logic is skipped in that case only for creatures that do not watch a player; the rest would
     * all turn the same way. The mirror is therefore decided once per creature in `faceTravel` and committed, which is
     * what `facingRest` is for.
     */
    paintHazards(this.swimGfx, this.swimmers, this.width, this.elapsed, () => false, 'in-play', Number.NaN);
    paintObstacles(this.frontGfx, this.frontBed, this.width);
  }

  /** One creature, or a small school of one kind, entering from a random side at a random height. */
  private spawnWave(): void {
    const cfg = mech.menu.backdrop;
    const count = Math.random() < cfg.schoolChance ? Math.round(cfg.schoolMin + Math.random() * (cfg.schoolMax - cfg.schoolMin)) : 1;
    const kind = SWIMMERS[Math.floor(Math.random() * SWIMMERS.length)] ?? 'fish';
    const fromLeft = Math.random() < 0.5;
    const dir = fromLeft ? 1 : -1;
    const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
    const y = this.height * (0.14 + Math.random() * 0.72);
    for (let i = 0; i < count; i++) {
      const x = fromLeft ? -this.width * 0.08 - i * this.width * 0.06 : this.width * 1.08 + i * this.width * 0.06;
      const h = this.swimmers.spawnAt(kind, x, y + (Math.random() - 0.5) * this.height * 0.08, {
        deterministic: true,
        variety: Math.floor(Math.random() * 8),
      });
      /**
       * THE SIZE IS THE ONE THING THAT IS NOT THE GAME'S.
       *
       * Nothing collides here, so `radiusFraction`'s only job is `2 x radiusFraction x lane` -- the picture's width.
       * Scaling it is therefore a pure look: a shark can be a shark without being as large on the title screen as it
       * is when it is trying to eat you. `radius` and `hazardArt.scale` still decide the real thing, untouched.
       */
      h.radiusFraction *= Math.max(0.01, cfg.creatureScale);
      /**
       * A random head start on the clock, so a school does not swim in lockstep.
       *
       * `spawnAt` zeroes `phase` for a deterministic spawn -- which is what a probe wants -- and a run of fish all
       * beating their tails on the same frame is the one thing that makes a school look assembled rather than alive.
       */
      h.phase = Math.random() * 8;
      this.velocity.set(h.id, { vx: speed * dir, vy: (Math.random() - 0.5) * cfg.driftRatio * speed });
      h.heading = dir;
      this.faceTravel(h, dir);
      this.swimmers.hazards.push(h);
    }
  }

  /**
   * Commit the picture to a direction, so a creature is never drawn swimming backwards.
   *
   * The expression is the painter's own, asked here instead of there because "which way should this face" needs a
   * player and the menu has none. `facingRest` is then set out of reach: that timer exists to stop a creature strobing
   * as the player drifts across its centre line, and a decorative fish has nothing to re-decide about.
   */
  private faceTravel(h: Hazard, dir: number): void {
    const front = mech.hazardArt[h.kind]?.front ?? mech.hazardFront;
    const facesRight = dir > 0;
    h.facing = (front === 'left') === facesRight ? -1 : 1;
    h.facingRest = Number.MAX_SAFE_INTEGER;
  }
}
