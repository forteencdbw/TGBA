import { Filter, GlProgram, UniformGroup } from 'pixi.js';
import type { Sprite, Texture } from 'pixi.js';
import { loadAssetTexture } from './assets';
import { mech } from './mechanisms';

/**
 * The one drawing of a cell net this is built from.
 *
 * `src/assets/焦散.png`, imported at the density that makes its cells about 28 screen pixels across -- see the config's
 * `tileWidth`, which is the dial that moves it. It is a QUARTER of the picture the owner drew (the middle 640x360 of a
 * 1280x720), because the shader mirrors it: four copies of a quarter cover what the whole thing would.
 */
const PICTURE = '焦散';

/**
 * The vertex stage: Pixi's own filter vertex shader, plus ONE extra output.
 *
 * `vLocal` is where a fragment is inside the filtered area, in the same units the layout uses -- `aPosition` runs 0..1
 * across the area and `uOutputFrame.zw` is that area's size. Measuring from the title's own corner rather than from
 * the screen is what makes the net belong to the stone: it moves with the title on a resize, and nothing about where
 * the title is on the screen leaks into the pattern.
 */
const VERTEX = `in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vLocal;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
    vLocal = aPosition * uOutputFrame.zw;
}
`;

/**
 * The fragment stage: the title, plus two drifting, DEFORMED copies of the net's veins, ADDED.
 *
 * THE MIRROR is `1 - |mod(t, 2) - 1|`, a triangle wave: it runs 0 to 1 across one tile and 1 back to 0 across the
 * next, which is the checkerboard of mirrored tiles done per pixel. The picture does not tile on its own (its edges
 * disagree by twenty times what neighbouring columns do), and a mirrored copy always meets its own edge. A fold is
 * continuous, so deforming the coordinate before it cannot open a seam.
 *
 * THE ATLAS is why the fetch goes through `uFramePx`: the net is one frame on a page shared with two hundred other
 * pictures, so a tile coordinate in 0..1 has to be mapped into that frame's rectangle -- and every texel read is clamped
 * to the frame, or a sample at the edge would read the transparent gutter next door.
 *
 * NO `texelFetch`: Pixi compiles this as GLSL ES 1.00 (it adds `#define`s that map `in` and `texture` onto the old names and
 * never writes a `#version`), and `texelFetch` does not exist there -- the first version of this failed to compile and drew no
 * title at all. A `texture()` read at a texel's CENTRE of a `nearest`-filtered page returns exactly that texel, which is the
 * same fetch.
 *
 * THE DEFORMATION works in units of one tile WIDTH (the y axis is scaled by the tile's aspect first), so a stretch at 20
 * degrees is 20 degrees on the glass and a warp pushes as far sideways as it does up. The pivot is the middle of the stone.
 *
 * THE MASK is the title's own alpha, multiplied in: the light only exists where the stone does. And the result is
 * capped at that alpha, because the colours are premultiplied -- a colour brighter than its own coverage would come
 * out as a glow on the anti-aliased rim rather than as light on the stone.
 */
