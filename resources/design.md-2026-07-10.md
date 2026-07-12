# Synaptic — Technical Design
> Version 1.0 | June 11, 2026 | P0 + P1 Scope

---

## 1. System Overview

Synaptic is a single-tenant (V1) → multi-tenant (V2) SaaS web application. In V1, one consultant workspace is provisioned manually. The architecture is multi-tenancy-ready from day one — every data entity is scoped to a `workspaceId`, and the white-label presentation layer is driven by workspace configuration resolved from the request subdomain.

### Core Modules
| # | Module | Responsibility |
|---|---|---|
| 1 | Client Onboarding & Proposal Management | Client intake, profiles, offerings, proposals, pipeline, revenue |
| 2 | Content Library | Asset storage, question bank, session packages, access codes, assessments |
| 3 | Session Management | Session lifecycle, milestones, calendar, notifications, documents |
| 4 | Dashboard & Reporting | Aggregated metrics, reports, post-training summary PDF |

### Shared Services
- **Auth** — Consultant authentication (NextAuth.js); participant code-based JWT
- **File Storage** — AWS S3 with presigned URLs; 50MB per file limit
- **Email & Notifications** — Resend/SendGrid with configurable sender; in-app + email alerts
- **PDF Generation** — Puppeteer (queued via BullMQ); white-label branding injected at render time
- **Activity Log** — Append-only event table; feeds session audit trail and dashboard activity feed

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for public pages; RSC for dashboard |
| **UI** | Shadcn/ui + Tailwind CSS | Accessible, themeable, white-label-ready |
| **State** | Zustand (UI) + TanStack Query (server state) | Separate concerns cleanly |
| **Backend** | Next.js API Routes | Co-located in V1; extractable to separate service in V2 |
| **Database** | PostgreSQL via Supabase | Row-level security; Realtime subscriptions |
| **ORM** | Prisma | Type-safe queries, migrations, schema management |
| **Auth** | NextAuth.js + Supabase Auth | Consultant: session cookie; Participant: short-lived JWT |
| **File Storage** | AWS S3 | Direct browser upload via presigned URL; 50MB enforced server-side |
| **Email** | Resend | Configurable sender domain; React Email templates |
| **PDF** | Puppeteer (headless Chrome) | Queued via BullMQ; renders styled HTML with branding injected |
| **Real-time** | Supabase Realtime | Live quiz results, participant roster |
| **Background Jobs** | BullMQ + Redis (Upstash) | PDF generation, scheduled notifications, email digests |
| **Hosting** | Vercel (web) + Railway (workers) | Edge middleware for subdomain routing |
| **Subdomain Routing** | Vercel Edge Middleware | Reads `host` header → resolves workspace by slug |

---

## 3. Data Model

### 3.1 Entity Relationship

```
Workspace
  ├── User[]                      (consultant accounts)
  ├── Offering[]                  (service catalogue)
  ├── EmailTemplate[]             (configurable email templates)
  ├── Notification[]              (in-app alerts)
  ├── ContentItem[]               (library assets)
  │     └── ContentVersion[]
  ├── ContentCollection[]
  │     └── ContentCollectionItem[] (many-to-many with ContentItem)
  ├── Question[]                  (global question bank)
  └── Client[]
        ├── Contact[]
        ├── Request[]
        └── Program[]
              ├── Participant[]
              ├── Proposal[]
              │     ├── ProposalLineItem[]
              │     └── ProposalVersion[]
              └── Session[]
                    ├── SessionDay[]
                    ├── Milestone[]
                    ├── SessionPackage
                    │     └── SessionPackageItem[]
                    ├── AccessCode[]
                    │     └── ParticipantSignIn[]
                    │           └── Response[]
                    ├── Assessment[]
                    │     └── AssessmentQuestion[]
                    ├── Attachment[]
                    └── ActivityLog[]
```

### 3.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── WORKSPACE ───────────────────────────────────────────────
model Workspace {
  id             String   @id @default(cuid())
  slug           String   @unique
  businessName   String
  tagline        String?
  logoUrl        String?
  primaryColor   String   @default("#000000")
  secondaryColor String   @default("#ffffff")
  senderEmail    String?
  senderName     String?
  senderVerified Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  users          User[]
  clients        Client[]
  offerings      Offering[]
  contentItems   ContentItem[]
  collections    ContentCollection[]
  questions      Question[]
  emailTemplates EmailTemplate[]
  notifications  Notification[]
}

