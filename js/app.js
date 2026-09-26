import { CURRENCIES } from './format.js';
import { dashboard } from './selectors.js';
import * as store from './store.js';
import * as dashboardView from './views/dashboard.js';
import * as requirementsView from './views/requirements.js';
import * as oemsView from './views/oems.js';
import * as quotesView from './views/quotes.js';
import * as ordersView from './views/orders.js';
import * as moneyView from './views/money.js';
import * as documentsView from './views/documents.js';
import * as historyView from './views/history.js';
import * as askView from './views/ask.js';

const NAV = [
  { section: 'dashboard', hash: '#/dashboard', label: 'Morning view', count: (s) => dashboard(s).openOrderCount },
  { section: 'requirements', hash: '#/requirements', label: 'Requirements', count: (s) => s.requirements.length },
  { section: 'oems', hash: '#/oems', label: 'OEMs', count: (s) => s.oems.length },
  { section: 'quotes', hash: '#/quotes', label: 'Quotes', count: (s) => s.quotes.filter((q) => q.state === 'pending approval').length },
  { section: 'orders', hash: '#/orders', label: 'Orders', count: (s) => dashboard(s).openOrderCount },
  { section: 'money', hash: '#/money', label: 'Money', count: (s) => dashboard(s).unpaidInvoices.length },
  { section: 'documents', hash: '#/documents', label: 'Documents', count: (s) => dashboard(s).docsExpiring.length },
  { section: 'history', hash: '#/history', label: 'History & losses', count: (s) => s.requirements.filter((r) => r.status === 'lost').length },
  { section: 'ask', hash: '#/ask', label: 'Ask', count: null },
];

const VIEWS = {
  dashboard: dashboardView,
  requirements: requirementsView,
  oems: oemsView,
  quotes: quotesView,
  orders: ordersView,
  money: moneyView,
  documents: documentsView,
  history: historyView,
  ask: askView,
};

const TITLES = {
  dashboard: 'Morning view',
  requirements: 'Requirements and RFIs',
  oems: 'OEM master',
  quotes: 'Quotations',
  orders: 'Orders and POs',
  money: 'Payments and commission',
  documents: 'Documents and expiry',
  history: 'Search, history and losses',
  ask: 'Ask the desk',
};

function parseHash() {
  const raw = (window.location.hash || '#/dashboard').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const section = parts[0] || 'dashboard';
  return { section: VIEWS[section] ? section : 'dashboard', id: parts[1] || null };
}

function sidebarHtml(state, route) {
  const items = NAV.map((item) => {
    const active = item.section === route.section ? ' aria-current="page"' : '';
    const count = item.count ? item.count(state) : null;
    return `<a class="nav__item" href="${item.hash}"${active}>
      <span>${item.label}</span>
      ${count != null ? `<span class="nav__count">${count}</span>` : ''}
    </a>`;
  }).join('');
  return `
    <div class="brand">
      <span class="brand__mark">Defence Contract Desk</span>
      <span class="brand__sub">Ram Prasad &middot; RFI to payment</span>
    </div>
    <nav class="nav">${items}</nav>
    <div class="sidebar__foot">
      <p class="sidebar__note">One requirement, one record, one timeline. Every figure on every screen is computed from the records, never typed in.</p>
    </div>`;
}

function topbarHtml(state, route) {
  const opts = Object.entries(CURRENCIES)
    .map(([code, c]) => `<option value="${code}" ${code === state.meta.currency ? 'selected' : ''}>${c.label}</option>`)
    .join('');
  return `
    <span class="topbar__title">${TITLES[route.section] || 'Morning view'}</span>
    <div class="topbar__right">
      <label class="currency-pick" for="currency">Currency
        <select id="currency">${opts}</select>
      </label>
      <button class="btn btn--sm" data-action="reset">Reset demo data</button>
    </div>`;
}

const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const topbar = document.getElementById('topbar');
const viewEl = document.getElementById('view');

let lastSection = null;

function render() {
  const state = store.getState();
  const route = parseHash();
  const view = VIEWS[route.section] || VIEWS.dashboard;

  document.title = `${TITLES[route.section] || 'Morning view'} · Defence Contract Desk`;
  sidebar.innerHTML = sidebarHtml(state, route);
  topbar.innerHTML = topbarHtml(state, route);

  topbar.querySelector('#currency').addEventListener('change', (e) => store.setCurrency(e.target.value));
  topbar.querySelector('[data-action="reset"]').addEventListener('click', () => {
    if (window.confirm('Reset all demo data back to the seeded records?')) store.reset();
  });

  viewEl.innerHTML = view.render(state, route);
  if (view.mount) view.mount(state, route, viewEl);

  if (lastSection !== route.section) {
    viewEl.focus({ preventScroll: true });
    lastSection = route.section;
  }
}

viewEl.addEventListener('click', (e) => {
  if (e.target.closest('a, button, select, input, textarea, label')) return;
  const row = e.target.closest('[data-href]');
  if (row) window.location.hash = row.getAttribute('data-href');
});

window.addEventListener('hashchange', render);
store.subscribe(() => render());

if (!window.location.hash) window.location.hash = '#/dashboard';
render();
