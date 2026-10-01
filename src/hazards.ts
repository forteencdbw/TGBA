/**
 * Hazards (D3).
 *
 * The design rule this file follows: each hazard has a different VERB, meaning it changes the
 * player's state in a way the others do not. Four creatures that all just dealt damage would be one
 * mechanic drawn four times; the point is that being caught by each one feels different.
 *
 *   fish     CHASES and swarms  -> contact damage, and it follows you
 *   jelly    SLOWS              -> a movement penalty with a timer
 *   trash    GRABS and drags    -> an ongoing drain you have to struggle out of
 *   crab     LAUNCHES           -> fires you upward along a telegraphed arc
 *
 * Everything is procedurally drawn from geometry, so colours carry the information instead of any
 * tutorial text: purple is a jellyfish, brown is a trash bag, and so on.
 *
 * Coordinate convention, shared with the rest of the project: world metres, y measured UP from the
 * seabed. Hazards travel DOWN like collectables, but always lag the player's ascent (they never
 * outrun it), so the player closes on them and can see them coming.
 */

import { Graphics } from 'pixi.js';
import { tuning } from './config';

export type HazardKind = 'fish' | 'jelly' | 'trash' | 'crab';

/** What a hazard did to the player this frame, so the caller can react (HUD, audio, comedy). */
export interface HazardEffect {
  kind: HazardKind;
  /** Contact damage in hit-points. */
  damage?: number;
  /** Seconds of movement penalty to apply. */
  slowSeconds?: number;
  slowFactor?: number;
  /** Downward/upward world velocity to impose, in m/s. */
  impulse?: number;
  /** Ongoing drain, applied per second while the flag stays set. */
  drainPerSecond?: boolean;
  /** The player broke free / was launched / bounced it, which is a comedy beat. */
  broke: boolean;
}

/**
 * One hazard instance.
 *
 * `x` is in world metres across the lane (NOT a fraction, unlike the player) because hazards are
 * spawned at an absolute position and then move under their own rules.
 */
export interface Hazard {
  id: number;
  kind: HazardKind;
  x: number;
  y: number;
  /** Radius in metres of the lane, matching how collectables are measured relative to the player. */
  radiusFraction: number;
  /** Per-instance randomness so a group does not move in lockstep. */
  phase: number;
  seed: number;
  /** Fish: the bait bubble it is currently fooled by, if any. */
  baitedUntil: number;
  /** Jellyfish: how much it has been squashed, 0..1, purely comic. */
  squashed: number;
  /** Trash: whether it is latched onto the player. */
  gripping: boolean;
  /** Crab: seconds until it fires, and whether it has fired. */
  fuse: number;
  fired: boolean;
  /**
   * Crab: whether the player is inside its launch reach, which is what arms it.
   *
   * The fuse cannot simply run down from spawn. A hazard takes roughly twenty seconds to drift from
   * the top of the screen to the player, so a 1.2s fuse would burn out long before arrival and the
   * telegraph -- the whole reason the crab is fair -- would never be seen. It arms on proximity
   * instead.
   */
  armed: boolean;
}

/** Tunables for D3. Kept together because they are only meaningful as a set. */
export const hazardTuning = {
  /** Hazards on a screenful at the start, and the ceiling as the run goes on. */
  minActive: 2,
  maxActive: 5,
  /** Seconds between spawn attempts. */
  spawnEverySeconds: 7,
  /** Fish are faster than the player's base speed so they actually catch up. */
  fishSpeedFactor: 0.34,
  fishTurnRate: 0.9,
  /**
   * Chance a fish gives up the chase for a bait bubble it crosses.
   *
   * Well under half: this is a comedy beat that shows up occasionally, not the usual outcome. If a
   * chase usually ends with the fish wandering off, the swarm stops being a threat and the joke has
   * eaten the mechanic.
   */
  fishBaitChance: 0.25,
  fishBaitSeconds: 1.6,
  /** Jellyfish drift and bob; they barely move horizontally. */
  jellyBobAmplitude: 0.012,
  /** Trash falls slower than the water and grabs on contact. */
  trashSpeedFactor: 0.12,
  trashDrainPerSecond: 1 / 6,
  trashStruggleRelease: 0.55,
  /** Crab telegraph, then launch. The telegraph is the whole point: it is fair. */
  /**
   * The telegraph fires when the player comes within this many metres above the crab.
   *
   * Generous on purpose: it has to be visible while the player still has time to decide, and the
   * crab is the one hazard whose effect is arguably GOOD (it launches you upward), so the player
   * wants enough warning to aim at it.
   */
  crabArmDistanceMeters: 55,
  crabFuseSeconds: 1.2,
  crabLaunchMps: tuning.hazardCrabLaunchMps,
  crabApexSeconds: 1.1,
} as const;

