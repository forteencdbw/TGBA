import { Container, Graphics, Text } from 'pixi.js';
import { LEVEL } from './levels';
import { mech } from './mechanisms';
import { BUBBLE_TYPES, defaultBubbleType, type BubbleType } from './bubbleTypes';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';

/**
 * The main menu.
 *
 * It exists so "exit to the main menu" has somewhere to go, and so the shape of the flow -- menu, choose a bubble,
 * level, codex, back to menu -- is real rather than a stub that throws. What it does NOT have is level selection, a
 * talent choice, or anything else a final menu will want; those need decisions that have not been made.
 *
 * Like `SettingsUi`, the hit testing is done by hand and the tree is `eventMode = 'none'`. See that module
 * for the reasoning: a control that received no events while reporting correct bounds cost a lot of time
 * once already.
 */
export class MainMenu {
  readonly root = new Container();
  /**
   * Field initialisers run IN ORDER, and the constructor's `addChild` needs the children to exist.
   *
   * Declaring a `Graphics` field after the constructor and calling `this.…clear()` inside it is what produced
   * "used before being assigned" here: the declaration is hoisted for typing but the initialiser is not.
   */
  private readonly backdrop = mkGraphics();
  private readonly primary = mkGraphics();
  private readonly secondary = mkGraphics();
  private readonly typeRow = mkGraphics();
  private readonly title = mk('冒泡大作战', 0xeaf9ff, 34);
  private readonly subtitle = mk('BUBBLE BATTLE', 0x8fd4f0, 13);
  private readonly levelLine = mk('', 0xbfe9ff, 15);
  /**
   * The bubble-type selector: one button per type, plus the selected type's one-line description.
   *
   * "Which bubble am I" is the first decision of a run and the only one that changes the controls, so it sits ABOVE
   * the start button: pick, then go. The description under it is the type's own `tagline`, because the difference
   * between the two bubbles is not something a name can carry -- one eats and grows, the other wants to be hit.
   */
  private readonly typeLabels: Text[] = [];
  private readonly tagline = mk('', 0x8fd4f0, mech.menu.taglineSize);
  private readonly primaryLabel = mk('', mech.menu.primaryTextColour, mech.menu.primaryTextSize);
  private readonly secondaryLabel = mk('', mech.menu.secondaryTextColour, mech.menu.secondaryTextSize);
  private readonly hint = mk('', 0x7fb6d4, 12);
  /**
   * Which build this is, at the bottom of the menu.
   *
   * On the MENU rather than only in the in-level debug readout, because the menu is what you see when you open a URL
   * to check whether a deploy worked -- and "did my change actually reach this device" is the question that screen
   * exists to answer. It is also the only screen that is legible in a screenshot somebody sends you.
   *
   * Dim and at the very bottom: it is reference, not information the player needs while deciding to press play.
   */
  private readonly versionLine = mk('', 0x5b7f9c, 11);

  /**
   * The types on offer, and which one is selected.
   *
   * The list is given to the menu rather than imported by it, so the menu has no opinion about what a bubble type is
   * -- it draws whatever rows it is handed. That is also what makes `e2e/bubble-types.spec.ts` able to assert the
   * two agree.
   */
  private types: readonly BubbleType[] = BUBBLE_TYPES;
  private selectedTypeId: string = defaultBubbleType().id;

  /** Called when the player asks to play, with the bubble they chose. */
  onStart: (typeId: string) => void = () => {};
  /** Called when the player asks for the codex. */
  onCodex: () => void = () => {};

  private primaryRect = { x: 0, y: 0, w: 0, h: 0 };
  private secondaryRect = { x: 0, y: 0, w: 0, h: 0 };
  /** One rectangle per type button, in the same order as `types`. */
  private typeRects: { x: number; y: number; w: number; h: number }[] = [];
  /**
   * Which control the current press landed on, or null.
   *
   * One field rather than a boolean per button, so a drag that leaves one button and lands on the other cannot end
   * up firing both -- which two independent flags would allow. `type:<id>` names the selector buttons.
   */
  private pressed: 'start' | 'codex' | `type:${string}` | null = null;
  private time = 0;
  /** Scale from the last real layout, so `update` can redraw without a viewport. */
  private scale = 1;
  /** Set when the selection changes, so the layout can re-place the tagline without a full relayout. */
  private taglineDirty = true;

