# Synaptic — High-Level Architecture
**Version:** 1.0 | **Last Updated:** June 11, 2026

---

## System Overview

Synaptic is structured as four interconnected functional modules, all operating within a single consultant workspace. A shared services layer handles cross-cutting concerns (authentication, notifications, file storage, PDF generation, email). All external-facing surfaces are rendered through a white-label presentation layer.

---

## Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                         EXTERNAL TOUCHPOINTS                                    ║
║                                                                                  ║
║  ┌─────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐ ║
║  │  CLIENT             │   │  PARTICIPANT          │   │  CONSULTANT          │ ║
║  │  Registration Form  │   │  Session Sign-Up Page │   │  Email Inbox         │ ║
║  │  (White-labeled)    │   │  (White-labeled)      │   │  (Branded sender)    │ ║
║  └──────────┬──────────┘   └──────────┬────────────┘   └──────────┬───────────┘ ║
╚═════════════╪═══════════════════════════╪════════════════════════╪══════════════╝
              │                           │                         │
              ▼                           ▼                         ▼
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    WHITE-LABEL PRESENTATION LAYER                               ║
║   [Consultant Logo] [Brand Colors] [Business Name] [name.synaptic.app]          ║
║   "Powered by Synaptic" footer on all client/participant-facing pages (V1)      ║
╚══════════════════════════╦═══════════════════════════════════════════════════════╝
                           ║
╔══════════════════════════╩═══════════════════════════════════════════════════════╗
║                    CONSULTANT WORKSPACE (Single Tenant — V1)                    ║
║                                                                                  ║
║  ┌───────────────────────────────────────────────────────────────────────────┐  ║
║  │                         CORE MODULES                                      │  ║
║  │                                                                           │  ║
║  │  ┌──────────────────────┐         ┌──────────────────────────────────┐   │  ║
║  │  │  MODULE 1            │         │  MODULE 2                        │   │  ║
║  │  │  CLIENT ONBOARDING   │────────►│  SESSION MANAGEMENT              │   │  ║
║  │  │  & PROPOSAL MGMT     │         │                                  │   │  ║
║  │  │                      │◄────────│  Sessions ──► Programs           │   │  ║
║  │  │  • Request Inbox     │         │  Milestones ──► Calendar         │   │  ║
║  │  │  • Client Profiles   │         │  Lifecycle (Draft → Archived)    │   │  ║
║  │  │  • Programs          │         │  Document Attachments            │   │  ║
║  │  │  • Offerings Config  │         │  Pre-Flight Checklist            │   │  ║
║  │  │  • Proposal Builder  │         │  Notifications & Reminders       │   │  ║
║  │  │  • Pipeline Kanban   │         │  Activity Log                    │   │  ║
║  │  │  • Revenue Tracking  │         │                                  │   │  ║
║  │  │  • White-Label Config│         └──────────────┬───────────────────┘   │  ║
║  │  └──────────┬───────────┘                        │                       │  ║
║  │             │                                    │                       │  ║
║  │             │                    ┌───────────────▼───────────────────┐   │  ║
║  │             │                    │  MODULE 3                         │   │  ║
║  │             └───────────────────►│  CONTENT LIBRARY                  │   │  ║
║  │                                  │                                   │   │  ║
║  │                                  │  • Asset Management (files/links) │   │  ║
║  │                                  │  • Question Bank                  │   │  ║
║  │                                  │  • Session Package Builder        │   │  ║
║  │                                  │  • Access Code Engine             │   │  ║
║  │                                  │  • Live Quiz / Poll Delivery      │   │  ║
║  │                                  │  • Assessment Results Store       │   │  ║
║  │                                  │  • Feedback Collection            │   │  ║
║  │                                  │                                   │   │  ║
║  │                                  └──────────────┬────────────────────┘   │  ║
║  │                                                 │                        │  ║
║  │             ┌───────────────────────────────────▼──────────────────┐    │  ║
║  │             │  MODULE 4: DASHBOARD & REPORTING                      │    │  ║
║  │             │                                                        │    │  ║
║  │  Onboarding─►  • Pipeline & Revenue Widgets                         │    │  ║
║  │  Sessions ──►  • Session & Milestone Widgets                        │    │  ║
║  │  Content ───►  • Assessment & Learning Analytics                    │    │  ║
║  │             │  • Content Performance Reports                        │    │  ║
║  │             │  • Post-Training Summary (PDF Generator)              │    │  ║
║  │             │  • Recent Activity Feed (cross-module)                │    │  ║
║  │             └───────────────────────────────────────────────────────┘    │  ║
║  └───────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
                           ║
