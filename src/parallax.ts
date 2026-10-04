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
  /** Two copies of the image, so the wrap can never show a gap: together they are 2.3 screens tall. */
  private sprites: Sprite[] = [];
  private loaded = false;
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
        for (let i = 0; i < 2; i++) {
          const sprite = new Sprite(texture);
          // Anchored at its top edge and centred horizontally: the scroll offset is then the image's top, which is the
          // simplest thing to wrap.
          sprite.anchor.set(0.5, 0);
          sprite.alpha = spec.alpha;
          sprite.tint = spec.tint;
          sprite.eventMode = 'none';
          this.root.addChild(sprite);
          this.sprites.push(sprite);
        }
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
    if (this.sprites.length === 0) return;
  }

  /**
   * Draw for this frame: the sprite is placed so that the image SCROLLS, and copies above and below keep the band
   * covered.
   */
  draw(scrolled: number, pixelsPerMetre: number): void {
    if (this.sprites.length === 0 || this.canvasWidth <= 0 || pixelsPerMetre <= 0) return;
    /**
     * SCREEN space, because the backdrop draws BEHIND the water.
     *
     * The water gradient is a screen-space fill, so anything behind it has to be screen-space too -- a world-space
     * sprite would be transformed by the camera and slide out from under it. Everything below is therefore in pixels:
     * the lane the picture spans, the height it spans, and the scroll converted once through pixels-per-metre.
     */
    const lanePx = this.laneWidthMeters > 0 ? this.laneWidthMeters * pixelsPerMetre : this.canvasWidth;
    const imagePx = this.canvasHeight * this.spec.heightScreens;
    // (no longer needed in world metres: the backdrop and the water are both in screen space now)
    /**
     * TWO copies, `imagePx` apart, wrapped by one image height.
     *
     * One copy cannot cover the window on its own: the wrap moves its top edge across a whole image height, so for part
     * of every cycle the window reaches past its bottom edge. Two, offset by exactly that height, always cover it.
     */
    const span = imagePx;
    const t = ((scrolled * this.spec.speedFactor * pixelsPerMetre) % span + span) % span;
    for (const [i, sprite] of this.sprites.entries()) {
      sprite.width = lanePx;
      sprite.height = imagePx;
      sprite.x = this.canvasWidth / 2;
      // The world moves DOWN as the run climbs, so the picture does too. Copy 0 starts at the offset, copy 1 one image
      // above it.
      sprite.y = t - i * span;
    }
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










