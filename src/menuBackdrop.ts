import { Container, FillGradient, Graphics } from 'pixi.js';
import { rgba } from './background';
import { mech } from './config';
import { BubbleField, MoteField } from './menuDrift';
import { advanceTurn, commitFacing, HazardField, paintHazards, type Hazard, type HazardKind } from './hazards';
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
 * EVERY NAME IN THE CONFIG'S LONER LIST HAS TO BE SOMETHING THAT CAN ACTUALLY TURN UP.
 *
 * `mechanisms.ts` checks the shape of that list -- an array of strings -- and that is all it can do: whether a name is
 * real has to be asked of the swimmers, and the swimmers are here. A name that is not one of them would do NOTHING at
 * all and say nothing about it: the creature would simply never be alone, and a knob that quietly does not work is
 * the one kind this project does not allow. That covers a typo and it covers `vent`, which is terrain.
 *
 * The check lives here rather than beside the other boot checks because `mechanisms.ts` cannot import this file
 * without a cycle, and it is a throw either way.
 */
for (const kind of mech.menu.backdrop.loners) {
  if (!SWIMMERS.includes(kind as HazardKind)) {
    throw new Error(`menu.backdrop.loners names "${kind}", which is not one of the creatures that swim in the menu`);
  }
}

/**
 * Two creatures that do not swim: they CRAWL.
 *
 * A starfish and an urchin are seabed animals, and in the water they are the two whose art is a lump that already
 * sits on the floor. So they are the two that keep to it: they arrive in the bottom of the screen, travel at a
 * fraction of a swimmer's speed, never turn, and never drift off the height they were born at -- with the drift every
 * other creature has, a crawler would be off the bottom of the screen within seconds of arriving.
 *
 * That combination makes them the one thing here that stays a long time: a slow crawl with no turn means the slowest
 * of them takes over a minute to cross. It is bounded by the same cap as everything else, but it is the reason
 * `crawlerSpeedScale` is not lower than it is.
 */
const CRAWLERS: readonly HazardKind[] = ['urchin', 'starfish'];

/**
 * WHICH CREATURES DO WHICH.
 *
 * Three rules about the ANIMAL rather than about the numbers, so they live here instead of in the config -- the same
 * place, and for the same reason, as `shoal = kind === 'fish'` in `spawnWave`: "only small fish dart, and only small
 * fish do it as a shoal" is a fact about small fish and not a dial, and a config key for it would be an invitation to
 * make it untrue.
 */