╔══════════════════════════╩═══════════════════════════════════════════════════════╗
║                         SHARED SERVICES LAYER                                   ║
║                                                                                  ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐║
║  │ AUTH &       │  │ FILE         │  │ EMAIL &       │  │ PDF GENERATION       │║
║  │ WORKSPACE    │  │ STORAGE      │  │ NOTIFICATIONS │  │ SERVICE              │║
║  │ MANAGEMENT   │  │              │  │               │  │                      │║
║  │              │  │ • Content    │  │ • In-app      │  │ • Proposal PDF       │║
║  │ • Login      │  │   assets     │  │   alerts      │  │ • Post-Training      │║
║  │ • Workspace  │  │ • Attachments│  │ • Email       │  │   Summary PDF        │║
║  │   config     │  │ • Exports    │  │   templates   │  │ • White-label        │║
║  │ • Branding   │  │ • Report PDFs│  │ • Reminders   │  │   branding applied   │║
║  │   settings   │  │ • 50MB limit │  │ • Digest mode │  │                      │║
║  │ • Subdomain  │  │              │  │ • Configurable│  │                      │║
║  └──────────────┘  └──────────────┘  │   sender      │  └──────────────────────┘║
║                                      └──────────────┘                           ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Module Interaction Map

| Interaction | From | To | Data Passed |
|---|---|---|---|
| Program created → Session linked | Onboarding | Session Mgmt | Client ID, Program ID, Proposal ID |
| Offerings catalogue → Session type | Onboarding | Session Mgmt | Offering name, type, duration |
| Accepted program → Participant roster | Onboarding | Content Library | Participant list, program ID |
| Session activated → Access code surfaced | Content Library | Onboarding (Program Record) | Access code, validity window, sign-up URL |
| Session content package → Session record | Content Library | Session Mgmt | Package ID, content item list |
| Assessment results → Dashboard | Content Library | Dashboard | Scores, response rates, feedback data |
| Session milestones → Dashboard | Session Mgmt | Dashboard | Milestone status, overdue count |
| Invoice status → Dashboard | Onboarding | Dashboard | Invoice value, payment status |
| Pipeline proposals → Dashboard | Onboarding | Dashboard | Proposal values by stage |
| All modules → Activity Feed | All | Dashboard | Action type, timestamp, linked record ID |
| White-label config → All client surfaces | Onboarding (Branding) | All modules | Logo URL, brand colors, business name |
| Post-training data → Summary PDF | All modules | Dashboard (PDF Gen) | Session details, assessment results, feedback |

---

## Data Flow: Complete Engagement Lifecycle

```
STEP 1: CLIENT INTAKE
─────────────────────
Client fills registration form
        │
        ▼
[Onboarding Module]
Request stored in inbox
        │
        ▼
Consultant reviews → Accepts
        │
        ▼
Client Profile created (auto-populated from form)
Program record created and linked to client


STEP 2: PROPOSAL
────────────────
[Onboarding Module]
Consultant selects offerings from catalogue
        │
        ▼
Adjusts cost/duration, attaches T&Cs
        │
        ▼
Exports white-labeled proposal PDF
        │
        ▼
Client accepts (digital button or external)
        │
        ▼
Proposal status → Accepted
Program status → Active pipeline


STEP 3: CONTENT PREPARATION
────────────────────────────
[Content Library Module]
Consultant opens Content Library
        │
        ▼
Filters by audience level, delivery mode, service type
        │
        ▼
Assembles Session Content Package
(slides + exercises + assessments + external links)
        │
        ▼
Builds pre-session assessment from question bank
        │
        ▼
Package linked to session record


STEP 4: SESSION PLANNING
─────────────────────────
[Session Management Module]
Session created → linked to program
        │
        ▼
Schedule set (start/end, delivery mode, location/link)
        │
        ▼
Milestones added to timeline
        │
        ▼
Pre-flight checklist completed
        │
        ▼
Session status → Scheduled


STEP 5: LIVE DELIVERY
──────────────────────
[Content Library Module]
Session status → Active
Access code issued → shared with participants
        │
        ▼
Participants sign up (name + code)
        │                 │
        ▼                 ▼
Pre-session         Participant
assessment sent     roster populated
        │
        ▼
Training runs:
  ├── Live quizzes (scored, real-time results)
  ├── Live polls (unscored, discussion prompts)
  └── End-of-day feedback (daily pulse check)


STEP 6: COMPLETION
───────────────────
[Content Library + Session Management]
Final post-training evaluation deployed
        │
        ▼
Session status → Completed
        │
        ▼
All results stored → linked to session record
Invoice status updated in program record


STEP 7: REPORTING
──────────────────
[Dashboard & Reporting Module]
Consultant generates post-training summary
        │
        ▼
Pre/post comparison (manual question mapping)
Assessment results, feedback trends assembled
        │
        ▼
Consultant customizes: adds key takeaways,
curates participant quotes, toggles sections
        │
        ▼
Exports white-labeled PDF
        │
        ▼
Shares with client ✓
```

