/**
 * Skills (D4) -- one slot, active, limited uses.
 *
 * The rule that keeps these from being filler: **each skill answers a specific thing that already
 * annoys you**, and no two answer the same thing. A skill that just "does damage" would be a reskin;
 * these are a dash to escape an encirclement, bait to clear one, a vortex to grow faster, a stink
 * cloud to get a jellyfish or a trash bag off you, a shell to survive a mistake, and a burst to
 * escape the endgame.
 *
 * ONE SLOT. Picking up a skill replaces what you are carrying, which is what forces a decision at
 * the pickup instead of accumulating a toolkit.
 */

import type { HazardKind } from './hazards';

export type SkillId = 'dash' | 'decoy' | 'vortex' | 'stink' | 'shell' | 'burst';

export interface Skill {
  id: SkillId;
  name: string;
  /** One line, for the pickup label and the HUD. */
  blurb: string;
  /** How many times it can be used before it is gone. */
  uses: number;
  /** Seconds the effect lasts, or 0 for an instant. */
  durationSeconds: number;
}

/**
 * The six, with use counts chosen so that the two "clean slate" skills are the scarcest.
 *
 * Bait and burst both remove a whole situation at once, so they are the ones that would trivialise
 * the game if handed out freely. Dash and stink are the workhorses and get more uses.
 */
export const SKILLS: readonly Skill[] = [
  {
    id: 'dash',
    name: '冲刺',
    blurb: '短时间大幅加速上升',
    uses: 3,
    durationSeconds: 1.5,
  },
  {
    id: 'decoy',
    name: '诱饵泡',
    blurb: '扔出假气泡，吸走附近所有的鱼',
    uses: 2,
    durationSeconds: 0,
  },
  {
    id: 'vortex',
    name: '漩涡',
    blurb: '把周围的气泡吸向你',
    uses: 1,
    durationSeconds: 1.2,
  },
  {
    id: 'stink',
    name: '臭云',
    blurb: '一片区域推开垃圾与水母，并解除减速',
    uses: 2,
    durationSeconds: 1.0,
  },
  {
    id: 'shell',
    name: '硬壳',
    blurb: '无敌并撞开一切',
    uses: 2,
    durationSeconds: 3,
  },
  {
    id: 'burst',
    name: '爆散',
    blurb: '以你为中心向外爆开',
    uses: 1,
    durationSeconds: 0,
  },
];

export function findSkill(id: SkillId): Skill {
  const found = SKILLS.find((s) => s.id === id);
  if (!found) throw new Error(`unknown skill: ${id}`);
  return found;
}

/** Per-skill numbers, together because they are only meaningful as a set. */
export const skillTuning = {
  /** Dash: ascent multiplier while active. */
  dashAscentMultiplier: 2.6,
  /** Decoy: radius in metres within which fish are pulled to the bait. */
  decoyRadiusMeters: 260,
  /** Decoy: how long the bait keeps drawing fish in. */
  decoySeconds: 4,
  /** Vortex: radius in metres that collectables are drawn from. */
  vortexRadiusMeters: 220,
  /**
   * Vortex: how hard collectables are pulled, as a fraction of the distance per second.
   *
   * Deliberately not instant. A vortex that teleported everything would remove the bubble's own
   * motion from the screen for the duration, and the game's whole feel is that movement.
   */
  vortexPullPerSecond: 2.2,
  /** Stink: radius in metres that hazards are pushed out of. */
  stinkRadiusMeters: 170,
  /** Burst: radius in metres within which everything is shoved away. */
  burstRadiusMeters: 320,
  /** Shell: how hard it shoves hazards aside while active, as a fraction of the distance per second. */
  shellPushPerSecond: 3,
} as const;

/**
 * What a skill does, as a value the game applies. Kept declarative so the simulation stays readable
 * and a probe can drive a skill without a player.
 */
export interface SkillActivation {
  id: SkillId;
  /** Ascent multiplier to apply for `durationSeconds`. */
  ascentMultiplier?: number;
  /** Seconds of invulnerability granted. */
  invulnerableSeconds?: number;
  /** Collectables within this radius are drawn toward the player. */
  vortexRadius?: number;
  vortexSeconds?: number;
  /** Fish within this radius are diverted to a decoy. */
  decoyRadius?: number;
  decoySeconds?: number;
  /** Hazards of these kinds within this radius are pushed away. */
  pushRadius?: number;
  pushKinds?: HazardKind[];
  /** Clears any movement penalty on the player. */
  clearsSlow?: boolean;
}

/**
 * Resolve a skill into its effect.
 *
 * `pushKinds` is explicit per skill rather than "push everything": the stink cloud is the answer to
 * being grabbed or slowed, and a version that also shoved fish around would make the decoy redundant.
 */
export function activationFor(id: SkillId): SkillActivation {
  switch (id) {
    case 'dash':
      return { id, ascentMultiplier: skillTuning.dashAscentMultiplier };
    case 'decoy':
      return { id, decoyRadius: skillTuning.decoyRadiusMeters, decoySeconds: skillTuning.decoySeconds };
    case 'vortex':
      return { id, vortexRadius: skillTuning.vortexRadiusMeters, vortexSeconds: 1.2 };
    case 'stink':
      return {
        id,
        pushRadius: skillTuning.stinkRadiusMeters,
        pushKinds: ['trash', 'jelly'],
        clearsSlow: true,
      };
    case 'shell':
      // No `clearRadius`: the shell does not delete anything, it makes the player immune and shoves
      // hazards aside while it lasts. A shell that deleted hazards would be a strictly better burst,
      // and the burst is meant to be the scarce one.
      return { id, invulnerableSeconds: 3, pushRadius: skillTuning.burstRadiusMeters, pushKinds: ['fish', 'jelly', 'trash', 'crab'] };
    case 'burst':
      return {
        id,
        // The burst shoves everything away rather than deleting it, for the same reason: removing
        // entities outright would make the endgame's density meaningless.
        pushRadius: skillTuning.burstRadiusMeters,
        pushKinds: ['fish', 'jelly', 'trash', 'crab'],
      };
  }
}
