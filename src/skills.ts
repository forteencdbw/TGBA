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

import { mech } from './mechanisms';
import type { HazardKind } from './hazards';

export type SkillId = 'dash' | 'decoy' | 'vortex' | 'stink' | 'shell' | 'burst';

export interface Skill {
  id: SkillId;
  name: string;
  /** One line, for the pickup label and the HUD. */
  blurb: string;
  /**
   * How many times it can be used before it is gone.
   *
   * A GETTER onto the config rather than a stored number: how many uses a skill is worth is balance, and balance
   * lives in `config/mechanics.json5` with every other knob. The name and the blurb are content and stay here.
   */
  readonly uses: number;
  /** Seconds the effect lasts, or 0 for an instant. Same reason for being a getter as `uses`. */
  readonly durationSeconds: number;
}

/**
 * The six, with use counts chosen so that the two "clean slate" skills are the scarcest.
 *
 * Each entry is content (name, blurb) plus two live views onto its own config block, so a skill's numbers are in
 * exactly one place -- `skills.<id>` in the config file -- and `pnpm typecheck` fails if one of the six has no
 * block there.
 */
export const SKILLS: readonly Skill[] = [
  {
    id: 'dash',
    name: '冲刺',
    blurb: '短时间大幅加速上升',
    get uses() {
      return mech.skills.dash.uses;
    },
    get durationSeconds() {
      return mech.skills.dash.durationSeconds;
    },
  },
  {
    id: 'decoy',
    name: '诱饵泡',
    blurb: '扔出假气泡，吸走附近所有的鱼',
    get uses() {
      return mech.skills.decoy.uses;
    },
    get durationSeconds() {
      return mech.skills.decoy.durationSeconds;
    },
  },
  {
    id: 'vortex',
    name: '漩涡',
    blurb: '把周围的气泡吸向你',
    get uses() {
      return mech.skills.vortex.uses;
    },
    get durationSeconds() {
      return mech.skills.vortex.durationSeconds;
    },
  },
  {
    id: 'stink',
    name: '臭云',
    blurb: '一片区域推开垃圾与水母，并解除减速',
    get uses() {
      return mech.skills.stink.uses;
    },
    get durationSeconds() {
      return mech.skills.stink.durationSeconds;
    },
  },
  {
    id: 'shell',
    name: '硬壳',
    blurb: '无敌并撞开一切',
    get uses() {
      return mech.skills.shell.uses;
    },
    get durationSeconds() {
      return mech.skills.shell.durationSeconds;
    },
  },
  {
    id: 'burst',
    name: '爆散',
    blurb: '以你为中心向外爆开',
    get uses() {
      return mech.skills.burst.uses;
    },
    get durationSeconds() {
      return mech.skills.burst.durationSeconds;
    },
  },
];

export function findSkill(id: SkillId): Skill {
  const found = SKILLS.find((s) => s.id === id);
  if (!found) throw new Error(`unknown skill: ${id}`);
  return found;
}

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
 *
 * Every number comes from the skill's own block in the config, including the two durations that used to be
 * literals here (`vortexSeconds: 1.2`, `invulnerableSeconds: 3`): they duplicated `SKILLS[].durationSeconds`, and
 * a duplicate that agrees today is a duplicate that disagrees the first time one of them is tuned.
 */
export function activationFor(id: SkillId): SkillActivation {
  switch (id) {
    case 'dash':
      return { id, ascentMultiplier: mech.skills.dash.ascentMultiplier };
    case 'decoy':
      return { id, decoyRadius: mech.skills.decoy.decoyRadiusMeters, decoySeconds: mech.skills.decoy.decoySeconds };
    case 'vortex':
      return {
        id,
        vortexRadius: mech.skills.vortex.vortexRadiusMeters,
        vortexSeconds: mech.skills.vortex.durationSeconds,
      };
    case 'stink':
      return {
        id,
        pushRadius: mech.skills.stink.stinkRadiusMeters,
        pushKinds: ['trash', 'jelly'],
        clearsSlow: true,
      };
    case 'shell':
      // No `clearRadius`: the shell does not delete anything, it makes the player immune and shoves
      // hazards aside while it lasts. A shell that deleted hazards would be a strictly better burst,
      // and the burst is meant to be the scarce one.
      return {
        id,
        invulnerableSeconds: mech.skills.shell.invulnerableSeconds,
        // The shell's own radius rather than the burst's: the two shared one number only because it was
        // convenient, and "how far does a shell shove" is a question about the shell.
        pushRadius: mech.skills.shell.shellRadiusMeters,
        pushKinds: ['fish', 'jelly', 'trash', 'crab'],
      };
    case 'burst':
      return {
        id,
        // The burst shoves everything away rather than deleting it, for the same reason: removing
        // entities outright would make the endgame's density meaningless.
        pushRadius: mech.skills.burst.burstRadiusMeters,
        pushKinds: ['fish', 'jelly', 'trash', 'crab'],
      };
  }
}
