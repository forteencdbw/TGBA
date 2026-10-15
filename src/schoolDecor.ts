import { Container, Sprite } from 'pixi.js';
import { isYFlipped } from './assets';
import type { DecorFish } from './boids';
import { KIND_TUNING, hazardArtState, type HazardField } from './hazards';
import { mech } from './mechanisms';

/**
 * Draws the harmless background fish of every school: one Sprite each, from the same animation the real fish use.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT PART OF `paintHazards`
 * ---------------------------------------------------------------------------------------------
 * A decor fish is not a hazard. It has no id in the field, no health, no hitbox and nothing that reads it -- it is a
 * position the school owns (`School.decor`) -- so the hazard painter, which walks `field.hazards`, cannot reach it, and
 * should not: everything it draws is something the player can be hurt by or shoot, and "this one is a picture" is the
 * thing that makes a decor fish a decor fish.
 *
 * It has its own layer for the same reason: the layer sits BEHIND the hazards' sprites (the game adds it first, and the
 * hazard painter inserts its sprites after it), so the background is behind the fish that can hurt you rather than
 * between them.
 *
 * The sprites are pooled by fish and pruned when the fish is gone, which is every frame's work and costs nothing when
 * there is no school.
 */
export class SchoolDecor {
  readonly root = new Container();
  private readonly sprites = new Map<DecorFish, Sprite>();

  constructor() {
    this.root.eventMode = 'none';
  }

  /** The number of decor sprites currently alive, for a probe. */
  get count(): number {
    return this.sprites.size;
  }

  paint(field: HazardField, laneWidth: number): void {
    const cfg = mech.hazards.boids.decor;
    const art = mech.hazardArt['fish'];
    const seen = new Set<DecorFish>();
    if (art) {
      for (const school of field.schools.values()) {
        const variants = art.variants;
        const variant = variants && variants.length > 0 ? variants[((school.variety % variants.length) + variants.length) % variants.length] : undefined;
        const move = variant?.move ?? art.move ?? '';
        const artScale = variant?.scale ?? art.scale ?? 1;
        // The same width the real fish are drawn at, times the decor's own multiplier: `2 x radius x art scale`.
        const width = laneWidth * KIND_TUNING.fish.radius * 2 * artScale * cfg.scale;
        // The picture's front is the kind's own, and the school as a whole decides which way it is going: a decor fish
        // does not turn on its own, which is what a school that is all pointing one way is.
        const front = art.front ?? mech.hazardFront;
        const goingLeft = school.dirX <= 0;
        const mirror = (front === 'left') !== goingLeft ? -1 : 1;
        for (const fish of school.decor) {
          seen.add(fish);
          const texture = move ? hazardArtState(move, school.elapsed + school.exitElapsed + fish.clock) : null;
          let sprite = this.sprites.get(fish);
          if (!texture) {
            if (sprite) sprite.visible = false;
            continue;
          }
          if (!sprite) {
            sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.eventMode = 'none';
            sprite.alpha = cfg.alpha;
            sprite.tint = cfg.tint;
            this.root.addChild(sprite);
            this.sprites.set(fish, sprite);
          }
          sprite.texture = texture;
          sprite.visible = true;
          sprite.x = fish.x;
          sprite.y = fish.y;
          const unit = width / texture.width;
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
