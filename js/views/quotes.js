import { badge, card, esc, section, table } from '../components.js';
import { money, num, symbolOf } from '../format.js';
import { oemById, requirementById } from '../selectors.js';
import * as store from '../store.js';

export function render(state) {
  const s = symbolOf(state.meta.currency);
  const rows = state.quotes
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((q) => {
      const r = requirementById(state, q.requirementId);
      const oemId = q.lines && q.lines[0] ? q.lines[0].oemId : null;
      const oem = oemId ? oemById(state, oemId) : null;
      return {
        cells: [
          r ? `<a href="#/requirements/${r.id}">${esc(r.ref)}</a>` : '\u2014',
          esc(r ? r.product : ''),
          `v${q.version}`,
          badge(q.state),
          esc(oem ? oem.name : '\u2014'),
          money(q.quotedTotal, s),
          `${num(q.targetMarginPct)}%`,
          q.approvedBy ? esc(q.approvedBy) : '\u2014',
          q.state === 'pending approval'
            ? `<button class="btn btn--sm" data-action="approve-quote" data-quote="${q.id}">Approve</button>`
            : '',
        ],
      };
    });

  return `
  <div class="page-head">
    <div class="eyebrow">Module 4 &middot; bid intelligence</div>
    <h1>Quotations</h1>
    <p class="page-head__lead">Every quotation comes from an RFI. Versions are kept, and an approval carries who and when. Open a requirement to see its comparables before pricing.</p>
  </div>
  ${section({
    title: `Quote register (${state.quotes.length})`,
    body: card({ body: table({ head: [
      { label: 'Requirement' }, { label: 'Product' }, { label: 'Version' }, { label: 'State' },
      { label: 'OEM' }, { label: 'Quoted', num: true }, { label: 'Margin', num: true }, { label: 'Approved by' }, { label: '' },
    ], rows, empty: 'No quotes.' }), flush: true }),
  })}
  `;
}

export function mount(state, params, root) {
  root.querySelectorAll('[data-action="approve-quote"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = store.approveQuote(btn.getAttribute('data-quote'));
      if (!res.ok) window.alert(res.errors.join('\n'));
    });
  });
}