const darts = (kind: HazardKind): boolean => kind === 'fish';
const turns = (kind: HazardKind): boolean => !CRAWLERS.includes(kind);

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
  /**
   * The lane clip: everything the backdrop draws is cut to it.
   *
   * Deliberately never added to anything, which is what keeps it from being drawn -- a mask has to live in the scene
   * graph to have a transform, but it must not be a CHILD of what it masks or the filled rectangle would cover it.
   * `src/background.ts` clips the game's own lane the same way.
   */
  private readonly maskShape = new Graphics();
  /**
   * The deep-sea light, in three pieces -- and WHERE they sit in the stack is half of the effect.
   *
   *     back coral  ->  specks  ->  shafts  ->  [darkness]  ->  bubbles  ->  swimmers  ->  [halo]  ->  front coral
   *
   * So the mask covers the WATER: the back reef, the specks and the shafts go black with depth, while the creatures,
   * the bubbles and the front reef are drawn over it and stay fully lit. The halo then goes over the creatures,
   * because it is the light from the surface washing the whole scene, but under the front reef, which is nearer to
   * the eye than the light is.
   *
   * The specks are under the SHAFTS as well as under the mask, which is deliberate: the shafts add their light over
   * the top of them, so a speck standing in a beam gets the beam's colour on top of the brightness `BeamLight` gives
   * it. See `src/menuDrift.ts` for why both are needed and neither is enough.
   *
   * The shafts are UNDER the mask rather than over it, and that is worth a sentence because it is a coin toss that was
   * settled by looking: over the mask, the low tails of four shafts add up into a haze across the middle of the water,
   * and the picture stops being a lit top over a black bottom. Under it, the dark is dark.
   *
   * The reference this came from puts the mask over the entire scene. It does not here, and the reason is a
   * measurement rather than a taste: the mask is 0.85 opaque at 65% of the way down, and the creatures are born from
   * 14% to 86% -- so covering them would mean a third of the fish fading out as they swam, and the starfish and
   * urchins, whose whole band is the bottom third, would never be seen at all.
   */
  private readonly darkGfx = new Graphics();
  private readonly beamLayer = new Container();
  private readonly glowGfx = new Graphics();
  /**
   * One entry per shaft: the lean and the root it sways around, which way it starts, and the shape a probe of the
   * light needs -- how wide it is at each end and how far it reaches. See `beamLightAt`.
   */
  private readonly beams: {
    holder: Container;
    lean: number;
    baseX: number;
    phase: number;
    halfTop: number;
    halfBottom: number;
    length: number;
  }[] = [];
  private readonly motes = new MoteField();
  private readonly bubbles = new BubbleField();
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
    this.root.addChild(
      this.backLayer,
      this.motes.graphics,
      this.beamLayer,
      this.darkGfx,
      this.bubbles.graphics,
      this.swimLayer,
      this.glowGfx,
      this.frontLayer,
    );
    this.root.scale.set(1, -1);
    this.root.mask = this.maskShape;
    /**
     * LIGHT ADDS.
     *
     * `add` is what makes the halo and the shafts read as light rather than as pale paint: where two shafts cross, the
     * result is brighter than either -- which is the one thing plain alpha blending cannot say, because it can only
     * ever move a pixel toward the colour on top of it. The shafts' own Graphics carry it too; see `buildLight`.
     */
    this.glowGfx.blendMode = 'add';
  }

  /**
   * Rebuild for a new screen size, and for wherever the LANE is on it.
   *
   * The corals are laid out once per size rather than per frame: they do not move, so where they are is a property of
   * the window. `width` is the lane, so every length in the config is a fraction of the lane and the reef keeps its
   * proportions when the window changes -- see `layout` in `src/menu.ts` for why that is the lane and not the screen.
   */
  layout(width: number, height: number, left: number): void {
    this.width = width;
    this.height = height;
    this.root.position.set(left, height);
    /**
     * AND CLIPPED TO IT, which is the half of this that is easy to forget.
     *
     * A creature is BORN just off the lane and is only retired a third of a lane beyond it, so that an arrival slides
     * in from behind the edge instead of appearing in the middle of the window -- which means, without a mask, that
     * a fish swims on across the letterbox for a good fraction of a second before it is dropped. The mask is what
     * makes "the water is the lane" true of the picture and not only of the arithmetic.
     *
     * A bare Graphics that is never added to anything, so it is never drawn: that is the same trick the game's own
     * lane clip uses. See `WorldLayer` in `src/background.ts`.
     */
    this.maskShape.clear();
    this.maskShape.rect(left, 0, width, height).fill(0xffffff);
    const cfg = mech.menu.backdrop;
    this.bed(this.backBed, cfg.backCoralCount, cfg.backCoralHalfWidth, cfg.backCoralBottom);
    this.bed(this.frontBed, cfg.frontCoralCount, cfg.frontCoralHalfWidth, cfg.frontCoralBottom);
    this.buildLight();
    /**
     * And the water's contents, seeded AFTER the light because the specks are seeded across the whole lane and the
     * light is what decides how visible each one of them is.
     */
    this.motes.seed(width, height);
    this.bubbles.seed(width, height);
  }

  /**
   * Build the deep-sea light: the darkness, the halo, and the shafts.
   *
   * EVERY ONE OF THEM IS STATIC GEOMETRY, rebuilt only here, on a resize. What moves is four rotations and four
   * alphas -- see `update` -- so none of this costs anything per frame.
   *
   * The gradients are `FillGradient` rather than generated textures, which is the project's one way of doing a
   * gradient (the game's water and its vignette use the same). The reference this came from builds three Canvas
   * textures instead; that would be the only `document.createElement` in `src/`, and it would put this effect out of
   * reach of every probe, because a probe has no `document`.
   */
  private buildLight(): void {
    const cfg = mech.menu.lighting;
    const lane = this.width;
    const height = this.height;

    /**
     * THE DARKNESS -- and the stops are written UPSIDE DOWN on purpose.
     *
     * This whole container has `scale.y = -1`, so a gradient's local y runs from the bottom of the lane (0) to the
     * top (1), which is the opposite of the screen. So the opaque stop is at 0 and the clear one at 1.
     */
    this.darkGfx.clear();
    this.darkGfx.rect(0, 0, lane, height).fill({
      fill: new FillGradient({
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        colorStops: [
          { offset: 0, color: rgba(cfg.darknessColour, 1) },
          { offset: cfg.darknessMidOffset, color: rgba(cfg.darknessColour, cfg.darknessMidAlpha) },
          { offset: 1, color: rgba(cfg.darknessColour, cfg.darknessTopAlpha) },
        ],
        textureSpace: 'local',
      }),
    });

    /**
     * THE HALO -- and it is drawn with ROOM TO MOVE, which is the only reason it is not the shape the config's numbers
     * describe.
     *
     * `textureSpace: 'local'` and NOT `'global'`, which is what it was for one commit. The difference is a measurement
     * rather than a taste: in global space the ramp is a CIRCLE whose radius is a fraction of the lane's HEIGHT, so on
     * a lane wider than it is tall the light dies out before it reaches the sides. The water there goes black, and
     * what is left of the shafts is only their brightest part -- their narrow tops -- swaying in it: four thin lines,
     * which is a light rig and not the sea.
     *
     * In LOCAL space the ramp is proportional to the shape, so it always spans the lane however wide or short the
     * window is. That makes it an ellipse of the lane's aspect rather than the reference's circle -- and the reference
     * draws on a full-screen canvas, where those are the same thing. This draws on a lane.
     *
     * The slack is the room: the shape is taller than the lane so the drift cannot uncover the top of the lane, which
     * is the brightest part of the halo and would show as a seam. Everything about the gradient is then in the SHAPE's
     * normalised space, while the config's numbers are fractions of the LANE, so the centre is converted here.
     */
    const slack = height * Math.max(0.05, cfg.glowDrift * 2);
    const boxHeight = height + slack * 2;
    const glowY = (height * cfg.glowCentreY + slack) / boxHeight;
    this.glowGfx.clear();
    this.glowGfx.rect(0, -slack, lane, boxHeight).fill({
      fill: new FillGradient({
        type: 'radial',
        center: { x: 0.5, y: glowY },
        innerRadius: 0,
        outerCenter: { x: 0.5, y: glowY },
        outerRadius: cfg.glowRadius,
        colorStops: [
          { offset: 0, color: rgba(cfg.glowColour, cfg.glowAlpha) },
          { offset: cfg.glowMidOffset, color: rgba(cfg.glowColour, cfg.glowMidAlpha) },
          { offset: 1, color: rgba(cfg.glowColour, 0) },
        ],
        textureSpace: 'local',
      }),
    });

    // -------------------------------------------------------------------------------------------
    // THE SHAFTS.
    // -------------------------------------------------------------------------------------------
    for (const child of this.beamLayer.removeChildren()) child.destroy({ children: true });
    this.beams.length = 0;

    const count = Math.max(1, Math.round(cfg.beamCount));
    const beamWidth = lane * cfg.beamWidth;
    const beamHeight = height * cfg.beamHeight;
    const halfTop = (beamWidth * cfg.beamNarrow) / 2;
    const halfBottom = beamWidth / 2;
    /**
     * HOW MANY SLICES A SHAFT IS CUT INTO.
     *
     * A shaft has to fade in TWO directions at once -- soft at its left and right edges, gone by its bottom -- and a
     * gradient is one-dimensional, so a texture is the obvious answer and the one this refuses to use. Slicing the
     * shaft and giving each slice its own alpha gets both fades out of the one-dimensional thing: the horizontal ramp
     * is a single shared gradient, and the vertical one is the slice's own opacity. Sixty steps are past where the
     * bands show, and the geometry is only built when the window changes.
     */
    const slices = 60;
    /**
     * ONE gradient for every slice of every shaft.
     *
     * `textureSpace: 'local'` is what makes that safe: the ramp is measured against the bounds of whatever is being
     * filled, so one instance gives each slice its own left-to-right fade rather than one long ramp sliced up.
     */
    const edge = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      colorStops: [
        { offset: 0, color: rgba(cfg.beamColour, 0) },
        { offset: 0.5, color: rgba(cfg.beamColour, 1) },
        { offset: 1, color: rgba(cfg.beamColour, 0) },
      ],
      textureSpace: 'local',
    });
    for (let i = 0; i < count; i++) {
      const holder = new Container();
      const baseX = lane * (cfg.beamFirstX + i * cfg.beamSpread);
      holder.position.set(baseX, height * cfg.beamTop);
      const lean = cfg.beamLean + i * cfg.beamPitch;
      holder.rotation = lean;
      const gfx = new Graphics();
      gfx.blendMode = 'add';
      /**
       * NOT left at 1 until the first `update`. The sway sets this every frame before anything is drawn, so it would
       * never be seen wrong -- but `beamLightAt` reads it, and "the light is right except before the first frame" is
       * the kind of thing a probe finds and a player never does.
       */
      holder.alpha = cfg.beamAlpha;
      for (let s = 0; s < slices; s++) {
        const t0 = s / slices;
        const t1 = (s + 1) / slices;
        const w0 = halfTop + (halfBottom - halfTop) * t0;
        const w1 = halfTop + (halfBottom - halfTop) * t1;
        /**
         * Local +y is UP here, for the same reason the gradient is upside down: the shaft goes DOWNWARD from its
         * anchor, which is a negative y in this container's space.
         */
        const y0 = -t0 * beamHeight;
        const y1 = -t1 * beamHeight;
        gfx.poly([-w0, y0, w0, y0, w1, y1, -w1, y1]).fill({
          fill: edge,
          alpha: this.beamFade((t0 + t1) / 2),
        });
      }
      holder.addChild(gfx);
      this.beamLayer.addChild(holder);
      this.beams.push({ holder, lean, baseX, phase: i, halfTop, halfBottom, length: beamHeight });
    }
  }

  /**
   * How much of a shaft is left at `t` of the way down it: full, then the mid value, then nothing.
   *
   * A method rather than a local in `buildLight`, because `beamLightAt` asks the same question about the same shafts.
   * Two copies of this would agree with each other until somebody tuned one of them, and then the specks would be lit
   * by a shaft that is not the one being drawn.
   */
  private beamFade(t: number): number {
    const cfg = mech.menu.lighting;
    const mid = Math.max(0.001, cfg.beamFadeMidOffset);
    if (t >= 1) return 0;
    if (t <= mid) return 1 + (cfg.beamFadeMidAlpha - 1) * (t / mid);
    return cfg.beamFadeMidAlpha * (1 - (t - mid) / (1 - mid));
  }

  /**
   * How much of the shafts' light lands on a point: 0 between them, about 1 inside one.
   *
   * It reads the shafts' OWN current state -- their angle, their root, their width, their fade and, crucially, the
   * alpha the sway is giving them right now -- rather than re-deriving where a shaft is from the config. A second
   * model of the beam geometry is exactly the thing that agrees with the first one until somebody tunes one of them;
   * and taking the live alpha is what makes the specks in a beam flicker along with it.
   */
  private beamLightAt(x: number, y: number): number {
    let lit = 0;
    for (const beam of this.beams) {
      const dx = x - beam.holder.position.x;
      const dy = y - beam.holder.position.y;
      // Into the shaft's own frame: it hangs below its anchor, so "down the shaft" is -y there.
      const cos = Math.cos(beam.holder.rotation);
      const sin = Math.sin(beam.holder.rotation);
      const along = -dx * sin + dy * cos;
      if (along > 0) continue;
      const t = -along / Math.max(0.001, beam.length);
      if (t > 1) continue;
      const across = dx * cos + dy * sin;
      const half = (beam.halfTop + (beam.halfBottom - beam.halfTop) * t) * beam.holder.scale.x;
      const off = Math.abs(across) / Math.max(0.001, half);
      if (off >= 1) continue;
      // The shaft's own two fades, multiplied: across it is its soft edge, down it is its length.
      lit += (1 - off) * this.beamFade(t) * beam.holder.alpha;
    }
    return Math.min(1, lit);
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
      /**
       * THE ROLLS ARE TAKEN FOR EVERY SCHOOL, INCLUDING ONE THAT CANNOT USE THEM.
       *
       * A pause, because that reads like waste: a crawler never darts and never turns, so rolling for it decides
       * nothing at all. It is deliberate waste. The two rolls happen in a fixed order for every school, which is what
       * lets `scripts/probe-menu-backdrop.mjs` script the dice and know which value lands on which decision. A rule
       * that skipped a roll for one kind would silently re-point every later value in that script at a different
       * decision, and a probe that quietly measures the wrong thing is worse than one that fails to compile.
       */
      const kind = g.members[0]!.kind;
      const dart = Math.random();
      const turn = Math.random();
      school.burstLeft = Math.max(0, school.burstLeft - dt);
      /**
       * A BURST IS A CHANCE PER FRAME rather than a countdown, which is what makes "on average every
       * `burstEverySeconds`" true at any frame rate instead of only at the one it was tuned on.
       */
      if (darts(kind) && school.burstLeft <= 0 && dart < dt / Math.max(0.01, cfg.burstEverySeconds)) {
        school.burstLeft = cfg.burstSeconds + cfg.burstFallSeconds;
      }
      /**
       * And the turn, the one rule with a PLACE as well as a rate -- and the one thing here that every creature does
       * except the crawlers, so its rate is per-animal: small fish are the lively ones and turn twice as often.
       *
       * `vx` and `vy` both flip, because a creature that turned around turns around: reversing only the horizontal
       * part would leave it crabbing along at its old height, which is a sideways walk and not a fish.
       */
      const centre = g.sum / g.members.length;
      const every = kind === 'fish' ? cfg.fishTurnEverySeconds : cfg.turnEverySeconds;
      if (turns(kind) && centre > low && centre < high && turn < dt / Math.max(0.01, every)) {
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
       *
       * The rate itself is not a switch -- see `burstBoost`.
       */
      const boost = this.burstBoost(v.school.burstLeft);
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
       * And the turn animation's own clock, which is NOT `phase`.
       *
       * `phase` is the frame-by-frame picture and it runs at the burst's rate, so a fishing sprinting away from a
       * turn would finish the turn early -- the picture would be part-way round for a shorter time than the water
       * says. A turn takes `turnSeconds` on the world's clock wherever it happens, so it counts down against `dt`.
       *
       * This is the second of the two places a turn is advanced (the game's per-frame loop is the other); see
       * `advanceTurn`.
       */
      advanceTurn(h, dt);
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

    /**
     * THE SEA SURFACE, moving.
     *
     * Four things move, and they are the four things light does under a surface that is not still: the ANGLE of each
     * shaft (the water refracts it somewhere else), its WIDTH (the surface focuses it and spreads it), where its root
     * LANDS (the bright spot on the surface travels), and how BRIGHT it is. Four periods that do not divide one
     * another, and a different starting offset for each shaft, so the picture never comes back round and the four
     * never move as one.
     *
     * ALL OF IT IS CONTAINER PROPERTIES. The 240 slices are still built once, in `layout` -- the width pulse is
     * `scale.x` and not a redrawn path, which is the whole reason this costs nothing. (And scaling the holder scales
     * the shared horizontal gradient with it, so the soft edges stay soft.)
     *
     * Off `elapsed`, the menu's own clock, so a menu that is not being updated is a menu where nothing moves.
     */
    const light = mech.menu.lighting;
    const at = (seconds: number, phase: number): number =>
      Math.sin((this.elapsed / Math.max(0.001, seconds)) * Math.PI * 2 + phase);
    for (const beam of this.beams) {
      const i = beam.phase;
      beam.holder.rotation = beam.lean + at(light.beamSwaySeconds, i) * light.beamSway;
      beam.holder.scale.x = 1 + at(light.beamWidthSeconds, i * 1.7) * light.beamWidth;
      beam.holder.position.x = beam.baseX + at(light.beamDriftSeconds, i * 2.3) * light.beamDrift * this.width;
      beam.holder.alpha = light.beamAlpha * (1 + at(light.beamPulseSeconds, i * 1.7) * light.beamPulse);
    }
    /**
     * And the halo breathes with them, but slowly and barely.
     *
     * It is the floor every shaft stands on, and a floor that shakes takes the depth out of the picture. Its own alpha
     * modulates around 1 rather than around `glowAlpha`, because that brightness is already in the gradient's stops.
     */
    this.glowGfx.position.y = at(light.glowSeconds, Math.PI / 2) * light.glowDrift * this.height;
    this.glowGfx.alpha = 1 + at(light.glowSeconds, 0) * light.glowPulse;

    /**
     * And the water's contents. The specks ask the shafts where the light is AFTER the sway has set their alphas, so
     * a speck in a beam brightens and dims with the beam itself -- which is most of what makes moving water read as
     * moving water rather than as a light doing a slow dance.
     */
    this.motes.update(dt, (x, y) => this.beamLightAt(x, y));
    this.bubbles.update(dt, this.width);

    this.backGfx.clear();
    this.swimGfx.clear();
    this.frontGfx.clear();
    this.motes.draw();
    this.bubbles.draw();
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
    /**
     * A LONER IS ALWAYS ONE, whatever the dice said -- but the roll is STILL TAKEN.
     *
     * For the reason the two decisions in `update` are: a kind that drew a different number of values would re-point
     * every later value in a probe's dice script at another decision, and a probe that quietly measures the wrong
     * thing is worse than one that fails to compile.
     */
    const rolled = Math.random() < chance ? Math.max(1, Math.round(lo + Math.random() * (hi - lo))) : 1;
    const count = cfg.loners.includes(kind) ? 1 : rolled;
    /**
     * ONE SHARED SCHOOL FOR A SHOAL, AND ONE EACH FOR EVERYTHING ELSE.
     *
     * This line is the whole of "only small fish travel as a group". A batch of two or three of anything else is an
     * arrival and nothing more -- each of those gets its own school, so they turn and dart one at a time, exactly as
     * a lone whale does.
     */
    const shared = shoal && count > 1 ? newSchool() : null;
    /** Whether this arrival crawls rather than swims -- see `CRAWLERS`. */
    const crawls = CRAWLERS.includes(kind);
    const fromLeft = Math.random() < 0.5;
    const dir = fromLeft ? 1 : -1;
    const speed =
      (cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin)) * (crawls ? cfg.crawlerSpeedScale : 1);
    /**
     * The height the wave arrives at, as a point in the water.
     *
     * For a crawler this is rolled and then NOT USED -- its members pick their own points on the seabed below. The
     * roll is still taken so that how many rolls this method makes does not depend on what arrived, the same courtesy
     * the two decision rolls in `update` pay.
     */
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
      /**
       * And the height THIS member arrives at.
       *
       * A crawler's whole life is spent in the bottom of the screen, so it picks a point IN its band rather than
       * being spread around the wave's -- which is what makes "the bottom third" true of the widest member of a batch
       * and not only of its middle, and spreads a herd ALONG the seabed instead of around one line.
       */
      const arrival = crawls
        ? Math.random() * this.height * cfg.crawlerBandTop
        : y + (Math.random() - 0.5) * this.height * 0.08;
      const h = this.swimmers.spawnAt(kind, x, arrival, {
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
        /**
         * A crawler keeps the height it arrived at.
         *
         * The drift factor is 0 for it rather than the roll being skipped, so the roll count here stays independent
         * of the kind. What it buys is the whole point of a crawler: with the drift every other creature has, one
         * born near the bottom of its band would be off the bottom of the screen within seconds.
         */
        vy: (Math.random() - 0.5) * (crawls ? 0 : cfg.driftRatio) * speed,
        school: shared ?? newSchool(),
      });
      h.heading = dir;
      this.faceTravel(h, dir);
      this.swimmers.hazards.push(h);
    }
  }

  /**
   * How hard a school is swimming, `left` seconds from the end of a burst.
   *
   * A burst STARTS suddenly and does not END suddenly. It runs at full speed for `burstSeconds` and then slides back
   * down over `burstFallSeconds`, because a speed that goes from 2.5x to 1x between two frames reads on a small fish
   * as a jumper landing rather than as a sprint finishing. The onset is left alone: that part is the punctuation.
   *
   * The slide is a SQUARE -- an ease-out. It drops hardest the moment the tail begins and flattens as it arrives, so
   * the last frames of it are indistinguishable from cruising and the speed has no kink where the tail ends.
   */
  private burstBoost(left: number): number {
    const cfg = mech.menu.backdrop;
    const fall = Math.max(0.001, cfg.burstFallSeconds);
    const t = left >= fall ? 1 : Math.max(0, left / fall);
    return 1 + (cfg.burstScale - 1) * t * t;
  }

  /**
   * Commit the picture to a direction, so a creature is never drawn swimming backwards.
   *
   * The expression is the painter's own, asked here instead of there because "which way should this face" needs a
   * player and the menu has none.
   */
  private faceTravel(h: Hazard, dir: number): void {
    const front = mech.hazardArt[h.kind]?.front ?? mech.hazardFront;
    const facesRight = dir > 0;
    /**
     * `commitFacing` rather than an assignment, because a turn is a turn wherever it happens -- and this is the only
     * other place one does. The painter turns what it can see a player through; the backdrop has no player, so it
     * turns its own creatures here, and both doors have to lead to the same animation.
     *
     * The FIRST one is not animated, which is what makes a creature arrive already facing the way it set off.
     */
    commitFacing(h, (front === 'left') === facesRight ? -1 : 1);
    /**
     * `facingRest` is then set out of reach: that timer exists to stop a creature strobing as the player drifts
     * across its centre line, and a decorative fish has nothing to re-decide about.
     */
    h.facingRest = Number.MAX_SAFE_INTEGER;
  }
}
