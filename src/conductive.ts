/**
 * The conductive chain: which creatures one discharge reaches.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS IS, AND WHY IT IS A MODULE RATHER THAN A BLOCK IN THE GAME
 * ---------------------------------------------------------------------------------------------
 * Level 3's signature: a charged bubble ignites the nearest zapper, and the discharge then JUMPS from zapper to zapper
 * through `jumpMeters`, up to `maxTargets`. So one mechanic is three things at once -- the danger (a charged bubble
 * detonates the shoal around you), the weapon (charge on purpose and blow the group up) and the route puzzle (aim the
 * electricity at a tentacle blocking the way).
 *
 * It is here because it is a RULE and nothing else: it takes the bodies in the water and a point, and answers with the
 * bodies that were reached. That was a block inside `Game.updateConductiveCharge`, where the only way to ask "what does
 * this arrangement do" was to build a whole level, charge a bubble and watch -- which is why the mechanic shipped with a
 * note saying it had never been measured.
 *
 * Breadth-first from the nearest in-range zapper, so the chain is a spreading EVENT rather than a list of unrelated hits,
 * and so the order it spreads in is the order the water is arranged in.
 */
import type { Hazard } from './hazards';

/**
 * The three numbers the chain needs, named rather than taken as the whole charge config.
 *
 * A deep interface: `{ rangeMeters, jumpMeters, maxTargets }` is everything a caller has to know to say what the chain
 * does, and the other eight values in `hazards.charge` (how fast it builds, what it looks like, what it costs) are
 * somebody else's business.
 */
export interface ChainConfig {
  /** How close the bubble has to be to a zapper for a discharge to start at it. */
  rangeMeters: number;
  /** How far the discharge jumps from one zapper to the next. */
  jumpMeters: number;
  /** The ceiling on how many creatures one discharge reaches, including the one it starts at. */
  maxTargets: number;
}

/**
 * The ids the discharge reached, starting with the zapper nearest the bubble.
 *
 * Empty when nothing is in range, which is the caller's "no discharge happened" -- a Set rather than a list because the
 * damage pass walks the water in its own order and asks membership, and because the count is what the message says.
 */
export function chainTargets(
  hazards: readonly Hazard[],
  from: { x: number; y: number },
  cfg: ChainConfig,
): Set<number> {
  const reachable = hazards.filter((h) => h.kind === 'zapper' && !h.flee);
  const origin = reachable
    .map((h) => ({ h, d: Math.hypot(h.x - from.x, h.y - from.y) }))
    .filter((e) => e.d <= cfg.rangeMeters)
    .sort((a, b) => a.d - b.d)[0];
  const reached = new Set<number>();
  if (!origin) return reached;

  reached.add(origin.h.id);
  const queue = [origin.h];
  while (queue.length && reached.size < cfg.maxTargets) {
    const at = queue.shift()!;
    for (const h of reachable) {
      if (reached.has(h.id)) continue;
      if (Math.hypot(h.x - at.x, h.y - at.y) > cfg.jumpMeters) continue;
      reached.add(h.id);
      queue.push(h);
      if (reached.size >= cfg.maxTargets) break;
    }
  }
  return reached;
}
