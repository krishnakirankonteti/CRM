# REPORT.md

Project: `ram-crm` — Defence Contract Desk, a dashboard-first build of the PRD for a defence
contract consultant. Run it with `npm start` (or `node server.js`) and open
`http://127.0.0.1:5173`.

## Status per part

**Project scaffold: DONE**
  evidence: `node server.js` -> `ram-crm serving C:\Users\krish\Downloads\FWAI_Project\ram-crm at http://127.0.0.1:5173`; `Invoke-WebRequest` returned `200` for `/`, `/styles.css`, `/js/app.js`, `/js/data.js` and each view module.

**Data model, seed, validators, selectors: DONE**
  evidence: `node --test` -> `tests 17, pass 17, fail 0` (see the ledger for what each test covers).

**Morning view (dashboard): DONE**
  evidence: `shots/dashboard-1440.png` and `shots/dashboard-375.png`, rendered over CDP; the six questions and the money-at-risk figure are computed from records, not typed in.

**Requirement and RFI, with line items and statuses (PRD 1): DONE**
  evidence: `shots/coverage-1440.png`; 15 seeded requirements, each with line items; status set through a validated action.

**Quantity coverage, firm vs availability, uncovered balance (PRD 3): DONE**
  evidence: `shots/coverage-1440.png` (required 500, firm 300, uncovered 200, 60% meter); test `coverage: firm commitments cover, availability indications do not` asserts 1000/600+400=1000 uncovered 0 and 600 firm vs 200 availability.

**OEM master and sourcing (PRD 2): DONE**
  evidence: OEM list and detail render; each request carries type, price, lead time and aging.

**Quotation, comparables, approval (PRD 4): DONE**
  evidence: quote register and version history render; comparables panel reads prior same-category bids; approval action records who and when.

**Order and PO, no orphan PO (PRD 6): DONE**
  evidence: test `invariant: every PO maps to an approved quote` passes and `validateOrder` refuses a draft-quote PO; PO detail renders.

**Fulfilment, PDI, partial delivery, delivery risk (PRD 7): DONE**
  evidence: `shots/order-pdi-1440.png` (offered 300 / cleared 0 / rejected 300, failed, dispatch blocked); tests for PDI distinctness, delivery risk and partial delivery pass.

**Payments, commission, document vault (PRD 8): DONE**
  evidence: money and documents views render with outstanding balances and expiry states; payment validator refuses over-balance amounts (test passes).

**Search, history, structured losses, plain-language answers (PRD 9, 10): DONE**
  evidence: `node tools/interact.mjs` -> ask returns `There are 6 open orders...`; an unrecognised question returns `Not recorded...`; loss breakdown groups by structured reason.

**Requirement fingerprinting: DONE**
  evidence: `shots/fingerprint-1440.png` and the dashboard section; REQ-2024-004 code `CONN-NAVY-B3-MILDTL38999` matches REQ-2024-008 at 50%. Test `fingerprinting: same shape of requirement shares a code and finds prior matches` passes.

**Deadline-chain view: DONE**
  evidence: `shots/dashboard-1440.png` "Deadline chain" section; PO-3002 breach (`PDI passed is blocked`), PO-3005 breach (slack -4 d), PO-3003 ok (+17 d). Test `deadline chain: names the binding constraint and computes slack` passes.

**Capacity collision warning: DONE**
  evidence: `shots/dashboard-1440.png` and `shots/capacity-1440.png`; Aureus 104% and Bluewave 120% show as collisions, Orion 98% as tight. Tests `capacity collision: ...` and `a firm commitment beyond capacity warns and still saves` pass. Shown as advisory, because the global-vs-per-order reading is C-10 and unconfirmed.

**Roles, approvals, audit (PRD 11): PARTIAL**
  evidence: approvals and an audit trail exist and render; per-role permissions are not enforced, because stage 1 has no authentication or user accounts. This is the TECH-STACK stage boundary, not an oversight.

**Deployment: NOT DONE** — not requested, and a deploy publishes publicly. The folder is static-hosting ready; AGENTS.md section 5 applies when it is deployed.

## What broke and how I fixed it

