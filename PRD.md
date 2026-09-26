# DRAFT — Product Requirements Document

**Status:** DRAFT. Not client-facing until the contradictions below are answered.
**Scope of this document:** it answers one question only — *what are we building, and for whom?* It does not answer how. No technology, tooling or architecture appears anywhere in this document.

> ## READ SECTION 2 FIRST
> Section 2 lists the things that do not add up. Do not start designing, pricing or promising a date until every item there is either answered by the client or decided by you in writing. Several of them change the size of the build, not just the wording.
>
> **The single biggest one: the "idea" and the "requirement" are two different products.** The idea line describes a *Downtime Cost Board* — open interface failures, an owner per failure, Dirhams at risk per hour, a ticket list, an IT manager on a call. The requirement document describes a *CRM for a defence contract consultant* — Ram Prasad, RFIs and tenders, OEM sourcing, quotations, POs, PDI, commission. They share a currency-shaped word and nothing else. This PRD is written for the **defence contract consultant** requirement, because that is the only one supplied as a requirement document. If the Downtime Cost Board is the actual product, this is the wrong document and the CRM requirement was pasted in error. Decide before anything else.

---

## 1. What was said, and what it means for the build

The client's own phrases, quoted, each translated into what it costs to build.

| Client said | What it means for the build |
|---|---|
| *"Roughly 25 to 30 enquiries a month, about 20 quotations, about 10 orders, and 20 to 25 active orders at any time."* | The working set is small: at most a few dozen live orders and ~a hundred records a month. No scale pressure, but ~2.5–3 enquiries are needed per order — so most opportunities are lost, and loss capture is a first-class feature, not an afterthought. |
| *"Today it runs on Excel, email and memory."* | There is no reliable system of record today. "Memory" cannot be migrated. The tool must be at least as fast to log into as firing off an email, or it will not be used, and anything depending on history is only as good as what can be imported from spreadsheets (see C-04, C-05). |
| *"Quotation prep takes 3 to 4 days (partly because it is never urgent)."* | Quote preparation is the headline pain, but the client himself says it is not urgent — so speed is a *reported* pain, not a proven one. Build the quote around reuse of history and coverage data, not around raw speed alone. |
| *"OEM communication 1 to 10 days."* | A 10× spread is where risk hides. Every OEM request needs an aging clock — how long it has been outstanding — not just a status. |
| *"document creation about 1 week."* | Documents are a distinct, large time sink. But we do not yet know what "document creation" means (see C-12). Do not build a document engine until that is answered; build the vault and the links first. |
| *"follow-ups 3 to 4 hours a day."* | The largest single recurring cost in the business — roughly half a working week. Automatic follow-up task creation is the highest-return feature in the whole requirement. |
| *"History is not searchable, so every new quote starts from scratch."* | Search over past comparable requirements is a core feature, and it is the input to pricing. It is also blocked on knowing which historical columns can be trusted (C-05). |
| *"The central record is the RFI / tender requirement. Everything else hangs off it."* | This is the data model in one sentence. Every other record must point back to a requirement. Orphans are a defect, not a convenience. |
| *"up to 500 part numbers"* / *"not one giant text field."* | Line items are a real, sized object — up to 500 rows per requirement, each with its own quantity, price and coverage. Coverage and pricing must work per line, not just per requirement. |
| *"Show required quantity against OEM committed quantity, with the uncovered balance."* | A computed coverage number must be visible wherever a commitment is made: required, committed, uncovered. |
| *"Distinguish a firm quantity commitment from a mere availability or quote indication."* | Two distinct states on every OEM response. Only the firm state counts toward coverage; an indication never does. This is a data rule, not a label. |
| *"Do not let the team confidently commit to a quantity the OEMs have not covered."* | An enforced guard: committing to more than is firmly covered must produce a clear warning or block. This is an explicit validation rule. |
| *"Before pricing, show comparable past bids… He changes the bid from that history."* | History influences the price; the human sets it. Comparables must appear *before* the price field on the quote, with won/lost and the winning or losing price. |
| *"Version and approve quotes."* | Every quote revision is retained, and approval carries a who and a when. |
| *"Automatic follow-up tasks, for example no response for seven days."* | Time-based rules create assigned tasks. The threshold must be configurable; "seven days" is an example, not a fixed number (A-09). |
| *"Convert an approved quote to an order… No orphan PO: every PO maps to an approved quote."* | A hard referential rule: a PO cannot exist without an approved quote behind it. This is an invariant, not a preference. |
| *"One PO can have multiple invoices."* | One-to-many, and it must be visible which invoice covers which part of the PO. |
| *"PDI is quantified: quantity offered, cleared, rejected. A failed or held PDI can block dispatch."* | Three separate numbers that must never be collapsed into a single status. "Cleared" is distinct from "offered" and "rejected" at the data level, and a failed or held PDI is a gate on dispatch. |
| *"Support partial deliveries, with the outstanding balance visible."* | Partial is the normal case, not the exception. Outstanding balance is computed and shown at line and PO level. |
| *"Flag delivery risk early… so he is not asked 'where is our order?' before he knows."* | A proactive risk flag comparing expected completion against the committed deadline, surfaced before the client asks — not a report he has to go looking for. |
| *"Commission is earned on an OEM-payment milestone."* | Commission is tied to a payment event, and the payment flow itself is unresolved (C-11). Build the milestone hook, but do not fix its definition yet. |
| *"A document and compliance vault… expiry reminders. He keeps approved item lists that renew every 3 to 5 years."* | Expiry tracking and reminders on a multi-year horizon. The tool is expected to outlive several renewal cycles, so document metadata must be complete enough to be trusted years later. |
| *"Search all history for a comparable requirement, and surface the past OEM, price, delivery time, margin, documents and problems."* | Search returns a comparison across several fields — an OEM, a price, a delivery time, a margin, the documents, and the problems — not just matching text. |
| *"record a structured loss reason."* | A closed, reportable list of reasons. The labels are unconfirmed (C and open dependency). |
| *"The morning view answers: how many orders are open… quotes awaiting a response, orders at delivery risk, payments pending, OEM responses pending, documents expiring."* | Six fixed questions on one screen. This is the first thing built and the thing the client opens on a call. |
| *"He wants to ask in plain language… Answer from the stored data, never invented."* | Questions are answered only from records in the system. When the data is absent, the answer must say so rather than guess. This is a correctness and trust requirement, and it constrains everything built on top of it. |
| *"Roles: owner or management, sales, operations, finance."* | Four roles with different visibility and permissions. Building four roles for one person is waste; building one for four people is a permissions failure. The real headcount is unknown (C-15, A-04). |
| *"Approvals where the business needs them on quotes, documents, orders and compliance items."* | Configurable approval gates on four object types, with named approvers. |
| *"An audit trail of material changes: what, who, when."* | A change log on the fields that matter. "Material" is undefined (C-14, A-08). |
| *"Government and defence agencies send him requirements; he fulfils them through a network of OEM suppliers."* | The business is two-sided: inbound from agencies, outbound to OEMs. The tool is the middle. Neither side is assumed to log in (A-06). |