/** Per-kind presentation and collision size, as a fraction of the lane width. */
const KIND_TUNING: Record<HazardKind, { radius: number; colour: number; spin: number }> = {
  fish: { radius: 0.035, colour: 0x9ad7ff, spin: 0 },
  jelly: { radius: 0.062, colour: 0xc79bff, spin: 0 },
  trash: { radius: 0.05, colour: 0xb08a5a, spin: 0.6 },
  crab: { radius: 0.045, colour: 0xff9b6b, spin: 0 },
};

export interface HazardContext {
  /** Visible world y range, so spawns appear just above the top of the screen. */
  min: number;
  max: number;
  laneWidth: number;
  /** The player, for chasing and contact tests. */
  playerX: number;
  playerY: number;
  playerRadiusFraction: number;
  /** The player's own ascent speed, which hazards are measured against. */
  ascentSpeed: number;
  /** Seconds since the run started, for the bait timers. */
  elapsed: number;
  /** Whether the player is currently invulnerable, in which case contact must not re-trigger. */
  invulnerable: boolean;
  /** True while the player is actively struggling (accelerating), which can tear off trash. */
  struggling: boolean;
}

/**
 * The hazard field: spawning, per-kind motion, and contact resolution.
 *
 * Kept separate from `EntityField` because the rules have almost nothing in common -- collectables
 * are passive and drift on their own, hazards are active, have state machines, and act on the player.
 * Merging them would have produced one class where half the methods apply to half the members.
 */
export class HazardField {
  hazards: Hazard[] = [];

  /**
   * Whether the fish bait reaction is active.
   *
   * Exposed so a probe can assert the CHASE deterministically: the bait beat is a chance by design,
   * and a test that has to roll the dice reads as a broken mechanic when it loses.
   */
  baitEnabled = true;

  /**
   * How many times a trash bag has latched on this run, and how many times a fish has been baited.
   *
   * Counted because both are transient: a grip can be torn off in the same frame it starts, so
   * sampling a boolean afterwards proves nothing. These are monotonic, so "did it ever happen" is
   * answerable.
   */
  grabs = 0;
  baits = 0;

  private nextId = 1;
  private spawnTimer = 0;

  reset(): void {
    this.hazards = [];
    this.spawnTimer = 0;
    this.grabs = 0;
    this.baits = 0;
  }

