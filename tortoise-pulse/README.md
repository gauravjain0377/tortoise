# 🐢 Tortoise Pulse

> **Order & Repair Transparency Engine** — An SDE Intern Application Project for [Tortoise](https://www.tortoise.pro/)

**One-line pitch:** Tortoise Pulse turns every device order and repair into a live, auditable timeline with automatic SLA-breach escalation — so "no update for 1.5 months" becomes structurally impossible.

---

## 🔍 Why I Built This

While researching Tortoise's product before applying, I found this in a public App Store review:

> *"I placed an order 6 weeks ago. The app has been showing 'supplier has received the order' for the entire time. I have tried WhatsApp and calling but no one is responding."*

And another:

> *"No communication for 2+ weeks after order was approved."*

This is not a hypothetical UX issue. It's a specific, documented, repeated failure at the most trust-critical moment in Tortoise's product — **right after an employee has committed salary deductions**.

Tortoise Pulse is designed to make this failure **structurally impossible**:
- Every stage transition is timestamped and immutable
- SLA breach detection runs automatically
- Agents and HR admins are escalated **before** employees have to chase support
- The employee always knows exactly where their order is and why it's delayed

---

## 🎯 What It Does

| Role | Experience |
|---|---|
| **Employee** | Real-time order/repair timeline, SLA countdown, notifications, AI-powered ticket creation |
| **Support Agent** | Sorted queue with breach flags, one-click stage transitions, ticket response |
| **HR Admin** | Org-wide health dashboard, breach alerts, trend charts, proactive SLA monitoring |

---

## 🚀 Quick Start (no database, no API key needed)

```bash
git clone https://github.com/your-username/tortoise-pulse
cd tortoise-pulse
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Login page with demo account buttons.

### Demo Accounts (password: `demo123`)

| Role | Email | What you'll see |
|---|---|---|
| Employee | `priya@deloitte.in` | A **breached order** (46 days stuck), 1 repair, 1 delivered — great for the demo |
| Agent | `agent@tortoise.pro` | Queue with 3 breached cases sorted to the top |
| HR Admin | `hr@deloitte.in` | Dashboard showing 3 active breaches, breach rate, trend charts |

---

## 🏗️ Architecture

```
Next.js 14 (App Router)
  ├── /src/app/api/          ← Backend API routes (Node.js runtime)
  │   ├── auth/login         ← JWT auth with bcrypt
  │   ├── auth/me            ← Current user + unread count
  │   ├── employee/cases     ← Case list with SLA enrichment
  │   ├── employee/cases/[id]← Case detail with full timeline
  │   ├── employee/tickets   ← Create ticket → AI triage → route
  │   ├── agent/queue        ← All active cases, sorted by SLA urgency
  │   ├── agent/cases/[id]/transition  ← State machine transition
  │   ├── hr/summary         ← Org-wide KPIs and trend data
  │   ├── hr/breaches        ← All currently breached cases for org
  │   └── internal/sla-scan  ← SLA breach detection (called by cron)
  │
  ├── /src/lib/              ← Core business logic
  │   ├── store.ts           ← In-memory data store (seed data)
  │   ├── stateMachine.ts    ← Transition validation, SLA calculation
  │   ├── auth.ts            ← JWT sign/verify (jose)
  │   └── groqTriage.ts      ← AI triage with 3-tier fallback
  │
  ├── /src/app/(pages)/      ← Frontend React pages
  │   ├── login/             ← Auth with demo account quick-fill
  │   ├── employee/dashboard ← Case cards + notifications
  │   ├── employee/cases/[id]← Vertical timeline + SLA countdown
  │   ├── employee/support   ← Ticket creation + AI triage result
  │   ├── agent/queue        ← Sortable table + transition controls
  │   ├── hr/dashboard       ← KPI cards + bar charts
  │   └── hr/breaches        ← Breach list with overdue indicators
  │
  └── /src/context/          ← Auth context + useApi hook
```

---

## 🧠 State Machine

The core of the system. Every case (order or repair) follows a **validated state machine**:

**Order:** `placed → confirmed → sourced → dispatched → in_transit → delivered`

**Repair:** `pickup_scheduled → picked_up → at_service_center → repaired → dispatched_back → delivered`

Rules:
- Every transition is validated against an allowed-transitions map — invalid transitions return `409`
- Every transition appends an **immutable event** to the event log — nothing is ever overwritten
- Each stage has an SLA limit (configurable per org) — the breach detector flags overdue stages

---

## 🤖 AI Ticket Triage (3-tier fallback)

```
Employee submits ticket
         ↓
GROQ_API_KEY in .env?
   NO (default demo) → Mock AI response (realistic, 600ms delay)
   YES → Call Groq API (llama-3.1-8b-instant)
         ↓ FAILS → Rule-based keyword classifier
                    ↓ ALWAYS returns valid result
                    Ticket is NEVER blocked
```

Categories: `order-stuck` | `repair-overdue` | `billing-dispute` | `device-issue` | `general`

SLA by category: billing-dispute = 2h, order-stuck = 4h, repair-overdue = 6h, device-issue = 8h, general = 24h

### To use real Groq AI:
1. Get a free key at [console.groq.com](https://console.groq.com)
2. Add to `.env.local`: `GROQ_API_KEY=gsk_...` and `MOCK_AI=false`

---

## 🔐 Auth & Security

- JWT tokens signed with HS256 (jose library)
- bcrypt password hashing
- Role-based access: employees only see their own cases, HR admins only see their org
- All queries filtered by `orgId`/`employeeId` from the JWT — never from client params
- Input length limits on all text fields

---

## 📊 Demo Data (pre-seeded)

The store initialises with realistic demo data on first API call:

| Case | Employee | Status | Why it's interesting |
|---|---|---|---|
| iPhone 15 Pro Max | Priya (Deloitte) | **BREACHED** — 46 days in "confirmed" | Main demo case — the "1.5 month" scenario |
| MacBook Pro M3 | Priya (Deloitte) | Delivered | Healthy comparison |
| MacBook Pro (repair) | Priya (Deloitte) | At service center | Shows repair flow + loaner device |
| Galaxy S24 Ultra | Rahul (Deloitte) | In transit | Near-SLA |
| Dell XPS 15 | Aisha (Deloitte) | **BREACHED** — 14 days in "sourced" | Second breach |
| iPhone 15 | Sneha (Paytm) | **BREACHED** | Cross-org breach |
| Lenovo ThinkPad | Deepa (Indus) | **BREACHED** — dispatched not moving | Third org |

---

## 🏭 What's Stubbed vs. What Would Be Real

| Feature | In Prototype | In Production |
|---|---|---|
| Data store | In-memory (resets on restart) | MongoDB Atlas / Postgres |
| Auth | JWT + bcrypt | SSO via employer HRMS |
| SLA breach detection | Manual `/api/internal/sla-scan` call | EventBridge / Cloud Scheduler |
| Notifications | In-app only | WhatsApp Business API + SendGrid |
| Supplier updates | Agent manual transitions | Supplier webhook integration |
| HRMS eligibility | Hardcoded demo users | Darwinbox / Keka / Zoho adapters |
| AI triage | Mock / Groq | Groq or Gemini with rate-limit handling |

---

## 📁 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom CSS |
| Auth | jose (JWT) + bcryptjs |
| AI | Groq API (llama-3.1-8b-instant) with fallback |
| Database | In-memory store (production-ready schema) |
| Deployment | Vercel (zero config) |

---

## 🎬 Demo Script (4–5 minutes)

1. **The Problem** (30s): Show the two App Store review quotes
2. **Existing Gap** (30s): Journey map with fulfilment stage highlighted
3. **Solution** (30s): Tortoise Pulse pitch
4. **Live Demo** (2 min):
   - Login as `priya@deloitte.in` → breached order card
   - Click order → timeline, SLA countdown, reason code
   - Raise a support ticket → AI triage result
   - Login as agent → breached case at top → advance stage → notification fires
   - Login as HR admin → breach rate dashboard
5. **Architecture** (30s): State machine + event log as the core decision
6. **Measurable benefit** (30s): "This doesn't eliminate delays — it makes them structurally impossible to hide"

---

## 🗺️ Roadmap to Production

- **Phase 1 (prototype, done):** State machine, SLA breach, AI triage, 3 role dashboards
- **Phase 2:** Supplier webhook integration (auto-advance stages, no manual agent work)
- **Phase 3:** HRMS adapters (Darwinbox, Keka, Zoho) for real employee sync
- **Phase 4:** WhatsApp Business API for real push notifications
- **Phase 5:** Persistent database (MongoDB Atlas or Postgres) + multi-region

---

Built by **Gaurav Jain** as an SDE Intern application project for [Tortoise](https://www.tortoise.pro/).  
Research sources: tortoise.pro, App Store/Play Store reviews, Crunchbase, Inc42, LinkedIn — September 2026.