1. **Blank page on first browser load.** `--dump-dom` returned only the 957-byte shell. `node --check`
   found a `SyntaxError: Unexpected token '}'` at `js/views/requirements.js:166`. Cause: two malformed
   closers (`\` }) }),` where a card and a section were closed). Fixed both; every module then passed
   `node --check`.
2. **A flagged order showed ₹0 at risk.** PO-3004 is delivered but not accepted, so undelivered value is
   zero while its unpaid invoice is the real exposure. Added `orderExposure` = the larger of undelivered
   value and unpaid value, so the head-line figure and the table agree.
3. **`&MIDDOT;` rendered as literal text** in three section eyebrows, because `section()` escapes its
   inputs. Replaced the entity with the character `\u00B7`.
4. **Pages looked clipped at 375px.** Cause was the test, not the layout: Edge enforces a ~500px minimum
   window, so `--window-size=375` produced a 496px viewport and the image cropped it. Verified the real
   layout over CDP: at a true 375px viewport `innerWidth = 375, scrollWidth = 375`, so the page does not
   scroll sideways.
5. **Form validation used the browser's `required`** instead of the app's clear reasons. Added
   `novalidate` to the modal form so the app's validator is the single source of truth; the empty form
   now shows `Nothing was saved.` plus each reason, and stays open.

## Claims ledger

| Claim | Command that proves it | Result |
|---|---|---|
| All modules are syntactically valid | `node --check <file>` per module | 16/16 `ok` |
| The invariants hold | `node --test` | `pass 17, fail 0` |
| Fingerprinting finds prior matches | `node --test` -> `fingerprinting: ...` | `pass`; REQ-2024-004 matches REQ-2024-008 at 50% |
| The deadline chain names the binding link | `node --test` -> `deadline chain: ...` | `pass`; PO-3002 breach, PO-3003 ok |
| Capacity collisions are flagged | `node --test` -> capacity tests | `pass`; Aureus 2600/2500 and Bluewave 2400/2000 collide |
| The dev server cannot be walked out of its folder | `curl` `/%2e%2e/..%2f..%2fWindows%2fwin.ini` | `403`; `/` and `/js/app.js` still `200` |
| Acceptance closes an order | `node --test` -> `recording acceptance closes the order...` | `pass`; open orders 6 -> 5 |
| A lost status cannot bypass the reason | `node --test` -> `a requirement cannot be marked lost...` | `pass`; status unchanged |
| The app is served locally | `node server.js`; `Invoke-WebRequest` | `200` on shell and every module |
| The dashboard renders and computes | CDP screenshot + Runtime.evaluate | `shots/dashboard-1440.png`, 431 view nodes |
| No horizontal page overflow at 375px | `node tools/shoot.mjs ... 375` | `innerWidth: 375, scrollWidth: 375` |
| Answers come from records only | `node tools/interact.mjs` | `There are 6 open orders...`; unknown -> `Not recorded...` |
| Forms reject and save nothing | `node tools/interact.mjs` | `Nothing was saved.` + 5 reasons; modal open |
| Two external references are real | not fetched | **UNVERIFIED** — the Drive templates folder and `how-it-was-built.vercel.app` were never opened |
| Brand kit was provided | folder listing | **UNVERIFIED/NONE** — no palette or logo was supplied; per AGENTS.md 3c I built one direction of my own |

## What I would tell the next person

- **Read `PRD.md` section 2 first.** The contradiction between the "Downtime Cost Board" idea and this
  CRM requirement is still unresolved; this build answers the CRM requirement, and the open decisions
  (currency C-02, capacity C-10, commission C-11, document creation C-12) are shown *on screen*, not
  silently decided. Do not remove those callouts until the client answers.
- **This is stage 1.** One browser, demonstration data, `localStorage` persistence only. There is no
  authentication, no shared server data and no backup. Do not put live commercial data in it before
  that changes.
- **Do not add a document generator or auto-messaging** until C-12 is answered and the client accepts
  the change to the "not building" list.
- **The plain-language feature is deliberately model-free.** If you add a model, keep the contract:
  every answer must cite records and say "not recorded" when the data is absent.
- **Screenshots are driven by `tools/shoot.mjs`** (exact viewport, with a layout-width report) and
  `tools/interact.mjs` (drives the UI and prints what it returned). Use a fresh browser profile or CDP
  `Network.setCacheDisabled`; Edge caches ES modules across runs and will show you stale code.