// ─── USER ─────────────────────────────────────────────────────
model User {
  id          String   @id @default(cuid())
  workspaceId String
  email       String   @unique
  name        String
  role        UserRole @default(ADMIN)
  createdAt   DateTime @default(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id])
}

enum UserRole { ADMIN EDITOR VIEWER }

// ─── OFFERING ─────────────────────────────────────────────────
model Offering {
  id              String         @id @default(cuid())
  workspaceId     String
  name            String
  description     String?
  defaultDuration Float?
  defaultCost     Float?
  status          OfferingStatus @default(ACTIVE)
  tags            String[]
  sortOrder       Int            @default(0)
  createdAt       DateTime       @default(now())

  workspace   Workspace          @relation(fields: [workspaceId], references: [id])
  lineItems   ProposalLineItem[]
  sessions    Session[]
}

enum OfferingStatus { ACTIVE ARCHIVED }

// ─── CLIENT ───────────────────────────────────────────────────
model Client {
  id          String   @id @default(cuid())
  workspaceId String
  orgName     String
  industry    String?
  orgSize     String?
  country     String?
  notes       String?
  isArchived  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  contacts    Contact[]
  requests    Request[]
  programs    Program[]
}

model Contact {
  id        String  @id @default(cuid())
  clientId  String
  name      String
  email     String
  phone     String?
  title     String?
  isPrimary Boolean @default(false)

  client    Client  @relation(fields: [clientId], references: [id])
}

// ─── REQUEST ──────────────────────────────────────────────────
model Request {
  id                 String        @id @default(cuid())
  workspaceId        String
  clientId           String?
  orgName            String
  contactName        String
  email              String
  phone              String?
  jobTitle           String?
  country            String?
  orgSize            String?
  industry           String?
  servicesOfInterest String[]
  preferredStartDate DateTime?
  estimatedGroupSize Int?
  deliveryMode       String?
  needs              String?
  status             RequestStatus @default(NEW)
  internalNote       String?
  submittedAt        DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  client   Client?  @relation(fields: [clientId], references: [id])
}

enum RequestStatus { NEW UNDER_REVIEW ACCEPTED DECLINED }

// ─── PROGRAM ──────────────────────────────────────────────────
model Program {
  id               String        @id @default(cuid())
  clientId         String
  name             String
  groupDescription String?
  serviceType      String?
  status           ProgramStatus @default(ACTIVE)
  discoveryNotes   Json?
  invoiceStatus    InvoiceStatus @default(NOT_INVOICED)
  invoiceDate      DateTime?
  paymentDate      DateTime?
  proposalValue    Float?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  client       Client        @relation(fields: [clientId], references: [id])
  proposals    Proposal[]
  participants Participant[]
  sessions     Session[]
}

enum ProgramStatus { ACTIVE COMPLETED ARCHIVED }
enum InvoiceStatus { NOT_INVOICED INVOICE_SENT PARTIALLY_PAID PAID_IN_FULL OVERDUE }

// ─── PROPOSAL ─────────────────────────────────────────────────
model Proposal {
  id            String         @id @default(cuid())
  programId     String
  referenceNo   String         @unique @default(cuid())
  coverMessage  String?
  internalNotes String?
  tcFileUrl     String?
  status        ProposalStatus @default(DRAFT)
  totalUsd      Float          @default(0)
  version       Int            @default(1)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  program   Program           @relation(fields: [programId], references: [id])
  lineItems ProposalLineItem[]
  versions  ProposalVersion[]
}

model ProposalLineItem {
  id         String   @id @default(cuid())
  proposalId String
  offeringId String
  duration   Float
  unitCost   Float
  quantity   Int      @default(1)
  lineTotal  Float

  proposal  Proposal  @relation(fields: [proposalId], references: [id])
  offering  Offering  @relation(fields: [offeringId], references: [id])
}

model ProposalVersion {
  id         String   @id @default(cuid())
  proposalId String
  version    Int
  snapshot   Json
  createdAt  DateTime @default(now())

  proposal   Proposal @relation(fields: [proposalId], references: [id])
}

enum ProposalStatus { DRAFT SENT UNDER_REVIEW ACCEPTED DECLINED REVISED }

// ─── PARTICIPANT ──────────────────────────────────────────────
model Participant {
  id         String   @id @default(cuid())
  programId  String
  name       String
  email      String?
  jobTitle   String?
  department String?
  tags       String[]
  notes      String?
  createdAt  DateTime @default(now())

  program  Program           @relation(fields: [programId], references: [id])
  signIns  ParticipantSignIn[]
  responses Response[]
}

