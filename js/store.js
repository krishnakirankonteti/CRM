import { createSeed } from './data.js';
import { todayISO } from './format.js';
import * as validate from './validate.js';

const KEY = 'ram-crm-state-v1';

function load() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    // a corrupt store must never stop the app; fall through to a fresh seed
  }
  return createSeed();
}

let state = load();
const listeners = new Set();

export function getState() { return state; }

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() { listeners.forEach((fn) => fn(state)); }

function persist() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // storage is best-effort in this stage
  }
}

let seq = Date.now();
function nextId(prefix) { seq += 1; return `${prefix}-${seq}`; }

function audit(entry) {
  state.audit.unshift({
    id: nextId('aud'),
    at: todayISO(),
    actor: state.meta.actor,
    ...entry,
  });
}

function commit(mutator) {
  mutator(state);
  persist();
  emit();
}

export function reset() {
  state = createSeed();
  persist();
  emit();
  return state;
}

export function setCurrency(code) {
  commit((s) => { s.meta.currency = code; });
}

/* ---------- validated mutations. Each returns { ok, errors, record } ---------- */

export function addRequirement(draft) {
  const errors = validate.validateRequirement(draft);
  if (errors.length) return { ok: false, errors };
  const record = {
    id: nextId('req'),
    ref: draft.ref || `REQ-${new Date().getFullYear()}-${String(state.requirements.length + 1).padStart(3, '0')}`,
    agency: draft.agency,
    product: draft.product,
    category: draft.category || 'Other',
    quantity: Number(draft.quantity),
    unit: draft.unit || 'nos',
    status: 'received',
    owner: state.meta.actor,
    createdAt: todayISO(),
    submissionDeadline: draft.submissionDeadline,
    requiredDeliveryDate: draft.requiredDeliveryDate,
    quotedTotal: 0,
    targetMarginPct: Number(draft.targetMarginPct || 0),
    specs: draft.specs || '',
    lineItems: [
      {
        id: nextId('li'),
        partNo: draft.partNo || 'TBD',
        description: draft.product,
        qty: Number(draft.quantity),
        unit: draft.unit || 'nos',
        unitPrice: Number(draft.unitPrice || 0),
      },
    ],
  };
  commit((s) => {
    s.requirements.unshift(record);
    audit({ entity: 'Requirement', entityId: record.id, field: 'status', from: '\u2014', to: 'received' });
  });
  return { ok: true, record };
}

export function addOemResponse(draft) {
  const errors = validate.validateOemResponse(draft);
  if (errors.length) return { ok: false, errors };
  const record = {
    id: nextId('rq'),
    requirementId: draft.requirementId,
    lineItemId: null,
    oemId: draft.oemId,
    type: draft.type,
    qty: Number(draft.qty),
    unitPrice: Number(draft.unitPrice || 0),
    leadTimeDays: Number(draft.leadTimeDays || 0),
    status: 'responded',
    requestedAt: draft.requestedAt || todayISO(),
    respondedAt: todayISO(),
    notes: draft.notes || '',
  };

  // Advisory capacity check: a firm commitment that pushes an OEM past its
  // capacity (or close to it) is saved, but the collision is stated plainly.
  let warning = null;
  if (record.type === 'firm') {
    const oem = state.oems.find((o) => o.id === record.oemId);
    const cap = Number((oem && oem.capacityQty) || 0);
    const already = state.oemRequests
      .filter((r) => r.oemId === record.oemId && r.type === 'firm' && r.status === 'responded')
      .reduce((a, r) => a + Number(r.qty || 0), 0);
    const projected = already + record.qty;
    if (cap && projected > cap) {
      warning = `Capacity collision: ${oem.name} would be committed to ${projected} against a capacity of ${cap} ${oem.capacityPeriod || ''}. Saved, but the collision is now visible on the dashboard.`;
    } else if (cap && projected >= cap * 0.9) {
      warning = `Tight capacity: ${oem.name} would be at ${Math.round((projected / cap) * 100)}% of its ${cap} ${oem.capacityPeriod || ''} capacity.`;
    }
  }

  commit((s) => {
    s.oemRequests.push(record);
    audit({ entity: 'OEM response', entityId: record.id, field: 'recorded', from: '\u2014', to: `${record.type} ${record.qty}` });
  });
  return { ok: true, record, warning };
}

export function recordLoss(draft) {
  const errors = validate.validateLoss(draft);
  if (errors.length) return { ok: false, errors };
  const req = state.requirements.find((r) => r.id === draft.requirementId);
  if (!req) return { ok: false, errors: ['The requirement does not exist.'] };
  const from = req.status;
  commit((s) => {
    const r = s.requirements.find((x) => x.id === draft.requirementId);
    r.status = 'lost';
    r.lossReason = draft.reason;
    r.lossNote = draft.note;
    r.decisionAt = todayISO();
    audit({ entity: 'Requirement', entityId: r.id, field: 'status', from, to: 'lost' });
  });
  return { ok: true, record: req };
}

