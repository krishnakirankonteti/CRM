import { badge, card, esc, openModal, section, table } from '../components.js';
import { fmtDate, num } from '../format.js';
import { documentStatus, oemById, requirementById } from '../selectors.js';
import * as store from '../store.js';

const TYPES = [
  'Approved item list', 'Compliance certificate', 'ISO certificate', 'PDI report',
  'MIL-STD test report', 'DGQA clearance', 'Insurance', 'Test certificate', 'Other',
];

export function render(state) {
  const enriched = state.documents.map((d) => ({ d, s: documentStatus(state, d) }));
  const counts = {
    valid: enriched.filter((x) => x.s.state === 'valid').length,
    expiring: enriched.filter((x) => x.s.state === 'expiring').length,
    expired: enriched.filter((x) => x.s.state === 'expired').length,
  };

  const rows = enriched
    .slice()
    .sort((a, b) => (a.s.days ?? 9999) - (b.s.days ?? 9999))
    .map((x) => {
      const oem = x.d.oemId ? oemById(state, x.d.oemId) : null;
      const req = x.d.requirementId ? requirementById(state, x.d.requirementId) : null;
      return {
        cells: [
          esc(x.d.title),
          esc(x.d.type),
          oem ? `<a href="#/oems/${oem.id}">${esc(oem.name)}</a>` : '\u2014',
          req ? `<a href="#/requirements/${req.id}">${esc(req.ref)}</a>` : '\u2014',
          fmtDate(x.d.issueDate),
          fmtDate(x.d.expiryDate),
          x.s.days < 0 ? badge('expired') : x.s.days <= 90 ? badge('expiring', 'warn') : badge('valid', 'ok'),
          num(x.s.days),
        ],
      };
    });

  return `
  <div class="page-head">
    <div class="eyebrow">Module 8 &middot; compliance vault</div>
    <h1>Documents and expiry</h1>
    <p class="page-head__lead">Type, supplier, issue date, expiry date, and the product and requirement it belongs to. An expired certificate is the quietest way to lose a bid, so expiry is tracked, not remembered. Approved item lists renew every three to five years.</p>
  </div>

  ${section({
    body: `<div class="grid grid--kpi">
      <div class="card kpi kpi--ok"><span class="kpi__label">Valid</span><span class="kpi__value">${counts.valid}</span></div>
      <div class="card kpi kpi--warn"><span class="kpi__label">Expiring within 90 days</span><span class="kpi__value">${counts.expiring}</span></div>
      <div class="card kpi kpi--risk"><span class="kpi__label">Expired</span><span class="kpi__value">${counts.expired}</span></div>
    </div>`,
  })}

  ${section({
    title: `Vault (${state.documents.length})`,
    actions: `<button class="btn btn--primary" data-action="new-document">Add document</button>`,
    body: card({ body: table({ head: [
      { label: 'Document' }, { label: 'Type' }, { label: 'OEM' }, { label: 'Requirement' },
      { label: 'Issued' }, { label: 'Expires' }, { label: 'Status' }, { label: 'Days', num: true },
    ], rows, empty: 'No documents.' }), flush: true }),
  })}
  `;
}

export function mount(state, params, root) {
  const btn = root.querySelector('[data-action="new-document"]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    openModal({
      title: 'Add a document',
      lead: 'An expiry date on or before the issue date is refused, and nothing is saved.',
      fields: [
        { name: 'title', label: 'Document title', type: 'text', required: true },
        { name: 'type', label: 'Type', type: 'select', required: true, options: TYPES.map((t) => ({ value: t, label: t })) },
        { name: 'oemId', label: 'OEM', type: 'select', required: false, options: [{ value: '', label: '\u2014 none \u2014' }, ...state.oems.map((o) => ({ value: o.id, label: o.name }))] },
        { name: 'requirementId', label: 'Requirement', type: 'select', required: false, options: [{ value: '', label: '\u2014 none \u2014' }, ...state.requirements.map((r) => ({ value: r.id, label: r.ref }))] },
        { name: 'issueDate', label: 'Issue date', type: 'date', required: true },
        { name: 'expiryDate', label: 'Expiry date', type: 'date', required: true },
      ],
      submitLabel: 'Add document',
      onSubmit: (values) => store.addDocument(values),
    });
  });
}