---

## 2. What does not add up

Each item below states the contradiction and the decision it forces. These are **not** resolved here, and no option is quietly chosen. Where this document has had to proceed, it says so and raises an assumption tag.

**C-01 — The idea and the requirement are two different products.**
*"My idea: Downtime Cost Board"* describes open interface failures, an owner, a platform, Dirhams at risk per hour, and an IT manager on a call. The requirement document describes a defence contract consultant's RFI-to-payment lifecycle. These cannot be the same product.
**You must decide:** which one are you selling? This PRD proceeds on the defence-contract requirement [A-01]. If the Downtime Cost Board is the real product, stop and start again.

**C-02 — Currency and jurisdiction.**
The idea line is denominated in *"Dirhams"*; the requirement document never states a currency, and the client's name and market suggest a different country. Defence compliance and money formats are jurisdiction-specific.
**You must decide:** which country and which currency the defence business operates in. Every money field, every report and every "at risk" total depends on it [A-02, A-03].

**C-03 — "Automatic follow-up tasks" versus "no auto-messaging as a baseline."**
Item 5 asks for automatic follow-ups. The "What NOT to build" list rules out *"auto-messaging as a baseline requirement."*
**You must decide:** does "automatic" mean the system **creates a task for a human**, or the system **sends the message itself**? These are different builds with different risk. This document assumes tasks-for-humans [A-22].

