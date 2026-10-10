import { mech } from './mechanisms';

/**
 * The mutation meter (突变值): the run's second ladder, and the one the player steers.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT MIRRORS `Score`
 * ---------------------------------------------------------------------------------------------
 * For the same reason the score is a module and not a number on `Run`: "what pays" is a rule, and a rule
 * kept in one place is the only way "how close am I to a mutation" stays answerable. The events are named
 * here, their values live in `mutation.gain` in `config/mechanics.json5`, and the call sites say what
 * HAPPENED rather than how much it is worth -- the owner can re-price any of them, or take one out of the
 * game with a 0, without touching code.
 *
 * What makes this NOT a score is the threshold: points are not the point, LEVELS are. Points accumulate
 * only until they can buy the next level, and the excess is carried across the purchase (the design's
 * "溢出保留") so a graze that crosses the line is not punished for arriving big.
 *
 * The ladder's cost grows (`first × growth^(N-1)`), so a five-minute run holds five-to-seven picks for
 * mixed play and more for a player who lives dangerously -- the graze pays best and the clock pays worst,
 * which is the whole risk curve the design asked for.
 */

/** Every way a run earns mutation points. The names are the config's keys under `mutation.gain`. */
export type XpEvent = 'drivenOff' | 'eaten' | 'graze' | 'boss';

export class Xp {
  private counts: Record<XpEvent, number> = { drivenOff: 0, eaten: 0, graze: 0, boss: 0 };
  /** Points toward the NEXT level. Whatever crossed a threshold is kept here, minus the cost paid. */
  private towards = 0;
  /**
   * Levels reached -- which is what the LADDER prices its next rung from.
   *
   * Advanced the moment points cross a threshold, because that is the moment the cost is deducted;
   * `need` below reads it, so an earned-but-unpicked level already stands at its own rung.
   */
  private taken = 0;
  /** Mutations actually PICKED, which is what the HUD's 突变 N counts. */
  private picked = 0;
  /**
   * Levels earned but not picked yet.
   *
   * Kept as a COUNT rather than a boolean because a boss's 100 points can cross two thresholds at once at
   * the bottom of the ladder: the modal would then reopen the moment it closes, which is the honest
   * reading of "you earned two".
   */
  private banked = 0;

  /** Points currently toward the next level, for the HUD. */
  get value(): number {
    return this.towards;
  }

  /**
   * How many mutations have been PICKED this run -- the HUD's number, and deliberately not the
   * ladder's rung count: an earned-but-unpicked level must not advertise itself as taken.
   */
  get level(): number {
    return this.picked;
  }

  /** Levels waiting to be picked. Above zero is what opens the modal. */
  get pending(): number {
    return this.banked;
  }

  /** The cost of the next level, from the ladder. */
  get need(): number {
    const { first, growth } = mech.mutation;
    return Math.round(first * growth ** this.taken);
  }

  /** The bar's fill, 0..1, for the HUD. */
  get fraction(): number {
    return Math.min(1, this.towards / Math.max(1e-6, this.need));
  }

  /** How many times each event has paid this run, for diagnostics. */
  get ledger(): Readonly<Record<XpEvent, number>> {
    return this.counts;
  }

  /**
   * The clock's own trickle: the slowest source, and the only one that is a rate.
   *
   * Fractional on purpose -- the ledger counts EVENTS and this is not one, so it accumulates straight
   * into `towards` and the level check runs once for the whole frame's worth.
   */
  tick(dt: number): void {
    const perSecond = mech.mutation.autoPerSecond;
    if (perSecond <= 0) return;
    this.add(perSecond * dt);
  }

  /**
   * Award an event, `times` over, and return the points it paid.
   *
   * The same contract as `Score.award`: an event priced 0 is not recorded, so taking a source out of the
   * economy leaves an empty ledger rather than a list of zeroes.
   */
  gain(event: XpEvent, times = 1): number {
    if (times <= 0) return 0;
    const points = (mech.mutation.gain[event] ?? 0) * times;
    if (points <= 0) return 0;
    this.counts[event] += times;
    this.add(points);
    return points;
  }

  /**
   * Spend one banked level, on the pick that just closed.
   *
   * The cost was already deducted when the level was REACHED, so this is bookkeeping only -- the caller
   * applies the mutation first and then tells the ledger the slot is free. The PICK count is what the
   * HUD's 突变 N reports, so it moves here rather than at the earn.
   */
  consume(): void {
    if (this.banked > 0) {
      this.banked--;
      this.picked++;
    }
  }

  /** Back to zero, and an empty ledger. A death starts the ladder over. */
  reset(): void {
    this.counts = { drivenOff: 0, eaten: 0, graze: 0, boss: 0 };
    this.towards = 0;
    this.taken = 0;
    this.picked = 0;
    this.banked = 0;
  }

  /** Bank levels while the points cover the next rung, keeping the excess. */
  private add(points: number): void {
    this.towards += points;
    while (this.towards >= this.need && this.banked < 4) {
      this.towards -= this.need;
      this.taken++;
      this.banked++;
    }
  }
}
