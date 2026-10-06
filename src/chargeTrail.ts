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
  sprite: Sprite;
  /** Seconds of animation so far, so the frame advances with time rather than with frames rendered. */
  clock: number;
  /** Whether this rider was asked for during the frame being drawn. */
  seen: boolean;
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
  ride(id: number, x: number, y: number, dt: number, laneWidth: number): void {
    const cfg = mech.chargeTrail;
    this.ensureTextures();
    if (!this.ready) return;
    let rider = this.riders.get(id);
    if (!rider) {
      const sprite = new Sprite(this.textures[0]!);
      sprite.anchor.set(0.5);
      sprite.eventMode = 'none';
      this.root.addChild(sprite);
      rider = { sprite, clock: 0, seen: true };
      this.riders.set(id, rider);
    }
    rider.seen = true;
    rider.clock += dt;
    // Looping, because "轮播" is what was asked for: the sheet runs round for as long as the dash does.
    const per = Math.max(0.01, cfg.frameSeconds);
    const index = Math.floor(rider.clock / per) % this.textures.length;
    const frame = this.textures[index]!;
    rider.sprite.texture = frame;
    rider.sprite.visible = true;
    rider.sprite.x = x;
    rider.sprite.y = y;
    rider.sprite.alpha = cfg.alpha;
    const size = laneWidth * cfg.sizeRatio;
    const scale = size / Math.max(1, frame.width);
    // The world is Y-flipped, so the sprite's own Y is negative to keep the art upright. See the player bubble.
    const flipped = rider.sprite.parent ? rider.sprite.parent.scale.y < 0 : true;
    rider.sprite.scale.set(scale, flipped ? -Math.abs(scale) : Math.abs(scale));
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
      rider.sprite.visible = false;
      this.root.removeChild(rider.sprite);
      rider.sprite.destroy();
      this.riders.delete(id);
    }
  }

  /** Test hook: how many creatures are carrying a bubble, and whether the sheet arrived. */
  get state(): { live: number; frames: number } {
    return { live: this.riders.size, frames: this.textures.length };
  }
}
