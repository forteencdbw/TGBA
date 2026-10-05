import { mech } from './mechanisms';

export interface FlockAgent {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * One school. Agents are added by whoever spawns the creatures and steered here.
 */
export class Flock {
  readonly agents: FlockAgent[] = [];
  /** Where the school is heading, moved on a slow random walk so the group travels rather than orbits. */
  private targetX: number;
  private targetY: number;
  private readonly seed: number;

  constructor(
    readonly id: string,
    private readonly cfg: { separation: number; alignment: number; cohesion: number; speed: number; sight: number; wander: number },
    x: number,
    y: number,
  ) {
    this.targetX = x;
    this.targetY = y;
    this.seed = Math.random() * 1000;
  }

  add(x: number, y: number): FlockAgent {
    const agent: FlockAgent = { x, y, vx: 0, vy: 0 };
    this.agents.push(agent);
    return agent;
  }

  /**
   * Advance every agent by one step.
   *
   * `bounds` is the visible band in world metres: the school is steered back when it wanders out of it, because a flock that
   * leaves the screen is a flock nobody sees, and the water is far bigger than the window.
   */
  update(dt: number, laneWidth: number, min: number, max: number, elapsed: number): void {
    const cfg = this.cfg;
    const flare = mech.flocks.targetDriftMeters;
    // The wander target drifts on its own clock, so the school changes direction over seconds rather than every frame.
    this.targetX = laneWidth * (0.5 + 0.4 * Math.sin(elapsed * cfg.wander + this.seed));
    this.targetY = (min + max) / 2 + flare * Math.sin(elapsed * cfg.wander * 0.7 + this.seed * 1.7);

    for (const a of this.agents) {
      let sepX = 0;
      let sepY = 0;
      let aliX = 0;
      let aliY = 0;
      let cohX = 0;
      let cohY = 0;
      let neighbours = 0;
      for (const b of this.agents) {
        if (b === a) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > cfg.sight * cfg.sight) continue;
        neighbours += 1;
        aliX += b.vx;
        aliY += b.vy;
        cohX += b.x;
        cohY += b.y;
        // Weighted by 1/d so a neighbour on top of this one pushes hardest.
        const d = Math.max(0.001, Math.sqrt(d2));
        sepX -= (dx / d) * (cfg.sight / d);
        sepY -= (dy / d) * (cfg.sight / d);
      }
      let ax = sepX * cfg.separation;
      let ay = sepY * cfg.separation;
      if (neighbours > 0) {
        ax += ((aliX / neighbours) - a.vx) * cfg.alignment;
        ay += ((aliY / neighbours) - a.vy) * cfg.alignment;
        ax += ((cohX / neighbours) - a.x) * cfg.cohesion;
        ay += ((cohY / neighbours) - a.y) * cfg.cohesion;
      }
      // Somewhere to be going.
      ax += (this.targetX - a.x) * mech.flocks.targetPull;
      ay += (this.targetY - a.y) * mech.flocks.targetPull;
      // Out of the band: steer back, hard, so the school cannot drain away at an edge.
      if (a.y < min) ay += (min - a.y) * mech.flocks.boundsPull;
      if (a.y > max) ay += (max - a.y) * mech.flocks.boundsPull;
      if (a.x < 0) ax += -a.x * mech.flocks.boundsPull;
      if (a.x > laneWidth) ax += (laneWidth - a.x) * mech.flocks.boundsPull;

      a.vx += ax * dt;
      a.vy += ay * dt;
      /**
       * SPEED IS CAPPED, not just steered.
       *
       * Steering alone lets a school that has been accelerating for a while outrun the camera, and the cap is what keeps the
       * fish looking like fish rather than like a scattering of dots.
       */
      const speed = Math.hypot(a.vx, a.vy);
      const limit = cfg.speed * mech.flocks.speedScale;
      if (speed > limit) {
        a.vx = (a.vx / speed) * limit;
        a.vy = (a.vy / speed) * limit;
      }
      a.x += a.vx * dt;
      // The current still carries the school down, like everything else in the water.
      a.y += a.vy * dt - mech.flocks.descentSpeed * dt;
    }
  }
}

/** Every live school, by the id the level gave it. */
export const FLOCKS = new Map<string, Flock>();

/** Look a school up, creating it on first use at the given spot. */
export function flockFor(id: string, x: number, y: number): Flock {
  const existing = FLOCKS.get(id);
  if (existing) return existing;
  const cfg = mech.flocks.schools[id] ?? mech.flocks.schools['default']!;
  const flock = new Flock(id, cfg, x, y);
  FLOCKS.set(id, flock);
  return flock;
}

/** Forget every school: a new level starts with new water. */
export function clearFlocks(): void {
  FLOCKS.clear();
}
