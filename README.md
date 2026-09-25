# 🐢 Tortoise Pulse

> **Real-time Order & Repair Transparency Platform** — Corporate Device Benefit Operations Engine  
> Built by [Gaurav Jain](https://gauravjain.vercel.app/) for [Tortoise](https://www.tortoise.pro/)

**Tortoise Pulse** is a real-time order and repair transparency platform that provides live SLA countdown tracking and proactive breach alerts to eliminate employee escalations across corporate device benefit programs.

---

## 🔍 The Problem & Vision

Corporate device benefit programs often suffer from severe post-purchase opacity:

> *"I placed an order 6 weeks ago. The app has been showing 'supplier has received the order' for the entire time. I have tried WhatsApp and calling but no one is responding."*
>
> *"No communication for 2+ weeks after order was approved."*
> — *App Store / Play Store User Reviews*

When employees commit monthly salary deductions towards hardware benefits, silence destroys trust. **Tortoise Pulse** makes delivery delays and communication breakdowns **structurally impossible**:
- Every fulfillment and repair stage is strictly governed by contractual SLA timers.
- Overdue shipments automatically trigger proactive notifications and operational escalations **before** an employee ever has to reach out.
- Complete transparency: every milestone transition is an immutable, timestamped event.

---

## ✨ Core Features & Capabilities

### ⏱️ Real-Time Live SLA Countdown Timers
- **Live-ticking SLA countdowns**: Every active order and repair features an animated countdown clock updating second-by-second (`Xh Ym Zs remaining`).
- **Dynamic progress bars**: Visual threshold meters that transition smoothly from healthy green (`var(--brand)`) to caution amber (`#fbbf24`) to critical overdue red (`#f87171`).
- **Overdue severity indicators**: Accurately tracks accumulated overdue hours (+Xh Ym overdue) with pulsating status badges.

### 🛡️ Proactive SLA Breach Detection & Email Alerts
- **Automated SLA monitor**: Scans order/repair elapsed durations against organization-specific SLA limits across each stage.
- **Proactive notification engine**: Dispatches in-app alerts and proactive breach emails with root causes (e.g., *Supplier Logistics Delay*, *Courier Transit Hold*, *OEM Service Center Backlog*), revised ETAs, and auto-escalation to the ops desk.
- **Active Breaches Hub for HR**: Dedicated control panel for HR admins to inspect and audit organization-wide delayed shipments.

### 📦 Self-Service Device Order Placement Flow
- **Approved catalog selection**: Browse certified devices (MacBook Pro M3, ThinkPad X1 Carbon, Dell XPS 15, HP EliteBook, Surface Laptop).
- **Instant procurement initialization**: Select device, confirm leasing tenure and SLA commitments, and instantly launch the live tracking timeline.

### 📜 Immutable Event-Driven Timelines
- **End-to-end lifecycle tracking**:
  - **Orders**: `placed → confirmed → sourced → dispatched → in_transit → delivered`
  - **Repairs**: `pickup_scheduled → picked_up → at_service_center → repaired → dispatched_back → delivered`
- **Audit-ready logs**: Every transition captures timestamp, operator role, transit identifiers, and status notes.

### 🤖 AI-Powered Ticket Triage (Groq Llama 3.1)
- **Instant triage**: Submitting a support ticket automatically evaluates category (`order-stuck`, `repair-overdue`, `billing-dispute`, `device-issue`, `general`) and urgency.
- **Automated response generation**: Provides instant contextual answers (e.g., live DTDC courier tracking numbers or service center turnaround times).
- **3-tier fail-safe resilience**: Groq Cloud API (`llama-3.1-8b-instant`) → Realistic Mock Engine → Rule-based keyword classifier. Support tickets are never dropped or blocked.

### 📊 Comprehensive Multi-Role Experience

| Role | Portal & Capabilities |
| :--- | :--- |
| **Employee** (`priya@deloitte.in`) | Live SLA order countdowns, repair tracking with loaner device visibility, 1-click order placement, Tortoise Care annual repair quota usage, ticket desk, notification center. |
| **Support Agent** (`agent@tortoise.pro`) | Central operational queue prioritized by SLA urgency and breach flags, 1-click state machine transitions, ticket resolution workspace. |
| **HR Admin** (`hr@deloitte.in`) | Org-wide device health analytics, breach rate KPIs, SVG fulfillment trend graphs, proactive employee protection telemetry. |

### 🎨 Visual & Aesthetic Design
- **Dark Glassmorphism UI**: Tailored to Tortoise's signature dark aesthetic and lime accent (`#83eda8`).
- **Custom SVG Telemetry Charts**: Scalable vector charts for 7-day procurement volume and breach frequency trends.
- **Responsive Layout**: Desktop sidebar navigation with mobile drawer support.
- **Brand Favicon Suite**: Custom Tortoise shell + telemetry pulse SVG, 32px/192px PNGs, and Apple Touch icons.

---

## 🏗️ Technical Architecture

```
tortoise-pulse/
  ├── src/
  │   ├── app/
  │   │   ├── (auth)/login/             ← Role-based demo switcher & credentials
  │   │   ├── employee/
  │   │   │   ├── dashboard/            ← Live countdowns, order modal, benefit usage
  │   │   │   ├── cases/[id]/           ← Interactive timeline & tracking details
  │   │   │   └── support/              ← Ticket creation & AI triage desk
  │   │   ├── agent/queue/              ← Operational queue & stage transition engine
  │   │   ├── hr/
  │   │   │   ├── dashboard/            ← Org analytics, KPIs & SVG trend charts
  │   │   │   └── breaches/             ← SLA escalation & proactive email monitoring
  │   │   ├── api/                      ← Next.js API Routes (Node.js runtime)
  │   │   │   ├── auth/                 ← JWT issuance (jose) & verification
  │   │   │   ├── employee/             ← Cases, tickets, notifications, benefit quotas
  │   │   │   ├── agent/                ← Case queue & state transitions
  │   │   │   ├── hr/                   ← Organization analytics & breach queries
  │   │   │   └── internal/sla-scan     ← SLA detection & escalation scanner
  │   │   ├── globals.css               ← Design tokens, animations, responsive utilities
  │   │   └── layout.tsx                ← Global layout, authentication context & icons
  │   ├── components/                   ← Sidebar, AppLayout, LiveTimers, Charts
  │   ├── context/                      ← AuthContext & centralized useApi client
  │   ├── lib/
  │   │   ├── auth.ts                   ← HS256 JWT sign/verify
  │   │   ├── groqTriage.ts             ← Llama 3.1 AI ticket classifier & auto-responder
  │   │   ├── stateMachine.ts           ← Transition rules & SLA limits
  │   │   └── store.ts                  ← Singleton store with pre-seeded scenarios
  │   └── types/                        ← TypeScript domain definitions
```

---

## ⚙️ State Machine Rules

Every order and repair adheres to a strictly validated transition model:

```
[Order Flow]
Placed ──────► Confirmed ──────► Sourced ──────► Dispatched ──────► In Transit ──────► Delivered

[Repair Flow]
Pickup Scheduled ──► Picked Up ──► At Service Center ──► Repaired ──► Dispatched Back ──► Delivered
```

- **Validation**: Any non-sequential or unpermitted stage transition is rejected with a `409 Conflict`.
- **Immutability**: Historical events are append-only.
- **Configurable SLA Limits**: Stage deadlines (in hours) are customizable per corporate organization contract.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/tortoise.git
cd tortoise
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
# Required for signing JWTs (minimum 32 chars)
JWT_SECRET=tortoise-pulse-dev-secret-32-chars-min

# AI Triage Mode: true = deterministic mock (default), false = live Groq API
MOCK_AI=true

# Optional: Live Groq API Key (get free at https://console.groq.com)
# GROQ_API_KEY=gsk_your_groq_key_here

# Internal SLA scanner secret
INTERNAL_SECRET=tortoise-internal
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔑 Demo Accounts

Use the pre-filled demo quick-access buttons on the login screen (password: `demo123`):

| Persona | Email | Purpose & Key Scenarios |
| :--- | :--- | :--- |
| **Employee** | `priya@deloitte.in` | Inspect 46-day breached order, live countdowns, raise AI support tickets, order new devices. |
| **Support Agent** | `agent@tortoise.pro` | View prioritized triage queue with red breach badges, advance stages, resolve tickets. |
| **HR Admin** | `hr@deloitte.in` | Audit Deloitte India device health metrics, view active breach rosters, inspect 7-day trend charts. |

---

## 👨‍💻 Author

Created with ❤️ by **[Gaurav Jain](https://gauravjain.vercel.app/)**