// ─── CONTENT ITEM ─────────────────────────────────────────────
model ContentItem {
  id              String      @id @default(cuid())
  workspaceId     String
  title           String
  description     String?
  type            ContentType
  fileUrl         String?
  externalUrl     String?
  thumbnailUrl    String?
  audienceLevel   String?
  deliveryMode    String?
  engagementTypes String[]
  tags            String[]
  usageCount      Int         @default(0)
  isArchived      Boolean     @default(false)
  currentVersion  Int         @default(1)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  workspace    Workspace              @relation(fields: [workspaceId], references: [id])
  versions     ContentVersion[]
  collections  ContentCollectionItem[]
  packageItems SessionPackageItem[]
}

model ContentVersion {
  id            String   @id @default(cuid())
  contentItemId String
  version       Int
  fileUrl       String?
  notes         String?
  createdAt     DateTime @default(now())

  contentItem ContentItem @relation(fields: [contentItemId], references: [id])
}

model ContentCollection {
  id          String @id @default(cuid())
  workspaceId String
  name        String

  workspace   Workspace              @relation(fields: [workspaceId], references: [id])
  items       ContentCollectionItem[]
}

model ContentCollectionItem {
  contentItemId String
  collectionId  String

  contentItem ContentItem       @relation(fields: [contentItemId], references: [id])
  collection  ContentCollection @relation(fields: [collectionId], references: [id])

  @@id([contentItemId, collectionId])
}

enum ContentType {
  SLIDE_DECK FACILITATOR_GUIDE EXERCISE WORKSHEET CASE_STUDY
  VIDEO RECORDED_DEMO ASSESSMENT QUIZ POLL PROPOSAL_TEMPLATE
  SOW_TEMPLATE INTERNET_RESOURCE YOUTUBE_VIDEO OTHER
}

// ─── QUESTION ─────────────────────────────────────────────────
model Question {
  id            String           @id @default(cuid())
  workspaceId   String
  body          String
  type          QuestionType
  options       Json?
  scaleMin      Int?
  scaleMax      Int?
  topic         String?
  audienceLevel String?
  stage         AssessmentStage?
  tags          String[]
  usageCount    Int              @default(0)
  createdAt     DateTime         @default(now())

  workspace           Workspace            @relation(fields: [workspaceId], references: [id])
  assessmentQuestions AssessmentQuestion[]
}

enum QuestionType {
  MULTIPLE_CHOICE_SINGLE MULTIPLE_CHOICE_MULTI
  TRUE_FALSE RATING_SCALE OPEN_TEXT POLL
}

enum AssessmentStage {
  PRE_SESSION DURING_TRAINING END_OF_DAY POST_TRAINING
}

// ─── SESSION ──────────────────────────────────────────────────
model Session {
  id              String        @id @default(cuid())
  programId       String
  offeringId      String?
  name            String
  deliveryMode    DeliveryMode
  status          SessionStatus @default(DRAFT)
  startDate       DateTime
  endDate         DateTime
  location        String?
  virtualLink     String?
  description     String?
  internalNotes   String?
  isMultiDay      Boolean       @default(false)
  isRecurring     Boolean       @default(false)
  recurringConfig Json?
  parentSessionId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  program      Program         @relation(fields: [programId], references: [id])
  offering     Offering?       @relation(fields: [offeringId], references: [id])
  days         SessionDay[]
  milestones   Milestone[]
  package      SessionPackage?
  accessCodes  AccessCode[]
  signIns      ParticipantSignIn[]
  assessments  Assessment[]
  attachments  Attachment[]
  activityLogs ActivityLog[]
}

enum SessionStatus { DRAFT SCHEDULED ACTIVE COMPLETED ARCHIVED }
enum DeliveryMode  { ONLINE OFFLINE HYBRID }

model SessionDay {
  id        String   @id @default(cuid())
  sessionId String
  dayNumber Int
  label     String?
  date      DateTime
  startTime String?
  endTime   String?

  session Session @relation(fields: [sessionId], references: [id])
}

// ─── MILESTONE ────────────────────────────────────────────────
model Milestone {
  id           String          @id @default(cuid())
  sessionId    String
  name         String
  dueDate      DateTime
  description  String?
  status       MilestoneStatus @default(PENDING)
  linkedDocUrl String?
  completedAt  DateTime?

  session Session @relation(fields: [sessionId], references: [id])
}

