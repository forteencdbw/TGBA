import { CanvasTextMetrics, Container, Graphics, Text } from 'pixi.js';
import { makeLabel } from './background';
import { mech } from './mechanisms';
import { HazardField, KIND_TUNING, hazardHealth, paintHazards, type HazardKind } from './hazards';
import { ObstacleField, paintObstacles } from './obstacles';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import {
  CODEX_CATEGORIES,
  entriesFor,
  iconColour,
  pageCount,
  pageEntries,
  type CodexCategory,
  type CodexEntry,
  type CodexGlyph,
} from './codex';

/**
 * The codex page: a paged card list, reached from the main menu.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY IT IS DRAWN IN PIXI RATHER THAN AS DOM
 * ---------------------------------------------------------------------------------------------
 * There is no DOM UI in this project -- the menu and the settings panel are Pixi trees with hand-rolled hit testing,
 * and adding one HTML overlay would be a second UI system with its own layout rules, its own scaling, and its own
 * way of disagreeing with the canvas about where a button is. The cost is that every control here is a rectangle in
 * a list, which for a page of tabs and buttons is not much of a cost.
 *
 * ---------------------------------------------------------------------------------------------
 * EVERYTHING IS DRAWN ON CHANGE, NOT PER FRAME
 * ---------------------------------------------------------------------------------------------
 * Nothing on this page animates, so there is no per-frame work at all: a tab press, a page turn and a resize each
 * schedule one full redraw, and the render loop only toggles `root.visible`. That is not an optimisation for its own
 * sake -- it is what keeps the creature icons affordable, because building one is building a whole hazard object and
 * running the game's painter over it. Doing that sixty times a second to draw a still image would be absurd, and the
 * per-frame version of this file allocated six of them every frame.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS REUSED FROM THE GAME, AND WHY IT MATTERS
 * ---------------------------------------------------------------------------------------------
 * The creature and obstacle icons go through `paintHazards` and `paintObstacles` -- the REAL painters -- over a
 * synthetic field holding one object. So the picture on a card is the picture in the water and cannot drift from it:
 * retune a creature's radius or colour and its card follows.
 *
 * The other icons (the bubble, its verbs, the skills, the talents) have no runtime object to hand to a painter -- a
 * skill does not exist on screen outside the moment it is used -- so they are small procedural glyphs drawn here.
 * That duplicates a few SHAPES, not any rule: their colours still come from the config, and nothing about how a skill
 * behaves is restated.
 */

/** A rectangle in canvas pixels, the only hit-testing primitive this page needs. */
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Card {
  rect: Rect;
  entry: CodexEntry;
}

export class CodexUi {
  readonly root = new Container();

  private readonly backdrop = new Graphics();
  private readonly chrome = new Graphics();
  private readonly icons = new Graphics();
  private readonly title: Text;
  private readonly pageLabel: Text;
  private readonly tabLabels: Text[] = [];
  private readonly buttonLabels: Text[] = [];
  private readonly cardTexts: Text[] = [];

  /** Which tab is open, and which page of it. */
  private category: CodexCategory = 'enemy';
  private page = 0;

  /** Layout, recomputed by `layout`. Everything here is CANVAS PIXELS. */
  private scale = 1;
  private tabs: { id: CodexCategory; rect: Rect }[] = [];
  private cards: Card[] = [];
  private buttons: { id: 'prev' | 'next' | 'back'; rect: Rect }[] = [];
  /**
   * The card grid's cell geometry, recomputed by `layout` and reused by every redraw.
   *
   * Held rather than recomputed because a page turn needs to place new cards in the SAME cells, and re-deriving them
   * would mean either passing the viewport into a redraw or recomputing the whole page layout for a button press.
   */
  private grid = { left: 0, top: 0, cellW: 0, cellH: 0, gap: 0 };
  /** Canvas size from the last layout, so a press can be swallowed without a viewport. */
  private size = { width: 0, height: 0 };
  private laidOut = false;

  /** Called when the player asks to leave. */
  onBack: () => void = () => {};

  constructor() {
    this.root.eventMode = 'none';
    for (const child of [this.backdrop, this.chrome, this.icons]) child.eventMode = 'none';

    const cfg = mech.codex;
    this.title = makeLabel('图鉴 / BESTIARY', cfg.titleColour, cfg.titleSize);
    this.pageLabel = makeLabel('', cfg.pageTextColour, cfg.pageTextSize);
    this.root.addChild(this.backdrop, this.chrome, this.icons, this.title, this.pageLabel);

    for (const c of CODEX_CATEGORIES) {
      const label = makeLabel(c.label, cfg.tabTextColour, cfg.tabTextSize);
      this.tabLabels.push(label);
      this.root.addChild(label);
    }
    for (const label of ['◀ 上一页', '返回', '下一页 ▶']) {
      const text = makeLabel(label, cfg.buttonTextColour, cfg.buttonTextSize);
      this.buttonLabels.push(text);
      this.root.addChild(text);
    }
  }