const FRAGMENT = `in vec2 vTextureCoord;
in vec2 vLocal;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uCaustics;
uniform vec4 uFramePx;
uniform vec2 uPageInv;
uniform vec2 uTileSize;
uniform vec2 uOffsetA;
uniform vec2 uOffsetB;
uniform float uAlphaA;
uniform float uAlphaB;
uniform vec3 uLightColor;
uniform vec4 uShape;
uniform vec2 uPivot;
uniform vec2 uAxisA;
uniform vec2 uAxisB;
uniform vec4 uWarpA;
uniform vec4 uWarpB;
uniform vec2 uBreathe;

float texel(vec2 at)
{
    return texture(uCaustics, (uFramePx.xy + at + 0.5) * uPageInv).a;
}

float veinAt(vec2 tile)
{
    vec2 local = 1.0 - abs(mod(tile, 2.0) - 1.0);
    vec2 size = uFramePx.zw;
    vec2 px = local * size - 0.5;
    vec2 i0 = floor(px);
    vec2 f = px - i0;
    vec2 hi = size - 1.0;
    vec2 a = clamp(i0, vec2(0.0), hi);
    vec2 b = clamp(i0 + 1.0, vec2(0.0), hi);
    float top = mix(texel(vec2(a.x, a.y)), texel(vec2(b.x, a.y)), f.x);
    float bottom = mix(texel(vec2(a.x, b.y)), texel(vec2(b.x, b.y)), f.x);
    return mix(top, bottom, f.y);
}

vec2 deform(vec2 tile, vec2 axis, float breathe, vec4 ph)
{
    float aspect = uShape.w;
    vec2 s = (tile - uPivot) * vec2(1.0, aspect);

    float a = uShape.z * sin(breathe);
    vec2 n = vec2(-axis.y, axis.x);
    s = axis * (dot(s, axis) / (1.0 + a)) + n * (dot(s, n) * (1.0 + a));

    float k = uShape.y;
    vec2 w = vec2(
        sin(s.y * k + ph.x) + 0.6 * sin(s.x * k * 1.7 + s.y * k * 0.8 + ph.y),
        sin(s.x * k * 0.9 + ph.z) + 0.6 * sin(s.y * k * 1.6 - s.x * k * 0.7 + ph.w));
    s += w * uShape.x;

    return s / vec2(1.0, aspect) + uPivot;
}

void main(void)
{
    vec4 color = texture(uTexture, vTextureCoord);
    vec2 tile = vLocal / uTileSize;
    float veinA = veinAt(deform(tile, uAxisA, uBreathe.x, uWarpA) + uOffsetA);
    float veinB = veinAt(deform(tile, uAxisB, uBreathe.y, uWarpB) + uOffsetB);
    vec3 light = uLightColor * (veinA * uAlphaA + veinB * uAlphaB);
    finalColor = vec4(min(color.rgb + light * color.a, vec3(color.a)), color.a);
}
`;

/**
 * The caustics on the menu's title: the light a rippling surface throws onto what is under it.
 *
 * ---------------------------------------------------------------------------------------------
 * A FILTER ON THE TITLE, NOT A LAYER OVER IT -- AND WHY
 * ---------------------------------------------------------------------------------------------
 * The first version was the obvious one: a grid of mirrored sprites blended with `add`, clipped to the title by a
 * stencil mask made of the title's own picture. The mask worked -- its alpha was honoured, measured before any of
 * this was built. The blend did NOT: Pixi composites a masked subtree as normal alpha, and `add` on the sprites, on
 * their container, on an unmasked parent above the mask, and on a cached texture of the lot all came out identical
 * to `normal`. Measured, each of them: with the mask removed, `add` lifted the stone by +8/+11/+11 and darkened no
 * pixel at all; with it, every variant darkened about a fifth of the title, which is the net's dark veins being laid
 * on as paint. That is grime on the stone rather than light on it.
 *
 * A filter does the add inside the title's own pixels, where there is nothing to mask: it reads the title, reads the
 * net, adds them and multiplies by the title's alpha. The two drifting layers become two samples of one texture, the
 * mirror tiling becomes one line of arithmetic, and there is no grid of sprites to rebuild on a resize.
 *
 * ---------------------------------------------------------------------------------------------
 * TWO LAYERS
 * ---------------------------------------------------------------------------------------------
 * One copy of the net sliding is legible AS one copy sliding: the cells keep their shape as they move, and what a
 * caustic does is change shape. Two copies drifting different ways and adding together do change shape, because
 * where their bright nodes cross they brighten each other and then part.
 *
 * ---------------------------------------------------------------------------------------------
 * THE NET ITSELF CHANGES SHAPE
 * ---------------------------------------------------------------------------------------------
 * Two translating copies of a fixed picture still read as a picture sliding: every cell keeps its outline for as long as it
 * is in view. What light under a rippling surface does is stretch, squeeze, split and rejoin, so each layer is DEFORMED
 * before it is sampled, by two things that run on their own clocks:
 *
 *   - a BREATHING STRETCH: the layer is pulled out along one axis and pushed back, by `breatheAmount` either way, with the
 *     across direction going the other way so the cells keep their area -- a cell is lengthened, not enlarged;
 *   - a FLOW WARP: two octaves of slow sines displace the sample point by up to `warpAmount` of a tile, so the edges of
 *     the cells wander and neighbours merge and part.
 *
 * Both are applied to where the fragment IS (a screen-fixed position on the title) before the layer's drift is added, so the
 * stretch is about a fixed pivot at the middle of the stone and the drift still slides whatever shape the net has become.
 * The two layers use different axes and different speeds, so they do not deform in step.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS ADDED, AND WHY THE SAMPLER IS HAND-WRITTEN
 * ---------------------------------------------------------------------------------------------
 * The picture's cells are transparent and its VEINS are opaque (a dark teal, 0.2-0.5 bright), so the light is the picture's alpha:
 * veins as lines, tinted `lightColor`. The old version added the veins' own colour, which is why the light was dim and teal.
 *
 * The sample is read as four single texels and filtered bilinearly in the shader, because the atlas page is sampled `nearest` (the
 * game's creatures want it) and a warped sample point over a nearest-filtered 1-texel line flickers between 1 and 2 pixels
 * wide as it moves. Reading the four texels by hand also keeps the reads inside the net's own rectangle on the shared page.
 */
