import { badge, card, esc, section, table, openModal } from '../components.js';
import { fmtDate, money, symbolOf, todayISO } from '../format.js';
import * as store from '../store.js';

export function render(state) {
  const s = symbolOf(state.meta.currency);
  const paidFor = (id) => state.payments.filter((p) => p.invoiceId === id).reduce((a, p) => a + Number(p.amount), 0);

  const invoiceRows = state.invoices.map((i) => {
    const paid = paidFor(i.id);
    const outstanding = i.amount - paid;
    return {
      cells: [
        `<a href="#/orders/${i.orderId}">${esc(i.number)}</a>`,
        esc(i.orderId),
        money(i.amount, s),
        money(paid, s),
        `<strong>${money(outstanding, s)}</strong>`,
        fmtDate(i.issueDate),
        fmtDate(i.dueDate),
        badge(i.status),
        outstanding > 0 ? `<button class="btn btn--sm" data-action="pay" data-invoice="${i.id}">Record payment</button>` : '',
      ],
    };
  });

  const paymentRows = state.payments
    .slice()
    .sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)))
    .map((p) => ({
      cells: [esc(p.id), esc(p.invoiceId), money(p.amount, s), fmtDate(p.paidAt), esc(p.method)],
    }));

  const commissionRows = state.commissions.map((c) => ({
    cells: [
      esc(c.orderId),
      esc(c.milestone),
      money(c.amount, s),
      badge(c.status),
      c.earnedAt ? fmtDate(c.earnedAt) : '\u2014',
    ],
  }));

  const totalInvoiced = state.invoices.reduce((a, i) => a + i.amount, 0);
  const totalPaid = state.payments.reduce((a, p) => a + Number(p.amount), 0);

  return `
  <div class="page-head">
    <div class="eyebrow">Module 8 &middot; money</div>
    <h1>Payments, invoices and commission</h1>
    <p class="page-head__lead">Partial payments are normal, and the outstanding balance is always visible. This is not the books: it mirrors order-related money. Commission follows an OEM-payment milestone, and the exact milestone is still an open decision (C-11).</p>
  </div>

  ${section({
    title: 'Position',
    body: `<div class="grid grid--kpi">
      <div class="card kpi"><span class="kpi__label">Invoiced</span><span class="kpi__value">${money(totalInvoiced, s)}</span></div>
      <div class="card kpi kpi--ok"><span class="kpi__label">Received</span><span class="kpi__value">${money(totalPaid, s)}</span></div>
      <div class="card kpi kpi--risk"><span class="kpi__label">Outstanding</span><span class="kpi__value">${money(totalInvoiced - totalPaid, s)}</span></div>
    </div>`,
  })}

  ${section({
    title: `Invoices (${state.invoices.length})`,
    lead: 'One PO can carry several invoices; one invoice can be fulfilled by several delivery events.',
    body: card({ body: table({ head: [
      { label: 'Invoice' }, { label: 'Order' }, { label: 'Amount', num: true }, { label: 'Paid', num: true },
      { label: 'Outstanding', num: true }, { label: 'Issued' }, { label: 'Due' }, { label: 'Status' }, { label: '' },
    ], rows: invoiceRows, empty: 'No invoices.' }), flush: true }),
  })}

  ${section({
    title: 'Payment ledger',
    body: card({ body: table({ head: [
      { label: 'Payment' }, { label: 'Invoice' }, { label: 'Amount', num: true }, { label: 'Date' }, { label: 'Method' },
    ], rows: paymentRows, empty: 'No payments recorded.' }), flush: true }),
  })}

  ${section({
    title: 'Commission',
    lead: 'Earned on an OEM-payment milestone. Status is a record, not a settled entitlement until C-11 is answered.',
    body: card({ body: table({ head: [
      { label: 'Order' }, { label: 'Milestone' }, { label: 'Amount', num: true }, { label: 'Status' }, { label: 'Earned' },
    ], rows: commissionRows, empty: 'No commission recorded.' }), flush: true }),
  })}
  `;
}

export function mount(state, params, root) {
  root.querySelectorAll('[data-action="pay"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const invoiceId = btn.getAttribute('data-invoice');
      const invoice = state.invoices.find((i) => i.id === invoiceId);
      const paid = state.payments.filter((p) => p.invoiceId === invoiceId).reduce((a, p) => a + Number(p.amount), 0);
      openModal({
        title: `Record payment against ${invoice ? invoice.number : ''}`,
        lead: `Outstanding balance is ${money(invoice ? invoice.amount - paid : 0, symbolOf(state.meta.currency))}. A zero, negative or over-balance amount is refused and nothing is saved.`,
        fields: [
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'paidAt', label: 'Payment date', type: 'date', required: true, value: todayISO() },
          { name: 'method', label: 'Method', type: 'text', required: false, value: 'RTGS' },
        ],
        submitLabel: 'Record payment',
        onSubmit: (values) => store.recordPayment({ invoiceId, amount: values.amount, paidAt: values.paidAt, method: values.method }),
      });
    });
  });
}
