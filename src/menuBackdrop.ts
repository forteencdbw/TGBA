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
 * The same map carries the creature's `School`, and for the same reason.
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

/**
 * A group of creatures that arrived together AND travel as one.
 *
 * ---------------------------------------------------------------------------------------------
 * EVERY CREATURE HAS ONE, AND ONLY SMALL FISH EVER SHARE IT
 * ---------------------------------------------------------------------------------------------
 * A lone whale, a lone sardine and a two-crab team are each "a group" with one member, so nothing below ever asks how
 * many members a school has -- which is what makes "a shoal of sardines darts as one" and "a whale darts on its own"
 * the same line of code instead of two.
 *
 * What the WORLD says is narrower, and the narrow part is the point: the only animals in this water that behave as a
 * group are small fish. A team of three anglerfish drifting apart is not a missing feature -- it is the answer.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE DECISIONS LIVE HERE AND NOT ON A CREATURE
 * ---------------------------------------------------------------------------------------------
 * Both of a school's decisions are the SCHOOL's, and a roll taken inside the move loop would be taken once per
 * creature: a shoal of ten would dart and turn ten times as often as a whale, and the shoal would come apart at the
 * turn's own edge instead of wheeling as a body. So each school rolls ONCE per frame, and turning reaches every
 * member at once.
 */
interface School {
  /** Seconds left of a burst of speed; 0 while swimming normally. */
  burstLeft: number;
}

