import { Container, FillGradient, Graphics, Sprite, Text } from 'pixi.js';
import type { Texture } from 'pixi.js';
import { assetSizeNow, loadAssetTexture } from './assets';
import { rgba } from './background';
import { mech } from './mechanisms';
import { BASE_TYPE } from './bubbleTypes';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';
import { MenuBackdrop } from './menuBackdrop';

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
 * The three stone buttons, in the order they are stacked.
 *
 * The ID is what the pointer handlers compare and what `geometry` reports; `picture` is the asset stem, and the three
 * states are that stem with a suffix. So this table is also the list of what has to exist in `src/assets/` -- and the
 * ORDER of it is the order on the screen, which is why it lives here rather than in the config: it is not a number the
 * owner tunes, it is which button is above which.
 */
const BUTTONS = [
  { id: 'start', picture: '按钮-开始游戏' },
  { id: 'codex', picture: '按钮-图鉴' },
  { id: 'settings', picture: '按钮-设置' },
] as const;

type ButtonId = (typeof BUTTONS)[number]['id'];

/**
 * A button's three states, and the suffix its picture carries for each.
 *
 * `normal` has no suffix because it IS the stem -- `按钮-开始游戏.png` -- and the other two are that stem with
 * `-Hover` / `-Pressed` appended. Note the capital: the file names came from the art, and this is the one place that
 * spelling has to be right.
 */
const BUTTON_STATES = ['normal', 'Hover', 'Pressed'] as const;

type ButtonState = (typeof BUTTON_STATES)[number];

/** One button as the menu needs it: its pictures, its box, and which state it is showing. */
interface MenuButton {
  id: ButtonId;
  /** The asset stem. The state's file is this, plus the state's suffix. */
  picture: string;
  sprite: Sprite;
  /** Filled in as each state's picture arrives; the state picks which one is on the sprite. */
  textures: Partial<Record<ButtonState, Texture>>;
  /**
   * The width over the height, read from the ART rather than from the loaded texture.
   *
   * Same reason as `titleHeight`: the first layout runs before the pictures do, and a `Sprite` with no texture reports
   * no size -- so sizing the box off the sprite would divide by zero and leave a `NaN` rectangle, which never matches
   * a pointer. The frame size is known from the atlas manifest before anything is decoded, so this is a real number
   * from the first layout onward.
   */
  aspect: number;
  state: ButtonState;
  rect: { x: number; y: number; w: number; h: number };
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
  private readonly screen = mkGraphics();
  /**
   * The three stone buttons: 开始游戏 / 图鉴 / 设置.
   *
   * Each is a PICTURE rather than a drawn shape, and all three states of one button are cut from the SAME box in the
   * art. That is not a detail -- the pressed state is drawn a few pixels lower on purpose, and cropping each state to
   * its own content would have deleted exactly that, so swapping the picture would move the button. See the `--crop`
   * note in `scripts/import-picture.py`, which is what makes the shared box possible.
   *
   * The sprite is placed by its CENTRE, so a state whose art is a pixel or two shorter does not move the button.
   */
  private readonly buttons: MenuButton[] = BUTTONS.map((button) => ({
    id: button.id,
    picture: button.picture,
    sprite: new Sprite(),
    textures: {},
    aspect: pictureAspect(button.picture),
    state: 'normal' as ButtonState,
    rect: { x: 0, y: 0, w: 0, h: 0 },
  }));
  /**
   * The title is a PICTURE: `src/assets/标题.png`, an ordinary frame of the atlas, with the small fish and the coral
   * drawn into the art around the glyphs.
   *
   * It starts with no texture and is given one when the atlas arrives, the way `chargeTrail` does it. Standing in for
   * a missing title with the old line of text would buy nothing -- the SAME load is what puts the art on every fish in
   * the water behind it, so a menu with no picture is a menu with no pictures.
   */
  private readonly title = new Sprite();
  /** The width the title is drawn at, from the last layout. See `titleHeight`. */
  private titleWidth = 0;
  /**
   * The shadow the title sits on.
   *
   * The glyphs are stone-blue and everything behind them is blue, so at their own brightness they read as part of the
   * water rather than as the name of the game. This is what lifts them -- and it is in the MENU'S OWN dark rather than
   * in black, so it reads as the water deepening here rather than as a patch stuck onto it.
   *
   * Drawn rather than baked into the picture, and the three reasons point the same way: the numbers are then in the
   * config, the fade is smooth (the art is a forty-colour pixel picture and a gradient in it would band), and the
   * artwork stays the artwork.
   */
  private readonly titleGlow = new Graphics();
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

