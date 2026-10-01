// Measures the ACTUAL rendered pixels.
//
// A 2D context cannot read a WebGL canvas unless `preserveDrawingBuffer` is on, so `drawImage`
// silently yields black -- which nearly sent me hunting a gradient bug that did not exist. Instead
// this captures a PNG over CDP and decodes it in-process (zlib + the PNG filter spec, no deps).
//
// Usage: node scripts/measure-pixels.mjs [url] [w] [h] [yFraction]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';

const URL_ARG = process.argv[2] ?? 'http://127.0.0.1:5173/';
const W = Number(process.argv[3] ?? 430);
const H = Number(process.argv[4] ?? 932);
const YF = Number(process.argv[5] ?? 0.5);
// If a 6th argument is given it is an ABSOLUTE y in CSS pixels, overriding the yFraction.
const ABS_Y = process.argv[6] !== undefined ? Number(process.argv[6]) : null;
const PORT = 9336;

const CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];
const chromePath = CANDIDATES.find((p) => p && existsSync(p));
if (!chromePath) {
  console.error('no chrome');
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), 'gb-measure-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);

/** Minimal PNG decoder for the truecolour 8-bit images CDP returns. */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colourType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colourType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error('unsupported bit depth ' + bitDepth);
  // 0 = greyscale, 2 = truecolour, 6 = truecolour + alpha.
  const channels = colourType === 6 ? 4 : colourType === 2 ? 3 : colourType === 0 ? 1 : 0;
  if (!channels) throw new Error('unsupported colour type ' + colourType);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      const v = line[x];
      let value;
      switch (filter) {
        case 0:
          value = v;
          break;
        case 1:
          value = v + a;
          break;
        case 2:
          value = v + b;
          break;
        case 3:
          value = v + ((a + b) >> 1);
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          value = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          throw new Error('bad filter ' + filter);
      }
      cur[x] = value & 0xff;
    }
  }

  return { width, height, channels, data: out };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up */
    }
    await sleep(250);
  }
  throw new Error(`no devtools target on port ${PORT} (is another run holding it?)`);
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 1;
    const pending = new Map();
    ws.addEventListener('open', () =>
      resolve({
        send(m, p = {}) {
          const i = id++;
          ws.send(JSON.stringify({ id: i, method: m, params: p }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener('error', (e) => reject(new Error('ws ' + e.message)));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    });
  });
}

let code = 1;
try {
  const cdp = await connect(await target());
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Page.navigate', { url: URL_ARG });
  await sleep(3500);

  const info = await cdp.send('Runtime.evaluate', {
    expression:
      'JSON.stringify({ viewport: window.__GB ? window.__GB.camera.viewport : null, dpr: window.devicePixelRatio, canvas: (() => { const c = document.querySelector("canvas"); return c ? c.width + "x" + c.height : null; })() })',
    returnByValue: true,
  });
  const meta = JSON.parse(info.result.value);

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const png = decodePng(Buffer.from(shot.data, 'base64'));

  writeFileSync(join(process.cwd(), 'measure.png'), Buffer.from(shot.data, 'base64'));

  const px = (x, y) => {
    const i = (y * png.width + x) * png.channels;
    return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
  };

  const scanY = ABS_Y !== null ? Math.min(png.height - 1, Math.max(0, ABS_Y)) : Math.floor(png.height * YF);
  const step = Math.max(1, Math.floor(png.width / 25));
  const horizontal = [];
  for (let x = 0; x < png.width; x += step) horizontal.push({ x, ...px(x, scanY) });

  const cx = Math.floor(png.width / 2);
  const vertical = [];
  for (let y = 0; y < png.height; y += Math.max(1, Math.floor(png.height / 12))) {
    vertical.push({ y, ...px(cx, y) });
  }

  console.log('screenshot: ' + png.width + 'x' + png.height + '  canvas: ' + meta.canvas + '  dpr: ' + meta.dpr);
  console.log('viewport: ' + JSON.stringify(meta.viewport));
  if (meta.viewport) {
    console.log('expected column span: ' + meta.viewport.left.toFixed(1) + ' .. ' + (meta.viewport.left + 78 * (960 / 540) * meta.viewport.scale).toFixed(1));
  }
  console.log('\nhorizontal @ y=' + scanY);
  for (const s of horizontal) console.log(`  ${String(s.x).padStart(5)} : ${String(s.r).padStart(3)},${String(s.g).padStart(3)},${String(s.b).padStart(3)}`);
  console.log('\nvertical @ x=' + cx);
  for (const s of vertical) console.log(`  ${String(s.y).padStart(5)} : ${String(s.r).padStart(3)},${String(s.g).padStart(3)},${String(s.b).padStart(3)}`);

  code = 0;
  cdp.close();
} catch (e) {
  console.error('MEASURE FAILED: ' + e.message);
  code = 3;
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
  process.exit(code);
}
