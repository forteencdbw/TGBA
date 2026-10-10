/**
 * Floating numbers: `+25` where points were earned, `-1` where a shot landed, drifting up, gone after a moment.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE POSITION IS THE WHOLE POINT
 * ---------------------------------------------------------------------------------------------
 * The corner readout says what the run is worth; it cannot say what just paid. A number that appears where the
 * thing happened answers that without a word of text -- a fish that vanishes upward and a `+25` where it was is a
 * complete sentence, and the same `+25` in the corner is bookkeeping.
 *
 * The same argument is what a DAMAGE number is for, one layer down: a creature's hit points are invisible, and the
 * white flash says only that something connected this frame. `-1` at the point of impact is the only thing in the
 * game that answers "how much is left" and "is this gun doing anything at all".
 *
 * So every popup is created at the SCREEN position of the event it came from -- converted once, through the camera.
 *
 * Converted ONCE, and not every frame, which is a deliberate choice about what "where it happened" means on a moving
 * screen. The water scrolls at 25 m/s, so a number pinned to a world position drifts DOWN the screen at ~28 px per
 * second: measured, a popup with a 46px rise still ended up 33px LOWER than it started, because the current won. A
 * number that sinks is not a number that drifts, and the drift is the thing that catches the eye. So the popup is
 * anchored to where the event was at the instant it happened, and rises from there -- the water moving under it is a
 * detail no one tracks in three seconds.
 *
 * ---------------------------------------------------------------------------------------------
 * ONE CLASS, ONE INSTANCE PER STYLE
 * ---------------------------------------------------------------------------------------------
 * Score numbers and damage numbers are the same mechanism with different clothes: rise, hold, fade, pooled label. What
 * differs is entirely in `PopupStyle` (see `config/mechanics.json5`), so the difference is a configuration object and
 * not a second copy of this file. Two copies would be two rise curves to keep in step, and the second one would be the
 * one that drifts.
 *
 * They are separate INSTANCES rather than one field with two styles, and the reason is what the two are FOR: a score
 * number is an event (a creature died, and the number says what that paid) while a damage number is a rate (the gun
 * lands several a second, and the numbers are a stream). Sharing one list would make "how many are in flight" -- the
 * question the debug readout and every probe asks -- stop having an answer, and would let a burst of damage numbers
 * push a just-earned score number out of the pool. Each instance keeps its own cap, its own life, and its own count.
 *
 * The style is held BY REFERENCE to the config object, so the live console tuning this project relies on
 * (`window.__GB.mechRef.damagePopups.size = 20`) still applies to numbers already in the air.
 *
 * ---------------------------------------------------------------------------------------------
 * SIZE FOLLOWS THE HUD, NOT THE WATER
 * ---------------------------------------------------------------------------------------------
 * The position is in world metres, but the FONT is sized like the rest of the screen furniture (`designScale`), not
 * like the water (`viewport.scale`). A number whose job is to be read cannot grow because a metre happens to be
 * worth more pixels on a wide window -- that is the bug the buttons had, and a `+25` scaled by the world zoom in
 * landscape would be a quarter of the screen.
 *
 * Labels are POOLED rather than created per event: a burst of kills can produce several popups in one frame, and
 * each Pixi `Text` is a canvas and a texture. Retired labels are hidden and reused, so a busy screen costs the same
 * as a quiet one.
 */

import { Container, Text } from 'pixi.js';
import { designScale, makeLabel, type Camera, type Viewport } from './background';
import type { PopupStyle } from './mechanisms';

interface Popup {
  label: Text;
  /** SCREEN pixels: where the event happened, converted once when it happened. */
  x: number;
  y: number;
  age: number;
}

export class NumberPopups {
  readonly root = new Container();

  private live: Popup[] = [];
  /** Retired labels, hidden and waiting. */
  private pool: Text[] = [];
  private scale = 1;

  /**
   * @param style the live config object for this kind of number. Held rather than copied, so editing it in the console
   *   changes the numbers already in flight -- which is the whole point of a knob you can turn while watching.
   */
  constructor(private readonly style: PopupStyle) {
    this.root.eventMode = 'none';
  }

  /**
   * Remember the screen scale, and size the popups the way the HUD is sized.
   *
   * Called from the game's `layout`, so a resize re-sizes the next popup rather than stretching the ones already in
   * flight -- a number that is mid-fade is a snapshot of a moment, and re-scaling it would move it under the eye.
   */
  layout(viewport: Viewport): void {
    this.scale = designScale(viewport.width, viewport.height);
  }

  /** How many are in flight, for probes and for the debug readout. */
  get count(): number {
    return this.live.length;
  }

  /** What one of them says, for probes: the most recent, or null. */
  get lastText(): string | null {
    return this.live[this.live.length - 1]?.label.text ?? null;
  }

