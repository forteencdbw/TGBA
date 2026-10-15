import { Container, Sprite } from 'pixi.js';
import { isYFlipped } from './assets';
import { backScaleAt, backTintAt, type BackFish, type BackSchools } from './backSchools';
import { KIND_TUNING, depthTint, hazardArtState } from './hazards';
import { mech } from './mechanisms';

/**
 * Draws the background schools: one Sprite per fish, from the same animation the foreground fish use.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT PART OF `paintHazards`
 * ---------------------------------------------------------------------------------------------
 * A background fish is not a hazard. It has no id in the field, no health, no hitbox and nothing that reads it -- it is a
 * position a `BackSchools` owns -- so the hazard painter, which walks `field.hazards`, cannot reach it, and should not:
 * everything that painter draws is something the player can be hurt by or shoot, and "this one is a picture" is the thing that
 * makes a background fish one.
 *
 * It has its own layer for the same reason: the layer sits BEHIND the obstacles' and the hazards' sprites (the game adds it
 * first, and those painters insert their sprites after it), and in front of the level's backdrop and parallax, so a
 * background school is behind everything that can hurt you rather than between it.
 *
 * Within the layer, a farther school is behind a nearer one (`zIndex`), and inside a school the far fish are behind the near
 * ones -- the order is fixed when a sprite is made, so the sort only runs when a fish is added.
 *
 * The sprites are pooled by fish and pruned when the fish is gone, which is every frame's work and costs nothing when
 * there is no school.
 */
export class BackSchoolLayer {
  readonly root = new Container();
  private readonly sprites = new Map<BackFish, Sprite>();

  constructor() {
    this.root.eventMode = 'none';
    this.root.sortableChildren = true;
  }

  /** The number of background sprites currently alive, for a probe. */
  get count(): number {
    return this.sprites.size;
  }

  paint(back: BackSchools, laneWidth: number): void {
    const art = mech.hazardArt['fish'];
    const seen = new Set<BackFish>();
    if (art) {
      // The picture's front is the kind's own: a fish is mirrored when the way it is going is not the way the front faces.
      const front = art.front ?? mech.hazardFront;
      for (const entry of back.schools.values()) {
        const variants = art.variants;
        const variant = variants && variants.length > 0 ? variants[((entry.variety % variants.length) + variants.length) % variants.length] : undefined;
        const move = variant?.move ?? art.move ?? '';
        const artScale = variant?.scale ?? art.scale ?? 1;
        // The width an ordinary fish is drawn at (`2 x radius x art scale`), times what this distance makes of it.
        const width = laneWidth * KIND_TUNING.fish.radius * 2 * artScale * backScaleAt(entry.distance);
        const distanceTint = backTintAt(entry.distance);
        for (const fish of entry.members) {
          seen.add(fish);
          const texture = move ? hazardArtState(move, fish.clock) : null;
          let sprite = this.sprites.get(fish);
          if (!texture) {
            if (sprite) sprite.visible = false;
            continue;
          }
          if (!sprite) {
            sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.eventMode = 'none';
            // Far schools first, and within a school the far fish first: a fish's own depth is 0 near to 1 far.
            sprite.zIndex = (1 - entry.distance) * 100 + (1 - fish.boid.d);
            this.root.addChild(sprite);
            this.sprites.set(fish, sprite);
          }
          // The fish's own depth inside its school dims it the way it does in the foreground; the school's distance dims the
          // whole school. Multiplied channel by channel, so a far fish at the back of a far school is the darkest thing here.
          sprite.tint = multiplyTints(depthTint(fish.boid.d), distanceTint);
          sprite.texture = texture;
          sprite.visible = true;
          sprite.x = fish.x;
          sprite.y = fish.y;
          const unit = width / texture.width;
          const goingLeft = (fish.heading || entry.school.dirX) <= 0;
          const mirror = (front === 'left') !== goingLeft ? -1 : 1;
          // The world is Y-flipped, so the picture's own Y is negative to keep it upright -- asked of the parent chain.
          sprite.scale.set(unit * mirror, isYFlipped(sprite) ? -unit : unit);
        }
      }
    }
    for (const [fish, sprite] of this.sprites) {
      if (seen.has(fish)) continue;
      sprite.destroy();
      this.sprites.delete(fish);
    }
  }
}

function multiplyTints(a: number, b: number): number {
  const channel = (shift: number): number => Math.round((((a >> shift) & 255) * ((b >> shift) & 255)) / 255);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}
