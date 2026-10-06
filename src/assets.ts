/**
 * Level and player art, resolved by the NAME THE OWNER USES.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY AN IMPORT RATHER THAN A PATH IN `public/`
 * ---------------------------------------------------------------------------------------------
 * These pictures are meant to be replaced BY HAND, so they are named in Chinese after what they are -- and a file in
 * `public/` is served by its own path, which means the URL carries those characters. That failed in a way worth
 * recording: the request came back 200 and the browser refused the bytes with "the source image could not be decoded",
 * which points hard at "the file is corrupt" when the file was fine and the PATH was the problem.
 *
 * Importing through Vite fixes it at the root: the file is read at build time and emitted with an ASCII hashed name and
 * the right content type, while the config keeps the name the owner knows. The extension is OPTIONAL too, so replacing a
 * `.jpg` with a `.png` of the same name needs no config change.
 */
import { Assets, Texture } from 'pixi.js';

/**
 * One animation as `config/mechanics.json5` writes it, and the shape a creature's art points at.
 *
 * `framesPerSecond` and `maxSeconds` are both limits and the SHORTER one wins: the frame rate says how the animation should
 * read, the ceiling says how long a state may hold the screen whatever the config says. A four-frame sheet at 4 fps is a
 * second; the same sheet at 0.5 fps is a creature frozen between poses, which is why the ceiling exists rather than trust.
 */
export interface AssetAnimation {
  /** One name per frame: a `{n}` pattern expanded to `1..count`, or the list of names. */
  frames: string | string[];
  /** How many frames a pattern expands to. */
  count?: number;
  framesPerSecond: number;
  maxSeconds: number;
  /** Play once and hold the last frame rather than looping. For a death. */
  once?: boolean;
}

