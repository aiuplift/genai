# Synaptic — Requirements Specification
> Version 1.0 | June 11, 2026 | P0 + P1 Scope

---

## Overview

Synaptic is a white-labeled, multi-tenant SaaS platform for AI consultants and training professionals. It consolidates client intake, proposal management, content delivery, session management, and post-training reporting into a single workspace — all presented under the consultant's own brand identity.

**Primary User:** AI Consultant (Workspace Admin/Owner)
**External Actors:**
- Clients — no login required; interact via white-labeled public forms
- Participants — no login required; code-based session access only

**Platform:** Web (desktop-first); mobile-responsive for all client/participant-facing pages

---

## 1. Workspace & Branding

- **REQ-WS-01:** The consultant shall configure a workspace with: business name, logo (PNG/SVG), primary brand color (hex), secondary brand color (hex), and optional tagline.
- **REQ-WS-02:** Each workspace shall be assigned a unique subdomain: `{slug}.synaptic.app`. The slug shall be set on workspace creation and changeable once.
- **REQ-WS-03:** The consultant shall configure a sender email address (domain verification required) and sender display name for all outgoing platform emails.
- **REQ-WS-04:** Branding configuration shall apply automatically to all client-facing and participant-facing surfaces: registration form, participant sign-up page, assessment pages, feedback forms, email notifications, proposal PDF, and post-training summary PDF.
- **REQ-WS-05:** All client-facing and participant-facing pages shall display a "Powered by Synaptic" attribution in the page footer. The footer link shall point to the Synaptic marketing site.
- **REQ-WS-06:** A live branding preview shall show how logo and colors render across all surfaces before the consultant saves changes.

**Acceptance Criteria:**
- [ ] Workspace renders correctly with custom logo, colors, and name on all 7 client-facing surfaces
- [ ] Subdomain resolves and routes correctly to the correct workspace
- [ ] "Powered by Synaptic" footer is visible on all client/participant-facing pages
- [ ] Branding preview updates in real time as the consultant edits settings

---

## 2. Client Registration & Intake

### 2.1 Registration Form
- **REQ-REG-01:** A public registration form shall be accessible at `{slug}.synaptic.app/register` with no login required.
- **REQ-REG-02:** The form shall collect:
  - Full Name (required)
  - Organization Name (required)
  - Job Title (optional)
  - Email Address (required)
  - Phone (optional)
  - Country/Region (required — dropdown)
  - Organization Size (required — dropdown: 1–10, 11–50, 51–200, 201–1000, 1000+)
  - Industry (required — dropdown)
  - Service of Interest (required — multi-select from active offerings)
  - Preferred Start Date (optional — date picker)
  - Estimated Group Size (optional — number)
  - Delivery Mode Preference (optional — Online / In-Person / Either)
  - Tell us about your needs (optional — free text)
- **REQ-REG-03:** On submission, the consultant shall receive an in-app notification and email alert with: org name, service of interest, and submission timestamp.
- **REQ-REG-04:** The client shall receive a branded confirmation message on screen after submission.

### 2.2 Request Inbox
- **REQ-REQ-01:** All submitted requests shall appear in a consultant-facing inbox, sortable by date, with columns: Org Name, Contact Name, Service Requested, Submission Date, Status.
- **REQ-REQ-02:** Request status workflow: `New → Under Review → Accepted → Declined`. Each transition is timestamped and logged.
- **REQ-REQ-03:** On `Accepted` or `Declined` status change, an automated email shall be sent to the client from the consultant's configured sender address.
- **REQ-REQ-04:** On acceptance, the system shall prompt the consultant to confirm or edit a pre-populated client profile drawn from the request form data. On confirmation, a Client Profile and Program record shall be created automatically.
- **REQ-REQ-05:** Declined requests shall be retained indefinitely and never deleted. They remain visible in the inbox with their status and internal notes.

**Acceptance Criteria:**
- [ ] Form submissions appear in inbox within 5 seconds of submission
- [ ] Status transitions trigger correct automated emails from configured sender
- [ ] Client profile fields are auto-populated from accepted request with correct field mapping
- [ ] Declined requests remain visible with status badge and internal notes

