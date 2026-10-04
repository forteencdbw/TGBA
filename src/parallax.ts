/**
 * Parallax: four layers of drifting motes, the far ones moving slower than the near ones.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY LAYERS RATHER THAN ONE SNOW FIELD
 * ---------------------------------------------------------------------------------------------
 * The sea already had one field of marine snow, and one field moving at one speed reads as a flat wall of dots with the
 * camera sliding past it. Four layers at four speeds is what turns that wall into a space: the eye reads the DIFFERENCE
 * in speed between them as distance, and nothing else in the scene has to change to say "this water is deep".
 *
 * The speeds are multiples of the level's own scroll (`speedFactor`), so a level that scrolls faster moves every layer
 * faster and the RELATIVE motion -- the thing the eye actually reads -- is unchanged. Near is 1.0: the closest layer
 * travels with the world, which is what anchors the other three.
 *
 * HOW A LAYER IS DRAWN
 *
 * Each layer owns a band of `tileMeters` vertically. Its motes are placed once, in world metres, and the layer is
 * OFFSET by `scrolled * speedFactor` -- so the offset is a pure function of the level's progress rather than an
 * accumulator, and it cannot drift, stall, or disagree after a teleport. Motes that fall outside the visible band are
 * wrapped by the tile height, which is what makes a finite number of particles cover an endless climb.
 */
