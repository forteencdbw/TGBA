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
const ASSETS = import.meta.glob('./assets/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

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
