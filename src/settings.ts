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

/**
 * One level as the settings panel needs it: what to draw, and whether it can be played.
 *
 * The lock state is GIVEN to the panel rather than worked out by it, because what unlocks what belongs to the progress
 * store. A panel that knew the rule would be a second place to change it, and the two would eventually disagree.
 *
 * It lives here now rather than on the menu because the row does. It was `MenuLevel` in `src/menu.ts`.
 */
export interface LevelPill {
  id: string;
  name: string;
  locked: boolean;
  selected: boolean;
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
  /** The cheat section's heading, and the toggles themselves. */
  private readonly cheatLabel: Text;
  private readonly cheatButton: Button;
  /**
   * The debug-mode toggle, in the cheat section.
   *
   * It is a cheat by behaviour rather than by name -- it unlocks every level and opens the way into the debug level -- but
   * it is not one by INTENT, so it has its own label rather than being folded into the infinite-health switch.
   */
  private readonly debugButton: Button;
  /**
   * Whether the collision boxes are drawn: its own switch, beside debug mode and not part of it.
   *
   * It used to BE debug mode -- one toggle that drew the boxes and showed the level ladder -- and the two are different
   * questions: somebody tuning a hitbox wants the lines with the ladder off, and somebody walking the ladder does not want
   * a screen full of red. It shares a row with the debug-mode toggle so the panel does not grow a row for it.
   */
  private readonly hitboxButton: Button;
  /**
   * The way into the debug level: a level where the creatures under test are placed by `config/debug-level.json5`.
   *
   * Offered only from the MENU and only while the debug switch is on -- the same two conditions as the level pills, and for
   * the same reasons: it is a developer's door, and a panel opened mid-run has a level already under way that this would
   * silently abandon. See `showsDebugEntry`.
   */
  private readonly debugLevelButton: Button;
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

  /**
   * Whether the panel was opened during a RUN rather than from the menu.
   *
   * It decides exactly one thing -- whether 重开本关 and 退出到主菜单 are offered -- and that is a fact about how the
   * panel was REACHED rather than about the game. From the menu there is no level to restart and the way out of the
   * panel is the button that opened it, so a restart button would do something surprising and an exit button would go
   * where the player already is.
   *
   * It defaults to TRUE because that is the panel's only caller that existed before the menu's button: the gear lives
   * in the HUD, and the HUD is only up during a run.
   */
  private inRun = true;

  /**
   * The viewport of the last layout, so a change that alters the panel's HEIGHT can lay it out again.
   *
   * `setInRun` is the only thing that needs it: it removes two rows, and the panel's height is derived from the rows it
   * has. Nothing else about this panel changes shape without a resize, which is why this is a convenience rather than
   * the panel's own state.
   */
  private lastViewport: Viewport | null = null;

  /**
   * The level row: one pill per level, with its lock state.
   *
   * IT MOVED HERE from the main menu, and the move is the whole of its reason: it is the DEBUG ladder -- the game hands
   * it an empty list unless the debug switch is on -- and the switch that turns it on is the row directly above it. A
   * row that only ever appears on the screen that owns its switch is easier to reason about than one two screens away.
   *
   * It replaced `MenuLevel`, `setLevels`, `setLevelNote`, `onPickLevel` and the whole drawn row on `MainMenu`; those
   * are gone rather than duplicated. What is NOT gone is the gating rule, which lives in the game: the list is empty
   * unless debug is on, and `inRun` decides the rest -- see `levelRowShown`.
   */
  private levels: readonly LevelPill[] = [];
  private levelRects: { x: number; y: number; w: number; h: number }[] = [];
  private levelLabels: Text[] = [];
  private selectedLevelId = '';
  /**
   * Which pill the current press landed on, or null.
   *
   * An INDEX rather than a reference, because the list can be rebuilt under a press -- `setLevels` is called every time
   * the debug switch flips or a level is picked. An index that no longer exists simply reads as `undefined` and the
   * release does nothing, where a remembered label would have to be checked for destruction.
   */
  private pressedPill = -1;
  private readonly levelRow = new Graphics();

