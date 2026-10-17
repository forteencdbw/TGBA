/**
 * Every sound cue the game can ask for, by name.
 *
 * A list of its own, with no imports, because three modules need it and none of them may import another to get it: the
 * synth (`src/sfx.ts`) plays by it, the config validator (`src/mechanisms.ts`) checks that every name has a recipe, and the
 * rules (`src/run.ts`, `src/hazards.ts`) say them. A name that exists here and has no recipe is a boot error, which is
 * what keeps "a sound nobody wrote" from being a silent bug.
 *
 * Names are `thing.event`, and one name is ONE thing that happens -- two different events never share a sound, even where
 * the old synth reused one for convenience (an overload used to be the slow slur).
 * To swap a placeholder for a recording, drop `src/assets/audio/sfx/<name>.wav` (or `.mp3`) and it replaces the recipe.
 */

/** The four mixing groups. Each has its own relative level in `audio.sfx.buses`. */
export const SOUND_BUSES = ['ui', 'combat', 'player', 'env'] as const;
export type SoundBus = (typeof SOUND_BUSES)[number];

export const SOUND_IDS = [
  // --- ui: menus, panels, and the beats that frame a level
  'ui.click',
  'ui.back',
  'ui.toggle',
  'ui.slider',
  'menu.start',
  'ui.pause',
  'ui.resume',
  'levelup.open',
  /**
   * The pick's slow motion starting.
   *
   * Its own cue rather than reusing `levelup.open`: that one belongs to the cards appearing, and the whole point of the
   * ramp is that it happens BEFORE they do. On the `ui` bus, so it does not slow down with the slow motion it announces.
   */
  'levelup.ramp',
  'levelup.pick',
  'level.start',
  'level.banner',
  'level.surface',
  'boss.warn',
  'boss.enter',
  'summary.show',
  // --- combat: the gun, and what the creatures do about it
  'gun.fire',
  'gun.hit',
  'enemy.hit.small',
  'enemy.hit.predator',
  'enemy.hit.jelly',
  'enemy.hit.shell',
  'enemy.hit.ranged',
  'enemy.hit.boss',
  'enemy.leave.small',
  'enemy.leave.predator',
  'enemy.leave.jelly',
  'enemy.leave.shell',
  'enemy.leave.ranged',
  'enemy.leave.boss',
  'hit.crit',
  'enemy.fire',
  'enemy.charge',
  'enemy.discharge',
  'chain.zap',
  'bomb.blast',
  'puffer.counter',
  'boss.attack',
  'bullet.hurt',
  'graze',
  // --- player: what the bubble does, and what is done to it
  'player.hurt',
  'player.pop',
  'player.eat',
  'player.absorb',
  'stage.grow',
  'mutation.gain',
  'suction.on',
  'rage.slam',
  'rage.burst',
  'rage.overload',
  'rage.punish',
  'health.low',
  'player.slow',
  'crab.launch',
  'talent.fart',
  'defeat.sting',
  // --- env: the water itself
  'vent.erupt',
  'obstacle.break.crate',
  'obstacle.break.coral',
  'obstacle.break.net',
  'obstacle.hit.wall',
  'rain.press',
  'foam.pop',
  'mineral.hit',
] as const;

export type SoundId = (typeof SOUND_IDS)[number];

/**
 * The six families of creature that share a hit and a leaving sound.
 *
 * Grouped by what the body is made of and how it moves rather than by species, because a sound is a property of that: a
 * shark and a dolphin are both a heavy muscular thing being struck, a jellyfish and a zapper are both soft and wet. A
 * kind that is not listed is a `small` one, which is the safest guess for the unknown (it is also the quietest).
 */
export type EnemyClass = 'small' | 'predator' | 'jelly' | 'shell' | 'ranged' | 'boss';

const ENEMY_CLASS: Record<string, EnemyClass> = {
  fish: 'small',
  tuna: 'small',
  shrimp: 'small',
  shark: 'predator',
  dolphin: 'predator',
  whale: 'predator',
  octopus: 'predator',
  eel: 'predator',
  torpedo: 'predator',
  jelly: 'jelly',
  zapper: 'jelly',
  crab: 'shell',
  urchin: 'shell',
  starfish: 'shell',
  puffer: 'shell',
  bombfish: 'shell',
  archer: 'ranged',
  pistol: 'ranged',
  angler: 'ranged',
};

/**
 * The `boss-` tests below answer a DIFFERENT question from `isBossKind` in `src/hazards.ts`.
 *
 * That one asks "is this the level's win condition" and reads a list; this asks "which family of hit sound does it use"
 * and reads the name. They agree today, and this file imports nothing on purpose (three modules need these names and none
 * of them may import another to reach them), so the two are kept apart by hand rather than by a call. **Change one and
 * look at the other** -- the failure mode is a boss that dies to the right animation and the wrong sound, which is the sort
 * of thing nobody notices until the sixth level.
 */
export function enemyClassOf(kind: string): EnemyClass {
  if (kind === 'boss' || kind.startsWith('boss-')) return 'boss';
  return ENEMY_CLASS[kind] ?? 'small';
}

/**
 * What each kind of scenery sounds like when it comes apart, and what being STOPPED by one sounds like.
 *
 * Keyed by `ObstacleKind` and kept here with the other tables rather than in `src/run.ts`, which is where it is used: it
 * is the same kind of fact as the enemy families above (a name maps to a cue) and belongs beside them.
 *
 * EVERY kind needs a row, and the reason is the one nobody would ever report: the lookup in `src/run.ts` falls back to
 * `rage.slam`, so a kind missing here does not go silent -- it plays another verb's cue. `wall` and `tube` were both
 * missing exactly that way, and a wall coming apart to the volatile bubble's slam is what that sounded like.
 */
export const OBSTACLE_BREAK_SOUNDS: Record<string, SoundId> = {
  crate: 'obstacle.break.crate',
  coral: 'obstacle.break.coral',
  net: 'obstacle.break.net',
  // 硬的那两种借珊瑚的音：木箱是脆的（1 点），网是软的（撕开），而珊瑚 3.5、封路木箱 3.0、管虫 3.0 是同一类
  // "厚而干"的碎——三者耐久差不到一成五，玩家听到的是同一件事：一块挡路的东西没了。
  wall: 'obstacle.break.coral',
  tube: 'obstacle.break.coral',
};
/**
 * Being stopped by the one kind no size can RAM through.
 *
 * Not the same as unbreakable, and the name is a trap: a wall is unrammable at every volume, but the volatile bubble's
 * slam opens it (`angry.charge.slamBreaksUnrammable`), which is why it has a row in the table above.
 */
export const OBSTACLE_BLOCK_SOUND: SoundId = 'obstacle.hit.wall';

export function hitSoundOf(kind: string): SoundId {
  return `enemy.hit.${enemyClassOf(kind)}`;
}

export function leaveSoundOf(kind: string): SoundId {
  return `enemy.leave.${enemyClassOf(kind)}`;
}