export class Caustics {
  /** Built when the net arrives -- a filter with nothing to sample would draw the title with no light at all. */
  private filter: Filter | null = null;
  private readonly uniforms = new UniformGroup({
    uFramePx: { value: new Float32Array(4), type: 'vec4<f32>' },
    uPageInv: { value: new Float32Array(2), type: 'vec2<f32>' },
    uTileSize: { value: new Float32Array([1, 1]), type: 'vec2<f32>' },
    uOffsetA: { value: new Float32Array(2), type: 'vec2<f32>' },
    uOffsetB: { value: new Float32Array(2), type: 'vec2<f32>' },
    uAlphaA: { value: 0, type: 'f32' },
    uAlphaB: { value: 0, type: 'f32' },
    uLightColor: { value: new Float32Array(3), type: 'vec3<f32>' },
    // The deformation. `uShape` is (warp amount, warp wave number, breathe amount, tile height over width).
    uShape: { value: new Float32Array(4), type: 'vec4<f32>' },
    uPivot: { value: new Float32Array(2), type: 'vec2<f32>' },
    uAxisA: { value: new Float32Array([1, 0]), type: 'vec2<f32>' },
    uAxisB: { value: new Float32Array([1, 0]), type: 'vec2<f32>' },
    uWarpA: { value: new Float32Array(4), type: 'vec4<f32>' },
    uWarpB: { value: new Float32Array(4), type: 'vec4<f32>' },
    uBreathe: { value: new Float32Array(2), type: 'vec2<f32>' },
  });
  private target: Sprite | null = null;
  private box = { w: 0, h: 0 };
  /** The design scale from the last layout: `tileWidth` is in design pixels. */
  private scale = 1;
  /**
   * The tile's height over its width, read off the picture when it arrives -- so a tile drawn `tileWidth` wide keeps
   * the net's shape. The starting value is the imported frame's (149x84) so a layout before the picture is not wrong.
   */
  private tileAspect = 84 / 149;
  private tile = { w: 1, h: 1 };
  /** Each layer's offset, in TILES. Wrapped at two, which is one whole mirrored pair -- see `update`. */
  private readonly offsetA = { x: Math.random() * 2, y: Math.random() * 2 };
  private readonly offsetB = { x: Math.random() * 2, y: Math.random() * 2 };
  /**
   * The deformation's clocks, in radians, each wrapped at 2 pi. Four warp phases per layer run at unrelated rates (the
   * multipliers below) so the displacement never repeats visibly, and one breathing phase per layer. They are phases and not a
   * running time because a time that has counted for an hour has no bits left for the fraction.
   */
  private readonly warpA = [Math.random() * TAU, Math.random() * TAU, Math.random() * TAU, Math.random() * TAU];
  private readonly warpB = [Math.random() * TAU, Math.random() * TAU, Math.random() * TAU, Math.random() * TAU];
  private breatheA = Math.random() * TAU;
  private breatheB = Math.random() * TAU;

