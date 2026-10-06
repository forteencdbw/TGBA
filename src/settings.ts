import { Container, Graphics, Text } from 'pixi.js';
import { mech } from './mechanisms';
import { designScale } from './viewport';
import type { Viewport } from './viewport';

/**
 * The settings button and the pause panel it opens.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE HIT TESTING IS DONE BY HAND
 * ---------------------------------------------------------------------------------------------
 * Every control here is a rectangle or a circle that this module tests itself, and the containers are set to
 * `eventMode = 'none'` throughout. That is not laziness: an earlier version of this project had a control that
 * received no pointer events at all while `containsPoint` returned true, its bounds were correct and every
 * prune flag looked normal. The stage-level listeners plus explicit geometry removed that entire class of
 * problem, and it is also what lets a probe drive the UI through the same code path as a finger.
 *
 * Coordinates are SCREEN pixels. The HUD's `designScale` sizes the text and the controls, so the panel looks
 * the same on a phone and on a desktop window.
 */

/** A raised button: its label, and the rectangle that decides whether a tap hit it. */
interface Button {
  label: Text;
  bg: Graphics;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Set while the pointer is down inside it, so it can draw pressed. */
  pressed: boolean;
}

export class SettingsUi {
  readonly root = new Container();
  private readonly gear = new Graphics();
  /**
   * A full-canvas dim, drawn UNDER the panel.
   *
   * Separate from the panel's own background and sized from the canvas rather than from the panel: the first
   * version drew the scrim as the panel's rectangle expanded to the canvas edges, which left a strip of live
   * HUD visible above and below it whenever the panel's margin extended past the canvas top or bottom. The
   * panel's position should not decide how much of the screen is dimmed.
   */
  private readonly scrim = new Graphics();
  private readonly panel = new Container();
  private readonly panelBg = new Graphics();
  private readonly title: Text;
  private readonly volumeLabel: Text;
  /** The accessibility section's heading and its toggle. */
  private readonly accessLabel: Text;
  private readonly flashButton: Button;
  /** The cheat section's heading, and the toggle itself. */
  private readonly cheatLabel: Text;
  private readonly cheatButton: Button;
  private readonly sliderTrack = new Graphics();
  private readonly sliderFill = new Graphics();
  private readonly sliderKnob = new Graphics();
  private readonly closeButton: Button;

  private readonly restartButton: Button;
  private readonly exitButton: Button;
  private readonly saveButton: Button;
  private readonly cancelButton: Button;

  /** Whether the panel is open. The game reads this to decide whether to pause. */
  open = false;

  /** Called when the slider moves, with 0..1. The game applies it to the audio immediately. */
  onVolume: (volume: number) => void = () => {};
  /**
   * Called when the panel OPENS, so the game can pause.
   *
   * The panel does not pause anything itself: it owns the drawing and the hit testing, and the game owns the
   * run. Telling the game rather than reading `isOpen` from the game's step keeps one direction of dependency.
   */
  onOpen: () => void = () => {};
  /** Called when the panel closes, so the game can resume. */
  onClose: () => void = () => {};
  /** Called when restart is pressed. */
  onRestart: () => void = () => {};
  /**
   * The cheat switch: infinite health.
   *
   * A callback like the rest of the panel, so the panel never has to know what health IS -- the game applies it. Off by
   * default and never persisted: a cheat that survives a reload is a cheat somebody leaves on by accident.
   */
  onInfiniteHealth: (on: boolean) => void = () => {};
  /**
   * The accessibility switch: less flashing.
   *
   * The same shape as the cheat toggle and a different KIND of thing: this one is not a cheat, it is a comfort setting, and
   * it is remembered for the session like the volume is. It turns off the full-body white flash and nothing else -- the hit
   * sparks, the damage numbers and a heavy hit's ring all stay, because those are how the player knows they connected.
   */
  onReducedFlash: (on: boolean) => void = () => {};
  /** Called when exit-to-menu is pressed. */
  onExit: () => void = () => {};