enum MilestoneStatus { PENDING COMPLETE OVERDUE }

// ─── SESSION PACKAGE ──────────────────────────────────────────
model SessionPackage {
  id         String   @id @default(cuid())
  sessionId  String   @unique
  name       String?
  isTemplate Boolean  @default(false)
  createdAt  DateTime @default(now())

  session Session              @relation(fields: [sessionId], references: [id])
  items   SessionPackageItem[]
}

model SessionPackageItem {
  id              String @id @default(cuid())
  packageId       String
  contentItemId   String
  order           Int
  consultantNotes String?

  package     SessionPackage @relation(fields: [packageId], references: [id])
  contentItem ContentItem    @relation(fields: [contentItemId], references: [id])
}

// ─── ACCESS CODE ──────────────────────────────────────────────
model AccessCode {
  id         String   @id @default(cuid())
  sessionId  String
  code       String   @unique
  validFrom  DateTime
  validUntil DateTime
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())

  session Session             @relation(fields: [sessionId], references: [id])
  signIns ParticipantSignIn[]
}

model ParticipantSignIn {
  id            String   @id @default(cuid())
  accessCodeId  String
  sessionId     String
  participantId String?
  name          String
  email         String?
  jobTitle      String?
  department    String?
  signedInAt    DateTime @default(now())

  accessCode  AccessCode   @relation(fields: [accessCodeId], references: [id])
  session     Session      @relation(fields: [sessionId], references: [id])
  participant Participant? @relation(fields: [participantId], references: [id])
  responses   Response[]
}

// ─── ASSESSMENT ───────────────────────────────────────────────
model Assessment {
  id          String          @id @default(cuid())
  sessionId   String
  title       String
  stage       AssessmentStage
  isAnonymous Boolean         @default(false)
  shareLink   String?         @unique
  isActive    Boolean         @default(false)
  createdAt   DateTime        @default(now())

  session   Session              @relation(fields: [sessionId], references: [id])
  questions AssessmentQuestion[]
  responses Response[]
}

model AssessmentQuestion {
  id           String @id @default(cuid())
  assessmentId String
  questionId   String
  order        Int

  assessment Assessment @relation(fields: [assessmentId], references: [id])
  question   Question   @relation(fields: [questionId], references: [id])
}

model Response {
  id            String   @id @default(cuid())
  assessmentId  String
  questionId    String
  signInId      String?
  participantId String?
  value         Json
  submittedAt   DateTime @default(now())

  assessment  Assessment        @relation(fields: [assessmentId], references: [id])
  signIn      ParticipantSignIn? @relation(fields: [signInId], references: [id])
  participant Participant?      @relation(fields: [participantId], references: [id])
}

// ─── ATTACHMENT ───────────────────────────────────────────────
model Attachment {
  id         String         @id @default(cuid())
  sessionId  String
  name       String
  url        String
  type       AttachmentType
  category   String?
  isExternal Boolean        @default(false)
  uploadedAt DateTime       @default(now())

  session Session @relation(fields: [sessionId], references: [id])
}

enum AttachmentType { FILE LINK LIBRARY_ITEM }

// ─── ACTIVITY LOG ─────────────────────────────────────────────
model ActivityLog {
  id          String   @id @default(cuid())
  workspaceId String
  sessionId   String?
  programId   String?
  clientId    String?
  actor       String
  action      String
  metadata    Json?
  createdAt   DateTime @default(now())

  session Session? @relation(fields: [sessionId], references: [id])
}

// ─── NOTIFICATION ─────────────────────────────────────────────
model Notification {
  id          String           @id @default(cuid())
  workspaceId String
  type        NotificationType
  title       String
  body        String
  linkedId    String?
  linkedType  String?
  isRead      Boolean          @default(false)
  sentAt      DateTime         @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])
}

enum NotificationType {
  UPCOMING_SESSION OVERDUE_MILESTONE STATUS_REMINDER
  NEW_REQUEST PROPOSAL_ACCEPTED CUSTOM_REMINDER
}

