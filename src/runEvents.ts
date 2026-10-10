import type { SoundEvent } from './audio';

/**
 * What a frame of the run SAYS, queued instead of said.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE RULES DO NOT TOUCH THE SCREEN
 * ---------------------------------------------------------------------------------------------
 * A rule that decides something -- a crate broke, a fish was driven off, the heart ran out -- also knows what that
 * should SOUND and LOOK like, and the shortest way to write that is to call the label and the synth from where the
 * decision is made. That is what `main.ts` did in sixty-three places, and it is the reason the rules could not be moved
 * out of the class that owns the canvas: a rule holding a reference to a `Text` object is a rule that needs a renderer.
 *
 * So they push one of these instead. `Game.applyRunEvents` is the only code that touches the display, and it runs
 * immediately after the step that produced them -- so a hit still sounds on the frame it happened, and a banner is still
 * on screen for the frame it was raised in.
 *
 * The type lives here rather than in `main.ts` because the RULES live in modules now (`src/placement.ts`,
 * `src/spit.ts`): a module that cannot import the vocabulary of what it is allowed to say would have to hand its
 * outputs back as ad-hoc tuples, and every one of them would be a second definition of the same five things.
 *
 * The same shape the particles have used since they were written (a queue the simulation fills and the presentation
 * drains), applied to everything a run has to say rather than to sparks alone. It is also what makes the run's output
 * inspectable: a probe can read this list instead of asking a label what it currently contains.
 */
export type RunEvent =
  | { kind: 'banner'; text: string }
  | { kind: 'sound'; event: SoundEvent; intensity: number }
  | { kind: 'scorePopup'; x: number; y: number; points: number }
  | { kind: 'damagePopup'; x: number; y: number; amount: number }
  | { kind: 'graze'; x: number; y: number }
  | { kind: 'callout'; x: number; y: number; text: string }
  | { kind: 'skillSlot'; carried: boolean }
  | { kind: 'blast'; x: number; y: number; radius: number }
  | { kind: 'splash' }
  | { kind: 'results' };

/**
 * The five things a rule can say, as constructors.
 *
 * The defaults live here with the type rather than at each call site: `audio.play`'s intensity default is 0.5, and a
 * rule module that had to remember that would be a rule module that knows about the synth.
 */
export function sayBanner(events: RunEvent[], text: string): void {
  events.push({ kind: 'banner', text });
}

export function saySound(events: RunEvent[], event: SoundEvent, intensity = 0.5): void {
  events.push({ kind: 'sound', event, intensity });
}

/** A number rising off a place in the water, in WORLD metres: the drain hands the camera to the popup layer. */
export function sayScore(events: RunEvent[], x: number, y: number, points: number): void {
  events.push({ kind: 'scorePopup', x, y, points });
}

export function sayDamage(events: RunEvent[], x: number, y: number, amount: number): void {
  events.push({ kind: 'damagePopup', x, y, amount });
}

/**
 * A graze, in world metres -- the midpoint the near-miss happened at.
 *
 * Its own event rather than a scorePopup, because a graze is not a number: it is a WORD in the water
 * and a slow-motion beat, neither of which the score's popup layer knows how to say.
 */
export function sayGraze(events: RunEvent[], x: number, y: number): void {
  events.push({ kind: 'graze', x, y });
}

/**
 * A small skill callout: 「擦」「贴脸」「拆弹」-- a word where the trick happened.
 *
 * The graze's word is its own event because it carries a slow-motion beat; these three are the
 * graze's small change -- the same idea without the ceremony -- and they share one event, one style
 * and one volume so they read as one CLASS of feedback rather than three more voices.
 */
export function sayCallout(events: RunEvent[], x: number, y: number, text: string): void {
  events.push({ kind: 'callout', x, y, text });
}

/** Whether the carried skill's button exists. Input surface, so it is an OUTPUT of the run rather than a rule. */
export function saySkillSlot(events: RunEvent[], carried: boolean): void {
  events.push({ kind: 'skillSlot', carried });
}

/**
 * A blast, in world metres.
 *
 * The ring and the screen shake are both the DRAIN'S to build, and the shake's size is why: it is measured against the
 * window (`designScale(screen.width, screen.height)`), and a rule that has to ask how big the window is, is a rule that
 * cannot run without one. All the blast knows is where it happened and how wide it was.
 */
export function sayBlast(events: RunEvent[], x: number, y: number, radius: number): void {
  events.push({ kind: 'blast', x, y, radius });
}

/** The bubble broke the surface: the flash of it, and the level's end. */
export function saySplash(events: RunEvent[]): void {
  events.push({ kind: 'splash' });
}

/** Show the results card. Its text is composed by the presentation, which is the half that knows the layout. */
export function sayResults(events: RunEvent[]): void {
  events.push({ kind: 'results' });
}
