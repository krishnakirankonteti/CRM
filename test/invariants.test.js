import test from 'node:test';
import assert from 'node:assert/strict';

import { createSeed } from '../js/data.js';
import {
  capacityCollisions,
  coverage,
  deadlineChain,
  deliveryRisk,
  fingerprintMatches,
  fingerprintOf,
  oemCapacity,
  openOrders,
  orderMetrics,
  orphanPOs,
  pdiBalance,
  orderById,
} from '../js/selectors.js';
import {
  validateAcceptance,
  validateDocument,
  validateLoss,
  validateOemResponse,
  validateOrder,
  validatePayment,
} from '../js/validate.js';
import { answer } from '../js/ask.js';
import * as store from '../js/store.js';

test('coverage: firm commitments cover, availability indications do not', () => {
  const s = createSeed();
  const full = coverage(s, 'req-004');
  assert.equal(full.required, 1000);
  assert.equal(full.committed, 1000);
  assert.equal(full.uncovered, 0);

  const gapped = coverage(s, 'req-011');
  assert.equal(gapped.required, 800);
  assert.equal(gapped.committed, 600, 'only the firm 600 counts');
  assert.equal(gapped.availability, 200, 'the 200 indication is visible but not counted');
  assert.equal(gapped.uncovered, 200);
});

test('invariant: every PO maps to an approved quote (no orphan PO)', () => {
  const s = createSeed();
  assert.equal(orphanPOs(s).length, 0);
  for (const o of s.orders) {
    const q = s.quotes.find((x) => x.id === o.quoteId);
    assert.equal(q && q.state, 'approved', `${o.poNumber} must point at an approved quote`);
  }

  const broken = createSeed();
  broken.orders[0].quoteId = 'qt-011'; // a draft quote
  assert.equal(orphanPOs(broken).length, 1, 'a PO on a non-approved quote is detectable');
});

test('invariant: PDI offered, cleared and rejected stay distinct numbers', () => {
  const s = createSeed();
  const pdi = pdiBalance(s, 'po-3002');
  assert.equal(pdi.offered, 300);
  assert.equal(pdi.cleared, 0);
  assert.equal(pdi.rejected, 300);
  assert.equal(pdi.latest.status, 'failed');
});

test('delivery risk is computed from expected date, blocked PDI and overdue acceptance', () => {
  const s = createSeed();
  assert.equal(deliveryRisk(s, orderById(s, 'po-3002')).atRisk, true, 'failed PDI blocks dispatch');
  assert.equal(deliveryRisk(s, orderById(s, 'po-3004')).atRisk, true, 'overdue and not yet accepted');
  assert.equal(deliveryRisk(s, orderById(s, 'po-3006')).atRisk, false, 'on track');
});

test('partial delivery keeps the outstanding balance visible', () => {
  const s = createSeed();
  const m = orderMetrics(s, orderById(s, 'po-3001'));
  assert.equal(m.ordered, 1200);
  assert.equal(m.delivered, 700);
  assert.equal(m.outstanding, 500);
});

test('forms reject missing required fields with a clear reason', () => {
  assert.ok(validateOemResponse({}).length >= 3, 'empty OEM response is rejected');
  assert.ok(validateOemResponse({ requirementId: 'req-004', oemId: 'oem-01', type: 'firm', qty: 10 }).some((e) => /unit price/i.test(e)), 'firm needs a price');
  assert.ok(validateLoss({ requirementId: 'req-004' }).some((e) => /reason/i.test(e)), 'loss needs a reason');
  assert.ok(validateLoss({ requirementId: 'req-004', reason: 'Because', note: 'too short' }).some((e) => /reason must be one of/i.test(e)), 'loss reason must be from the list');
  assert.ok(validatePayment({}).length >= 3, 'empty payment is rejected');
  assert.ok(validateDocument({ type: 'ISO certificate', title: 'x', issueDate: '2024-01-01', expiryDate: '2023-01-01' }).some((e) => /after the issue date/i.test(e)), 'expiry must follow issue');
});

test('invariant: a PO cannot be raised without an approved quote', () => {
  const s = createSeed();
  const draftQuoteOrder = { orderNumber: 'PO-9999', oemId: 'oem-01', quantity: 10, unitPrice: 100, deliveryDeadline: '2026-01-01', requirementId: 'req-011', quoteId: 'qt-011' };
  assert.ok(validateOrder(draftQuoteOrder, s).some((e) => /approved quote/i.test(e)), 'draft quote is refused');
  const noQuote = { ...draftQuoteOrder, quoteId: '' };
  assert.ok(validateOrder(noQuote, s).some((e) => /without an approved quote/i.test(e)), 'missing quote is refused');
  const good = { ...draftQuoteOrder, requirementId: 'req-004', quoteId: 'qt-004' };
  assert.equal(validateOrder(good, s).length, 0, 'an approved quote passes');
});

test('store saves nothing when validation fails', () => {
  const before = store.getState().oemRequests.length;
  const bad = store.addOemResponse({ requirementId: 'req-004' });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.length > 0);
  assert.equal(store.getState().oemRequests.length, before, 'no record was appended');

  const badPay = store.recordPayment({ invoiceId: 'inv-5001', amount: 999999999, paidAt: '2026-01-01' });
  assert.equal(badPay.ok, false);
  assert.ok(badPay.errors.some((e) => /outstanding balance/i.test(e)));
});