**C-04 — Answers "from the stored data, never invented" versus history that is "not searchable" and lives in "memory."**
The trust promise can only be kept over data that was actually captured. On day one, most history is in spreadsheets and heads.
**You must decide:** what is the source of truth on day one, and is the question-answering allowed to use imported spreadsheet columns of unknown reliability, or only system records (and say "not recorded" otherwise)?

**C-05 — Comparable-history features versus untrusted historical columns.**
Item 4 (comparable bids) and item 9 (search all history) are promised, but the client's own open question admits he does not know *"which historical Excel columns are trustworthy enough to power quote comparison."*
**You must decide:** ship history-dependent features before the data audit and accept they are only as good as the data, or hold them until the audit is done. This document holds them (Phase 5) [A-15].

**C-06 — Enterprise scope versus a one-person pain.**
Eleven modules, four roles, approvals, audit, PDI gates, partial payments — for a business doing ~10 orders a month, whose stated pain is a few hours a day and a slow quote.
**You must decide:** is this a lean tool that removes the follow-up hours and the multi-day quote, or the full eleven-module system? Both cannot be sold at once at a small-business price.

**C-07 — "Not a full accounting or ERP replacement" versus invoices, partial payments, reminders and commission.**
The requirement asks the tool to track invoices, partial payments, due dates and earned commission, while explicitly disclaiming accounting.
**You must decide:** where the accounting boundary sits. Does the system hold money owed and paid, or only mirror what finance already records elsewhere?

**C-08 — "No automatic final bid price" versus a "recommended price."**
Item 4 asks for a recommended price built from OEM price and target margin; the "What NOT to build" list forbids an automatic final bid price.
**You must decide:** is "recommended" a number the system calculates and the human accepts, or a suggestion the system never computes? If it may not be automatic, where does the recommendation come from?

**C-09 — Every PO from an approved quote versus coverage that can be below 100%.**
The rules say every PO maps to an approved quote; the coverage feature exists precisely because OEMs may not cover the full quantity.
**You must decide:** can a quote be approved, and a PO raised, with an uncovered balance — and if so, what warning or extra approval is required first?

