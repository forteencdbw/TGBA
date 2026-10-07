/**
 * Level and player art, resolved by the NAME THE OWNER USES -- now out of PixiJS spritesheet atlases.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT CHANGED, AND WHAT STAYED
 * ---------------------------------------------------------------------------------------------
 * It used to be one picture per file: `src/assets/*.png`, imported through Vite so each one got its own URL. Callers
 * still ask for a picture by the name the config writes (`assetTextureNow('灯笼鱼-移动')`, `loadAnimationTextures`),
 * and every painter still scales what it gets as `size / texture.width` -- none of that moved.
 *
 * What moved is underneath: the pictures are packed into a few page textures plus a TexturePacker Hash manifest per
 * page, and this module hands out the rectangle for a name. 19 pictures became 3 pages, which is 19 requests and 19
 * GPU textures fewer: what a caller receives is a `Texture` either way.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE ATLAS IS COMMITTED, AND WHY THAT IS THE ONE THING TO REMEMBER
 * ---------------------------------------------------------------------------------------------
 * `src/assets/atlas/` is generated (`scripts/pack-atlas.py`, run as `pnpm atlas`) and it is IN GIT rather than built
 * into the bundle, because the deploy runs `pnpm exec vite build` on a clean Node runner and a packer there would put
 * a Python image library on the critical path of every deploy.
 *
 * The price is that the atlas can be STALE: replace a picture, forget to re-pack, and the game goes on showing the
 * old one with nothing to announce it. `pnpm atlas:check` answers that in a second (it compares every source's size
 * and hash against what the manifests recorded), and the pictures are no longer in the bundle at all -- so a picture
 * that was never packed is simply missing, and `assetUrl` names it in the console rather than half-showing it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PICTURES ARE STILL SEPARATE FILES ON DISK
 * ---------------------------------------------------------------------------------------------
 * Because "replace the anglerfish by dropping a new PNG over the old one" is the workflow this project actually uses,
 * and an atlas does not have to take it away: the pictures stay in `src/assets/`, they are simply an input to the
 * packer instead of an input to the bundle. Replacing one is still replacing one file; it now needs `pnpm atlas`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE NAME IS STILL AN IMPORT RATHER THAN A PATH IN `public/`
 * ---------------------------------------------------------------------------------------------
 * This is the bug the first version of this module was written around, and it is worth keeping: the pictures are named
 * in Chinese after what they are, and a file in `public/` is served by its own path, so the URL carries those
 * characters. The request came back 200 and the browser refused the bytes with "the source image could not be
 * decoded", which points hard at "the file is corrupt" when the file was fine and the PATH was the problem.
 *
 * The atlas texture names are ASCII (`atlas-1.webp`), so that particular trap is gone for them -- but they are still
 * imported rather than parked in `public/`, for the other half of the reason: Vite emits them with a content hash, so
 * a repacked page can never be served from a stale cache entry, and the manifest is a real module dependency, so
 * editing a picture and re-packing reaches the running page through the dev server's own graph.
 *
 * The two JPEG backdrops are the exception and stay individual files: they are full-screen images no sprite ever
 * draws from, they are the biggest pictures in the game, and `parallax.ts` wants an ordinary `<img>` failure for
 * them. They are the only pictures `assetUrl` still answers for.
 */
import { Assets, Spritesheet, Texture } from 'pixi.js';
import type { SpritesheetData } from 'pixi.js';

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

// ---------------------------------------------------------------------------------------------
// The atlas: what `scripts/pack-atlas.py` wrote, read at BUILD time.
// ---------------------------------------------------------------------------------------------

/** A picture packed into a page: which page, which key in its manifest, and the size it draws at. */
interface AtlasFrame {
  /** The page id (`atlas-1`), which is the file's name without its extension. */
  page: string;
  /** The manifest's own key: the picture's file name, extension included. */
  key: string;
  width: number;
  height: number;
}

/** One page: its manifest and the URL of its texture. */
interface AtlasPage {
  id: string;
  data: SpritesheetData;
  url: string;
}

/**
 * The manifests, as OBJECTS rather than as URLs to fetch.
 *
 * Imported this way for two reasons and both are about not guessing: the texture's name is in `meta.image` (written by
 * the packer) but Vite emits it fingerprinted, so a loader that had to resolve `meta.image` against the manifest's own
 * URL would be looking for the wrong file name -- and handing the parsed manifest straight to PixiJS's `Spritesheet`
 * sidesteps the question entirely. The second is that the manifest is then a module dependency, which is what makes
 * `pnpm atlas` during a dev session actually reach the page in the browser.
 */
