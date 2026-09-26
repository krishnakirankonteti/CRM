# WORKLOG

One line per slice: what I did -> the command I ran -> what it actually printed.

1. Carried the brief into a new project folder -> `New-Item`/`Copy-Item` for `ram-crm` -> listed `AGENTS.md, kilo.jsonc, PRD.md, README.md`.
2. Wrote the two missing plan documents -> `write TECH-STACK.md`, `write IMPLEMENTATION-PLAN.md` -> both written; deviation from PRD phasing recorded in the plan.
3. Scaffolded a zero-dependency app -> `node server.js` -> `ram-crm serving C:\Users\krish\Downloads\FWAI_Project\ram-crm at http://127.0.0.1:5173`.
4. Proved every asset is served -> `Invoke-WebRequest` on `/`, `/styles.css`, `/js/app.js`, `/js/data.js`, `/js/views/dashboard.js`, `/js/views/requirements.js`, `/js/ask.js` -> `200` for all, correct content types.
5. Wrote the data model, seed, validators, selectors, store, ask, views, router -> `node --check` on every module -> all `ok` after two fixes (below).
6. Proved the invariants -> `node --test` -> `tests 10, pass 10, fail 0` (coverage, orphan PO, PDI distinct, delivery risk, partial delivery, form rejection, PO gate, store save-nothing, ask grounded, structured losses).
7. First browser look -> `msedge --headless --screenshot` -> blank page; `--dump-dom` was 957 bytes (shell only); `node --check` found `SyntaxError: Unexpected token '}'` in `js/views/requirements.js:166`. Fixed two malformed closers; re-ran -> `syntax ok`.
8. Second browser look -> screenshot at 1440 -> dashboard rendered (154 KB PNG). Noticed a flagged order showing ₹0 at risk.
9. Corrected the exposure figure -> edited `js/selectors.js` + `js/views/dashboard.js` -> `node --test` still `pass 10`; at-risk headline moved to ₹10.78 Cr (₹4.99 Cr flagged orders + ₹5.8 Cr coverage gap).
10. Saw `&MIDDOT;` as literal text -> fixed the three `section({eyebrow})` strings -> re-shot -> `MODULE 3 · THE HARD PART` renders.
11. Investigated 375px clipping -> `--window-size=375` gave `data-innerwidth="496"` (Edge minimum); wrote `tools/shoot.mjs` to set a true viewport over CDP -> `w=375 {"innerWidth":375,"scrollWidth":375,...}` (no horizontal overflow); `w=1440 {"innerWidth":1440,"scrollWidth":1425}`.
12. Proved the interactive paths -> `node tools/interact.mjs` -> ask returns `There are 6 open orders...`; unknown question returns `Not recorded...`; empty New-requirement form returns `Nothing was saved. | Agency or customer is required. | Product is required. | Quantity must be greater than zero. | Submission deadline is required. | Required delivery date is required.` with the modal still open.
13. Fixed form validation to fail on our rules rather than the browser's -> added `novalidate` -> re-ran on a fresh browser -> `novalidate: true`, error list populated, modal stayed open.
14. Code review of the new project (no git repo, so the whole folder was the change set) -> `node --test` and manual review -> 3 warnings + 2 suggestions; fixed all five: server path guard, the `lost`-status bypass, the missing acceptance action, the modal keydown leak, and unused imports.
15. Re-verified after the fixes -> `node --test` -> `tests 13, pass 13`; `curl` encoded traversal -> `403`; `node tools/interact.mjs` -> status options for an active requirement are `["received","qualifying","quoted","submitted","won","cancelled"]` (no `lost`); `shots/order-accept-1440.png` shows the `Mark accepted` button.
16. Added three features: requirement fingerprinting, deadline-chain view, and OEM capacity collision warning (data, selectors, dashboard sections, detail panels, an advisory over-commitment warning) -> `node --test` -> `tests 17, pass 17`.
17. Verified the new UI in the browser -> `node tools/shoot.mjs` -> dashboard at 1440 and 375 (`innerWidth 375, scrollWidth 375`), `shots/fingerprint-1440.png`, `shots/capacity-1440.png`; read the screenshots: capacity shows Bluewave 120% and Aureus 104% as collisions, the chain shows 3 breaches, fingerprints show REQ-2024-004 matching REQ-2024-008 at 50%.