  update(dt: number, ctx: HazardContext): HazardEffect[] {
    const effects: HazardEffect[] = [];

    this.spawnTimer -= dt;
    const ceiling = Math.min(hazardTuning.maxActive, hazardTuning.minActive + Math.floor(ctx.elapsed / 25));
    if (this.spawnTimer <= 0) {
      this.spawnTimer = hazardTuning.spawnEverySeconds;
      if (this.hazards.length < ceiling) {
        this.hazards.push(this.spawn(ctx));
      }
    }

    for (const h of this.hazards) {
      this.advance(h, dt, ctx);
    }

    // Contact. Resolved after movement so a hazard that arrives this frame still lands.
    const playerR = ctx.laneWidth * ctx.playerRadiusFraction;
    for (const h of this.hazards) {
      const r = ctx.laneWidth * h.radiusFraction;
      const dx = h.x - ctx.playerX;
      const dy = h.y - ctx.playerY;
      const reach = playerR + r;
      const touching = dx * dx + dy * dy <= reach * reach;

      if (!touching) {
        if (h.kind === 'trash' && h.gripping) {
          // Sliding off the edge of a trash bag ends the grip, which is the forgiving case.
          h.gripping = false;
        }
        continue;
      }

      switch (h.kind) {
        case 'fish': {
          // COMEDY: a fish that crosses a bait bubble gets distracted and loses the player. This is an
          // OCCASIONAL beat, not the default outcome -- if a chase usually ends in the fish wandering
          // off, the swarm stops being a threat and the joke replaces the mechanic.
          if (this.baitEnabled && h.baitedUntil <= ctx.elapsed && Math.random() < hazardTuning.fishBaitChance) {
            h.baitedUntil = ctx.elapsed + hazardTuning.fishBaitSeconds;
            this.baits++;
            effects.push({ kind: 'fish', broke: true });
            break;
          }
          if (ctx.invulnerable || h.baitedUntil > ctx.elapsed) break;
          effects.push({ kind: 'fish', damage: 1, broke: false });
          // Bounce it away so one fish cannot immediately re-hit.
          h.y -= r * 2;
          break;
        }
        case 'jelly': {
          if (ctx.invulnerable) break;
          effects.push({ kind: 'jelly', slowSeconds: tuning.hazardSlowSeconds, slowFactor: tuning.hazardSlowFactor, broke: false });
          // COMEDY: being bunted squashes it.
          h.squashed = 1;
          h.y -= r * 1.5;
          break;
        }
        case 'trash': {
          if (!h.gripping) {
            h.gripping = true;
            this.grabs++;
            effects.push({ kind: 'trash', broke: false });
          }
          break;
        }
        case 'crab': {
          if (h.fired) break;
          // Only fires once it has actually armed and the telegraph has run. Touching an UNARMED crab
          // does nothing, which is what keeps the arc meaningful.
          if (!h.armed || h.fuse > 0) break;
          effects.push({ kind: 'crab', impulse: hazardTuning.crabLaunchMps, broke: true });
          h.fired = true;
          break;
        }
      }
    }

    // A latched trash bag drains continuously, and struggling tears it off.
    for (const h of this.hazards) {
      if (h.kind !== 'trash' || !h.gripping) continue;
      effects.push({ kind: 'trash', drainPerSecond: true, broke: false });
      if (ctx.struggling) {
        h.gripping = false;
        h.fired = true; // reused as "it popped"
        effects.push({ kind: 'trash', broke: true });
      }
    }

    // Retire what has left the working area, plus a trash bag that has been torn open.
    this.hazards = this.hazards.filter((h) => {
      const inside = h.y > ctx.min - 80 && h.y < ctx.max + 120;
      // `fired` is reused per kind: for trash it means "torn open", for a crab "already launched".
      // Neither should linger.
      const spent = h.fired && (h.kind === 'trash' || h.kind === 'crab');
      return inside && !spent;
    });

    return effects;
  }