  /** Screen geometry, rebuilt by `layout`. */
  private gearCircle = { x: 0, y: 0, radius: 0 };
  private panelRect = { x: 0, y: 0, w: 0, h: 0 };
  private slider = { x: 0, y: 0, w: 0, h: 0 };
  /** 0..1, the value the slider currently shows. */
  private volume = 0.8;
  /** Whether the cheat is on. Kept here so the panel can draw its own state. */
  private infiniteHealth = false;
  /** Whether the reduced-flash setting is on, likewise. */
  private reducedFlash = false;
  /** The pointer dragging the slider, or null. */
  private sliderPointer: number | null = null;
  /** The HUD scale from the last layout, so a redraw from a pointer handler needs no viewport. */
  private scale = 1;
  /** Canvas size from the last layout, for the full-canvas scrim. */
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor() {
    // Nothing in this tree is interactive; see the class comment.
    this.root.eventMode = 'none';
    this.gear.eventMode = 'none';
    this.panel.eventMode = 'none';
    this.panelBg.eventMode = 'none';
    this.sliderTrack.eventMode = 'none';
    this.sliderFill.eventMode = 'none';
    this.sliderKnob.eventMode = 'none';

    this.title = mkText('设置 / SETTINGS', 0xeaf9ff, 22);
    this.volumeLabel = mkText('', 0xbfe9ff, 15);
    this.closeButton = this.mkButton('×', () => this.setOpen(false));

    /**
     * The accessibility section, above the cheats.
     *
     * Its own heading because it is not a cheat either: it changes how the game LOOKS to the player rather than what the
     * game is, and someone looking for it should not have to read the cheat section to find it.
     */
    this.accessLabel = mkText('显示 / DISPLAY', 0x8fd6ff, 13);
    this.flashButton = this.mkButton('降低闪烁：关', () => this.setReducedFlash(!this.reducedFlash));

    /**
     * The cheats section.
     *
     * Its own heading rather than another row of the settings list, because a cheat is not a setting: it changes what
     * the game IS rather than how it looks or sounds, and it should be findable without reading the whole panel.
     */
    this.cheatLabel = mkText('作弊 / CHEATS', 0xffb46b, 13);
    this.cheatButton = this.mkButton('无限血量：关', () => this.setInfiniteHealth(!this.infiniteHealth));

    this.restartButton = this.mkButton('重开本关', () => this.onRestart());
    this.exitButton = this.mkButton('退出到主菜单', () => this.onExit());
    // Both simply close. Saving is instantaneous -- the volume is already applied -- and the pair exists
    // because a settings panel without them reads as unfinished, and because there WILL be data that needs
    // confirming later.
    this.saveButton = this.mkButton('保存', () => this.setOpen(false));
    this.cancelButton = this.mkButton('取消', () => this.setOpen(false));

    this.panel.addChild(
      this.panelBg,
      this.title,
      this.volumeLabel,
      this.sliderTrack,
      this.sliderFill,
      this.sliderKnob,
      this.accessLabel,
      this.cheatLabel,
    );
    this.panel.addChild(
      this.closeButton.bg,
      this.closeButton.label,
      this.flashButton.bg,
      this.flashButton.label,
      this.cheatButton.bg,
      this.cheatButton.label,
      this.restartButton.bg,
      this.restartButton.label,
      this.exitButton.bg,
      this.exitButton.label,
      this.saveButton.bg,
      this.saveButton.label,
      this.cancelButton.bg,
      this.cancelButton.label,
    );
    // The gear is a sibling of the panel so it can be drawn over it... it is not, so the panel must cover it.
    this.root.addChild(this.scrim, this.gear, this.panel);
    this.setOpen(false);
  }

  /** Build a button and wire its own press handling through the shared callback. */
  private mkButton(label: string, onPress: () => void): Button {
    const bg = new Graphics();
    bg.eventMode = 'none';
    const text = mkText(label, 0xeaf9ff, 16);
    text.anchor.set(0.5);
    text.eventMode = 'none';
    const button: Button = { label: text, bg, x: 0, y: 0, w: 0, h: 0, pressed: false };
    // `onPress` is stored on the button so `handlePointerUp` can invoke it after a matching down.
    (button as Button & { onPress: () => void }).onPress = onPress;
    return button;
  }

  /** All buttons, so the pointer handlers can walk them without repeating the list three times. */
  private buttons(): Button[] {
    return [this.closeButton, this.flashButton, this.cheatButton, this.restartButton, this.exitButton, this.saveButton, this.cancelButton];
  }

  private onPressOf(button: Button): () => void {
    return (button as Button & { onPress: () => void }).onPress;
  }

  get isOpen(): boolean {
    return this.open;
  }

