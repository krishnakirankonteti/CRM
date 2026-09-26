import { money, num } from './format.js';
import {
  dashboard,
  deliveryRiskOrders,
  documentsExpiring,
  lossBreakdown,
  moneyAtRisk,
  coverage,
} from './selectors.js';

// Deterministic answers. No model is used, so an answer can only ever restate
// records that exist. When nothing matches, the reply is "not recorded".
const intents = [
  {
    id: 'open-orders',
    test: /(how many orders|orders are open|open orders|orders open|how many open)/i,
    run(state) {
      const d = dashboard(state);
      const lines = d.openOrderStates.map(
        (x) => `${x.order.poNumber} \u2014 ${x.order.product}: ${x.metrics.delivered} of ${x.metrics.ordered} delivered, state "${x.order.status}".`
      );
      return {
        title: 'Open orders',
        body: `There are ${d.openOrderCount} open orders.\n` + lines.join('\n'),
        source: d.openOrders.map((o) => o.poNumber),
      };
    },
  },
  {
    id: 'won-this-month',
    test: /(won this month|contracts did we win|how many did we win|wins this month)/i,
    run(state) {
      const d = dashboard(state).decisions;
      const lines = d.won.map((r) => `${r.ref} \u2014 ${r.product}, ${money(r.quotedTotal)}.`);
      return {
        title: 'Contracts won this month',
        body: `We won ${d.won.length} contract(s) this month, worth ${money(d.wonValue)}.\n` + (lines.join('\n') || 'No wins recorded this month.'),
        source: d.won.map((r) => r.ref),
      };
    },
  },
  {
    id: 'what-lost',
    test: /(what did we lose|what have we lost|lost opportunities|which did we lose)/i,
    run(state) {
      const lost = (state.requirements || []).filter((r) => r.status === 'lost');
      const thisMonth = dashboard(state).decisions.lost;
      const lines = lost.map((r) => `${r.ref} \u2014 ${r.product}, quoted ${money(r.quotedTotal)}, reason: ${r.lossReason || 'unrecorded'}.`);
      return {
        title: 'Lost opportunities',
        body: `${lost.length} opportunity(ies) lost in total; ${thisMonth.length} lost this month.\n` + lines.join('\n'),
        source: lost.map((r) => r.ref),
      };
    },
  },
  {
    id: 'why-lost',
    test: /(why did we lose|why do we lose|loss reason|reasons for loss|why we lost)/i,
    run(state) {
      const b = lossBreakdown(state);
      const lines = b.map((x) => `${x.reason}: ${x.count} (${money(x.value)} quoted)`);
      return {
        title: 'Why we lost',
        body: 'Losses by structured reason:\n' + lines.join('\n'),
        source: b.flatMap((x) => x.notes.map((n) => n.ref)),
      };
    },
  },
  {
    id: 'delivery-risk',
    test: /(delivery risk|at risk|deliveries at risk|orders at risk)/i,
    run(state) {
      const risky = deliveryRiskOrders(state);
      const lines = risky.map((x) => `${x.order.poNumber} \u2014 due ${x.order.deliveryDeadline}: ${x.risk.reasons.join(' ')}`);
      return {
        title: 'Orders at delivery risk',
        body: `${risky.length} order(s) flag a delivery risk.\n` + (lines.join('\n') || 'None.'),
        source: risky.map((x) => x.order.poNumber),
      };
    },
  },
  {
    id: 'payments-pending',
    test: /(payments? pending|payment due|unpaid|outstanding payment|how much is owed)/i,
    run(state) {
      const d = dashboard(state);
      const lines = d.unpaidInvoices.map((i) => `${i.number} \u2014 ${money(i.amount)}, due ${i.dueDate}.`);
      return {
        title: 'Payments pending',
        body: `${money(d.paymentsPending)} is outstanding across ${d.unpaidInvoices.length} invoice(s).\n` + (lines.join('\n') || 'None.'),
        source: d.unpaidInvoices.map((i) => i.number),
      };
    },
  },
  {
    id: 'oem-pending',
    test: /(oem response|oem responses|awaiting oem|oem pending|chasing oem)/i,
    run(state) {
      const d = dashboard(state);
      const lines = d.oemPending.map((x) => `${x.oem ? x.oem.name : 'OEM'} \u2014 ${x.requirement ? x.requirement.ref : ''}, waiting ${x.aging} day(s).`);
      return {
        title: 'OEM responses pending',
        body: `${d.oemPendingCount} OEM request(s) have no response yet.\n` + (lines.join('\n') || 'None.'),
        source: d.oemPending.map((x) => x.request.id),
      };
    },
  },
  {
    id: 'documents-expiring',
    test: /(documents? expir|expiring|expiry|renew)/i,
    run(state) {
      const docs = documentsExpiring(state, 90);
      const lines = docs.map((x) => `${x.doc.title} \u2014 expires ${x.doc.expiryDate} (${x.s.days < 0 ? 'expired' : x.s.days + ' days'}).`);
      return {
        title: 'Documents expiring',
        body: `${docs.length} document(s) expire within 90 days or have already expired.\n` + (lines.join('\n') || 'None.'),
        source: docs.map((x) => x.doc.id),
      };
    },
  },
  {
    id: 'coverage',
    test: /(coverage|uncovered|shortfall|not covered|quantity gap)/i,
    run(state) {
      const rows = (state.requirements || [])
        .filter((r) => ['quoted', 'submitted', 'won'].includes(r.status))
        .map((r) => ({ r, c: coverage(state, r.id) }))
        .filter((x) => x.c.uncovered > 0);
      const lines = rows.map((x) => `${x.r.ref} \u2014 required ${num(x.c.required)}, committed ${num(x.c.committed)}, uncovered ${num(x.c.uncovered)}.`);
      return {
        title: 'Uncovered quantity',
        body: `${rows.length} requirement(s) have an uncovered balance.\n` + (lines.join('\n') || 'None.'),
        source: rows.map((x) => x.r.ref),
      };
    },
  },
  {
    id: 'quotes-awaiting',
    test: /(quotes? awaiting|quotes? pending|awaiting response|response from the (agency|government))/i,
    run(state) {
      const d = dashboard(state);
      const lines = d.quotesAwaiting.map((r) => `${r.ref} \u2014 ${r.agency}, submitted, deadline ${r.submissionDeadline}.`);
      return {
        title: 'Quotes awaiting a response',
        body: `${d.quotesAwaiting.length} requirement(s) are submitted and awaiting a response; ${d.quotesPendingApproval.length} quote(s) await internal approval.\n` + (lines.join('\n') || 'None.'),
        source: d.quotesAwaiting.map((r) => r.ref),
      };
    },
  },
  {
    id: 'money-at-risk',
    test: /(money at risk|value at risk|at risk in|how much is at risk)/i,
    run(state) {
      const m = moneyAtRisk(state);
      return {
        title: 'Money at risk',
        body: `${money(m.total)} is at risk: ${money(m.deliveryValue)} on orders flagged for delivery risk, and ${money(m.coverageGapValue)} on uncovered quantities.`,
        source: [
          ...m.riskyOrders.map((x) => x.order.poNumber),
          ...m.coverageGaps.map((x) => x.requirement.ref),
        ],
      };
    },
  },
  {
    id: 'comparables',
    test: /(comparable|similar requirement|past bids?|history for)/i,
    run(state) {
      const byCat = {};
      for (const r of state.requirements || []) {
        const q = (state.quotes || []).find((x) => x.requirementId === r.id);
        if (q) byCat[r.category] = (byCat[r.category] || 0) + 1;
      }
      const lines = Object.entries(byCat).map(([c, n]) => `${c}: ${n} quoted requirement(s) on record.`);
      return {
        title: 'Comparable history',
        body: 'Quoted history is held by category. Open a requirement and the comparables panel shows the prior bids, won or lost, before pricing.\n' + lines.join('\n'),
        source: Object.keys(byCat),
      };
    },
  },
];

export function suggestedQuestions() {
  return [
    'How many orders are open?',
    'How many contracts did we win this month?',
    'What did we lose?',
    'Why did we lose them?',
    'Which orders are at delivery risk?',
    'What payments are pending?',
    'Which OEM responses are pending?',
    'Which documents are expiring?',
    'What quantity is uncovered?',
    'How much money is at risk?',
  ];
}

export function answer(state, question) {
  const q = String(question || '').trim();
  if (!q) {
    return { matched: false, title: 'Not recorded', body: 'Ask a question first.', source: [] };
  }
  for (const intent of intents) {
    if (intent.test.test(q)) {
      const result = intent.run(state);
      return { matched: true, id: intent.id, question: q, ...result };
    }
  }
  return {
    matched: false,
    question: q,
    title: 'Not recorded',
    body:
      'Not recorded. I can only answer from the data stored here, and I do not recognise that question. ' +
      'I will not invent a figure. Try one of the suggested questions, or open the relevant section.',
    source: [],
  };
}
