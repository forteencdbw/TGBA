import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { Texture } from 'pixi.js';
import { assetSizeNow, loadAssetTexture } from './assets';
import { mech } from './mechanisms';
import { designScale } from './viewport';
import type { Viewport } from './viewport';
import { buildLabel } from './version';
import { MenuBackdrop } from './menuBackdrop';
import { UiBubbles } from './menuDrift';
import { Caustics } from './caustics';

/**
 * Where the bubbles come out of each picture, as a fraction of its box.
 *
 * NOT IN THE CONFIG, and the same argument as `MenuButton.aspect`: this is a fact about a drawing, measured off the
 * drawing, and it belongs beside it. A block of six x/y pairs in JSON5 would be a place that knows about pictures
 * without being able to show them, and the numbers mean nothing without the picture in front of you.
 *
 * Each one sits on stone or on the coral growing out of it -- the left foot of the arch, the coral under 泡, the right
 * foot; and on each stone, its icon. They are all in front of the lettering, so a bubble never rises through a
 * character.
 */
const TITLE_SPOUTS = [
  { x: 0.10, y: 0.76 },
  { x: 0.33, y: 0.52 },
  { x: 0.90, y: 0.70 },
] as const;

/**
 * The three stone buttons, in the order they are stacked.
 *
 * The ID is what the pointer handlers compare and what `geometry` reports; `picture` is the asset stem, and the three
 * states are that stem with a suffix. So this table is also the list of what has to exist in `src/assets/` -- and the
 * ORDER of it is the order on the screen, which is why it lives here rather than in the config: it is not a number the
 * owner tunes, it is which button is above which.
 *
 * `spout` is where its bubbles come out, as a fraction of its own box -- see `TITLE_SPOUTS`. All three are at roughly
 * the same place, which is what makes the column of bubbles read as one edge of the menu leaking rather than as three
 * unrelated puffs.
 */
const BUTTONS = [
  { id: 'start', picture: '按钮-开始游戏', spout: { x: 0.09, y: 0.58 } },
  { id: 'codex', picture: '按钮-图鉴', spout: { x: 0.15, y: 0.52 } },
  { id: 'settings', picture: '按钮-设置', spout: { x: 0.14, y: 0.55 } },
] as const;

type ButtonId = (typeof BUTTONS)[number]['id'];

/**
 * A button's three states, and the suffix its picture carries for each.
 *
 * `normal` has no suffix because it IS the stem -- `按钮-开始游戏.png` -- and the other two are that stem with
 * `-Hover` / `-Pressed` appended. Note the capital: the file names came from the art, and this is the one place that
 * spelling has to be right.
 *
 * THERE IS NO `Pressed` PICTURE, and the state is still `Pressed`. The three that existed drew a "thinner and darker"
 * stone, which at this size read as squashed rather than pressed, so they were dropped and the press is a displacement
 * instead -- see `showButtonState`. The state itself stays, because it is what the pointer handlers decide and what a
 * probe reads.
 */
const BUTTON_STATES = ['normal', 'Hover'] as const;

type ButtonState = (typeof BUTTON_STATES)[number];

