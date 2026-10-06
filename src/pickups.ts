import { mech } from './mechanisms';
import { LEVEL } from './levels';
import { SKILLS, type SkillId } from './skills';
import type { Score } from './score';
import { sayScore, saySound, type RunEvent } from './runEvents';
import type { PickupDrop } from './placement';

/**
 * What taking a pickup gave.
 *
 * The rule DECIDES and the run APPLIES, rather than the rule reaching into the run's numbers: the two progress numbers
 * live on the game (the gun reads them, the HUD shows them) and the words for a capped upgrade are Chinese UI strings,
 * which a rule module has no business holding. It also means a probe can read the decision directly instead of
 * inferring it from a banner.
 */
export type PickupTaken =
  | { kind: 'upgrade'; /** The new row count, already capped. */ streams: number; /** It was already at the ceiling. */ capped: boolean }
  | { kind: 'rate'; tier: number; capped: boolean }
  | { kind: 'skill'; id: SkillId };

/** The water as this rule sees it: what is floating, where the player's mouth is, and what a pickup may raise. */
export interface PickupWater {
  drops: PickupDrop[];
  /** Where the player's mouth is, in world metres, and how far its reach goes -- the caller sizes that, not this. */
  playerX: number;
  playerY: number;
  reachMeters: number;
  /** What a pickup raises, as it stands NOW: the ceiling is decided here, so the rule needs the current rung. */
  gunStreams: number;
  rateTier: number;
  score: Score;
  events: RunEvent[];
}

/**
 * One step of every pickup in the water: carry it down, cull it, and take it if the player is on it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT IS BACKWARDS, AND WHY THE SKILL IS ROLLED HERE
 * ---------------------------------------------------------------------------------------------
 * Each drop is moved, culled and collected INDEPENDENTLY, and the loop runs backwards because collecting one removes it
 * from the list: two pickups on screen at once is the normal case now (a level may place them metres apart), and they
 * cannot interfere.
 *
 * What a pickup gives is decided on COLLECTION. Deciding at placement would commit the player's next twenty seconds
 * before they had even seen it, and would turn the level author's choice of WHERE into a choice of WHAT. The upgrade
 * has nothing to roll -- it is always the same one thing -- so it just raises the gun's row count, to the config's
 * ceiling.
 *
 * Returns what was taken, in the order it was taken; two upgrades in one step both work, because the running numbers
 * are carried through the loop rather than read back from the caller.
 */
export function updatePickups(dt: number, min: number, max: number, world: PickupWater): PickupTaken[] {
  const taken: PickupTaken[] = [];
  if (!world.drops.length) return taken;
  let gunStreams = world.gunStreams;
  let rateTier = world.rateTier;

  for (let i = world.drops.length - 1; i >= 0; i--) {
    const pickup = world.drops[i]!;
    // The pickup is stationary in the water, so the SCROLL is what carries it down past the player.
    // It used to be offset by the player's ascent, which was the same relative motion expressed the
    // other way round; with the player able to hold still, the world has to do the moving.
    pickup.y -= LEVEL.scrollSpeed * dt;
    if (pickup.y < min - 40 || pickup.y > max + 160) {
      world.drops.splice(i, 1);
      continue;
    }

    const dx = pickup.x - world.playerX;
    const dy = pickup.y - world.playerY;
    if (dx * dx + dy * dy > world.reachMeters * world.reachMeters) continue;

    if (pickup.kind === 'upgrade') {
      const before = gunStreams;
      gunStreams = Math.min(mech.bullets.maxStreams, gunStreams + 1);
      saySound(world.events, 'skill');
      taken.push({ kind: 'upgrade', streams: gunStreams, capped: gunStreams === before });
    } else if (pickup.kind === 'rate') {
      /**
       * The fire-rate ladder, one step per pickup.
       *
       * The ceiling is the LADDER'S LENGTH, not a separate number: "three tiers" and "three entries" are the same
       * fact, so adding a tier is adding an entry and there is nothing to keep in sync. At the top the pickup is
       * still consumed and says so -- a pickup that did nothing silently reads as a bug.
       */
      const before = rateTier;
      rateTier = Math.min(mech.bullets.rateTiers.length, rateTier + 1);
      saySound(world.events, 'skill');
      taken.push({ kind: 'rate', tier: rateTier, capped: rateTier === before });
    } else {
      const skill = pickup.id ?? (SKILLS[Math.floor(Math.random() * SKILLS.length)] ?? SKILLS[0]).id;
      taken.push({ kind: 'skill', id: skill });
    }
    // A special item is worth points because it is the level's one pure reward: everything else in the water is
    // either an obstacle or something that hurts. It floats up from WHERE IT WAS PICKED UP, which is this feature's
    // own example of what the numbers are for.
    sayScore(world.events, pickup.x, pickup.y, world.score.award('skill'));
    world.drops.splice(i, 1);
  }
  return taken;
}