  /** Called when the player taps a level that is selectable. */
  onPickLevel: (levelId: string) => void = () => {};

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
  /**
   * The debug-mode switch: free level selection, and the way into the debug level.
   *
   * Defaults to ON and is NOT persisted, like every other switch here -- see the note on the cheat toggle, which is
   * the same argument. Signalled the same way as its neighbours so the game owns the state and this panel only asks.
   */
  onDebugMode: (on: boolean) => void = () => {};
  /** The collision-box switch: whether the overlay that outlines every hitbox is drawn. Defaults to ON, not persisted. */
  onShowHitboxes: (on: boolean) => void = () => {};
  /** Called when the way into the debug level is pressed. The game switches level and starts it. */
  onEnterDebugLevel: () => void = () => {};
  /** Called when exit-to-menu is pressed. */
  onExit: () => void = () => {};

  /** Screen geometry, rebuilt by `layout`. */
  private gearCircle = { x: 0, y: 0, radius: 0 };
  private panelRect = { x: 0, y: 0, w: 0, h: 0 };
  private slider = { x: 0, y: 0, w: 0, h: 0 };
  /** 0..1, the value the slider currently shows. */
  private volume = 0.8;
  /** Whether the cheat is on. Kept here so the panel can draw its own state, and not persisted. */
  private infiniteHealth = false;
  /** Whether the debug overlay is on. Defaults ON, and resets to that on every load. */
  private debugMode = true;
  /** Whether the collision boxes are drawn. Defaults ON, and resets to that on every load. */
  private showHitboxes = true;
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
    this.levelRow.eventMode = 'none';

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
    // Already on at construction, so the label starts in the ON form -- `redraw` keeps it in step from here.
    this.debugButton = this.mkButton('调试模式：开', () => this.setDebugMode(!this.debugMode));
    this.hitboxButton = this.mkButton('碰撞盒：开', () => this.setShowHitboxes(!this.showHitboxes));
    this.debugLevelButton = this.mkButton('进入调试关', () => this.onEnterDebugLevel());
    // Whether it is offered is decided by `syncDebugEntry`; this is its state at construction (in a run: not offered).
    this.debugLevelButton.bg.visible = false;
    this.debugLevelButton.label.visible = false;

    this.restartButton = this.mkButton('重开本关', () => this.onRestart());
    this.exitButton = this.mkButton('退出到主菜单', () => this.onExit());
    // Both simply close. Saving is instantaneous -- the volume is already applied -- and the pair exists
    // because a settings panel without them reads as unfinished, and because there WILL be data that needs
    // confirming later.
    this.saveButton = this.mkButton('保存', () => this.setOpen(false));
    this.cancelButton = this.mkButton('取消', () => this.setOpen(false));