---

## 3. Client Profile Management

- **REQ-CLI-01:** Client profiles shall store: Organization Name, Industry, Organization Size, Country/Region, Primary Contact Name, Email, Phone, Secondary Contact (optional), and internal notes.
- **REQ-CLI-02:** Each client profile shall display a chronological list of all linked programs with status, service type, and dates.
- **REQ-CLI-03:** Multiple concurrent programs shall be supported per client profile, each with its own name, group description, schedule, content package, and status.
- **REQ-CLI-04:** Client profiles shall be searchable and filterable by org name, contact name, industry, and engagement status. Search results shall update in real time.
- **REQ-CLI-05:** Archiving a client shall hide them from the active list while preserving all records and engagement history. Archived clients shall be restorable.

**Acceptance Criteria:**
- [ ] Multiple active programs visible and independently manageable under one client profile
- [ ] Real-time search across org name, contact name, and industry
- [ ] Archived client records fully accessible via an "Archived" filter and restorable

---

## 4. Offerings Catalogue

- **REQ-OFF-01:** The consultant shall create, edit, and archive service offerings. Each offering shall include: Name, Description, Default Duration (hours/days), Default Unit Cost (USD), Status (Active/Archived).
- **REQ-OFF-02:** Active offerings shall appear in: the client registration form (Service of Interest), the proposal builder (line item selection), and session type classification.
- **REQ-OFF-03:** Archived offerings shall be hidden from active selection but remain visible on any proposal where they were previously used.
- **REQ-OFF-04:** The following default offerings shall be pre-loaded on workspace setup: AI Training, Consultancy, Digital Transformation, Concept Papers, Workforce Planning.

**Acceptance Criteria:**
- [ ] New offering appears immediately in registration form, proposal builder, and session type picker
- [ ] Archived offering disappears from active pick-lists
- [ ] Proposals retain archived offering data with no data loss

---

## 5. Proposal Management

- **REQ-PRO-01:** Proposals shall be created from a program record. Each proposal shall receive a unique auto-generated reference number.
- **REQ-PRO-02:** The consultant shall select one or more active offerings from the catalogue. Each line item shall show: Name, Description, Default Duration, Default Unit Cost — all overridable per proposal without modifying the master offering.
- **REQ-PRO-03:** The proposal shall calculate and display a line total per offering and a grand total. All values in USD (V1).
- **REQ-PRO-04:** The consultant shall attach a T&C document (PDF or DOCX) directly as proposal metadata. Previously uploaded T&C files shall be selectable for reuse via a dropdown.
- **REQ-PRO-05:** Each proposal shall include a rich-text cover message (client-facing, included in PDF export) and an internal notes field (excluded from export).
- **REQ-PRO-06:** Proposal status workflow: `Draft → Sent → Under Review → Accepted → Declined → Revised`. Each transition is timestamped and logged.
- **REQ-PRO-07:** An optional "Accept Proposal" button shall be available via the proposal shareable link. Client acceptance shall update the proposal status to Accepted and notify the consultant in-app and via email.
- **REQ-PRO-08:** The proposal PDF export shall include: consultant logo and brand colors, client name, program reference number, offering line items with duration and USD cost, grand total, cover message, and attached T&C document. Synaptic branding shall not appear on the PDF.
- **REQ-PRO-09:** Proposals shall be duplicable. The duplicate is created in Draft status and must be assigned to a program by the consultant. One proposal per program — no multi-program sending.
- **REQ-PRO-10:** A snapshot of the proposal shall be saved each time it transitions from Draft to Sent or is manually versioned. The consultant shall view and compare prior versions.

**Acceptance Criteria:**
- [ ] Proposal PDF renders with consultant branding and zero Synaptic branding
- [ ] Line totals and grand total recalculate correctly on cost or duration override
- [ ] Version history accessible with snapshot comparison from the proposal record
- [ ] Optional Accept button triggers status update and in-app + email notification to consultant

---

## 6. Pipeline & Revenue Tracking

