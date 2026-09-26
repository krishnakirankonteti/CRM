# IMPLEMENTATION-PLAN.md

Project: `ram-crm`.
Read `PRD.md` (what and for whom), then `TECH-STACK.md` (how), then this plan (in what order).

## Deviation from the PRD phasing, stated up front

The PRD phases the morning view last (Phase 5), because the client said the first three modules
matter most. **The direct instruction for this build was "build this CRM dashboard", so the
morning view is built first as the home screen.** That reorder is intentional and is recorded here
rather than done quietly. The underlying modules the dashboard reads from (requirements, OEM
coverage, orders, deliveries, payments, documents) are built with it, because a dashboard over
empty data would be a mock, not a product.

## Slice order

Every slice: build it, run it, read the real output, record it in `WORKLOG.md`, then take the next.
The first three PRD modules stay first in *fidelity*: requirements, OEM sourcing and coverage are
built deepest.

| # | Slice | Proves |
|---|---|---|
| 0 | PRD, TECH-STACK, this plan | the brief exists before code |
| 1 | Shell: `server.js`, `index.html`, `styles.css`, router | the app serves and navigates |
| 2 | `data.js` seed + `validate.js` | records exist; missing fields are rejected |
| 3 | `selectors.js` + `test/invariants.test.js` | coverage, balances, risk and losses are computed, not typed in |
| 4 | Morning view (dashboard) | the six questions answered from records |
| 5 | Requirements + coverage panel | required / committed / uncovered, firm vs availability |
| 6 | OEM master + sourcing | shortlist, requests, responses, aging |
| 7 | Quotes + comparables + approval | pricing sees history; approval carries who/when |
| 8 | Orders/PO + fulfilment + PDI + delivery | no orphan PO; PDI offered/cleared/rejected kept apart; delivery risk flagged |
| 9 | Money + commission + documents vault | partial payments, balances, expiry reminders |
| 10 | History + structured losses + plain-language ask | comparables and loss analytics from records |
| 11 | Responsive pass, screenshots at 1440 and 375, REPORT | it looks right and it is proven |

## Invariants enforced in code, not just drawn on a screen

These are the PRD's "rules that must hold". Each has a test in `test/invariants.test.js`:

1. Every quotation comes from an RFI.
2. Every PO maps to an approved quotation — an orphan PO is detectable and flagged.
3. Many line items per requirement; many invoices per PO; many deliveries per invoice.
4. Partial deliveries and partial payments are normal, and the outstanding balance is computed.
5. Quantity balance is visible: requested, committed, uncovered.
6. PDI cleared is distinct from offered and rejected.
7. OEM commitments are distinct from availability indications — only firm quantities cover.
8. Commission follows an OEM-payment milestone.
9. Document expiry is trackable.
10. Forms reject missing required fields with a clear reason and save nothing (AGENTS.md section 3).

## What this build deliberately does not do yet

- No authentication, no server-side storage, no multi-user (see TECH-STACK section 5).
- No document generation or auto-messaging (PRD section 5; open question C-12).
- No automatic bid price and no automatic OEM choice (PRD section 5).
- Commission and currency are shown with the open decisions **visible on screen**, not silently
  decided (PRD C-02, C-11).
