/**
 * The bubble animation that rides along with a charging creature.
 *
 * ONE sprite per charging creature, moved to it every frame and cycled through the sheet -- not a trail of bubbles left behind,
 * because a trail that stays put is a trail of afterimages. The parenthetical distinction is the whole design: the sheet is a
 * LOOP played on the creature, not a particle emitted by it.
 *
 * Sprites are pooled by creature id, and a creature that stops charging loses its sprite the next frame.
 */
import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { assetUrl } from './assets';
import { mech } from './mechanisms';

interface Rider {
  /** The cluster: one bubble each, with its own steady offsets so the group does not shimmer frame to frame. */
  sprites: Sprite[];
  /** Seconds of animation so far, so the frame advances with time rather than with frames rendered. */
  clock: number;
  /** Whether this rider was asked for during the frame being drawn. */
  seen: boolean;
  /** Per-bubble constants, rolled once: a bubble that changed place every frame would look like boiling, not like a wake. */
  jitter: number[];
  sizeMul: number[];
  phase: number[];
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
   * Put this creature's bubble at its position and advance its animation. Call once per frame while it charges.
   *
   * \`laneWidth\` sizes the bubble as a fraction of the lane, like every other prop in the water.
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
        // Staggered through the sheet, so the group is never all on the same frame.
        phase: sprites.map((_, i) => (i / count) * this.textures.length),
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
     * A unit direction is passed in rather than computed here, because the creature's VELOCITY is not the same thing as the
     * dash's direction -- a charge steers along its curve, and the wake should trail the geometry the player sees.
     */
    const baseAngle = Math.atan2(-dirY, -dirX);
    const flipped = rider.sprites[0]?.parent ? (rider.sprites[0]!.parent!.scale.y < 0) : true;
    for (const [i, sprite] of rider.sprites.entries()) {
      // Looping, because "轮播" is what was asked for: the sheet runs round for as long as the dash does.
      /**
       * Both terms are FLOORED, and the reason is worth keeping: the stagger is a fraction of the sheet, so adding it raw made
       * the index fractional -- `this.textures[1.2]` is undefined, and the first frame of the wake threw. A frame index is a
       * whole number or it is a bug.
       */
      const index = (Math.floor(rider.clock / per) + Math.floor(rider.phase[i]!)) % this.textures.length;
      const frame = this.textures[index]!;
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
   * instead of leaving one frozen mid-screen -- which is the afterimage bug in its original form.
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