/** A school with one member in it -- what everything that is not a fish shoal gets. See `School` above. */
const newSchool = (): School => ({ burstLeft: 0 });

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
  /** Speed and school per swimmer, keyed by hazard id. See the notes at the top of the file. */
  private readonly velocity = new Map<number, { vx: number; vy: number; school: School }>();

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
      /**
       * THE SAME DEPARTURE A DEFEATED CREATURE MAKES.
       *
       * `h.flee` is the game's own leaving state, and setting it here buys three things at once: the motion below
       * (a fixed `fleeScreensPerSecond` screen-heights per second, which is the "gone in about a second" the water
       * uses), the painted dimming (`fleeAlpha`), and -- the reason it is worth reusing rather than reimplementing --
       * the FACING, because the painter already has a rule for "turn the way you are leaving". That rule is why
       * `facingRest` is released here: it was pinned to stop a swimming fish flipping around, and a departing one is
       * supposed to flip.
       */
      h.flee = h.x < this.width / 2 ? 'right' : 'left';
      h.facingRest = 0;
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

    /**
     * THE SCHOOLS DECIDE FIRST, AND EACH ONE DECIDES ONCE.
     *
     * Two passes rather than one because both of a school's decisions belong to the GROUP: taken inside the move loop
     * below they would be taken once per creature, and a shoal of ten would dart and turn ten times as often as a
     * whale. Grouping first is also what gives "the middle of the screen" something to mean for a shoal -- see
     * `turnBand`: it measures the group's CENTRE, so a shoal wheels as a body rather than coming apart at the band.
     */
    const groups = new Map<School, { members: Hazard[]; sum: number }>();
    for (const h of this.swimmers.hazards) {
      const v = this.velocity.get(h.id);
      if (!v) continue;
      const g = groups.get(v.school);
      if (g) {
        g.members.push(h);
        g.sum += h.x;
      } else {
        groups.set(v.school, { members: [h], sum: h.x });
      }
    }
    const low = (this.width * (1 - cfg.turnBand)) / 2;
    const high = this.width - low;
    for (const [school, g] of groups) {
      /**
       * Leaving is not a decision, and this is where a departing school stops making them. Every member of a school
       * flees together -- `beginExit` sets them in one pass -- so one look at the first member settles it for the
       * group, and a burst left running would be a burst nobody asked a leaving creature for.
       */
      if (g.members[0]!.flee) {
        school.burstLeft = 0;
        continue;
      }
      school.burstLeft = Math.max(0, school.burstLeft - dt);
      /**
       * A BURST IS A CHANCE PER FRAME rather than a countdown, which is what makes "on average every
       * `burstEverySeconds`" true at any frame rate instead of only at the one it was tuned on.
       */
      if (school.burstLeft <= 0 && Math.random() < dt / Math.max(0.01, cfg.burstEverySeconds)) {
        school.burstLeft = cfg.burstSeconds;
      }
      /**
       * And the turn, the one rule with a PLACE as well as a rate.
       *
       * `vx` and `vy` both flip, because a creature that turned around turns around: reversing only the horizontal
       * part would leave it crabbing along at its old height, which is a sideways walk and not a fish.
       */
      const centre = g.sum / g.members.length;
      if (centre > low && centre < high && Math.random() < dt / Math.max(0.01, cfg.turnEverySeconds)) {
        for (const m of g.members) {
          const mv = this.velocity.get(m.id);
          if (!mv) continue;
          mv.vx = -mv.vx;
          mv.vy = -mv.vy;
          this.faceTravel(m, mv.vx >= 0 ? 1 : -1);
        }
      }
    }

    /**
     * HOW FAR OFF SCREEN A CREATURE MAY BE BEFORE IT IS DROPPED.
     *
     * It has to cover where a school is BORN, not just where one creature is. Members are laid out along the
     * direction of travel, so a ten-fish shoal starts spread over a quarter of a screen -- and a margin tighter than
     * that deleted the back half of every school on the spawn frame. The symptom was a shoal that only ever arrived
     * three fish long, which looked exactly like a school size that was not being read.
     */
    const margin = this.width * 0.34;
    for (let i = this.swimmers.hazards.length - 1; i >= 0; i--) {
      const h = this.swimmers.hazards[i]!;
      const v = this.velocity.get(h.id);
      if (!v) {
        this.swimmers.hazards.splice(i, 1);
        continue;
      }
      /**
       * How hard this creature is swimming right now, applied to the DISPLACEMENT rather than to `vx`/`vy`.
       *
       * That is the whole of "a burst and a turn do not interfere": the turn owns the direction, the burst owns the
       * rate, and a creature that turns halfway through a burst simply carries on bursting the other way.
       */
      const boost = v.school.burstLeft > 0 ? cfg.burstScale : 1;
      if (h.flee) {
        const step = this.height * mech.hazards.fleeScreensPerSecond * dt;
        h.x += h.flee === 'right' ? step : -step;
      } else {
        h.x += v.vx * boost * dt * this.width;
        h.y += v.vy * boost * dt * this.height;
      }
      /**
       * THE ANIMATION CLOCK, and it is `phase`.
       *
       * In the water this is advanced by `HazardField.advanceKind` -- one line, for every kind -- and it is what
       * `hazardArtPose` hands the animation as its elapsed time. Nothing here runs the field's update, so without this
       * every decorative fish holds frame one for its whole crossing: a backdrop of statues.
       *
       * It runs at the burst's own rate, so a swimming-hard creature also beats its tail faster. The SAME number does
       * both, deliberately: "how hard it is swimming" is one fact about the creature and not two, and a burst that
       * moved the body faster while the tail beat at its old speed is a picture being dragged rather than a fish.
       */
      h.phase += dt * boost;
      /**
       * `heading` is the creature's own fact about which way it is going.
       *
       * A departing creature reads its direction from `flee`, because the velocity map still holds the speed it was
       * travelling at before it turned -- the painter takes the exit side over `heading` for the picture, but leaving
       * a stale direction on the creature would be a fact that is simply wrong to anyone who reads it next.
       */
      h.heading = h.flee ? (h.flee === 'right' ? 1 : -1) : v.vx >= 0 ? 1 : -1;
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
    /**
     * And the departures, in their own pass.
     *
     * The painter splits a creature into exactly one of two passes -- `in-play` or `leaving` -- so a creature with
     * `flee` set is skipped by the call above and would simply not be drawn. That split is what lets the water dim the
     * whole leaving group at once, and it is why reusing the game's exit means asking for both passes.
     */
    paintHazards(this.swimGfx, this.swimmers, this.width, this.elapsed, () => false, 'leaving', Number.NaN);
    paintObstacles(this.frontGfx, this.frontBed, this.width);
  }

  /**
   * One arrival: a single creature, or a batch of one kind, entering from a random side at a random height.
   *
   * A BATCH IS NOT A GROUP. Whether these creatures go on to behave as one is decided by a single line below -- see
   * the note on `shared` -- and the answer is "only if they are small fish".
   */
  private spawnWave(): void {
    const cfg = mech.menu.backdrop;
    /**
     * WHICH KIND, weighted towards the small fish.
     *
     * Uniform over nineteen kinds is not what the water looks like: a level is overwhelmingly small fish, and the
     * sharks and whales are the exceptions that make the water dangerous. Picking uniformly made the commonest
     * creature in the game the rarest thing in the menu -- and it made the shoal rule above nearly invisible, because
     * a rule about how fish arrive means nothing if fish almost never arrive.
     */
    const kind = Math.random() < cfg.fishChance ? 'fish' : (SWIMMERS[Math.floor(Math.random() * SWIMMERS.length)] ?? 'fish');
    /**
     * Small fish school, big things do not, and that is a rule about the animal rather than about the kind index.
     *
     * `fish` gets its own numbers because a shoal of sardines is what small fish DO -- the default chance of 0.18
     * would make the commonest creature in the game the rarest thing to see a group of, and nine sharks travelling
     * together is a different claim about the world than nine sardines.
     */
    const shoal = kind === 'fish';
    const chance = shoal ? cfg.fishSchoolChance : cfg.schoolChance;
    const lo = shoal ? cfg.fishSchoolMin : cfg.schoolMin;
    const hi = shoal ? cfg.fishSchoolMax : cfg.schoolMax;
    const count = Math.random() < chance ? Math.max(1, Math.round(lo + Math.random() * (hi - lo))) : 1;
    /**
     * ONE SHARED SCHOOL FOR A SHOAL, AND ONE EACH FOR EVERYTHING ELSE.
     *
     * This line is the whole of "only small fish travel as a group". A batch of two or three of anything else is an
     * arrival and nothing more -- each of those gets its own school, so they turn and dart one at a time, exactly as
     * a lone whale does.
     */
    const shared = shoal && count > 1 ? newSchool() : null;
    const fromLeft = Math.random() < 0.5;
    const dir = fromLeft ? 1 : -1;
    const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
    const y = this.height * (0.14 + Math.random() * 0.72);
    for (let i = 0; i < count; i++) {
      /**
       * Packed just off the edge, then allowed to spread by their own speeds.
       *
       * The spread is `i * spacing` from the edge, and it has to stay inside the cull margin above or the tail of the
       * school is deleted before it is ever seen. Letting the members drift apart as they cross -- see the speed
       * jitter below -- gives the same loose shoal without the whole formation having to exist off screen.
       */
      const x = fromLeft ? -this.width * 0.06 - i * this.width * 0.026 : this.width * 1.06 + i * this.width * 0.026;
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
      // A little speed variation per member, so a school opens up as it crosses rather than travelling as a block.
      this.velocity.set(h.id, {
        vx: speed * (0.86 + Math.random() * 0.28) * dir,
        vy: (Math.random() - 0.5) * cfg.driftRatio * speed,
        school: shared ?? newSchool(),
      });
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