  constructor() {
    this.root.eventMode = 'none';
    for (const child of [this.backdrop, this.primary, this.secondary, this.typeRow, this.primaryLabel, this.secondaryLabel]) {
      child.eventMode = 'none';
    }

    for (const type of this.types) {
      const label = mk(type.name, mech.menu.typeIdleTextColour, mech.menu.typeTextSize);
      label.eventMode = 'none';
      this.typeLabels.push(label);
    }

    this.primaryLabel.text = '开始游戏';
    this.secondaryLabel.text = '图鉴';

    /**
     * Display order is draw order, and the backdrop goes FIRST.
     *
     * The type selector was originally added before this call, which put it BEHIND the opaque backdrop: the labels
     * still showed (they are text, drawn with a different blend path) while the buttons' fills and strokes vanished
     * -- a screenshot found it, and nothing else would have. Everything that should be visible belongs after
     * `backdrop`, and the selector and its tagline belong with the rest of the stack.
     */
    this.root.addChild(
      this.backdrop,
      this.title,
      this.subtitle,
      this.levelLine,
      this.typeRow,
      this.tagline,
      ...this.typeLabels,
      this.primary,
      this.primaryLabel,
      this.secondary,
      this.secondaryLabel,
      this.hint,
      this.versionLine,
    );
  }

  layout(viewport: Viewport): void {
    const cfg = mech.menu;
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    const laneLeft = viewport.left;
    const laneWidth = viewport.laneWidthPx;
    const cx = laneLeft + laneWidth / 2;

    // Colours and sizes are re-applied here rather than only in the constructor, so a config edit is reflected
    // without needing the module to be rebuilt.
    this.primaryLabel.style.fill = cfg.primaryTextColour;
    this.primaryLabel.style.fontSize = cfg.primaryTextSize;
    this.secondaryLabel.style.fill = cfg.secondaryTextColour;
    this.secondaryLabel.style.fontSize = cfg.secondaryTextSize;

    this.backdrop.clear();
    // Opaque, so the menu is its own screen rather than an overlay on a paused level. Drawn over the whole
    // canvas rather than just the lane: the menu is not part of the water.
    this.backdrop.rect(0, 0, viewport.width, viewport.height).fill({ color: 0x030a17, alpha: 1 });

    this.title.scale.set(s);
    this.title.anchor.set(0.5, 0.5);
    this.title.x = cx;
    this.title.y = viewport.height * 0.3;

    this.subtitle.scale.set(s);
    this.subtitle.anchor.set(0.5, 0.5);
    this.subtitle.x = cx;
    this.subtitle.y = viewport.height * 0.3 + 30 * s;

    this.levelLine.scale.set(s);
    this.levelLine.anchor.set(0.5, 0.5);
    this.levelLine.text = `关卡：${LEVEL.name}   ·   ${LEVEL.scrollLength} m`;
    this.levelLine.x = cx;
    this.levelLine.y = viewport.height * 0.42;

    const w = Math.min(laneWidth * cfg.buttonWidthRatio, cfg.buttonMaxWidth * s);
    const h = cfg.buttonHeight * s;
    const top = viewport.height * 0.55;
    this.primaryRect = { x: cx - w / 2, y: top, w, h };
    // Stacked below the first, so the two share a column and a width -- see the config's note on shared geometry.
    this.secondaryRect = { x: cx - w / 2, y: top + h + cfg.buttonGap * s, w, h };

    /**
     * The type selector, ABOVE the start button.
     *
     * Above rather than below because it is answered before the button it feeds: a player reads the menu top to
     * bottom, and "which bubble" is the first thing a run decides. The row is as wide as the buttons so the whole
     * column reads as one stack, and each type gets an equal share of it.
     */
    const typeH = cfg.typeRowHeight * s;
    const typeTop = top - cfg.typeRowGap * s - typeH;
    const slot = w / Math.max(1, this.types.length);
    this.typeRects = this.types.map((_, i) => ({ x: this.primaryRect.x + i * slot, y: typeTop, w: slot, h: typeH }));
    for (const [i, label] of this.typeLabels.entries()) {
      const rect = this.typeRects[i];
      if (!rect) continue;
      label.style.fontSize = cfg.typeTextSize;
      label.scale.set(s);
      label.anchor.set(0.5, 0.5);
      label.x = rect.x + rect.w / 2;
      label.y = rect.y + rect.h / 2;
    }

    this.tagline.style.fontSize = cfg.taglineSize;
    this.tagline.scale.set(s);
    this.tagline.anchor.set(0.5, 0.5);
    this.tagline.x = cx;
    this.tagline.y = typeTop - cfg.taglineGap * s - cfg.taglineSize * s;
    this.taglineDirty = true;

    for (const [rect, label] of [
      [this.primaryRect, this.primaryLabel],
      [this.secondaryRect, this.secondaryLabel],
    ] as const) {
      label.scale.set(s);
      label.anchor.set(0.5, 0.5);
      label.x = rect.x + rect.w / 2;
      label.y = rect.y + rect.h / 2;
    }

    this.hint.scale.set(s);
    this.hint.anchor.set(0.5, 0.5);
    this.hint.x = cx;
    this.hint.y = this.secondaryRect.y + h + 30 * s;

    this.versionLine.scale.set(s);
    this.versionLine.anchor.set(0.5, 1);
    this.versionLine.text = buildLabel();
    this.versionLine.x = cx;
    // Pinned to the bottom edge rather than to the buttons, so a long build label cannot collide with the hint.
    this.versionLine.y = viewport.height - 14 * s;

    this.draw(s);
  }