  /** Cards visible at once, from the config. */
  private get perPage(): number {
    return Math.max(1, mech.codex.columns * mech.codex.rows);
  }

  /**
   * Test hook: what the page is showing.
   *
   * `visible` is the entry ids drawn, so a probe asserts what is ON the cards rather than what the data module says
   * should be -- the two can disagree, and only one of them is the thing the player is looking at.
   */
  get state(): { category: CodexCategory; page: number; pages: number; total: number; visible: readonly string[] } {
    return {
      category: this.category,
      page: this.page,
      pages: pageCount(this.category, this.perPage),
      total: entriesFor(this.category).length,
      visible: this.cards.map((c) => c.entry.id),
    };
  }

  /** Test hook: the clickable regions, so a probe aims at the real controls instead of guessing. */
  get geometry(): {
    tabs: { id: CodexCategory; rect: Rect }[];
    buttons: { id: string; rect: Rect }[];
    cards: { id: string; rect: Rect }[];
  } {
    return {
      tabs: this.tabs.map((t) => ({ id: t.id, rect: { ...t.rect } })),
      buttons: this.buttons.map((b) => ({ id: b.id, rect: { ...b.rect } })),
      cards: this.cards.map((c) => ({ id: c.entry.id, rect: { ...c.rect } })),
    };
  }

  /**
   * Test hook: the text actually drawn on the cards, in order.
   *
   * The strings rather than the entries, because the claim worth testing about this page is that a card's NUMBERS
   * come from the live tables -- and the only way to see that is to read what was drawn. Asking the data module
   * would pass while the page showed something else entirely.
   */
  get texts(): readonly string[] {
    return this.cardTexts.map((t) => t.text);
  }

  /** Open the page, optionally on a particular tab, always at its first page. */
  show(category: CodexCategory = 'enemy'): void {
    this.category = category;
    this.page = 0;
    if (this.laidOut) this.redraw();
  }

  layout(viewport: Viewport): void {
    const cfg = mech.codex;
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    this.size = { width: viewport.width, height: viewport.height };
    this.laidOut = true;

    /**
     * Laid out inside the LANE, not across the whole canvas.
     *
     * On a 2560px desktop window the canvas is mostly letterbox, and a card grid stretched across it would put the
     * text of one card a foot away from the text of the next. The lane is the box everything else in this game is
     * composed for.
     */
    const left = viewport.left + cfg.margin * s;
    const width = viewport.laneWidthPx - cfg.margin * 2 * s;
    const centreX = viewport.left + viewport.laneWidthPx / 2;

    this.backdrop.clear();
    this.backdrop.rect(0, 0, viewport.width, viewport.height).fill({ color: 0x030a17, alpha: 1 });

    this.title.style.fontSize = cfg.titleSize;
    this.title.scale.set(s);
    this.title.anchor.set(0.5, 0);
    this.title.x = centreX;
    this.title.y = cfg.titleY * s;

    // The tabs share the lane evenly, with `tabGap` between them.
    const gap = cfg.tabGap * s;
    const tabW = (width - gap * (CODEX_CATEGORIES.length - 1)) / CODEX_CATEGORIES.length;
    const tabY = (cfg.titleY + cfg.titleSize + 16) * s;
    this.tabs = CODEX_CATEGORIES.map((c, i) => ({
      id: c.id,
      rect: { x: left + i * (tabW + gap), y: tabY, w: tabW, h: cfg.tabHeight * s },
    }));
    for (const [i, tab] of this.tabs.entries()) {
      const label = this.tabLabels[i]!;
      label.style.fontSize = cfg.tabTextSize;
      label.scale.set(s);
      label.anchor.set(0.5, 0.5);
      label.x = tab.rect.x + tab.rect.w / 2;
      label.y = tab.rect.y + tab.rect.h / 2;
    }

    this.pageLabel.style.fontSize = cfg.pageTextSize;
    this.pageLabel.scale.set(s);
    this.pageLabel.anchor.set(0.5, 0);
    this.pageLabel.x = centreX;
    this.pageLabel.y = tabY + cfg.tabHeight * s + 10 * s;

    // The card grid: the CELL geometry is fixed by the viewport, but WHICH entries go in the cells depends on the
    // tab and the page -- and those change without a resize, so the slicing is its own step. See `rebuildCards`.
    const cellGap = cfg.gap * s;
    this.grid = {
      left,
      top: (cfg.headerHeight + cfg.titleY) * s,
      cellW: (width - cellGap * (cfg.columns - 1)) / cfg.columns,
      cellH:
        (viewport.height - (cfg.footerHeight + cfg.margin) * s - (cfg.headerHeight + cfg.titleY) * s - cellGap * (cfg.rows - 1)) /
        cfg.rows,
      gap: cellGap,
    };

    // The footer: prev, back, next. Fixed thirds rather than measured labels, so the layout does not depend on the
    // font metrics of a translated string.
    const btnH = cfg.buttonHeight * s;
    const btnY = viewport.height - (cfg.footerHeight - 8) * s;
    const third = width / 3;
    this.buttons = [
      { id: 'prev', rect: { x: left, y: btnY, w: third - cellGap, h: btnH } },
      { id: 'back', rect: { x: left + third, y: btnY, w: third - cellGap * 2, h: btnH } },
      { id: 'next', rect: { x: left + third * 2, y: btnY, w: third - cellGap, h: btnH } },
    ];
    for (const [i, button] of this.buttons.entries()) {
      const label = this.buttonLabels[i]!;
      label.style.fontSize = cfg.buttonTextSize;
      label.scale.set(s);
      label.anchor.set(0.5, 0.5);
      label.x = button.rect.x + button.rect.w / 2;
      label.y = button.rect.y + button.rect.h / 2;
    }

    this.redraw();
  }