- **REQ-PIP-01:** A Kanban board shall display all engagements across 8 stages: New Request → Under Review → Accepted → Proposal Sent → Proposal Accepted → Active → Completed → Archived.
- **REQ-PIP-02:** Kanban cards shall show: Client Name, Program Name, Service Type, key date. Revenue figures shall be hidden by default with a consultant toggle to show/hide.
- **REQ-PIP-03:** Quick actions available on card hover: Change Status, Add Note, Set Reminder, Open Full Record.
- **REQ-PIP-04:** Pipeline board shall be filterable by Service Type, Status, and Date Range, with free-text search by client or program name.
- **REQ-PIP-05:** Invoice status per program shall follow: `Not Invoiced → Invoice Sent → Partially Paid → Paid in Full → Overdue`. Manually updated by the consultant. Invoice date and payment date fields available.
- **REQ-PIP-06:** Each client profile shall display: Total Proposal Value (all time, USD), Total Paid (all time, USD), Active Proposal Value (in-flight engagements, USD).

**Acceptance Criteria:**
- [ ] Cards move between columns in real time on status update
- [ ] Revenue figures hidden by default; shown on toggle without page reload
- [ ] Invoice status persists and is visible on both the program record and the pipeline card

---

## 7. Communication & Engagement Log

- **REQ-COM-01:** All notes, emails, meetings, and status changes per client and program shall be logged chronologically, filterable by type: Note, Meeting, Email, Status Change.
- **REQ-COM-02:** A structured Discovery Notes section shall be available per program with fields: Client Goals, Pain Points, Audience Background, Preferred Delivery Style, Special Requests, Additional Notes (free text).
- **REQ-COM-03:** Pre-built email templates shall be available for: Request Received, Request Accepted, Request Declined, Proposal Sent, Pre-Training Reminder, Post-Training Thank You. Templates shall support variable substitution: `{{Client Name}}`, `{{Program Name}}`, `{{Start Date}}`. Templates shall be editable by the consultant.
- **REQ-COM-04:** The consultant shall set follow-up reminders (date, time, note) on any client profile, request, or proposal. Reminders shall trigger in-app notifications and optional email alerts.
- **REQ-COM-05:** A configurable pre-engagement onboarding checklist shall be available per program. Separate default templates shall exist for Training and Consultancy engagement types. Default items: Proposal Accepted, T&Cs Confirmed, Participant List Received, Pre-Session Assessment Sent, Content Package Finalized, Logistics Confirmed.

---

## 8. Participant Management

- **REQ-PAR-01:** Participants shall be addable to a program manually (name, email, job title, optional notes) or imported via CSV with columns: First Name, Last Name, Email, Job Title, Department. CSV import shall preview the data and flag errors before confirming.
- **REQ-PAR-02:** Participants shall be taggable with free-form, multi-select tags (e.g., Executive, Technical, Non-Technical, HR, Engineering).
- **REQ-PAR-03:** Assessment responses shall be linkable to individual participants only when the participant voluntarily provides their name or email on the session sign-up page. This field shall be clearly marked optional.
- **REQ-PAR-04:** The program record shall display: Confirmed Participants count, Expected Participants count (from proposal), and a variance indicator when they differ.
- **REQ-PAR-05:** The session access code shall be visible and manageable directly from the program record, surfacing the active code, validity window, and participant sign-up URL.

---

## 9. Content Library

### 9.1 Asset Management
- **REQ-CON-01:** The consultant shall upload files (PPTX, PDF, DOCX, XLSX, MP4, PNG, JPG) with a maximum of 50MB per file. Upload progress shall be displayed. Files exceeding 50MB shall display an inline error with a suggestion to link via external URL instead.
- **REQ-CON-02:** External resources (YouTube URLs, web links) shall be saveable as content items with a title, description, and auto-generated thumbnail for YouTube links.
- **REQ-CON-03:** Each content item shall be tagged with: Content Type, Engagement Type, Audience Level (Executive / Technical / General), Delivery Mode (Online / Offline / Both), and free-form custom tags. Tagging is mandatory on creation.
- **REQ-CON-04:** Content items shall be organizable into named collections. A single item may belong to multiple collections simultaneously.
- **REQ-CON-05:** The Content Library shall support real-time search and filtering by: title (keyword), Content Type, Engagement Type, Audience Level, Delivery Mode, and custom tags.
- **REQ-CON-06:** Each content item update shall create a new version. The consultant shall view version history and restore any prior version.
- **REQ-CON-07:** Content items shall display inline previews: PDF/image renders inline, PPTX shows first-slide thumbnail, video shows embedded player or thumbnail, links show a preview card.
- **REQ-CON-08:** Each content item shall display a usage count reflecting the number of session packages it has been added to.

