import { badge, card, esc, kv, meter, openModal, section, table } from '../components.js';
import { fmtDate, money, num, symbolOf, todayISO } from '../format.js';
import { deliveryRisk, oemById, orderById, orderMetrics, requirementById } from '../selectors.js';
import * as store from '../store.js';

export function render(state, params) {
  if (params && params.id) return detail(state, params.id);
  return list(state);
}

function riskBadge(state, order) {
  const r = deliveryRisk(state, order);
  return r.atRisk ? badge('at risk', 'risk') : badge('on track', 'ok');
}

function list(state) {
  const s = symbolOf(state.meta.currency);
  const rows = state.orders.map((o) => {
    const m = orderMetrics(state, o);
    return {
      cells: [
        `<a href="#/orders/${o.id}">${esc(o.poNumber)}</a>`,
        esc(o.product),
        num(o.quantity),
        `${num(m.delivered)}`,
        m.outstanding ? `<strong>${num(m.outstanding)}</strong>` : '0',
        money(o.price, s),
        fmtDate(o.deliveryDeadline),
        badge(o.status),
        riskBadge(state, o),
      ],
    };
  });
  return `
  <div class="page-head">
    <div class="eyebrow">Module 6 &middot; order and PO</div>
    <h1>Orders and POs</h1>
    <p class="page-head__lead">No orphan PO: every PO maps to an approved quotation, and the whole history travels with it. Partial delivery is normal, and the outstanding balance stays visible.</p>
  </div>
  ${section({
    title: `Orders (${state.orders.length})`,
    body: card({ body: table({ head: [
      { label: 'PO' }, { label: 'Product' }, { label: 'Ordered', num: true }, { label: 'Delivered', num: true },
      { label: 'Outstanding', num: true }, { label: 'Value', num: true }, { label: 'Deadline' }, { label: 'State' }, { label: 'Risk' },
    ], rows, empty: 'No orders.' }), flush: true }),
  })}
  `;
}