  private spawn(ctx: HazardContext): Hazard {
    const kinds: HazardKind[] = ['fish', 'jelly', 'trash', 'crab'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)] ?? 'fish';
    const radiusFraction = KIND_TUNING[kind].radius;
    const margin = ctx.laneWidth * radiusFraction * 1.4;
    return {
      id: this.nextId++,
      kind,
      x: margin + Math.random() * Math.max(0.01, ctx.laneWidth - margin * 2),
      /**
       * Appear ABOVE the view so the player always watches it enter.
       *
       * Deliberately NOT clamped to DEPTH_TOTAL. Near the seabed the top of the view is already close
       * to the level's ceiling, so clamping made hazards materialise in the middle of the screen --
       * the same trap that once piled the collectable seeding into one band. Anything above the play
       * area simply arrives later.
       */
      y: ctx.max + 20 + Math.random() * 40,
      radiusFraction,
      phase: Math.random() * Math.PI * 2,
      seed: Math.random() * 1000,
      baitedUntil: 0,
      squashed: 0,
      gripping: false,
      fuse: hazardTuning.crabFuseSeconds,
      fired: false,
      armed: false,
    };
  }

  /**
   * Per-kind motion.
   *
   * All of them travel DOWN relative to the player, but none outruns the ascent: a hazard the player
   * cannot see coming is not a hazard, it is a coin flip.
   */
  private advance(h: Hazard, dt: number, ctx: HazardContext): void {
    h.phase += dt;
    const base = ctx.ascentSpeed;

    switch (h.kind) {
      case 'fish': {
        // The bait timer is the only thing that breaks the chase.
        if (h.baitedUntil > ctx.elapsed) {
          // Wander: drift sideways away from the player.
          h.x += Math.sign(h.x - ctx.playerX) * 6 * dt;
          h.y -= base * 0.5 * dt;
          break;
        }
        // Chase: steer toward the player horizontally, and close vertically.
        const dx = ctx.playerX - h.x;
        const steer = Math.max(-1, Math.min(1, dx / Math.max(1, ctx.laneWidth * 0.25)));
        h.x += steer * ctx.laneWidth * hazardTuning.fishSpeedFactor * dt;
        h.y -= base * 0.55 * dt;
        break;
      }
      case 'jelly': {
        // Drifts down slowly and bobs. It is an obstacle, not a pursuer.
        const bob = Math.sin(h.phase * 1.4 + h.seed) * hazardTuning.jellyBobAmplitude * ctx.laneWidth;
        h.x += (Math.cos(h.phase * 0.7) * 0.4 + bob * 0.02) * 6 * dt;
        h.y -= base * 0.3 * dt;
        h.squashed = Math.max(0, h.squashed - dt * 2.2);
        break;
      }
      case 'trash': {
        // Barely moves; it is debris. On contact it is dragged along by the player instead.
        if (h.gripping) {
          h.x = ctx.playerX;
          h.y = ctx.playerY;
        } else {
          h.y -= base * hazardTuning.trashSpeedFactor * dt;
          h.x += Math.sin(h.phase * 1.1 + h.seed) * 4 * dt;
        }
        break;
      }
      case 'crab': {
        // Two-phase: it drifts harmlessly until the player enters its reach, THEN telegraphs. See
        // `armed`. Firing on a fuse that ran from spawn would mean the visible arc never coincides
        // with the player being close enough to care.
        h.y -= base * 0.18 * dt;
        const proximity = h.y < ctx.playerY + hazardTuning.crabArmDistanceMeters;
        if (!h.armed && proximity) {
          h.armed = true;
          h.fuse = hazardTuning.crabFuseSeconds;
        }
        if (h.armed) h.fuse = Math.max(0, h.fuse - dt);
        break;
      }
    }

    h.x = Math.max(0, Math.min(ctx.laneWidth, h.x));
  }
}

/**
 * Draw the hazards.
 *
 * Procedural geometry only, and each kind is recognisable by SHAPE before colour: a fish is a
 * tapered blob with a tail, a jellyfish is a dome with trailing tentacles, a trash bag is an angular
 * sack, a crab is a wide body with legs. Colour then reinforces it.
 */