**C-10 — OEM capacity: global or per order.** (The client's own open question.)
If OEM A can supply 1,000 and 700 is already committed elsewhere, does the system show 300 available?
**You must decide:** this before coverage is built, because it changes the coverage calculation everywhere.

**C-11 — Commission timing and the payment flow.** (The client's own open question.)
Who invoices whom, who pays the OEM, and when commission is actually earned are all unresolved; the client says to confirm with *"one real transaction."*
**You must decide:** the commission milestone cannot be built correctly until that transaction is walked through.

**C-12 — What "document creation" actually is.** (The client's own open question.)
Documents may be generated from data, reused, obtained from the OEM, or prepared by hand — a week of effort hinges on which.
**You must decide:** this before any document-generation capability is promised. This document assumes vault-and-link only [A-07].

**C-13 — "Shortlist the OEMs who can make it" versus "no OEM chosen without human approval."**
Shortlisting edges toward choosing.
**You must decide:** what "shortlist" is allowed to do — display candidates, rank them, or suggest one — without crossing into an automatic choice.

**C-14 — Audit trail of "material changes" with "material" undefined.**
**You must decide:** which fields count as material and are logged. This document assumes status, quantity, price, owner, dates and approvals [A-08].

**C-15 — Four roles versus an unknown headcount.**
**You must decide:** how many humans actually use this and who holds which role. Four roles for one person is waste; one role for four people is a permissions failure [A-04, A-05].

**C-16 — "From a 29-minute client call to a working CRM" versus an eleven-module build.**
The framing implies a near-immediate, template-driven delivery; the requirement describes a multi-phase system.
**You must decide:** what "working" means for the first delivery, and what you will say it does not yet do.

---

## 3. Who this is for

The actual humans, and what each is trying to get done.

**Ram Prasad — owner and principal consultant.** Runs everything. Wants to stop being the memory, to price from history instead of from scratch, and to answer "where is our order?" before he is asked. Opens the tool on calls, so the morning view must be readable in one glance.

**Sales (may be Ram, or a person).** Captures requirements, sources OEMs, builds quotes, chases responses. Wants coverage visible before committing, and comparables visible before pricing. Success = quotes that are not built from scratch and not oversold.

**Operations (may be Ram, or a person).** Runs OEM POs, production, PDI, inspection, dispatch and delivery. Wants a timeline with an owner and an expected date on every step, the offered/cleared/rejected PDI numbers kept apart, and delivery risk flagged early. Success = no surprise deadline miss.

**Finance (may be Ram, or a person).** Handles invoices, partial payments, due dates and commission. Wants outstanding balances visible and reminders raised. Success = no missed payment and a commission that can be explained.

**Management (may be Ram).** Holds approvals, reads the audit trail and the loss analysis. Success = every lost opportunity has a reason and every material change is traceable.

**External parties — not users of the tool (baseline).** Government and defence agencies send requirements, receive quotes and documents, and pay. OEM suppliers receive requests, give quotes and commitments, and receive POs. They are actors in the workflow but do not open the system in the baseline scope [A-06].

---

## 4. Scope, locked (what is in)

Capabilities, in the order the client says matters most.

1. **Requirement and RFI.** One record per requirement: customer or agency, product, quantity, required delivery date, technical specifications, tender or enquiry reference, submission deadline, and attached documents. Many line items per requirement (up to 500 part numbers), each with its own quantity. Statuses: received, qualifying, quoted, submitted, won, lost, cancelled.
2. **OEM master and sourcing.** An OEM record with products supplied, capabilities, prices, typical lead time, compliance documents, contacts, past performance, and an approved-or-not flag. From a requirement, a shortlist of capable OEMs; every request and its response recorded.
3. **Quantity coverage.** Required versus committed versus uncovered balance, visible at line and requirement level. Multiple OEMs and multiple shipments can cover one requirement. Firm commitments counted as covered; availability or quote indications not counted. Guards on committing uncovered quantity.
4. **Quotation and bid intelligence.** A quote built from the requirement — OEM price, lead time, target margin, recommended price — with comparable past bids shown before pricing, including won/lost and the winning or losing price. Quotes versioned and approved.
5. **Government response and follow-up.** Post-submission states: submitted, clarification requested, technical clarification, commercial negotiation, awaiting approval, won, lost, cancelled. Automatic follow-up tasks from time-based and document-based rules.
6. **Order and PO.** An approved quote converts to an order with its whole history attached. No PO without an approved quote. Tracked per PO: number and date, product, quantity, price, delivery deadline, selected OEM, supplier PO, compliance, inspection and PDI requirements. Many invoices per PO.
7. **Fulfilment, PDI and delivery.** A timeline of steps — OEM PO placed, production started, production done, PDI scheduled, PDI passed, government inspection, dispatch, delivered, accepted — each with an owner and an expected date. PDI quantified as offered, cleared, rejected; a failed or held PDI blocks dispatch. Partial deliveries supported with the outstanding balance visible. Delivery risk flagged by comparing expected completion against the committed deadline.
8. **Payments, commission and documents.** Partial payments with due dates and reminders. One invoice fulfilled by several delivery events. Commission earned on an OEM-payment milestone (definition held pending C-11). A document and compliance vault with type, supplier, issue date, expiry date, and links to the product and requirement, with expiry reminders and approved item lists that renew every 3 to 5 years.
9. **Search, history and losses.** Search all history for a comparable requirement and surface the past OEM, price, delivery time, margin, documents and problems. Every lost opportunity carries a structured loss reason.
10. **Morning view and plain questions.** One screen answering: open orders and their state, quotes awaiting response, orders at delivery risk, payments pending, OEM responses pending, documents expiring. Plain-language questions answered only from stored data, never invented.
11. **Roles, approvals and audit.** Four roles — owner or management, sales, operations, finance. Approvals on quotes, documents, orders and compliance items. An audit trail of material changes: what, who, when.

**Invariant rules that must hold throughout:**
- Every quotation comes from an RFI.
- Every PO maps to an approved quotation.
- Many line items per requirement; many invoices per PO; many deliveries per invoice.
- Partial deliveries and partial payments are normal, with balances visible.
- Quantity balance is visible across the whole lifecycle: requested, quoted, committed, ready, inspected, invoiced, delivered, accepted.
- PDI cleared is distinct from offered and rejected.
- Repeat requirements reference history; loss reasons are structured.
- OEM commitments are distinct from availability indications.
- Commission follows an OEM-payment milestone.
- Document expiry is trackable, and important activity is audited.

---

## 5. Not building, and why

Read this section back to the client verbatim. Each "no" is a "no" until the client changes it in writing.

- **No automatic legal or compliance judgement.** The tool shows documents and expiry; a human decides legality or compliance. Reason: legal risk rests with the client, and an automatic judgement is a liability the tool cannot carry.
- **No automatic final bid price.** Reason: pricing accountability stays with Ram. A recommendation may be shown [C-08], but the final number is set by a human.
- **No OEM chosen without human approval.** Reason: commercial and relationship risk. The tool may shortlist [C-13]; it never selects.
- **Not a full accounting or ERP replacement.** Reason: the boundary in C-07. The tool tracks order-related money; it does not become the books.
- **Not a generic document generator.** Reason: only documents tied to requirements, orders and compliance, and only once C-12 is answered. Until then, vault-and-link only.
- **No government-portal automation.** Reason: external systems, no baseline requirement, and brittle dependency on someone else's interface.
- **No auto-messaging as a baseline.** Reason: commitment and consent risk. Follow-ups create tasks for humans [C-03, A-22].
- **No supplier or agency logins in baseline scope.** Reason: not requested, and it doubles the surface area [A-06].
- **No multi-company or multi-tenant support.** Reason: one business, one set of books [A-18].
- **No invented answers from plain-language questions.** Reason: explicit client rule — answer from stored data or say the data is not recorded.

---

## 6. Phasing

The client explicitly said to build in order and that *"the first three are the ones that matter most."*

**Phase 0 — Answers and data.** No build. Get the answers to C-02, C-10, C-11, C-12, C-14, C-15; run the historical-data audit (C-05); walk one real transaction end-to-end (RFI → quote → PO → delivery → payment); confirm loss labels; confirm document types [A-07, A-15].

**Phase 1 — Ships first (the three that matter).**
- Requirement and RFI.
- OEM master and sourcing.
- Quantity coverage, with firm versus availability and the uncovered balance.
- Dependency: coverage waits on C-10.

**Phase 2 — Ships next.**
- Quotation and bid intelligence (comparables, versioning, approval).
- Government response and follow-up tasks.
- Dependency: comparables are limited until the data audit is done [C-05].

**Phase 3 — Ships next.**
- Order and PO, with the approved-quote gate.
- Fulfilment, PDI and delivery, including partial deliveries and the delivery-risk flag.
- Dependency: approval-with-uncovered-balance [C-09].

**Phase 4 — Ships later.**
- Payments, commission and the document vault with expiry.
- Dependency: commission waits on C-11; document generation waits on C-12.

**Phase 5 — Ships later.**
- Search, history and loss reasons.
- Morning view and plain-language questions.
- Roles, approvals and audit.
- Dependency: history search waits on the data audit; pending C-04, C-05, C-14, C-15.

---

## 7. Success metrics

Baselines are the client's own numbers. Targets marked **[target]** are proposed, not client-given [A-16].

- **Quote preparation:** from 3–4 days to under 1 day **[target]**, measured on quotes that reuse a comparable.
- **Follow-up admin:** from 3–4 hours a day to under 1 hour a day **[target]**.
- **Traceability invariant:** 100% of quotes traceable to an RFI; 0 orphan POs. This is binary, not a trend.
- **Coverage integrity:** 0 dispatches on a requirement with an uncovered balance or a failed/held PDI that went unflagged.
- **Delivery risk:** 100% of at-risk orders flagged before the committed deadline, with a target of at least 5 days' warning **[target]**.
- **Document expiry:** 0 missed renewals; reminders raised at 60 and 90 days before expiry **[target, A-11]**.
- **OEM responsiveness:** 100% of OEM requests carry an aging clock; median response improved from the current 1–10 day spread.
- **Pricing from history:** 100% of new quotes show at least one comparable, or the explicit message "no comparable found."
- **Loss capture:** 100% of lost requirements carry a structured reason.
- **Trust in plain-language answers:** 0 answers unsupported by a record; every answer traceable, and "not recorded" when data is absent.
- **Morning view:** all six questions answered with live data.
- **Adoption:** the morning view is opened every working day, and the system is the source of truth for open orders by the end of Phase 3 **[target]**.

---

## 8. Open dependencies

Waiting on someone else.

- **Client answers:** global versus per-order OEM capacity (C-10); who invoices whom, who pays the OEM, and when commission is earned — needs one real transaction (C-11); which documents consume the week (C-12); the confirmed loss-reason labels; which historical spreadsheet columns are trustworthy (C-05); currency and jurisdiction (C-02).
- **Historical data:** the client's spreadsheets, in a form that can be loaded, plus permission to use them.
- **One real redacted transaction** walked end to end: RFI → quote → PO → delivery → payment.
- **The Google Drive templates "to be used":** `https://drive.google.com/drive/folders/1ttSbG1qae-h4jfu-3GW-XQGmAtwETAdi` — need to know what they are and whether they define required document formats. UNVERIFIED: not opened.
- **The "29-minute call to a working CRM" reference:** `https://how-it-was-built.vercel.app/` — if it is a template to reuse, its contents are needed; if it belongs to another client, using it may be a data or privacy risk. UNVERIFIED: not fetched.
- **Named approvers** for each of the four approval types, and the definition of "material change" (C-14).
- **User list:** how many people, and who holds which role (C-15).
- **Brand assets** (palette, logo, pictures) for anything with a screen — none are present in the project folder [A-23].

---

## Assumptions register

Every place this document assumed something a real client would have told us. Each is tagged inline as [A-##] above.

- **A-01 — Product.** The product is the defence-contract requirement, not the Downtime Cost Board. This is the assumption with the most riding on it.
- **A-02 — Currency.** The defence business's money is not in Dirhams; "Dirhams" belongs to the other idea. The actual currency is unstated.
- **A-03 — Jurisdiction.** The defence business is India-based, inferred only from the client's name. Defence compliance is jurisdiction-specific, so this matters.
- **A-04 — Headcount.** A small team (Ram plus a few), not four fully separate people per role.
- **A-05 — Role overlap.** Ram holds the owner/management role and, in practice, covers sales, operations and finance.
- **A-06 — External parties are not users.** Agencies and OEMs do not log in; they interact through Ram.
- **A-07 — Document set.** "Documents" means quotation documents, compliance certificates, approved item lists, PDI and inspection reports, invoices and POs. To be confirmed.
- **A-08 — Material change.** Status, quantity, price, owner, dates and approvals are the audited fields.
- **A-09 — Follow-up threshold.** Seven days is the configurable default, not a fixed rule.
- **A-10 — Delivery-risk threshold.** Risk is flagged at a configurable number of days before the committed deadline; the client sets the number.
- **A-11 — Expiry reminders.** 60 and 90 days before expiry.
- **A-12 — Approved item lists.** Captured as expiring documents with reminders; no automatic renewal process is assumed.
- **A-13 — Commission.** One earned commission event per order, not split across multiple OEMs or milestones. Pending C-11.
- **A-14 — Recommended price.** Calculated from OEM price and target margin, and shown to the human, who may override.
- **A-15 — Data migration.** The historical spreadsheets are migratable in a one-time load, and history features wait on that load.
- **A-16 — Targets.** All success-metric targets are proposals, not client commitments.
- **A-17 — Reference artifacts.** The Drive folder and the "29-minute" link are templates intended for reuse; their contents are unverified.
- **A-18 — Single organisation.** One business entity; no multi-company support.
- **A-19 — Language.** The working language is English. To be confirmed.
- **A-20 — Coverage granularity.** Coverage is tracked per line item as well as per requirement.
- **A-21 — Multiple supplier POs.** One customer PO may draw on several supplier POs when several OEMs cover the requirement. To be confirmed.
- **A-22 — "Automatic" means tasks.** Follow-ups create tasks for humans; the system does not send messages.
- **A-23 — Brand assets.** None were supplied, so any on-screen work will proceed with a direction of our own until the client provides a palette, logo and pictures.
