// Screenshot a URL at an exact viewport width through the Chrome DevTools
// Protocol, and report the page's real layout widths as evidence.
// Usage: node tools/shoot.mjs <url> <width> <height> <outfile> [port]
import { writeFileSync } from 'node:fs';

const [, , url, wArg, hArg, out, portArg] = process.argv;
const W = Number(wArg);
const H = Number(hArg);
const port = Number(portArg || 9333);

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === 'page') || list[0];
if (!target) throw new Error('no page target on the debugging port');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(JSON.stringify(m.error)));
    else resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', {
  width: W, height: H, deviceScaleFactor: 1, mobile: W < 600, screenWidth: W, screenHeight: H,
});
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 1500));

const diag = await send('Runtime.evaluate', {
  expression: `(() => {
    let worst = null, max = 0;
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > max) { max = r.right; worst = el; }
    });
    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      widest: worst ? worst.tagName + '.' + worst.className + '@' + Math.round(max) : 'none',
      title: document.title,
      nodes: document.querySelectorAll('#view *').length
    };
  })()`,
  returnByValue: true,
});

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(`w=${W} ${JSON.stringify(diag.result.value)} -> ${out}`);
ws.close();
process.exit(0);