    this.panel.addChild(
      this.panelBg,
      this.levelRow,
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
      this.debugButton.bg,
      this.debugButton.label,
      this.hitboxButton.bg,
      this.hitboxButton.label,
      this.debugLevelButton.bg,
      this.debugLevelButton.label,
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

  /**
   * The buttons that are currently OFFERING themselves, so the pointer handlers can walk them without repeating the
   * list three times.
   *
   * Hidden ones are filtered out rather than skipped at each call site, and that is the point of the filter: their
   * rectangles outlive their visibility -- a button that is not placed keeps whatever box the last layout gave it -- so
   * a rectangle test against an invisible button can still succeed. `setInRun` is what makes that reachable, and this
   * is what makes it harmless.
   */
  private buttons(): Button[] {
    return [
      this.closeButton,
      this.flashButton,
      this.cheatButton,
      this.debugButton,
      this.hitboxButton,
      this.debugLevelButton,
      this.restartButton,
      this.exitButton,
      this.saveButton,
      this.cancelButton,
    ].filter((button) => button.bg.visible);
  }

  /**
   * Whether the way into the debug level is on the panel: opened from the menu, with the debug switch on.
   *
   * The switch is half of it because the debug level is the debug tools' own destination -- the hitbox overlay and the
   * level ladder are already behind that switch, and a player who has it off has told the game they do not want any of it.
   */
  private get showsDebugEntry(): boolean {
    return !this.inRun && this.debugMode;
  }

  /**
   * Show or hide the debug-level button to match `showsDebugEntry`, and say whether that changed anything.
   *
   * A hidden button is also disarmed: its rectangle outlives its visibility (see `buttons`), and a press that landed where
   * it WOULD be must not fire a door nobody can see.
   */
  private syncDebugEntry(): boolean {
    const shown = this.showsDebugEntry;
    const changed = this.debugLevelButton.bg.visible !== shown;
    this.debugLevelButton.bg.visible = shown;
    this.debugLevelButton.label.visible = shown;
    this.debugLevelButton.pressed = false;
    return changed;
  }

  private onPressOf(button: Button): () => void {
    return (button as Button & { onPress: () => void }).onPress;
  }

  get isOpen(): boolean {
    return this.open;
  }

  /**
   * Tell the panel how it was reached, which decides whether the run's own controls are offered.
   *
   * Re-lays out rather than only hiding, because the two rows are part of the panel's HEIGHT: hiding them and leaving
   * the panel the same size would leave a hole where they were, right above 保存 / 取消.
   *
   * The `===` guard is what makes it safe to call this on every open and close without a layout each time.
   */
  setInRun(inRun: boolean): void {
    if (this.inRun === inRun) return;
    this.inRun = inRun;
    for (const button of [this.restartButton, this.exitButton]) {
      button.bg.visible = inRun;
      button.label.visible = inRun;
      // A hidden button must not be armed either: the rectangles are still tested while invisible, so a press that
      // landed where the button WOULD be would fire a control nobody can see.
      button.pressed = false;
    }
    this.syncDebugEntry();
    if (this.lastViewport) this.layout(this.lastViewport);
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

  /**
   * Turn debug mode on or off: free level selection, and the way into the debug level.
   *
   * The same shape as `setInfiniteHealth`, and for the same reason: one place that sets the state, redraws and tells
   * the game, so the button and a probe cannot take different paths.
   */
  setDebugMode(on: boolean, notify = true): void {
    this.debugMode = on;
    this.debugButton.label.text = on ? '调试模式：开' : '调试模式：关';
    this.debugButton.label.style.fill = on ? 0xffd479 : 0xeaf9ff;
    // The debug level's door is behind this switch, and a row appearing or going changes the panel's height.
    if (this.syncDebugEntry() && this.lastViewport) this.layout(this.lastViewport);
    this.redraw();
    if (notify) this.onDebugMode(on);
  }

  /** Whether debug mode is on, as the panel shows it. */
  get debugModeOn(): boolean {
    return this.debugMode;
  }

  /**
   * Turn the collision-box overlay on or off.
   *
   * One place that sets the state, redraws and tells the game, like the switches around it.
   */
  setShowHitboxes(on: boolean, notify = true): void {
    this.showHitboxes = on;
    this.hitboxButton.label.text = on ? '碰撞盒：开' : '碰撞盒：关';
    this.hitboxButton.label.style.fill = on ? 0xffd479 : 0xeaf9ff;
    this.redraw();
    if (notify) this.onShowHitboxes(on);
  }

  /** Whether the collision boxes are drawn, as the panel shows it. */
  get showHitboxesOn(): boolean {
    return this.showHitboxes;
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
    this.lastViewport = viewport;
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
     * The panel's rows, in DESIGN PIXELS below the panel's top edge.
     *
     * They live here rather than in `config/mechanics.json5` and that is deliberate: every number in this file is a
     * proportional offset inside a panel whose own size is derived from the viewport (`w`, `h` just below), so a value
     * in the config would have to be kept in step with arithmetic it cannot see. What goes in the config is what the
     * player looks AT -- colours, sizes, timings -- not the furniture's internal spacing.
     *
     * The gap between a heading and its toggle is 21px rather than 16, and the number is MEASURED: a Chinese glyph at
     * this size is about 19px tall, not the 13 the font size suggests, so a 16px offset put the button's background
     * over the bottom of "作弊 / CHEATS" -- the label was drawn first and the background covered it. The screenshot is
     * what caught it, which is why the rows are checked against each other rather than trusted.
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

    /**
     * The rows under the `作弊 / CHEATS` heading, in the order they are stacked: the cheat itself, the debug toggle,
     * and then the run's own two controls.
     *
     * THE CHEAT IS IN THE LIST, and forgetting it is what this list exists to prevent: it used to be placed by its own
     * hard-coded offset while the rest came from a loop, so the loop's first row landed on top of it and the infinite
     * health switch disappeared under the debug toggle. One list is one place to be wrong.
     *
     * 重开本关 and 退出到主菜单 are the RUN's. There is no level to restart and no menu to exit to when the panel was
     * opened FROM the menu, which is the one thing `setInRun` decides -- so they are the two rows that come and go.
     */
    /**
     * Each entry is one ROW, and a row may hold two buttons side by side: debug mode and the collision boxes share one, so
     * the panel does not grow a row for the second switch (in a run the stack was already as tall as its cap allows).
     */
    const modeRow = [this.debugButton, this.hitboxButton];
    const lowerRows: Button[][] = this.inRun
      ? [[this.cheatButton], modeRow, [this.restartButton], [this.exitButton]]
      : this.showsDebugEntry
        ? [[this.cheatButton], modeRow, [this.debugLevelButton]]
        : [[this.cheatButton], modeRow];

    /**
     * The level block, and its height in DESIGN PIXELS -- which is the same unit as `ROW` above.
     *
     * It is the one row on this panel whose height is not fixed: it is a GRID, and how many rows it has depends on how
     * many levels the game handed over. So it is measured here, before the panel's height is worked out, from the very
     * same numbers that are about to place it.
     *
     * Zero when the list is empty, which is the ordinary case: the game hands an empty list unless the debug switch is
     * on, and `showsLevelRow` is false in a run.
     */
    const levelCfg = mech.settings.levels;
    const levelRows = this.showsLevelRow ? Math.ceil(this.levels.length / Math.max(1, levelCfg.perRow)) : 0;
    const levelBlock = levelRows > 0 ? levelRows * levelCfg.rowHeight + (levelRows - 1) * levelCfg.rowGap : 0;
    /**
     * And it sits AFTER the toggle rows rather than between them, which is only possible because the level row and
     * restart/exit never appear together: the row is offered to a panel opened from the menu and the other two to one
     * opened during a run, so the stack is either `cheat, debug, restart, exit` or `cheat, debug, debug level, pills`.
     * Putting it last keeps the height and the placement a single list to walk.
     */
    const stackBottom =
      ROW.cheatsRow +
      (ROW.rowHeight + ROW.rowGap) * (lowerRows.length - 1) +
      ROW.rowHeight +
      (levelBlock > 0 ? levelBlock + ROW.rowGap : 0);

    /**
     * The panel is as tall as its row stack needs and no taller.
     *
     * The height is COMPUTED from the same rows that were just placed, rather than being the flat `522` it used to be
     * capped at. A cap and a stack written out as two separate numbers are two numbers that can disagree -- and 522 is
     * exactly what this arithmetic produces for the four rows it was sized for, which is how you can tell it is the
     * right arithmetic. With two rows removed and a two-row pill grid added it produces something else, and it has to:
     * `setInRun` and `setLevels` both change how many rows there are while the panel is on screen.
     *
     * `viewport.height * 0.66` is still the cap, so a short screen gets a panel that fits on it at all.
     */
    const h = Math.min(viewport.height * 0.66, (stackBottom + ROW.rowGap + ROW.rowHeight + 24) * s);
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
    /**
     * The rows under the cheats heading, placed by the same list the height was computed from.
     *
     * A loop rather than hard-coded offsets, because the offsets and the height have to agree and the way to make them
     * agree is to have one number for both. Restart and exit are simply not in the list when the panel was opened from
     * the menu, so they are not placed and the panel is shorter by exactly their two rows.
     */
    const rowStep = rowH + ROW.rowGap * s;
    let nextRowY = this.panelRect.y + ROW.cheatsRow * s;
    const pairGap = 12 * s;
    lowerRows.forEach((row) => {
      const each = (rowW - pairGap * (row.length - 1)) / row.length;
      row.forEach((button, i) => this.place(button, rowX + i * (each + pairGap), nextRowY, each, rowH, s));
      nextRowY += rowStep;
    });
    /**
     * And the level block, below the last toggle row and below nothing else.
     *
     * Its own placement rather than a `place()` call, because it is a grid of N pills and not one rectangle. It is
     * handed the row's own left edge and width, so the pills line up with the toggle above them -- which is the whole
     * reason the panel computes `rowW` once.
     */
    if (levelRows > 0) {
      this.placeLevelRow(rowX, nextRowY, rowW, levelCfg, s);
    } else {
      /**
       * No row now means no rectangles, and that has to be said: they outlive a layout that does not place them. Opened from
       * the menu the panel placed them; then the run started and `setInRun` laid it out again WITHOUT the row -- and the
       * pills were still drawn, at the old place, behind 重开本关 and 退出到主菜单.
       */
      this.levelRects = [];
    }

    const gap = 12 * s;
    const halfW = (rowW - gap) / 2;
    const bottomY = this.panelRect.y + h - rowH - 24 * s;
    this.place(this.saveButton, rowX, bottomY, halfW, rowH, s);
    this.place(this.cancelButton, rowX + halfW + gap, bottomY, halfW, rowH, s);

    this.buildStatic();
    this.redraw();
  }

  /**
   * Lay the level pills out in a centred grid, each row at most `maxRowWidthRatio` of the available width.
   *
   * The wrap is the same rule the main menu used and for the same reason: they were one row of equal shares, and with
   * six levels every pill became a third of its own name's width and the names drew on top of each other. A pill nobody
   * can read is not a choice.
   *
   * A row that is not full is CENTRED and its pills keep the full-row slot width -- so a lone last pill is not stretched
   * into a bar three times the width of the ones above it, which is what `rowW_here / inRow` would do on its own.
   */
  private placeLevelRow(x: number, y: number, availableW: number, cfg: typeof mech.settings.levels, s: number): void {
    const perRow = Math.max(1, Math.floor(cfg.perRow));
    const slotW = availableW / perRow;
    const maxRowW = Math.min(availableW, availableW * cfg.maxRowWidthRatio);
    const rowH = cfg.rowHeight * s;
    const rowStep = rowH + cfg.rowGap * s;
    this.levelRects = this.levels.map((_, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, this.levels.length - row * perRow);
      const rowW = Math.min(maxRowW, inRow * slotW);
      const slot = rowW / inRow;
      const col = i - row * perRow;
      return { x: x + (availableW - rowW) / 2 + col * slot, y: y + row * rowStep, w: slot, h: rowH };
    });
    this.placeLevelLabels(cfg, s);
  }

  /**
   * Put each pill's name in its pill.
   *
   * Called from the placement above AND from `setLevels`. Both are needed: a rebuilt list has labels sitting at the
   * origin, and a resize has pills with no names in them yet. The rects come from the last real layout, so a rebuild
   * before the first one places nothing and the layout that follows does it.
   */
  private placeLevelLabels(cfg: typeof mech.settings.levels, s: number): void {
    for (const [i, label] of this.levelLabels.entries()) {
      const rect = this.levelRects[i];
      if (!rect) continue;
      label.style.fontSize = cfg.textSize;
      label.scale.set(s);
      label.anchor.set(0.5, 0.5);
      label.x = rect.x + rect.w / 2;
      label.y = rect.y + rect.h / 2;
    }
  }

  /**
   * Whether the level row is on the panel right now.
   *
   * Two conditions, and both matter. An empty list is "the ladder is off" -- the game hands one unless the debug switch
   * is on -- and `inRun` is "a level has already been chosen and is being played": picking one here would change what
   * the NEXT run starts at, with nothing on screen to say so. `setInRun` is what decides the second, and this is the
   * only thing that reads it besides the restart/exit rows.
   */
  private get showsLevelRow(): boolean {
    return !this.inRun && this.levels.length > 0;
  }

  /**
   * Hand the panel the levels to offer, with their lock state.
   *
   * The list comes from the progress store rather than from `LEVELS` directly, so the panel never has to know the
   * unlock rule -- and a probe can hand it any list to check the row re-lays out. Rebuilds the labels because the
   * number of pills is part of the layout, and lays the panel out again because the number of ROWS is part of the
   * panel's HEIGHT: a list that arrives while the panel is open is a different-sized panel, not a different drawing on
   * the same one.
   */
  setLevels(levels: readonly LevelPill[]): void {
    this.levels = levels;
    for (const label of this.levelLabels) {
      this.panel.removeChild(label);
      label.destroy();
    }
    this.levelLabels.length = 0;
    for (const level of levels) {
      const label = mkText(level.name, mech.settings.levels.idleTextColour, mech.settings.levels.textSize);
      label.eventMode = 'none';
      this.levelLabels.push(label);
      this.panel.addChild(label);
    }
    if (!levels.some((level) => level.id === this.selectedLevelId)) {
      this.selectedLevelId = levels.find((level) => !level.locked)?.id ?? '';
    }
    this.levelRects = [];
    this.placeLevelLabels(mech.settings.levels, this.scale);
    if (this.lastViewport) this.layout(this.lastViewport);
    else this.redraw();
  }

  /** Test hook and game hook: which level the run would start at. */
  get selectedLevelIdValue(): string {
    return this.selectedLevelId;
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
       * The debug toggle wears the cheat's amber too, because to the game it IS one -- but it is ON by default, so a
       * panel at rest shows a lit switch. That is the honest picture: this build has the overlay running until
       * somebody turns it off.
       */
      if (b === this.debugButton) {
        b.bg.clear();
        b.bg
          .roundRect(b.x, b.y, b.w, b.h, 10 * s)
          .fill({ color: this.debugMode ? 0x4a3418 : 0x16293f, alpha: 0.95 })
          .stroke({ color: this.debugMode ? 0xffb46b : 0x5fa8cc, alpha: 0.8, width: 1.2 * s });
        continue;
      }
      // The collision-box switch wears the same amber: it is a developer's view, like the one beside it.
      if (b === this.hitboxButton) {
        b.bg.clear();
        b.bg
          .roundRect(b.x, b.y, b.w, b.h, 10 * s)
          .fill({ color: this.showHitboxes ? 0x4a3418 : 0x16293f, alpha: 0.95 })
          .stroke({ color: this.showHitboxes ? 0xffb46b : 0x5fa8cc, alpha: 0.8, width: 1.2 * s });
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
        .stroke({ color: b.pressed ? 0x9fe4ff : danger ? 0xd88a9a : b === this.debugLevelButton ? 0xffb46b : 0x5fa8cc, alpha: 0.7, width: 1.2 * s });
    }

    this.drawLevelRow(s);
  }

  /**
   * Paint the level pills, and colour their names.
   *
   * Here rather than in `buildStatic` because it is the DYNAMIC half: the rectangles are the layout's, but which pill
   * looks selected changes the moment one is tapped, and this is the method a pointer handler can call without a
   * viewport in hand.
   *
   * TWO states, and no lock icon: selected is filled, everything else is outlined. There used to be a third -- locked,
   * drawn darker with a dim stroke -- and it went when the ladder became a debug affordance that shows every level as
   * reachable. `LevelPill.locked` is still computed and still carried, because the unlock RULE is still real and still
   * written to the save; there is just nothing on this row that could be locked, so a state for it would be a branch
   * nothing can reach.
   */
  private drawLevelRow(s: number): void {
    const cfg = mech.settings.levels;
    this.levelRow.clear();
    for (const [i, rect] of this.levelRects.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      this.levelRow
        .roundRect(rect.x, rect.y, rect.w, rect.h, cfg.radius * s)
        .fill({ color: level.selected ? cfg.selectedFill : cfg.idleFill, alpha: 0.95 })
        .stroke({ color: level.selected ? cfg.selectedStroke : cfg.idleStroke, alpha: level.selected ? 1 : 0.7, width: Math.max(1, 1.2 * s) });
    }
    for (const [i, label] of this.levelLabels.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      // A name with no pill under it is not shown: its text is a child of the panel like any other, and stays where it was.
      label.visible = this.levelRects[i] !== undefined;
      const want = level.selected ? cfg.selectedTextColour : cfg.idleTextColour;
      if (label.style.fill !== want) label.style.fill = want;
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
    /**
     * The level pills, which are not in `buttons()` because they are a LIST rather than a fixed set -- and because a
     * locked one must not arm. A pill that cannot be picked is not a disabled button that reports a press; it is a
     * thing that does nothing, which is what "you cannot play this yet" already looks like.
     */
    this.pressedPill = -1;
    if (this.showsLevelRow) {
      const hit = this.levelRects.findIndex((rect) => this.inRect(x, y, rect));
      if (hit >= 0 && !this.levels[hit]?.locked) this.pressedPill = hit;
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
    // And a pill, the same way -- a finger that slid off a level has changed its mind about which water.
    if (this.pressedPill >= 0 && !this.inRect(x, y, this.levelRects[this.pressedPill] ?? { x: 0, y: 0, w: 0, h: 0 })) {
      this.pressedPill = -1;
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
    /**
     * The pill, fired the same way and for the same reason: only if the release is still over it.
     *
     * The rectangle is looked up AGAIN rather than remembered with the index, because a rebuild between the press and
     * the release would have left the old index pointing at a pill that has since moved.
     */
    const pill = this.pressedPill;
    this.pressedPill = -1;
    if (pill >= 0 && this.showsLevelRow) {
      const rect = this.levelRects[pill];
      const level = this.levels[pill];
      if (rect && level && this.inRect(x, y, rect)) this.onPickLevel(level.id);
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
    /**
     * Whether the panel is offering the run's own controls.
     *
     * Reported next to the rectangles rather than instead of them, because the rectangles of 重开本关 and 退出到主菜单
     * OUTLIVE the buttons: they keep whatever box the last layout gave them, so `buttons.restart` answers while there is
     * no restart button on the screen. This is the flag that says which reading is true.
     */
    inRun: boolean;
    /** Whether the way into the debug level is offered: the same kind of flag as `inRun`, for the same reason. */
    debugEntry: boolean;
    /** The level row as offered, with its label -- the same shape the main menu used to report. */
    levels: { id: string; label: string; locked: boolean; selected: boolean; rect: { x: number; y: number; w: number; h: number } }[];
    buttons: Record<string, { x: number; y: number; w: number; h: number }>;
  } {
    return {
      gear: { ...this.gearCircle },
      panel: { ...this.panelRect },
      slider: { ...this.slider },
      inRun: this.inRun,
      debugEntry: this.showsDebugEntry,
      levels: this.levels.map((level, i) => ({
        id: level.id,
        label: level.name,
        locked: level.locked,
        selected: level.selected,
        rect: { ...(this.levelRects[i] ?? { x: 0, y: 0, w: 0, h: 0 }) },
      })),
      buttons: {
        close: rectOf(this.closeButton),
        flash: rectOf(this.flashButton),
        cheat: rectOf(this.cheatButton),
        debug: rectOf(this.debugButton),
        hitboxes: rectOf(this.hitboxButton),
        debugLevel: rectOf(this.debugLevelButton),
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