  setOpen(open: boolean): void {
    const wasOpen = this.open;
    this.open = open;
    this.panel.visible = open;
    // The scrim dims the game, so it belongs with the panel.
    this.scrim.visible = open;
    this.gear.visible = !open;
    this.sliderPointer = null;
    for (const b of this.buttons()) b.pressed = false;
    this.redraw();
    if (open && !wasOpen) this.onOpen();
    if (!open && wasOpen) this.onClose();
  }

  /**
   * Turn the infinite-health cheat on or off.
   *
   * One place that sets the state, redraws and tells the game, so the button, a keyboard shortcut added later and a
   * probe all take the same path -- and the label can never disagree with what the game is doing.
   */
  setInfiniteHealth(on: boolean, notify = true): void {
    this.infiniteHealth = on;
    this.cheatButton.label.text = on ? '无限血量：开' : '无限血量：关';
    this.cheatButton.label.style.fill = on ? 0xffd479 : 0xeaf9ff;
    this.redraw();
    if (notify) this.onInfiniteHealth(on);
  }

  /** Whether the cheat is on, as the panel shows it. */
  get infiniteHealthOn(): boolean {
    return this.infiniteHealth;
  }

  /**
   * Turn the reduced-flash setting on or off.
   *
   * One place that sets the state, redraws and tells the game -- the same shape as the cheat toggle, and for the same
   * reason: the label can never disagree with what the game is doing.
   */
  setReducedFlash(on: boolean, notify = true): void {
    this.reducedFlash = on;
    this.flashButton.label.text = on ? '降低闪烁：开' : '降低闪烁：关';
    this.flashButton.label.style.fill = on ? 0xffd479 : 0xeaf9ff;
    this.redraw();
    if (notify) this.onReducedFlash(on);
  }

  /** Whether the reduced-flash setting is on, as the panel shows it. */
  get reducedFlashOn(): boolean {
    return this.reducedFlash;
  }