  /**
   * Called when the run may actually begin, which is NOT when the button is pressed.
   *
   * The backdrop leaves first and the callbacks arrive afterwards, so this fires once the water is clear. The delay is
   * the point of it: see `beginExit`.
   */
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
  /**
   * Called when the player asks for the settings panel.
   *
   * The menu does not open it: the panel is the game's, its buttons are the game's, and a menu that reached into it
   * would be the second place that decides what the panel is for. The menu says what was pressed and stops.
   */
  onSettings: () => void = () => {};
  /**
   * Whether the pointer driving the menu right now can be somewhere WITHOUT pressing.
   *
   * A mouse can, and a finger cannot: there is no "over" once the finger has lifted, so a touch tap that left a button
   * in its hover state would leave a stone glowing with nobody near it -- and it does not clear itself, because a touch
   * produces no further moves to clear it with. The fact is per EVENT rather than per device (a laptop with a
   * touchscreen produces both kinds), which is why the game sets it from the event it is handling instead of the menu
   * caching it once at startup.
   *
   * Defaults to `true`, so a probe that calls `handlePointer*` directly gets the desktop behaviour it is asking about.
   */
  pointerHovers = true;

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
   * up firing both -- which two independent flags would allow. A button is named by its id, and a level pill by
   * `level:<id>`, because the two are hit-tested differently and only one of them can be armed at a time.
   */
  private pressed: ButtonId | `level:${string}` | null = null;
  /** Scale from the last real layout, so a redraw without a viewport has the right one. */
  private scale = 1;
  /**
   * The animated backdrop: creatures swimming, and a coral bed in two layers.
   *
   * The menu owns it rather than the game, and that is deliberate -- it is a decoration of THIS screen, it exists only
   * while this screen does, and nothing it does can reach the water a run will start in. What it is not is a second
   * way of drawing a creature: see `src/menuBackdrop.ts`.
   */
  private readonly backdrop = new MenuBackdrop();
  /** Whether `onBackdropExit` has already been fired for the exit now running. */
  private exitReported = false;

  constructor() {
    this.root.eventMode = 'none';
    this.screen.eventMode = 'none';
    this.levelRow.eventMode = 'none';

    this.title.eventMode = 'none';
    this.titleGlow.eventMode = 'none';
    // By its BOTTOM: it is wide, short art, and a picture placed by its centre has to know its own height twice.
    this.title.anchor.set(0.5, 1);
    /**
     * The picture arrives on its own, and when it does it is given the texture AND the size the last layout asked for
     * -- see `applyTitleSize`, which the layout calls too, because either of the two can come second.
     */
    void loadAssetTexture('标题').then((texture) => {
      if (!texture) return;
      this.title.texture = texture;
      this.applyTitleSize();
    });

    /**
     * The button pictures arrive the same way, and the same reason applies: the one load that brings them is what puts
     * art on everything else on this screen, so a menu that waited for them before drawing would show nothing at all.
     *
     * Every state is fetched up front rather than on demand, because a state swap has to be INSTANT -- loading on hover
     * would put the picture on the screen a frame or two after the pointer arrived, which reads as lag rather than as a
     * button. A state whose picture never arrives leaves the sprite showing the previous one, which is the honest
     * failure: a button that vanishes because its hover art 404s is worse than one that changes late.
     */
    for (const button of this.buttons) {
      button.sprite.anchor.set(0.5, 0.5);
      button.sprite.eventMode = 'none';
      for (const state of BUTTON_STATES) {
        const asset = state === 'normal' ? button.picture : `${button.picture}-${state}`;
        void loadAssetTexture(asset).then((texture) => {
          if (!texture) return;
          button.textures[state] = texture;
          this.showButtonState(button);
        });
      }
    }

    /**
     * Display order is draw order, and the backdrop goes FIRST.
     *
     * Everything that should be visible belongs after `backdrop`, so nothing can end up behind the opaque screen.
     */
    this.root.addChild(
      // The opaque screen first, then the water's contents, then the interface. The backdrop's own root is a
      // container of three layers (coral, swimmers, coral), so it IS the water as far as the menu is concerned.
      this.screen,
      this.backdrop.root,
      this.titleGlow,
      this.title,
      this.levelRow,
      ...this.levelLabels,
      this.levelLine,
      this.tagline,
      ...this.buttons.map((button) => button.sprite),
      this.hint,
      this.versionLine,
    );
  }