### 9.2 Question Bank
- **REQ-QBK-01:** Questions shall be creatable with the following types: Multiple Choice (single answer), Multiple Choice (multi-select), True/False, Rating Scale (1–5 or 1–10), Open Text, Poll (unscored).
- **REQ-QBK-02:** Questions shall be taggable by Topic, Audience Level, and Assessment Stage (Pre-Session / During Training / End-of-Day / Post-Training).
- **REQ-QBK-03:** The question bank shall support real-time search and filtering by topic, audience level, and assessment stage.
- **REQ-QBK-04:** Each question shall display a usage count reflecting the number of assessments it has been used in.

### 9.3 Session Package Builder
- **REQ-PKG-01:** The consultant shall create a Session Package linked to a session by selecting and ordering content items from the library via drag-and-drop.
- **REQ-PKG-02:** When building a package, the consultant shall set session context (Delivery Mode, Estimated Duration, Audience Level). The library shall auto-filter to show matching content based on these tags.
- **REQ-PKG-03:** The consultant shall add private delivery notes to any content item within the package. Notes are session-specific and do not modify the master content item.
- **REQ-PKG-04:** A completed session package shall be saveable as a named reusable template, available as a starting point when building future packages.

---

## 10. Participant Session Access

- **REQ-ACC-01:** The consultant shall generate a unique alphanumeric access code per session with a single action. Regenerating the code shall immediately invalidate the previous code.
- **REQ-ACC-02:** The access code shall have a configurable validity window (start date/time and end date/time). Outside this window, participants shall receive a descriptive "expired" or "not yet active" error message.
- **REQ-ACC-03:** A public participant sign-up page at `{slug}.synaptic.app/join` shall accept: Participant Name (required), Session Code (required), Job Title (optional), Department (optional), Email (optional). The page shall be white-labeled, mobile-responsive, and display a clear "Powered by Synaptic" footer.
- **REQ-ACC-04:** On valid code entry, the participant shall be granted access to all active session content, assessments, and polls for the duration of the validity window. A single sign-in shall persist across all activities — no re-entry of name or code required per activity.
- **REQ-ACC-05:** The consultant shall see a real-time participant roster showing: Name, Sign-In Time, Job Title/Department (if provided). The roster shall update within 2 seconds of a participant signing in.
- **REQ-ACC-06:** Per assessment or activity, the consultant shall configure: Identified mode (responses linked to participant name) or Anonymous mode (aggregate only, no names stored). Participants shall be informed of the mode before submitting responses.
- **REQ-ACC-07:** Multi-day sessions shall support either a single code valid for the full program duration, or a new code per day — configurable by the consultant per session.

**Acceptance Criteria:**
- [ ] Invalid or expired codes return a descriptive error message with no system details exposed
- [ ] Roster updates within 2 seconds of participant sign-in
- [ ] Single sign-in session persists across quiz, poll, and feedback within the validity window
- [ ] Anonymous mode returns aggregate results with no participant names or identifiers in any view

---

## 11. Assessment & Feedback Delivery

