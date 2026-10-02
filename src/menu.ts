import { Container, Graphics, Text } from 'pixi.js';
import { LEVEL } from './levels';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';

/**
 * The main menu. A deliberate placeholder.
 *
 * It exists so "exit to the main menu" has somewhere to go, and so the shape of the flow -- menu, level,
 * back to menu -- is real rather than a stub that throws. What it does NOT have is level selection, a
 * talent choice, or anything else the final menu will want; those need decisions that have not been made.
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
  private readonly button = mkGraphics();
  private readonly title = mk('冒泡大作战', 0xeaf9ff, 34);
  private readonly subtitle = mk('BUBBLE BATTLE', 0x8fd4f0, 13);
  private readonly levelLine = mk('', 0xbfe9ff, 15);
  private readonly buttonLabel = mk('开始游戏', 0x08131f, 18);
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

  private buttonRect = { x: 0, y: 0, w: 0, h: 0 };
  private pressed = false;
  private time = 0;
  /** Scale from the last real layout, so `update` can redraw without a viewport. */
  private scale = 1;

  constructor() {
    this.root.eventMode = 'none';
    for (const child of [this.backdrop, this.button, this.buttonLabel]) child.eventMode = 'none';

    this.root.addChild(
      this.backdrop,
      this.title,
      this.subtitle,
      this.levelLine,
      this.button,
      this.buttonLabel,
      this.hint,
      this.versionLine,
    );
  }

  layout(viewport: Viewport): void {
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    const laneLeft = viewport.left;
    const laneWidth = viewport.laneWidthPx;
    const cx = laneLeft + laneWidth / 2;

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

    const w = Math.min(laneWidth * 0.7, 280 * s);
    const h = 52 * s;
    this.buttonRect = { x: cx - w / 2, y: viewport.height * 0.55, w, h };
    this.buttonLabel.scale.set(s);
    this.buttonLabel.anchor.set(0.5, 0.5);
    this.buttonLabel.x = cx;
    this.buttonLabel.y = this.buttonRect.y + h / 2;

    this.hint.scale.set(s);
    this.hint.anchor.set(0.5, 0.5);
    this.hint.x = cx;
    this.hint.y = viewport.height * 0.55 + h + 34 * s;

    this.versionLine.scale.set(s);
    this.versionLine.anchor.set(0.5, 1);
    this.versionLine.text = buildLabel();
    this.versionLine.x = cx;
    // Pinned to the bottom edge rather than to the button, so a long build label cannot collide with the hint.
    this.versionLine.y = viewport.height - 14 * s;

    this.draw(s);
  }

  update(dt: number): void {
    this.time += dt;
    // A slow pulse on the button, so the menu does not look frozen. Cosmetic, and the only animation here.
    this.draw(this.scale);
  }

  private draw(s: number): void {
    const b = this.buttonRect;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 2);
    this.button.clear();
    this.button
      .roundRect(b.x, b.y, b.w, b.h, 12 * s)
      .fill({ color: this.pressed ? 0x8fe3ff : 0x6fe3ff, alpha: this.pressed ? 1 : 0.88 + pulse * 0.1 })
      .stroke({ color: 0xd8fbff, alpha: 0.8, width: 1.4 * s });
  }

  private inButton(x: number, y: number): boolean {
    const b = this.buttonRect;
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  handlePointerDown(x: number, y: number): boolean {
    this.pressed = this.inButton(x, y);
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    if (this.pressed && !this.inButton(x, y)) this.pressed = false;
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const fire = this.pressed && this.inButton(x, y);
    this.pressed = false;
    if (fire) this.onStart();
    return true;
  }

  /** Test hook: the start button's rectangle. */
  get geometry(): { button: { x: number; y: number; w: number; h: number } } {
    return { button: { ...this.buttonRect } };
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
