import { Container, Graphics, Text } from 'pixi.js';
import { mech } from './mechanisms';
import { designScale, type Viewport } from './viewport';
import type { Mutation } from './mutations';

/**
 * The mutation pick: a full freeze, three cards, one mandatory choice.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT IS BUILT LIKE THE SETTINGS PANEL
 * ---------------------------------------------------------------------------------------------
 * Same shape, same reasons (see `src/settings.ts`): hand-rolled rectangles hit-tested by hand, because
 * stage-level listeners plus explicit geometry is how this project removed an entire class of control
 * bug. The panel does not pause anything itself -- the GAME owns the run and freezes it before opening
 * this -- and the pick is reported through `onPick` rather than applied here, so a probe can drive the
 * modal through the same code path as a finger.
 *
 * The three cards are drawn from the Mutation table (name + blurb), and the badge on each card says
 * which of 1/2/3 picks it -- that badge is the whole keyboard story. A pick is MANDATORY, so there is
 * no close button and no scrim-tap-to-dismiss: the only ways out are the cards.
 */

/** One card: its hit rectangle, its two labels, and its press state. */
interface Card {
  bg: Graphics;
  name: Text;
  blurb: Text;
  x: number;
  y: number;
  w: number;
  h: number;
  pressed: boolean;
}

export class LevelUpUi {
  readonly root = new Container();
  /** Whether the modal is up. The game reads this to decide what may be touched. */
  open = false;
  /** Called with 0, 1 or 2 when a card is picked -- by a release on the card, or by the number keys. */
  onPick: (index: number) => void = () => {};

  private readonly scrim = new Graphics();
  private readonly panelBg = new Graphics();
  private readonly title: Text;
  private readonly hint: Text;
  /** The cards currently offered. Empty whenever the modal is closed. */
  private choices: readonly Mutation[] = [];
  private cards: Card[] = [];
  private readonly panelRect = { x: 0, y: 0, w: 0, h: 0 };
  private scale = 1;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor() {
    // Nothing in this tree is interactive; see the settings panel for why the game routes every pointer
    // event itself and this module only hit-tests rectangles.
    this.root.eventMode = 'none';
    this.root.visible = false;

    this.title = mkText('突变 · 三选一', 0x9ff2ff, 22);
    this.title.anchor.set(0.5, 0);
    this.hint = mkText('点一张卡，或按 1 / 2 / 3', 0x7fa8c8, 12);
    this.hint.anchor.set(0.5, 1);

    this.root.addChild(this.scrim, this.panelBg, this.title, this.hint);
  }

  /**
   * Open with a fresh draw of cards, replacing whatever was offered before.
   *
   * Re-opening rather than reopening: a banked second level shows NEW cards, because the picks are
   * drawn when the level is spent and the pool may have changed shape since (the gun may now be capped,
   * the carried skill gone).
   */
  openWith(choices: readonly Mutation[]): void {
    this.choices = choices;
    this.open = true;
    this.root.visible = true;
    // The previous cards leave with the panel they belonged to -- labels pooled or not, a fresh draw
    // must not show a stale card for the frame before `layoutCards` runs.
    for (const card of this.cards) {
      this.root.removeChild(card.bg, card.name, card.blurb);
    }
    this.cards = choices.map(() => {
      const bg = new Graphics();
      bg.eventMode = 'none';
      const name = mkText('', 0xeaf9ff, 17);
      name.anchor.set(0.5, 1);
      const blurb = mkText('', 0x9fd8f0, 12);
      blurb.anchor.set(0.5, 0);
      this.root.addChild(bg, name, blurb);
      return { bg, name, blurb, x: 0, y: 0, w: 0, h: 0, pressed: false };
    });
    this.layoutCards();
  }

  /** Close. The game has already applied the pick; this only puts the furniture away. */
  close(): void {
    this.open = false;
    this.root.visible = false;
    this.choices = [];
  }

  /** The card on offer at an index, for the keyboard path to name in its banner. */
  choiceAt(index: number): Mutation | null {
    return this.choices[index] ?? null;
  }

