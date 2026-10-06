/**
 * The bubble animation that follows a charging creature.
 *
 * ONE sprite per charging creature (see \`count\` in the config if that ever needs to be a cluster), glued to it every frame and
 * walked through its sheet -- the sheet is a LOOP played by the sprite, not a sequence of particles emitted into the water.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT RIDES INSTEAD OF BEING EMITTED
 * ---------------------------------------------------------------------------------------------
 * The first version spawned a bubble every few milliseconds and let each one live out the six frames where it was born. That
 * reads as a row of still images: the sheet's own animation is a progress bar for one bubble's life, so six bubbles born a
 * frame apart are all showing *different* frames of the sheet at the same instant, which is not an animation at all. Pinned to
 * the creature, the same six frames in the same order are one thing moving -- a wake.
 *
 * Sprites are pooled by creature id, and a creature that stops charging loses its sprite the next frame.
 */
import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { assetUrl, isYFlipped } from './assets';
import { mech } from './mechanisms';

interface Rider {
  /** One bubble per entry in \`count\`; index 0 is the one directly behind the creature. */
  sprites: Sprite[];
  /** Seconds of animation so far, so the frame advances with time rather than with frames rendered. */
  clock: number;
  /** Whether this rider was asked for during the frame being drawn. */
  seen: boolean;
  /** Per-bubble constants, rolled once: a bubble that changed place every frame would look like boiling, not like a wake. */
  jitter: number[];
  sizeMul: number[];
}

export class ChargeTrail {
  readonly root = new Container();
  private readonly textures: Texture[] = [];
  private readonly riders = new Map<number, Rider>();
  private loading = false;
  private ready = false;

  constructor() {
    this.root.eventMode = 'none';
  }

  private ensureTextures(): void {
    if (this.ready || this.loading) return;
    const cfg = mech.chargeTrail;
    if (!cfg.image) return;
    const url = assetUrl(cfg.image);
    if (!url) return;
    this.loading = true;
    const image = new Image();
    image.onload = () => {
      void image
        .decode()
        .then(() => {
          const sheet = Texture.from(image);
          if (sheet.width <= 0) return;
          const fw = Math.floor(sheet.width / Math.max(1, cfg.columns));
          const fh = Math.floor(sheet.height / Math.max(1, cfg.rows));
          for (let i = 0; i < cfg.columns * cfg.rows; i++) {
            const col = i % cfg.columns;
            const row = Math.floor(i / cfg.columns);
            this.textures.push(new Texture({ source: sheet.source, frame: new Rectangle(col * fw, row * fh, fw, fh) }));
          }
          this.ready = this.textures.length > 0;
        })
        .catch(() => console.warn('[chargeTrail] could not decode ' + cfg.image));
    };
    image.onerror = () => console.warn('[chargeTrail] could not load ' + cfg.image);
    image.src = url;
  }

  /**
   * Put this creature's bubble behind it and advance the animation. Call once per frame while it charges.
   *
   * \`dirX\`/\`dirY\` is a unit vector along the DASH, not the creature's velocity: a charge steers along its curve, and the wake
   * should trail the geometry the player sees. \`laneWidth\` sizes the bubble as a fraction of the lane, like every other prop
   * in the water.
   */
  ride(id: number, x: number, y: number, dt: number, laneWidth: number, dirX = 0, dirY = 0): void {
    const cfg = mech.chargeTrail;
    this.ensureTextures();
    if (!this.ready) return;
    let rider = this.riders.get(id);
    if (!rider) {
      const count = Math.max(1, Math.round(cfg.count));
      const sprites: Sprite[] = [];
      for (let i = 0; i < count; i++) {
        const sprite = new Sprite(this.textures[i % this.textures.length]!);
        sprite.anchor.set(0.5);
        sprite.eventMode = 'none';
        this.root.addChild(sprite);
        sprites.push(sprite);
      }
      rider = {
        sprites,
        clock: 0,
        seen: true,
        jitter: sprites.map(() => (Math.random() - 0.5) * cfg.jitter),
        sizeMul: sprites.map((_, i) => 1 + (Math.random() - 0.5) * cfg.scaleVariance - i * cfg.sizeFalloff),
      };
      this.riders.set(id, rider);
    }
    rider.seen = true;
    rider.clock += dt;
    const per = Math.max(0.01, cfg.frameSeconds);
    const size = laneWidth * cfg.sizeRatio;
    /**
     * Behind the creature, fanning outwards.
     *
     * With \`count\` at its default of 1 this is simply "back along the dash by \`behindFactor\` of the bubble's own size"; the
     * fan is what makes a cluster of several bubbles read as churned water rather than as several bubbles in a row.
     */
    const baseAngle = Math.atan2(-dirY, -dirX);
    const flipped = isYFlipped(this.root);
    for (const [i, sprite] of rider.sprites.entries()) {
      /**
       * Looping, because the sheet runs round for as long as the dash does.
       *
       * The index is FLOORED and the reason is worth keeping: a fractional index makes \`this.textures[1.2]\` undefined, and the
       * first frame of the wake threw. A frame index is a whole number or it is a bug.
       */
      const frame = this.textures[Math.floor(rider.clock / per) % this.textures.length]!;
      sprite.texture = frame;
      const bubbleSize = size * rider.sizeMul[i]!;
      const back = bubbleSize * cfg.behindFactor * (1 + i * cfg.spread);
      const angle = baseAngle + rider.jitter[i]!;
      sprite.visible = true;
      sprite.x = x + Math.cos(angle) * back;
      sprite.y = y - Math.sin(angle) * back;
      sprite.alpha = cfg.alpha;
      const scale = bubbleSize / Math.max(1, frame.width);
      // The world is Y-flipped, so the sprite's own Y is negative to keep the art upright. See the player bubble.
      sprite.scale.set(scale, flipped ? -Math.abs(scale) : Math.abs(scale));
    }
  }

  /**
   * Retire the riders that were not asked for this frame.
   *
   * Called after the hazards have had their chance: a creature that stopped charging, or that left the water, drops its bubble
   * instead of leaving one frozen mid-screen.
   */
  sweep(): void {
    for (const [id, rider] of this.riders) {
      if (rider.seen) {
        rider.seen = false;
        continue;
      }
      for (const sprite of rider.sprites) {
        sprite.visible = false;
        this.root.removeChild(sprite);
        sprite.destroy();
      }
      this.riders.delete(id);
    }
  }

  /** Test hook: one rider's sprite, for measuring where it sits relative to its creature. */
  riderForTest(id: number): { x: number; y: number; width: number } | null {
    const sprite = this.riders.get(id)?.sprites[0];
    return sprite ? { x: sprite.x, y: sprite.y, width: sprite.width } : null;
  }

  /** Test hook: how many creatures are carrying a bubble, and whether the sheet arrived. */
  get state(): { live: number; frames: number } {
    return { live: this.riders.size, frames: this.textures.length };
  }
}
