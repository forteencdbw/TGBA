/**
 * The score: what a run is worth, and the record of what earned it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A MODULE AND NOT A NUMBER ON `Game`
 * ---------------------------------------------------------------------------------------------
 * A running total is a variable; a score is a RULE about what counts. Keeping the rule in one place is what stops it
 * from becoming five `this.score += 25` lines scattered through the update loop, where the only way to answer "what
 * is worth points" is to grep for the arithmetic -- and where adding a point value means editing gameplay code.
 *
 * So: the events are named here, their values live in `score` in `config/mechanics.json5`, and the call sites say
 * what HAPPENED (`award('drivenOff')`) rather than how much it is worth. A new scoring event is a line in the config
 * and a line here; the owner can set any of them to 0 to take that event out of the game without touching code.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT COUNTS, AND WHY EACH ONE
 * ---------------------------------------------------------------------------------------------
 *   drivenOff  a creature driven off by the gun. The gun's payoff: without points, shooting is a way to make the
 *              water emptier and nothing else, and the ammo-free weapon has no cost to weigh against it.
 *   absorb     a collectable bubble absorbed. For the types that grow, growth is already the reward and this is
 *              the config's business whether they are paid twice; for a type that CANNOT grow it is the only
 *              reward there is, which is why the event exists at all.
 *   skill      a special item collected. The level's one pure reward, and the only pickup that is a decision to
 *              reach for rather than something in the way.
 *   eaten      a creature SWALLOWED. The reversal is the game's signature act and its most dangerous one -- it is
 *              the thing the bubble gets bigger and slower for -- so it pays.
 *   surface    reaching the surface: the run's goal, and by far the biggest single payment. Everything else is a
 *              trickle next to finishing.
 *
 * The ledger is kept as COUNTS per event, not as points per event, so the total can never disagree with the config:
 * changing a value re-prices history for a run in progress (which is what a reload does anyway) instead of leaving a
 * total made of two different tables.
 */

import { mech } from './config';

/** Every way a run can earn points. The names are the config's keys. */
export type ScoreEvent = 'drivenOff' | 'absorb' | 'skill' | 'eaten' | 'boss';

export class Score {
  private counts: Record<ScoreEvent, number> = { drivenOff: 0, absorb: 0, skill: 0, eaten: 0, boss: 0 };
  private total = 0;

  /** Points on the board right now. */
  get value(): number {
    return this.total;
  }

  /**
   * How many times each event has been scored this run.
   *
   * Exposed because "the score is 350" cannot say WHICH part of the run paid, and a probe checking that the surface
   * bonus landed needs the ledger, not the total.
   */
  get ledger(): Readonly<Record<ScoreEvent, number>> {
    return this.counts;
  }

  /**
   * Award an event, `times` over, and return the points it paid.
   *
   * `times` exists for the gun: several creatures can be driven off in the same frame, and the caller has a count in
   * hand. A caller that had to loop would be a caller that had to know the loop was safe.
   *
   * Returns 0 for an event worth 0 points, and does NOT record it in the ledger: an event taken out of the game by
   * the config should read as absent, not as a long list of zeroes.
   */
  award(event: ScoreEvent, times = 1): number {
    if (times <= 0) return 0;
    const points = (mech.score[event] ?? 0) * times;
    if (points <= 0) return 0;
    this.total += points;
    this.counts[event] += times;
    return points;
  }

  /**
   * Back to zero, and to an empty ledger.
   *
   * Called on `startRun`, because a score is a RUN's number: a total that survived a new bubble would make the
   * display a session tally, which is a different thing and would need a different label.
   */
  reset(): void {
    this.total = 0;
    this.counts = { drivenOff: 0, absorb: 0, skill: 0, eaten: 0, boss: 0 };
  }
}