export function recordPayment(draft) {
  const invoice = state.invoices.find((i) => i.id === draft.invoiceId);
  const alreadyPaid = state.payments
    .filter((p) => p.invoiceId === draft.invoiceId)
    .reduce((a, p) => a + Number(p.amount || 0), 0);
  const errors = validate.validatePayment(draft, invoice, alreadyPaid);
  if (errors.length) return { ok: false, errors };
  const record = {
    id: nextId('pay'),
    invoiceId: draft.invoiceId,
    amount: Number(draft.amount),
    paidAt: draft.paidAt,
    method: draft.method || 'RTGS',
  };
  commit((s) => {
    s.payments.push(record);
    const inv = s.invoices.find((i) => i.id === draft.invoiceId);
    const paid = s.payments.filter((p) => p.invoiceId === inv.id).reduce((a, p) => a + Number(p.amount), 0);
    const from = inv.status;
    inv.status = paid >= inv.amount ? 'paid' : 'part paid';
    audit({ entity: 'Invoice', entityId: inv.id, field: 'status', from, to: inv.status });
  });
  return { ok: true, record };
}

export function addDocument(draft) {
  const errors = validate.validateDocument(draft);
  if (errors.length) return { ok: false, errors };
  const record = {
    id: nextId('doc'),
    type: draft.type,
    title: draft.title,
    oemId: draft.oemId || null,
    requirementId: draft.requirementId || null,
    issueDate: draft.issueDate,
    expiryDate: draft.expiryDate,
    status: 'valid',
  };
  commit((s) => {
    s.documents.push(record);
    audit({ entity: 'Document', entityId: record.id, field: 'added', from: '\u2014', to: record.type });
  });
  return { ok: true, record };
}

export function approveQuote(quoteId, approver) {
  const quote = state.quotes.find((q) => q.id === quoteId);
  if (!quote) return { ok: false, errors: ['The quote does not exist.'] };
  if (!approver && !state.meta.actor) return { ok: false, errors: ['An approver is required.'] };
  const from = quote.state;
  commit((s) => {
    const q = s.quotes.find((x) => x.id === quoteId);
    q.state = 'approved';
    q.approvedBy = approver || s.meta.actor;
    q.approvedAt = todayISO();
    audit({ entity: 'Quote', entityId: q.id, field: 'state', from, to: 'approved' });
  });
  return { ok: true, record: quote };
}

export function setRequirementStatus(requirementId, status) {
  const allowed = ['received', 'qualifying', 'quoted', 'submitted', 'won', 'cancelled'];
  // "lost" is excluded on purpose: it must go through recordLoss so a structured
  // reason is captured, matching the rule that loss reasons are structured.
  if (status === 'lost') {
    return { ok: false, errors: ['Use "Record loss" so a structured loss reason is captured.'] };
  }
  if (!allowed.includes(status)) return { ok: false, errors: [`Status must be one of: ${allowed.join(', ')}.`] };
  const req = state.requirements.find((r) => r.id === requirementId);
  if (!req) return { ok: false, errors: ['The requirement does not exist.'] };
  if (req.status === 'lost' && status !== 'lost') {
    return { ok: false, errors: ['A lost requirement cannot be reopened from here.'] };
  }
  const from = req.status;
  commit((s) => {
    const r = s.requirements.find((x) => x.id === requirementId);
    r.status = status;
    if (status === 'won' || status === 'cancelled') r.decisionAt = todayISO();
    audit({ entity: 'Requirement', entityId: r.id, field: 'status', from, to: status });
  });
  return { ok: true, record: req };
}

// Acceptance is a distinct event: an order is not closed until the delivery is
// accepted. Without this, "open orders" could never be worked down.
export function recordAcceptance(draft) {
  const errors = validate.validateAcceptance(draft, state);
  if (errors.length) return { ok: false, errors };
  const delivery = state.deliveries.find((d) => d.id === draft.deliveryId);
  commit((s) => {
    const d = s.deliveries.find((x) => x.id === draft.deliveryId);
    d.acceptedAt = draft.acceptedAt;
    d.status = 'accepted';
    const order = s.orders.find((o) => o.id === d.orderId);
    audit({ entity: 'Delivery', entityId: d.id, field: 'acceptedAt', from: '\u2014', to: draft.acceptedAt });
    const all = s.deliveries.filter((x) => x.orderId === order.id);
    const acceptedQty = all.filter((x) => x.acceptedAt).reduce((a, x) => a + Number(x.qty || 0), 0);
    if (acceptedQty >= Number(order.quantity || 0)) {
      const from = order.status;
      order.status = 'accepted';
      audit({ entity: 'Order', entityId: order.id, field: 'status', from, to: 'accepted' });
    }
  });
  return { ok: true, record: delivery };
}
