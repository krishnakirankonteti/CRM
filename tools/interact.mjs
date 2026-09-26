// Drive the running app through CDP and report what the UI actually returns.
import { writeFileSync } from 'node:fs';
const port = Number(process.argv[2] || 9334);
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = list.find((t) => t.type === 'page') || list[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params })); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 1200, screenHeight: 900 });

// 1. Ask a recognised question.
await send('Page.navigate', { url: 'http://127.0.0.1:5173/#/ask' });
await wait(1200);
const ask = await evaluate(`(() => {
  document.querySelector('#ask-input').value = 'how many orders are open?';
  document.querySelector('#ask-form').requestSubmit();
  return document.querySelector('#ask-answer').innerText.slice(0, 300);
})()`);

// 2. Ask an unrecognised question; must say not recorded.
const askUnknown = await evaluate(`(() => {
  document.querySelector('#ask-input').value = 'what is the weather in Dubai';
  document.querySelector('#ask-form').requestSubmit();
  return document.querySelector('#ask-answer').innerText.slice(0, 200);
})()`);

// 3. Submit the New requirement form empty; it must refuse and stay open.
await send('Page.navigate', { url: 'http://127.0.0.1:5173/#/requirements' });
await wait(1200);
const form = await evaluate(`(() => {
  const btn = document.querySelector('[data-action="new-requirement"]');
  btn.click();
  const f = document.querySelector('#modal-form');
  f.requestSubmit();
  const err = document.querySelector('#modal-errors');
  return {
    errors: err ? err.innerText.replace(/\\n+/g, ' | ') : 'none',
    html: err ? err.innerHTML.slice(0, 240) : 'none',
    modalStillOpen: !!document.querySelector('#modal-form'),
    novalidate: f.hasAttribute('novalidate'),
    fields: f.querySelectorAll('[name]').length
  };
})()`);

console.log(JSON.stringify({ ask, askUnknown, form }, null, 2));
const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
writeFileSync('C:\\Users\\krish\\Downloads\\FWAI_Project\\ram-crm\\shots\\form-rejected-1440.png', Buffer.from(shot.data, 'base64'));

// 4. An active requirement must not offer "lost" in the status dropdown.
await send('Page.navigate', { url: 'http://127.0.0.1:5173/#/requirements/req-018' });
await wait(1200);
const statusOptions = await evaluate(`(() => {
  const sel = document.querySelector('#status-select');
  return sel ? [...sel.options].map(o => o.value) : 'no select';
})()`);
console.log('status options for an active requirement: ' + JSON.stringify(statusOptions));
ws.close();
process.exit(0);
