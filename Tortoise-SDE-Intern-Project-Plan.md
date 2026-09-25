# Building for Tortoise — SDE Intern Application Project
### Research → Problem Discovery → Prototype → Implementation Plan → Application Package
Prepared by Gaurav Jain

---

## Part 0 — How to read this document

This is one long working document, not a college report. It is built in the order you'll actually use it:

1. **What Tortoise is** — the business, the model, the money.
2. **The user journey**, stage by stage, with friction called out.
3. **12 concrete problems**, each separated into *documented fact* vs *reasonable hypothesis*.
4. **4 prototype options**, and the one I picked with reasons.
5. **The full implementation plan** for the selected prototype (architecture → schema → API → workflows → security → roadmap).
6. **The application package** — README, pitch, message to the hiring team.

Every claim about Tortoise below is sourced from tortoise.pro, its blog, its Play Store/App Store listings, Crunchbase/Tracxn/CBInsights, Trustpilot, and its careers pages, fetched today (Sept 2026). Where I'm hypothesizing rather than quoting a public fact, it's labeled **[Hypothesis]**.

---

## Part 1 — What Tortoise actually sells

**One line:** Tortoise is India's employee device-benefit platform. Employees lease phones/laptops through salary-sacrifice deductions (save ~30–40% vs retail) with an option to own the device at the end of the lease; employers offer this as a zero-cost, zero-liability benefit.

### Who buys, who uses
- **Customer (payer/decision-maker):** HR, People/Total-Rewards, and Finance teams at mid-to-large Indian enterprises. Named logos: Deloitte, Paytm, Indus Towers, and others via careers/Empuls listings.
- **End user:** the individual employee at those companies, using the Tortoise mobile app (iOS/Android) to browse, select, and manage a device.
- **Not a customer, but a dependency:** the employer's payroll/HRMS system (Darwinbox, Keka, Zoho People, etc.), device OEMs/authorized distributors, insurers, and financing/leasing partners.

### The employer's problem Tortoise solves
Employers want a high-visibility, low-cost-to-offer perk that helps with retention, but:
- They don't want to buy/own devices (capex, depreciation, asset tracking, disposal).
- They don't want a helpdesk queue for broken laptops.
- They don't want to build tax-compliant salary-sacrifice payroll logic themselves.

Tortoise packages this as a "zero cost, zero liability" plug-in: it supplies the leasing structure, the compliance documentation (its tax treatment has reportedly been reviewed by Deloitte India and Lakshmikumaran & Sridharan), and the payroll/HRMS integration, so HR just turns it on.

### The employee's problem Tortoise solves
Buying a flagship phone/laptop outright is a large one-time cash outlay. Tortoise converts that into small monthly payroll deductions, at a discount to retail, with an ownership path, plus bundled insurance/repair/theft cover that would otherwise cost extra (their own comparison table states retail accidental-damage cover runs ~13–14% of device cost, versus included coverage with Tortoise).