- **REQ-ASM-01:** The consultant shall build a session assessment by selecting and ordering questions from the question bank. The session assessment is saved independently — changes to a session assessment do not affect the master question bank.
- **REQ-ASM-02:** Pre-session assessments shall be shareable via a unique link (no login required for participants). Responses shall display as aggregate summaries (charts, response counts) and as individual response views — both visible to the consultant only.
- **REQ-ASM-03:** Live quizzes shall be consultant-controlled: the consultant advances questions manually. Results shall display in real time (bar chart per question) within 2 seconds of participant submission.
- **REQ-ASM-04:** Live polls shall be unscored. Results shall display as a live bar chart (closed questions) or word cloud (open text). Polls are separate from scored quizzes.
- **REQ-ASM-05:** End-of-day feedback forms shall include configurable questions (rating scale + open text). Shared via the participant's active session link. Results shall display as a daily summary in the session record.
- **REQ-ASM-06:** A post-training evaluation form shall be deployable independently at program close. Results stored in the session record, viewable by the consultant, and exportable as PDF or CSV.
- **REQ-ASM-07:** An assessment results dashboard shall be available per session displaying: response rates per activity, score distributions, question-level breakdowns, open text responses, and day-by-day trend lines for multi-day programs.

**Acceptance Criteria:**
- [ ] Live quiz results update within 2 seconds of participant submission
- [ ] Anonymous mode excludes all participant identifiers from every results view and export
- [ ] Assessment results dashboard loads within 3 seconds
- [ ] End-of-day feedback visible as a day-by-day trend chart for multi-day sessions

---

## 12. Session Management

### 12.1 Session Creation & Lifecycle
- **REQ-SES-01:** Sessions shall be creatable from a program record or the Sessions index. Required fields: Session Name, Linked Program, Session Type (from offerings catalogue), Delivery Mode (Online / Offline / Hybrid), Start Date, End Date.
- **REQ-SES-02:** Session lifecycle: `Draft → Scheduled → Active → Completed → Archived`. Transition rules:
  - Draft → Scheduled: requires Start Date and End Date
  - Scheduled → Active: requires Content Package linked AND Access Code generated
  - Unmet conditions surface as a named pre-flight checklist — not a silent error
