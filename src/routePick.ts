/**
 * The form picker: the screen between 开始游戏 and the water.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A SCREEN AND NOT A ROW ON THE MENU
 * ---------------------------------------------------------------------------------------------
 * The choice happens once per run and before anything else about the run exists, and the menu is the wrong place for
 * it for two reasons. The menu's buttons are pictures cut from one shared box (see `src/menu.ts`), so a row of text
 * options would be a second visual language on a screen that has one; and the menu is where you go to *finish*, while
 * this is the first decision of a run -- the same distinction that put the loading page between the two rather than a
 * progress bar over the water.
 *
 * So: 开始游戏 opens this, picking a form starts the load, and the load starts the run. A DEATH does not come back
 * here -- the run's form is the run's, and being asked again every time you die would turn a decision into a toll.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS LOCKED, AND WHY IT IS SHOWN LOCKED
 * ---------------------------------------------------------------------------------------------
 * The two evolved forms are locked until the campaign has been cleared once, and they are drawn anyway -- dimmed, with
 * the reason under them. A player who cannot see what they are working towards is not working towards anything.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS CONFIG AND WHAT IS CODE
 * ---------------------------------------------------------------------------------------------
 * The sizes, the colours and the card's own dimensions are `mech.routePick` -- those are the things to tune. The
 * proportions INSIDE a card (where its four lines sit, as fractions of its height) are here rather than in the
 * config, because they are not a knob: moving them is redrawing the card, not adjusting it.
 */
import { Container, Graphics, Text } from 'pixi.js';
import { mech } from './mechanisms';
import { designScale } from './viewport';

/** One form, as this screen needs it: what it is called, and whether the save has earned it. */
export interface RouteOption {
  id: string;
  name: string;
  title: string;
  blurb: string;
  locked: boolean;
}

/** Where the card's four lines sit, as fractions of its height. See the note above about why these are not config. */
const NAME_AT = 0.24;
const TITLE_AT = 0.45;
const BLURB_AT = 0.68;
const LOCK_AT = 0.88;

function mkText(text: string, colour: number, size: number): Text {
  return new Text({
    text,
    style: { fill: colour, fontSize: size, fontFamily: mech.text.fontFamily, align: 'center' },
  });
}

export class RoutePickScreen {
  readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly cards = new Graphics();
  private readonly heading: Text;
  private readonly subheading: Text;
  private readonly names: Text[] = [];
  private readonly titles: Text[] = [];
  private readonly blurbs: Text[] = [];
  private readonly locks: Text[] = [];

  private options: RouteOption[] = [];
  /** Where each card is, so the pointer can be answered without re-deriving the layout. */
  private rects: { id: string; locked: boolean; x: number; y: number; w: number; h: number }[] = [];
  /** The card the pointer went down on, for the press-and-drag-out-to-cancel behaviour the menu has. */
  private pressed: string | null = null;
  private hovering: string | null = null;
  private canvas = { width: 0, height: 0 };

  /** Fired with the chosen form's id. The caller starts the load; this screen does not know what a run is. */
  onPick: (id: string) => void = () => {};

  constructor() {
    const cfg = mech.routePick;
    this.heading = mkText('选择形态', cfg.headingColour, cfg.headingSize);
    this.subheading = mkText('这一局，你是哪一种气泡', cfg.subheadingColour, cfg.subheadingSize);
    this.root.addChild(this.backdrop, this.cards, this.heading, this.subheading);
    this.heading.anchor.set(0.5);
    this.subheading.anchor.set(0.5);
  }

