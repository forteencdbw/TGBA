/**
 * Sparks and debris: short-lived, pooled, drawn into one Graphics.
 *
 * A field rather than a per-event effect because a busy moment can produce dozens of sparks and a Sprite each would be the
 * sprite-per-frame mistake again. Particles are plain numbers in an array, capped, and recycled oldest-first.
 */
import { Graphics } from 'pixi.js';
import { mech } from './mechanisms';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  colour: number;
}

/** One thing that happened, in world coordinates, for the field to turn into particles. */
export interface HitEvent {
  x: number;
  y: number;
  /** The creature's radius in metres, so a ring is sized to the thing that broke. */
  radius: number;
  kind: 'hit' | 'defeat';
  colour: number;
}

export class ParticleField {
  readonly graphics = new Graphics();
  private readonly particles: Particle[] = [];

  constructor() {
    this.graphics.eventMode = 'none';
  }

  /** Turn an event into the right burst. */
  emit(event: HitEvent): void {
    const cfg = mech.particles;
    if (event.kind === 'hit') {
      this.burst(event, cfg.hitCount, cfg.hitSpeed, cfg.hitLife, cfg.hitSize, event.colour);
      return;
    }
    /**
     * A DEFEAT is a RING rather than a spray: the creature came apart, so the pieces leave its edge outwards at the same
     * speed. A spray of random directions reads as "it was hit again", which is the wrong sentence.
     */
    const count = cfg.defeatCount;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * cfg.defeatJitter;
      this.push(
        event.x + Math.cos(angle) * event.radius,
        event.y + Math.sin(angle) * event.radius,
        Math.cos(angle) * cfg.defeatSpeed,
        Math.sin(angle) * cfg.defeatSpeed,
        cfg.defeatLife * (0.7 + Math.random() * 0.6),
        cfg.defeatSize * (0.6 + Math.random() * 0.9),
        cfg.defeatColour,
      );
    }
  }

  private burst(event: HitEvent, count: number, speed: number, life: number, size: number, colour: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.8);
      this.push(
        event.x,
        event.y,
        Math.cos(angle) * v,
        Math.sin(angle) * v,
        life * (0.6 + Math.random() * 0.8),
        size * (0.5 + Math.random() * 1),
        colour,
      );
    }
  }

  private push(x: number, y: number, vx: number, vy: number, life: number, size: number, colour: number): void {
    // Oldest first: a burst that arrives while the field is full should cost the oldest spark, not the newest event.
    if (this.particles.length >= mech.particles.maxParticles) this.particles.shift();
    this.particles.push({ x, y, vx, vy, age: 0, life, size, colour });
  }

  update(dt: number): void {
    const drag = Math.pow(mech.particles.drag, dt * 60);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.age += dt;
      if (p.age >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // The current still carries them down, like everything else in the water.
      p.y -= mech.particles.descentSpeed * dt;
      p.vx *= drag;
      p.vy *= drag;
    }
  }

  draw(): void {
    const g = this.graphics;
    g.clear();
    for (const p of this.particles) {
      // Fades AND shrinks: one without the other reads as a solid dot that vanishes.
      const t = 1 - p.age / p.life;
      g.circle(p.x, p.y, Math.max(0.2, p.size * t)).fill({ color: p.colour, alpha: t });
    }
  }

  /** Test hook: how many particles are alive. */
  get count(): number {
    return this.particles.length;
  }
}