  /**
   * Say something at a WORLD position, which the camera turns into the screen spot the number appears at.
   *
   * World metres rather than pixels because that is the vocabulary of every event that produces one of these: a pickup
   * has a world x and y, a creature has a world x and y, and the caller should not have to know how the screen is laid
   * out.
   *
   * `value` of 0 or less is ignored, which is what lets a caller announce in one line without reading the config
   * first: an event taken out of the game by a price of 0 must not leave a `+0` floating, and a shot that deals no
   * damage must not leave a `-0`.
   */
  add(worldX: number, worldY: number, value: number, camera: Camera): void {
    if (value <= 0) return;
    const cfg = this.style;
    /**
     * `max: 0` turns this kind of number OFF rather than meaning "unlimited".
     *
     * The cap doubles as the switch for a stream the player may find noisy, and it is the one value that says "none of
     * these": the damage numbers are a rate, so "off" is the first thing anyone would want to try. It costs one
     * comparison to honour.
     */
    if (cfg.max <= 0) return;
    /**
     * At the cap, retire the OLDEST rather than refusing the new one.
     *
     * The newest number is the one the player has just earned and is looking for; an older one that has been fading
     * for two seconds is the one they have already read. Its label goes straight back to the pool, so the cap costs
     * nothing but a swap.
     */
    if (this.live.length >= cfg.max) this.retire(0);
    const label = this.pool.pop() ?? makeLabel('', cfg.colour, cfg.size, cfg.weight);
    /**
     * The style is re-applied on every spawn, not only at construction.
     *
     * A pooled label would otherwise keep whatever the config said the first time it was used, and the owner tunes
     * these numbers live in the console (`window.__GB.mechRef`) as well as in the file -- a pooled label that ignored
     * a live edit would make half the knobs look broken. Pixi's style setters early-return when the value has not
     * changed, so the usual case costs a comparison and no texture work.
     */
    label.style.fontSize = cfg.size;
    label.style.fill = cfg.colour;
    label.style.fontWeight = cfg.weight;
    label.anchor.set(cfg.anchorX, cfg.anchorY);
    label.text = `${cfg.prefix}${value}`;
    label.visible = true;
    label.alpha = cfg.alpha;
    this.root.addChild(label);
    this.live.push({ label, x: camera.toScreenX(worldX), y: camera.toScreenY(worldY), age: 0 });
  }

  /**
   * Say a WORD at a world position, rather than a number.
   *
   * The graze's "擦边！！" is the one user: same rise, hold and fade as a score number, same pool, but
   * there is no value in it -- the announcement IS the content. Sharing the machinery rather than
   * forking it is what keeps one life/one cap/one rise curve, and the style block's own knobs still
   * decide how loud it is. `max: 0` turns this off with the numbers, like everything else here.
   */
  say(worldX: number, worldY: number, text: string, camera: Camera): void {
    const cfg = this.style;
    if (cfg.max <= 0) return;
    if (this.live.length >= cfg.max) this.retire(0);
    const label = this.pool.pop() ?? makeLabel('', cfg.colour, cfg.size, cfg.weight);
    label.style.fontSize = cfg.size;
    label.style.fill = cfg.colour;
    label.style.fontWeight = cfg.weight;
    label.anchor.set(cfg.anchorX, cfg.anchorY);
    label.text = text;
    label.visible = true;
    label.alpha = cfg.alpha;
    this.root.addChild(label);
    this.live.push({ label, x: camera.toScreenX(worldX), y: camera.toScreenY(worldY), age: 0 });
  }

  /**
   * Advance, place and fade everything in flight.
   *
   * The rise and the fade are both functions of the AGE rather than accumulations, so a popup's path is identical
   * whatever the frame rate did on the way -- a dropped frame cannot leave one stranded halfway up. Both are shaped
   * by their own exponent from the config, so "how it moves" is tunable without touching this file.
   */
  update(dt: number): void {
    const cfg = this.style;
    const rise = cfg.risePx * this.scale;
    for (let i = this.live.length - 1; i >= 0; i--) {
      const popup = this.live[i]!;
      popup.age += dt;
      if (popup.age >= cfg.lifeSeconds) {
        this.retire(i);
        continue;
      }
      const t = popup.age / cfg.lifeSeconds;
      popup.label.scale.set(this.scale);
      popup.label.x = popup.x;
      // Upward drift, and the only motion: see the note at the top for why the water's own drift is not added.
      popup.label.y = popup.y - rise * t ** cfg.riseEase;
      /**
       * Full brightness for the first stretch, then a fade.
       *
       * A popup that started fading immediately would be half-read by the time the eye arrived; holding it and then
       * dropping it is what makes a moment feel like a beat rather than like a slow dissolve.
       */
      const faded = t <= cfg.fadeFrom ? 0 : (t - cfg.fadeFrom) / (1 - cfg.fadeFrom);
      popup.label.alpha = cfg.alpha * (1 - faded ** cfg.fadeEase);
    }
  }

  /** Drop everything: a new run must not inherit the last one's numbers. */
  clear(): void {
    while (this.live.length) this.retire(this.live.length - 1);
  }

  private retire(index: number): void {
    const popup = this.live[index];
    if (!popup) return;
    this.live.splice(index, 1);
    popup.label.visible = false;
    this.root.removeChild(popup.label);
    this.pool.push(popup.label);
  }
}
