import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/');
await page.waitForFunction(() => Boolean(window.__GB));
await page.evaluate(() => window.__GB.game.debugStartRunWithType('devour'));
await page.waitForFunction(() => window.__GB.game.diagnostics.phase === 'playing');
await page.evaluate(() => {
  const g = window.__GB.game;
  g.debugSetSteadyCruise();
  window.__GB.player.volume = 1.8;
  for (let i = 0; i < 3; i++) g.debugSwallowForTest('fish');
});
await page.waitForFunction(() => window.__GB.game.diagnostics.score.value > 100);
await page.setViewportSize({ width: 412, height: 915 });
const info = await page.evaluate(() => {
  const g = window.__GB.game;
  return {
    build: window.__GB.hud.debug.text.split('\n')[0],
    score: g.diagnostics.score,
    hud: window.__GB.hud.scoreText,
    prices: window.__GB.mechRef.score,
  };
});
console.log(JSON.stringify(info, null, 2));
console.log('page errors:', errors.length ? errors.join(' | ') : 'none');
await page.screenshot({ path: 'D:/TGBA/.scratch/final-check/live.png' });
await browser.close();