### How the leasing/benefit process works (as publicly described)
1. Employer signs a **Master Lease Agreement** (defines the lease relationship) and a **Master Servicer Agreement** (defines Tortoise's operational scope: platform, support, data handling).
2. Tortoise integrates with the employer's **payroll and HRMS** to pull eligibility (grade, tenure, device-category caps) and push monthly deduction instructions.
3. Employee opens the app, browses a catalog (100+ devices across brands), selects tenure, and places an order.
4. Device ships from an "admin-verified" supplier/distributor; delivery is fulfilled outside Tortoise's own warehouse (marketplace-style, not owned inventory).
5. Monthly salary deduction runs through payroll; Tortoise reconciles this against the lease schedule.
6. **Tortoise Corporate Care** (insurance) covers accidental damage, theft, and up to 2 free broken-glass repairs/year, with on-site pickup-and-repair claimed across 27,000 pincodes and a loaner/replacement device while the original is being repaired.
7. At lease end (or on resignation before term-end), the employee can buy out the device; early exits go through **foreclosure charges calculated and recovered via Full & Final settlement**.

### What appears automated vs. operationally heavy
**Looks automated / self-serve:**
- Device browsing, cart, tenure selection, EMI/deduction preview (the app changelog specifically mentions "seamlessly switch lease tenure across your entire cart" and "real-time updates to monthly deductions").
- Payroll/HRMS eligibility sync (described as configuration, not manual data entry).

**Looks operationally heavy (and this is the important part for a prototype):**
- **Order fulfillment after "order placed."** The Play Store/App Store reviews are the strongest evidence in this whole research exercise: one 1-star review describes ordering a device and getting **no status update for 1.5 months**, with the app showing only "**supplier has received the order**" and nothing beyond that — and reports Tortoise's WhatsApp/call support being **unreachable** during this period. A second review reports **no communication for 2+ weeks post-approval**. This is not a hypothesis — it is a repeated, specific, dated customer complaint pattern.
- **Repair/replacement coordination** across a claimed 27,000-pincode service network — this implies a large network of third-party service partners that has to be scheduled, tracked, and escalated, which is inherently a manual/ops-heavy process unless well-instrumented.
- **F&F settlement / foreclosure calculation** on early exits — a finance-and-payroll edge case that has to reconcile against HRMS exit data.
- **Multi-tenant policy configuration** per employer (grade-wise limits, device-category eligibility, approval flows) — configuration-heavy, and a likely source of employer-side admin friction.

### What makes Tortoise different from a normal purchase
Per their own comparison table: two free broken-glass repairs/year, on-site pickup-and-repair (vs. carry-in), a loaner device during repair, bundled accidental-damage and theft cover (vs. buying ~13-14%-of-device-cost insurance separately), 24×7 support across WhatsApp/email/phone, and payroll-linked tax benefits (India's Section 17(2) perquisite/salary-sacrifice framework, reportedly used to justify ~30% effective savings).

### Competitors / adjacent players
- **Direct India device-benefit-leasing peers:** none appear to be large well-known independents; Tracxn lists Tortoise 42nd of 444 "active competitors" in its category, and CBInsights' auto-suggested comparison set skews toward global IT-asset-lifecycle players rather than India-specific leasing twins — a sign the India device-leasing-as-a-benefit niche is still thin.
- **Adjacent/global IT-asset-lifecycle management:** Workwize (Netherlands) and allwhere (US) — device procurement/deployment/retrieval for distributed teams, closer to corporate-IT asset management than an employee "benefit."
- **Adjacent European flexible-benefits platforms:** Vaigo (mobility benefits, Belgium), Belonio (Germany, acquired by EPassi/Edenred in 2025) — same "benefit via payroll" pattern, different benefit category.
- **India benefits aggregators that resell Tortoise as one SKU:** Empuls/Xoxoday lists Tortoise as a plug-in benefit inside its own rewards platform — meaning Tortoise's real distribution isn't just direct enterprise sales, it's also embedded inside broader benefits marketplaces.
- **Substitutes employers compare against:** OEM corporate-purchase programs (Samsung Corporate+, HP/Lenovo Employee Purchase Programs) — Tortoise's own blog content is explicitly written to argue "leasing > one-time discount" against these, which tells you this is a live sales objection they field often.

### Business model, funding, size
- Founded 2020, HQ Bangalore/Gurugram, ~11–50 employees.
- Founders: **Vardhan Koshal** (CEO — ex-Citibank, India leadership at Udacity/Tripadvisor, sold a startup, SEBI-registered investment adviser) and **Surya Harsha Nunnaguppala** (CTO — ex-CodeNation, NIT Calicut).
- Backed by Vertex Ventures, Better Capital, and angels including Kunal Shah (CRED), Sriharsha Majety (Swiggy), Prajit Nanu (NIUM), Lizzie Chapman.
- Total raised ~$2.3–3M across seed rounds (2022); Inc42 reports FY25 revenue of ₹1.2 Cr (+31% YoY from ₹90L in FY24) — i.e., still an early-revenue-stage company, which matters: **operational scale efficiency (support, ops tooling) is probably a bigger unlock for them right now than net-new feature breadth.**
- ISO 27001 and SOC 2 certified — security/compliance is clearly a sales talking point to enterprise HR/IT buyers, which should inform how your prototype talks about auth and data handling.
- Company appears to have been previously associated with/rebranded from "**Proconut**" per CBInsights records — worth knowing but not worth citing to them directly.

---

## Part 2 — Journey map with friction points

`Employer signs on → HR/Admin configures → Employee onboarded → Device selection → Eligibility check → Payroll/HRMS sync → Payment/deductions begin → Fulfilment → Delivery → Usage → Repair/replacement → Insurance claim → Ownership/lease-end`

| Stage | What happens | Friction / risk (evidence level) |
|---|---|---|
| Employer signs on | MLA + MSA agreements signed | Long legal/procurement cycle typical of B2B2C fintech-adjacent products **[Hypothesis]** |
| HR/Admin configures | Policy setup: grade-wise limits, device categories, approval flow | Manual, employer-specific configuration; no self-serve admin console is publicly showcased **[Hypothesis, supported by "custom implementation" language on site]** |
| Employee onboarded | App install, employer-email verification | Standard, low friction |
| Device selection | Browse catalog, pick tenure | Real-time deduction preview shown per changelog — this part looks genuinely well-built |
| Eligibility check | HRMS pulls grade/tenure eligibility | Sync-lag or stale-HRMS-data risk if employer's HRMS isn't near-real-time **[Hypothesis]** |
| Payroll/HRMS sync + deductions | Deduction instruction pushed to payroll each cycle | Reconciliation risk: mid-cycle joiners/leavers, unpaid leave months, salary revisions — all break a naive fixed-deduction schedule **[Hypothesis, but standard payroll-integration failure mode]** |
| Fulfilment | Order routed to an "admin-verified" third-party supplier | **Documented, severe:** reviews describe an order stuck at "supplier has received the order" for 1.5 months with zero proactive updates |
| Delivery | Device shipped to employee | Same visibility gap as above continues through delivery |
| Usage | Employee uses device day to day | Not a friction point per available evidence |
| Repair/replacement | Pickup-and-repair claimed across 27,000 pincodes, loaner issued | High operational complexity: matching pincode → nearest authorized service partner → scheduling pickup → tracking loaner issue/return → tracking repair SLA. No public evidence of self-serve tracking for this flow **[Hypothesis on tooling, but the process itself is documented]** |
| Insurance claim | Accidental damage/theft claim, 2 free glass repairs/year | Cap-tracking problem: has this employee used both free repairs this year? Needs a clean per-employee, per-policy-year ledger **[Hypothesis]** |
| Ownership/lease-end | Buyout option, or foreclosure + F&F settlement on early exit | Cross-system dependency (payroll exit data + lease schedule + device condition) that's easy to get wrong or delay **[Hypothesis]** |
| Support (cuts across all stages) | 24×7 WhatsApp/email/phone claimed | **Documented, severe:** a reviewer reports WhatsApp and call support being blocked/unreachable while an order sat unresolved |

**The single loudest, most evidence-backed friction point in this entire map is fulfilment-stage order-status opacity plus support unreachability.** Two independent reviewers, different platforms (App Store, implicitly also referenced pattern on Play Store), same complaint shape: order placed → status frozen at one coarse state → no proactive comms → support channels go dark → 1.5+ months unresolved. That is the strongest, most specific, most build-worthy signal in the whole research set.

---

## Part 3 — Problem discovery (12 problems)

Each problem is tagged **[Documented]** (backed by a specific public source) or **[Hypothesis]** (a reasonable inference from the workflow, not a confirmed internal fact).

### Customer / Employee experience problems

**1. Order-status opacity after purchase — [Documented]**
- *Who:* Employees who've placed an order.
- *Evidence:* App Store reviews describing 1.5-month and 2-week silent gaps, with status frozen at a single coarse state ("supplier has received the order").
- *Why it matters:* This is the single highest-visibility trust-breaking moment in the whole product — it happens right after the employee has committed to a salary deduction.
- *Existing Tortoise solution, if known:* None publicly visible beyond a single static status line in-app.
- *Possible technical solution:* A granular order state machine (placed → confirmed → sourced → dispatched → in-transit → delivered → activated) with timestamped events, expected-time-in-stage SLAs, and proactive push/WhatsApp notifications on every transition — plus a visible "why is this taking long" reason code when a stage overruns its SLA.
- *Difficulty:* Medium. *Expected impact:* High (support-ticket volume reduction, trust, NPS).
- *Why it fits an SDE intern prototype:* Pure backend/business-logic problem — state machines, timers, notification fan-out — no exotic infra needed, and it demonstrates real product thinking, not a CRUD demo.

**2. Support channel unreachability during active issues — [Documented]**
- *Who:* Employees with an unresolved order/repair.
- *Evidence:* Same App Store review reports WhatsApp and call-support being blocked while a complaint was open.
- *Why it matters:* Whether or not this was literal "blocking," the *perception* of a support blackout during an open issue is a churn/trust risk for both the employee and the HR buyer who vouched for the benefit.
- *Existing solution:* Unknown/unclear.
- *Possible technical solution:* A support ticket system with a **guaranteed-response SLA timer per ticket** and automatic escalation (to a human supervisor, or to the employer's HR admin) if the SLA is breached — so "no one responded" becomes structurally hard to happen silently.
- *Difficulty:* Medium. *Expected impact:* High.
- *Suitability for prototype:* Same system as #1 — natural to build together (see Part 4/5).

**3. No self-serve visibility into "how many free repairs have I used this year?" — [Hypothesis]**
- *Who:* Employees, and the support agents fielding their questions.
- *Evidence:* Publicly stated policy ("two free broken-glass repairs per year") with no publicly shown self-serve tracker.
- *Why it matters:* Ambiguity here creates avoidable support tickets and billing disputes.
- *Possible technical solution:* A per-employee benefit-usage ledger (repairs used/remaining, claim history) surfaced in-app.
- *Difficulty:* Low–Medium. *Expected impact:* Medium.

### Employer / HR problems

**4. HR has no visibility into program health across their org — [Hypothesis]**
- *Who:* HR/People admins at employer accounts.
- *Evidence:* No admin analytics dashboard is publicly showcased; site language emphasizes "minimal administrative effort," which could mean genuinely low-touch, or could mean HR is flying blind.
- *Why it matters:* HR is the renewal decision-maker; if they can't see adoption %, open tickets, or SLA breaches for their employees, they can't defend the program's value at renewal time.
- *Possible technical solution:* An HR-facing dashboard: adoption rate, average fulfilment time, open-ticket count, SLA-breach rate — the same event stream from problem #1/#2, rolled up per employer.
- *Difficulty:* Medium. *Expected impact:* Medium–High (this is a retention/expansion lever for Tortoise's own sales team).

**5. Policy configuration (grade-wise eligibility, device caps) looks manually implemented per employer — [Hypothesis]**
- *Who:* Tortoise's implementation/ops team, and HR admins.
- *Evidence:* Site language: "We advise you... help you implement policies... tailored to your unique needs" — this reads as white-glove/manual, not self-serve.
- *Why it matters:* Manual policy setup doesn't scale as Tortoise adds employer logos; it's a services bottleneck disguised as a product feature.
- *Possible technical solution:* A rules-engine-based policy builder (grade → eligible categories → price cap → approval-required threshold) that HR can configure without an implementation engineer.
- *Difficulty:* Medium–High. *Expected impact:* High long-term, but harder to demo convincingly in 1–2 weeks than #1/#2.

### Operations / device-lifecycle problems

**6. Repair/replacement logistics across 27,000 pincodes has no visible tracking layer — [Hypothesis]**
- *Who:* Ops team, field service partners, employees.
- *Evidence:* The pincode-coverage claim implies a large partner network; no public tooling is shown for pickup scheduling or SLA tracking on repairs specifically.
- *Why it matters:* Repair SLA breaches are exactly the kind of thing that turns into the App Store 1-star reviews already seen for orders.
- *Possible technical solution:* Extend the same state-machine approach from #1 to the repair/replacement flow (pickup scheduled → picked up → at service center → repaired → dispatched back → delivered), with loaner-device tracking as a linked sub-object.
- *Difficulty:* Medium–High (more states, more actors). *Expected impact:* High.

**7. Loaner-device inventory has no visible tracking — [Hypothesis]**
- *Who:* Ops team.
- *Evidence:* "Replacement device when under repair" is a stated benefit; nothing public about how loaner stock is tracked/returned.
- *Why it matters:* Untracked loaner inventory either gets lost (cost) or is unavailable when promised (broken promise to employee).
- *Possible technical solution:* Simple loaner-asset ledger keyed to the repair-case ID.
- *Difficulty:* Low. *Expected impact:* Medium.

### Data / finance / payroll problems

**8. Payroll deduction reconciliation across mid-cycle joiners, leavers, unpaid leave, salary revisions — [Hypothesis]**
- *Who:* Payroll teams, finance, Tortoise's ops/finance function.
- *Evidence:* Standard, well-known failure mode of any payroll-linked deduction system; Tortoise's own blog explicitly discusses foreclosure/F&F handling on exits, confirming this is a real, non-trivial workflow they manage.
- *Why it matters:* A missed or mismatched deduction is a compliance and trust issue (money either under- or over-collected from an employee's salary).
- *Possible technical solution:* A reconciliation engine that ingests expected-vs-actual deduction records per cycle, flags variances, and auto-generates the correct F&F/foreclosure adjustment on exit events.
- *Difficulty:* High (requires realistic payroll-cycle modeling). *Expected impact:* High, but hard to demo without fabricating "internal" payroll data Tortoise hasn't disclosed — **riskier as a 2-week prototype because it requires assuming internal system shapes not publicly documented.**

**9. Cross-HRMS eligibility sync consistency (Darwinbox vs. Keka vs. Zoho People each model "grade"/"designation" differently) — [Hypothesis]**
- *Who:* Engineering/integration team.
- *Evidence:* Multiple named HRMS integrations on the marketing site with no shared schema shown.
- *Why it matters:* A normalization/mapping-layer problem — classic integration engineering.
- *Possible technical solution:* A canonical "eligibility profile" schema with per-HRMS adapter mappings.
- *Difficulty:* Medium. *Expected impact:* Medium.

### Engineering / integration / AI-automation problems

**10. No proactive, automated customer communication layer — [Documented, inferred from #1/#2]**
- Same evidence as #1/#2. This is really the *infrastructure* problem underneath both: Tortoise appears to have status data internally (the app does show *a* status), but no event-driven notification layer pushing updates *to* the customer without being asked.
- *Possible technical solution:* Webhook/event-bus pattern: every state transition emits an event → fan-out to push notification + WhatsApp template message + in-app timeline update.
- *Difficulty:* Medium. *Expected impact:* Very high — this is the fix for the single worst-documented problem in the whole research set.

**11. Support ticket triage is presumably manual/first-come-first-served — [Hypothesis]**
- *Who:* Support agents.
- *Evidence:* No public evidence of an intelligent triage/priority system; the "blocked WhatsApp" complaint suggests either a capacity problem or a prioritization problem.
- *Possible technical solution (AI opportunity):* Use an LLM to classify incoming ticket text (order-stuck / repair-overdue / billing-dispute / general-query), auto-attach the relevant order/repair case, and auto-set priority based on how long the linked case has been open — this is a legitimate, non-gimmicky use of an LLM classifier and plays directly to your production Claude/Gemini/OpenAI integration experience.
- *Difficulty:* Medium. *Expected impact:* Medium–High.

**12. No public-facing status page / proactive SLA-breach alerting for HR — [Hypothesis]**
- *Who:* HR admins, who currently only find out about a problem when an employee complains to *them*.
- *Evidence:* Inferred from #4 and #1.
- *Possible technical solution:* SLA-breach alerts routed to the employer's HR admin dashboard *before* the employee has to escalate internally — turns Tortoise from reactive to proactive in the eyes of its actual paying customer (HR).
- *Difficulty:* Low–Medium (reuses #1's event stream). *Expected impact:* High for retention/expansion.

### Security / fraud

**13. Device-order fraud / eligibility abuse risk — [Hypothesis]**
- *Who:* Tortoise risk/finance team.
- *Evidence:* Standard risk in any subsidized-purchase-via-payroll model (e.g., ordering at maximum eligible tier right before resignation).
- *Possible technical solution:* A risk-scoring rule (tenure-remaining vs. device-value-vs-lease-length ratio) that flags orders for manual review.
- *Difficulty:* Medium. *Expected impact:* Medium. Good "nice-to-have" feature inside the chosen prototype, not a standalone one.

---

## Part 4 — Prototype options considered

### Option A — **Order & Repair Lifecycle Transparency Platform** *(selected — see Part 5)*
Granular state-machine order/repair tracking + event-driven proactive notifications + SLA-breach escalation + HR-facing ops dashboard. Directly fixes problems #1, #2, #6, #10, #12.

### Option B — Payroll Deduction Reconciliation Engine
Solves problem #8/#9. Technically the most "enterprise fintech" of the options and would show off strong data-modeling skills, but it requires *inventing* the shape of Tortoise's internal payroll-integration data, since none of that is public — meaning the demo would rest on assumptions the interviewer might immediately question ("how do you know payroll data looks like this?"). Better as a "Part 2" feature suggestion in the interview than a standalone 2-week build.

### Option C — HR Policy Rules-Engine / Eligibility Configurator
Solves problem #5/#9. Good engineering depth (rules engine, multi-tenant config), but it's an *internal admin tool* — much harder to make a visually and narratively compelling demo out of than a tracker with a real "wow, I can see exactly where my order is" moment.

### Option D — WhatsApp/Chat Support Triage Bot (AI-first)
Solves problem #11 in isolation. Interesting and plays to your AI-integration experience, but as a standalone project it risks looking like "another chatbot," which is the generic-portfolio-project trap the brief explicitly asked to avoid. Better folded in as *one intelligent feature inside* Option A than built as the whole project.

### Selection rationale
Option A wins on every axis that matters for this specific application:
- **Evidence:** it's the only option fixing a problem with *direct, dated, specific customer complaints* rather than an inferred one.
- **Relevance to Tortoise's business:** Tortoise is revenue-early (₹1.2 Cr FY25) and support/ops-heavy by nature (device logistics across 27,000 pincodes) — an ops-efficiency and trust tool is closer to what actually moves their metrics right now than a new customer-facing feature.
- **Feasibility for a 1–2 week solo build:** a state machine + event bus + notification fan-out + a dashboard is squarely buildable at high quality in that window, using your existing stack (Node/Express, MongoDB, React/Next.js, TypeScript).
- **Ability to demonstrate strong SDE skills:** state machines, event-driven architecture, SLA-timer logic, auth/multi-tenancy (employee vs. HR-admin vs. support-agent roles), and one well-scoped AI feature (ticket triage) — real backend engineering, not CRUD.
- **Usefulness to Tortoise's actual customers:** directly maps to what would have prevented both of the 1-star reviews you can point to.

---

## Part 5 — Selected prototype: complete implementation plan

### 1. Product name
**Tortoise Pulse** — an order & repair transparency and support-SLA engine.

### 2. One-line pitch
Tortoise Pulse turns every order and repair into a live, trackable timeline with automatic proactive updates and support-SLA escalation — so "no update for 1.5 months" becomes structurally impossible.

### 3. Problem statement
Once an order or repair is placed, Tortoise employees have no granular visibility into status and no proactive communication, and support channels can go quiet during active issues — evidenced directly by public 1-star reviews describing 1.5-month and 2-week silences. HR admins, meanwhile, only learn about these failures when an employee escalates to them directly, after the trust damage is already done.

### 4. Target users
1. **Employee** — the person who placed an order or has a device in for repair.
2. **Support agent** (Tortoise-side) — manages the queue of open cases.
3. **HR admin** (employer-side) — monitors program health for their org, gets proactively alerted to SLA breaches before employees escalate to them.

### 5. User stories
- As an employee, I can see exactly which stage my order/repair is in, and how long that stage is expected to take, without contacting support.
- As an employee, I get a push/WhatsApp-style notification the moment my order's status changes.
- As an employee, if a stage overruns its SLA, I automatically see *why* (a reason code) instead of silence.
- As a support agent, every ticket is auto-linked to the relevant order/repair case and auto-prioritized by how overdue that case is.
- As a support agent, I get an internal alert the moment any case I own breaches its SLA — before the customer has to chase me.
- As an HR admin, I can see adoption, average fulfilment time, and open SLA breaches across my whole organization on one dashboard.
- As an HR admin, I'm proactively notified if breach rates for my org spike, so I hear it from Tortoise, not from an employee.

### 6. Functional requirements
- Order and repair-case state machines with defined stages, allowed transitions, and per-stage SLA durations.
- Event log: every transition is an immutable, timestamped event.
- Notification dispatch on every transition (in-app + simulated WhatsApp/email webhook).
- SLA breach detector (scheduled job) that flags any case whose current stage has exceeded its SLA.
- Escalation engine: on breach, notify the assigned agent; on repeated/prolonged breach, notify a supervisor role and the employer's HR admin.
- Support ticket creation, linked to a case, with priority auto-set from case breach status.
- AI ticket-triage: classify free-text ticket description into a category and suggested priority using an LLM call, with a deterministic fallback if the AI call fails.
- Role-based dashboards: Employee (their own cases), Agent (queue + SLA countdowns), HR Admin (org rollup).
- Benefit-usage ledger: track free-repair count used per employee per policy year.

### 7. Non-functional requirements
- **Auth & authorization:** three roles (employee, agent, hr_admin), JWT-based, with row-level scoping (an employee only ever sees their own cases; an HR admin only sees their own org's employees).
- **Reliability:** SLA-breach detection must run even if no user is actively viewing the case (background job, not just on-page-load calculation).
- **Auditability:** every state transition is append-only — never mutate history, only append new events.
- **Performance:** dashboard queries should be indexed for org-scoped and status-scoped lookups (this matters at "thousands of employees per employer" scale, which is Tortoise's actual customer profile).
- **Security:** no device/PII leakage across tenants; all queries filtered by org/employee ownership at the query layer, not just the UI layer.

### 8. Feature list (MVP vs. stretch — see also #26/#27)
**MVP:** order state machine, event timeline UI, SLA breach detection, agent queue, HR dashboard, basic notifications.
**Stretch:** AI ticket triage, benefit-usage ledger, repair/loaner sub-flow, fraud/risk scoring on orders.

### 9. System architecture
```
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│  React/Next  │◄────►│  Express API  │◄────►│  MongoDB (Atlas)  │
│  (3 role UIs)│      │  (TypeScript) │      │  orders, cases,   │
└─────────────┘      └──────┬───────┘      │  events, tickets, │
                             │              │  users, orgs       │
                             ▼              └──────────────────┘
                    ┌──────────────────┐
                    │  Scheduled Jobs    │  (node-cron)
                    │  - SLA breach scan │
                    │  - Notification     │
                    │    dispatch queue   │
                    └──────┬───────────┘
                             │
                    ┌──────────────────┐
                    │  Notification layer │──► Webhook stub (simulated WhatsApp/email)
                    └──────────────────┘
                             │
                    ┌──────────────────┐
                    │  AI Triage service │──► Claude API (ticket classification)
                    └──────────────────┘
```

### 10. Database schema (MongoDB — collections)
```
users            { _id, name, email, role: 'employee'|'agent'|'hr_admin', orgId, createdAt }
organizations    { _id, name, hrmsProvider, slaConfig: { stageDurationsHrs }, createdAt }
orders           { _id, employeeId, orgId, deviceName, deviceValue, tenureMonths,
                   currentStage, stageEnteredAt, createdAt }
cases            { _id, type: 'order'|'repair', refId, employeeId, orgId,
                   currentStage, stageEnteredAt, isBreached, breachedAt, createdAt }
case_events      { _id, caseId, fromStage, toStage, actor, reasonCode, note, createdAt }
                 // append-only — the source of truth for the whole timeline UI
tickets          { _id, caseId, employeeId, subject, description, category,
                   priority, status: 'open'|'in_progress'|'resolved',
                   assignedAgentId, slaDeadline, createdAt }
loaner_devices   { _id, repairCaseId, deviceTag, issuedAt, returnedAt }
benefit_usage    { _id, employeeId, policyYear, freeRepairsUsed, freeRepairsCap }
notifications    { _id, userId, caseId, channel, message, sentAt }
```

### 11. API specification (representative endpoints)
```
POST   /api/auth/login
GET    /api/me

# Employee
GET    /api/employee/cases                    # my orders + repairs
GET    /api/employee/cases/:id/timeline        # full event history for one case
POST   /api/employee/tickets                   # raise a support ticket
GET    /api/employee/benefit-usage

# Agent
GET    /api/agent/queue?filter=breached        # cases assigned/unassigned, sorted by SLA risk
PATCH  /api/agent/cases/:id/transition          # move a case to next stage (adds a case_event)
POST   /api/agent/tickets/:id/respond

# HR Admin
GET    /api/hr/org/summary                      # adoption %, avg fulfilment time, open breaches
GET    /api/hr/org/breaches?range=30d

# System (internal)
POST   /api/internal/sla-scan                   # invoked by cron; flags overdue cases
POST   /api/internal/notify                      # dispatches queued notifications
POST   /api/internal/ai/triage                   # classifies a new ticket via Claude API
```

### 12. Frontend page structure
```
/login
/employee/dashboard          — list of my cases, status badges
/employee/cases/:id          — timeline view (the "wow" screen — a vertical stepper with
                                timestamps, current stage highlighted, SLA countdown)
/employee/support/new         — raise ticket, pre-linked to a case
/agent/queue                  — sortable table: case, employee, stage, time-in-stage, breach flag
/agent/cases/:id              — transition controls + ticket thread
/hr/dashboard                 — org KPIs: adoption, avg fulfilment time, breach rate, trend chart
/hr/breaches                  — list of currently-breached cases for the org
```

### 13. Backend folder structure
```
/server
  /src
    /modules
      /auth
      /orders
      /cases          # shared state-machine logic for orders + repairs
      /tickets
      /notifications
      /triage         # AI classification service
      /orgs
    /jobs
      slaScan.ts
      notifyDispatch.ts
    /middleware
      auth.ts
      orgScope.ts      # enforces row-level tenant isolation
    /models
    /lib
      stateMachine.ts  # generic, reusable transition-validation engine
    app.ts
    server.ts
```

### 14. Authentication and authorization flow
1. Login issues a JWT containing `userId`, `role`, `orgId`.
2. Every request passes through `orgScope` middleware: employee routes filter `employeeId === req.user.id`; HR routes filter `orgId === req.user.orgId`; agent routes are org-agnostic (agents work across employers) but every mutation is logged with `actor: agentId`.
3. Case transitions are only permitted for `role: agent` (or system jobs); employees are read-only on case state, write-only on tickets.

### 15. Main user workflows
**Order transparency:** order created → `case_events` seeded with `placed` → agent (or a simulated ops-integration webhook) advances stages → each transition writes an event + triggers a notification → employee's timeline UI reflects it in real time → if `stageEnteredAt` exceeds that stage's configured SLA, the nightly/hourly cron flips `isBreached: true`, notifies the agent, and after a second threshold, notifies the org's HR admin.

**Support escalation:** employee raises a ticket linked to a case → AI triage service classifies category + suggests priority (falls back to "general / medium" if the AI call errors, so the system never hard-fails on an LLM outage) → ticket enters agent queue sorted by (breach status, then age) → SLA deadline computed from category → breach triggers the same escalation path as above.

### 16. AI architecture
- A single, narrowly-scoped Claude API call per new ticket: input = ticket subject + description + linked case's current stage; output = structured JSON `{ category, suggestedPriority, confidence }`.
- Prompted for **structured-only JSON output** (per the pattern in this environment's own API guidance), parsed defensively, with a rule-based fallback classifier (keyword match) if parsing fails or the call errors — this is deliberately not "AI for AI's sake": it's a bounded classifier with a safety net, which is the kind of AI-use case that survives production scrutiny.
- No AI in the state-machine or SLA-timer logic itself — those stay deterministic, because SLA correctness should never depend on a model call.

### 17. Integration architecture (how this would attach to the real Tortoise stack, described in the interview)
- In production, `POST /api/internal/orders/webhook` would be the attach point for Tortoise's real supplier/logistics integrations (each supplier update → webhook → case_event).
- Payroll/HRMS integration would populate `organizations.slaConfig` and employee eligibility — out of scope for the prototype's build, but the schema is designed so it's a natural next connection point, and this is worth saying explicitly in the demo.

### 18. Error handling
- Every state transition validated against an explicit allowed-transitions map (`stateMachine.ts`) — an invalid transition (e.g., `delivered → placed`) is rejected with a 409, not silently accepted.
- AI triage failures degrade to rule-based classification, never block ticket creation.
- Notification dispatch failures are retried via a small backoff queue and logged, not swallowed.

### 19. Security
- JWT auth, bcrypt-hashed passwords (or a stubbed SSO flow for the demo, described as "would map to employer SSO/HRMS auth in production").
- Tenant isolation enforced at the query layer (every Mongo query includes `orgId`/`employeeId` filters derived from the token, never from client-supplied params).
- Input validation (zod) on every mutating endpoint.
- Rate-limiting on ticket creation and login to prevent abuse.

### 20. Performance
- Indexes on `cases.orgId`, `cases.isBreached`, `case_events.caseId`, `tickets.status`.
- HR dashboard rollups computed via MongoDB aggregation pipelines, not application-layer loops.
- Pagination on agent queue and HR breach lists.

### 21. Testing strategy
- Unit tests on the state-machine transition validator (the highest-value logic in the whole app) — every legal and illegal transition covered.
- Unit tests on SLA-breach detection edge cases (exactly-at-threshold, just-under, just-over).
- Integration tests on the ticket-creation → AI-triage-fallback path (mock the AI call failing).
- A handful of API-level tests (supertest) per module.

### 22. Deployment architecture
- Backend: containerized Express app, deployable to Render/Railway (or a small AWS EC2/Elastic Beanstalk setup, worth mentioning both since Tortoise's actual infra is unknown).
- Frontend: Next.js on Vercel.
- MongoDB Atlas free/shared tier for the demo.
- Cron: node-cron in-process for the demo; called out explicitly in the README as "would move to a managed scheduler (e.g., EventBridge/Cloud Scheduler) at production scale."

### 23. Analytics
- HR dashboard *is* the analytics surface: adoption %, avg time-per-stage, breach rate over time (simple line chart), top breach reason codes.

### 24. Demo data
- Seed script generating ~3 organizations, ~40 employees, ~60 orders/repair-cases spread across stages — including a handful deliberately seeded to be breached, so the "wow" screens have real content on first load without you manually clicking through 20 minutes of setup.

### 25. Development roadmap (1–2 week window)
- **Days 1–2:** schema, auth, state-machine engine + tests, seed script.
- **Days 3–4:** order/case APIs, event log, SLA-scan cron.
- **Days 5–6:** employee timeline UI + agent queue UI.
- **Days 7–8:** HR dashboard + notifications (stubbed channel) + escalation logic.
- **Days 9–10:** AI triage service + fallback, ticket flow end-to-end.
- **Days 11–12:** polish, seed realistic demo data, deploy, record a walkthrough.
- **Days 13–14:** README, architecture doc, application materials (this document's Part 6).

### 26. MVP scope (what must exist for a credible demo)
Order state machine, timeline UI, SLA breach detection + agent notification, HR dashboard summary. That alone already tells the full story.

### 27. Advanced features (build if time allows, in this order)
AI ticket triage → benefit-usage ledger → repair/loaner sub-flow → fraud/risk scoring.

### 28. Future production architecture (for the "why this is real" section of your pitch)
- Real webhook ingestion from supplier/logistics partners instead of manual agent transitions.
- Real payroll/HRMS adapters populating `organizations` and eligibility.
- Move cron → managed scheduler; notifications → real WhatsApp Business API + SendGrid/SES.
- Multi-region MongoDB or a managed Postgres migration once relational reporting needs (finance reconciliation, audit) outgrow a document store.

---

## Part 6 — Demo strategy

Tell it as a story, in this order, ~4–5 minutes:
1. **Problem** (30s): show the two real App Store reviews on screen, verbatim status quotes. This is your strongest asset — real, dated, public evidence, not a hypothetical.
2. **Existing friction** (30s): the journey map, one slide, fulfilment stage highlighted.
3. **Tortoise-specific solution** (30s): "Tortoise Pulse" name + one-liner.
4. **Live prototype** (2 min): log in as an employee with a *deliberately breached* seeded order → show the timeline and the SLA-overrun reason code → switch to agent view, show the same case in the queue, sorted to the top because it's breached → switch to HR view, show it rolled up into the org's breach rate.
5. **Technical architecture** (30s): the diagram from #9, one sentence on the state machine and event log being the core design decision.
6. **Measurable benefit** (30s): "this doesn't eliminate delays — it makes them structurally impossible to hide, which is what actually shows up in a 1-star review."
7. **Future production version** (30s): Part 5 #28, one sentence each.

---

## Part 7 — Application package to send Tortoise

### Short project introduction (for the application form / cover note)
> I researched Tortoise's product, business model, and public customer feedback before applying, and built **Tortoise Pulse** — a prototype order/repair transparency and support-SLA engine — to address a specific, documented problem: employees reporting weeks-long silences on order status with no proactive updates, per public App Store reviews. It's a full-stack (React/Next.js, Node/Express, TypeScript, MongoDB) state-machine-driven tracking and escalation system, with an AI-assisted support-ticket triage layer. Repo and live demo linked below.

### README outline (drop into the repo)
```
# Tortoise Pulse
One-line pitch.
## The problem (with the two cited reviews, quoted briefly + linked)
## What this prototype does
## Architecture (diagram)
## Tech stack
## Running locally
## Demo data / how to see a breached case immediately
## What's stubbed vs. what would connect to Tortoise's real systems in production
## Roadmap if this became a real feature
```

### Feature summary (bullet list for the application, not prose)
- Granular order/repair state machine with per-stage SLA timers.
- Immutable event log powering a live employee-facing timeline.
- Automatic escalation: agent → supervisor → employer HR admin on breach.
- HR-facing org health dashboard (adoption, fulfilment time, breach rate).
- AI-assisted ticket triage (Claude API) with deterministic fallback.
- Role-based auth with tenant-isolated data access.

### Technical decisions worth calling out
- State machine as a reusable module shared by both order and repair flows (not two copies of similar logic).
- Append-only event log instead of mutating a `status` field — chosen specifically so the employee-facing timeline is trustworthy (nothing gets silently overwritten).
- AI kept out of anything SLA-critical; used only for a bounded, falls-back-safely classification task.

### "Why I built it specifically for Tortoise" (paragraph)
> Tortoise's own public customer reviews describe exactly the failure mode this prototype is designed to prevent — an order frozen at one vague status for weeks, with support going quiet at the same time. That's not a hypothetical UX nitpick; it's the thing costing Tortoise 1-star reviews and, more importantly, the HR admin's confidence in the program they vouched for internally. I wanted to build something that would have made that specific, real complaint structurally impossible, not a generic device-marketplace clone.

### What I learned from researching Tortoise (short paragraph)
> Tortoise's real challenge doesn't look like "build more customer-facing features" — it looks like an operations-and-trust problem sitting underneath an already fairly polished ordering experience. The catalog/cart/deduction-preview flow is genuinely well-built per their own changelog; the gap is entirely in what happens *after* the order is placed, which is also exactly where B2B2C products lose renewal-worthy HR trust, since HR only hears about failures secondhand from employees.

### Concise message to the Tortoise hiring team
> Hi team — I'm applying for the SDE Intern role. Rather than send a generic portfolio project, I researched Tortoise's product and public customer feedback and built a prototype ("Tortoise Pulse") that addresses a specific, evidenced problem: order/repair status opacity and support unreachability, both documented in public App Store reviews. It's a state-machine-driven tracking and escalation system with a live demo and full architecture writeup attached. Happy to walk through the design decisions and how I'd connect it to your real systems.

### GitHub repository structure
```
tortoise-pulse/
  client/            # Next.js app
  server/            # Express API
  docs/
    architecture.md
    demo-script.md
  README.md
```

### Demo presentation structure
Slide 1: the two review quotes. Slide 2: journey map with fulfilment highlighted. Slide 3: architecture diagram. Slides 4–7: live product walkthrough (screen share, not screenshots). Slide 8: roadmap.

---

*Sources used: tortoise.pro (home, about-us, terms), tortoise.pro/resources/blog (multiple articles), Apple App Store and Google Play listings for "Tortoise Benefits," Crunchbase, Tracxn, CBInsights (Tortoise vs. Vaigo/Workwize/allwhere/Belonio/Unipe/NovaLend comparison pages), Inc42, Wellfound/Cutshort careers pages, Trustpilot, Empuls/Xoxoday integration help page, LinkedIn (Vardhan Koshal profile, Tortoise company page) — all fetched September 2026.*