test('plain-language answers read records and never invent', () => {
  const s = createSeed();
  const ok = answer(s, 'How many orders are open?');
  assert.equal(ok.matched, true);
  assert.ok(/\d/.test(ok.body), 'the answer contains a number from the records');
  assert.ok(ok.source.length > 0, 'the answer cites source records');

  const unknown = answer(s, 'what is the weather in Dubai');
  assert.equal(unknown.matched, false);
  assert.ok(/not recorded/i.test(unknown.body));
  assert.equal(unknown.source.length, 0);
});

test('structured losses group by reason', () => {
  const s = createSeed();
  const lost = s.requirements.filter((r) => r.status === 'lost');
  assert.ok(lost.length >= 4);
  for (const r of lost) assert.ok(r.lossReason, `${r.ref} must carry a structured loss reason`);
});

test('acceptance needs a real, unaccepted delivery and a date after delivery', () => {
  const s = createSeed();
  assert.ok(validateAcceptance({}, s).length >= 2, 'empty acceptance is rejected');
  assert.ok(validateAcceptance({ deliveryId: 'dlv-3001-1' }, s).some((e) => /acceptance date/i.test(e)));
  assert.ok(validateAcceptance({ deliveryId: 'dlv-3001-1', acceptedAt: '2000-01-01' }, s).some((e) => /before the delivery date/i.test(e)));
  assert.equal(validateAcceptance({ deliveryId: 'dlv-3001-1', acceptedAt: '2099-01-01' }, s).length, 0);

  const already = createSeed();
  already.deliveries[0].acceptedAt = '2099-01-01';
  assert.ok(validateAcceptance({ deliveryId: already.deliveries[0].id, acceptedAt: '2099-02-01' }, already).some((e) => /already accepted/i.test(e)));
});

test('a requirement cannot be marked lost without a structured reason', () => {
  const before = store.getState().requirements.find((r) => r.id === 'req-004').status;
  const res = store.setRequirementStatus('req-004', 'lost');
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => /Record loss/i.test(e)));
  assert.equal(store.getState().requirements.find((r) => r.id === 'req-004').status, before, 'status was not changed');
});

test('recording acceptance closes the order and reduces the open-orders count', () => {
  store.reset();
  const before = openOrders(store.getState()).length;
  const res = store.recordAcceptance({ deliveryId: 'dlv-3004-1', acceptedAt: '2099-01-01' });
  assert.equal(res.ok, true);
  const order = store.getState().orders.find((o) => o.id === 'po-3004');
  assert.equal(order.status, 'accepted');
  assert.equal(openOrders(store.getState()).length, before - 1);
  store.reset();
});

test('fingerprinting: same shape of requirement shares a code and finds prior matches', () => {
  const s = createSeed();
  const a = fingerprintOf(s.requirements.find((r) => r.id === 'req-004'));
  assert.ok(a.code.length > 6, 'a code is produced');
  assert.ok(a.parts.standards.length >= 1, 'the governing standard is captured');
  const matches = fingerprintMatches(s, 'req-004');
  assert.ok(matches.length >= 1);
  assert.ok(matches.some((m) => m.requirementId === 'req-008'), 'the other MIL-DTL-38999 requirement is matched');
  assert.ok(matches[0].score > 0, 'matches carry an overlap score');
});

test('deadline chain: names the binding constraint and computes slack', () => {
  const s = createSeed();
  const blocked = deadlineChain(s, 'po-3002');
  assert.equal(blocked.status, 'breach');
  assert.ok(/blocked|held/i.test(blocked.binding));
  assert.ok(blocked.links.length >= 4, 'the chain lists its links');

  const onTrack = deadlineChain(s, 'po-3003');
  assert.equal(onTrack.status, 'ok');
  assert.ok(onTrack.slack > 7);

  const late = deadlineChain(s, 'po-3005');
  assert.equal(late.status, 'breach');
  assert.ok(late.slack < 0, 'a projected slip produces negative slack');
});

test('capacity collision: firm commitments beyond the ceiling are flagged', () => {
  const s = createSeed();
  const aureus = oemCapacity(s, 'oem-01');
  assert.equal(aureus.capacity, 2500);
  assert.equal(aureus.committed, 2600);
  assert.equal(aureus.level, 'collision');
  assert.ok(aureus.remaining < 0);

  const collisions = capacityCollisions(s);
  assert.ok(collisions.some((c) => c.oem.id === 'oem-01'));
  assert.ok(collisions.some((c) => c.oem.id === 'oem-10'));
  for (const c of collisions) assert.ok(c.level === 'collision' || c.level === 'tight');
});

test('a firm commitment beyond capacity warns and still saves', () => {
  store.reset();
  const before = store.getState().oemRequests.length;
  const res = store.addOemResponse({ requirementId: 'req-011', oemId: 'oem-01', type: 'firm', qty: 500, unitPrice: 100, leadTimeDays: 10 });
  assert.equal(res.ok, true);
  assert.ok(res.warning && /collision/i.test(res.warning), 'the over-commitment is warned about');
  assert.equal(store.getState().oemRequests.length, before + 1, 'the record is still saved');
  store.reset();
});