export function paintHazards(g: Graphics, field: HazardField, laneWidth: number, elapsed: number): void {
  for (const h of field.hazards) {
    const r = laneWidth * h.radiusFraction;
    const x = h.x;
    const y = h.y;

    switch (h.kind) {
      case 'fish': {
        // Facing its direction of travel; the tail trails behind.
        const dir = Math.sign(h.x - 0) || 1;
        g.ellipse(x, y, r * 1.5, r * 0.75).fill({ color: KIND_TUNING.fish.colour, alpha: 0.85 });
        g.moveTo(x - dir * r * 1.3, y)
          .lineTo(x - dir * r * 2.2, y - r * 0.6)
          .lineTo(x - dir * r * 2.2, y + r * 0.6)
          .closePath()
          .fill({ color: KIND_TUNING.fish.colour, alpha: 0.6 });
        // A baited fish gets a blank stare: no eye, just a dot.
        if (h.baitedUntil > elapsed) {
          g.circle(x + dir * r * 0.5, y - r * 0.15, r * 0.16).fill({ color: 0xffffff, alpha: 0.9 });
        } else {
          g.circle(x + dir * r * 0.7, y - r * 0.1, r * 0.2).fill({ color: 0x08131f, alpha: 0.9 });
        }
        break;
      }
      case 'jelly': {
        const squash = 1 + h.squashed * 0.5;
        g.ellipse(x, y, r * squash, r * (1 / squash)).fill({ color: KIND_TUNING.jelly.colour, alpha: 0.55 });
        g.ellipse(x, y, r * squash, r * (1 / squash)).stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.95, width: Math.max(1, r * 0.12) });
        // Tentacles trail DOWNWARD behind it.
        for (let i = -2; i <= 2; i++) {
          const tx = x + (i / 2) * r * 0.6;
          const wob = Math.sin(h.phase * 2.4 + i) * r * 0.35;
          g.moveTo(tx, y + r * 0.8)
            .lineTo(tx + wob, y + r * 2.3)
            .stroke({ color: KIND_TUNING.jelly.colour, alpha: 0.5, width: Math.max(1, r * 0.1) });
        }
        break;
      }
      case 'trash': {
        const spin = Math.sin(h.phase * 0.9 + h.seed) * 0.25;
        g.moveTo(x - r, y + r * (0.6 + spin))
          .lineTo(x + r * 0.9, y + r * (0.8 - spin))
          .lineTo(x + r * 0.7, y - r * 0.9)
          .lineTo(x - r * 0.8, y - r * 0.7)
          .closePath()
          .fill({ color: KIND_TUNING.trash.colour, alpha: 0.7 });
        g.moveTo(x - r * 0.6, y - r * 0.6)
          .lineTo(x + r * 0.5, y - r * 0.5)
          .stroke({ color: 0x6d5232, alpha: 0.8, width: Math.max(1, r * 0.14) });
        break;
      }
      case 'crab': {
        // TELEGRAPH FIRST: a visible arc showing exactly where the player will be thrown.
        if (h.fuse > 0) {
          const progress = 1 - h.fuse / hazardTuning.crabFuseSeconds;
          const arcTop = y + hazardTuning.crabLaunchMps * hazardTuning.crabApexSeconds * progress;
          g.moveTo(x, y)
            .quadraticCurveTo(x, (y + arcTop) / 2 + r * 3, x, arcTop)
            .stroke({ color: 0xffd479, alpha: 0.15 + progress * 0.5, width: Math.max(1, r * 0.18) });
          // Sand puffs while it winds up.
          for (let i = 0; i < 3; i++) {
            const p = (h.phase * 1.8 + i * 0.33) % 1;
            g.circle(x + Math.sin(i * 2.1) * r * 1.4, y - r * 0.5 - p * r * 2.2, r * (0.16 + p * 0.2)).fill({
              color: 0xd9c39a,
              alpha: 0.3 * (1 - p),
            });
          }
        }
        g.ellipse(x, y, r * 1.35, r * 0.95).fill({ color: KIND_TUNING.crab.colour, alpha: 0.9 });
        // Claws, plus legs that flail after firing.
        const flail = h.fired ? Math.sin(elapsed * 14) * 0.6 : 0;
        for (const side of [-1, 1]) {
          g.circle(x + side * r * 1.35, y - r * 0.3, r * 0.4).stroke({ color: KIND_TUNING.crab.colour, alpha: 0.9, width: Math.max(1, r * 0.16) });
          for (let i = -1; i <= 1; i++) {
            g.moveTo(x + side * r * 0.9, y + r * 0.5)
              .lineTo(x + side * r * 1.7, y + r * (1.1 + i * 0.3) + flail * r * 0.6)
              .stroke({ color: KIND_TUNING.crab.colour, alpha: 0.75, width: Math.max(1, r * 0.13) });
          }
        }
        break;
      }
    }
  }
}

// NOTE: a slow effect has to be legible ON THE PLAYER, not in a status bar. Ringing the bubble while
// it lasts is the cheapest honest way to show "you are still slowed", so the caller draws that
// around the bubble rather than this function painting something at the origin.
