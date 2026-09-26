import { badge, card, esc, kv, meter, openModal, section, table } from '../components.js';
import { LOSS_REASONS, RESPONSE_TYPES } from '../data.js';
import { fmtDate, money, num, symbolOf } from '../format.js';
import {
  comparables, coverage, fingerprintMatches, fingerprintOf, latestQuote, oemById, oemCommittedTo,
  quotesFor, requirementById, requestsFor,
} from '../selectors.js';
import * as store from '../store.js';

export function render(state, params) {
  if (params && params.id) return detail(state, params.id);
  return list(state);
}

function list(state) {
  const s = symbolOf(state.meta.currency);
  const rows = state.requirements.map((r) => {
    const c = coverage(state, r.id);
    return {
      attrs: 'class="row-link" data-href="#/requirements/' + r.id + '"',
      cells: [
        `<a href="#/requirements/${r.id}">${esc(r.ref)}</a>`,
        esc(r.agency),
        esc(r.product),
        num(r.quantity),
        badge(r.status),
        `${num(c.committed)} / ${num(c.required)}${c.uncovered ? ` <span class="badge badge--risk">gap ${num(c.uncovered)}</span>` : ''}`,
        fmtDate(r.submissionDeadline),
        esc(r.owner),
      ],
    };
  });

  return `
  <div class="page-head">
    <div class="eyebrow">Module 1 &middot; the central record</div>
    <h1>Requirements and RFIs</h1>
    <p class="page-head__lead">One requirement, one record, one timeline. Everything else in this tool hangs off a row here. Use "New requirement" to add one; blank required fields are refused and nothing is saved.</p>
  </div>
  ${section({
    title: `All requirements (${state.requirements.length})`,
    actions: `<button class="btn btn--primary" data-action="new-requirement">New requirement</button>`,
    body: card({ body: table({ head: [
      { label: 'Reference' }, { label: 'Agency' }, { label: 'Product' }, { label: 'Qty', num: true },
      { label: 'Status' }, { label: 'Coverage' }, { label: 'Submission' }, { label: 'Owner' },
    ], rows, empty: 'No requirements yet.' }), flush: true }),
  })}
  `;
}

