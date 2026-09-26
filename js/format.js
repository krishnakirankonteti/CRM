export const CURRENCIES = {
  INR: { symbol: '\u20B9', label: 'INR \u20B9' },
  AED: { symbol: '\u062F.\u0625', label: 'AED \u062F.\u0625' },
  USD: { symbol: '$', label: 'USD $' },
};

export function symbolOf(code) {
  return (CURRENCIES[code] || CURRENCIES.INR).symbol;
}

export function todayISO() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function isoDaysFromNow(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diffDays(fromISO, toISO) {
  if (!fromISO || !toISO) return null;
  const a = Date.parse(fromISO + 'T00:00:00Z');
  const b = Date.parse(toISO + 'T00:00:00Z');
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

export function fmtDate(iso) {
  if (!iso) return '\u2014';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateShort(iso) {
  if (!iso) return '\u2014';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function num(value) {
  if (value == null || Number.isNaN(Number(value))) return '\u2014';
  return Number(value).toLocaleString('en-IN');
}

// Compact money for headline figures: Cr / L / thousands.
export function money(value, symbol = '\u20B9') {
  if (value == null || Number.isNaN(Number(value))) return '\u2014';
  const v = Number(value);
  const abs = Math.abs(v);
  if (abs >= 1e7) return symbol + trim(v / 1e7) + ' Cr';
  if (abs >= 1e5) return symbol + trim(v / 1e5) + ' L';
  return symbol + num(v);
}

// Exact money for ledgers and invoices.
export function moneyExact(value, symbol = '\u20B9') {
  if (value == null || Number.isNaN(Number(value))) return '\u2014';
  return symbol + num(Math.round(Number(value)));
}

function trim(n) {
  const s = n.toFixed(2);
  return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export function pct(part, whole) {
  if (!whole) return '0%';
  return Math.round((part / whole) * 100) + '%';
}

export function durationLabel(days) {
  if (days == null) return '\u2014';
  const a = Math.abs(days);
  const unit = a === 1 ? 'day' : 'days';
  return a + ' ' + unit;
}
