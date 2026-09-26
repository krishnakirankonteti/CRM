import { diffDays, todayISO } from './format.js';

const sum = (arr, f) => arr.reduce((a, x) => a + Number(f(x) || 0), 0);

export function requirementById(state, id) {
  return (state.requirements || []).find((r) => r.id === id) || null;
}
export function oemById(state, id) {
  return (state.oems || []).find((o) => o.id === id) || null;
}
export function quoteById(state, id) {
  return (state.quotes || []).find((q) => q.id === id) || null;
}
export function orderById(state, id) {
  return (state.orders || []).find((o) => o.id === id) || null;
}

export function requestsFor(state, requirementId) {
  return (state.oemRequests || []).filter((r) => r.requirementId === requirementId);
}

/* ---------- quantity coverage: required vs committed vs uncovered ---------- */

export function coverage(state, requirementId) {
  const req = requirementById(state, requirementId);
  const requests = requestsFor(state, requirementId);
  const firm = requests.filter((r) => r.type === 'firm' && r.status === 'responded');
  const indications = requests.filter((r) => r.type !== 'firm' && r.status === 'responded');
  const pending = requests.filter((r) => r.status === 'pending');
  const committed = sum(firm, (r) => r.qty);
  const availability = sum(indications, (r) => r.qty);
  const required = req ? Number(req.quantity || 0) : 0;
  const uncovered = Math.max(0, required - committed);
  return {
    required,
    committed,
    availability,
    uncovered,
    coveredPct: required ? committed / required : 0,
    firm,
    indications,
    pending,
    unitValue: req && req.quantity ? Number(req.quotedTotal || 0) / req.quantity : 0,
  };
}

// The client's open question C-10: is OEM capacity global or per order?
// Both readings are computed so the decision stays visible rather than assumed.
export function oemCommittedTo(state, oemId, requirementId) {
  const firm = (state.oemRequests || []).filter(
    (r) => r.oemId === oemId && r.type === 'firm' && r.status === 'responded'
  );
  const global = sum(firm, (r) => r.qty);
  const thisOrder = sum(firm.filter((r) => r.requirementId === requirementId), (r) => r.qty);
  return { global, thisOrder };
}

/* ---------- quotes and comparables ---------- */

export function quotesFor(state, requirementId) {
  return (state.quotes || [])
    .filter((q) => q.requirementId === requirementId)
    .sort((a, b) => (b.version || 0) - (a.version || 0));
}

export function latestQuote(state, requirementId) {
  return quotesFor(state, requirementId)[0] || null;
}