  /**
   * Work out which entries are on which cards, from the current tab and page.
   *
   * Its own step, called by anything that changes the tab, the page, or the cell geometry. Folding it into `layout`
   * was the first version, and it produced a page-turn that redrew page 0 with the card list it already had -- a bug
   * that looks exactly like a dead button, which is why a page turn is tested rather than assumed.
   */
  private rebuildCards(): void {
    const cfg = mech.codex;
    const shown = pageEntries(this.category, this.page, this.perPage);
    this.cards = shown.map((entry, i) => {
      const col = i % cfg.columns;
      const row = Math.floor(i / cfg.columns);
      return {
        entry,
        rect: {
          x: this.grid.left + col * (this.grid.cellW + this.grid.gap),
          y: this.grid.top + row * (this.grid.cellH + this.grid.gap),
          w: this.grid.cellW,
          h: this.grid.cellH,
        },
      };
    });
  }

  /**
   * Handle a pointer press. Returns true when the press was inside the page, so the host leaves the water alone.
   *
   * A press fires its action IMMEDIATELY rather than on release, matching the menu's start button: these controls are
   * large, deliberate and never held, so press-to-fire is what a player expects from a list of buttons.
   */
  handlePointerDown(x: number, y: number): boolean {
    for (const tab of this.tabs) {
      if (!inside(tab.rect, x, y)) continue;
      this.show(tab.id);
      return true;
    }

    for (const [i, button] of this.buttons.entries()) {
      if (!inside(button.rect, x, y)) continue;
      const pages = pageCount(this.category, this.perPage);
      if (button.id === 'back') {
        this.onBack();
        return true;
      }
      const next = button.id === 'next' ? Math.min(pages - 1, this.page + 1) : Math.max(0, this.page - 1);
      if (next !== this.page) {
        this.page = next;
        this.redraw();
      }
      void i;
      return true;
    }

    // Anywhere else on the page is still a press the WATER must not see: a tap in the margin should do nothing
    // rather than steer a bubble that is not running. `size` is the canvas, which the page covers entirely.
    void this.cards;
    return inside({ x: 0, y: 0, w: this.size.width, h: this.size.height }, x, y);
  }

