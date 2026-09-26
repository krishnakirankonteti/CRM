import { badge, card, esc, section, table } from '../components.js';
import { fmtDate, money, num, symbolOf } from '../format.js';
import { coverage, lossBreakdown } from '../selectors.js';

export function render(state) {
  const s = symbolOf(state.meta.currency);
  const breakdown = lossBreakdown(state);

  const rows = state.requirements.map((r) => {
    const c = coverage(state, r.id);
    const search = [r.ref, r.agency, r.product, r.category, r.specs, r.oemName, r.lossReason]
      .filter(Boolean).join(' ').toLowerCase();
    return {
      attrs: `class="row-link" data-href="#/requirements/${r.id}" data-search="${esc(search)}"`,
      cells: [
        `<a href="#/requirements/${r.id}">${esc(r.ref)}</a>`,
        esc(r.agency),
        esc(r.product),
        esc(r.category),
        badge(r.status),
        `${num(c.committed)} / ${num(c.required)}`,
        money(r.quotedTotal, s),
        r.status === 'lost' ? esc(r.lossReason || 'Unrecorded') : '\u2014',
        fmtDate(r.decisionAt || r.createdAt),
      ],
    };
  });

  const categories = {};
  for (const r of state.requirements) {
    if (!categories[r.category]) categories[r.category] = { cat: r.category, total: 0, won: 0, lost: 0, open: 0, value: 0 };
    const g = categories[r.category];
    g.total += 1;
    g.value += Number(r.quotedTotal || 0);
    if (r.status === 'won') g.won += 1;
    else if (r.status === 'lost') g.lost += 1;
    else g.open += 1;
  }

  return `
  <div class="page-head">
    <div class="eyebrow">Module 9 &middot; memory</div>
    <h1>Search, history and losses</h1>
    <p class="page-head__lead">Every past requirement, searchable, so a new quote does not start from scratch. Losses carry a structured reason, so "why did we lose?" is a query, not a memory.</p>
  </div>

  ${section({
    title: 'Search all history',
    lead: 'Filter by reference, agency, product, category or specification.',
    body: card({ body: `
      <div class="field" style="max-width:520px">
        <label for="history-search">Search</label>
        <input id="history-search" type="search" placeholder="e.g. connectors, Navy, REQ-2024" autocomplete="off" />
      </div>
      <div id="history-empty" class="empty" hidden>No requirement matches that search. Nothing is invented to fill the gap.</div>
      <div id="history-table">
      ${table({ head: [
        { label: 'Reference' }, { label: 'Agency' }, { label: 'Product' }, { label: 'Category' }, { label: 'Status' },
        { label: 'Coverage' }, { label: 'Quoted', num: true }, { label: 'Loss reason' }, { label: 'Last decision' },
      ], rows, empty: 'No requirements.' })}
      </div>
    ` }),
  })}

  ${section({
    title: 'Structured losses',
    lead: 'The labels are the client\'s starting list, to be confirmed against the words he actually uses.',
    body: `<div class="grid grid--3">
      ${breakdown.map((b) => card({
        title: b.reason,
        hint: `${b.count} lost`,
        body: `<div class="mono" style="font-size:1.3rem">${money(b.value, s)}</div>
          <ul class="small muted" style="margin:8px 0 0;padding-left:16px">
            ${b.notes.map((n) => `<li>${esc(n.ref)}: ${esc(n.note)}</li>`).join('') || '<li>No note recorded.</li>'}
          </ul>`,
      })).join('') || '<p class="empty">No losses recorded.</p>'}
    </div>`,
  })}

  ${section({
    title: 'By category',
    lead: 'The shape a comparable search works on: same category, and what happened last time.',
    body: card({ body: table({ head: [
      { label: 'Category' }, { label: 'Requirements', num: true }, { label: 'Won', num: true }, { label: 'Lost', num: true },
      { label: 'Still open', num: true }, { label: 'Quoted value', num: true },
    ], rows: Object.values(categories).map((g) => ({ cells: [esc(g.cat), num(g.total), num(g.won), num(g.lost), num(g.open), money(g.value, s)] })), empty: 'No categories.' }), flush: true }),
  })}
  `;
}

export function mount(state, params, root) {
  const input = root.querySelector('#history-search');
  const empty = root.querySelector('#history-empty');
  const wrap = root.querySelector('#history-table');
  if (!input || !wrap) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    wrap.querySelectorAll('tbody tr').forEach((tr) => {
      const hay = tr.getAttribute('data-search') || '';
      const match = !q || hay.includes(q);
      tr.hidden = !match;
      if (match) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  });
}