---

## White-Label Layer: What Gets Branded

```
CONSULTANT CONFIGURES ONCE:
┌─────────────────────────────────────────────┐
│  Logo (PNG/SVG)                             │
│  Primary Color (#hex)                       │
│  Secondary Color (#hex)                     │
│  Business Name                              │
│  Tagline (optional)                         │
│  Subdomain: name.synaptic.app               │
│  Sender Email: hello@theirconsultingfirm.com│
└─────────────────────────────────────────────┘
                    │
                    ▼ Applied automatically to:
┌─────────────────────────────────────────────┐
│  ✅ Client registration form                │
│  ✅ Participant session sign-up page        │
│  ✅ Assessment, quiz, poll, feedback pages  │
│  ✅ Email notifications (all types)         │
│  ✅ Proposal PDF export                     │
│  ✅ Post-training summary PDF               │
│  ✅ All subdomain URLs                      │
│                                             │
│  ➕ "Powered by Synaptic" in footer (V1)    │
│  🔒 Removable in V2 paid tier               │
└─────────────────────────────────────────────┘
```

---

## V2 Multi-Tenant Architecture (Target State)

```
╔══════════════════════════════════════════════════════════════════╗
║              SYNAPTIC PLATFORM (Multi-Tenant V2)                ║
║                                                                  ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ ║
║  │  WORKSPACE A    │  │  WORKSPACE B    │  │  WORKSPACE C    │ ║
║  │  (Consultant 1) │  │  (Consultant 2) │  │  (Firm / Team)  │ ║
║  │                 │  │                 │  │                 │ ║
║  │  Isolated:      │  │  Isolated:      │  │  Isolated:      │ ║
║  │  • Clients      │  │  • Clients      │  │  • Clients      │ ║
║  │  • Content      │  │  • Content      │  │  • Content      │ ║
║  │  • Sessions     │  │  • Sessions     │  │  • Sessions     │ ║
║  │  • Branding     │  │  • Branding     │  │  • Branding     │ ║
║  │  • Reporting    │  │  • Reporting    │  │  • Reporting    │ ║
║  │  Free Tier      │  │  Paid Tier      │  │  Paid Tier      │ ║
║  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ ║
║           └───────────────────┬┴────────────────────┘          ║
║                               ▼                                 ║
║              SHARED PLATFORM INFRASTRUCTURE                     ║
║         (Auth, Billing, File Storage, Email, PDF Gen)           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Key Architectural Principles

| Principle | Description |
|---|---|
| **Module Cohesion** | Each module owns its data and exposes it to other modules via well-defined references (IDs and status events), not direct data sharing |
| **White-Label by Default** | The branding layer is applied at the presentation tier — all client-facing pages are rendered through the same template engine with workspace branding injected |
| **Single Sign-On for Consultant** | The consultant authenticates once and accesses all four modules within their workspace |
| **No-Auth Participant Access** | Participants access session content via code-based, time-limited, no-login pages — no account creation required |
| **Workspace Isolation (V2)** | Each consultant workspace is a fully isolated tenant — separate data stores, separate subdomains, separate branding configs |
| **Stateless Exports** | All PDFs are generated on demand from live data — no pre-rendered or cached report files stored |
| **Event-Driven Activity Log** | Every cross-module action (status change, assessment result, milestone update) emits an event captured in the activity log and surfaced in the dashboard feed |