  /** Redraw everything: the chrome, the icons and the card text. Called on any change, never per frame. */
  private redraw(): void {
    const cfg = mech.codex;
    const s = this.scale;
    const g = this.chrome;
    g.clear();
    this.icons.clear();

    this.rebuildCards();

    this.title.style.fill = cfg.titleColour;
    this.pageLabel.style.fill = cfg.pageTextColour;

    for (const tab of this.tabs) {
      const active = tab.id === this.category;
      g.roundRect(tab.rect.x, tab.rect.y, tab.rect.w, tab.rect.h, cfg.buttonRadius * s).fill({
        color: active ? cfg.activeTabFill : cfg.tabFill,
        alpha: 1,
      });
      g.roundRect(tab.rect.x, tab.rect.y, tab.rect.w, tab.rect.h, cfg.buttonRadius * s).stroke({
        color: active ? cfg.activeTabStroke : cfg.tabStroke,
        alpha: active ? 0.95 : 0.6,
        width: Math.max(1, 1.4 * s),
      });
    }
    for (const [i, tab] of this.tabs.entries()) {
      this.tabLabels[i]!.style.fill = tab.id === this.category ? cfg.activeTabTextColour : cfg.tabTextColour;
    }

    const pages = pageCount(this.category, this.perPage);
    const label = CODEX_CATEGORIES.find((c) => c.id === this.category)?.label ?? '';
    this.pageLabel.text = `${label}  ·  ${entriesFor(this.category).length} 条  ·  第 ${this.page + 1} / ${pages} 页`;

    for (const card of this.cards) {
      g.roundRect(card.rect.x, card.rect.y, card.rect.w, card.rect.h, cfg.cardRadius * s).fill({
        color: cfg.cardFill,
        alpha: cfg.cardFillAlpha,
      });
      g.roundRect(card.rect.x, card.rect.y, card.rect.w, card.rect.h, cfg.cardRadius * s).stroke({
        color: cfg.cardStroke,
        alpha: cfg.cardStrokeAlpha,
        width: Math.max(1, 1.2 * s),
      });
      this.drawIcon(card, s);
    }

    for (const [i, button] of this.buttons.entries()) {
      const enabled = button.id === 'back' || (button.id === 'prev' ? this.page > 0 : this.page < pages - 1);
      g.roundRect(button.rect.x, button.rect.y, button.rect.w, button.rect.h, cfg.buttonRadius * s).fill({
        color: cfg.buttonFill,
        alpha: enabled ? 1 : 0.4,
      });
      g.roundRect(button.rect.x, button.rect.y, button.rect.w, button.rect.h, cfg.buttonRadius * s).stroke({
        color: cfg.buttonStroke,
        alpha: enabled ? 0.9 : 0.35,
        width: Math.max(1, 1.4 * s),
      });
      this.buttonLabels[i]!.alpha = enabled ? 1 : 0.35;
    }

    this.rebuildCardTexts();
  }

  /**
   * Text objects are created and thrown away per card rather than pooled.
   *
   * The page changes only when somebody presses a button, so the allocation is bounded by human input: a handful of
   * Text objects per press, versus a pool that has to be sized, re-keyed and kept in step with the layout. The
   * per-frame layers are `Graphics`, which are cleared and repainted and never rebuilt.
   */
  private rebuildCardTexts(): void {
    for (const text of this.cardTexts) {
      this.root.removeChild(text);
      text.destroy();
    }
    this.cardTexts.length = 0;

    const cfg = mech.codex;
    const s = this.scale;
    for (const card of this.cards) {
      const pad = cfg.cardPad * s;
      const iconW = cfg.iconSize * s;
      const textLeft = card.rect.x + pad + iconW + 8 * s;
      const textW = card.rect.w - pad * 2 - iconW - 8 * s;

      const name = makeLabel(card.entry.name, cfg.nameColour, cfg.nameSize);
      name.scale.set(s);
      name.x = textLeft;
      name.y = card.rect.y + pad;
      wrap(name, textW / s, cfg.nameSize + 4);
      this.pushText(name);

      const tagline = makeLabel(card.entry.tagline, cfg.taglineColour, cfg.taglineSize);
      tagline.scale.set(s);
      tagline.x = textLeft;
      tagline.y = name.y + (cfg.nameSize + 5) * s;
      wrap(tagline, textW / s, cfg.taglineSize + 3);
      this.pushText(tagline);

      let y = card.rect.y + pad + iconW + 6 * s;
      const labelW = cfg.factLabelWidth * s;
      const factLeft = card.rect.x + pad;
      for (const fact of card.entry.facts) {
        /**
         * TWO Texts per fact, so the label can be dimmer than the value.
         *
         * The first version put `label  value` in one string, which is half the objects -- and it made the label and
         * the value the same colour, so `factLabelColour` was a config key that did nothing and a column of facts
         * read as a wall. A fixed-width label column is also what makes the values line up down the card, which is
         * the whole reason a reference page is scannable.
         */
        const label = makeLabel(fact.label, cfg.factLabelColour, cfg.factSize);
        label.scale.set(s);
        label.x = factLeft;
        label.y = y;
        this.pushText(label);

        const value = makeLabel(fact.value, cfg.factValueColour, cfg.factSize);
        value.scale.set(s);
        value.x = factLeft + labelW;
        value.y = y;
        // Wrapped to what is left of the card after the label column, so a long value uses the space beside the
        // label rather than running under it.
        wrap(value, (card.rect.w - pad * 2 - labelW) / s, cfg.factLeading);
        this.pushText(value);
        y += cfg.factLeading * s * lineCount(value);
      }

      y += 4 * s;
      const noteWidth = (card.rect.w - pad * 2 - cfg.noteBulletIndent * s) / s;
      for (const note of card.entry.notes) {
        // Stop rather than overflow: a card that spills into the one below it is worse than a card that ends early,
        // and the prose is authored to fit. Anything cut off is visible as a missing line, not as a broken layout.
        if (y > card.rect.y + card.rect.h - cfg.noteLeading * s) break;

        /**
         * The bullet is its OWN object, and that is not fussiness.
         *
         * Writing `· ${note}` in one string puts a space in it, which is a token boundary as far as Pixi's wrap is
         * concerned: the whole Chinese sentence is then a single "word" that does not fit after the bullet, so it
         * moves to the next line and leaves a lone `·` sitting above the paragraph. Separating them removes the
         * boundary, and it means the indent is a number the owner can tune rather than a character width.
         */
        const bullet = makeLabel('·', cfg.noteColour, cfg.noteSize);
        bullet.scale.set(s);
        bullet.x = card.rect.x + pad;
        bullet.y = y;
        this.pushText(bullet);

        const line = makeLabel(note, cfg.noteColour, cfg.noteSize);
        line.scale.set(s);
        line.x = card.rect.x + pad + cfg.noteBulletIndent * s;
        line.y = y;
        wrap(line, noteWidth, cfg.noteLeading);
        this.pushText(line);
        y += cfg.noteLeading * s * lineCount(line);
      }
    }
  }

