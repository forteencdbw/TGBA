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
import { Container, Graphics } from 'pixi.js';
import { mech } from './mechanisms';

/** One layer's live state: its graphics and its particles, in metres. */
interface Layer {
  readonly g: Graphics;
  readonly motes: { x: number; y: number; r: number }[];
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