// Comparable past bids for the same category, before pricing a new one.
export function comparables(state, requirementId) {
  const req = requirementById(state, requirementId);
  if (!req) return [];
  return (state.requirements || [])
    .filter((r) => r.id !== requirementId && r.category === req.category)
    .map((r) => {
      const q = latestQuote(state, r.id);
      if (!q || (r.status !== 'won' && r.status !== 'lost')) return null;
      const oemId = q.lines && q.lines[0] ? q.lines[0].oemId : null;
      return {
        requirementId: r.id,
        ref: r.ref,
        agency: r.agency,
        product: r.product,
        quotedTotal: q.quotedTotal,
        outcome: r.status,
        winningPrice: r.winningPrice || null,
        lossReason: r.lossReason || null,
        decisionAt: r.decisionAt || null,
        oemName: oemId && oemById(state, oemId) ? oemById(state, oemId).name : '\u2014',
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.decisionAt || '').localeCompare(String(a.decisionAt || '')));
}

/* ---------- orders, PDI, delivery ---------- */

export function stepsFor(state, orderId) {
  const order = orderById(state, orderId);
  if (!order) return [];
  const known = (state.fulfilmentSteps || []).filter((s) => s.orderId === orderId);
  return known.sort((a, b) => rankOf(a.step) - rankOf(b.step));
}

const STEP_RANK = [
  'OEM PO placed', 'Production started', 'Production done', 'PDI scheduled', 'PDI passed',
  'Government inspection', 'Dispatch', 'Delivered', 'Accepted',
];
function rankOf(step) { return STEP_RANK.indexOf(step); }

export function pdiBalance(state, orderId) {
  const events = (state.pdiEvents || []).filter((p) => p.orderId === orderId);
  const latest = events.slice().sort((a, b) => String(b.scheduledDate).localeCompare(String(a.scheduledDate)))[0] || null;
  return {
    events,
    latest,
    offered: sum(events, (p) => p.offered),
    cleared: sum(events, (p) => p.cleared),
    rejected: sum(events, (p) => p.rejected),
  };
}

export function orderMetrics(state, order) {
  if (!order) return null;
  const deliveries = (state.deliveries || []).filter((d) => d.orderId === order.id);
  const delivered = sum(deliveries, (d) => d.qty);
  const accepted = sum(deliveries.filter((d) => d.acceptedAt), (d) => d.qty);
  const invoices = (state.invoices || []).filter((i) => i.orderId === order.id);
  const invoiceIds = invoices.map((i) => i.id);
  const paid = sum((state.payments || []).filter((p) => invoiceIds.includes(p.invoiceId)), (p) => p.amount);
  const invoiced = sum(invoices, (i) => i.amount);
  const pdi = pdiBalance(state, order.id);
  const steps = stepsFor(state, order.id);
  const deliveredStep = steps.find((s) => s.step === 'Delivered');
  const expectedDelivery = deliveredStep ? deliveredStep.expectedDate : (steps[steps.length - 1] || {}).expectedDate || null;
  return {
    order,
    ordered: Number(order.quantity || 0),
    delivered,
    accepted,
    outstanding: Math.max(0, Number(order.quantity || 0) - delivered),
    invoices,
    invoiced,
    paid,
    outstandingPayment: Math.max(0, invoiced - paid),
    pdi,
    steps,
    expectedDelivery,
    daysToDeadline: diffDays(todayISO(), order.deliveryDeadline),
  };
}

export function deliveryRisk(state, order) {
  const m = orderMetrics(state, order);
  if (!m) return { atRisk: false, reasons: [] };
  const reasons = [];
  const late = m.expectedDelivery && order.deliveryDeadline && m.expectedDelivery > order.deliveryDeadline;
  if (late) reasons.push(`Projected delivered ${m.expectedDelivery} after the deadline ${order.deliveryDeadline}.`);
  const blocked = m.steps.some((s) => s.status === 'blocked' || s.status === 'held');
  if (blocked) reasons.push('A fulfilment step is blocked or held.');
  if (m.pdi.latest && m.pdi.latest.status === 'failed') reasons.push('PDI failed; dispatch is blocked until re-offered.');
  const notDone = m.accepted < m.ordered;
  const dueSoon = notDone && m.daysToDeadline != null && m.daysToDeadline <= 7;
  if (dueSoon && m.daysToDeadline >= 0) reasons.push(`Deadline is within ${m.daysToDeadline} day(s).`);
  const overdue = notDone && m.daysToDeadline != null && m.daysToDeadline < 0;
  if (overdue) reasons.push(`Deadline passed ${Math.abs(m.daysToDeadline)} day(s) ago and the order is not fully accepted.`);
  return { atRisk: reasons.length > 0, reasons, metrics: m };
}

export function openOrders(state) {
  return (state.orders || []).filter((o) => {
    const m = orderMetrics(state, o);
    return m.accepted < m.ordered;
  });
}

export function deliveryRiskOrders(state) {
  return openOrders(state)
    .map((o) => ({ order: o, risk: deliveryRisk(state, o) }))
    .filter((x) => x.risk.atRisk)
    .sort((a, b) => (a.risk.metrics.daysToDeadline ?? 999) - (b.risk.metrics.daysToDeadline ?? 999));
}

/* ---------- money ---------- */

// Exposure on a flagged order is the larger of what is still to be delivered
// and what is still unpaid. They are not added, because they are the same money.
export function orderExposure(order, metrics) {
  return Math.max(
    Number(metrics.outstanding || 0) * Number(order.unitPrice || 0),
    Number(metrics.outstandingPayment || 0)
  );
}

export function moneyAtRisk(state) {
  const risky = deliveryRiskOrders(state);
  const deliveryValue = sum(risky, (x) => orderExposure(x.order, x.risk.metrics));
  const activeStatuses = ['quoted', 'submitted', 'won'];
  const gaps = (state.requirements || [])
    .filter((r) => activeStatuses.includes(r.status))
    .map((r) => ({ requirement: r, cov: coverage(state, r.id) }))
    .filter((x) => x.cov.uncovered > 0);
  const coverageGapValue = sum(gaps, (x) => x.cov.uncovered * x.cov.unitValue);
  return {
    deliveryValue,
    coverageGapValue,
    total: deliveryValue + coverageGapValue,
    riskyOrders: risky,
    coverageGaps: gaps,
  };
}

/* ---------- documents and losses ---------- */

export function documentStatus(state, doc) {
  const d = diffDays(todayISO(), doc.expiryDate);
  if (d == null) return { state: 'unknown', days: null };
  if (d < 0) return { state: 'expired', days: d };
  if (d <= 90) return { state: 'expiring', days: d };
  return { state: 'valid', days: d };
}

export function documentsExpiring(state, withinDays = 90) {
  return (state.documents || [])
    .map((doc) => ({ doc, s: documentStatus(state, doc) }))
    .filter((x) => x.s.days != null && x.s.days <= withinDays)
    .sort((a, b) => a.s.days - b.s.days);
}

function sameMonth(iso, refISO) {
  if (!iso) return false;
  return String(iso).slice(0, 7) === String(refISO).slice(0, 7);
}

export function lossBreakdown(state) {
  const lost = (state.requirements || []).filter((r) => r.status === 'lost');
  const byReason = {};
  for (const r of lost) {
    const key = r.lossReason || 'Unrecorded';
    if (!byReason[key]) byReason[key] = { reason: key, count: 0, value: 0, notes: [] };
    byReason[key].count += 1;
    byReason[key].value += Number(r.quotedTotal || 0);
    if (r.lossNote) byReason[key].notes.push({ ref: r.ref, note: r.lossNote });
  }
  return Object.values(byReason).sort((a, b) => b.count - a.count);
}

export function decisionsThisMonth(state) {
  const t = todayISO();
  const won = (state.requirements || []).filter((r) => r.status === 'won' && sameMonth(r.decisionAt, t));
  const lost = (state.requirements || []).filter((r) => r.status === 'lost' && sameMonth(r.decisionAt, t));
  return {
    won,
    lost,
    wonValue: sum(won, (r) => r.quotedTotal),
    lostValue: sum(lost, (r) => r.quotedTotal),
  };
}

/* ---------- OEM view ---------- */

export function oemStats(state, oemId) {
  const oem = oemById(state, oemId);
  const firmRequests = (state.oemRequests || []).filter(
    (r) => r.oemId === oemId && r.type === 'firm' && r.status === 'responded'
  );
  const orders = (state.orders || []).filter((o) => o.oemId === oemId);
  const pending = (state.oemRequests || []).filter((r) => r.oemId === oemId && r.status === 'pending');
  return {
    oem,
    committedQty: sum(firmRequests, (r) => r.qty),
    committedValue: sum(firmRequests, (r) => r.qty * r.unitPrice),
    orders,
    orderValue: sum(orders, (o) => o.price),
    pending,
    avgLeadTime: firmRequests.length
      ? Math.round(sum(firmRequests, (r) => r.leadTimeDays) / firmRequests.length)
      : (oem ? oem.leadTimeDays : 0),
  };
}

/* ---------- search ---------- */

export function searchHistory(state, text) {
  const q = String(text || '').trim().toLowerCase();
  if (!q) return [];
  return (state.requirements || []).filter((r) =>
    [r.ref, r.agency, r.product, r.category, r.specs].some((f) => String(f || '').toLowerCase().includes(q))
  );
}

/* ---------- invariant check: no orphan PO ---------- */

export function orphanPOs(state) {
  return (state.orders || []).filter((o) => {
    const q = quoteById(state, o.quoteId);
    return !q || q.state !== 'approved';
  });
}

/* ---------- requirement fingerprinting ---------- */

const FP_STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'type', 'grade', 'standard', 'spec', 'per', 'each',
  'set', 'sets', 'unit', 'units', 'nos', 'of', 'to', 'in', 'on', 'a', 'an', 'via', 'into', 'with',
]);

