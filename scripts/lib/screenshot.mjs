import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const WIDTH = 1280;
const HEIGHT = 800;
const READY_TIMEOUT_MS = 20_000;
const LIMIT_BYTES = 300_000;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Chrome on GitHub's runners, or a local install.
const chromePath = () => [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p));

// A sharp 1280x800 WebP of the top of a page, as a data URL, or null if it could not be taken.
export async function screenshot(url, port = 9500 + Math.floor(Math.random() * 400)) {
  const bin = chromePath();
  if (!bin) return null;
  const profile = mkdtempSync(path.join(tmpdir(), 'shot-'));
  const chrome = spawn(bin, [
    '--headless=new', '--no-sandbox', '--hide-scrollbars', '--mute-audio',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${WIDTH},${HEIGHT}`, 'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  try {
    let target;
    for (let i = 0; i < 40 && !target; i += 1) {
      await sleep(250);
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { /* not up yet */ }
    }
    if (!target) return null;

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (m) => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    });
    const send = (method, params = {}) => new Promise((res) => {
      const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
    // Light theme for consistent cards; reduced motion so fade-ins are already finished.
    await send('Emulation.setEmulatedMedia', { features: [
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ] });
    const nav = await send('Page.navigate', { url });
    if (nav.error || nav.result?.errorText) return null;

    // Wait until the page is really ready: loaded, fonts in, every visible image decoded,
    // and nothing new requested for a moment. Scrolling once wakes lazy-loaded images.
    await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const until = Date.now() + ${READY_TIMEOUT_MS};
        while (document.readyState !== 'complete' && Date.now() < until) await sleep(200);
        window.scrollTo(0, innerHeight); await sleep(400); window.scrollTo(0, 0);
        await document.fonts?.ready;
        const visible = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
        let quietSince = Date.now();
        let seen = performance.getEntriesByType('resource').length;
        while (Date.now() < until) {
          const now = performance.getEntriesByType('resource').length;
          if (now !== seen) { seen = now; quietSince = Date.now(); }
          const pending = [...document.images].filter(i => visible(i) && !(i.complete && i.naturalWidth > 0));
          if (!pending.length && Date.now() - quietSince > 1500) break;
          await sleep(250);
        }
        await sleep(600);
      })()`,
    });

    for (const quality of [82, 70, 58]) {
      const shot = await send('Page.captureScreenshot', {
        format: 'webp', quality, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
      });
      const data = shot.result?.data;
      if (!data) return null;
      if (data.length <= LIMIT_BYTES) return `data:image/webp;base64,${data}`;
    }
    return null;
  } catch {
    return null;
  } finally {
    try { ws?.close(); } catch { /* already closed */ }
    chrome.kill();
    await sleep(300);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold files */ }
  }
}
