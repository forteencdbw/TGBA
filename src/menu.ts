import { Container, Graphics, Text } from 'pixi.js';
import { LEVEL } from './levels';
import { mech } from './mechanisms';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';

/**
 * The main menu. A deliberate placeholder.
 *
 * It exists so "exit to the main menu" has somewhere to go, and so the shape of the flow -- menu, level, codex,
 * back to menu -- is real rather than a stub that throws. What it does NOT have is level selection, a talent
 * choice, or anything else the final menu will want; those need decisions that have not been made.
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
  private readonly primaryLabel = mk('', mech.menu.primaryTextColour, mech.menu.primaryTextSize);
  private readonly secondaryLabel = mk('', mech.menu.secondaryTextColour, mech.menu.secondaryTextSize);
  private readonly hint = mk('WASD / 方向键移动   ·   触屏用底部摇杆控制方向', 0x7fb6d4, 12);
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

  /** Called when the player asks to play. */
  onStart: () => void = () => {};
  /** Called when the player asks for the codex. */
  onCodex: () => void = () => {};

  private primaryRect = { x: 0, y: 0, w: 0, h: 0 };
  private secondaryRect = { x: 0, y: 0, w: 0, h: 0 };
  /**
   * Which control the current press landed on, or null.
   *
   * One field rather than a boolean per button, so a drag that leaves one button and lands on the other cannot end
   * up firing both -- which two independent flags would allow.
   */
  private pressed: 'start' | 'codex' | null = null;
  private time = 0;
  /** Scale from the last real layout, so `update` can redraw without a viewport. */
  private scale = 1;

  constructor() {
    this.root.eventMode = 'none';
    for (const child of [this.backdrop, this.primary, this.secondary, this.primaryLabel, this.secondaryLabel]) {
      child.eventMode = 'none';
    }

    this.primaryLabel.text = '开始游戏';
    this.secondaryLabel.text = '图鉴';

    this.root.addChild(
      this.backdrop,
      this.title,
      this.subtitle,
      this.levelLine,
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
  }

  private inRect(rect: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  handlePointerDown(x: number, y: number): boolean {
    if (this.inRect(this.primaryRect, x, y)) this.pressed = 'start';
    else if (this.inRect(this.secondaryRect, x, y)) this.pressed = 'codex';
    else this.pressed = null;
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    if (this.pressed === 'start' && !this.inRect(this.primaryRect, x, y)) this.pressed = null;
    if (this.pressed === 'codex' && !this.inRect(this.secondaryRect, x, y)) this.pressed = null;
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const fire = this.pressed;
    this.pressed = null;
    if (fire === 'start' && this.inRect(this.primaryRect, x, y)) this.onStart();
    if (fire === 'codex' && this.inRect(this.secondaryRect, x, y)) this.onCodex();
    return true;
  }

  /** Test hook: both buttons, so a probe presses the real controls. */
  get geometry(): { button: { x: number; y: number; w: number; h: number }; codex: { x: number; y: number; w: number; h: number } } {
    return { button: { ...this.primaryRect }, codex: { ...this.secondaryRect } };
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