  /** Reflect the actual volume without firing the callback, e.g. when the game state changes. */
  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    this.redraw();
  }

  layout(viewport: Viewport): void {
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    this.canvasWidth = viewport.width;
    this.canvasHeight = viewport.height;
    const laneRight = viewport.left + viewport.laneWidthPx;

    /**
     * The gear sits at the TOP-RIGHT OF THE LANE, not of the canvas.
     *
     * On a wide window the lane is a centred column, so anchoring to the canvas would float the button out in
     * the empty water where it does not belong to the game.
     */
    const gearRadius = 27 * s;
    this.gearCircle = {
      x: laneRight - gearRadius - 14 * s,
      y: gearRadius + 14 * s,
      radius: gearRadius,
    };

    // Panel: most of the lane's width, centred, with a comfortable margin from the edges.
    const w = Math.min(viewport.laneWidthPx * 0.86, 420 * s);
    /**
     * Tall enough for the rows below and no taller, and the 470 is a CAP rather than a size: the row stack ends at 384
     * design pixels, so a panel of 470 gives the bottom row its margin on a tall window while a short one still gets a
     * panel that fits on the screen at all.
     */
    const h = Math.min(viewport.height * 0.66, 470 * s);
    this.panelRect = {
      x: (viewport.width - w) / 2,
      y: (viewport.height - h) / 2,
      w,
      h,
    };

    this.title.scale.set(s);
    this.title.anchor.set(0.5, 0);
    this.title.x = this.panelRect.x + w / 2;
    this.title.y = this.panelRect.y + 20 * s;

    /**
     * The panel's rows, in DESIGN PIXELS below the panel's top edge.
     *
     * They live here rather than in `config/mechanics.json5` and that is deliberate: every number in this file is a
     * proportional offset inside a panel whose own size is derived from the viewport (`w`, `h` just above), so a value in
     * the config would have to be kept in step with arithmetic it cannot see. What goes in the config is what the player
     * looks AT -- colours, sizes, timings -- not the furniture's internal spacing.
     *
     * The gap between a heading and its toggle is 21px rather than 16, and the number is MEASURED: a Chinese glyph at this
     * size is about 19px tall, not the 13 the font size suggests, so a 16px offset put the button's background over the
     * bottom of "作弊 / CHEATS" -- the label was drawn first and the background covered it. The screenshot is what caught
     * it, which is why the rows are checked against each other rather than trusted.
     */
    const ROW = {
      volumeLabel: 78,
      slider: 112,
      accessLabel: 156,
      accessRow: 177,
      cheatsLabel: 227,
      cheatsRow: 248,
      rowHeight: 42,
      rowGap: 10,
    };

    // Volume, near the top: it is the only setting, so it gets the prominent slot.
    this.volumeLabel.scale.set(s);
    this.volumeLabel.anchor.set(0, 0.5);
    this.volumeLabel.x = this.panelRect.x + 24 * s;
    this.volumeLabel.y = this.panelRect.y + ROW.volumeLabel * s;

    const sliderW = w - 48 * s;
    this.slider = {
      x: this.panelRect.x + 24 * s,
      y: this.panelRect.y + ROW.slider * s,
      w: sliderW,
      h: 14 * s,
    };

    const closeSize = 34 * s;
    this.place(this.closeButton, this.panelRect.x + w - closeSize - 12 * s, this.panelRect.y + 12 * s, closeSize, closeSize, s);

    // The accessibility section: a heading and one wide toggle, under the volume and above the cheats.
    this.accessLabel.scale.set(s);
    this.accessLabel.anchor.set(0, 0.5);
    this.accessLabel.x = this.panelRect.x + 24 * s;
    this.accessLabel.y = this.panelRect.y + ROW.accessLabel * s;

    // Restart and exit stacked under the cheats, then save and cancel side by side along the bottom.
    const rowH = ROW.rowHeight * s;
    const rowW = w - 48 * s;
    const rowX = this.panelRect.x + 24 * s;
    this.place(this.flashButton, rowX, this.panelRect.y + ROW.accessRow * s, rowW, rowH, s);

    this.cheatLabel.scale.set(s);
    this.cheatLabel.anchor.set(0, 0.5);
    this.cheatLabel.x = this.panelRect.x + 24 * s;
    this.cheatLabel.y = this.panelRect.y + ROW.cheatsLabel * s;
    this.place(this.cheatButton, rowX, this.panelRect.y + ROW.cheatsRow * s, rowW, rowH, s);
    this.place(this.restartButton, rowX, this.panelRect.y + ROW.cheatsRow * s + rowH + ROW.rowGap * s, rowW, rowH, s);
    this.place(this.exitButton, rowX, this.panelRect.y + ROW.cheatsRow * s + (rowH + ROW.rowGap * s) * 2, rowW, rowH, s);

    const gap = 12 * s;
    const halfW = (rowW - gap) / 2;
    const bottomY = this.panelRect.y + h - rowH - 24 * s;
    this.place(this.saveButton, rowX, bottomY, halfW, rowH, s);
    this.place(this.cancelButton, rowX + halfW + gap, bottomY, halfW, rowH, s);

    this.buildStatic();
    this.redraw();
  }

  /** Position a button and size its background to match. */
  private place(button: Button, x: number, y: number, w: number, h: number, s: number): void {
    button.x = x;
    button.y = y;
    button.w = w;
    button.h = h;
    button.label.scale.set(s);
    button.label.x = x + w / 2;
    button.label.y = y + h / 2;
  }

  /** Advance the press pulse. Cheap; called every rendered frame. */
  update(): void {
    // Nothing to animate: the panel is static until a pointer changes it, and a redraw per frame would rebuild
    // the scrim and every button for no reason. A pulsing button would be the thing to add here.
  }

  /**
   * Redraw the dynamic parts: the slider's fill, the volume label, and which button looks pressed.
   *
   * Static geometry -- the panel, the scrim, the button backgrounds -- is built by `layout`, which knows the
   * canvas. Splitting them keeps this callable from a pointer handler without a viewport in hand, which is
   * where an earlier version went wrong by reaching for a canvas size it did not have.
   */
  private redraw(): void {
    const s = this.scale;
    if (!this.open) return;

    const sl = this.slider;
    const knobX = sl.x + sl.w * this.volume;
    this.sliderFill.clear();
    if (this.volume > 0.001) {
      this.sliderFill
        .roundRect(sl.x, sl.y - sl.h / 2, sl.w * this.volume, sl.h, sl.h / 2)
        .fill({ color: 0x6fe3ff, alpha: 0.85 });
    }
    this.sliderKnob.clear();
    this.sliderKnob.circle(knobX, sl.y, 12 * s).fill({ color: 0xffffff, alpha: 0.96 });
    this.sliderKnob.circle(knobX, sl.y, 12 * s).stroke({ color: 0x6fe3ff, alpha: 0.9, width: 2 * s });

    this.volumeLabel.text = `音量 / VOLUME   ${Math.round(this.volume * 100)}`;

    for (const b of this.buttons()) {
      const primary = b === this.saveButton;
      const danger = b === this.exitButton;
      /**
       * The cheat toggle draws its own state rather than only its label: ON reads as a filled warm button, which is
       * visible from across the panel and cannot be mistaken for the run controls above and below it.
       */
      if (b === this.cheatButton) {
        b.bg.clear();
        b.bg
          .roundRect(b.x, b.y, b.w, b.h, 10 * s)
          .fill({ color: this.infiniteHealth ? 0x4a3418 : 0x16293f, alpha: 0.95 })
          .stroke({ color: this.infiniteHealth ? 0xffb46b : 0x5fa8cc, alpha: 0.8, width: 1.2 * s });
        continue;
      }
      /**
       * And the accessibility toggle in the UI's own blue rather than the cheat's amber: they are different kinds of
       * switch, and sharing a colour would say they are the same kind of thing.
       */
      if (b === this.flashButton) {
        b.bg.clear();
        b.bg
          .roundRect(b.x, b.y, b.w, b.h, 10 * s)
          .fill({ color: this.reducedFlash ? 0x14384f : 0x16293f, alpha: 0.95 })
          .stroke({ color: this.reducedFlash ? 0x6fe3ff : 0x5fa8cc, alpha: 0.8, width: 1.2 * s });
        continue;
      }
      b.bg.clear();
      b.bg
        .roundRect(b.x, b.y, b.w, b.h, 10 * s)
        .fill({
          color: b.pressed ? 0x2a4a6b : danger ? 0x33202c : primary ? 0x1d3c58 : 0x16293f,
          alpha: 0.95,
        })
        .stroke({ color: b.pressed ? 0x9fe4ff : danger ? 0xd88a9a : 0x5fa8cc, alpha: 0.7, width: 1.2 * s });
    }
  }

  /** Build everything that depends on the canvas: the scrim, the panel, the slider track and the button frames. */
  private buildStatic(): void {
    const s = this.scale;
    const p = this.panelRect;

    // A full-canvas scrim, so the water and the HUD are dimmed behind the panel. Sized from the canvas, NOT
    // from the panel: see the field comment.
    //
    // 0.82 rather than a lighter value: at 0.66 the white depth headline still read through clearly, which
    // looks like a rendering fault rather than like a dimmed background. The HUD is bright by design, so the
    // scrim has to be dark enough to actually put it back.
    this.scrim.clear();
    this.scrim.rect(0, 0, this.canvasWidth, this.canvasHeight).fill({ color: 0x02060d, alpha: 0.82 });

    this.panelBg.clear();
    this.panelBg
      .roundRect(p.x, p.y, p.w, p.h, 18 * s)
      .fill({ color: 0x0e1c2f, alpha: 0.97 })
      .stroke({ color: 0x6dc7e8, alpha: 0.5, width: 1.5 * s });

    const sl = this.slider;
    this.sliderTrack.clear();
    this.sliderTrack
      .roundRect(sl.x, sl.y - sl.h / 2, sl.w, sl.h, sl.h / 2)
      .fill({ color: 0x08131f, alpha: 0.95 })
      .stroke({ color: 0x3d7fa8, alpha: 0.6, width: 1 });

    this.drawGear();
  }

  /** The cog. Static, and drawn here because it is the one piece of geometry that is not a rectangle. */
  private drawGear(): void {
    const s = this.scale;
    const g = this.gear;
    g.clear();
    const { x, y, radius } = this.gearCircle;
    g.circle(x, y, radius).fill({ color: 0x122238, alpha: 0.72 });
    g.circle(x, y, radius).stroke({ color: 0x6dc7e8, alpha: 0.75, width: 1.6 * s });

    // A cog: eight teeth around a ring, with a hollow centre. Drawn as polygons rather than as an arc with a
    // stroke, because `Graphics.arc` left a stray line back to the path origin in an earlier version.
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const inner = radius * 0.42;
      const outer = radius * 0.72;
      const half = (Math.PI / teeth) * 0.42;
      g.poly([
        x + Math.cos(a - half) * inner,
        y + Math.sin(a - half) * inner,
        x + Math.cos(a - half * 0.7) * outer,
        y + Math.sin(a - half * 0.7) * outer,
        x + Math.cos(a + half * 0.7) * outer,
        y + Math.sin(a + half * 0.7) * outer,
        x + Math.cos(a + half) * inner,
        y + Math.sin(a + half) * inner,
      ]).fill({ color: 0xbfe9ff, alpha: 0.92 });
    }
    g.circle(x, y, radius * 0.34).fill({ color: 0x0a1626, alpha: 0.9 });
    g.circle(x, y, radius * 0.34).stroke({ color: 0xbfe9ff, alpha: 0.7, width: 1.4 * s });
  }

  /** Legacy entry point used by the pointer handlers. Kept so they need no knowledge of the split. */
  private draw(s: number): void {
    this.scale = s;
    this.redraw();
  }

  // ---------------------------------------------------------------------------------------------
  // Pointer handling. Every entry point returns whether it CONSUMED the event, so the game can decide
  // whether the water controls should also see it.
  // ---------------------------------------------------------------------------------------------

  /** True if the pointer is inside the given rectangle, with a little slack for a fingertip. */
  private inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }, slack = 0): boolean {
    return x >= r.x - slack && x <= r.x + r.w + slack && y >= r.y - slack && y <= r.y + r.h + slack;
  }

  private inCircle(x: number, y: number, c: { x: number; y: number; radius: number }): boolean {
    const dx = x - c.x;
    const dy = y - c.y;
    return dx * dx + dy * dy <= c.radius * c.radius * 1.35 * 1.35;
  }

  handlePointerDown(pointerId: number, x: number, y: number): boolean {
    if (!this.open) {
      if (this.inCircle(x, y, this.gearCircle)) {
        this.setOpen(true);
        return true;
      }
      return false;
    }

    // While the panel is open it swallows EVERY pointer: the game behind it must not receive taps that were
    // meant for the panel, and a stray drag must not move the bubble.
    for (const b of this.buttons()) {
      if (this.inRect(x, y, b)) b.pressed = true;
    }
    if (this.inRect(x, y, { x: this.slider.x - 14, y: this.slider.y - 20, w: this.slider.w + 28, h: 40 })) {
      this.sliderPointer = pointerId;
      this.moveSlider(x);
    }
    this.draw(1);
    return true;
  }

  handlePointerMove(pointerId: number, x: number, y: number): boolean {
    if (!this.open) return false;
    // A button that the finger has slid off stops looking pressed, so the press cannot fire on release.
    for (const b of this.buttons()) {
      if (b.pressed && !this.inRect(x, y, b)) b.pressed = false;
    }
    if (this.sliderPointer === pointerId) this.moveSlider(x);
    this.draw(1);
    return true;
  }

  handlePointerUp(pointerId: number, x: number, y: number): boolean {
    if (!this.open) return false;
    if (this.sliderPointer === pointerId) this.sliderPointer = null;
    for (const b of this.buttons()) {
      const wasPressed = b.pressed;
      b.pressed = false;
      // Fire only if the release is still inside: a finger that slid away has changed its mind.
      if (wasPressed && this.inRect(x, y, b)) this.onPressOf(b)();
    }
    this.draw(1);
    return true;
  }

  /** Update the volume from a pointer x, and tell the game so the audio follows live. */
  private moveSlider(x: number): void {
    const t = (x - this.slider.x) / Math.max(1, this.slider.w);
    this.volume = Math.min(1, Math.max(0, t));
    this.onVolume(this.volume);
    this.draw(1);
  }

  /** Exposed so a probe can find the real controls instead of guessing at their positions. */
  get geometry(): {
    gear: { x: number; y: number; radius: number };
    panel: { x: number; y: number; w: number; h: number };
    slider: { x: number; y: number; w: number; h: number };
    buttons: Record<string, { x: number; y: number; w: number; h: number }>;
  } {
    return {
      gear: { ...this.gearCircle },
      panel: { ...this.panelRect },
      slider: { ...this.slider },
      buttons: {
        close: rectOf(this.closeButton),
        restart: rectOf(this.restartButton),
        exit: rectOf(this.exitButton),
        save: rectOf(this.saveButton),
        cancel: rectOf(this.cancelButton),
      },
    };
  }

  /** The volume the slider is showing, 0..1. */
  get sliderValue(): number {
    return this.volume;
  }
}

function rectOf(b: Button): { x: number; y: number; w: number; h: number } {
  return { x: b.x, y: b.y, w: b.w, h: b.h };
}

/**
 * A panel label, in the configured UI font.
 *
 * The family has to carry the Chinese glyphs itself -- see the note in `config/mechanics.json5` on why a
 * Latin-only monospace first clips the top of every Chinese character.
 */
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