  layout(viewport: Viewport): void {
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    this.canvasWidth = viewport.width;
    this.canvasHeight = viewport.height;

    // The panel: most of the lane's width, centred -- the same frame the settings panel uses, so the
    // two modals of the game read as furniture from one house.
    const w = Math.min(viewport.laneWidthPx * 0.9, 460 * s);
    const h = Math.min(viewport.height * 0.62, 420 * s);
    this.panelRect.x = (viewport.width - w) / 2;
    this.panelRect.y = (viewport.height - h) / 2;
    this.panelRect.w = w;
    this.panelRect.h = h;

    this.title.scale.set(s);
    this.title.x = viewport.width / 2;
    this.title.y = this.panelRect.y + 22 * s;

    this.hint.scale.set(s);
    this.hint.x = viewport.width / 2;
    this.hint.y = this.panelRect.y + h - 14 * s;

    this.layoutCards();
  }

  /** Place and draw the cards for the current choices. Called on layout and on open. */
  private layoutCards(): void {
    const s = this.scale;
    const p = this.panelRect;

    // The scrim and the panel frame, full-canvas and panel-sized respectively. Rebuilt here because
    // `openWith` can run before the next `layout` on a resize, and a card without its frame is a card
    // floating over live water.
    this.scrim.clear();
    this.scrim.rect(0, 0, this.canvasWidth, this.canvasHeight).fill({ color: 0x02060d, alpha: 0.86 });
    this.panelBg.clear();
    this.panelBg
      .roundRect(p.x, p.y, p.w, p.h, 18 * s)
      .fill({ color: 0x0e1c2f, alpha: 0.97 })
      .stroke({ color: 0x6dc7e8, alpha: 0.5, width: 1.5 * s });

    const inset = 24 * s;
    const cardW = p.w - inset * 2;
    const cardH = Math.min(92 * s, (p.h - 130 * s) / Math.max(1, this.cards.length) - 8 * s);
    const top = p.y + 66 * s;
    for (const [index, card] of this.cards.entries()) {
      const rect = { x: p.x + inset, y: top + index * (cardH + 10 * s), w: cardW, h: cardH };
      card.x = rect.x;
      card.y = rect.y;
      card.w = rect.w;
      card.h = rect.h;

      const mutation = this.choices[index]!;
      card.name.text = `${index + 1} · ${mutation.name}`;
      card.name.scale.set(s);
      card.name.x = rect.x + rect.w / 2;
      card.name.y = rect.y + rect.h * 0.62;
      card.blurb.text = mutation.blurb;
      card.blurb.scale.set(s);
      card.blurb.x = rect.x + rect.w / 2;
      card.blurb.y = rect.y + rect.h * 0.68;

      this.drawCard(card);
    }
  }

  /** A card's look: pressed state included, because a press the player can see is a press they can cancel. */
  private drawCard(card: Card): void {
    const s = this.scale;
    card.bg.clear();
    card.bg
      .roundRect(card.x, card.y, card.w, card.h, 12 * s)
      .fill({ color: card.pressed ? 0x1d4a66 : 0x16293f, alpha: 0.96 })
      .stroke({ color: card.pressed ? 0x9ff2ff : 0x5fa8cc, alpha: 0.8, width: 1.4 * s });
  }

  private inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }): boolean {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  // ---------------------------------------------------------------------------------------------
  // Pointer handling. Every entry point returns whether it CONSUMED the event, so the game can decide
  // whether the water controls should also see it. While open, this panel swallows everything.
  // ---------------------------------------------------------------------------------------------

  handlePointerDown(_pointerId: number, x: number, y: number): boolean {
    if (!this.open) return false;
    for (const card of this.cards) {
      if (this.inRect(x, y, card)) card.pressed = true;
    }
    this.redraw();
    return true;
  }

  handlePointerMove(_pointerId: number, x: number, y: number): boolean {
    if (!this.open) return false;
    // A finger that slid off a card has changed its mind; the press must not fire on release.
    for (const card of this.cards) {
      if (card.pressed && !this.inRect(x, y, card)) card.pressed = false;
    }
    this.redraw();
    return true;
  }

  handlePointerUp(_pointerId: number, x: number, y: number): boolean {
    if (!this.open) return false;
    for (const card of this.cards) {
      const wasPressed = card.pressed;
      card.pressed = false;
      if (wasPressed && this.inRect(x, y, card)) this.onPick(this.cards.indexOf(card));
    }
    this.redraw();
    return true;
  }

  /** The press highlight, redrawn from state. Cheap: three cards. */
  private redraw(): void {
    for (const card of this.cards) this.drawCard(card);
  }
}

/** A card label, in the configured UI font -- the same constructor the settings panel uses. */
function mkText(text: string, colour: number, size: number): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: mech.text.fontFamily,
      fontSize: size,
      fill: colour,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  });
  label.resolution = 2;
  return label;
}