  update(dt: number): void {
    this.time += dt;
    // A slow pulse on the primary button, so the menu does not look frozen. Cosmetic, and the only animation here.
    this.draw(this.scale);
  }

  private draw(s: number): void {
    const cfg = mech.menu;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 2);
    const r = cfg.buttonRadius * s;
    const stroke = Math.max(1, 1.4 * s);

    this.primary.clear();
    this.primary
      .roundRect(this.primaryRect.x, this.primaryRect.y, this.primaryRect.w, this.primaryRect.h, r)
      .fill({
        color: this.pressed === 'start' ? cfg.primaryPressedFill : cfg.primaryFill,
        // The pulse rides on alpha rather than on colour, so the owner can retune the fill without fighting it.
        alpha: this.pressed === 'start' ? 1 : 0.88 + pulse * 0.1,
      })
      .stroke({ color: cfg.buttonStroke, alpha: cfg.buttonStrokeAlpha, width: stroke });

    /**
     * The codex button: outlined rather than filled.
     *
     * The two entries are not equivalent -- one starts the game and the other is reference -- and a menu where both
     * shout equally makes the player read both labels to find out which. Fill versus outline says it before either
     * word is read.
     */
    this.secondary.clear();
    this.secondary
      .roundRect(this.secondaryRect.x, this.secondaryRect.y, this.secondaryRect.w, this.secondaryRect.h, r)
      .fill({ color: this.pressed === 'codex' ? cfg.secondaryPressedFill : cfg.secondaryFill, alpha: 0.92 })
      .stroke({
        color: cfg.secondaryStroke,
        alpha: cfg.secondaryStrokeAlpha * (this.pressed === 'codex' ? 1 : 0.8 + pulse * 0.2),
        width: stroke,
      });

    /**
     * The type selector: the chosen one FILLED, the others outlined.
     *
     * The same fill-versus-outline language as the two buttons below, so the menu has one way of saying "this is
     * current, those are available" rather than two. The hint and the tagline change with the selection, which is
     * what tells a player who has never seen either bubble what they are about to be.
     */
    this.typeRow.clear();
    const selected = this.selectedType();
    for (const [i, rect] of this.typeRects.entries()) {
      const type = this.types[i];
      if (!type) continue;
      const isSelected = type.id === this.selectedTypeId;
      const down = this.pressed === `type:${type.id}`;
      this.typeRow
        .roundRect(rect.x + 1 * s, rect.y, rect.w - 2 * s, rect.h, r * 0.7)
        .fill({
          color: isSelected ? cfg.typeSelectedFill : down ? cfg.typeIdleStroke : cfg.typeIdleFill,
          alpha: isSelected ? 1 : 0.9,
        })
        .stroke({
          color: isSelected ? cfg.typeSelectedStroke : cfg.typeIdleStroke,
          alpha: isSelected ? 0.95 : 0.6,
          width: stroke,
        });
      const label = this.typeLabels[i];
      if (label) label.style.fill = isSelected ? cfg.typeSelectedTextColour : cfg.typeIdleTextColour;
    }