const ASSETS = import.meta.glob('./assets/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/**
 * The picture names one animation is made of, in order.
 *
 * A `{n}` pattern is expanded here rather than in the config because the numbering is a fact about the FILES: the owner
 * exports `Idle_1..4`, and four lines of paths in the config would be four more places for that to drift.
 */
export function animationFrames(animation: AssetAnimation): string[] {
  const { frames } = animation;
  if (Array.isArray(frames)) return frames;
  const count = Math.max(1, Math.round(animation.count ?? 1));
  return Array.from({ length: count }, (_, i) => frames.replace('{n}', String(i + 1)));
}

/** How long one pass of an animation lasts, as the frame rate and the ceiling allow. */
export function animationSeconds(animation: AssetAnimation): number {
  const frames = Math.max(1, animationFrames(animation).length);
  return Math.min(animation.maxSeconds, frames / Math.max(0.01, animation.framesPerSecond));
}

/**
 * Which frame an animation is on after `elapsed` seconds.
 *
 * One place rather than one per caller, so the idle loop, the hold on the last frame of a death, and the cull that waits for
 * a death to finish cannot disagree about how long the animation is.
 */
export function animationFrameAt(animation: AssetAnimation, elapsed: number): number {
  const frames = Math.max(1, animationFrames(animation).length);
  const seconds = animationSeconds(animation);
  const raw = Math.floor(Math.max(0, elapsed) * (frames / seconds));
  if (!animation.once) return raw % frames;
  // A one-shot holds its LAST frame: a boss whose death ends on an empty frame disappears rather than dying.
  return Math.min(frames - 1, raw);
}

/** Resolve a bare file name (extension optional) to the URL Vite emitted for it. Empty when there is no such file. */
export function assetUrl(name: string): string {
  if (!name) return '';
  const bare = name.replace(/\.[^.]+$/, '');
  for (const [path, url] of Object.entries(ASSETS)) {
    const file = path.replace(/^\.\/assets\//, '');
    if (file === name || file.replace(/\.[^.]+$/, '') === bare) return url;
  }
  console.warn('[assets] no picture called "' + name + '". Available: ' + Object.keys(ASSETS).map((k) => k.replace('./assets/', '')).join(', '));
  return '';
}

/**
 * Whether the chain of parents above \`node\` flips the Y axis.
 *
 * The world is drawn with world +y UP and screen +y down, so somewhere above every creature in the water there is a negative
 * Y scale -- but not necessarily on its own parent, and NOT AT ALL in the codex, whose icon layer is a plain container. The
 * product of the chain is the honest answer; checking one level reports "not flipped" for things that plainly are, and
 * assuming the water's answer reports "flipped" for the codex, which is how the previewed anglerfish came out upside down.
 */
export function isYFlipped(node: { parent: unknown }): boolean {
  let scaleY = 1;
  for (let at = node.parent as { scale?: { y: number }; parent: unknown } | null; at; at = at.parent as never) {
    scaleY *= at.scale?.y ?? 1;
  }
  return scaleY < 0;
}

/** Every picture the game can show, as the names the config uses. */
export function allAssetNames(): string[] {
  return Object.keys(ASSETS).map((path) => path.replace(/^\.\/assets\//, ''));
}

/**
 * Load one picture through Pixi's asset manager and return its texture.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY `Assets` RATHER THAN AN `<img>` AND `Texture.from`
 * ---------------------------------------------------------------------------------------------
 * Because the loader is a CACHE KEYED BY URL, and everything else here wants that cache. An `<img>` per call makes a second
 * texture for a file that is already on the GPU -- the boss's four idle frames are one picture each and are drawn on every
 * frame of the fight -- and it re-uploads 5 MB of PNG to the GPU to do it. `Assets.load` is idempotent: the second call for
 * a URL resolves from the cache with no request and no upload.
 *
 * The measurement that used to stand against this (a JPEG the plain `<img>` rendered happily being refused with "the source
 * image could not be decoded") was the URL, not the loader: the same sheet loads here and reports its real size. The one
 * caller that still uses an `<img>` is the backdrop, which wants an image-level failure message.
 *
 * Resolves `null` rather than rejecting: a picture is an upgrade to a creature, never a precondition, so the callers all
 * fall back to drawing.
 */
export async function loadAssetTexture(name: string): Promise<Texture | null> {
  const url = assetUrl(name);
  if (!url) return null;
  try {
    const texture = await Assets.load<Texture>(url);
    if (!texture || texture.width <= 0 || texture.height <= 0) {
      // A zero-width texture is the bug that made the player's bubble enormous twice; it must not reach a sprite.
      console.warn('[assets] ' + name + ' decoded to an empty texture');
      return null;
    }
    return texture;
  } catch (error) {
    console.warn('[assets] could not load ' + name + ': ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
}

/**
 * The frame-by-frame textures of one animation, in order, with the ones that failed left out.
 *
 * A missing frame is not a failure of the animation: the sheet plays short. That is the same call the preload makes, and
 * the alternative -- refusing to show the creature because one of four PNGs is missing -- costs far more than it saves.
 */
export function loadAnimationTextures(animation: AssetAnimation): Promise<Texture[]> {
  return Promise.all(animationFrames(animation).map((name) => loadAssetTexture(name))).then((textures) =>
    textures.filter((texture): texture is Texture => texture !== null),
  );
}

/** The texture for a name IF it has already been loaded, without starting a load. Null until then. */
export function assetTextureNow(name: string): Texture | null {
  const url = assetUrl(name);
  if (!url) return null;
  const texture = Assets.get<Texture>(url);
  return texture && texture.width > 0 ? texture : null;
}

/** What the server said each URL weighs, so a second start does not ask again. See `assetByteSizes`. */
const BYTE_SIZES = new Map<string, number>();

/**
 * How big each picture is, asked of the server rather than guessed.
 *
 * A HEAD per file, because the sizes have to be true at RUNTIME: the number the loading page reports is the number the
 * server served, and a manifest baked at build time would be a second source of truth that goes stale the moment a
 * picture is replaced by hand. The answers are cached per URL for the session, so the second start -- a Pixi cache hit
 * that shows the page for one frame -- does not ask again.
 *
 * A file the server will not describe (no `Content-Length`, a HEAD it refuses) counts as 0 rather than as a failure:
 * these numbers are a REPORT about the download, and a report must never be able to stop it.
 */
export async function assetByteSizes(names: readonly string[]): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  await Promise.all(
    names.map(async (name) => {
      const url = assetUrl(name);
      if (!url) return;
      const known = BYTE_SIZES.get(url);
      if (known !== undefined) {
        sizes.set(name, known);
        return;
      }
      let bytes = 0;
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const header = response.headers.get('content-length');
        const parsed = header === null ? Number.NaN : Number(header);
        if (Number.isFinite(parsed) && parsed > 0) bytes = parsed;
      } catch {
        // See above: the pictures are the point, and the sizes are a report about them.
      }
      BYTE_SIZES.set(url, bytes);
      sizes.set(name, bytes);
    }),
  );
  return sizes;
}

/**
 * What the loading page is told, once per picture that lands.
 *
 * The BYTES are the reason this is an object rather than two counters: "12 of 17 pictures" is a progress bar that
 * stalls on a big file, and a page that claims to be a download has to report what a download reports -- how much has
 * arrived, out of how much, at what rate. `seconds` comes from here rather than from the caller's own clock so that
 * the rate and the counts are measured against the same start.
 */
export interface PreloadProgress {
  /** Pictures that have landed. */
  done: number;
  /** Pictures to fetch. */
  total: number;
  /** Bytes of the ones that have landed, as far as the server has said. */
  bytesDone: number;
  /** Bytes of the whole set, as far as the server has said. 0 until it answers, and 0 if it never does. */
  bytesTotal: number;
  /** Seconds since the preload began. */
  seconds: number;
}

/**
 * Fetch pictures and wait until they can be DRAWN, reporting progress as each one lands.
 *
 * `Assets.load` per name rather than one call with the whole list, because that path reports progress and this one is
 * called by NAME: a name with no file is counted as done rather than failing the load, since a missing picture should cost
 * one creature its art and not the whole level. The textures land in Pixi's cache, so every later request -- a creature's
 * art, a sprite sheet's frames -- is a cache hit rather than a second decode.
 *
 * The SIZES are asked for in the background and never awaited. Awaiting them would put a round trip in front of the
 * pictures -- and worse, a HEAD per file would queue on the same handful of connections the pictures need -- so the
 * page's totals fill in a moment after the first frame instead. Nothing the report says may delay what it reports on.
 */
export async function preloadAssets(
  names: string[],
  onProgress: (progress: PreloadProgress) => void,
): Promise<void> {
  const todo = [...new Set(names)].filter((name) => name.length > 0);
  const started = performance.now();
  const sizes = new Map<string, number>();
  const landed: string[] = [];
  /** Summed on demand rather than accumulated: a total that is recomputed cannot drift from the map it comes from. */
  const bytesOf = (from: readonly string[]): number => from.reduce((sum, name) => sum + (sizes.get(name) ?? 0), 0);
  const report = (): void =>
    onProgress({
      done: landed.length,
      total: todo.length,
      bytesDone: bytesOf(landed),
      bytesTotal: bytesOf(todo),
      seconds: (performance.now() - started) / 1000,
    });

  report();
  void assetByteSizes(todo).then((found) => {
    for (const [name, bytes] of found) sizes.set(name, bytes);
    // A picture that landed before its size was known is counted now, which is the whole reason the totals are
    // summed from the two lists rather than added up as they arrive.
    report();
  });

  await Promise.all(
    todo.map(async (name) => {
      await loadAssetTexture(name);
      landed.push(name);
      report();
    }),
  );
}
