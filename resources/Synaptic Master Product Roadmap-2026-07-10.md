# Synaptic — Master Product Roadmap
**Version:** 1.0 | **Last Updated:** June 11, 2026 | **Status:** Draft

---

## Roadmap Vision

Synaptic is built in four phases — from a focused single-consultant foundation through a fully open multi-tenant SaaS platform. Each phase delivers standalone value while laying the architectural groundwork for what comes next.

---

## Phase Overview

| Phase | Theme | Target | Value Delivered |
|---|---|---|---|
| **P0** | Foundation | Months 1–3 | Core platform operational — client intake, content storage, session records, live dashboard |
| **P1** | Delivery & Planning | Months 4–6 | Full engagement delivery — proposals, live assessments, calendar, notifications, Kanban pipeline |
| **P2** | Intelligence & Reporting | Months 7–9 | Client-facing outputs — post-training summaries, revenue tracking, advanced analytics |
| **V2** | Multi-Tenant SaaS | Month 10+ | Platform opens to all consultants — self-sign-up, isolated workspaces, subscriptions |

---

## Master Requirements Coverage by Phase

| Master Requirement | P0 | P1 | P2 | V2 |
|---|---|---|---|---|
| #1 Session Management | ✅ | ✅ | | |
| #2 Organization Profiles | ✅ | | | |
| #3 POC Assignment | ✅ | | | |
| #4 Timeline & Milestone Tracking | | ✅ | | |
| #5 Service Type Classification | ✅ | | | |
| #6 Content Library | ✅ | ✅ | ✅ | |
| #7 Session Lifecycle Management | ✅ | | | |
| #8 Calendar View | | ✅ | | |
| #9 Document Attachment | ✅ | | | |
| #10 Search & Filter | ✅ | ✅ | | |
| #11 Dashboard & Reporting | ✅ | ✅ | ✅ | |
| #12 Notifications & Reminders | | ✅ | | |
| #13 Role-Based Access | | | | ✅ |
| #14 Activity Log / Audit Trail | ✅ | | ✅ | |
| #15 Export & Integration | | ✅ | ✅ | ✅ |

---

## P0 — Foundation *(Months 1–3)*
**Theme:** Get the platform operational. Every module is live in its most essential form.

### 🟦 Client Onboarding & Proposal Management
| Feature | Priority | Notes |
|---|---|---|
| Public client registration form (white-labeled) | Must-have | No client login required |
| Request inbox (New → Under Review → Accepted → Declined) | Must-have | |
| Client profile creation (manual + auto from request) | Must-have | |
| Offerings catalogue configuration (Training, Consultancy, etc.) | Must-have | |
| Workspace branding setup (logo, colors, business name, subdomain) | Must-have | Foundation for all white-label surfaces |
| Manual notes and discovery session notes | Must-have | |
| Request acceptance with automated client email notification | Must-have | Requires basic email integration |

### 🟩 Content Library
| Feature | Priority | Notes |
|---|---|---|
| File upload (PPTX, PDF, DOCX, MP4, etc.) — 50MB max | Must-have | |
| External resource linking (YouTube, URLs) | Must-have | |
| Content metadata tagging (type, audience, delivery mode) | Must-have | |
| Folder and collection organization | Must-have | |
| Content search and filter | Must-have | |
| Question bank builder (all question types) | Must-have | |
| Session access code generation and participant sign-up page | Must-have | White-labeled; name + code only |

### 🟧 Session Management
| Feature | Priority | Notes |
|---|---|---|
| Session creation linked to program | Must-have | |
| Session lifecycle: Draft → Scheduled → Active → Completed → Archived | Must-have | |
| Session type classification from offerings catalogue | Must-have | |
| Multi-day session configuration | Must-have | |
| Document attachment per session (50MB max) | Must-have | |
| Pre-flight session checklist | Must-have | Separate from onboarding checklist |
| Activity log per session | Must-have | |

### 🟥 Dashboard & Reporting
| Feature | Priority | Notes |
|---|---|---|
| Active Sessions widget | Must-have | |
| Upcoming Sessions widget (14-day lookout) | Must-have | |
| Pending Requests widget | Must-have | |
| Overdue Milestones widget | Must-have | |
| Pipeline Value widget (USD) | Must-have | |
| Outstanding Invoices widget | Must-have | |
| Recent Activity Feed (filterable by Client, Module, Activity Type) | Must-have | |

**P0 Exit Criteria:** A consultant can receive a client request, create a client profile, configure offerings, build a content library, create and activate a session with an access code, and view a live dashboard — end to end.

---

## P1 — Delivery & Planning *(Months 4–6)*
**Theme:** Full engagement delivery. Proposals are built, sessions are planned, assessments run live, and the pipeline is visible.