  /**
   * Put the current state's picture on the sprite, if that picture has arrived.
   *
   * Guarded rather than assumed, because the three pictures land independently: a hover that happens between the
   * `normal` load and the `Hover` one would otherwise put an empty texture on a visible button.
   */
  private showButtonState(button: MenuButton): void {
    const texture = button.textures[button.state];
    if (!texture) return;
    button.sprite.texture = texture;
    this.sizeButton(button);
  }

  /**
   * Give the picture the width the last layout asked for.
   *
   * Called from BOTH ends -- the layout, and each load -- because either can come second, exactly as with the title.
   * Every state of a button is the same size (that is what the shared crop buys), so a swap does not need a resize;
   * this is called anyway so that the two paths cannot drift.
   */
  private sizeButton(button: MenuButton): void {
    const texture = button.sprite.texture;
    if (!texture || !texture.width) return;
    button.sprite.scale.set(button.rect.w / texture.width);
  }

  /**
   * The height the title's width implies.
   *
   * From the CONFIG's aspect and not off the sprite, because the layout runs before the art does: a `Sprite` with no
   * texture reports no size, and the guard that keeps the title off the ceiling needs a real number either way.
   */
  private get titleHeight(): number {
    return this.titleWidth / Math.max(0.01, mech.menu.titleAspect);
  }

  /**
   * Give the sprite the width the last layout asked for -- called from BOTH ends, because either can come second.
   *
   * On the first layout the picture has not arrived and there is nothing to size; when it arrives the load handler
   * calls this. And a resize before the picture arrives sets `titleWidth` with nothing to apply it to, which is why
   * the handler has to come back here rather than only setting the texture.
   */
  private applyTitleSize(): void {
    const texture = this.title.texture;
    if (!texture || !texture.width) return;
    this.title.scale.set(this.titleWidth / texture.width);
  }

  /**
   * Paint the shadow from the title's current box.
   *
   * The gradient is radial and deliberately NOT a plain one. The title is a wide band, so a radial inscribed in a box
   * `titleGlowScale` times its size would leave the two ENDS of the title outside the dark core -- the corners of the
   * art sit at 0.95 of that radius, where there is almost no alpha left. `titleGlowSolid` holds the core dark out to
   * 65% of the radius and fades from there, so the glyphs are backed and all the softness is outside them.
   *
   * The rect is drawn around the GRAPHICS' own origin and the graphics is POSITIONED, rather than the rect being drawn
   * at the title's corner: the fade is symmetric about the title's centre either way, and this way the two agree.
   */
  private drawTitleGlow(): void {
    const cfg = mech.menu;
    const w = this.titleWidth * cfg.titleGlowScale;
    const h = this.titleHeight * cfg.titleGlowScale;
    this.titleGlow.clear();
    if (w <= 0 || h <= 0) return;
    this.titleGlow.rect(-w / 2, -h / 2, w, h).fill({
      fill: new FillGradient({
        type: 'radial',
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerCenter: { x: 0.5, y: 0.5 },
        outerRadius: 0.5,
        colorStops: [
          { offset: 0, color: rgba(cfg.titleGlowColour, cfg.titleGlowAlpha) },
          { offset: Math.min(0.999, cfg.titleGlowSolid), color: rgba(cfg.titleGlowColour, cfg.titleGlowAlpha) },
          { offset: 1, color: rgba(cfg.titleGlowColour, 0) },
        ],
        textureSpace: 'local',
      }),
    });
    // The title is anchored by its bottom, so its centre is half its height above `title.y`.
    this.titleGlow.position.set(this.title.x, this.title.y - this.titleHeight / 2);
  }