    /**
     * The tagline and the hint both follow the selection, so the choice is informed rather than remembered.
     *
     * Written here rather than in `layout` because it changes with a press, and a full relayout per press would be
     * work for one line of text.
     */
    if (this.taglineDirty || this.tagline.text !== selected.tagline) {
      this.tagline.text = selected.tagline;
      this.taglineDirty = false;
    }
    if (this.hint.text !== selected.hint) this.hint.text = selected.hint;
  }

  private inRect(rect: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  /** The type the player has chosen, falling back to the first if the list was replaced under it. */
  private selectedType(): BubbleType {
    return this.types.find((t) => t.id === this.selectedTypeId) ?? this.types[0] ?? defaultBubbleType();
  }

  /** Test hook and game hook: which bubble the start button would begin a run with. */
  get selectedTypeIdValue(): string {
    return this.selectedType().id;
  }

  /**
   * Hand the menu the types to offer.
   *
   * The game owns the list (`src/bubbleTypes.ts`) and the menu draws whatever it is given, so the two cannot
   * disagree -- and a probe can hand it a shorter list to check the row re-lays out. Rebuilds the labels, because the
   * number of buttons is part of the layout.
   */
  setTypes(types: readonly BubbleType[]): void {
    this.types = types;
    for (const label of this.typeLabels) {
      this.root.removeChild(label);
      label.destroy();
    }
    this.typeLabels.length = 0;
    for (const type of types) {
      const label = mk(type.name, mech.menu.typeIdleTextColour, mech.menu.typeTextSize);
      label.eventMode = 'none';
      this.typeLabels.push(label);
      // Added individually, which puts it above the backdrop because the backdrop is already in the list. A label
      // that is added but never shown is the same bug the selector itself had.
      this.root.addChild(label);
    }
    if (!types.some((t) => t.id === this.selectedTypeId)) this.selectedTypeId = types[0]?.id ?? '';
    this.taglineDirty = true;
  }

  handlePointerDown(x: number, y: number): boolean {
    if (this.inRect(this.primaryRect, x, y)) this.pressed = 'start';
    else if (this.inRect(this.secondaryRect, x, y)) this.pressed = 'codex';
    else {
      const hit = this.typeRects.findIndex((rect) => this.inRect(rect, x, y));
      const type = hit >= 0 ? this.types[hit] : undefined;
      this.pressed = type ? `type:${type.id}` : null;
    }
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    if (this.pressed === 'start' && !this.inRect(this.primaryRect, x, y)) this.pressed = null;
    if (this.pressed === 'codex' && !this.inRect(this.secondaryRect, x, y)) this.pressed = null;
    if (this.pressed?.startsWith('type:')) {
      const hit = this.typeRects.findIndex((rect) => this.inRect(rect, x, y));
      const type = hit >= 0 ? this.types[hit] : undefined;
      // Dragging from one type button onto another must not select either: a drag is a cancel, the same as it is on
      // the two buttons below. The alternative -- selecting on the way past -- would make a fumbled press change
      // the run's character.
      if (!type || `type:${type.id}` !== this.pressed) this.pressed = null;
    }
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const fire = this.pressed;
    this.pressed = null;
    if (fire === 'start' && this.inRect(this.primaryRect, x, y)) {
      this.onStart(this.selectedType().id);
      return true;
    }
    if (fire === 'codex' && this.inRect(this.secondaryRect, x, y)) {
      this.onCodex();
      return true;
    }
    if (fire?.startsWith('type:')) {
      const hit = this.typeRects.findIndex((rect) => this.inRect(rect, x, y));
      const type = hit >= 0 ? this.types[hit] : undefined;
      if (type) {
        this.selectedTypeId = type.id;
        // The tagline and the hint follow, so the menu answers "what did I just pick" immediately.
        this.draw(this.scale);
      }
    }
    return true;
  }

  /**
   * Test hook: every control, so a probe presses the real ones.
   *
   * `types` carries the label as well as the rectangle, so a test can assert that the menu is offering what the
   * game actually has -- a mismatch there is a bubble nobody can choose.
   */
  get geometry(): {
    button: { x: number; y: number; w: number; h: number };
    codex: { x: number; y: number; w: number; h: number };
    types: { id: string; label: string; rect: { x: number; y: number; w: number; h: number } }[];
    tagline: string;
    hint: string;
  } {
    return {
      button: { ...this.primaryRect },
      codex: { ...this.secondaryRect },
      types: this.types.map((type, i) => ({
        id: type.id,
        label: type.name,
        rect: { ...(this.typeRects[i] ?? { x: 0, y: 0, w: 0, h: 0 }) },
      })),
      tagline: this.tagline.text,
      hint: this.hint.text,
    };
  }

  /**
   * Test hook: the build label as drawn.
   *
   * Exposed as the STRING rather than as the version and hash separately, so a test asserts what a person reads on
   * the screen -- which is the only thing about this that can be wrong in a way that matters.
   */
  get versionText(): string {
    return this.versionLine.text;
  }
}

function mkGraphics(): Graphics {
  const g = new Graphics();
  g.eventMode = 'none';
  return g;
}

function mk(text: string, colour: number, size: number): Text {
  const label = new Text({
    text,
    style: {
      fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
      fontSize: size,
      fill: colour,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  });
  label.resolution = 2;
  return label;
}