### 🟦 Client Onboarding & Proposal Management
| Feature | Priority | Notes |
|---|---|---|
| Proposal builder (offerings selection, cost override, cover message) | Must-have | USD only |
| T&C upload as proposal metadata | Must-have | |
| Proposal PDF export (white-labeled, Synaptic-free) | Must-have | |
| Optional digital proposal acceptance button | Should-have | Acknowledgment only; no e-signature |
| Proposal status tracking (Draft → Accepted → Declined) | Must-have | |
| Proposal duplication | Should-have | |
| Proposal version history | Should-have | |
| Participant list management (manual + CSV import) | Must-have | |
| Participant tagging (role, department, technical level) | Should-have | |
| Session access code visible on program record | Must-have | Links to Content Library code management |
| Pipeline Kanban view (8 stages) | Must-have | |
| Pipeline list/table view toggle | Should-have | |
| Email communication templates (configurable sender, domain verification) | Must-have | |
| Follow-up reminders on client records and proposals | Should-have | |
| Pre-engagement onboarding checklist (Training vs. Consultancy defaults) | Should-have | |

### 🟩 Content Library
| Feature | Priority | Notes |
|---|---|---|
| Pre-session profiling assessment delivery | Must-have | Shared via link; no login |
| Live quiz delivery during sessions | Must-have | Real-time results, manual pacing |
| Live poll delivery during sessions | Must-have | Unscored; bar chart or word cloud |
| End-of-day feedback forms | Must-have | For multi-day programs |
| Post-training evaluation forms | Must-have | |
| Participant session roster (real-time sign-in tracking) | Must-have | |
| Identified vs. anonymous response modes | Must-have | Per-activity toggle |
| Multi-day session code continuity | Should-have | Single code or per-day |
| Session content package builder | Must-have | Curate + annotate per session |
| Session context parameters (mode, duration, audience) | Should-have | Auto-filter library |
| Consultant notes per content item in session | Should-have | |
| Template session packages | Should-have | Save and reuse |
| Content versioning | Should-have | |
| Content preview | Should-have | |

### 🟧 Session Management
| Feature | Priority | Notes |
|---|---|---|
| Milestone creation and tracking | Must-have | |
| Milestone overdue detection and alerts | Must-have | |
| Program-level Gantt timeline view | Should-have | |
| Calendar view (month/week/day) with milestone markers | Must-have | |
| Scheduling conflict detection | Should-have | |
| Calendar filtering | Should-have | |
| Calendar ICS/Google Calendar export | Should-have | |
| Session search and filter | Must-have | |
| Saved session filter views | Should-have | |
| Notifications: upcoming sessions, overdue milestones, status reminders | Must-have | |
| Custom reminders on sessions | Should-have | |
| Notification preference settings | Should-have | |
| Recurring session setup (Daily / Weekly / Bi-weekly / Monthly) | Should-have | |
| Content Library linking from session record | Must-have | |

### 🟥 Dashboard & Reporting
| Feature | Priority | Notes |
|---|---|---|
| Engagement pipeline funnel report | Must-have | |
| Proposal performance report | Must-have | |
| Session volume and completion reports | Must-have | |
| Milestone performance report | Should-have | |
| Upcoming sessions report (30/60/90-day) | Should-have | |
| Assessment results dashboard (per session) | Must-have | |
| Participant engagement report | Should-have | |
| Daily feedback trend chart | Must-have | |
| Content usage report | Should-have | |
| Revenue summary (YTD, by service type, by client) | Must-have | |
| Outstanding invoices report | Must-have | |
| CSV export for all reports | Must-have | |
| Client engagement summary (per client profile) | Should-have | |

**P1 Exit Criteria:** A consultant can build and send a proposal, run a full session with live quizzes and feedback collection, track milestones on a calendar, view a pipeline Kanban, and export revenue and assessment data as CSV.

---

## P2 — Intelligence & Reporting *(Months 7–9)*
**Theme:** Client-ready outputs and deeper intelligence. The platform produces polished reports and surfaces patterns across engagements.

### 🟦 Client Onboarding & Proposal Management
| Feature | Priority | Notes |
|---|---|---|
| Revenue and payment tracking per program | Must-have | Manual invoice status updates |
| Revenue summary per client (lifetime value) | Should-have | |
| Outbound email tracking via Gmail/Outlook API | Should-have | |
| Communication log (full chronological history) | Should-have | |

### 🟩 Content Library
| Feature | Priority | Notes |
|---|---|---|
| Assessment results dashboard (consolidated per session) | Must-have | |
| Pre/post learning comparison (manual question mapping) | Must-have | |
| Cross-session learning report | Should-have | |
| Post-training evaluation summary (exportable PDF) | Must-have | White-labeled |
| Content performance tracking (usage count, session correlation) | Should-have | |

### 🟧 Session Management
| Feature | Priority | Notes |
|---|---|---|
| Session performance summary | Should-have | |
| Cross-session analytics | Should-have | |
| Activity log export (PDF and CSV) | Should-have | |

