/**
 * Trail bubbles: pooled sprites that play a short frame sequence and fade.
 *
 * Pooled, like every other effect here, because a charge lasts half a second and spawns a dozen bubbles: one Sprite per event
 * would be the sprite-per-frame mistake again. Oldest-first recycling means a busy moment costs the oldest bubble rather than
 * the newest event.
 */
import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { assetUrl } from './assets';
import { mech } from './mechanisms';

interface Live {
  sprite: Sprite;
  age: number;
}

export class ChargeTrail {
  readonly root = new Container();
  private readonly textures: Texture[] = [];
  private readonly pool: Sprite[] = [];
  private readonly live: Live[] = [];
  private sheet: Texture | null = null;
  private loading = false;
  /** Seconds since the last bubble, so the emission rate is a rate rather than a per-frame count. */
  private sinceLast = 0;

  constructor() {
    this.root.eventMode = 'none';
  }

  /** Cut the sheet into frames, once. */
  private ensureTextures(): void {
    if (this.sheet || this.loading) return;
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
          const count = Math.max(1, cfg.columns) * Math.max(1, cfg.rows);
          for (let i = 0; i < count; i++) {
            const col = i % cfg.columns;
            const row = Math.floor(i / cfg.columns);
            this.textures.push(
              new Texture({ source: sheet.source, frame: new Rectangle(col * fw, row * fh, fw, fh) }),
            );
          }
          this.sheet = sheet;
        })
        .catch(() => console.warn('[chargeTrail] could not decode ' + cfg.image));
    };
    image.onerror = () => console.warn('[chargeTrail] could not load ' + cfg.image);
    image.src = url;
  }

  /**
   * Ask for a bubble at a world position. Rate-limited, so the caller can call it every frame of a charge.
   */
  emit(x: number, y: number, dt: number, laneWidth: number): void {
    const cfg = mech.chargeTrail;
    this.ensureTextures();
    if (this.textures.length === 0) return;
    this.sinceLast += dt;
    const gap = 1 / Math.max(0.1, cfg.perSecond);
    if (this.sinceLast < gap) return;
    this.sinceLast = 0;
    const sprite = this.pool.pop() ?? this.newSprite();
    sprite.visible = true;
    sprite.texture = this.textures[0]!;
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = cfg.alpha;
    const size = laneWidth * cfg.sizeRatio;
    const frame = this.textures[0]!;
    const scale = size / Math.max(1, frame.width);
    // The world is Y-flipped; the sheet is drawn upright by negating the sprite's own Y. See the player bubble.
    const flipped = sprite.parent ? sprite.parent.scale.y < 0 : true;
    sprite.scale.set(scale, flipped ? -Math.abs(scale) : Math.abs(scale));
    this.live.push({ sprite, age: 0 });
  }

  private newSprite(): Sprite {
    const sprite = new Sprite();
    sprite.anchor.set(0.5);
    sprite.eventMode = 'none';
    this.root.addChild(sprite);
    this.pool.push(sprite);
    return this.pool.pop()!;
  }

  update(dt: number): void {
    const cfg = mech.chargeTrail;
    for (let i = this.live.length - 1; i >= 0; i--) {
      const item = this.live[i]!;
      item.age += dt;
      const t = item.age / Math.max(0.01, cfg.lifeSeconds);
      if (t >= 1) {
        item.sprite.visible = false;
        this.pool.push(item.sprite);
        this.live.splice(i, 1);
        continue;
      }
      // Frames play once across the life, then the bubble fades out.
      const frameIndex = Math.min(this.textures.length - 1, Math.floor(t * this.textures.length));
      item.sprite.texture = this.textures[frameIndex]!;
      item.sprite.alpha = cfg.alpha * (1 - t);
    }
  }

  /** Test hook: how many bubbles are alive, and whether the sheet arrived. */
  get state(): { live: number; frames: number } {
    return { live: this.live.length, frames: this.textures.length };
  }
}
