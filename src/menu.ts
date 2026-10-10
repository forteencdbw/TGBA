import { Container, Graphics, Text } from 'pixi.js';
import { mech } from './mechanisms';
import { BASE_TYPE } from './bubbleTypes';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';

/**
 * One level as the menu needs it: what to draw, and whether it can be played.
 *
 * The lock state is GIVEN to the menu rather than worked out by it, because what unlocks what belongs to the progress
 * store. A menu that knew the rule would be a second place to change it, and the two would eventually disagree.
 */
export interface MenuLevel {
  id: string;
  name: string;
  locked: boolean;
  selected: boolean;
}

/**
 * The main menu.
 *
 * It exists so "exit to the main menu" has somewhere to go, and so the shape of the flow -- menu, choose a
 * level, play, codex, back to menu -- is real rather than a stub that throws.
 *
 * There is no character select any more: every run starts as the same base bubble, and its identity arrives in
 * the water at the first level-up. What the menu still decides is WHICH WATER -- the level row -- and its line
 * under the grid is the base bubble's pitch, so the one thing that is fixed is the one thing it names.
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
  private readonly title = mk('冒泡大作战', 0xeaf9ff, 34);
  private readonly subtitle = mk('BUBBLE BATTLE', 0x8fd4f0, 13);
  private readonly levelLine = mk('', 0xbfe9ff, 15);
  /**
   * The level selector: one pill per level, above the start button.
   *
   * The larger choice the menu owns -- which water -- and the row doubles as the progress display: cleared
   * levels are plain, the next one is the only thing that was ever locked.
   */
  private readonly levelRow = new Graphics();
  /**
   * The line between the level grid and the start button.
   *
   * Static now: it names the one thing every run shares -- the base bubble -- where it used to follow a
   * character select that no longer exists. Its place in the layout is load-bearing (the grid is measured
   * upward from it), so the line stays even though the choice is gone.
   */
  private readonly tagline = mk(BASE_TYPE.tagline, 0x8fd4f0, mech.menu.taglineSize);
  private readonly primaryLabel = mk('', mech.menu.primaryTextColour, mech.menu.primaryTextSize);
  private readonly secondaryLabel = mk('', mech.menu.secondaryTextColour, mech.menu.secondaryTextSize);
  /** The one control line, for the base bubble's controls. Static for the same reason as the tagline. */
  private readonly hint = mk('WASD / 方向键移动   ·   右侧按钮：技能（捡到才有）—— 路线等到水里再选', 0x7fb6d4, 12);
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

  /** Called when the player asks to play. The run starts as the base bubble; see `src/bubbleTypes.ts`. */
  onStart: () => void = () => {};
  /** Called when the player asks for the codex. */
  onCodex: () => void = () => {};
  /**
   * Called when the player taps a level that is selectable.
   *
   * Only reachable levels fire: a locked pill is not a disabled button that reports a press, it is a thing that does
   * nothing, because "you cannot play this yet" is already visible from its colour and the note below.
   */
  onPickLevel: (levelId: string) => void = () => {};

  private primaryRect = { x: 0, y: 0, w: 0, h: 0 };
  private secondaryRect = { x: 0, y: 0, w: 0, h: 0 };
  /**
   * The level row: one pill per level, with its lock state.
   *
   * A row rather than the line of text it replaces, because a level is a CHOICE now and a line of text can only say
   * which one is current. `locked` is carried in the data rather than worked out here: what unlocks what is the
   * progress store's rule, and the menu should not have a second copy of it.
   */
  private levels: readonly MenuLevel[] = [];
  private levelRects: { x: number; y: number; w: number; h: number }[] = [];
  private levelLabels: Text[] = [];
  private selectedLevelId = '';
  /**
   * What the line under the level row says, and whether it is the "unlocked!" highlight.
   *
   * Set by the game rather than derived, because the two things it reports -- why a level is locked, and that one
   * just opened -- are both facts only the game has.
   */
  private levelNote = '';
  private levelNoteHighlight = false;
  /**
   * Which control the current press landed on, or null.
   *
   * One field rather than a boolean per button, so a drag that leaves one button and lands on the other cannot end
   * up firing both -- which two independent flags would allow.
   */
  private pressed: 'start' | 'codex' | `level:${string}` | null = null;
  private time = 0;
  /** Scale from the last real layout, so `update` can redraw without a viewport. */
  private scale = 1;

  constructor() {
    this.root.eventMode = 'none';
    for (const child of [this.backdrop, this.primary, this.secondary, this.levelRow, this.primaryLabel, this.secondaryLabel]) {
      child.eventMode = 'none';
    }

    this.primaryLabel.text = '开始游戏';
    this.secondaryLabel.text = '图鉴';

    /**
     * Display order is draw order, and the backdrop goes FIRST.
     *
     * Everything that should be visible belongs after `backdrop`, so nothing can end up behind the opaque screen.
     */
    this.root.addChild(
      this.backdrop,
      this.title,
      this.subtitle,
      this.levelRow,
      ...this.levelLabels,
      this.levelLine,
      this.tagline,
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

    const w = Math.min(laneWidth * cfg.buttonWidthRatio, cfg.buttonMaxWidth * s);
    const h = cfg.buttonHeight * s;
    const top = viewport.height * 0.55;
    this.primaryRect = { x: cx - w / 2, y: top, w, h };
    // Stacked below the first, so the two share a column and a width -- see the config's note on shared geometry.
    this.secondaryRect = { x: cx - w / 2, y: top + h + cfg.buttonGap * s, w, h };

    /**
     * The tagline, between the level grid and the start button.
     *
     * It used to be placed after the grid, which meant the anchoring read whatever `y` the previous layout had left
     * behind -- and on the first layout that is zero, which is why the unlock note ended up at the top of the canvas.
     */
    this.tagline.style.fontSize = cfg.taglineSize;
    this.tagline.scale.set(s);
    this.tagline.anchor.set(0.5, 0.5);
    this.tagline.x = cx;
    this.tagline.y = top - cfg.taglineGap * s - cfg.taglineSize * s;

    /**
     * The level row: the menu's one choice, above the tagline.
     *
     * Placed from the subtitle down rather than from the buttons up, so the top of the menu reads as a stack of
     * headings: which water, go.
     */
    const levelH = cfg.levelRowHeight * s;
    /**
     * The top block is placed from the BOTTOM UP, and that is the fix for a second overlap.
     *
     * The title, subtitle and level grid used to hang from `height * 0.3` and grow downward while the tagline and the
     * buttons were anchored to the bottom. One row of level pills fitted in the space between; two rows did not, and
     * the extra row pushed the grid and its note line into the tagline -- which is what the owner saw, on a desktop
     * window where the menu has less vertical room than a phone.
     *
     * Placing upward from the tagline means the two halves can never meet: whatever the grid's height is, the heading
     * above it moves up by the same amount. The only thing that gives is the title's own margin, which is why it is
     * clamped rather than allowed off the top of the canvas.
     */
    const perRow = Math.max(1, Math.min(this.levels.length, Math.floor(1 / Math.max(0.05, cfg.levelMinWidthRatio))));
    const rows = Math.max(1, Math.ceil(this.levels.length / perRow));
    const noteLineH = cfg.levelTextSize * s;
    const noteY = this.tagline.y - (cfg.taglineSize * s) / 2 - cfg.levelRowGap * s * 2 - noteLineH;
    const gridHeight = rows * levelH + (rows - 1) * cfg.levelRowGap * s;
    let levelTop = noteY - cfg.levelRowGap * s - gridHeight;

    this.subtitle.scale.set(s);
    this.subtitle.anchor.set(0.5, 0.5);
    this.subtitle.x = cx;
    this.subtitle.y = levelTop - cfg.levelRowTopGap * s;

    this.title.scale.set(s);
    this.title.anchor.set(0.5, 0.5);
    this.title.x = cx;
    this.title.y = Math.max(36 * s, this.subtitle.y - 30 * s);
    // If the title hit the ceiling, the subtitle follows it down rather than the two overlapping.
    if (this.title.y > this.subtitle.y - 30 * s) this.subtitle.y = this.title.y + 30 * s;
    if (this.subtitle.y > levelTop - cfg.levelRowTopGap * s) levelTop = this.subtitle.y + cfg.levelRowTopGap * s;
    /**
     * The level pills WRAP, and that is a fix rather than a nicety.
     *
     * They used to be one row of equal shares: with three levels that reads fine, and with six -- one per level the
     * game now has -- every pill became a third of its own name's width and the names drew on top of each other. The
     * row is a CHOICE, so the labels have to be readable; a pill nobody can read is not a choice.
     *
     * So: as many per row as fit at `levelMinWidthRatio` of the menu, then the next row below, each row centred. The
     * bottom of the stack does not move because it is anchored to the buttons -- the grid grows DOWNWARD from the
     * subtitle, which is the direction the rest of the menu's headings already read.
     */
    const rowStep = levelH + cfg.levelRowGap * s;
    // One row's worth of pills is at most this wide, so two levels on a desktop do not become two enormous bars.
    const maxRowW = Math.min(w, perRow * w * cfg.levelMaxWidthRatio);
    this.levelRects = this.levels.map((_, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, this.levels.length - row * perRow);
      const rowW = Math.min(maxRowW, inRow * w * cfg.levelMaxWidthRatio);
      const slot = rowW / inRow;
      const col = i - row * perRow;
      return { x: cx - rowW / 2 + col * slot, y: levelTop + row * rowStep, w: slot, h: levelH };
    });
    this.placeLevelLabels();

    this.levelLine.scale.set(s);
    this.levelLine.anchor.set(0.5, 0.5);
    this.levelLine.text = this.levelNote;
    this.levelLine.style.fill = this.levelNoteHighlight ? cfg.levelUnlockColour : cfg.levelNoteColour;
    this.levelLine.x = cx;
    // One gap below the LAST row of pills -- the same line the top block was measured upward from, so the two cannot disagree.
    this.levelLine.y = noteY;


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

  /**
   * Put each level label in its pill.
   *
   * `layout` calls this, and so does `setLevels`. That second call is the point: a list handed in is rebuilt from
   * scratch (the NUMBER of buttons is part of the layout), and a label that has just been created sits at the origin
   * -- which put the names of the levels in the top-left corner of the canvas with the pills left blank until the
   * next resize. Placement belongs with the rebuild, not only with a resize.
   *
   * The rects come from the last real layout, so a rebuild before the first one places nothing and the layout that
   * follows does it. `this.scale` is that layout's scale, for the same reason `update` uses it.
   */
  private placeLevelLabels(): void {
    for (const [i, label] of this.levelLabels.entries()) {
      const rect = this.levelRects[i];
      if (!rect) continue;
      label.style.fontSize = mech.menu.levelTextSize;
      label.scale.set(this.scale);
      label.anchor.set(0.5, 0.5);
      label.x = rect.x + rect.w / 2;
      label.y = rect.y + rect.h / 2;
    }
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

    this.levelRow.clear();
    for (const [i, rect] of this.levelRects.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      const r = cfg.buttonRadius * s;
      /**
       * Three states, and no lock icon.
       *
       * Selected is FILLED, unlockable is outlined, locked is darker with a dim stroke. A padlock would have to be
       * drawn on the canvas by hand for a state that the colour and the note below already carry.
       */
      const fill = level.selected ? cfg.levelSelectedFill : level.locked ? cfg.levelLockedFill : cfg.levelIdleFill;
      const stroke = level.selected ? cfg.levelSelectedStroke : level.locked ? cfg.levelLockedStroke : cfg.levelIdleStroke;
      this.levelRow
        .roundRect(rect.x, rect.y, rect.w, rect.h, r)
        .fill({ color: fill, alpha: level.locked ? 0.6 : 0.95 })
        .stroke({ color: stroke, alpha: level.selected ? 1 : 0.7, width: Math.max(1, 1.2 * s) });
    }

    for (const [i, label] of this.levelLabels.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      const want = level.selected ? cfg.levelSelectedTextColour : level.locked ? cfg.levelLockedTextColour : cfg.levelIdleTextColour;
      if (label.style.fill !== want) label.style.fill = want;
    }
  }

  private inRect(rect: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  /**
   * Hand the menu the levels to offer, with their lock state.
   *
   * The list comes from the progress store rather than from `LEVELS` directly, so the menu never has to know the
   * unlock rule -- and a probe can hand it any list to check the row re-lays out. Rebuilds the labels because the
   * number of pills is part of the layout.
   */
  setLevels(levels: readonly MenuLevel[]): void {
    this.levels = levels;
    for (const label of this.levelLabels) {
      this.root.removeChild(label);
      label.destroy();
    }
    this.levelLabels.length = 0;
    for (const level of levels) {
      const label = mk(level.name, mech.menu.levelIdleTextColour, mech.menu.levelTextSize);
      label.eventMode = 'none';
      this.levelLabels.push(label);
      this.root.addChild(label);
    }
    if (!levels.some((l) => l.id === this.selectedLevelId)) {
      this.selectedLevelId = levels.find((l) => !l.locked)?.id ?? '';
    }
    // The rebuilt labels start at the origin; put them back in their pills. This is the path a level PICK takes,
    // so without it the names of the levels jumped to the top-left corner of the canvas and the pills went blank.
    this.placeLevelLabels();
    this.draw(this.scale);
  }

  /**
   * Set the line under the level row.
   *
   * The game owns both texts: why a level is locked ("通关 X 之后解锁") and what has just opened, because both are
   * facts about progress rather than about the menu.
   */
  setLevelNote(text: string, highlight = false): void {
    this.levelNote = text;
    this.levelNoteHighlight = highlight;
    this.draw(this.scale);
  }

  /** Test hook and game hook: which level the start button would begin a run on. */
  get selectedLevelIdValue(): string {
    return this.selectedLevelId;
  }

  handlePointerDown(x: number, y: number): boolean {
    if (this.inRect(this.primaryRect, x, y)) this.pressed = 'start';
    else if (this.inRect(this.secondaryRect, x, y)) this.pressed = 'codex';
    else {
      const hitLevel = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hitLevel >= 0 ? this.levels[hitLevel] : undefined;
      // A LOCKED pill does not even arm: not firing on release is the whole behaviour, and arming it would make the
      // press look accepted while nothing happened.
      if (level && !level.locked) this.pressed = `level:${level.id}`;
      else this.pressed = null;
    }
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    if (this.pressed === 'start' && !this.inRect(this.primaryRect, x, y)) this.pressed = null;
    if (this.pressed === 'codex' && !this.inRect(this.secondaryRect, x, y)) this.pressed = null;
    if (this.pressed?.startsWith('level:')) {
      const hit = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hit >= 0 ? this.levels[hit] : undefined;
      if (!level || `level:${level.id}` !== this.pressed) this.pressed = null;
    }
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const fire = this.pressed;
    this.pressed = null;
    if (fire === 'start' && this.inRect(this.primaryRect, x, y)) {
      this.onStart();
      return true;
    }
    if (fire === 'codex' && this.inRect(this.secondaryRect, x, y)) {
      this.onCodex();
      return true;
    }
    if (fire?.startsWith('level:')) {
      const hit = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hit >= 0 ? this.levels[hit] : undefined;
      if (level && !level.locked) this.onPickLevel(level.id);
    }
    return true;
  }

  /**
   * Test hook: every control, so a probe presses the real ones.
   *
   * `levels` carries the label as well as the rectangle, so a test can assert that the menu is offering what the
   * game actually has -- a mismatch there is a level nobody can choose.
   */
  get geometry(): {
    button: { x: number; y: number; w: number; h: number };
    codex: { x: number; y: number; w: number; h: number };
    levels: { id: string; label: string; locked: boolean; selected: boolean; rect: { x: number; y: number; w: number; h: number } }[];
    levelNote: string;
    tagline: string;
    hint: string;
  } {
    return {
      button: { ...this.primaryRect },
      codex: { ...this.secondaryRect },
      levels: this.levels.map((level, i) => ({
        id: level.id,
        label: level.name,
        locked: level.locked,
        selected: level.selected,
        rect: { ...(this.levelRects[i] ?? { x: 0, y: 0, w: 0, h: 0 }) },
      })),
      levelNote: this.levelLine.text,
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

/**
 * A menu label.
 *
 * The family is the configured UI font, and it has to be one that carries the Chinese glyphs itself: Pixi measures
 * the line box from the FIRST family in the list while Chinese is drawn by the fallback font, so a Latin-only
 * monospace first clips the tops of every character. See `config/mechanics.json5`.
 */
function mk(text: string, colour: number, size: number): Text {
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