### 🟥 Dashboard & Reporting
| Feature | Priority | Notes |
|---|---|---|
| Post-training summary generation (white-labeled PDF) | Must-have | Core client-facing deliverable |
| Post-training summary customization (section toggle, cover message, curated quotes) | Must-have | |
| Post-training summary template (save and reuse) | Should-have | |
| Scheduled report delivery (auto-generate to consultant email) | Should-have | Not auto-sent to client |
| Saved report views | Should-have | |
| Dashboard widget reorder/hide (customization) | Should-have | |
| Multiple saved dashboard views | Should-have | |
| Content gap identification report | Should-have | |
| Revenue by offering report | Should-have | |
| Question bank usage report | Should-have | |

**P2 Exit Criteria:** A consultant can generate a branded post-training summary PDF for any completed session, view revenue by client and service type, and access deep assessment analytics including pre/post learning comparison.

---

## V2 — Multi-Tenant SaaS *(Month 10+)*
**Theme:** Synaptic opens to the world. Any AI consultant can sign up, configure their branded workspace, and run their practice on Synaptic.

### Platform Infrastructure
| Feature | Notes |
|---|---|
| Consultant self-sign-up and workspace provisioning | Automated onboarding flow |
| Multi-tenant data isolation | Full workspace-level separation |
| Subscription management (Free / Paid tiers) | Free = "Powered by Synaptic" visible; Paid = removable |
| Consultant billing and payment processing | Stripe or equivalent |
| Synaptic platform marketing site and marketplace listing | |

### Feature Upgrades
| Feature | Notes |
|---|---|
| Custom domain mapping (CNAME — e.g., portal.consultantname.com) | Beyond subdomain |
| E-signature integration for proposals | DocuSign or equivalent |
| Shareable post-training summary link (expiring URL) | |
| Video conferencing integration (Zoom, Teams, Meet) | Native session link management |
| Auto-invoicing triggered by session completion | |
| Drag-and-drop calendar rescheduling | |
| AI-powered scheduling suggestions | |
| Auto-pairing of pre/post assessment questions | |
| Multi-currency support (beyond USD) | |
| Role-based access control (co-facilitators, team members) | Master requirement #13 |
| Custom report builder (drag-and-drop) | |
| Third-party BI integration (Power BI, Tableau) | |
| AI-generated insights and engagement recommendations | |
| Cross-consultant benchmarking (opt-in) | |
| Client portal (read-only milestone and report access) | |

**V2 Exit Criteria:** Any independent AI consultant can sign up for Synaptic, configure their branded workspace, and run a complete engagement — from client registration through post-training report — without any Synaptic involvement.

---

## Roadmap Summary Timeline

```
Month:    1         2         3    |    4         5         6    |    7         8         9    |   10+
          ├─────────────────────────┼────────────────────────────┼────────────────────────────┼──────────►
Phase:    [──────────── P0 ────────]  [─────────── P1 ───────────]  [─────────── P2 ───────────]  [── V2 ──►]

          Foundation               Delivery & Planning           Intelligence & Reporting     Multi-Tenant

          • Client intake          • Proposal builder            • Post-training summary PDF  • Self-sign-up
          • Content Library        • Live assessments            • Revenue analytics          • Multi-tenancy
          • Session lifecycle      • Calendar + milestones       • Learning analytics         • Subscriptions
          • Core dashboard         • Pipeline Kanban             • Dashboard intelligence     • Role-based access
          • White-label setup      • Notifications               • Saved views & templates    • Custom domains
```

---

## Cross-BRD Dependencies

| Dependency | From Module | To Module | Phase |
|---|---|---|---|
| Access code generated in Content Library is surfaced on session record | Content Library (E1) | Session Mgmt (via Onboarding F6) | P0 |
| Session is always linked to a Program created in Onboarding | Onboarding (B3) | Session Mgmt (A1) | P0 |
| Offerings catalogue drives session type classification | Onboarding (C1) | Session Mgmt (A2) | P0 |
| Content Package assembled in Content Library is linked to a session | Content Library (C1) | Session Mgmt (E3) | P1 |
| Participant roster created in Onboarding feeds assessment delivery | Onboarding (F1–F5) | Content Library (B4–B8) | P1 |
| Assessment results from Content Library feed Dashboard learning analytics | Content Library (B9) | Dashboard (D1–D6) | P1/P2 |
| Invoice status managed in Onboarding feeds Dashboard revenue widgets | Onboarding (H1–H4) | Dashboard (A7, F1–F3) | P1/P2 |
| Session milestones managed in Session Mgmt feed Dashboard overdue widget | Session Mgmt (C2–C3) | Dashboard (A5) | P0/P1 |
| Post-training summary in Dashboard pulls from all four modules | All modules | Dashboard (G1–G5) | P2 |
| T&C documents stored as proposal metadata (not Content Library) | Onboarding (D4) | N/A | P1 |
| White-label branding config applies to all client-facing surfaces | Onboarding (I1–I10) | Content Library, Session Mgmt, Dashboard | P0 |
