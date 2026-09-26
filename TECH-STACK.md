# TECH-STACK.md

Project: `ram-crm` — Defence Contract Desk.
Companion documents, read in order: `PRD.md`, then this file, then `IMPLEMENTATION-PLAN.md`.

This document answers *how*. The PRD deliberately answers only *what and for whom*.

## 1. The shape of the thing

A **single-page application** built from plain HTML, CSS and JavaScript modules. No framework, no
build step, no bundler, no package dependencies. It is served as static files.

Why this over a framework:

- **Provable in one sitting.** Nothing to install, so nothing to fail. `node server.js` and it runs.
- **No secrets, no keys, no environment variables.** AGENTS.md section 8 is satisfied by
  construction: there is no server-side secret and no `.env`.
- **Deploys as static hosting.** A static host (Vercel) serves the same folder with no build.
- **The dashboard is the product.** This is a decision-support screen, not a high-scale service. A
  framework would add cost and no capability for the current slice.

Trade-off accepted: no component model and no type checking, so discipline lives in the module
boundaries (data / validate / selectors / store / views) and in the test suite. If the tool later
needs multiple concurrent users and a shared database, this is replaced, not extended — see
"Stage boundary" below.

## 2. Stack

| Layer | Choice | Note |
|---|---|---|
| Markup | HTML5, one shell document | `index.html` |
| Styling | Hand-written CSS, custom properties | `styles.css`; one design direction, see section 4 |
| Behaviour | ES modules (native `import`) | `js/` — no transpilation |
| Data | In-memory seed dataset, generated relative to today | `js/data.js` |
| State | Single store module, mutations validated, persisted to `localStorage` | `js/store.js` |
| Computation | Pure selector functions | `js/selectors.js` — no DOM, fully testable |
| Validation | Pure validator functions | `js/validate.js` — no DOM, fully testable |
| Plain-language answers | Deterministic intent matching over stored data | `js/ask.js` — no model, so it cannot invent |
| Local server | Node built-in `http` module | `server.js` — zero dependencies |
| Tests | Node built-in test runner (`node:test`) | `test/invariants.test.js` — zero dependencies |
| Hosting target | Static hosting | not deployed in this session |

Runtime present on this machine: Node v24.14.0, npm 11.9.0.

### Why the plain-language feature uses no model

The PRD's rule is *"Answer from the stored data, never invented."* The most reliable way to
guarantee that in this slice is to not use a generative model at all: `js/ask.js` recognises a
fixed set of intents, answers by reading records, shows the records it read, and replies
"not recorded" when nothing matches. That is a truthful demonstration of the requirement, and it
needs no key. A model can be added later *behind* the same traceability contract — every answer
must still cite records — but it is not required for this slice.

## 3. Module boundaries

```
ram-crm/
  index.html          shell
  styles.css          design system
  server.js           zero-dependency static server (local)
  package.json        start + test scripts
  js/
    format.js         money, dates, duration helpers
    validate.js       pure validators (forms must reject, save nothing)
    data.js           seed dataset, generated relative to today
    selectors.js      pure derived values (coverage, balances, risk, losses)
    store.js          state, validated mutations, localStorage persistence
    ask.js            deterministic plain-language answers
    components.js     shared HTML builders (cards, tables, badges, modal, form)
    app.js            router + shell
    views/
      dashboard.js    the morning view (home screen)
      requirements.js RFI list + detail with the coverage panel
      oems.js         OEM master + sourcing
      quotes.js       quotes, comparables, approval
      orders.js       PO, fulfilment timeline, PDI, deliveries
      money.js        invoices, partial payments, commission
      documents.js    compliance vault + expiry
      history.js      comparable history + structured losses
  test/
    invariants.test.js
```

Dependency direction is one-way: `views → components → store → selectors → validate → data`, with
`format` and `ask` as leaves. No view computes money or coverage itself; it calls a selector. That
is what makes the numbers trustworthy and testable.

## 4. Design direction

No brand kit was supplied with the project, so, per AGENTS.md section 3c, this is one strong
direction of our own, applied consistently across every screen:

- **Ground:** warm light neutral `#F4F2ED`; surfaces white; hairline rules `#E2DED5`.
- **Ink:** `#171A1F` body text; `#5E6672` muted.
- **Accent (primary):** deep teal `#124E66`, used sparingly — active nav, primary buttons, one
  rule or headline word.
- **Semantic:** risk `#B3261E`, warning `#9A6400`, ok `#1E6B3A`.
- **Type:** a serif display face for titles and the brand (Iowan Old Style / Palatino / Georgia),
  a UI sans for everything else (Segoe UI / system stack), a mono face for figures.
- **Space:** section rhythm of 56px on phones and 96px on laptops; one idea per section.
- **Responsive:** single column below 760px, tap targets at least 44px, nothing scrolls sideways.

## 5. Stage boundary (what this stack is not)

This is **stage 1**: one consultant, one browser, demonstration-grade data. It is not yet the
system of record. Deliberately absent: shared multi-user data, authentication, server-side
storage, backup, and any messaging. Those become necessary before this holds live commercial data,
and they change the stack, not just add to it. This is recorded so the boundary is honest rather
than discovered later.