import { Assets, Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { mech } from './mechanisms';

/** One layer's live state: its graphics and its particles, in metres. */
interface Layer {
  readonly g: Graphics;
  readonly motes: { x: number; y: number; r: number }[];
}

/**
 * The farthest layer: a hand-authored image, wrapped vertically and drifted almost not at all.
 *
 * Wrapped rather than stretched, because the water is endless and the image is not: it is drawn at `heightScreens` screen
 * heights and repeated above and below as the run climbs, so a level 1700m long is covered by one picture.
 */
export class Backdrop {
  readonly root = new Container();
  private sprite: Sprite | null = null;
  private loaded = false;
  private imageHeightMeters = 0;
  private canvasWidth = 0;
  private canvasHeight = 0;
  /** The lane's width in metres, for sizing the image across the play area rather than the whole canvas. */
  private laneWidthMeters = 0;

  constructor(private readonly spec: { image: string; speedFactor: number; heightScreens: number; alpha: number; tint: number }) {
    this.root.eventMode = 'none';
    /**
     * Loaded through Pixi's asset cache, and a failure is NOT fatal.
     *
     * A missing or corrupt backdrop must leave a playable level with its water and its parallax layers, not a black
     * screen: the picture is the farthest thing on screen, and the game cannot depend on the farthest thing.
     */
    void Assets.load<Texture>(spec.image)
      .then((texture) => {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.alpha = spec.alpha;
        sprite.tint = spec.tint;
        sprite.eventMode = 'none';
        this.root.addChild(sprite);
        this.sprite = sprite;
        this.loaded = true;
        // The canvas was already laid out before the texture arrived: size it now, or it draws at zero height.
        this.applyLayout();
      })
      .catch(() => {
        this.loaded = false;
      });
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  /** Sized against the canvas: the image spans the full width and `heightScreens` of the height. */
  layout(canvasWidth: number, canvasHeight: number, laneWidthMeters = 0): void {
    this.laneWidthMeters = laneWidthMeters;
    // Remembered as well as applied: the texture arrives ASYNCHRONOUSLY, so on the first layout there is nothing to size
    // yet -- and without remembering the canvas the sprite would sit at zero height for ever, loaded and invisible.
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.applyLayout();
  }

  /**
   * Size the sprite in WORLD METRES.
   *
   * The sprite lives in the world container, which is scaled by the camera's pixels-per-metre -- so sizing it in canvas
   * pixels (as this first did) made it a patch over part of the frame rather than a backdrop. The screen size is
   * converted once per frame in `draw`, where the camera's scale is known.
   */
  private applyLayout(): void {
    if (!this.sprite) return;
    const scale = this.sprite.texture.width > 0 ? 1 / this.sprite.texture.width : 1;
    this.sprite.scale.set(scale);
  }

  /**
   * Draw for this frame: the sprite is placed so that the image SCROLLS, and copies above and below keep the band
   * covered.
   */
  draw(scrolled: number, min: number, max: number, pixelsPerMetre: number): void {
    if (!this.sprite || this.canvasWidth <= 0 || pixelsPerMetre <= 0) return;
    // One image is `heightScreens` screens tall and the full lane wide, in world metres.
    const laneMetres = this.laneWidthMeters > 0 ? this.laneWidthMeters : this.canvasWidth / pixelsPerMetre;
    const imageMeters = (this.canvasHeight * this.spec.heightScreens) / pixelsPerMetre;
    this.sprite.width = laneMetres;
    this.sprite.height = imageMeters;
    /**
     * Centred on the LANE, not on the world origin.
     *
     * The sprite's anchor is its middle, so leaving `x` at zero put the image half a lane to the LEFT of the play area:
     * it covered the left margin and half the lane, and the rest of the water showed the level's colour instead. The
     * backdrop is a picture of where the level happens, and where the level happens is the lane.
     */
    this.sprite.x = laneMetres / 2;
    this.imageHeightMeters = imageMeters;
    /**
     * Wrapped by the image's own height, which is in METRES.
     *
     * The image is `heightScreens` of the view, so `imageMeters` is what one copy covers; the level's scroll at
     * `speedFactor` moves it, and the modulo is what turns one picture into an endless seabed. The offset is a function
     * of `scrolled` rather than an accumulator, for the same reason the parallax layers are: a teleport must not smear
     * the picture across the screen.
     */
    const span = this.imageHeightMeters;
    const t = ((scrolled * this.spec.speedFactor) % span + span) % span;
    // Drawn centred on the visible band's middle: `y = 0` is the world origin, so the picture is placed in world metres.
    const centre = (min + max) / 2 - t;
    this.sprite.y = centre;
  }
}

export class Parallax {
  readonly root = new Container();
  private readonly layers: Layer[] = [];
  /** The offset each layer is currently drawn at, in metres. Kept so a probe can prove the layers differ. */
  private offsets: number[] = [];

  constructor() {
    this.root.eventMode = 'none';
    for (let i = 0; i < mech.background.layers.length; i++) {
      const g = new Graphics();
      g.eventMode = 'none';
      this.root.addChild(g);
      this.layers.push({ g, motes: [] });
    }
  }

  /**
   * Scatter each layer's motes over one tile.
   *
   * Called on layout, because the count and the tile both depend on the lane's width in metres: a mote field authored in
   * screen fractions would thin out on a wide window and crowd on a phone.
   */
  layout(laneWidthMeters: number, visibleMeters: number): void {
    const cfg = mech.background;
    for (const [index, layer] of this.layers.entries()) {
      const row = cfg.layers[index]!;
      const tile = Math.max(40, visibleMeters * cfg.tileScreens);
      layer.motes.length = 0;
      const count = Math.round(row.count * cfg.countScale);
      for (let i = 0; i < count; i++) {
        layer.motes.push({
          x: Math.random() * laneWidthMeters,
          // Spread over TWO tiles vertically, so wrapping never leaves a visible empty band at an edge.
          y: Math.random() * tile * 2,
          // Size varies inside the layer as well as between layers: identical dots read as a texture, not as water.
          r: laneWidthMeters * row.sizeRatio * (0.6 + Math.random() * 0.8),
        });
      }
    }
  }

  /**
   * Draw the four layers for one frame.
   *
   * `scrolled` is the level's own progress in metres. Nothing is accumulated here: a layer's position is
   * `scrolled * speedFactor`, which is why a level teleport does not smear the field across the screen.
   */
  /** Test hook: each layer's current offset in metres, farthest first. */
  get layerOffsetsRef(): number[] {
    return this.offsets;
  }

  draw(scrolled: number, min: number, max: number): void {
    const cfg = mech.background;
    const visible = Math.max(1, max - min);
    const tile = Math.max(40, visible * cfg.tileScreens);
    for (const [index, layer] of this.layers.entries()) {
      const row = cfg.layers[index]!;
      const g = layer.g;
      g.clear();
      if (row.alpha <= 0.005 || row.count <= 0) continue;
      /**
       * The offset, and the wrap.
       *
       * A layer moving at `speedFactor` of the world's scroll means its motes go UP the screen at `1 - speedFactor` of
       * the apparent motion: the near layer (1.0) is nailed to the water, and the farthest (0.15) races past, which is
       * what depth looks like from inside a rising bubble.
       */
      const offset = scrolled * row.speedFactor;
      this.offsets[index] = offset;
      for (const mote of layer.motes) {
        let y = mote.y + offset;
        // Wrap into the two-tile window that is being drawn.
        y = min + (((y - min) % (tile * 2)) + tile * 2) % (tile * 2);
        const wrapped = y > max ? y - tile * 2 : y;
        if (wrapped < min - tile || wrapped > max + tile) continue;
        g.circle(mote.x, wrapped, mote.r);
      }
      g.fill({ color: row.colour, alpha: row.alpha });
    }
  }
}