const MANIFESTS = import.meta.glob('./assets/atlas/*.json', { eager: true, import: 'default' }) as Record<
  string,
  SpritesheetData
>;

/** The page textures, fingerprinted by Vite. Both encodings: the packer keeps whichever came out smaller. */
const PAGE_TEXTURES = import.meta.glob('./assets/atlas/*.{webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/**
 * Pictures that are their own file, which today means the JPEG backdrops.
 *
 * The rule, in one line: **a top-level PNG is the packer's input, everything else is its own file.** So this glob is
 * "every picture under `assets/`, except those inputs and except the pages themselves". Spelled out as an exclusion
 * rather than as "jpg only", because the widened glob it replaced WAS fully recursive -- a hand-authored backdrop saved
 * as a PNG in a subdirectory used to work, and a `jpg`-only glob would have dropped it silently, with the backdrop's
 * own "no such image" as the only clue. Backdrops live in a subdirectory for exactly this reason; a PNG in the TOP level
 * is a packed picture and nothing else.
 */
const LOOSE_PICTURES = import.meta.glob(['./assets/**/*.{jpg,jpeg,png,webp}', '!./assets/*.png', '!./assets/atlas/**'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** A file name without its directory or its extension -- the form every lookup here is keyed by. */
function withoutExtension(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
}

/** Every picture, by bare name (extension optional at the call site, as it always was). */
const FRAMES = new Map<string, AtlasFrame>();
/** Every page, by id. */
const PAGES = new Map<string, AtlasPage>();
/** Every picture that is still its own file, by bare name. */
const LOOSE = new Map<string, string>();

for (const [path, data] of Object.entries(MANIFESTS)) {
  const id = withoutExtension(path);
  const url = Object.entries(PAGE_TEXTURES).find(([texture]) => withoutExtension(texture) === id)?.[1];
  if (!url) {
    console.warn(`[assets] the atlas manifest ${id}.json has no texture beside it -- was the pack interrupted?`);
    continue;
  }
  PAGES.set(id, { id, data, url });
  for (const [key, frame] of Object.entries(data.frames ?? {})) {
    // The page's own copy wins on a duplicate name, which cannot happen: the packer refuses to pack a picture twice.
    if (FRAMES.has(withoutExtension(key))) continue;
    FRAMES.set(withoutExtension(key), { page: id, key, width: frame.frame.w, height: frame.frame.h });
  }
}
for (const [path, url] of Object.entries(LOOSE_PICTURES)) LOOSE.set(withoutExtension(path), url);

/**
 * The parsed pages, and the loads in flight.
 *
 * A page is parsed ONCE for the whole session: the boss's eight frames are four on each of two pages and are drawn on
 * every frame of a fight, and re-parsing a page per lookup would rebuild 4 textures per creature per frame. The
 * in-flight map is not tidiness either -- `preloadAssets` and the first creature that needs the art can ask for the
 * same page in the same tick, and without it both would start their own parse.
 */
const SHEETS = new Map<string, Spritesheet>();
const SHEETS_LOADING = new Map<string, Promise<Spritesheet | null>>();

/** Load and parse one page, once. Null when the page or its texture could not be had. */
async function loadPage(id: string): Promise<Spritesheet | null> {
  const ready = SHEETS.get(id);
  if (ready) return ready;
  const inFlight = SHEETS_LOADING.get(id);
  if (inFlight) return inFlight;
  const page = PAGES.get(id);
  if (!page) return null;

  const task = (async (): Promise<Spritesheet | null> => {
    const texture = await Assets.load<Texture>(page.url);
    // PixiJS's own spritesheet parsing over the committed manifest. `trimmed: false` in every frame is what keeps
    // `texture.width` equal to the picture's own width -- see the packer.
    const sheet = new Spritesheet(texture, page.data);
    await sheet.parse();
    SHEETS.set(id, sheet);
    return sheet;
  })()
    .catch((error: unknown) => {
      console.warn(`[assets] could not load atlas page ${id}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    })
    .finally(() => {
      SHEETS_LOADING.delete(id);
    });

  SHEETS_LOADING.set(id, task);
  return task;
}

/** The frame texture for a name IF its page is already parsed, without starting a load. Null until then. */
function atlasTextureNow(name: string): Texture | null {
  const frame = FRAMES.get(name);
  if (!frame) return null;
  const texture = SHEETS.get(frame.page)?.textures[frame.key];
  return texture && texture.width > 0 ? texture : null;
}

/**
 * Test hook: which page a picture lives on, and where Vite put that page's texture.
 *
 * Here because the link this change turns on is three string matchings in a row -- the name in the config, the key in
 * the manifest, the URL Vite emitted for the texture -- and every one of them fails SILENTLY into "no art". Nothing in
 * the type system can see it and the packer cannot see it either (it never runs through Vite), so
 * `scripts/probe-atlas.mjs` asks this and checks the URL against a real file.
 */
export function atlasPageForTest(name: string): { page: string; url: string } | null {
  const frame = FRAMES.get(withoutExtension(name));
  if (!frame) return null;
  const page = PAGES.get(frame.page);
  return page ? { page: page.id, url: page.url } : null;
}

/**
 * Resolve a bare file name (extension optional) to the URL Vite emitted for it. Empty when there is no such file.
 *
 * This now answers for the JPEG backdrops only. A picture in the atlas deliberately has no single-file URL -- it is a
 * rectangle inside a page -- so the honest answer for one is an empty string, and asking for a name that exists in
 * the atlas through this function is a caller using the wrong door, which is what the warning says.
 */
export function assetUrl(name: string): string {
  if (!name) return '';
  const bare = withoutExtension(name);
  const loose = LOOSE.get(bare);
  if (loose) return loose;
  if (FRAMES.has(bare)) return '';
  console.warn(
    '[assets] no separate file called "' + name + '". Its own file: ' + [...LOOSE.keys()].join(', '),
  );
  return '';
}

/** Every picture the game can show, as the names the config uses -- atlas and loose together. */
export function allAssetNames(): string[] {
  return [...[...FRAMES.values()].map((frame) => frame.key), ...Object.keys(LOOSE_PICTURES).map((path) => path.replace(/^\.\/assets\//, ''))];
}

/**
 * Load one picture and return its texture.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY `Assets` RATHER THAN AN `<img>` AND `Texture.from`
 * ---------------------------------------------------------------------------------------------
 * Because the loader is a CACHE KEYED BY URL, and everything else here wants that cache. An `<img>` per call makes a second
 * texture for a file that is already on the GPU -- the boss's four idle frames are one picture each and are drawn on every
 * frame of the fight -- and it re-uploads 5 MB of PNG to the GPU to do it. `Assets.load` is idempotent: the second call for
 * a URL resolves from the cache with no request and no upload.
 *
 * For an atlas picture the cache that matters is one level up: the PAGE is what is fetched and uploaded, so this
 * awaits the page and then hands out the rectangle. Twenty creatures from one page is one request.
 *
 * Resolves `null` rather than rejecting: a picture is an upgrade to a creature, never a precondition, so the callers all
 * fall back to drawing.
 */
export async function loadAssetTexture(name: string): Promise<Texture | null> {
  const bare = withoutExtension(name);
  const frame = FRAMES.get(bare);
  if (frame) {
    const sheet = await loadPage(frame.page);
    const texture = sheet?.textures[frame.key];
    if (!texture || texture.width <= 0) {
      console.warn(`[assets] ${name} is in ${frame.page} but came out empty`);
      return null;
    }
    return texture;
  }

  const url = LOOSE.get(bare);
  if (!url) {
    console.warn('[assets] no picture called "' + name + '". Available: ' + allAssetNames().join(', '));
    return null;
  }
  try {
    const texture = await Assets.load<Texture>(url);
    if (!texture || texture.width <= 0) {
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
  const bare = withoutExtension(name);
  if (FRAMES.has(bare)) return atlasTextureNow(bare);
  const url = LOOSE.get(bare);
  if (!url) return null;
  const texture = Assets.get<Texture>(url);
  return texture && texture.width > 0 ? texture : null;
}

/** What the server said each URL weighs, so a second start does not ask again. See `assetByteSizes`. */
const BYTE_SIZES = new Map<string, number>();

/**
 * How big each URL is, asked of the server rather than guessed.
 *
 * A HEAD per file, because the sizes have to be true at RUNTIME: the number the loading page reports is the number the
 * server served, and a manifest baked at build time would be a second source of truth that goes stale the moment a
 * picture is replaced by hand. The answers are cached per URL for the session, so the second start -- a Pixi cache hit
 * that shows the page for one frame -- does not ask again.
 *
 * A file the server will not describe (no `Content-Length`, a HEAD it refuses) counts as 0 rather than as a failure:
 * these numbers are a REPORT about the download, and a report must never be able to stop it.
 */
async function byteSizes(urls: readonly string[]): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  await Promise.all(
    urls.map(async (url) => {
      const known = BYTE_SIZES.get(url);
      if (known !== undefined) {
        sizes.set(url, known);
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
      sizes.set(url, bytes);
    }),
  );
  return sizes;
}

/**
 * What the loading page is told, once per file that lands.
 *
 * The BYTES are the reason this is an object rather than two counters: "12 of 17 pictures" is a progress bar that
 * stalls on a big file, and a page that claims to be a download has to report what a download reports -- how much has
 * arrived, out of how much, at what rate. `seconds` comes from here rather than from the caller's own clock so that
 * the rate and the counts are measured against the same start.
 *
 * **The unit is the FILE, and after the atlas change a file is usually a PAGE**: three pages carry all nineteen
 * pictures, so `total` is 5 on this project (three atlas pages and two JPEG backdrops) rather than 21. That is the
 * honest number -- it is what the network does -- and it is why the loading page says "files" rather than "pictures".
 */
export interface PreloadProgress {
  /** Files that have landed. */
  done: number;
  /** Files to fetch. */
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
 * The names are grouped into the FILES they actually are -- one entry per atlas page, one per loose picture -- because
 * that is what the download is: asking for four of the boss's frames must not fetch the same page four times, and a
 * progress bar that counted pictures would count the same 2 MB four times.
 *
 * `Assets.load` per file rather than one call with the whole list, because that path reports progress and this one is
 * called by NAME: a name with no file is counted as done rather than failing the load, since a missing picture should
 * cost one creature its art and not the whole level. The textures land in Pixi's cache, so every later request -- a
 * creature's art, a sprite sheet's frames -- is a cache hit rather than a second decode.
 *
 * The SIZES are asked for in the background and never awaited. Awaiting them would put a round trip in front of the
 * pictures -- and worse, a HEAD per file would queue on the same handful of connections the pictures need -- so the
 * page's totals fill in a moment after the first frame instead. Nothing the report says may delay what it reports on.
 */
export async function preloadAssets(
  names: string[],
  onProgress: (progress: PreloadProgress) => void,
): Promise<void> {
  const pages = new Set<string>();
  const loose = new Set<string>();
  for (const name of names) {
    if (name.length === 0) continue;
    const bare = withoutExtension(name);
    const frame = FRAMES.get(bare);
    if (frame) pages.add(frame.page);
    else if (LOOSE.has(bare)) loose.add(bare);
  }

  const targets: { url: string; load: () => Promise<unknown> }[] = [
    ...[...pages].sort().map((id) => ({ url: PAGES.get(id)?.url ?? '', load: () => loadPage(id) })),
    ...[...loose].sort().map((bare) => ({ url: LOOSE.get(bare) ?? '', load: () => loadAssetTexture(bare) })),
  ];

  const started = performance.now();
  const sizes = new Map<string, number>();
  const landed: string[] = [];
  /** Summed on demand rather than accumulated: a total that is recomputed cannot drift from the map it comes from. */
  const bytesOf = (from: readonly string[]): number => from.reduce((sum, url) => sum + (sizes.get(url) ?? 0), 0);
  const report = (): void =>
    onProgress({
      done: landed.length,
      total: targets.length,
      bytesDone: bytesOf(landed),
      bytesTotal: bytesOf(targets.map((target) => target.url)),
      seconds: (performance.now() - started) / 1000,
    });

  report();
  void byteSizes(targets.map((target) => target.url).filter((url) => url.length > 0)).then((found) => {
    for (const [url, bytes] of found) sizes.set(url, bytes);
    // A file that landed before its size was known is counted now, which is the whole reason the totals are
    // summed from the two lists rather than added up as they arrive.
    report();
  });

  await Promise.all(
    targets.map(async (target) => {
      await target.load();
      landed.push(target.url);
      report();
    }),
  );
}
