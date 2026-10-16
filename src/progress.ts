import { LEVEL, LEVELS, START_LEVEL_ID, levelIndex, selectLevel } from './levels';

/**
 * Progress: which levels have been cleared.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FIRST THING IN THIS PROJECT THAT OUTLIVES A PAGE LOAD
 * ---------------------------------------------------------------------------------------------
 * Everything else here is per-run state. Progression is different by definition -- a level unlocked in a session
 * that ends when the tab closes is not unlocked -- so this is the one module that writes to `localStorage`, and it is
 * worth being explicit about the three things that follow from that.
 *
 * 1. **The key carries a version.** `tgba.progress.v1`. A stored shape can change, and the alternative to a version
 *    is a migration path for a format nobody remembers. Bumping it discards old progress, which is the honest
 *    behaviour for a version that cannot be understood.
 * 2. **Every read is defended.** `localStorage` throws in a private window and in some embedded browsers, and it can
 *    hold something that is not ours. A save file is untrusted input: it is parsed, shape-checked, and every level
 *    id in it is checked against the levels that exist. Anything unrecognised is dropped rather than trusted, and
 *    the worst case is "start again" rather than "crash on boot".
 * 3. **It can be reset.** A save the player cannot clear is a support problem, and a save a DEVELOPER cannot clear
 *    makes progression untestable. `reset` exists for both, and the key is documented in the README so it can also
 *    be deleted by hand.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS STORED
 * ---------------------------------------------------------------------------------------------
 *   cleared   level ids the player has reached the surface of
 *
 * `selected` used to be here, and it is gone: the level ladder is a debug affordance now, and a run always begins at
 * the level the file names as `start`. Nothing needed to remember a choice that could not be made.
 *
 * Deliberately NOT stored: the best climb, the bubble type, the volume. Those are per-run or already in the config,
 * and a progress file that grows new fields every milestone is one that needs migrating every milestone.
 */
export interface Progress {
  cleared: string[];
}

/** The storage key. Versioned; see the note above about what bumping it means. */
export const PROGRESS_KEY = 'tgba.progress.v1';

/** Where a fresh player starts, and where every run starts: the level the FILE names as `start`. */
function freshProgress(): Progress {
  return { cleared: [] };
}

/**
 * Read the save, discarding anything that cannot be trusted.
 *
 * `cleared` is filtered against the levels that actually exist, so deleting a level from the config file cannot leave
 * a save that unlocks something that is gone -- and so a hand-edited save cannot unlock a level out of order.
 */
export function loadProgress(): Progress {
  const fresh = freshProgress();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PROGRESS_KEY);
  } catch {
    // No storage available: the session still works, it just does not remember.
    return fresh;
  }
  if (!raw) return fresh;
  try {
    const parsed = JSON.parse(raw) as Partial<Progress> | null;
    if (!parsed || typeof parsed !== 'object') return fresh;
    const known = new Set(LEVELS.map((l) => l.id));
    const cleared = Array.isArray(parsed.cleared)
      ? parsed.cleared.filter((id): id is string => typeof id === 'string' && known.has(id))
      : [];
    return { cleared };
  } catch {
    return fresh;
  }
}

/** Write the save. Silent when storage is unavailable: losing progress is better than losing the run. */
export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignored on purpose; see above.
  }
}

/**
 * Whether a level may be played.
 *
 * The FIRST level is always open, and each one after it is unlocked by clearing the one before. A LIST RULE rather
 * than a count: "cleared the previous level" is what the player did, and it stays true if a level is inserted in the
 * middle of the file later -- whereas "cleared two levels" would silently unlock the wrong thing.
 */
export function isUnlocked(index: number, progress: Progress): boolean {
  if (index <= 0) return true;
  const previous = LEVELS[index - 1];
  return previous ? progress.cleared.includes(previous.id) : false;
}

/** Which levels are playable right now, as ids. */
export function unlockedIds(progress: Progress): string[] {
  return LEVELS.filter((_, i) => isUnlocked(i, progress)).map((l) => l.id);
}

/** The class the run is in, and the UI it drives. One instance, owned by the game. */
/**
 * Whether the two evolved forms have been unlocked: ONE completed run.
 *
 * Derived rather than stored, and that is the point -- there is nothing to migrate. A run walks the ladder in order,
 * so "the campaign was cleared" and "the last level is in `cleared`" are the same fact, and a save written before this
 * feature existed already answers it.
 */
export function formsUnlocked(cleared: readonly string[], lastLevelId: string): boolean {
  return cleared.includes(lastLevelId);
}

export class Progression {
  private state: Progress;

  /** Called whenever the save changes, so the menu can redraw without polling. */
  onChange: () => void = () => {};

  constructor() {
    this.state = loadProgress();
    /**
     * The run begins where the FILE says it begins, and nowhere else.
     *
     * Applied at construction rather than by the caller so there is no window in which the menu and the run disagree
     * about which level is loaded. It is the file's `start` and not a remembered choice: a run always starts at the
     * first level, and the debug ladder can move `LEVEL` afterwards without any of that being persisted.
     */
    selectLevel(START_LEVEL_ID);
  }

  get cleared(): readonly string[] {
    return this.state.cleared;
  }

  /** The levels the menu should offer, with their lock state, in file order. */
  entries(): { id: string; name: string; locked: boolean; selected: boolean }[] {
    return LEVELS.map((level, index) => ({
      id: level.id,
      name: level.name,
      locked: !isUnlocked(index, this.state),
      /**
       * The FILLED pill is the level the game is ON, read from the live `LEVEL` rather than from the save.
       *
       * There is no stored selection to compare against any more, and this is the more useful answer anyway: the row
       * is a jump-to menu, so the only thing it can honestly highlight is where the player currently is -- including
       * after a jump that the save knows nothing about.
       */
      selected: level.id === LEVEL.id,
    }));
  }

  /**
   * Point the run at a level.
   *
   * No lock check and nothing written to `LEVEL`'s save entry: the only caller is the debug ladder, which shows every
   * level as selectable on purpose. An id that does not exist is still refused, so a typo cannot move the run.
   */
  select(id: string): boolean {
    if (levelIndex(id) < 0) return false;
    selectLevel(id);
    this.onChange();
    return true;
  }

  /**
   * Record that the run reached the surface of this level.
   *
   * @return the id of a level this unlocked, or null. Returning it is what lets the results card say WHAT was
   *   unlocked -- an unlock that only shows up as a pill quietly changing colour is an unlock the player misses.
   */
  clear(id: string): string | null {
    if (this.state.cleared.includes(id)) return null;
    const index = levelIndex(id);
    if (index < 0) return null;
    const before = unlockedIds(this.state);
    this.state = { ...this.state, cleared: [...this.state.cleared, id] };
    saveProgress(this.state);
    const opened = unlockedIds(this.state).find((other) => !before.includes(other));
    this.onChange();
    return opened ?? null;
  }

  /** Forget everything, and go back to the level the file names as `start`. */
  reset(): void {
    this.state = freshProgress();
    selectLevel(START_LEVEL_ID);
    saveProgress(this.state);
    this.onChange();
  }
}