- **REQ-SES-03:** Multi-day sessions shall support individual day configurations: date, start/end time, and a per-day label (e.g., "Day 1 — AI Fundamentals"). Each day inherits the parent session's program link and delivery mode.
- **REQ-SES-04:** Recurring sessions shall be configurable with: Recurrence Pattern (Daily / Weekly / Bi-weekly / Monthly), Number of Occurrences or Series End Date, and a Session Name prefix (e.g., "Weekly Check-In — Week {{n}}""). The system shall generate individual session instances. Each instance shall be independently editable after generation.
- **REQ-SES-05:** Sessions in Active, Completed, or Archived status shall restrict editing to description and notes fields only. Deletion shall be permitted for Draft status sessions only — all other sessions are archivable but not deletable.
- **REQ-SES-06:** Session notes shall be internal to the consultant and never visible to participants or clients in any view or export.

### 12.2 Milestones & Timeline
- **REQ-MIL-01:** Milestones shall be addable to any session with: Name (required), Due Date (required), Description (optional), Status (Pending / Complete / Overdue), and optional linked document URL.
- **REQ-MIL-02:** Milestones past their due date and not marked Complete shall be automatically flagged as Overdue by the system.
- **REQ-MIL-03:** The program record shall display a Gantt-style consolidated timeline across all linked sessions and their milestones in chronological order.

### 12.3 Calendar View
- **REQ-CAL-01:** A calendar view shall display all sessions across all programs in Month, Week, and Day views. Sessions shall be color-coded by Service Type.
- **REQ-CAL-02:** Milestones shall appear as date markers on the calendar. Overdue milestones shall render in red.
- **REQ-CAL-03:** When two sessions with overlapping dates are linked to the same program, the calendar shall display a conflict indicator on both. Conflict is a visual warning only — it does not block session creation.
- **REQ-CAL-04:** The calendar shall support filtering by Client, Service Type, Delivery Mode, and Status. Active filters shall display as removable chips.
- **REQ-CAL-05:** Each session shall offer an "Add to Calendar" action generating an ICS file or Google Calendar / Outlook link with: Session Name, Client, Location or Virtual Link, Start and End Time.

### 12.4 Notifications
- **REQ-NOT-01:** In-app and email alerts shall send: 7 days before session start and 24 hours before session start. Alert lead times shall be configurable per workspace.
- **REQ-NOT-02:** In-app and email alerts shall send when a milestone becomes Overdue. A daily digest option shall consolidate all overdue milestone alerts into one email per day.
- **REQ-NOT-03:** A reminder shall send when a Scheduled session's start date passes without activation, and when an Active session's end date passes without completion.
- **REQ-NOT-04:** The consultant shall configure notification preferences: toggle each alert type on/off, set preferred lead times, and choose digest frequency (Immediate / Daily / Off).

### 12.5 Document Attachment & Search
- **REQ-DOC-01:** Files (PDF, DOCX, PPTX, XLSX, PNG, JPG — 50MB max per file) and external links shall be attachable to session records, categorized as: Proposal, SOW, Agenda, Deliverable, Reference Material, or Other.
- **REQ-DOC-02:** Content Library items shall be linkable directly to a session record and displayed with a "From Library" badge alongside uploaded attachments.
- **REQ-SRC-01:** A Sessions Index shall support keyword search (Session Name, Client Name, Program Name) and multi-attribute filtering (Client, Program, Service Type, Delivery Mode, Status, Date Range). Filter combinations shall be saveable as named views.

---

## 13. Activity Log & Audit Trail

- **REQ-LOG-01:** Every session record shall maintain a chronological, append-only activity log recording: status changes (with old and new status), milestone updates, document attachments added/removed, content package linked/changed, notes added, access code events, and participant roster changes — each with timestamp.
- **REQ-LOG-02:** The consultant shall add freeform rich-text notes to any session record at any time. Notes are appended to the activity log with a timestamp.
- **REQ-LOG-03:** The activity log shall be exportable as PDF or CSV.
- **REQ-LOG-04:** All assessment results, feedback submissions, activity logs, and report data shall be retained for the lifetime of the consultant's workspace. Data is permanently deleted only upon account closure after a defined grace period.

---

## 14. Dashboard

- **REQ-DSH-01:** The main dashboard shall load on login and display the following widgets: Active Sessions (count by service type), Upcoming Sessions (list, 14-day lookout, configurable), Pending Requests (count + oldest pending date), Overdue Milestones (count + top 3 listed), Pipeline Value (USD by stage), Outstanding Invoices (total + overdue count), Recent Activity Feed.
- **REQ-DSH-02:** Each widget shall link to its source module for drill-down with a single click.
- **REQ-DSH-03:** The Recent Activity Feed shall display the latest cross-module actions in reverse chronological order, filterable by Client, Module (Onboarding / Sessions / Content Library), and Activity Type.
- **REQ-DSH-04:** All dashboard widgets shall reflect real-time data. Updates to sessions, proposals, milestones, and assessments shall be reflected within 5 seconds on the dashboard.

---

## 15. Reporting

- **REQ-RPT-01:** All reports shall support configurable date ranges: Today, This Week, This Month, This Quarter, This Year, Custom.
- **REQ-RPT-02:** An engagement pipeline report shall display a funnel showing count and USD value at each stage: Requests Received → Accepted → Proposal Sent → Proposal Accepted → Active.
- **REQ-RPT-03:** A session report shall display total sessions by status, service type, and delivery mode, with a monthly trend line.
- **REQ-RPT-04:** An assessment results dashboard per session shall show: response rates, score distributions, question-level breakdowns, open text responses, daily feedback trend, and pre/post learning comparison (manual question mapping by consultant).
- **REQ-RPT-05:** A revenue report shall show: Total Revenue YTD (USD), Revenue by Quarter, Revenue by Service Type, Revenue by Client. An outstanding invoices report shall show all programs with unpaid invoice status sorted by days outstanding.
- **REQ-RPT-06:** All reports shall be exportable as CSV.
- **REQ-RPT-07:** The consultant shall generate a post-training summary from any Completed session. The system shall auto-populate: program details, pre/post comparison, quiz scores, daily feedback trend, post-training evaluation results, and open text responses.
- **REQ-RPT-08:** The consultant shall customize the summary: toggle sections on/off, add cover message, add Key Takeaways and Recommendations (free text), curate participant quotes.
- **REQ-RPT-09:** The post-training summary shall export as a white-labeled PDF (consultant logo, brand colors, no Synaptic branding, "Powered by Synaptic" in footer) within 30 seconds. Summary layouts shall be saveable as named templates.

---

## 16. Non-Functional Requirements

### Performance
- **REQ-NFR-01:** Main dashboard shall fully render all widgets within 3 seconds of login.
- **REQ-NFR-02:** Content Library index page and search results shall return within 2 seconds.
- **REQ-NFR-03:** Live quiz results shall update within 2 seconds of participant submission.
- **REQ-NFR-04:** Post-training summary PDF shall generate within 30 seconds of export request.
- **REQ-NFR-05:** In-app notifications shall deliver within 10 seconds of trigger event. Email notifications shall deliver within 5 minutes with up to 3 retries on failure.

### Accessibility
- **REQ-NFR-06:** All participant-facing pages (sign-up, assessments, polls, feedback) shall comply with WCAG 2.1 AA: keyboard navigable, screen reader compatible, sufficient color contrast.
- **REQ-NFR-07:** All charts and graphs shall include text-based data alternatives (tables or descriptions). Color coding shall use both color and pattern/shape — not color alone.

### Security & Privacy
- **REQ-NFR-08:** All client PII (name, email, phone) shall be encrypted at rest. All form submissions and API calls transmitted over HTTPS only.
- **REQ-NFR-09:** All session, content, proposal, and report data shall be scoped to the authenticated consultant workspace. No cross-workspace data access permitted.
- **REQ-NFR-10:** Participant-facing forms shall not require account creation. No participant PII shall be collected unless the participant voluntarily provides it.
- **REQ-NFR-11:** Exported PDFs and CSVs shall not contain raw participant PII unless the consultant explicitly enables participant-level data in the export settings.

### Error Handling
- **REQ-NFR-12:** All upload failures, broken links, and form submission errors shall display a descriptive inline message and a suggested recovery action. No silent failures on any user-initiated operation.
- **REQ-NFR-13:** Unsaved changes on any form or editor shall trigger a confirmation dialog before navigation away.
- **REQ-NFR-14:** All views and widgets with no data shall display a meaningful empty state message. No blank or broken chart states are permitted.

---

## Phase Coverage Summary

| Requirement Group | P0 | P1 | P2 |
|---|---|---|---|
| Workspace & Branding (REQ-WS) | ✅ | | |
| Client Registration & Intake (REQ-REG, REQ-REQ) | ✅ | | |
| Client Profiles (REQ-CLI) | ✅ | | |
| Offerings Catalogue (REQ-OFF) | ✅ | | |
| Proposal Management (REQ-PRO) | | ✅ | |
| Pipeline & Revenue (REQ-PIP) | | ✅ | ✅ |
| Communication & Engagement (REQ-COM) | ✅ | ✅ | |
| Participant Management (REQ-PAR) | | ✅ | |
| Content Library — Assets (REQ-CON) | ✅ | ✅ | |
| Content Library — Question Bank (REQ-QBK) | ✅ | | |
| Content Library — Session Packages (REQ-PKG) | | ✅ | |
| Participant Session Access (REQ-ACC) | ✅ | ✅ | |
| Assessment & Feedback Delivery (REQ-ASM) | | ✅ | |
| Session Creation & Lifecycle (REQ-SES) | ✅ | ✅ | |
| Milestones & Timeline (REQ-MIL) | | ✅ | |
| Calendar View (REQ-CAL) | | ✅ | |
| Notifications (REQ-NOT) | | ✅ | |
| Document Attachment & Search (REQ-DOC, REQ-SRC) | ✅ | ✅ | |
| Activity Log & Audit Trail (REQ-LOG) | ✅ | | ✅ |
| Dashboard (REQ-DSH) | ✅ | | |
| Reporting & Post-Training Summary (REQ-RPT) | | ✅ | ✅ |
| Non-Functional Requirements (REQ-NFR) | ✅ | ✅ | ✅ |
