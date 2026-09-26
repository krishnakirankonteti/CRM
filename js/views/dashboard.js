import { badge, card, esc, kpi, meter, section, table } from '../components.js';
import { fmtDate, money, num, symbolOf } from '../format.js';
import { capacityCollisions, coverage, dashboard, deadlineChains, fingerprintIndex, fingerprintMatches, orderExposure } from '../selectors.js';

export function render(state) {
  const s = symbolOf(state.meta.currency);
  const d = dashboard(state);
  const m = d.money;

  const riskyRows = m.riskyOrders
    .slice()
    .sort((a, b) => orderExposure(b.order, b.risk.metrics) - orderExposure(a.order, a.risk.metrics))
    .map((x) => ({
      cells: [
        `<a href="#/orders/${x.order.id}">${esc(x.order.poNumber)}</a>`,
        esc(x.order.product),
        `${num(x.risk.metrics.outstanding)} of ${num(x.metrics ? x.metrics.ordered : x.order.quantity)}`,
        fmtDate(x.order.deliveryDeadline),
        `<span class="small">${esc(x.risk.reasons[0] || 'Flagged')}</span>`,
        money(orderExposure(x.order, x.risk.metrics), s),
      ],
    }));

  const openRows = d.openOrderStates.map((x) => ({
    cells: [
      `<a href="#/orders/${x.order.id}">${esc(x.order.poNumber)}</a>`,
      esc(x.order.product),
      badge(x.order.status),
      `${num(x.metrics.delivered)} / ${num(x.metrics.ordered)}`,
      `${num(x.metrics.outstanding)}`,
      fmtDate(x.order.deliveryDeadline),
    ],
  }));

  const oemRows = d.oemPending.map((x) => ({
    cells: [
      `<a href="#/oems/${x.oem ? x.oem.id : ''}">${esc(x.oem ? x.oem.name : '\u2014')}</a>`,
      x.requirement ? `<a href="#/requirements/${x.requirement.id}">${esc(x.requirement.ref)}</a>` : '\u2014',
      fmtDate(x.request.requestedAt),
      `${x.aging} day(s)`,
      badge('pending'),
    ],
  }));

  const payRows = d.unpaidInvoices.map((i) => {
    const paid = (state.payments || []).filter((p) => p.invoiceId === i.id).reduce((a, p) => a + Number(p.amount), 0);
    return {
      cells: [
        `<a href="#/orders/${i.orderId}">${esc(i.number)}</a>`,
        money(i.amount, s),
        money(paid, s),
        `<strong>${money(i.amount - paid, s)}</strong>`,
        fmtDate(i.dueDate),
      ],
    };
  });

  const docRows = d.docsExpiring.map((x) => ({
    cells: [
      esc(x.doc.title),
      esc(x.doc.type),
      fmtDate(x.doc.expiryDate),
      x.s.days < 0 ? badge('expired') : `<span class="badge badge--${x.s.days <= 30 ? 'risk' : 'warn'}">${x.s.days} days</span>`,
    ],
  }));

  const quoteRows = d.quotesAwaiting.map((r) => {
    const cov = coverage(state, r.id);
    return {
      cells: [
        `<a href="#/requirements/${r.id}">${esc(r.ref)}</a>`,
        esc(r.agency),
        esc(r.product),
        fmtDate(r.submissionDeadline),
        `${num(cov.committed)} / ${num(cov.required)}`,
      ],
    };
  });

  const coverageGapRows = m.coverageGaps.map((x) => ({
    cells: [
      `<a href="#/requirements/${x.requirement.id}">${esc(x.requirement.ref)}</a>`,
      esc(x.requirement.agency),
      `${num(x.cov.required)}`,
      `${num(x.cov.committed)}`,
      `<strong>${num(x.cov.uncovered)}</strong>`,
      money(x.cov.uncovered * x.cov.unitValue, s),
    ],
  }));

  const caps = capacityCollisions(state);
  const chains = deadlineChains(state);
  const chainsAtBreach = chains.filter((c) => c.status === 'breach').length;
  const collisions = caps.filter((c) => c.level === 'collision').length;

  const capRows = caps.map((c) => ({
    cells: [
      `<a href="#/oems/${c.oem.id}">${esc(c.oem.name)}</a>`,
      num(c.capacity),
      num(c.committed),
      `<strong style="color:${c.remaining < 0 ? 'var(--risk)' : 'inherit'}">${num(c.remaining)}</strong>`,
      `${Math.round(c.util * 100)}%`,
      c.level === 'collision' ? badge('collision', 'risk') : badge('tight', 'warn'),
      `<span class="small muted">${c.byRequirement.map((b) => `${esc(b.ref)} ${num(b.qty)}`).join(' &middot; ')}</span>`,
    ],
  }));

  const chainRows = chains.map((c) => ({
    cells: [
      `<a href="#/orders/${c.order.id}">${esc(c.order.poNumber)}</a>`,
      c.requirement ? `<a href="#/requirements/${c.requirement.id}">${esc(c.requirement.ref)}</a>` : '\u2014',
      `<span class="small">${esc(c.binding)}</span>`,
      fmtDate(c.order.deliveryDeadline),
      fmtDate(c.metrics.expectedDelivery),
      c.slack == null ? '\u2014' : `${c.slack} d`,
      c.status === 'breach' ? badge('breach', 'risk') : c.status === 'tight' ? badge('tight', 'warn') : badge('ok', 'ok'),
    ],
  }));

  const openFingerprints = fingerprintIndex(state)
    .filter((x) => ['received', 'qualifying', 'quoted', 'submitted'].includes(x.requirement.status));
  const fpRows = openFingerprints.map((x) => {
    const matches = fingerprintMatches(state, x.requirement.id);
    const best = matches[0];
    return {
      cells: [
        `<a href="#/requirements/${x.requirement.id}">${esc(x.requirement.ref)}</a>`,
        esc(x.requirement.product),
        `<span class="mono tiny">${esc(x.fingerprint.code)}</span>`,
        num(matches.length),
        best ? `${esc(best.ref)} &middot; ${Math.round(best.score * 100)}%${best.sameCode ? ' &middot; same code' : ''}` : '\u2014',
        best ? (best.outcome === 'won' ? badge('won') : best.outcome === 'lost' ? badge('lost') : badge(best.outcome)) : '\u2014',
      ],
    };
  });

  return `
  <div class="page-head">
    <div class="eyebrow">Morning view &middot; ${fmtDate(d.asOf)}</div>
    <h1>The state of every live order, on one screen.</h1>
    <p class="page-head__lead">Everything here is computed from the records in this tool. Nothing is typed in by hand, and nothing is estimated. Read the open decisions at the bottom before you quote from these figures.</p>
  </div>

  <section class="section">
    <div class="hero">
      <div>
        <div class="hero__label">Money at risk right now</div>
        <div class="hero__figure">${money(m.total, s)}</div>
        <div class="small muted">Value still to be delivered on orders already flagged, plus the value of uncovered quantity on live requirements.</div>
      </div>
      <div class="hero__breakdown">
        <div class="hero__item"><div class="kpi__label">Flagged orders</div><div class="mono">${money(m.deliveryValue, s)}</div><div class="tiny muted">${d.atRiskCount} order(s)</div></div>
        <div class="hero__item"><div class="kpi__label">Coverage gap</div><div class="mono">${money(m.coverageGapValue, s)}</div><div class="tiny muted">${m.coverageGaps.length} requirement(s)</div></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="grid grid--kpi">
      ${kpi({ label: 'Open orders', value: num(d.openOrderCount), sub: 'not fully accepted' })}
      ${kpi({ label: 'At delivery risk', value: num(d.atRiskCount), sub: 'flagged before the client asks', tone: d.atRiskCount ? 'risk' : 'ok' })}
      ${kpi({ label: 'Quotes awaiting a response', value: num(d.quotesAwaiting.length), sub: `${d.quotesPendingApproval.length} more awaiting internal approval`, tone: 'warn' })}
      ${kpi({ label: 'Payments pending', value: money(d.paymentsPending, s), sub: `${d.unpaidInvoices.length} invoice(s)` })}
      ${kpi({ label: 'OEM responses pending', value: num(d.oemPendingCount), sub: d.oemPending[0] ? `oldest waited ${d.oemPending[0].aging} day(s)` : 'none waiting' })}
      ${kpi({ label: 'Documents expiring', value: num(d.docsExpiring.length), sub: 'within 90 days, or expired', tone: d.docsExpiring.some((x) => x.s.days < 0) ? 'risk' : 'warn' })}
      ${kpi({ label: 'Capacity collisions', value: num(collisions), sub: `${caps.length} OEM(s) at or near capacity`, tone: collisions ? 'risk' : 'warn' })}
      ${kpi({ label: 'Deadline chains at breach', value: num(chainsAtBreach), sub: `${chains.length} open chain(s)`, tone: chainsAtBreach ? 'risk' : 'ok' })}
    </div>
  </section>

  ${section({
    eyebrow: 'Cost before ticket number',
    title: 'Orders at delivery risk',
    lead: 'Expected completion is compared with the committed deadline. Sorted by the money still to be delivered.',
    body: card({ body: table({ head: [
      { label: 'PO' }, { label: 'Product' }, { label: 'Outstanding' }, { label: 'Deadline' }, { label: 'Why flagged' }, { label: 'Value at risk', num: true },
    ], rows: riskyRows, empty: 'No order is currently flagged for delivery risk.' }), flush: true }),
  })}

  ${section({
    eyebrow: 'Capacity collision warning',
    title: 'OEM capacity, committed against the ceiling',
    lead: 'Firm commitments summed across every requirement, against the booked-window capacity of each OEM. A collision means the same OEM has been committed beyond what it can supply. Advisory, pending the client answer on C-10.',
    body: card({ body: table({ head: [
      { label: 'OEM' }, { label: 'Capacity', num: true }, { label: 'Committed', num: true }, { label: 'Remaining', num: true },
      { label: 'Used', num: true }, { label: 'Level' }, { label: 'Committed on' },
    ], rows: capRows, empty: 'No OEM is at or beyond capacity.' }), flush: true }),
  })}

  ${section({
    eyebrow: 'Deadline chain',
    title: 'Every open order, its binding deadline and its slack',
    lead: 'The dependent dates behind each order. The binding constraint is named, so a slip is visible before the agency asks. Sorted worst first.',
    body: card({ body: table({ head: [
      { label: 'PO' }, { label: 'Requirement' }, { label: 'Binding constraint' }, { label: 'Committed' },
      { label: 'Expected' }, { label: 'Slack', num: true }, { label: 'Chain' },
    ], rows: chainRows, empty: 'No open deadline chains.' }), flush: true }),
  })}

  ${section({
    eyebrow: 'Requirement fingerprinting',
    title: 'Open requirements and whether we have seen them before',
    lead: 'A short signature per requirement: category, agency, quantity band and governing standard. Where a prior requirement shares it, the past outcome is one click away.',
    body: card({ body: table({ head: [
      { label: 'Requirement' }, { label: 'Product' }, { label: 'Fingerprint' }, { label: 'Matches', num: true },
      { label: 'Closest match' }, { label: 'Outcome' },
    ], rows: fpRows, empty: 'No open requirements to fingerprint.' }), flush: true }),
  })}

  ${section({
    title: 'Open orders and their state',
    lead: 'Every order not yet fully accepted, with what has actually moved.',
    body: card({ body: table({ head: [
      { label: 'PO' }, { label: 'Product' }, { label: 'State' }, { label: 'Delivered' }, { label: 'Outstanding' }, { label: 'Deadline' },
    ], rows: openRows, empty: 'No open orders.' }), flush: true }),
  })}

  ${section({
    title: 'Quotes awaiting a response',
    lead: 'Submitted to the agency and still open. Coverage is shown beside each so a short bid is visible.',
    body: card({ body: table({ head: [
      { label: 'Requirement' }, { label: 'Agency' }, { label: 'Product' }, { label: 'Submission deadline' }, { label: 'Committed / required' },
    ], rows: quoteRows, empty: 'Nothing is awaiting a response.' }), flush: true }),
  })}

  ${section({
    title: 'Quantity still uncovered',
    lead: 'Required minus firm OEM commitments, on every live requirement. Availability indications are not counted.',
    body: card({ body: table({ head: [
      { label: 'Requirement' }, { label: 'Agency' }, { label: 'Required', num: true }, { label: 'Committed', num: true }, { label: 'Uncovered', num: true }, { label: 'Value', num: true },
    ], rows: coverageGapRows, empty: 'Every live requirement is fully covered by firm commitments.' }), flush: true }),
  })}

  ${section({
    title: 'Payments pending',
    body: card({ body: table({ head: [
      { label: 'Invoice' }, { label: 'Amount', num: true }, { label: 'Paid', num: true }, { label: 'Outstanding', num: true }, { label: 'Due' },
    ], rows: payRows, empty: 'No outstanding invoices.' }), flush: true }),
  })}

  ${section({
    title: 'OEM responses pending',
    lead: 'Every request carries an age, because a 1 to 10 day spread is where the schedule is lost.',
    body: card({ body: table({ head: [
      { label: 'OEM' }, { label: 'Requirement' }, { label: 'Requested' }, { label: 'Waiting' }, { label: 'Status' },
    ], rows: oemRows, empty: 'No pending OEM requests.' }), flush: true }),
  })}

  ${section({
    title: 'Documents expiring',
    lead: 'Expiry is tracked because an expired certificate stops a bid or a dispatch.',
    body: card({ body: table({ head: [
      { label: 'Document' }, { label: 'Type' }, { label: 'Expiry' }, { label: 'Window' },
    ], rows: docRows, empty: 'No document expires within 90 days.' }), flush: true }),
  })}

  ${section({
    eyebrow: 'Honesty, not silent assumptions',
    title: 'Open decisions still visible on this screen',
    body: `<div class="grid grid--2">
      ${card({ title: 'Currency and jurisdiction are undecided (C-02)', body: `<p class="small">Figures are shown in <strong>${esc(state.meta.currency)}</strong>. The requirement document never states a currency, and the idea line mentioned Dirhams. Switch it in the header; nothing else changes, because every figure is derived from records.</p>` })}
      ${card({ title: 'OEM capacity: global or per order? (C-10)', body: `<p class="small">Coverage here is counted per requirement. Global capacity across all orders is also computable and differs. This screen does not decide it. Confirm which reading is correct before committing quantity.</p>` })}
      ${card({ title: 'Commission timing is unresolved (C-11)', body: `<p class="small">Commission is shown against the milestone "OEM payment received", but who invoices whom and who pays the OEM is unconfirmed. The figure is a record, not a settled entitlement.</p>` })}
      ${card({ title: 'Automatic means a task, not a message (C-03)', body: `<p class="small">Follow-ups create work for a person. The tool never sends a message to an agency or an OEM.</p>` })}
    </div>`,
  })}
  `;
}

export function mount() {}
