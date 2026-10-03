/**
 * The end-of-run summary: what the whole descent was worth.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A PANEL AND NOT THE RESULTS CARD
 * ---------------------------------------------------------------------------------------------
 * The card (`finishBanner`) is a few lines of text drawn over the water, and it was written when a run WAS one level: it
 * reports absorption, max volume and time, which is the story of a single descent to a surface. A run now spans six
 * levels, each with its own score, its own boss and its own upgrades, so the honest report is a different shape: one
 * number for the whole thing, and the facts that number is made of.
 *
 * It owns its pointer handling for the same reason the settings panel does -- a full-screen panel that let taps fall
 * through to the water would steer a bubble behind it -- and it has one button, because there is one thing left to do.
 */
import { Container, Graphics, Text } from 'pixi.js';
import { mech } from './mechanisms';
import { buildLabel } from './version';
import { designScale } from './viewport';

function mkText(text: string, colour: number, size: number): Text {
  return new Text({
    text,
    style: {
      fill: colour,
      fontSize: size,
      fontFamily: mech.text.fontFamily,
      align: 'center',
      wordWrap: true,
      breakWords: true,
    },
  });
}

export class RunSummary {
  readonly root = new Container();
  private readonly scrim = new Graphics();
  private readonly panel = new Graphics();
  private readonly title: Text;
  private readonly score: Text;
  private readonly lines: Text;
  private readonly buttonBg = new Graphics();
  private readonly buttonLabel: Text;

  /** Called when the player taps the way out. */
  onMenu: () => void = () => {};

  private open = false;
  private rect = { x: 0, y: 0, w: 0, h: 0 };
  private button = { x: 0, y: 0, w: 0, h: 0 };
  private pressed = false;
  private scale = 1;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor() {
    this.root.eventMode = 'none';
    this.root.visible = false;
    for (const node of [this.scrim, this.panel, this.buttonBg]) node.eventMode = 'none';
    this.title = mkText('下潜结束 · RUN COMPLETE', 0xeaf9ff, 22);
    // The title is one line by definition; wrapping it turned a heading into three lines that landed on the score. The
    // summary panel is a fixed shape, so the text is fitted to it rather than the panel to the text.
    this.title.style.wordWrap = false;
    this.title.anchor.set(0.5);
    this.title.eventMode = 'none';
    this.score = mkText('', mech.summary.scoreColour, mech.summary.scoreSize);
    this.score.anchor.set(0.5);
    // Same reason as the title: a score is one number, and wrapping it put "110" above "0". The score is the one thing
    // this screen exists to show, so it is never allowed to break.
    this.score.style.wordWrap = false;
    this.score.eventMode = 'none';
    this.lines = mkText('', mech.summary.lineColour, mech.summary.lineSize);
    this.lines.anchor.set(0.5, 0);
    this.lines.eventMode = 'none';
    this.buttonLabel = mkText(mech.summary.buttonLabel, 0xeaf9ff, 17);
    this.buttonLabel.anchor.set(0.5);
    this.buttonLabel.eventMode = 'none';
    this.root.addChild(this.scrim, this.panel, this.title, this.score, this.lines, this.buttonBg, this.buttonLabel);
  }

  get isOpen(): boolean {
    return this.open;
  }

  /** Show the panel with a finished run's numbers. */
  show(run: { score: number; levels: number; total: number; seconds: number; best: number }): void {
    this.open = true;
    this.root.visible = true;
    this.score.text = `${run.score}`;
    const minutes = Math.floor(run.seconds / 60);
    const seconds = Math.floor(run.seconds % 60);
    this.lines.text = [
      `通关 ${run.levels} / ${run.total} 关`,
      `用时 ${minutes}:${String(seconds).padStart(2, '0')}`,
      run.score >= run.best && run.score > 0 ? `★ 新纪录（上次最佳 ${run.best}）` : `最佳得分 ${run.best}`,
      buildLabel(),
    ].join('\n');
    this.redraw();
  }

  hide(): void {
    this.open = false;
    this.root.visible = false;
    this.pressed = false;
  }

  /** Lay everything out for a canvas. */
  layout(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    const s = designScale(canvasWidth, canvasHeight);
    this.scale = s;
    const w = Math.min(canvasWidth * 0.86, mech.summary.maxWidth * s);
    const h = Math.min(canvasHeight * 0.62, mech.summary.maxHeight * s);
    this.rect = { x: (canvasWidth - w) / 2, y: (canvasHeight - h) / 2, w, h };

    this.title.scale.set(s);
    this.title.x = this.rect.x + w / 2;
    this.title.y = this.rect.y + 34 * s;

    this.score.style.fontSize = mech.summary.scoreSize;
    this.score.scale.set(s);
    this.score.x = this.rect.x + w / 2;
    this.score.y = this.rect.y + 112 * s;

    this.lines.style.fontSize = mech.summary.lineSize;
    this.lines.style.wordWrapWidth = (w - 48 * s) / s;
    this.lines.scale.set(s);
    this.lines.x = this.rect.x + w / 2;
    this.lines.y = this.rect.y + 162 * s;

    const bw = w - 48 * s;
    const bh = 46 * s;
    this.button = { x: this.rect.x + 24 * s, y: this.rect.y + h - bh - 26 * s, w: bw, h: bh };
    this.buttonLabel.scale.set(s);
    this.buttonLabel.x = this.button.x + bw / 2;
    this.buttonLabel.y = this.button.y + bh / 2;

    this.redraw();
  }

  /** Takes a press if it lands on the button. */
  handlePointerDown(x: number, y: number): boolean {
    if (!this.open) return false;
    const b = this.button;
    if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) return true;
    this.pressed = true;
    this.redraw();
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    if (!this.open) return false;
    const b = this.button;
    const inside = x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    const wasPressed = this.pressed;
    this.pressed = false;
    this.redraw();
    if (wasPressed && inside) this.onMenu();
    return true;
  }

  private redraw(): void {
    if (!this.open) return;
    const s = this.scale;
    const p = this.rect;

    this.scrim.clear();
    this.scrim.rect(0, 0, this.canvasWidth, this.canvasHeight).fill({ color: mech.summary.scrimColour, alpha: mech.summary.scrimAlpha });

    this.panel.clear();
    this.panel
      .roundRect(p.x, p.y, p.w, p.h, 18 * s)
      .fill({ color: mech.summary.panelColour, alpha: 0.97 })
      .stroke({ color: mech.summary.panelRimColour, alpha: 0.6, width: 1.5 * s });

    const b = this.button;
    this.buttonBg.clear();
    this.buttonBg
      .roundRect(b.x, b.y, b.w, b.h, 10 * s)
      .fill({ color: this.pressed ? 0x2a4a6b : mech.summary.buttonColour, alpha: 0.95 })
      .stroke({ color: 0x5fa8cc, alpha: 0.7, width: 1.2 * s });
  }
}