  private pushText(text: Text): void {
    this.cardTexts.push(text);
    this.root.addChild(text);
  }

  /**
   * Draw one card's icon, centred in its square.
   *
   * Creatures and obstacles go through the game's own painters; everything else is a small glyph. See the class
   * comment for where that line is and why.
   */
  private drawIcon(card: Card, s: number): void {
    const cfg = mech.codex;
    const g = this.icons;
    const pad = cfg.cardPad * s;
    const box = cfg.iconSize * s;
    const cx = card.rect.x + pad + box / 2;
    const cy = card.rect.y + pad + box / 2;
    const colour = iconColour(card.entry);
    const icon = card.entry.icon;

    if (icon.kind === 'hazard') {
      /**
       * A one-object field, drawn by the real painter.
       *
       * `laneWidth` is chosen so the creature fills about a third of the box: a hazard's radius is a fraction of the
       * lane, so passing the lane width that makes its radius the size wanted gives the card a readable picture
       * without inventing a second set of sizes. `ICON_LANE_DIVISOR` is that choice, and it is a divisor rather than
       * a size so every creature keeps its PROPORTIONS relative to the others -- a crab still reads as bigger than a
       * fish, exactly as it does in the water.
       */
      const kind: HazardKind = icon.hazard;
      const lane = box / (KIND_TUNING[kind].radius * ICON_LANE_DIVISOR);
      const field = new HazardField();
      field.hazards = [
        {
          id: 0,
          kind,
          x: cx,
          y: cy,
          radiusFraction: KIND_TUNING[kind].radius,
          phase: ICON_PHASE,
          seed: 0,
          baitedUntil: 0,
          squashed: 0,
          gripping: false,
          gripSeconds: 0,
          fuse: 0,
          fired: false,
          armed: false,
          fed: 0,
          digest: 0,
          // Not arriving from anywhere: the card draws it at rest.
          entry: null,
          // Untouched hit points, so the card shows a creature rather than one that has been driven off.
          health: hazardHealth(kind),
          maxHealth: hazardHealth(kind),
          flee: null,
          charge: null,
          chargeRest: 0,
          shootTimer: 0,
          blastFuse: null,
          tint: null,
          hitFlash: 0,
          discharge: 0,
          dischargeRest: 0,
        },
      ];
      // Not edible and drawn at rest: the card shows the CREATURE, not the state of the water it happens to be in.
      // `in-play` because a card is of a creature that has not been driven off, and a dimmed one on a card would
      // read as a rendering fault rather than as "this one is leaving".
      paintHazards(g, field, lane, ICON_PHASE, () => false, 'in-play');
      return;
    }

    if (icon.kind === 'obstacle') {
      const radius = mech.obstacles.radius[icon.obstacle] ?? 0.08;
      const lane = box / (radius * ICON_LANE_DIVISOR);
      const field = new ObstacleField();
      field.obstacles = [
        {
          id: 0,
          kind: icon.obstacle,
          x: cx,
          y: cy,
          radiusFraction: radius,
          health: mech.obstacles.health[icon.obstacle] ?? 1,
          // Undamaged, so the card shows what the thing IS rather than what it looks like halfway through breaking.
          healthFraction: 1,
          age: ICON_PHASE,
          // Not drifting in: the card draws it settled.
          entry: null,
        },
      ];
      paintObstacles(g, field, lane);
      return;
    }

    this.drawGlyph(g, icon.glyph, cx, cy, box, colour);
  }