  layout(viewport: Viewport): void {
    const cfg = mech.menu;
    const s = designScale(viewport.width, viewport.height);
    this.scale = s;
    /**
     * The backdrop is laid out against the LANE -- the same one a run happens in.
     *
     * The note that used to be here said "a lane exists to bound where the bubble may go; a reef has no such bound",
     * which is wrong in the way that is hardest to see: it made the menu the only screen in the game with its own idea
     * of how wide the water is. On a phone the two are the same width and nothing showed. On a desktop window the fish
     * swam on behind the letterbox -- past the very wall the player is about to be confined by -- and at SCREEN scale,
     * so the shark drifting behind the title was twice the size of the same shark once the run began.
     *
     * Handing it the lane fixes both at once, and every length in `menu.backdrop` is a fraction of it. What is left
     * outside the lane is the menu's own flat screen, because the menu is not part of the water.
     */
    this.backdrop.layout(viewport.laneWidthPx, viewport.height, viewport.left);
    const laneLeft = viewport.left;
    const laneWidth = viewport.laneWidthPx;
    const cx = laneLeft + laneWidth / 2;

    this.screen.clear();
    // Opaque, so the menu is its own screen rather than an overlay on a paused level. Drawn over the whole
    // canvas rather than just the lane: the menu is not part of the water.
    this.screen.rect(0, 0, viewport.width, viewport.height).fill({ color: 0x030a17, alpha: 1 });

    /**
     * The three buttons: one column, one width, each as tall as its own stone is.
     *
     * They SHARE A WIDTH because they are one column and three widths would read as three different things. They do
     * NOT share a height, which is the one place this differs from the drawn buttons it replaces: the art is three
     * different pictures with three different thicknesses, and forcing one height on them would squash whichever two
     * are not the middle one -- and a squashed stone reads as a mistake rather than as a button.
     *
     * So the box comes from the picture's own aspect, and the stack advances by whatever each one turned out to be.
     * `buttonsTopRatio` places the TOP of the stack rather than the first button's centre, so the three move together
     * when the owner retunes it.
     */
    const w = Math.min(laneWidth * cfg.buttonWidthRatio, cfg.buttonMaxWidth * s);
    const top = viewport.height * cfg.buttonsTopRatio;
    let buttonY = top;
    for (const button of this.buttons) {
      const h = w / Math.max(0.01, button.aspect);
      button.rect = { x: cx - w / 2, y: buttonY, w, h };
      button.sprite.x = cx;
      button.sprite.y = buttonY + h / 2;
      this.sizeButton(button);
      buttonY += h + cfg.buttonGap * s;
    }
    const buttonsBottom = buttonY - cfg.buttonGap * s;

    /**
     * The tagline, between the level grid and the buttons.
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
    /**
     * AN EMPTY LIST IS NO ROW AT ALL, and the arithmetic has to say so.
     *
     * The row reserves its own vertical band, and everything above it is placed upward from the tagline -- so a row
     * that exists structurally but has nothing in it does not disappear, it leaves the title and the subtitle floating
     * with a gap where the pills were. The game hands an empty list when the level ladder is off (`debug` decides),
     * which makes this the difference between "that feature is not here" and "that feature is broken".
     */
    const rowShown = this.levels.length > 0;
    const perRow = Math.max(1, Math.min(this.levels.length, Math.floor(1 / Math.max(0.05, cfg.levelMinWidthRatio))));
    const rows = rowShown ? Math.max(1, Math.ceil(this.levels.length / perRow)) : 0;
    const noteLineH = rowShown ? cfg.levelTextSize * s : 0;
    const noteY = this.tagline.y - (cfg.taglineSize * s) / 2 - cfg.levelRowGap * s * 2 - noteLineH;
    const gridHeight = rows * levelH + Math.max(0, rows - 1) * cfg.levelRowGap * s;
    let levelTop = rowShown
      ? noteY - cfg.levelRowGap * s - gridHeight
      : this.tagline.y - (cfg.taglineSize * s) / 2 - cfg.levelRowGap * s;

    /**
     * THE TITLE IS A PICTURE, and the chain that used to place it is one link shorter.
     *
     * It was a line of text with a line of English under it, and the two took turns moving each other: the subtitle
     * anchored to the level row, the title anchored 30*s above the subtitle, the subtitle dropping again if the title
     * had hit the ceiling, and then the level row dropping if the subtitle had. One picture instead of two lines
     * leaves one relation and one guard.
     *
     * The relation is the title's BOTTOM `levelRowTopGap` above the level row, and the guard is the ceiling: if that
     * would put the title's top above `36*s`, everything below moves down as one instead of the two overlapping.
     *
     * The height comes from the CONFIG's aspect rather than from the sprite, because the layout runs before the art
     * does -- a `Sprite` with no texture has no size, and dividing by it would be a division by zero.
     */
    this.titleWidth = laneWidth * cfg.titleWidthRatio;
    this.applyTitleSize();
    const ceiling = 36 * s;
    levelTop = Math.max(levelTop, ceiling + this.titleHeight + cfg.levelRowTopGap * s);
    this.title.x = cx;
    this.title.y = levelTop - cfg.levelRowTopGap * s;
    this.drawTitleGlow();
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


    this.hint.scale.set(s);
    this.hint.anchor.set(0.5, 0.5);
    this.hint.x = cx;
    this.hint.y = buttonsBottom + 30 * s;

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

  /**
   * Whether the backdrop is on its way out, so a second press on 开始游戏 does nothing.
   *
   * Reported rather than swallowed silently: a button that keeps accepting presses while the screen is already leaving
   * is a button that will start two runs the day the handover gets slower.
   */
  get exiting(): boolean {
    return this.backdrop.exiting;
  }

  /**
   * Refill the water after a RUN emptied it.
   *
   * ---------------------------------------------------------------------------------------------
   * NOT "ENTER THE MENU", WHICH IS WHY IT WAS RENAMED
   * ---------------------------------------------------------------------------------------------
   * It used to be called `enterMenu`, and that name is precisely what a page opened FROM the menu calls on its way
   * back -- which is how returning from the bestiary came to throw the water away and grow a fresh shoal instead of
   * finding the fish where they had swum to. The menu is shown and hidden by the PHASE; the one thing this does is
   * put back what a run takes with it.
   *
   * So there is exactly one caller, `exitToMenu`, and it should stay the only one. Pressing 开始 does not hide the
   * backdrop, it EMPTIES it -- every creature turns and swims off (`beginExit`), and a finished backdrop draws
   * nothing. A page opened from the menu does no such thing, so coming back from one needs nothing put back.
   */
  refillBackdrop(): void {
    this.backdrop.reset();
    this.exitReported = false;
  }

  /**
   * Advance the water without drawing the menu.
   *
   * The menu is HIDDEN while a page opened from it is up -- the codex covers the screen -- but its backdrop is not
   * PAUSED: the fish keep swimming the whole time, so closing the page finds the water where it got to rather than a
   * fresh shoal arriving. That is what makes a page feel like one you looked at and closed instead of one that
   * replaced the world, and it is the same reason `refillBackdrop` is not called on the way back.
   */
  updateBackdrop(dt: number): void {
    this.backdrop.update(dt);
  }

  /**
   * Send the backdrop away, and let `onStart` follow it.
   *
   * The turn is real -- every creature heads for the nearest edge -- and the wait is capped by the config, because
   * waiting for the LAST one would mean waiting for whichever arrived most recently. Whatever has not left when the
   * clock runs out stops being drawn, which the fade covers.
   */
  private beginExit(): void {
    if (this.backdrop.exiting) return;
    this.exitReported = false;
    this.backdrop.beginExit();
  }

  update(dt: number): void {
    this.updateBackdrop(dt);
    if (!this.exitReported && this.backdrop.finished) {
      this.exitReported = true;
      this.onStart();
    }
  }

  /**
   * Repaint the SHAPES.
   *
   * The buttons are not here any more, and that is the whole change: a stone button is a picture, and a picture is not
   * repainted -- it is swapped, in `showButtonState`. What is left is the level row, which has no art and so is still
   * drawn, and the pulse the primary button used to breathe is gone with it. A button carved out of stone does not
   * pulse; the art is what says it is a button now.
   */
  private draw(s: number): void {
    const cfg = mech.menu;

    this.levelRow.clear();
    for (const [i, rect] of this.levelRects.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      const r = cfg.levelRadius * s;
      /**
       * TWO states, and no lock icon: selected is filled, everything else is outlined.
       *
       * There used to be a third -- locked, drawn darker with a dim stroke -- and it went when the ladder became a
       * debug affordance that shows every level as reachable. `MenuLevel.locked` is still computed and still reported,
       * because the unlock RULE is still real and still written to the save; there is just nothing on this row that
       * could be locked, so a state for it would be a branch nothing can reach.
       */
      const fill = level.selected ? cfg.levelSelectedFill : cfg.levelIdleFill;
      const stroke = level.selected ? cfg.levelSelectedStroke : cfg.levelIdleStroke;
      this.levelRow
        .roundRect(rect.x, rect.y, rect.w, rect.h, r)
        .fill({ color: fill, alpha: 0.95 })
        .stroke({ color: stroke, alpha: level.selected ? 1 : 0.7, width: Math.max(1, 1.2 * s) });
    }

    for (const [i, label] of this.levelLabels.entries()) {
      const level = this.levels[i];
      if (!level) continue;
      const want = level.selected ? cfg.levelSelectedTextColour : cfg.levelIdleTextColour;
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
    const button = this.buttonAt(x, y);
    if (button) this.pressed = button.id;
    else {
      const hitLevel = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hitLevel >= 0 ? this.levels[hitLevel] : undefined;
      // A LOCKED pill does not even arm: not firing on release is the whole behaviour, and arming it would make the
      // press look accepted while nothing happened.
      if (level && !level.locked) this.pressed = `level:${level.id}`;
      else this.pressed = null;
    }
    this.showPointerState(x, y);
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
    if (this.pressed?.startsWith('level:')) {
      const hit = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hit >= 0 ? this.levels[hit] : undefined;
      if (!level || `level:${level.id}` !== this.pressed) this.pressed = null;
    }
    this.showPointerState(x, y);
    return true;
  }

  handlePointerUp(x: number, y: number): boolean {
    const fire = this.pressed;
    this.pressed = null;
    const button = this.buttons.find((candidate) => candidate.id === fire);
    // Fires only on a release OVER the button the press started on, which is the whole press-and-drag-out-to-cancel
    // behaviour -- and a drag that comes back is a press that was never taken back, so it still fires.
    if (button && this.inRect(button.rect, x, y)) {
      this.showPointerState(x, y);
      if (button.id === 'start') this.beginExit();
      else if (button.id === 'codex') this.onCodex();
      else this.onSettings();
      return true;
    }
    if (fire?.startsWith('level:')) {
      const hit = this.levelRects.findIndex((rect) => this.inRect(rect, x, y));
      const level = hit >= 0 ? this.levels[hit] : undefined;
      if (level && !level.locked) this.onPickLevel(level.id);
    }
    this.showPointerState(x, y);
    return true;
  }

  /** Which button contains the point, if any. */
  private buttonAt(x: number, y: number): MenuButton | undefined {
    return this.buttons.find((button) => this.inRect(button.rect, x, y));
  }

  /**
   * Put every button in the state the pointer and the press say it is in.
   *
   * Called with the POINT rather than a state, and it walks all three, because the three facts are related: a button
   * under the pointer is hovered, and a button under the pointer that is also the armed one is pressed -- so a single
   * pass cannot light two of them, and a press that slides from one to the next cannnot leave the first one lit.
   *
   * Pressed beats hovered, which is what makes pressing a button feel like pushing the stone in rather than like
   * hovering it harder.
   *
   * A press is a press on any pointer, so `Pressed` does not ask whether the pointer can hover -- a finger dragged from
   * one button onto another is still pushing the second one. Only `Hover` does, and that is the whole of
   * `pointerHovers`.
   */
  private showPointerState(x: number, y: number): void {
    for (const button of this.buttons) {
      const over = this.inRect(button.rect, x, y);
      const want: ButtonState =
        over && this.pressed === button.id ? 'Pressed' : over && this.pointerHovers ? 'Hover' : 'normal';
      if (button.state === want) continue;
      button.state = want;
      this.showButtonState(button);
    }
  }

  /**
   * Test hook: every control, so a probe presses the real ones.
   *
   * `levels` carries the label as well as the rectangle, so a test can assert that the menu is offering what the
   * game actually has -- a mismatch there is a level nobody can choose.
   *
   * The three buttons are named for what they DO while the probe-facing key for the first one is still `button`, which
   * is the name the driver's `menu` command clicks. Renaming it to `start` would be tidier and would silently break
   * the one caller that presses a real button in a real browser, which is not a trade worth making for symmetry.
   *
   * `state` comes along, because for a picture button the state IS the observable: nothing else on this row changes
   * when the pointer arrives.
   */
  get geometry(): {
    button: { x: number; y: number; w: number; h: number };
    codex: { x: number; y: number; w: number; h: number };
    settings: { x: number; y: number; w: number; h: number };
    states: Record<ButtonId, ButtonState>;
    levels: { id: string; label: string; locked: boolean; selected: boolean; rect: { x: number; y: number; w: number; h: number } }[];
    levelNote: string;
    tagline: string;
    hint: string;
  } {
    const [startButton, codexButton, settingsButton] = this.buttons;
    const rectOf = (button: MenuButton | undefined) => ({ ...(button?.rect ?? { x: 0, y: 0, w: 0, h: 0 }) });
    return {
      button: rectOf(startButton),
      codex: rectOf(codexButton),
      settings: rectOf(settingsButton),
      states: Object.fromEntries(this.buttons.map((button) => [button.id, button.state])) as Record<ButtonId, ButtonState>,
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
 * A button picture's width over its height, from the atlas manifest.
 *
 * The frame size is known before anything is decoded, which is what lets the layout place a button on a screen whose
 * art has not arrived yet. It falls back to `1` -- square -- rather than to zero, because a zero height is a division
 * by zero in the layout and a `NaN` rectangle matches no pointer at all.
 *
 * The frame is looked up by the button's `normal` stem, and that is safe because the three states of a button are the
 * same size by construction: they are cut from one shared box. See `MenuButton.aspect`.
 */
function pictureAspect(picture: string): number {
  const size = assetSizeNow(picture);
  return size && size.height > 0 ? size.width / size.height : 1;
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