function detail(state, id) {
  const s = symbolOf(state.meta.currency);
  const r = requirementById(state, id);
  if (!r) return `<p class="empty">No requirement with that reference.</p>`;

  const c = coverage(state, r.id);
  const reqs = requestsFor(state, r.id);
  const quote = latestQuote(state, r.id);
  const history = quotesFor(state, r.id);
  const comps = comparables(state, r.id);
  const fp = fingerprintOf(r);
  const fpMatches = fingerprintMatches(state, r.id);
  const linkedDocs = state.documents.filter((d) => d.requirementId === r.id);
  const linkedOrders = state.orders.filter((o) => o.requirementId === r.id);

  const requestRows = reqs.map((q) => {
    const oem = oemById(state, q.oemId);
    const capacity = oemCommittedTo(state, q.oemId, r.id);
    return {
      cells: [
        oem ? `<a href="#/oems/${oem.id}">${esc(oem.name)}</a>` : '\u2014',
        badge(q.type),
        q.qty ? num(q.qty) : '\u2014',
        q.unitPrice ? money(q.unitPrice, s) : '\u2014',
        q.leadTimeDays ? `${q.leadTimeDays} d` : '\u2014',
        q.status === 'pending' ? badge('pending') : `<span class="small">${fmtDate(q.respondedAt)}</span>`,
        `<span class="small muted">${esc(q.notes || '')}${q.type === 'firm' ? ` Global firm for this OEM: ${num(capacity.global)}.` : ''}</span>`,
      ],
    };
  });

  const lineRows = (r.lineItems || []).map((li) => ({
    cells: [esc(li.partNo), esc(li.description), num(li.qty), esc(li.unit || ''), money(li.unitPrice, s)],
  }));

  const compRows = comps.map((x) => ({
    cells: [
      `<a href="#/requirements/${x.requirementId}">${esc(x.ref)}</a>`,
      esc(x.product),
      esc(x.oemName),
      money(x.quotedTotal, s),
      x.outcome === 'won' ? badge('won') : badge('lost'),
      x.outcome === 'won' ? '\u2014' : (x.winningPrice ? money(x.winningPrice, s) : 'not recorded'),
      esc(x.lossReason || ''),
    ],
  }));

  const historyRows = history.map((q) => ({
    cells: [
      `v${q.version}`,
      badge(q.state),
      money(q.quotedTotal, s),
      `${num(q.targetMarginPct)}%`,
      q.approvedBy ? esc(q.approvedBy) : '\u2014',
      fmtDate(q.approvedAt || q.createdAt),
      q.state === 'pending approval' ? `<button class="btn btn--sm" data-action="approve-quote" data-quote="${q.id}">Approve</button>` : '',
    ],
  }));

  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/requirements">&larr; All requirements</a> &middot; ${esc(r.ref)}</div>
    <h1>${esc(r.product)}</h1>
    <div class="inline" style="margin-top:8px">
      ${badge(r.status)} <span class="muted">${esc(r.agency)}</span> <span class="muted">&middot;</span>
      <span class="muted">Owner ${esc(r.owner)}</span>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <label class="small muted" for="status-select">Set status</label>
      <select id="status-select" style="width:auto;min-width:170px">
        ${['received', 'qualifying', 'quoted', 'submitted', 'won', ...(r.status === 'lost' ? ['lost'] : []), 'cancelled']
          .map((x) => `<option value="${x}" ${x === r.status ? 'selected' : ''}>${x}</option>`).join('')}
      </select>
      <button class="btn" data-action="apply-status">Apply</button>
      <button class="btn" data-action="oem-response">Log OEM response</button>
      ${r.status !== 'lost' ? `<button class="btn" data-action="loss">Record loss</button>` : ''}
    </div>
  </div>

  ${section({
    title: 'The record',
    body: `<div class="grid grid--2">
      ${card({ title: 'Details', body: kv([
        ['Category', esc(r.category)],
        ['Quantity', `${num(r.quantity)} ${esc(r.unit || '')}`],
        ['Submission deadline', fmtDate(r.submissionDeadline)],
        ['Required delivery', fmtDate(r.requiredDeliveryDate)],
        ['Quoted total', money(r.quotedTotal, s)],
        ['Target margin', `${num(r.targetMarginPct)}%`],
        ['Created', fmtDate(r.createdAt)],
        ['Decision', r.decisionAt ? fmtDate(r.decisionAt) : '\u2014'],
      ]) + `<p class="small muted" style="margin-top:12px">${esc(r.specs || '')}</p>` })}
      ${card({ title: 'Loss record', body: r.status === 'lost'
        ? kv([['Structured reason', badge(r.lossReason || 'Unrecorded')], ['Note', esc(r.lossNote || '\u2014')]])
        : `<p class="small muted">Not a loss. When an opportunity is lost, a structured reason is required before anything is saved.</p>` })}
    </div>`,
  })}

  ${section({
    eyebrow: 'Module 3 \u00B7 the hard part',
    title: 'Quantity coverage',
    lead: 'Required against firm OEM commitment, with the uncovered balance. Availability and quote indications are shown but never counted as covered.',
    body: card({ body: `
      <div class="grid grid--3" style="margin-bottom:16px">
        ${card({ title: 'Required', body: `<div class="kpi__value">${num(c.required)}</div>` })}
        ${card({ title: 'Committed (firm)', body: `<div class="kpi__value" style="color:var(--ok)">${num(c.committed)}</div>` })}
        ${card({ title: 'Uncovered', body: `<div class="kpi__value" style="color:${c.uncovered ? 'var(--risk)' : 'var(--ok)'}">${num(c.uncovered)}</div>` })}
      </div>
      ${meter(c.committed, c.required, c.uncovered ? 'part' : '')}
      <p class="small muted" style="margin-top:10px">
        Coverage ${Math.round(c.coveredPct * 100)}%. Indications on the table below total ${num(c.availability)} and are excluded from the commitment.
        ${c.uncovered ? '<strong> Committing to this requirement at the current coverage would commit quantity the OEMs have not confirmed.</strong>' : ''}
      </p>
      <div class="callout callout--info small" style="margin-top:12px">
        <strong>Open decision C-10.</strong> This coverage is counted per requirement. If capacity is meant to be global, the same OEM's commitments across all orders reduce what is available here. Confirm which reading is correct; the screen does not choose.
      </div>
    ` }),
  })}

  ${section({
    title: 'Line items',
    lead: `${(r.lineItems || []).length} line item(s). The record carries a list, not one giant text field.`,
    body: card({ body: table({ head: [
      { label: 'Part number' }, { label: 'Description' }, { label: 'Qty', num: true }, { label: 'Unit' }, { label: 'Unit price', num: true },
    ], rows: lineRows, empty: 'No line items recorded.' }), flush: true }),
  })}

  ${section({
    title: 'OEM sourcing requests',
    body: card({ body: table({ head: [
      { label: 'OEM' }, { label: 'Type' }, { label: 'Qty', num: true }, { label: 'Unit price', num: true }, { label: 'Lead' }, { label: 'Responded' }, { label: 'Notes' },
    ], rows: requestRows, empty: 'No OEM requests yet.' }), flush: true }),
  })}

  ${section({
    eyebrow: 'Fingerprint',
    title: 'What this requirement looks like, and what it looked like before',
    lead: 'A stable signature from category, agency, quantity band and governing standard. Two requirements sharing a code are the same shape of job, even when the tender wording differs.',
    body: card({ body: `
      <div class="between" style="flex-wrap:wrap;gap:12px;margin-bottom:14px">
        <div><div class="kpi__label">Fingerprint code</div><div class="mono" style="font-size:1.15rem">${esc(fp.code)}</div></div>
        <div class="chips">
          <span class="badge badge--info">${esc(fp.parts.category || 'Uncategorised')}</span>
          <span class="badge">${esc(fp.parts.agency || 'Unknown agency')}</span>
          <span class="badge">qty band ${esc(fp.parts.band)}</span>
          ${fp.parts.standards.map((x) => `<span class="badge badge--muted">${esc(x)}</span>`).join('')}
        </div>
      </div>
      ${table({ head: [
        { label: 'Prior requirement' }, { label: 'Product' }, { label: 'Match' }, { label: 'Same code' }, { label: 'Outcome' }, { label: 'Quoted', num: true }, { label: 'Winning', num: true },
      ], rows: fpMatches.map((m) => ({
        cells: [
          `<a href="#/requirements/${m.requirementId}">${esc(m.ref)}</a>`,
          esc(m.product),
          `${Math.round(m.score * 100)}%`,
          m.sameCode ? badge('yes', 'ok') : badge('near', 'muted'),
          m.outcome === 'won' ? badge('won') : m.outcome === 'lost' ? badge('lost') : badge(m.outcome),
          m.quotedTotal != null ? money(m.quotedTotal, s) : '\u2014',
          m.outcome === 'lost' && m.winningPrice ? money(m.winningPrice, s) : '\u2014',
        ],
      })), empty: 'No similar requirement on record yet.' })}
    ` }),
  })}

  ${section({
    eyebrow: 'Module 4 &middot; history before pricing',
    title: 'Comparable past bids',
    lead: 'Same category, won or lost, shown before any price is set. This is what replaces starting from scratch.',
    body: card({ body: table({ head: [
      { label: 'Reference' }, { label: 'Product' }, { label: 'OEM' }, { label: 'Quoted', num: true }, { label: 'Outcome' }, { label: 'Winning / lost price', num: true }, { label: 'Reason' },
    ], rows: compRows, empty: 'No comparable bids on record for this category.' }), flush: true }),
  })}

  ${section({
    title: 'Quotation',
    body: card({ body: `
      ${quote ? `<div class="between" style="margin-bottom:12px"><div>${badge(quote.state)} <span class="muted small">current version v${quote.version}</span></div><div class="mono">${money(quote.quotedTotal, s)}</div></div>` : '<p class="small muted">No quote yet.</p>'}
      ${table({ head: [
        { label: 'Version' }, { label: 'State' }, { label: 'Total', num: true }, { label: 'Margin', num: true }, { label: 'Approved by' }, { label: 'Approved' }, { label: '' },
      ], rows: historyRows, empty: 'No quote versions.' })}
    `, flush: false }),
  })}

  ${section({
    title: 'Documents and orders linked to this requirement',
    body: `<div class="grid grid--2">
      ${card({ title: 'Documents', body: linkedDocs.length ? `<ul class="stack small">${linkedDocs.map((d) => `<li>${esc(d.title)} \u2014 ${esc(d.type)}, expires ${fmtDate(d.expiryDate)}</li>`).join('')}</ul>` : '<p class="small muted">No linked documents.</p>' })}
      ${card({ title: 'Orders', body: linkedOrders.length ? `<ul class="stack small">${linkedOrders.map((o) => `<li><a href="#/orders/${o.id}">${esc(o.poNumber)}</a> \u2014 ${esc(o.product)}, ${num(o.quantity)} units</li>`).join('')}</ul>` : '<p class="small muted">No order raised from this requirement.</p>' })}
    </div>`,
  })}
  `;
}

export function mount(state, params, root) {
  if (params && params.id) {
    const id = params.id;
    const apply = root.querySelector('[data-action="apply-status"]');
    if (apply) {
      apply.addEventListener('click', () => {
        const value = root.querySelector('#status-select').value;
        const res = store.setRequirementStatus(id, value);
        if (!res.ok) window.alert(res.errors.join('\n'));
      });
    }
    const loss = root.querySelector('[data-action="loss"]');
    if (loss) {
      loss.addEventListener('click', () => {
        openModal({
          title: 'Record a loss',
          lead: 'A structured reason and a short note are required. If either is missing, nothing is saved.',
          fields: [
            { name: 'reason', label: 'Structured reason', type: 'select', required: true, options: LOSS_REASONS.map((x) => ({ value: x, label: x })) },
            { name: 'note', label: 'Note', type: 'textarea', required: true, placeholder: 'What actually happened, in one or two lines.' },
          ],
          submitLabel: 'Record loss',
          onSubmit: (values) => store.recordLoss({ requirementId: id, reason: values.reason, note: values.note }),
        });
      });
    }
    const oemBtn = root.querySelector('[data-action="oem-response"]');
    if (oemBtn) {
      oemBtn.addEventListener('click', () => {
        openModal({
          title: 'Log an OEM response',
          lead: 'A firm commitment covers quantity. Availability or a quote indication does not, and will not reduce the uncovered balance.',
          fields: [
            { name: 'oemId', label: 'OEM', type: 'select', required: true, options: state.oems.map((o) => ({ value: o.id, label: o.name + (o.approved ? '' : ' (not approved)') })) },
            { name: 'type', label: 'Response type', type: 'select', required: true, options: RESPONSE_TYPES.map((x) => ({ value: x, label: x })) },
            { name: 'qty', label: 'Quantity', type: 'number', required: true },
            { name: 'unitPrice', label: 'Unit price', type: 'number', required: false, hint: 'Required for a firm commitment.' },
            { name: 'leadTimeDays', label: 'Lead time (days)', type: 'number', required: false },
            { name: 'notes', label: 'Notes', type: 'textarea', required: false },
          ],
          submitLabel: 'Save response',
          onSubmit: (values) => store.addOemResponse({
            requirementId: id, oemId: values.oemId, type: values.type, qty: values.qty,
            unitPrice: values.unitPrice, leadTimeDays: values.leadTimeDays, notes: values.notes,
          }),
        });
      });
    }
    root.querySelectorAll('[data-action="approve-quote"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const res = store.approveQuote(btn.getAttribute('data-quote'));
        if (!res.ok) window.alert(res.errors.join('\n'));
      });
    });
  } else {
    root.querySelectorAll('[data-action="new-requirement"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openModal({
          title: 'New requirement',
          lead: 'Missing required fields are refused with a reason and nothing is saved.',
          fields: [
            { name: 'agency', label: 'Agency or customer', type: 'text', required: true },
            { name: 'product', label: 'Product', type: 'text', required: true },
            { name: 'category', label: 'Category', type: 'text', required: false, placeholder: 'e.g. Optics' },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'unit', label: 'Unit', type: 'text', required: false, value: 'nos' },
            { name: 'submissionDeadline', label: 'Submission deadline', type: 'date', required: true },
            { name: 'requiredDeliveryDate', label: 'Required delivery date', type: 'date', required: true },
            { name: 'specs', label: 'Technical specifications', type: 'textarea', required: false },
          ],
          submitLabel: 'Create requirement',
          onSubmit: (values) => store.addRequirement(values),
        });
      });
    });
  }
}