  private drawGlyph(g: Graphics, glyph: CodexGlyph, cx: number, cy: number, box: number, colour: number): void {
    const r = box * 0.3;
    const stroke = Math.max(1, r * 0.18);
    switch (glyph) {
      case 'player':
        g.circle(cx, cy, r).fill({ color: colour, alpha: 0.18 });
        g.circle(cx, cy, r).stroke({ color: colour, alpha: 0.95, width: stroke });
        g.circle(cx - r * 0.32, cy + r * 0.34, r * 0.2).fill({ color: 0xffffff, alpha: 0.8 });
        break;
      case 'angry': {
        /**
         * The volatile bubble: the same disc, PRESSED.
         *
         * The design's "like a frown, made of deformation" rather than a drawn face -- so the top of the circle is
         * flattened and pinched, and the rim is the type's own resting colour. It reads as a bubble that is being
         * squeezed, which is what anger does to it.
         */
        const points: number[] = [];
        const steps = 32;
        for (let i = 0; i < steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          // Squashed at the top, and a small inward pinch dead centre, which is the "brow".
          const top = Math.max(0, -Math.sin(a));
          const pinch = Math.exp(-((a - Math.PI * 1.5) ** 2) * 40);
          const k = 1 - top * 0.28 - pinch * 0.24;
          points.push(cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k);
        }
        points.push(points[0]!, points[1]!);
        g.poly(points);
        g.fill({ color: colour, alpha: 0.18 });
        g.poly(points);
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        break;
      }
      case 'binge': {
        /**
         * Over-full: a swollen bubble with an item too many.
         *
         * Drawn as a circle with a bulge and three filled dots inside, because the state is literally "the things in
         * here do not fit" -- and the pulse mark above it is the fuse, which is the half of the mechanic a player
         * forgets.
         */
        g.circle(cx, cy, r * 0.95).fill({ color: colour, alpha: 0.2 });
        g.circle(cx, cy, r * 0.95).stroke({ color: colour, alpha: 0.9, width: stroke });
        for (const [dx, dy] of [
          [-0.38, 0.1],
          [0.36, -0.2],
          [0.05, 0.42],
        ] as const) {
          g.circle(cx + r * dx, cy + r * dy, r * 0.24).fill({ color: colour, alpha: 0.85 });
        }
        // The fuse: a short stalk and a spark, which is what turns a full stomach into a countdown.
        g.moveTo(cx, cy - r * 0.95).lineTo(cx + r * 0.22, cy - r * 1.45);
        g.stroke({ color: 0xffffff, alpha: 0.8, width: stroke * 0.6 });
        g.circle(cx + r * 0.26, cy - r * 1.5, r * 0.16).fill({ color: mech.spit.rimColor, alpha: 0.95 });
        break;
      }
      case 'rageGauge': {
        // A bar with a tick, in the four stage colours: the resource, and what it is measured against.
        const w = r * 2.1;
        const h = r * 0.5;
        const x = cx - w / 2;
        const y = cy - h / 2;
        g.roundRect(x, y, w, h, h / 2).stroke({ color: colour, alpha: 0.8, width: stroke * 0.7 });
        g.roundRect(x, y, w * 0.62, h, h / 2).fill({ color: colour, alpha: 0.85 });
        for (let i = 1; i < mech.angry.appearance.length; i++) {
          const row = mech.angry.appearance[i]!;
          const at = x + (row.minRage / Math.max(1e-6, mech.angry.rage.max)) * w;
          g.moveTo(at, y - h * 0.35).lineTo(at, y + h * 1.35);
        }
        g.stroke({ color: 0xffffff, alpha: 0.35, width: stroke * 0.4 });
        break;
      }
      case 'charge': {
        // A core with four outward spikes: the wind-up, the same shape the button uses.
        g.circle(cx, cy, r * 0.42).fill({ color: colour, alpha: 0.9 });
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          g.moveTo(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6);
          g.lineTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3);
        }
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        break;
      }
      case 'rageBurst': {
        // Three rings going out and a bright core: a wave, not a star (the 爆散 skill already owns the star).
        for (let i = 0; i < 3; i++) {
          g.circle(cx, cy, r * (0.45 + i * 0.42)).stroke({
            color: colour,
            alpha: 0.9 - i * 0.26,
            width: stroke * (1 - i * 0.2),
          });
        }
        g.circle(cx, cy, r * 0.2).fill({ color: mech.angry.burst.waveColour, alpha: 0.95 });
        break;
      }
      case 'overload': {
        /**
         * A bubble with a countdown arc around it, and a crack.
         *
         * The arc is deliberately INCOMPLETE -- three quarters of a circle -- because the state is defined by a clock
         * that runs out, and a closed ring would say "sealed" instead.
         */
        g.circle(cx, cy, r * 0.78).fill({ color: colour, alpha: 0.22 });
        g.circle(cx, cy, r * 0.78).stroke({ color: colour, alpha: 0.9, width: stroke });
        const arc = r * 1.25;
        const from = -Math.PI / 2;
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
          const a = from + (i / steps) * Math.PI * 1.55;
          const px = cx + Math.cos(a) * arc;
          const py = cy + Math.sin(a) * arc;
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.stroke({ color: mech.angry.appearance[mech.angry.appearance.length - 1]!.rim, alpha: 0.95, width: stroke });
        // The crack: two short strokes, which is the whole hint that this ends badly.
        g.moveTo(cx - r * 0.25, cy - r * 0.5).lineTo(cx + r * 0.1, cy).lineTo(cx - r * 0.15, cy + r * 0.5);
        g.stroke({ color: 0xffffff, alpha: 0.75, width: stroke * 0.6 });
        break;
      }
      case 'stages':
        // Three nested rims in the stages' own colours: the size ladder, in the palette the game uses for it.
        for (let i = 0; i < 3; i++) {
          const look = mech.stages.appearance[Math.min(i, mech.stages.appearance.length - 1)];
          g.circle(cx, cy, r * (1 - i * 0.3)).stroke({
            color: look?.hudColor ?? colour,
            alpha: 0.95,
            width: stroke,
          });
        }
        break;
      case 'suction':
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
          g.moveTo(cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 1.2)
            .lineTo(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.4);
        }
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        break;
      case 'spit':
        g.moveTo(cx - r * 0.3, cy - r * 1.3).lineTo(cx - r * 0.3, cy + r * 1.3);
        g.stroke({ color: colour, alpha: 0.9, width: stroke });
        g.moveTo(cx + r * 0.9, cy)
          .lineTo(cx - r * 0.35, cy + r * 0.7)
          .lineTo(cx - r * 0.35, cy - r * 0.7)
          .closePath()
          .fill({ color: colour, alpha: 0.95 });
        break;
      case 'compress':
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          g.moveTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25)
            .lineTo(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55);
        }
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        g.circle(cx, cy, r * 0.25).fill({ color: 0xffffff, alpha: 0.85 });
        break;
      case 'collectable':
        g.circle(cx, cy, r).fill({ color: colour, alpha: 0.3 });
        g.circle(cx, cy, r).stroke({ color: colour, alpha: 0.85, width: stroke * 0.7 });
        g.circle(cx - r * 0.3, cy + r * 0.3, r * 0.62).fill({ color: 0xeafcff, alpha: 0.18 });
        break;
      case 'skillPickup':
        diamond(g, cx, cy, r * 1.15);
        g.fill({ color: colour, alpha: 0.9 });
        diamond(g, cx, cy, r * 1.15);
        g.stroke({ color: 0xffffff, alpha: 0.75, width: stroke * 0.7 });
        break;
      case 'dash':
        for (let i = 0; i < 2; i++) {
          const y = cy + r * (0.45 - i * 0.7);
          g.moveTo(cx - r * 0.9, y).lineTo(cx, y - r * 0.5).lineTo(cx + r * 0.9, y);
        }
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        break;
      case 'decoy':
        g.circle(cx, cy, r * 0.7).fill({ color: colour, alpha: 0.45 });
        g.circle(cx, cy, r * 1.2).stroke({ color: colour, alpha: 0.75, width: stroke * 0.7 });
        break;
      case 'vortex':
        // Concentric broken rings rather than arcs: this project has been bitten twice by `Graphics.arc` leaving a
        // stray line back to where the path started, so nothing here draws an arc. A ring plus a gap reads the same.
        for (let i = 0; i < 2; i++) {
          g.circle(cx, cy, r * (1.1 - i * 0.42)).stroke({
            color: colour,
            alpha: 0.35 + i * 0.45,
            width: stroke * 0.8,
          });
        }
        // Two inward spokes, so the rings read as a swirl rather than as a target.
        for (let i = 0; i < 2; i++) {
          const a = i * Math.PI + 0.5;
          g.moveTo(cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * 1.1)
            .lineTo(cx + Math.cos(a + 0.7) * r * 0.28, cy + Math.sin(a + 0.7) * r * 0.28);
        }
        g.stroke({ color: colour, alpha: 0.9, width: stroke * 0.7 });
        break;
      case 'stink':        for (const [dx, dy, rr] of [
          [-0.6, 0.1, 0.55],
          [0.5, 0.25, 0.45],
          [0, -0.5, 0.5],
        ] as const) {
          g.circle(cx + r * dx, cy + r * dy, r * rr).fill({ color: colour, alpha: 0.42 });
        }
        break;
      case 'shell':
        g.circle(cx, cy, r).stroke({ color: colour, alpha: 0.95, width: stroke * 1.6 });
        g.circle(cx, cy, r * 0.55).fill({ color: colour, alpha: 0.3 });
        break;
      case 'burst':
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          g.moveTo(cx + Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.4)
            .lineTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3);
        }
        g.stroke({ color: colour, alpha: 0.95, width: stroke });
        break;
      case 'fish-fart':
        g.circle(cx - r * 0.2, cy, r * 0.8).fill({ color: colour, alpha: 0.4 });
        g.circle(cx + r * 0.85, cy + r * 0.6, r * 0.28).fill({ color: colour, alpha: 0.85 });
        g.circle(cx + r * 1.15, cy - r * 0.4, r * 0.2).fill({ color: colour, alpha: 0.85 });
        break;
      case 'soda':
        for (let i = 0; i < 3; i++) {
          g.circle(cx - r * 0.7 + i * r * 0.7, cy + r * (0.4 - i * 0.35), r * (0.32 - i * 0.05)).stroke({
            color: colour,
            alpha: 0.9,
            width: stroke * 0.6,
          });
        }
        break;
      case 'silt':
        g.circle(cx, cy, r).fill({ color: colour, alpha: 0.45 });
        g.circle(cx, cy, r).stroke({ color: colour, alpha: 0.9, width: stroke });
        for (const [dx, dy] of [
          [-0.35, -0.2],
          [0.3, 0.1],
          [0, 0.4],
        ] as const) {
          g.circle(cx + r * dx, cy + r * dy, r * 0.12).fill({ color: colour, alpha: 0.9 });
        }
        break;
      default:
        // An unknown glyph is a VISIBLE hole rather than a silent one: a card with no icon is a card somebody forgot
        // to finish, and it should look like that from across the room.
        g.rect(cx - r, cy - r, r * 2, r * 2).stroke({ color: 0xff6b6b, alpha: 0.9, width: stroke });
        break;
    }
  }
}

