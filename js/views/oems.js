import { badge, card, esc, kv, meter, section, table } from '../components.js';
import { fmtDate, money, num, symbolOf } from '../format.js';
import { oemById, oemStats, requirementById } from '../selectors.js';

export function render(state, params) {
  if (params && params.id) return detail(state, params.id);
  return list(state);
}

function list(state) {
  const s = symbolOf(state.meta.currency);
  const rows = state.oems.map((o) => {
    const st = oemStats(state, o.id);
    return {
      attrs: 'class="row-link" data-href="#/oems/' + o.id + '"',
      cells: [
        `<a href="#/oems/${o.id}">${esc(o.name)}</a>`,
        esc(o.city),
        o.approved ? badge('approved', 'ok') : badge('not approved', 'warn'),
        esc(o.products[0] || ''),
        `${o.leadTimeDays} d`,
        num(st.committedQty),
        num(st.orders.length),
        money(st.orderValue, s),
        st.pending.length ? badge(st.pending.length + ' pending', 'warn') : '\u2014',
      ],
    };
  });
  return `
  <div class="page-head">
    <div class="eyebrow">Module 2 &middot; sourcing</div>
    <h1>OEM master</h1>
    <p class="page-head__lead">Who can make it, at what price and lead time, with what compliance, and how they performed. Firm commitments are counted as coverage; availability is not.</p>
  </div>
  ${section({
    title: `OEM network (${state.oems.length})`,
    body: card({ body: table({ head: [
      { label: 'OEM' }, { label: 'City' }, { label: 'Approval' }, { label: 'Main product' }, { label: 'Lead' },
      { label: 'Firm committed', num: true }, { label: 'Orders', num: true }, { label: 'PO value', num: true }, { label: 'Requests' },
    ], rows, empty: 'No OEMs recorded.' }), flush: true }),
  })}
  `;
}

function detail(state, id) {
  const s = symbolOf(state.meta.currency);
  const o = oemById(state, id);
  if (!o) return `<p class="empty">No OEM with that id.</p>`;
  const st = oemStats(state, id);
  const responses = state.oemRequests.filter((q) => q.oemId === id);

  const responseRows = responses.map((q) => {
    const r = requirementById(state, q.requirementId);
    return {
      cells: [
        r ? `<a href="#/requirements/${r.id}">${esc(r.ref)}</a>` : '\u2014',
        esc(r ? r.product : ''),
        badge(q.type),
        q.qty ? num(q.qty) : '\u2014',
        q.unitPrice ? money(q.unitPrice, s) : '\u2014',
        q.status === 'pending' ? badge('pending') : badge('responded', 'ok'),
      ],
    };
  });

  const orderRows = st.orders.map((o2) => ({
    cells: [
      `<a href="#/orders/${o2.id}">${esc(o2.poNumber)}</a>`,
      esc(o2.product),
      num(o2.quantity),
      money(o2.price, s),
      fmtDate(o2.deliveryDeadline),
      badge(o2.status),
    ],
  }));

  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/oems">&larr; All OEMs</a></div>
    <h1>${esc(o.name)}</h1>
    <div class="inline" style="margin-top:8px">${o.approved ? badge('approved', 'ok') : badge('not approved', 'warn')} <span class="muted">${esc(o.city)}</span></div>
  </div>
  ${section({
    title: 'Profile',
    body: `<div class="grid grid--2">
      ${card({ title: 'Capabilities', body: `<div class="chips">${o.capabilities.map((c) => `<span class="badge badge--info">${esc(c)}</span>`).join('')}</div><p class="small muted" style="margin-top:12px">Typical lead time ${o.leadTimeDays} days. Price band ${esc(o.priceBand)}.</p>` })}
      ${card({ title: 'Compliance documents', body: `<div class="chips">${o.complianceDocs.map((c) => `<span class="badge">${esc(c)}</span>`).join('')}</div>` })}
      ${card({ title: 'Contacts', body: o.contacts.map((c) => `<div class="small"><strong>${esc(c.name)}</strong><br><span class="muted">${esc(c.email)} &middot; ${esc(c.phone)}</span></div>`).join('<hr style="border:none;border-top:1px solid var(--line);margin:10px 0">') })}
      ${card({ title: 'Past performance', body: o.pastPerformance.map((p) => `<div class="between"><span class="small">${esc(p.summary)}</span><span class="small muted">${p.orders} orders &middot; ${p.onTimePct}% on time</span></div>`).join('<hr style="border:none;border-top:1px solid var(--line);margin:10px 0">') })}
    </div>`,
  })}
  ${section({
    title: 'Commitment and trade',
    body: `<div class="grid grid--3">
      ${card({ title: 'Firm quantity committed', body: `<div class="kpi__value">${num(st.committedQty)}</div><div class="small muted">${money(st.committedValue, s)}</div>` })}
      ${card({ title: 'Orders placed', body: `<div class="kpi__value">${num(st.orders.length)}</div><div class="small muted">${money(st.orderValue, s)}</div>` })}
      ${card({ title: 'Average lead time', body: `<div class="kpi__value">${st.avgLeadTime} d</div><div class="small muted">from firm responses</div>` })}
    </div>`,
  })}
  ${section({ title: 'Requests and responses', body: card({ body: table({ head: [
    { label: 'Requirement' }, { label: 'Product' }, { label: 'Type' }, { label: 'Qty', num: true }, { label: 'Price', num: true }, { label: 'Status' },
  ], rows: responseRows, empty: 'No requests recorded.' }), flush: true }) })}
  ${section({ title: 'Orders placed with this OEM', body: card({ body: table({ head: [
    { label: 'PO' }, { label: 'Product' }, { label: 'Qty', num: true }, { label: 'Value', num: true }, { label: 'Deadline' }, { label: 'Status' },
  ], rows: orderRows, empty: 'No orders placed.' }), flush: true }) })}
  `;
}

export function mount() {}