const AGENCY_CODES = {
  'indian army': 'ARMY', 'indian navy': 'NAVY', 'indian air force': 'IAF', 'drdo': 'DRDO',
  'bsf': 'BSF', 'indian coast guard': 'ICG', 'ministry of defence': 'MOD',
};

function qtyBand(q) {
  const n = Number(q || 0);
  if (n <= 100) return 'B1';
  if (n <= 500) return 'B2';
  if (n <= 2000) return 'B3';
  if (n <= 10000) return 'B4';
  return 'B5';
}

// A short, stable signature of a requirement: category, agency, quantity band and
// the governing standard. This is what makes "have we seen this before?" answerable
// even when the wording of two tenders differs.
export function fingerprintOf(req) {
  const raw = `${req.product || ''} ${req.specs || ''}`.toLowerCase();
  const standards = [...new Set(raw.match(/mil-[a-z]+-?\d+[a-z0-9]*/g) || [])];
  const keywords = [...new Set(
    raw.replace(/[^a-z0-9]+/g, ' ').split(' ').filter((t) => t.length >= 3 && !FP_STOP.has(t))
  )];
  const cat = String(req.category || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GEN';
  const agency =
    AGENCY_CODES[String(req.agency || '').toLowerCase()] ||
    String(req.agency || '').slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'ANY';
  const band = qtyBand(req.quantity);
  const std = standards[0] ? standards[0].toUpperCase().replace(/[^A-Z0-9]/g, '') : 'GEN';
  const tokens = new Set([
    ...keywords,
    ...standards,
    String(req.category || '').toLowerCase(),
    String(req.agency || '').toLowerCase().replace(/[^a-z]/g, ''),
  ]);
  return {
    code: `${cat}-${agency}-${band}-${std}`,
    parts: { category: req.category, agency: req.agency, band, standards, keywordCount: keywords.length },
    keywords,
    standards,
    tokens,
  };
}

export function fingerprintIndex(state) {
  return (state.requirements || []).map((r) => ({ requirement: r, fingerprint: fingerprintOf(r) }));
}

// Prior requirements that look like this one, ranked by token overlap and an exact
// fingerprint-code match. Deliberately stricter than the category comparables.
export function fingerprintMatches(state, requirementId) {
  const req = requirementById(state, requirementId);
  if (!req) return [];
  const base = fingerprintOf(req);
  return (state.requirements || [])
    .filter((r) => r.id !== requirementId)
    .map((r) => {
      const f = fingerprintOf(r);
      let inter = 0;
      for (const t of f.tokens) if (base.tokens.has(t)) inter += 1;
      const union = new Set([...base.tokens, ...f.tokens]).size || 1;
      const q = latestQuote(state, r.id);
      const oemId = q && q.lines && q.lines[0] ? q.lines[0].oemId : null;
      return {
        requirementId: r.id,
        ref: r.ref,
        agency: r.agency,
        product: r.product,
        category: r.category,
        code: f.code,
        sameCode: f.code === base.code,
        score: inter / union,
        outcome: r.status,
        quotedTotal: q ? q.quotedTotal : null,
        winningPrice: r.winningPrice || null,
        lossReason: r.lossReason || null,
        decisionAt: r.decisionAt || null,
        oemName: oemId && oemById(state, oemId) ? oemById(state, oemId).name : '\u2014',
      };
    })
    .filter((m) => m.sameCode || m.score >= 0.15)
    .sort((a, b) => (Number(b.sameCode) - Number(a.sameCode)) || (b.score - a.score))
    .slice(0, 8);
}

/* ---------- deadline chain ---------- */

// The dependent sequence of dates behind one order: submission, required delivery,
// the PO, the committed delivery deadline, and the projected dispatch/delivery and
// acceptance, with the binding constraint named.
export function deadlineChain(state, orderId) {
  const order = orderById(state, orderId);
  if (!order) return null;
  const req = requirementById(state, order.requirementId);
  const m = orderMetrics(state, order);
  const today = todayISO();
  const links = [];
  const add = (label, date, type, note) => {
    if (!date) return;
    links.push({ label, date, type, note: note || '', days: diffDays(today, date) });
  };
  add('Submission deadline', req && req.submissionDeadline, 'hard', 'agency gate');
  add('Required delivery (agency)', req && req.requiredDeliveryDate, 'hard', 'agency gate');
  add('PO placed', order.poDate, 'done');
  add('Committed delivery deadline', order.deliveryDeadline, 'hard', 'contractual');
  const dispatch = m.steps.find((s) => s.step === 'Dispatch');
  add('Expected dispatch', dispatch && dispatch.expectedDate, 'projected');
  add('Expected delivered', m.expectedDelivery, 'projected');
  const accepted = m.steps.find((s) => s.step === 'Accepted');
  add('Expected accepted', accepted && accepted.expectedDate, 'projected');

  const blocked = m.steps.filter((s) => s.status === 'blocked' || s.status === 'held');
  const slack = m.expectedDelivery && order.deliveryDeadline
    ? diffDays(m.expectedDelivery, order.deliveryDeadline)
    : null;

  let status = 'ok';
  let binding = 'Expected delivery against the committed deadline';
  if (blocked.length) {
    status = 'breach';
    binding = `${blocked[0].step} is ${blocked[0].status}`;
  } else if (m.accepted < m.ordered && m.daysToDeadline != null && m.daysToDeadline < 0) {
    status = 'breach';
    binding = 'Acceptance is outstanding past the committed deadline';
  } else if (slack != null && slack < 0) {
    status = 'breach';
    binding = 'Expected delivery is after the committed deadline';
  } else if (slack != null && slack <= 7) {
    status = 'tight';
    binding = 'Less than a week of slack against the committed deadline';
  }

  // A compliance document that expires before expected delivery sits inside the chain.
  const delivery = m.expectedDelivery || order.deliveryDeadline;
  const documentRisks = (state.documents || [])
    .filter((d) => d.requirementId === order.requirementId || (d.oemId && d.oemId === order.oemId))
    .map((d) => ({ doc: d, s: documentStatus(state, d) }))
    .filter((x) => x.s.days != null && delivery && x.doc.expiryDate <= delivery);

  return { order, requirement: req, metrics: m, links, slack, status, binding, blocked, documentRisks };
}

const CHAIN_SEVERITY = { breach: 0, tight: 1, ok: 2 };

export function deadlineChains(state) {
  return openOrders(state)
    .map((o) => deadlineChain(state, o.id))
    .filter(Boolean)
    .sort((a, b) => (CHAIN_SEVERITY[a.status] - CHAIN_SEVERITY[b.status]) || ((a.slack ?? 9999) - (b.slack ?? 9999)));
}

/* ---------- OEM capacity collision ---------- */

export function oemCapacity(state, oemId) {
  const oem = oemById(state, oemId);
  const capacity = Number((oem && oem.capacityQty) || 0);
  const firm = (state.oemRequests || []).filter(
    (r) => r.oemId === oemId && r.type === 'firm' && r.status === 'responded'
  );
  const committed = sum(firm, (r) => r.qty);
  const map = new Map();
  for (const r of firm) map.set(r.requirementId, (map.get(r.requirementId) || 0) + Number(r.qty || 0));
  const byRequirement = [...map.entries()]
    .map(([rid, qty]) => {
      const req = requirementById(state, rid);
      return { requirementId: rid, ref: req ? req.ref : rid, product: req ? req.product : '', qty };
    })
    .sort((a, b) => b.qty - a.qty);
  const remaining = capacity - committed;
  const util = capacity ? committed / capacity : 0;
  const level = !capacity ? 'unknown' : committed > capacity ? 'collision' : util >= 0.9 ? 'tight' : 'ok';
  return {
    oem,
    capacity,
    period: oem ? oem.capacityPeriod : '',
    committed,
    remaining,
    util,
    level,
    byRequirement,
  };
}

export function capacityCollisions(state) {
  const SEV = { collision: 0, tight: 1 };
  return (state.oems || [])
    .map((o) => oemCapacity(state, o.id))
    .filter((c) => c.level === 'collision' || c.level === 'tight')
    .sort((a, b) => (SEV[a.level] - SEV[b.level]) || (b.util - a.util));
}

/* ---------- the morning view ---------- */

export function dashboard(state) {
  const open = openOrders(state);
  const risky = deliveryRiskOrders(state);
  const submitted = (state.requirements || []).filter((r) => r.status === 'submitted');
  const quotesPending = (state.quotes || []).filter((q) => q.state === 'pending approval');
  const invoices = (state.invoices || []).filter((i) => {
    const paid = sum((state.payments || []).filter((p) => p.invoiceId === i.id), (p) => p.amount);
    return paid < i.amount;
  });
  const paymentsPending = sum(invoices, (i) => {
    const paid = sum((state.payments || []).filter((p) => p.invoiceId === i.id), (p) => p.amount);
    return i.amount - paid;
  });
  const oemPending = (state.oemRequests || [])
    .filter((r) => r.status === 'pending')
    .map((r) => ({ request: r, aging: diffDays(r.requestedAt, todayISO()) || 0, oem: oemById(state, r.oemId), requirement: requirementById(state, r.requirementId) }))
    .sort((a, b) => b.aging - a.aging);
  const docs = documentsExpiring(state, 90);
  const decisions = decisionsThisMonth(state);
  const money = moneyAtRisk(state);

  return {
    asOf: todayISO(),
    openOrders: open,
    openOrderCount: open.length,
    openOrderStates: open.map((o) => ({ order: o, metrics: orderMetrics(state, o) })),
    quotesAwaiting: submitted,
    quotesPendingApproval: quotesPending,
    atRiskOrders: risky,
    atRiskCount: risky.length,
    paymentsPending,
    unpaidInvoices: invoices,
    oemPending,
    oemPendingCount: oemPending.length,
    docsExpiring: docs,
    decisions,
    money,
  };
}