  /**
   * Show these forms. Called every time the screen opens rather than once at construction, because the save changes
   * between one run and the next -- clearing the campaign is exactly what this screen is about.
   */
  setOptions(options: readonly RouteOption[]): void {
    this.options = [...options];
    const cfg = mech.routePick;
    for (let i = 0; i < options.length; i++) {
      const option = options[i]!;
      const name = (this.names[i] ??= this.addText(mkText('', cfg.nameColour, cfg.nameSize)));
      const title = (this.titles[i] ??= this.addText(mkText('', cfg.titleColour, cfg.titleSize)));
      const blurb = (this.blurbs[i] ??= this.addText(mkText('', cfg.mutedColour, cfg.blurbSize)));
      const lock = (this.locks[i] ??= this.addText(mkText('', cfg.lockColour, cfg.lockSize)));
      name.text = option.name;
      title.text = option.title;
      blurb.text = option.blurb;
      lock.text = option.locked ? '通关一次解锁' : '';
      for (const node of [name, title, blurb, lock]) {
        node.anchor.set(0.5);
        node.alpha = option.locked ? cfg.lockedAlpha : 1;
      }
      lock.visible = option.locked;
    }
    for (let i = options.length; i < this.names.length; i++) {
      for (const node of [this.names[i], this.titles[i], this.blurbs[i], this.locks[i]]) node!.visible = false;
    }
  }

  private addText(node: Text): Text {
    this.root.addChild(node);
    return node;
  }

  layout(viewport: { width: number; height: number }): void {
    const cfg = mech.routePick;
    const s = designScale(viewport.width, viewport.height);
    this.canvas = { width: viewport.width, height: viewport.height };
    const cx = viewport.width / 2;
    this.backdrop.clear();
    this.backdrop
      .rect(0, 0, viewport.width, viewport.height)
      .fill({ color: cfg.backdropColour, alpha: cfg.backdropAlpha });

    const count = this.options.length;
    const h = cfg.cardHeight * s;
    const gap = cfg.cardGap * s;
    const total = count * h + Math.max(0, count - 1) * gap;
    const headingY = Math.max(cfg.topMargin * s, (viewport.height - total) / 2 - cfg.headingGap * s);
    this.heading.position.set(cx, headingY);
    this.heading.scale.set(s);
    this.subheading.position.set(cx, headingY + cfg.subheadingGap * s);
    this.subheading.scale.set(s);

    let y = headingY + cfg.headingGap * s;
    const w = Math.min(viewport.width * cfg.maxWidthRatio, cfg.maxWidth * s);
    const x = cx - w / 2;
    this.rects = [];
    this.cards.clear();
    for (let i = 0; i < count; i++) {
      const option = this.options[i]!;
      this.rects.push({ id: option.id, locked: option.locked, x, y, w, h });
      const highlighted = this.hovering === option.id && !option.locked;
      this.cards
        .roundRect(x, y, w, h, cfg.cardRadius * s)
        .fill({ color: cfg.cardFillColour, alpha: cfg.cardAlpha })
        .stroke({
          color: highlighted ? cfg.selectedStrokeColour : cfg.cardStrokeColour,
          width: (highlighted ? cfg.selectedStrokeWidth : cfg.cardStrokeWidth) * s,
          alpha: option.locked ? cfg.lockedAlpha : 1,
        });
      const at = (fraction: number) => y + h * fraction;
      for (const [node, fraction] of [
        [this.names[i]!, NAME_AT],
        [this.titles[i]!, TITLE_AT],
        [this.blurbs[i]!, BLURB_AT],
        [this.locks[i]!, LOCK_AT],
      ] as const) {
        node.position.set(cx, at(fraction));
        node.scale.set(s);
      }
      y += h + gap;
    }
  }

  handlePointerDown(x: number, y: number): boolean {
    this.pressed = this.cardAt(x, y)?.id ?? null;
    this.hovering = this.pressed;
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    const next = this.cardAt(x, y)?.id ?? null;
    if (next === this.hovering) return false;
    this.hovering = next;
    // Redraw for the hover highlight: the cards are one Graphics, so a highlight is a repaint rather than a property.
    if (this.canvas.width > 0) this.layout(this.canvas);
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const pressed = this.pressed;
    this.pressed = null;
    const card = this.rects.find((candidate) => candidate.id === pressed);
    // Released over the card it started on, and not a locked one: the same press-and-drag-out-to-cancel rule the
    // menu's buttons use, so a wrong tap can be taken back by sliding off before letting go.
    if (card && !card.locked && this.inRect(card, x, y)) this.onPick(card.id);
    return true;
  }

  private cardAt(x: number, y: number): { id: string; locked: boolean } | undefined {
    return this.rects.find((card) => this.inRect(card, x, y));
  }

  private inRect(rect: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
