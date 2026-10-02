import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY PLAYWRIGHT, AND WHY IT REPLACES THE HAND-ROLLED HARNESS
 * ---------------------------------------------------------------------------------------------
 * Every existing suite in `scripts/` drives a browser over raw CDP: spawn Chrome with
 * `--remote-debugging-port`, poll `/json/list` for a websocket, hand-write a promise-based client, then
 * `Runtime.evaluate` strings and parse JSON back. That is roughly 130 lines of harness repeated in each file,
 * and it is where most of the bugs in those probes have lived -- a probe that read a field the game had
 * renamed, a probe that copied the implementation instead of calling it, a probe whose `until` helper returned
 * the PREVIOUS iteration's state.
 *
 * Playwright replaces all of that with `page.evaluate(() => ...)`: real typed function calls in the page, with
 * auto-waiting locators, a trace viewer, `--ui` mode, retries and screenshots on failure. The harness cost goes
 * to zero and the assertions get to be about the GAME.
 *
 * ---------------------------------------------------------------------------------------------
 * THE GAME'S OWN TEST HOOKS ARE STILL THE RIGHT SEAM
 * ---------------------------------------------------------------------------------------------
 * `window.__GB` is what makes this game testable at all -- the scroll position, the player's screen fraction,
 * the hazard list, the audio graph's requested gains. A game whose state lives only in pixels can be tested
 * through the UI, but badly; the hooks exist and they are the honest way to assert "the level froze" rather
 * than "the pixels stopped changing".
 *
 * ---------------------------------------------------------------------------------------------
 * ONE BROWSER, NOT THREE
 * ---------------------------------------------------------------------------------------------
 * This game ships to mobile browsers and is developed in Chrome. Chromium alone is the honest target, so only
 * that browser is installed -- `pnpm exec playwright install chromium`, about 115 MB rather than the ~700 MB
 * of a full install.
 */
export default defineConfig({
  testDir: './e2e',
  /**
   * Screenshot captures are excluded from the default run, and run by naming the file.
   *
   * They assert nothing -- a picture is for a human to look at -- so letting them into `pnpm test` would make
   * "all tests pass" mean less than it should.
   *
   * Filtering by TAG was tried first and abandoned: `grepInvert` applies even when a file is named on the
   * command line, and `--grep-invert` from a package script runs into `^` being an escape character in
   * PowerShell. Two shell quirks and a contradiction, versus one condition here.
   */
  grepInvert: process.env.GB_SHOTS === '1' ? undefined : /@screenshots/,
  // The game simulates in real time and some checks wait for a phase transition, so a test needs seconds, not
  // the 5s default. One minute is generous for a single scenario and still fails a real hang.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Serial by default. Each test drives a real-time simulation, and running them concurrently steals CPU from
  // each other -- which is exactly how the old suites produced flaky timing failures under load.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  // Traces and screenshots only on failure: they are the debugging aid that used to cost a bespoke probe.
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      /**
       * A phone-shaped viewport at 3x, which is the SHIPPING TARGET.
       *
       * `hasTouch` and `isMobile` are on so the touch controls are exercised rather than merely present, and
       * the device scale factor matches what a phone reports -- the layout once broke on a desktop window and
       * a phone-shaped project is what would have caught it.
       */
      name: 'phone',
      use: {
        ...devices['Pixel 7'],
        // Chromium only, matching what is installed.
        defaultBrowserType: 'chromium',
        baseURL: 'http://127.0.0.1:5173',
      },
    },
    {
      /** A desktop window, because the play area's width cap and the HUD scale only matter here. */
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        baseURL: 'http://127.0.0.1:5173',
      },
    },
  ],
  /**
   * Start the dev server automatically, and reuse one that is already running.
   *
   * `reuseExistingServer` matters on this machine: a dev server is usually already up for hand-testing, and
   * without it Playwright would refuse to start or fight over the port.
   */
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