/**
 * How much bigger than the icon box a creature's own radius is allowed to be.
 *
 * A divisor on the lane width handed to the painter, so every creature is scaled by the SAME factor and their sizes
 * relative to each other are preserved -- a crab reads as bigger than a fish on its card, exactly as in the water.
 */
const ICON_LANE_DIVISOR = 3.4;

/**
 * The pose a still icon is drawn in.
 *
 * Not a clock and not zero: several creatures' looks depend on their `phase` (an urchin's needles rotate, a
 * jellyfish's tentacles wave), and phase 0 is a pose nobody ever sees in the water. A constant puts every card in a
 * representative pose, and being constant means the page does not animate while it is being read.
 */
const ICON_PHASE = 1.7;

/**
 * Wrap a text to a width in ITS OWN units, with its line height pinned to the caller's leading.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO THINGS THAT ARE NOT OPTIONAL, AND A SCREENSHOT FOUND BOTH
 * ---------------------------------------------------------------------------------------------
 * `breakWords` is required because Pixi's word wrap breaks on WHITESPACE and Chinese has none: a note of forty
 * characters is a single word as far as the wrap is concerned, so it ran out of its card and across its neighbour's.
 * Every note in this project is Chinese, which is the case the default is worst at.
 *
 * `lineHeight` is pinned to the configured leading because the caller lays out by advancing `leading` per line. Left
 * to Pixi, the line height comes from the font's own metrics -- near enough to `fontSize` and NOT near enough to
 * `noteLeading` -- so each note drifted a little further into the one above it, which reads as text drawn on top of
 * text. With it pinned, "advance by leading times the number of lines" is exact rather than approximately right.
 */