  constructor() {
    void loadAssetTexture(PICTURE).then((texture) => {
      if (texture) this.build(texture);
    });
  }

  /** Put the light on this picture. The menu calls it once, with the title. */
  attach(title: Sprite): void {
    this.target = title;
    if (this.filter) title.filters = [this.filter];
  }

  private build(texture: Texture): void {
    const source = texture.source;
    const frame = texture.frame;
    const u = this.uniforms.uniforms;
    // The net's rectangle on its atlas page, in TEXELS of the page: the shader fetches by texel, not by fraction.
    const k = source.pixelWidth / source.width;
    u.uFramePx.set([frame.x * k, frame.y * k, frame.width * k, frame.height * k]);
    u.uPageInv.set([1 / source.pixelWidth, 1 / source.pixelHeight]);
    this.tileAspect = frame.height / frame.width;
    this.filter = new Filter({
      glProgram: GlProgram.from({ vertex: VERTEX, fragment: FRAGMENT, name: 'title-caustics' }),
      resources: { causticsUniforms: this.uniforms, uCaustics: source },
      /**
       * `inherit`, and the default is a trap: a Filter's resolution is 1 unless told otherwise, whatever the renderer's
       * is. On a phone the renderer runs at 2, so the title was drawn into a 1x texture and stretched back up -- every
       * pixel edge on the stone went soft, and the A/B on a 2x screen showed a fifth of the title DARKENED by a filter
       * that only adds, which is what blur does to a hard edge. On a 1x desktop the two are the same, which is how it
       * hid.
       */
      resolution: 'inherit',
    });
    this.resize();
    if (this.target) this.target.filters = [this.filter];
  }

  /**
   * The title's size, and the design scale -- which is all the light needs to know.
   *
   * Not its position: the shader measures from the corner of the area it is filtering, which IS the title, so the
   * pattern is attached to the stone wherever the stone is.
   */
  layout(box: { w: number; h: number }, scale: number): void {
    this.box = { w: box.w, h: box.h };
    this.scale = scale;
    this.resize();
  }

  private resize(): void {
    const cfg = mech.menu.caustics;
    this.tile = { w: cfg.tileWidth * this.scale, h: cfg.tileWidth * this.scale * this.tileAspect };
    const u = this.uniforms.uniforms;
    u.uTileSize.set([this.tile.w, this.tile.h]);
    // The stretch is about the middle of the stone, in tile coordinates.
    u.uPivot.set([this.box.w / 2 / Math.max(1, this.tile.w), this.box.h / 2 / Math.max(1, this.tile.h)]);
  }

