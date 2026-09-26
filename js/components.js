export function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TONES = {
  received: 'muted', qualifying: 'info', quoted: 'info', submitted: 'warn',
  won: 'ok', lost: 'risk', cancelled: 'muted',
  approved: 'ok', 'pending approval': 'warn', draft: 'muted', rejected: 'risk',
  expired: 'risk', expiring: 'warn', valid: 'ok',
  paid: 'ok', 'part paid': 'warn', unpaid: 'risk',
  done: 'ok', active: 'info', pending: 'muted', blocked: 'risk', held: 'warn',
  failed: 'risk', passed: 'ok', scheduled: 'info', delivered: 'info',
  firm: 'ok', availability: 'warn', quote: 'info',
  won_: 'ok',
};

export function toneFor(status) {
  return TONES[status] || 'muted';
}

export function badge(text, tone) {
  const t = tone || toneFor(text);
  return `<span class="badge badge--${t}"><span class="dot"></span>${esc(text)}</span>`;
}

export function kpi({ label, value, sub, tone, id }) {
  return `<div class="card kpi ${tone ? 'kpi--' + tone : ''}" ${id ? `id="${esc(id)}"` : ''}>
    <span class="kpi__label">${esc(label)}</span>
    <span class="kpi__value">${value}</span>
    ${sub ? `<span class="kpi__sub">${sub}</span>` : ''}
  </div>`;
}

export function card({ title, hint, body, flush, id, cls }) {
  return `<section class="card ${flush ? 'card--flush' : ''} ${cls || ''}" ${id ? `id="${esc(id)}"` : ''}>
    ${title ? `<header class="card__head" ${flush ? 'style="padding:16px 18px 0;margin-bottom:0"' : ''}>
      <h3 class="card__title">${esc(title)}</h3>
      ${hint ? `<span class="card__hint">${hint}</span>` : ''}
    </header>` : ''}
    ${body}
  </section>`;
}

export function section({ eyebrow, title, lead, actions, body }) {
  return `<section class="section">
    <div class="section__head">
      <div>
        ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
        ${title ? `<h2>${esc(title)}</h2>` : ''}
        ${lead ? `<p class="section__lead">${lead}</p>` : ''}
      </div>
      ${actions ? `<div class="toolbar">${actions}</div>` : ''}
    </div>
    ${body}
  </section>`;
}

export function table({ head, rows, empty, caption }) {
  if (!rows || rows.length === 0) {
    return `<div class="table-wrap">${caption ? `<table class="data"><caption>${esc(caption)}</caption></table>` : ''}<p class="empty">${esc(empty || 'Nothing to show.')}</p></div>`;
  }
  const th = head.map((h) => `<th class="${h.num ? 'num' : ''}">${esc(h.label)}</th>`).join('');
  const tr = rows
    .map((row) => {
      const cells = row.cells
        .map((c, i) => `<td class="${head[i] && head[i].num ? 'num' : ''}">${c}</td>`)
        .join('');
      return `<tr ${row.attrs || ''}>${cells}</tr>`;
    })
    .join('');
  return `<div class="table-wrap"><table class="data">
    ${caption ? `<caption>${esc(caption)}</caption>` : ''}
    <thead><tr>${th}</tr></thead><tbody>${tr}</tbody>
  </table></div>`;
}

export function meter(value, max, tone) {
  const p = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const cls = tone === 'gap' ? 'meter--gap' : tone === 'part' ? 'meter--part' : '';
  return `<div class="meter ${cls}" role="img" aria-label="${p}%"><span style="width:${p}%"></span></div>`;
}

export function kv(pairs) {
  return `<dl class="kv">${pairs
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`)
    .join('')}</dl>`;
}

/* ---------- modal + toast (browser only; not imported by tests) ---------- */

export function toast(message, tone) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast' + (tone ? ' toast--' + tone : '');
  el.hidden = false;
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => { el.hidden = true; }, 3200);
}

function fieldHtml(f) {
  const req = f.required ? '<span class="req" aria-hidden="true">*</span>' : '';
  const base = `id="f-${esc(f.name)}" name="${esc(f.name)}" ${f.required ? 'required' : ''}`;
  let control;
  if (f.type === 'select') {
    control = `<select ${base}>${(f.options || [])
      .map((o) => `<option value="${esc(o.value)}" ${o.value === f.value ? 'selected' : ''}>${esc(o.label)}</option>`)
      .join('')}</select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea ${base} placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>`;
  } else {
    control = `<input ${base} type="${esc(f.type || 'text')}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" ${f.type === 'number' ? 'step="any"' : ''} />`;
  }
  return `<div class="field"><label for="f-${esc(f.name)}">${esc(f.label)} ${req}</label>${control}${f.hint ? `<span class="small muted">${esc(f.hint)}</span>` : ''}</div>`;
}

export function openModal({ title, lead, fields, submitLabel, onSubmit }) {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <form class="modal" id="modal-form" novalidate>
      <div class="modal__head"><h3>${esc(title)}</h3></div>
      ${lead ? `<p class="modal__lead">${esc(lead)}</p>` : ''}
      <div id="modal-errors"></div>
      ${fields.map(fieldHtml).join('')}
      <div class="modal__foot">
        <button type="button" class="btn--ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn--primary">${esc(submitLabel || 'Save')}</button>
      </div>
    </form>
  </div>`;

  const backdrop = root.querySelector('.modal-backdrop');
  const form = root.querySelector('#modal-form');
  const errorsBox = root.querySelector('#modal-errors');
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKey);
    root.innerHTML = '';
  };

  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  root.querySelector('[data-cancel]').addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    for (const f of fields) {
      const el = form.querySelector(`[name="${f.name}"]`);
      values[f.name] = el ? el.value : '';
    }
    const result = onSubmit(values);
    if (result && result.errors && result.errors.length) {
      errorsBox.innerHTML = `<div class="form-errors"><strong>Nothing was saved.</strong><ul>${result.errors
        .map((x) => `<li>${esc(x)}</li>`)
        .join('')}</ul></div>`;
      return;
    }
    close();
    if (result && result.warning) toast(result.warning, 'risk');
    else toast(result && result.message ? result.message : 'Saved.');
  });

  const first = form.querySelector('input, select, textarea');
  if (first) first.focus();
}