// ─── EMAIL TEMPLATE ───────────────────────────────────────────
model EmailTemplate {
  id          String   @id @default(cuid())
  workspaceId String
  slug        String
  subject     String
  bodyHtml    String
  updatedAt   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([workspaceId, slug])
}
```

---

## 4. API Routes

All routes under `/api/*` require consultant authentication except those marked `[PUBLIC]`.

```
/api

  # ── WORKSPACE ─────────────────────────────────────────────
  GET    /workspace                     # get workspace config + branding
  PATCH  /workspace                     # update branding, settings
  POST   /workspace/verify-email        # trigger sender email domain verification

  # ── AUTH ──────────────────────────────────────────────────
  POST   /auth/login
  POST   /auth/logout
  GET    /auth/me

  # ── CLIENTS ───────────────────────────────────────────────
  GET    /clients                       # list (search, filter)
  POST   /clients                       # create
  GET    /clients/:id                   # detail + programs list
  PATCH  /clients/:id                   # update
  POST   /clients/:id/archive           # archive
  POST   /clients/:id/restore           # restore from archive

  # ── REQUESTS ──────────────────────────────────────────────
  POST   /requests/submit    [PUBLIC]   # client submits registration form
  GET    /requests                      # list inbox (filter by status)
  GET    /requests/:id                  # detail
  PATCH  /requests/:id/status          # update status → triggers email
  POST   /requests/:id/accept          # accept → create client + program

  # ── OFFERINGS ─────────────────────────────────────────────
  GET    /offerings                     # list active offerings
  POST   /offerings                     # create
  PATCH  /offerings/:id                 # update
  POST   /offerings/:id/archive         # archive

  # ── PROGRAMS ──────────────────────────────────────────────
  GET    /programs                      # list (filter by client, status)
  POST   /programs                      # create
  GET    /programs/:id                  # detail + sessions + timeline
  PATCH  /programs/:id                  # update
  PATCH  /programs/:id/invoice          # update invoice status + dates

  # ── PROPOSALS ─────────────────────────────────────────────
  GET    /proposals                     # list
  POST   /proposals                     # create (linked to program)
  GET    /proposals/:id                 # detail + line items
  PATCH  /proposals/:id                 # update
  PATCH  /proposals/:id/status          # status transition → snapshot saved on Draft→Sent
  POST   /proposals/:id/duplicate       # duplicate to new draft
  GET    /proposals/:id/versions        # list version snapshots
  GET    /proposals/:id/pdf             # generate + stream PDF
  POST   /proposals/accept   [PUBLIC]   # client accepts proposal (no auth)

  # ── PARTICIPANTS ──────────────────────────────────────────
  GET    /programs/:id/participants     # list
  POST   /programs/:id/participants     # add single participant
  POST   /programs/:id/participants/import  # CSV import
  PATCH  /participants/:id              # update tags/details
  DELETE /participants/:id              # remove

  # ── CONTENT LIBRARY ───────────────────────────────────────
  GET    /content                       # list (search, filter by type/tag/mode)
  POST   /content                       # create item (upload or link)
  GET    /content/:id                   # detail + versions
  PATCH  /content/:id                   # update metadata
  POST   /content/:id/version           # upload new version
  GET    /content/:id/versions          # list versions
  POST   /content/:id/restore/:version  # restore prior version
  POST   /content/:id/archive           # archive

  GET    /collections                   # list collections
  POST   /collections                   # create collection
  POST   /collections/:id/items         # add content item
  DELETE /collections/:id/items/:itemId # remove content item

  # ── QUESTION BANK ─────────────────────────────────────────
  GET    /questions                     # list (search, filter)
  POST   /questions                     # create question
  PATCH  /questions/:id                 # update question
  DELETE /questions/:id                 # delete question

  # ── FILE UPLOAD ───────────────────────────────────────────
  POST   /upload/presign                # get S3 presigned URL for direct upload
  POST   /upload/confirm                # confirm upload complete → create ContentItem

  # ── SESSIONS ──────────────────────────────────────────────
  GET    /sessions                      # list (filter, search, saved views)
  POST   /sessions                      # create
  GET    /sessions/:id                  # detail
  PATCH  /sessions/:id                  # update (restricted by lifecycle status)
  PATCH  /sessions/:id/status           # transition status (validates pre-flight rules)
  GET    /sessions/:id/preflight        # get pre-flight checklist status
  POST   /sessions/:id/duplicate        # duplicate session
  POST   /sessions/recurring            # create recurring session series

  # Session Days
  GET    /sessions/:id/days             # list days
  POST   /sessions/:id/days             # add day
  PATCH  /sessions/:id/days/:dayId      # update day

  # Milestones
  GET    /sessions/:id/milestones       # list milestones
  POST   /sessions/:id/milestones       # create milestone
  PATCH  /sessions/:id/milestones/:mid  # update (mark complete, edit)
  DELETE /sessions/:id/milestones/:mid  # delete

  # Session Package
  GET    /sessions/:id/package          # get package + items
  POST   /sessions/:id/package          # create package
  POST   /sessions/:id/package/items    # add content item
  PATCH  /sessions/:id/package/items/:itemId  # reorder / update notes
  DELETE /sessions/:id/package/items/:itemId  # remove

  # Access Codes
  GET    /sessions/:id/access-codes     # list codes
  POST   /sessions/:id/access-codes     # generate new code
  PATCH  /sessions/:id/access-codes/:codeId   # update validity window
  DELETE /sessions/:id/access-codes/:codeId   # deactivate code

  # Assessments
  GET    /sessions/:id/assessments      # list assessments
  POST   /sessions/:id/assessments      # create assessment
  GET    /sessions/:id/assessments/:aid # detail + questions
  PATCH  /sessions/:id/assessments/:aid # update
  POST   /sessions/:id/assessments/:aid/activate   # go live
  POST   /sessions/:id/assessments/:aid/deactivate # close
  GET    /sessions/:id/assessments/:aid/results     # aggregated results

  # Attachments
  GET    /sessions/:id/attachments      # list
  POST   /sessions/:id/attachments      # add file or link
  DELETE /sessions/:id/attachments/:aid # remove

  # Activity Log
  GET    /sessions/:id/activity         # list log entries
  POST   /sessions/:id/activity/notes   # add consultant note
  GET    /sessions/:id/activity/export  # export as PDF or CSV

  # ── PARTICIPANT SESSION ACCESS ────────────────────────────
  POST   /join               [PUBLIC]   # sign in with name + code → return session JWT
  GET    /join/session/:code [PUBLIC]   # get session context (active assessments, polls)
  POST   /join/respond       [PUBLIC]   # submit assessment or feedback response
  GET    /join/assessment/:link [PUBLIC] # get pre-session assessment by share link

  # ── DASHBOARD ─────────────────────────────────────────────
  GET    /dashboard/summary             # all widget data in one call
  GET    /dashboard/activity            # recent activity feed (filterable)
  GET    /dashboard/pipeline            # funnel data
  GET    /dashboard/revenue             # revenue summary + outstanding invoices

  # ── REPORTS ───────────────────────────────────────────────
  GET    /reports/sessions              # session volume + completion report
  GET    /reports/assessments/:sessionId  # learning analytics for a session
  GET    /reports/content               # content usage report
  GET    /reports/revenue               # revenue by client, offering, quarter
  GET    /reports/summary/:sessionId    # post-training summary data
  POST   /reports/summary/:sessionId/pdf  # queue PDF generation job
  GET    /reports/summary/:sessionId/pdf/:jobId  # poll job + return download URL

  # ── NOTIFICATIONS ─────────────────────────────────────────
  GET    /notifications                 # list (unread first)
  PATCH  /notifications/:id/read        # mark read
  PATCH  /notifications/read-all        # mark all read
  GET    /notifications/preferences     # get preferences
  PATCH  /notifications/preferences     # update preferences
```

---

## 5. Frontend Structure

```
/app
  ├── (public)                          # White-labeled, workspace-scoped by subdomain
  │   ├── [slug]/register/page.tsx      # Client registration form
  │   ├── [slug]/join/page.tsx          # Participant session sign-up
  │   ├── [slug]/assessment/[link]/page.tsx  # Pre-session assessment
  │   ├── [slug]/quiz/[sessionId]/page.tsx   # Live quiz (participant view)
  │   ├── [slug]/poll/[sessionId]/page.tsx   # Live poll (participant view)
  │   ├── [slug]/feedback/[sessionId]/page.tsx  # Feedback form
  │   └── [slug]/proposal/[id]/page.tsx  # Proposal view + optional Accept button
  │
  ├── (auth)
  │   └── login/page.tsx
  │
  └── (dashboard)                       # Protected — consultant workspace
      ├── layout.tsx                    # Sidebar nav, workspace context
      ├── page.tsx                      # Main dashboard
      │
      ├── clients/
      │   ├── page.tsx                  # Client list (search, filter)
      │   └── [id]/page.tsx             # Client profile + programs
      │
      ├── requests/
      │   └── page.tsx                  # Request inbox
      │
      ├── offerings/
      │   └── page.tsx                  # Offerings catalogue management
      │
      ├── proposals/
      │   └── [id]/page.tsx             # Proposal builder
      │
      ├── pipeline/
      │   └── page.tsx                  # Kanban board + list toggle
      │
      ├── content/
      │   ├── page.tsx                  # Content Library index (grid + list)
      │   ├── [id]/page.tsx             # Content item detail + versions
      │   └── questions/page.tsx        # Question bank
      │
      ├── sessions/
      │   ├── page.tsx                  # Sessions index (list + calendar toggle)
      │   ├── [id]/page.tsx             # Session record detail
      │   ├── [id]/package/page.tsx     # Session package builder
      │   └── [id]/assessments/
      │       └── [asmId]/page.tsx      # Assessment builder + live results
      │
      ├── reports/
      │   ├── page.tsx                  # Reports index
      │   └── [sessionId]/summary/page.tsx  # Post-training summary builder
      │
      └── settings/
          ├── workspace/page.tsx        # Branding, subdomain, email config
          └── notifications/page.tsx   # Notification preferences
```

---

## 6. Key Technical Patterns

### Subdomain → Workspace Resolution
```typescript
// middleware.ts (Vercel Edge)
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const slug = host.replace(`.${process.env.NEXT_PUBLIC_APP_DOMAIN}`, '')
  const url = req.nextUrl.clone()
  url.searchParams.set('workspace_slug', slug)
  return NextResponse.rewrite(url)
}

// In server components / API routes:
const slug = searchParams.get('workspace_slug')
const workspace = await prisma.workspace.findUnique({ where: { slug } })
```

### White-Label Layout Injection
```typescript
// All public pages wrap with WorkspaceBrandingProvider
// Branding resolved server-side from workspace slug

export default async function PublicLayout({ children, params }) {
  const workspace = await getWorkspaceBySlug(params.slug)
  return (
    <html style={{ '--primary': workspace.primaryColor }}>
      <body>
        <header>
          <img src={workspace.logoUrl} alt={workspace.businessName} />
        </header>
        {children}
        <footer>
          <span>{workspace.businessName}</span>
          <a href="https://synaptic.app">Powered by Synaptic</a>
        </footer>
      </body>
    </html>
  )
}
```

### Participant Code Validation + JWT
```typescript
// POST /api/join
async function joinSession(code: string, name: string) {
  const accessCode = await prisma.accessCode.findUnique({
    where: { code, isActive: true }
  })
  if (!accessCode) throw new Error('Invalid code')
  const now = new Date()
  if (now < accessCode.validFrom || now > accessCode.validUntil) {
    throw new Error(now < accessCode.validFrom ? 'Session not yet open' : 'Session has ended')
  }
  const signIn = await prisma.participantSignIn.create({
    data: { accessCodeId: accessCode.id, sessionId: accessCode.sessionId, name, ... }
  })
  // Issue short-lived JWT scoped to this session
  const token = sign({ signInId: signIn.id, sessionId: signIn.sessionId }, JWT_SECRET, { expiresIn: '12h' })
  return { token, sessionId: signIn.sessionId }
}
```

### Real-Time Quiz Results (Supabase Realtime)
```typescript
// Consultant view — subscribe to new responses
const channel = supabase
  .channel(`assessment:${assessmentId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'Response',
    filter: `assessmentId=eq.${assessmentId}`
  }, (payload) => updateResultsChart(payload.new))
  .subscribe()

// Participant view — POST response, consultant chart auto-updates
await fetch('/api/join/respond', {
  method: 'POST',
  body: JSON.stringify({ assessmentId, questionId, value }),
  headers: { Authorization: `Bearer ${participantToken}` }
})
```

### PDF Generation (BullMQ + Puppeteer)
```typescript
// 1. Enqueue job
const job = await pdfQueue.add('post-training-summary', {
  sessionId, workspaceId, customization
})
return { jobId: job.id }

// 2. Worker renders HTML with injected branding
const worker = new Worker('pdf', async (job) => {
  const data = await assembleReportData(job.data.sessionId)
  const html = renderToStaticMarkup(<PostTrainingSummary data={data} workspace={workspace} />)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  const url = await uploadToS3(pdf, `reports/${job.data.sessionId}.pdf`)
  return { url }
})

// 3. Poll job status
// GET /api/reports/summary/:sessionId/pdf/:jobId
const job = await pdfQueue.getJob(jobId)
return { status: await job.getState(), url: job.returnvalue?.url }
```

### Workspace-Scoped Prisma Middleware
```typescript
// Automatically inject workspaceId on all queries
prisma.$use(async (params, next) => {
  const workspacedModels = ['Client', 'Offering', 'ContentItem', 'Question', ...]
  if (workspacedModels.includes(params.model)) {
    if (params.action === 'create') {
      params.args.data.workspaceId = currentWorkspaceId()
    }
    if (['findMany', 'findFirst', 'count'].includes(params.action)) {
      params.args.where = { ...params.args.where, workspaceId: currentWorkspaceId() }
    }
  }
  return next(params)
})
```

---

## 7. Security

| Area | Approach |
|---|---|
| **Workspace isolation** | Prisma middleware injects `workspaceId` filter on all reads/writes |
| **API authentication** | NextAuth session cookie on all `/api/*` except `/public` and `/join` routes |
| **Participant JWT** | Short TTL (12h max), scoped to `signInId` + `sessionId`, no consultant data access |
| **File access** | S3 objects private by default; served via presigned URLs with 1-hour expiry |
| **Input validation** | Zod schemas on all API route inputs — invalid payloads rejected with 400 |
| **PII at rest** | Participant name/email fields encrypted using `@prisma/client` field-level encryption |
| **HTTPS enforcement** | All routes redirect HTTP → HTTPS; HSTS header set |
| **CSRF** | NextAuth built-in CSRF token validation on all mutation routes |

---

## 8. Environment Variables

```env
# ── Database
DATABASE_URL=postgresql://...

# ── Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://app.synaptic.app

# ── AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=synaptic-assets
AWS_REGION=us-east-1

# ── Email (Resend)
RESEND_API_KEY=
EMAIL_FROM_DEFAULT=noreply@synaptic.app

# ── Supabase (DB + Realtime)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Background Jobs (Redis via Upstash)
REDIS_URL=

# ── JWT (Participant tokens)
PARTICIPANT_JWT_SECRET=

# ── App
NEXT_PUBLIC_APP_DOMAIN=synaptic.app
NEXT_PUBLIC_APP_URL=https://app.synaptic.app
```

---

## 9. P0 Sprint Plan (Months 1–3)

| Sprint | Focus | Key Deliverables |
|---|---|---|
| **S1** | Workspace foundation | DB setup, Prisma schema, auth, subdomain routing, branding config, white-label layout |
| **S2** | Client intake | Registration form (public), request inbox, status workflow, automated emails |
| **S3** | Client profiles & offerings | Profile creation (manual + from request), offerings catalogue, default offerings seeded |
| **S4** | Content Library — assets | Upload (S3 presigned), external linking, tagging, collections, search/filter |
| **S5** | Content Library — questions | Question bank CRUD, all question types, tagging, usage count |
| **S6** | Session core | Session creation, lifecycle (Draft→Archived), pre-flight checklist, status transitions |
| **S7** | Access codes | Code generation, validity window, participant sign-up page, real-time roster |
| **S8** | Dashboard P0 | All 7 dashboard widgets, activity feed, real-time data binding |

## 10. P1 Sprint Plan (Months 4–6)

| Sprint | Focus | Key Deliverables |
|---|---|---|
| **S9** | Proposal builder | Line items, cost override, T&C attachment, PDF export (white-labeled) |
| **S10** | Pipeline & revenue | Kanban board, invoice status, proposal accept flow, revenue tracking |
| **S11** | Participant management | Manual add, CSV import, tagging, participant-assessment linking |
| **S12** | Live assessments | Quiz delivery (real-time, consultant-paced), poll delivery, anonymous mode |
| **S13** | Feedback & pre-session | Pre-session assessment (share link), end-of-day feedback, post-training evaluation |
| **S14** | Session packages | Package builder (drag-and-drop), context filtering, consultant notes, templates |
| **S15** | Milestones & calendar | Milestone CRUD, overdue detection, calendar view (month/week/day), ICS export |
| **S16** | Notifications & recurring | Email + in-app notifications, notification preferences, recurring session setup |
| **S17** | Reporting suite | Pipeline report, session report, assessment dashboard, revenue report, CSV export |
| **S18** | Hardening & QA | Performance tuning, accessibility audit, end-to-end test coverage, P0 exit validation |