/** The state a button is in, which is one of its pictures plus whether it is being pushed. */
type ButtonLook = ButtonState | 'Pressed';

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
   * It is the one thing that still differs between the three: they share a HEIGHT and each is as wide as its own
   * picture is, because the three stones were drawn with three different plate ratios and the lettering is painted on
   * the plate -- a shared width would be a shared nothing, and the text would come out three sizes.
   *
   * From the ART rather than off the sprite, for the same reason as `titleHeight`: the first layout runs before the
   * pictures do, and a `Sprite` with no texture reports no size, so sizing the box off the sprite would divide by zero
   * and leave a `NaN` rectangle, which never matches a pointer. The frame size is known from the atlas manifest before
   * anything is decoded.
   */
  aspect: number;
  /** Where its bubbles come out, as a fraction of its box. See `BUTTONS`. */
  spout: { x: number; y: number };
  state: ButtonLook;
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
    spout: { ...button.spout },
    state: 'normal' as ButtonLook,
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
   * Which button the current press landed on, or null.
   *
   * One field rather than a boolean per button, so a drag that leaves one button and lands on the other cannot end
   * up firing both -- which two independent flags would allow.
   */
  private pressed: ButtonId | null = null;
  /**
   * The design scale from the last layout.
   *
   * Needed by `showButtonState` for one thing only: the press drop is a design-pixel number and the offset happens
   * from a pointer handler, which has no viewport in hand. It was removed when the menu stopped drawing anything and
   * came back with the press.
   */
  private scale = 1;
  /**
   * The animated backdrop: creatures swimming, and a coral bed in two layers.
   *
   * The menu owns it rather than the game, and that is deliberate -- it is a decoration of THIS screen, it exists only
   * while this screen does, and nothing it does can reach the water a run will start in. What it is not is a second
   * way of drawing a creature: see `src/menuBackdrop.ts`.
   */
  private readonly backdrop = new MenuBackdrop();
  /**
   * The bubbles coming off the title and the three stones.
   *
   * The menu's OWN, and not the backdrop's, because they belong to the pictures above it: they are placed from the
   * layout's rectangles, they are drawn over the buttons, and they rise up the screen rather than up the lane. See
   * `UiBubbles`, which is a different class from the water's field for exactly those reasons.
   */
  private readonly uiBubbles = new UiBubbles();
  /**
   * The light on the title: a filter ON the title rather than a layer over it, because Pixi will not `add` a masked
   * layer. See `Caustics`, which records the measurements that settled it.
   */
  private readonly caustics = new Caustics();
  /** Whether `onBackdropExit` has already been fired for the exit now running. */
  private exitReported = false;

  constructor() {
    this.root.eventMode = 'none';
    this.screen.eventMode = 'none';

    this.title.eventMode = 'none';
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
    this.caustics.attach(this.title);

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
     *
     * The title has no shadow behind it any more: the picture is an arch with its own stone base, coral and moss drawn
     * into it, so the contrast that the old flat glyphs needed is part of the art now.
     *
     * The bubbles come LAST, over the stones they come out of -- a vent drawn behind an opaque plaque would spend its
     * first half-second invisible.
     *
     * The caustics are not in this list: they are a filter on the title, so they are drawn wherever the title is --
     * and under the bubbles for free, which is right: a bubble in front of the stone is in front of the light on it.
     */
    this.root.addChild(
      // The opaque screen first, then the water's contents, then the interface. The backdrop's own root is a
      // container of three layers (coral, swimmers, coral), so it IS the water as far as the menu is concerned.
      this.screen,
      this.backdrop.root,
      this.title,
      ...this.buttons.map((button) => button.sprite),
      this.uiBubbles.root,
      this.versionLine,
    );
  }

  /**
   * Put the current state's picture on the sprite, and put the sprite where that state belongs.
   *
   * THE PRESS IS A DISPLACEMENT, not a picture. The art's own pressed state was "a thinner, darker stone", which at
   * this size read as squashed -- a stone does not get thinner, it goes down. So `Pressed` selects the HOVER picture
   * (a press is a lit stone being pushed) and offsets the whole sprite by `buttonPressDrop`.
   *
   * The whole sprite moves, its own baked-in bottom shadow with it, so it reads as the stone sliding down rather than
   * being pushed into the ground. That is the honest description of what this does; faking the other reading would take
   * a scale change as well, and that is a knob nobody has asked for.
   *
   * The texture load is guarded rather than assumed, because the pictures land independently: a hover arriving between
   * the `normal` load and the `Hover` one would otherwise put an empty texture on a visible button. The offset is NOT
   * guarded -- it has nothing to do with whether the art has arrived.
   */
  private showButtonState(button: MenuButton): void {
    const texture = button.textures[button.state === 'Pressed' ? 'Hover' : button.state];
    if (texture) {
      button.sprite.texture = texture;
      this.sizeButton(button);
    }
    const drop = button.state === 'Pressed' ? mech.menu.buttonPressDrop * this.scale : 0;
    button.sprite.y = button.rect.y + button.rect.h / 2 + drop;
  }

  /**
   * Give the picture the width the last layout asked for.
   *
   * Called from BOTH ends -- the layout, and each load -- because either can come second, exactly as with the title.
   * A button's two states are the same size (they come from the same stated crop), so a swap does not need a resize;
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

    this.scale = s;

    /**
     * THE THREE BUTTONS: one column, one HEIGHT, each as wide as its own stone is.
     *
     * They share a height and not a width, and the reason is the lettering: the three pictures are three independent
     * drawings with three different plate ratios, and the text is painted ON the plate. Give them a shared width and
     * the plates come out three heights -- 3.67 : 3.49 : 3.06 means the tallest is 20% taller than the shortest -- and
     * so does the text. Which is exactly what the owner saw, as "设置's text is bigger than 开始游戏's".
     *
     * So the height is the config's, the width is the picture's, and each is CENTRED: the three widths differ by up to
     * 17%, and a column of centred stones reads as three carved plaques where a column sharing a left edge would read
     * as a broken layout.
     */
    const buttonH = cfg.buttonHeight * s;

    /**
     * THE GROUP IS THE UNIT: the title sitting on the buttons, centred by its own middle.
     *
     * Rung by rung: the group's centre comes from `groupCentreRatio`, the group's top is half its height above that,
     * the buttons start one title-plus-gap below it, and everything above the title is water. There used to be a chain
     * here -- title, a line of text, and a level grid, each measured off the next -- and deleting those two and the row
     * deleted the chain with them. One relation is left, and one guard.
     *
     * The anchor is the group's CENTRE rather than the buttons' top edge because the height is a dial: a number pinned
     * to the top edge stops meaning "centred" the moment the stack changes height, and "centred" is the thing being
     * asked for. The dial still moves the whole group up and down, which is what it is for.
     *
     * The guard is the ceiling, and it pushes the whole group DOWN: the title is anchored to the buttons, so the only
     * way it can leave the screen is for the group to be too high. That is the right way round, because the buttons are
     * what the player has to be able to press and the title only has to be readable.
     *
     * The title's height comes from the CONFIG's aspect rather than from the sprite, because the layout runs before
     * the art does -- a `Sprite` with no texture has no size, and dividing by it would be a division by zero. That is
     * also why `titleWidth` is set before the group is measured: it is one stack, and it is measured as one.
     */
    this.titleWidth = laneWidth * cfg.titleWidthRatio;
    this.applyTitleSize();
    const rowStep = buttonH + cfg.buttonGap * s;
    const buttonsH = this.buttons.length * buttonH + Math.max(0, this.buttons.length - 1) * cfg.buttonGap * s;
    const groupH = this.titleHeight + cfg.titleButtonGap * s + buttonsH;
    const ceiling = 36 * s;
    const groupTop = Math.max(viewport.height * cfg.groupCentreRatio - groupH / 2, ceiling);

    let buttonY = groupTop + this.titleHeight + cfg.titleButtonGap * s;
    for (const button of this.buttons) {
      const bw = buttonH * Math.max(0.01, button.aspect);
      button.rect = { x: cx - bw / 2, y: buttonY, w: bw, h: buttonH };
      button.sprite.x = cx;
      // Through `showButtonState` rather than by setting `y` here, so the place that knows about the press offset is
      // the only place that sets a sprite's position.
      this.showButtonState(button);
      buttonY += rowStep;
    }

    this.title.x = cx;
    this.title.y = groupTop + this.titleHeight;

    /**
     * The bubble spouts, from the boxes that were just placed.
     *
     * Derived rather than stored, so they follow a resize -- and FOLLOWING is the whole reason they are fractions of a
     * picture instead of screen coordinates: the title's box is `titleHeight` tall and anchored by its BOTTOM, so a
     * point on its right foot is a different `y` on every screen.
     */
    const titleBox = { x: cx - this.titleWidth / 2, y: groupTop, w: this.titleWidth, h: this.titleHeight };
    const spouts = [
      ...TITLE_SPOUTS.map((p) => ({ x: titleBox.x + p.x * titleBox.w, y: titleBox.y + p.y * titleBox.h })),
      ...this.buttons.map((button) => ({
        x: button.rect.x + button.spout.x * button.rect.w,
        y: button.rect.y + button.spout.y * button.rect.h,
      })),
    ];
    this.uiBubbles.setSpouts(spouts);
    this.uiBubbles.setScreen(viewport.width, viewport.height);
    // The light needs the title's SIZE and the scale -- not its position: the shader measures from the corner of the
    // area it filters, which is the title.
    this.caustics.layout({ w: this.titleWidth, h: this.titleHeight }, s);

    this.versionLine.scale.set(s);
    this.versionLine.anchor.set(0.5, 1);
    this.versionLine.text = buildLabel();
    this.versionLine.x = cx;
    // Pinned to the bottom edge rather than to the buttons: it is reference, not part of the stack, and a long build
    // label must not be able to push anything around.
    this.versionLine.y = viewport.height - 14 * s;
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
    this.caustics.update(dt);
    this.uiBubbles.update(dt);
    this.uiBubbles.draw();
    if (!this.exitReported && this.backdrop.finished) {
      this.exitReported = true;
      this.onStart();
    }
  }

  private inRect(rect: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  handlePointerDown(x: number, y: number): boolean {
    this.pressed = this.buttonAt(x, y)?.id ?? null;
    this.showPointerState(x, y);
    return true;
  }

  handlePointerMove(x: number, y: number): boolean {
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
      const want: ButtonLook =
        over && this.pressed === button.id ? 'Pressed' : over && this.pointerHovers ? 'Hover' : 'normal';
      if (button.state === want) continue;
      button.state = want;
      this.showButtonState(button);
    }
  }

  /**
   * Test hook: every control, so a probe presses the real ones.
   *
   * The three buttons are named for what they DO while the probe-facing key for the first one is still `button`, which
   * is the name the driver's `menu` command clicks. Renaming it to `start` would be tidier and would silently break
   * the one caller that presses a real button in a real browser, which is not a trade worth making for symmetry.
   *
   * `state` comes along, because for a picture button the state IS the observable: nothing else on this row changes
   * when the pointer arrives.
   *
   * The LEVEL ROW is no longer here: it moved into the settings panel, so `settingsRef.geometry.levels` is where a test
   * looks for it now.
   */
  get geometry(): {
    button: { x: number; y: number; w: number; h: number };
    codex: { x: number; y: number; w: number; h: number };
    settings: { x: number; y: number; w: number; h: number };
    states: Record<ButtonId, ButtonState>;
  } {
    const [startButton, codexButton, settingsButton] = this.buttons;
    const rectOf = (button: MenuButton | undefined) => ({ ...(button?.rect ?? { x: 0, y: 0, w: 0, h: 0 }) });
    return {
      button: rectOf(startButton),
      codex: rectOf(codexButton),
      settings: rectOf(settingsButton),
      states: Object.fromEntries(this.buttons.map((button) => [button.id, button.state])) as Record<ButtonId, ButtonState>,
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





