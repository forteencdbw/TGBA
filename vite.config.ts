import { defineConfig } from 'vite';

// Relative base so the build works from any static host / subdirectory (itch.io, GitHub Pages, file:// preview).
export default defineConfig({
  base: './',
  server: {
    port: 5173,
    // Exposed on the LAN so the game can be opened on a real phone during development.
    host: true,
    watch: {
      // Editors and agent tooling write scratch/temp directories inside the repo. Watching them
      // makes Vite's fs watcher throw EBUSY on Windows and kill the dev server outright, so the
      // non-runtime directories are excluded.
      ignored: ['**/scripts/**', '**/.scratch/**', '**/dist/**', '**/*.tmpdir/**', '**/.*.tmp'],
    },
  },
  build: {
    target: 'es2020',
    // Vite 8 bundles with rolldown; let it minify too. `minify: 'esbuild'` would pull in esbuild,
    // which is only an optional peer dependency and is not installed.
    minify: true,
    /**
     * No source maps in the shipped build.
     *
     * They were 2.9 MB of the 3.0 MB artifact -- the game itself is 589 kB -- and they are the one thing here
     * that is purely for a developer. A browser only fetches a map when devtools is open, so this is about
     * the size of what gets uploaded rather than about runtime cost.
     *
     * There is deliberately no environment-variable switch: reading one needs `process`, which this project's
     * browser-targeted tsconfig has no types for, so `pnpm build` -- which typechecks the config -- would
     * fail. To read a minified stack trace, set this to `true` locally, build, and set it back.
     */
    sourcemap: false,
  },
});