function wrap(text: Text, width: number, leading: number): void {
  text.style.wordWrap = true;
  text.style.wordWrapWidth = width;
  text.style.breakWords = true;
  text.style.lineHeight = leading;
}

/**
 * How many lines this text actually occupies once wrapped, measured rather than guessed.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A MEASUREMENT AND NOT AN ESTIMATE
 * ---------------------------------------------------------------------------------------------
 * The first version estimated it from the character count, and it was wrong by a line on notes that were mostly
 * Chinese -- because the style asks for a Latin monospace font, which has no CJK glyphs, so the browser falls back to
 * a FULL-WIDTH face and every Chinese character advances about twice what a Latin one does. An estimate built on
 * "characters per line" therefore silently assumed the wrong glyph width, the cards laid the next note one line too
 * high, and the result read as text drawn on top of text.
 *
 * Counting the CJK characters double would have been a better estimate and still an estimate. `CanvasTextMetrics`
 * answers the question outright, in the same wrap the renderer will use, so the layout arithmetic is exact: advance
 * by `leading` times the number of lines, and the number of lines is the real one.
 */
function lineCount(text: Text): number {
  const metrics = CanvasTextMetrics.measureText(text.text, text.style, undefined, true);
  return Math.max(1, metrics.lines.length);
}

function inside(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function diamond(g: Graphics, cx: number, cy: number, r: number): void {
  g.moveTo(cx, cy - r).lineTo(cx + r, cy).lineTo(cx, cy + r).lineTo(cx - r, cy).closePath();
}










