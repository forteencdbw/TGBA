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
    sourcemap: true,
  },
});