function detail(state, id) {
  const s = symbolOf(state.meta.currency);
  const o = orderById(state, id);
  if (!o) return `<p class="empty">No order with that id.</p>`;
  const m = orderMetrics(state, o);
  const risk = deliveryRisk(state, o);
  const r = requirementById(state, o.requirementId);
  const oem = oemById(state, o.oemId);
  const commission = state.commissions.filter((c) => c.orderId === o.id);

  const deliveryRows = state.deliveries.filter((d) => d.orderId === o.id).map((d) => ({
    cells: [
      d.invoiceId ? esc(d.invoiceId) : '\u2014',
      num(d.qty),
      fmtDate(d.deliveredAt),
      d.acceptedAt ? fmtDate(d.acceptedAt) : badge('not yet accepted', 'warn'),
      badge(d.status),
      d.acceptedAt ? '' : `<button class="btn btn--sm" data-action="accept" data-delivery="${d.id}">Mark accepted</button>`,
    ],
  }));

  const invoiceRows = m.invoices.map((i) => {
    const paid = state.payments.filter((p) => p.invoiceId === i.id).reduce((a, p) => a + Number(p.amount), 0);
    return {
      cells: [esc(i.number), money(i.amount, s), money(paid, s), `<strong>${money(i.amount - paid, s)}</strong>`, fmtDate(i.dueDate), badge(i.status)],
    };
  });

  const pdi = m.pdi;
  const timeline = m.steps.map((st) => {
    const cls = st.status === 'done' ? 'is-done' : st.status === 'active' ? 'is-active'
      : st.status === 'blocked' ? 'is-blocked' : st.status === 'held' ? 'is-held' : '';
    return `<li class="${cls}">
      <div class="between"><span class="timeline__title">${esc(st.step)}</span>${badge(st.status)}</div>
      <div class="timeline__meta">Owner ${esc(st.owner)} &middot; expected ${fmtDate(st.expectedDate)}${st.actualDate ? ` &middot; actual ${fmtDate(st.actualDate)}` : ''}</div>
    </li>`;
  }).join('');

  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/orders">&larr; All orders</a> &middot; ${esc(o.poNumber)}</div>
    <h1>${esc(o.product)}</h1>
    <div class="inline" style="margin-top:8px">${badge(o.status)} ${riskBadge(state, o)}
      ${r ? `<span class="muted">from <a href="#/requirements/${r.id}">${esc(r.ref)}</a></span>` : ''}</div>
    ${risk.atRisk ? `<div class="callout callout--risk small" style="margin-top:14px"><strong>Delivery risk.</strong> ${risk.reasons.map(esc).join(' ')}</div>` : ''}
  </div>

  ${section({
    title: 'Order record',
    body: `<div class="grid grid--2">
      ${card({ title: 'Terms', body: kv([
        ['PO date', fmtDate(o.poDate)],
        ['Delivery deadline', fmtDate(o.deliveryDeadline)],
        ['Expected delivery', fmtDate(m.expectedDelivery)],
        ['Quantity', num(o.quantity)],
        ['Unit price', money(o.unitPrice, s)],
        ['Order value', money(o.price, s)],
      ]) })}
      ${card({ title: 'Sourcing', body: kv([
        ['OEM', oem ? `<a href="#/oems/${oem.id}">${esc(oem.name)}</a>` : '\u2014'],
        ['Supplier PO', esc(o.supplierPo)],
        ['Compliance', esc(o.compliance)],
        ['Government inspection', o.inspectionRequired ? 'Required' : 'Not required'],
        ['PDI', o.pdiRequired ? 'Required' : 'Not required'],
        ['Approved quote', o.quoteId ? esc(o.quoteId) : '\u2014'],
      ]) })}
    </div>`,
  })}

  ${section({
    eyebrow: 'Module 7 \u00B7 fulfilment',
    title: 'PDI, delivery and payment balances',
    lead: 'PDI cleared is a distinct number from offered and rejected. A failed or held PDI blocks dispatch.',
    body: `<div class="grid grid--2">
      ${card({ title: 'PDI', body: `
        <div class="grid grid--3">
          <div><div class="kpi__label">Offered</div><div class="kpi__value">${num(pdi.offered)}</div></div>
          <div><div class="kpi__label">Cleared</div><div class="kpi__value" style="color:var(--ok)">${num(pdi.cleared)}</div></div>
          <div><div class="kpi__label">Rejected</div><div class="kpi__value" style="color:${pdi.rejected ? 'var(--risk)' : 'inherit'}">${num(pdi.rejected)}</div></div>
        </div>
        <div style="margin-top:12px">${badge(pdi.latest ? pdi.latest.status : 'scheduled', undefined)}</div>
        <p class="small muted" style="margin-top:10px">${esc(pdi.latest ? pdi.latest.notes : 'No PDI event recorded yet.')}</p>
        ${pdi.latest && pdi.latest.status === 'failed' ? '<div class="callout callout--risk small" style="margin-top:10px"><strong>Dispatch blocked.</strong> The lot was rejected; it must be re-offered and cleared before dispatch.</div>' : ''}
      ` })}
      ${card({ title: 'Delivery and payment', body: `
        <div class="between small"><span>Delivered ${num(m.delivered)} of ${num(m.ordered)}</span><span class="mono">outstanding ${num(m.outstanding)}</span></div>
        <div style="margin:8px 0 16px">${meter(m.delivered, m.ordered, m.outstanding ? 'part' : '')}</div>
        <div class="between small"><span>Invoiced ${money(m.invoiced, s)} of ${money(o.price, s)}</span><span class="mono">unpaid ${money(m.outstandingPayment, s)}</span></div>
        <div style="margin-top:8px">${meter(m.paid, m.invoiced || 1, m.outstandingPayment ? 'part' : '')}</div>
        <p class="small muted" style="margin-top:10px">Accepted quantity ${num(m.accepted)} of ${num(m.ordered)}. Partial delivery and partial payment are treated as normal.</p>
      ` })}
    </div>`,
  })}

  ${section({ title: 'Deliveries', body: card({ body: table({ head: [
    { label: 'Invoice' }, { label: 'Qty', num: true }, { label: 'Delivered' }, { label: 'Accepted' }, { label: 'Status' }, { label: '' },
  ], rows: deliveryRows, empty: 'Nothing delivered yet.' }), flush: true }) })}

  ${section({ title: 'Invoices against this PO', body: card({ body: table({ head: [
    { label: 'Invoice' }, { label: 'Amount', num: true }, { label: 'Paid', num: true }, { label: 'Outstanding', num: true }, { label: 'Due' }, { label: 'Status' },
  ], rows: invoiceRows, empty: 'No invoices raised.' }), flush: true }) })}

  ${section({
    title: 'Fulfilment timeline',
    lead: 'Each step has an owner and an expected date. This is the record a client is answered from.',
    body: card({ body: `<ul class="timeline">${timeline || '<li>No steps recorded.</li>'}</ul>` }),
  })}

  ${section({ title: 'Commission', body: card({ body: table({ head: [
    { label: 'Milestone' }, { label: 'Amount', num: true }, { label: 'Status' }, { label: 'Earned' },
  ], rows: commission.map((c) => ({ cells: [esc(c.milestone), money(c.amount, s), badge(c.status), c.earnedAt ? fmtDate(c.earnedAt) : '\u2014'] })), empty: 'No commission recorded for this order.' }), flush: true }) })}
  `;
}

export function mount(state, params, root) {
  root.querySelectorAll('[data-action="accept"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal({
        title: 'Record acceptance',
        lead: 'An order stays open until its deliveries are accepted. Acceptance cannot fall before the delivery date, and a blank date saves nothing.',
        fields: [
          { name: 'acceptedAt', label: 'Acceptance date', type: 'date', required: true, value: todayISO() },
        ],
        submitLabel: 'Record acceptance',
        onSubmit: (values) => store.recordAcceptance({
          deliveryId: btn.getAttribute('data-delivery'),
          acceptedAt: values.acceptedAt,
        }),
      });
    });
  });
}
