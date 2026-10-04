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