  update(dt: number): void {
    const cfg = mech.menu.caustics;
    /**
     * The drift is a fraction of the TITLE per second, turned into tiles here -- so a bigger screen moves the net the
     * same distance across the stone in the same time, rather than the same number of pixels.
     *
     * WRAPPED AT TWO TILES, not one: the mirror's period is two tiles (one forwards, one reflected), so two is the
     * shift that lands the pattern exactly on itself. Wrapping at one would flip it over every tile, which is a jump.
     * The wrap is there for precision rather than for correctness -- `mod` in the shader would cope with any offset,
     * but a float that has been counting up for an hour has fewer bits left for the fraction.
     */
    const w = Math.max(1, this.tile.w);
    const h = Math.max(1, this.tile.h);
    this.offsetA.x = wrap(this.offsetA.x + (cfg.driftX * this.box.w * dt) / w, 2);
    this.offsetA.y = wrap(this.offsetA.y + (cfg.driftY * this.box.h * dt) / h, 2);
    this.offsetB.x = wrap(this.offsetB.x + (cfg.crossDriftX * this.box.w * dt) / w, 2);
    this.offsetB.y = wrap(this.offsetB.y + (cfg.crossDriftY * this.box.h * dt) / h, 2);
    const u = this.uniforms.uniforms;
    u.uOffsetA.set([this.offsetA.x, this.offsetA.y]);
    u.uOffsetB.set([this.offsetB.x, this.offsetB.y]);
    u.uAlphaA = cfg.alpha;
    u.uAlphaB = cfg.alpha * cfg.crossAlpha;

    /**
     * The deformation's clocks. The second layer runs at `crossSpeedRatio` of the first's rate, which is what keeps the two
     * from stretching and relaxing together; each warp component has its own rate on top, for the reason on the fields.
     */
    const warpRate = TAU / Math.max(0.1, cfg.warpSeconds);
    const breatheRate = TAU / Math.max(0.1, cfg.breatheSeconds);
    for (let i = 0; i < 4; i++) {
      this.warpA[i] = (this.warpA[i]! + warpRate * WARP_RATES[i]! * dt) % TAU;
      this.warpB[i] = (this.warpB[i]! + warpRate * WARP_RATES[(i + 2) % 4]! * cfg.crossSpeedRatio * dt) % TAU;
    }
    this.breatheA = (this.breatheA + breatheRate * dt) % TAU;
    this.breatheB = (this.breatheB + breatheRate * cfg.crossSpeedRatio * dt) % TAU;
    u.uWarpA.set(this.warpA);
    u.uWarpB.set(this.warpB);
    u.uBreathe.set([this.breatheA, this.breatheB]);
    // Wavelength is a fraction of a tile; the shader wants radians per tile width.
    u.uShape.set([cfg.warpAmount, TAU / Math.max(0.01, cfg.warpWavelength), cfg.breatheAmount, this.tileAspect]);
    const axisA = (cfg.axisDegrees * Math.PI) / 180;
    const axisB = (cfg.crossAxisDegrees * Math.PI) / 180;
    u.uAxisA.set([Math.cos(axisA), Math.sin(axisA)]);
    u.uAxisB.set([Math.cos(axisB), Math.sin(axisB)]);
    const c = cfg.lightColor;
    u.uLightColor.set([((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255]);
  }

  /** Test hook: whether the light is on the title yet -- it is not until the net has arrived. */
  get attached(): boolean {
    return !!this.filter && !!this.target?.filters?.includes(this.filter);
  }

  /** Test hook: the drawn size of one tile, which is the cell size the owner sees. */
  get tileSize(): { w: number; h: number } {
    return { ...this.tile };
  }

  /** Test hook: where each layer is, in tiles, so a probe can watch them move. */
  get layerOffsets(): { x: number; y: number }[] {
    return [{ ...this.offsetA }, { ...this.offsetB }];
  }

  /** Test hook: the deformation's clocks, so a probe can watch the shape change. */
  get deformPhases(): { breathe: number[]; warp: number[][] } {
    return { breathe: [this.breatheA, this.breatheB], warp: [[...this.warpA], [...this.warpB]] };
  }
}

const TAU = Math.PI * 2;

/** How fast each of a layer's four warp phases runs, relative to `warpSeconds`: unrelated, so the displacement does not repeat. */
const WARP_RATES = [1, 0.73, 1.19, 0.61];

/** A positive modulo: `%` keeps the sign of the left side, which would send a layer the wrong way after a wrap. */
function wrap(value: number, span: number): number {
  return ((value % span) + span) % span;
}
