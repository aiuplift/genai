# Implementation Plan: AI Essentials Exercise Platform

## Overview

This plan implements a real-time collaborative web application for a 10-module professional AI training course. The stack is vanilla HTML/JS (no build step for production), Firebase Realtime Database for sync, Firebase Hosting for deployment, and Vitest + fast-check for testing. Tasks are ordered to build core infrastructure first, then shared UI, then individual modules, and finally facilitator/export features.

## Tasks

- [x] 1. Project setup and configuration
  - [x] 1.1 Create project file structure and Firebase configuration
    - Create directory structure: `public/`, `public/js/`, `public/js/core/`, `public/js/views/`, `public/js/modules/`, `public/js/components/`, `public/css/`, `tests/`, `tests/properties/`, `tests/unit/`
    - Create `firebase.json` for hosting config (public directory, rewrites for SPA)
    - Create `.firebaserc` with project alias placeholder
    - Create `public/index.html` as the SPA shell with semantic HTML landmarks, ARIA live regions, and viewport meta
    - Create `public/js/app.js` as the main entry point that initialises Firebase and starts the router
    - Create `package.json` with devDependencies: vitest, fast-check, @vitest/coverage-v8
    - _Requirements: 17.5, 18.4_

  - [x] 1.2 Create CSS design system and responsive layout
    - Create `public/css/styles.css` with CSS custom properties for the colour scheme (grey/blue/green status colours, primary, surface, text)
    - Implement responsive grid: single-column below 768px, multi-column grid at 768px+
    - Add card component styles, button styles, form input styles with 44×44px minimum tap targets
    - Add WCAG 2.1 AA contrast-compliant colour tokens (4.5:1 normal text, 3:1 large text/UI)
    - Add focus indicator styles (3:1 contrast), print CSS via `@media print` excluding nav/backgrounds
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 19.3_

- [x] 2. Core infrastructure — Router and Session Manager
  - [x] 2.1 Implement hash-based Router
    - Create `public/js/core/router.js`
    - Support routes: #login, #join, #modules, #activity/:moduleId/:activityId, #dashboard, #export
    - Parse route parameters from hash fragments
    - Implement `navigate(route)`, `getCurrentRoute()`, `onRouteChange(callback)`
    - Guard routes requiring session (redirect to #login if no active session)
    - Use `hashchange` event listener; render views into a main container element
    - _Requirements: 17.4 (keyboard nav), 17.5 (ARIA live region announcements on route change)_

  - [x] 2.2 Implement SessionManager
    - Create `public/js/core/session-manager.js`
    - Implement `createSession(facilitatorId, sessionName)` — generates 6-char passcode [A-Z0-9], checks uniqueness against active sessions in Firebase, writes session metadata
    - Implement `validatePasscode(input)` — case-insensitive comparison, returns session data on match
    - Implement `getActiveSession()` / `deleteSession(passcode)`
    - Implement lockout tracking in sessionStorage: 5 failed attempts in 15-min window → 5-min lockout
    - Implement `isLockedOut(clientId)` and `recordFailedAttempt(clientId)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.3 Write property tests for passcode and lockout
    - **Property 1: Passcode generation produces valid format**
    - **Property 2: Passcode comparison is case-insensitive**
    - **Property 3: Lockout rule triggers correctly**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 3. Core infrastructure — SyncEngine
  - [x] 3.1 Implement SyncEngine with Firebase RTDB integration
    - Create `public/js/core/sync-engine.js`
    - Implement `debouncedWrite(path, value)` with 2-second debounce timer
    - Implement `immediateWrite(path, value)` for non-debounced operations
    - Implement `subscribe(path, callback)` wrapping Firebase `onValue`/`onChildChanged`
    - Implement connection state monitoring via `.info/connected`
    - Implement `onConnectionChange(callback)` for UI offline indicator
    - _Requirements: 4.1, 4.2, 4.6_

  - [x] 3.2 Implement offline queue with cap and FIFO flush
    - Add offline queue in memory (fallback to sessionStorage for crash recovery)
    - Implement `queueChange(path, value)` — adds to queue, rejects if queue size ≥ 50
    - Implement `flushQueue()` — sends queued changes in insertion order on reconnect
    - Implement `getQueueSize()` for UI warning display
    - Handle last-write-wins conflict resolution (Firebase default, timestamp-based)
    - _Requirements: 4.4, 4.5, 4.6_

  - [ ]* 3.3 Write property tests for sync logic
    - **Property 9: Debounce fires once after quiet period**
    - **Property 10: Offline queue caps at 50 and preserves order**
    - **Property 11: Last-write-wins conflict resolution**
    - **Validates: Requirements 4.2, 4.4, 4.5, 4.6**

- [x] 4. Checkpoint — Core infrastructure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Core infrastructure — ModuleRegistry and validation
  - [x] 5.1 Implement ModuleRegistry
    - Create `public/js/core/module-registry.js`
    - Implement `getModule(moduleId)`, `getActivity(moduleId, activityId)`, `getAllModules()`
    - Implement `getFieldValidation(moduleId, activityId, fieldId)`
    - Define module metadata structure (id, title, activities array) — content populated in later tasks
    - _Requirements: 2.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1_

  - [x] 5.2 Implement field validation utility
    - Create `public/js/core/validation.js`
    - Implement `validateField(value, rules)` — checks minLength, maxLength, pattern, required
    - Implement `validateGroupId(input)` — 1-30 alphanumeric characters
    - Implement `validateDisplayName(input)` — 1-50 characters
    - Return `{ valid: boolean, error?: string }`
    - _Requirements: 3.1, 3.6, 5.4, 6.2, 6.3, 6.4, 8.4, 8.5, 9.2, 9.3, 10.3, 11.2, 11.3, 12.2, 12.3, 14.2, 14.5_

  - [ ]* 5.3 Write property test for input validation
    - **Property 6: Input validation enforces field constraints**
    - **Validates: Requirements 3.1, 3.6, 5.4, 6.2, 6.3, 6.4, 8.4, 8.5, 9.2, 9.3, 10.3, 11.2, 11.3, 12.2, 12.3, 14.2, 14.5**

- [x] 6. Shared UI components
  - [x] 6.1 Implement ActivityCard component
    - Create `public/js/components/activity-card.js`
    - Render card with colour-coded status: grey (not_started), blue (in_progress), green (completed)
    - Accept activity definition + responses, compute status from completion conditions
    - Make card navigable via keyboard (Tab + Enter/Space)
    - _Requirements: 19.1, 17.4_

  - [x] 6.2 Implement ProgressBar component
    - Create `public/js/components/progress-bar.js`
    - Calculate `Math.round((completed / total) * 100)` for module progress
    - Render as a visual bar with percentage label, ARIA progressbar role
    - _Requirements: 19.2_

  - [x] 6.3 Implement AvatarGroup and OfflineIndicator components
    - Create `public/js/components/avatar-group.js` — shows min(N, 5) avatars + overflow count
    - Create `public/js/components/offline-indicator.js` — persistent banner when offline, hides on reconnect
    - Both use ARIA live regions for dynamic updates
    - _Requirements: 19.4, 4.4, 17.5_

  - [ ]* 6.4 Write property tests for UI state components
    - **Property 14: Activity card status reflects correct state**
    - **Property 15: Module progress percentage is a bounded whole number**
    - **Property 16: Avatar group display limit**
    - **Validates: Requirements 19.1, 19.2, 19.4**

- [x] 7. Views — Login, Join, and Module List
  - [x] 7.1 Implement LoginView
    - Create `public/js/views/login-view.js`
    - Render passcode input form with submit button, error message area, lockout countdown
    - On submit: call SessionManager.validatePasscode(); handle lockout display
    - Navigate to #join on success, #dashboard if facilitator passcode
    - All form inputs labelled, focus management on error
    - _Requirements: 1.2, 1.3, 1.4, 17.4, 17.5_

  - [x] 7.2 Implement JoinView
    - Create `public/js/views/join-view.js`
    - Render display name input (1-50 chars), group identifier input (1-30 alphanumeric)
    - Show existing groups with member count; enforce max 8 per group
    - Show confirmation step with current members before joining
    - Validate inputs inline; prevent form submission on invalid
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.3 Write property tests for group logic
    - **Property 7: Group capacity enforcement**
    - **Property 8: Single group membership invariant**
    - **Validates: Requirements 3.4, 3.5, 3.2**

  - [x] 7.4 Implement ModuleListView
    - Create `public/js/views/module-list-view.js`
    - Display all 10 modules as cards; locked modules visually distinct and non-interactive
    - Show ProgressBar per module; subscribe to Firebase lock state changes
    - Clicking an unlocked module card navigates to its first activity
    - Lock state updates arrive via SyncEngine subscription within 2 seconds
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 19.2_

- [x] 8. Views — ActivityView (dynamic form rendering)
  - [x] 8.1 Implement ActivityView with dynamic field rendering
    - Create `public/js/views/activity-view.js`
    - Accept activity definition from ModuleRegistry; render fields by type (text, textarea, checklist, select, rating, file_upload, structured_table, readonly_display)
    - Show read-only mode when module is locked
    - Display presence indicators (AvatarGroup) for group members on same activity
    - Wire field inputs to SyncEngine.debouncedWrite on change
    - Subscribe to group responses via SyncEngine for real-time updates
    - Compute and display completion status
    - _Requirements: 2.3, 2.4, 2.6, 4.1, 4.2, 4.3, 17.4, 17.5_

  - [x] 8.2 Implement file upload field handler
    - Handle `file_upload` field type: validate accepted formats (PNG, JPG, PDF) and max 10MB size
    - Display error on invalid file; retain other field content on failure
    - Store file as base64 or Firebase Storage reference (depending on size constraints)
    - _Requirements: 9.3, 9.5_

  - [ ]* 8.3 Write property tests for module lock behaviour
    - **Property 4: Module lock preserves saved responses**
    - **Property 5: Lock discards pending changes and preserves saved state**
    - **Validates: Requirements 2.3, 2.4, 2.6**

- [x] 9. Checkpoint — Views and shared components working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Module definitions — Modules 1 and 2
  - [x] 10.1 Define Module 1 (AI Landscape and Tool Survey) configuration
    - Create `public/js/modules/module1.js`
    - Define Tool Survey activity: checklist across 5 categories (Chat and Generate, Search-grounded, Document Q&A, Capture-to-structure, Creative/Visual)
    - Define Personal Tool Map activity: structured entries with fields (purpose, strengths, weaknesses, data-restrictions), minEntries: 1, maxEntries: 20
    - Register in ModuleRegistry
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 10.2 Write property test for Tool Map minimum entry
    - **Property 12: Tool Map minimum entry invariant**
    - **Validates: Requirements 5.6**

  - [x] 10.3 Define Module 2 (Prompt Engineering and Professional Writing) configuration
    - Create `public/js/modules/module2.js`
    - Define 5 activities: Prompt Warm-up, Email Clinic, Template Builder, Peer Review Swap, Writing Clinic Scenarios
    - Prompt Warm-up: two input sections (max 2000 chars each) + comparison notes (max 1000 chars)
    - Email Clinic: 3 pre-loaded communications, improved version (max 2000) + decisions log (max 1000 per entry)
    - Template Builder: role (200), goal (200), details (500), rules (500), QA prompt (500)
    - Peer Review Swap: view another member's draft, Seven_Cs feedback (7 criteria with rating + comment)
    - Writing Clinic Scenarios: min 5 options, participant selects exactly 2
    - Register in ModuleRegistry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 10.4 Write property test for Writing Clinic selection
    - **Property 13: Writing Clinic selection constraint**
    - **Validates: Requirements 6.6**

- [x] 11. Module definitions — Modules 3 and 4
  - [x] 11.1 Define Module 3 (AI as Notetaker and Operational Writing) configuration
    - Create `public/js/modules/module3.js`
    - Define Capture-to-Minutes Pack: source material, official minutes, action table (person/description/due/status columns), follow-up email, unknowns section
    - Define QA Verification: verification prompt field, findings log (item, result enum, correction note)
    - Register in ModuleRegistry
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 11.2 Define Module 4 (Privacy and Responsible Use) configuration
    - Create `public/js/modules/module4.js`
    - Define Triage Exercise: ≥5 scenarios, each with classification select (safe/redaction/avoid) + justification (10-500 chars)
    - Define Safe Prompt Writing: ≥3 snippets (20-150 words), each with prompt formulation (10-1000) + verification plan (10-1000)
    - Register in ModuleRegistry
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Module definitions — Modules 5 and 6
  - [x] 12.1 Define Module 5 (Data Analysis and Visualisation) configuration
    - Create `public/js/modules/module5.js`
    - Define Formula Assistant Warm-up: description (500), formula (200), verification (300)
    - Define Dataset Analysis Pipeline: cleaning notes (1000), chart description (500) or image upload (PNG/JPG/PDF, 10MB), insight summary (1000), limitations (500)
    - Define Manual Verification: computed values (500 each, min 1), trend claims (500 each, min 1), discrepancies (500)
    - Register in ModuleRegistry
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 12.2 Define Module 6 (Reviewing and Summarising Documents) configuration
    - Create `public/js/modules/module6.js`
    - Define Document Synthesis Sprint: summaries at 3 resolutions (one-line 150, paragraph 500, full page 3000), themes (up to 10)
    - Define CV Screening Discussion: shortlist (up to 10 candidates), gaps (up to 10), discussion log (up to 50 entries)
    - Register in ModuleRegistry
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13. Module definitions — Modules 7 and 8
  - [x] 13.1 Define Module 7 (Research and Grounded Answers) configuration
    - Create `public/js/modules/module7.js`
    - Define Manager-ready Brief: research question (500), sources (1-20 entries), recommendation (2000), unknowns (1000)
    - Define Side-by-side Comparison: grounded output (3000), chat output (3000), documented differences (1-10 entries)
    - Register in ModuleRegistry
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 13.2 Define Module 8 (Visualisation and Presentation) configuration
    - Create `public/js/modules/module8.js`
    - Define Image Generation Lab: scenario (500), prompt (1000), criteria (500), notes (1000)
    - Define Presentation Sprint: topic (200), slides (3-10, title 100 + bullets 300 each), tools used (500), peer-review feedback (500 per review)
    - Register in ModuleRegistry
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 14. Module definitions — Modules 9 and 10
  - [x] 14.1 Define Module 9 (Building Without Coding) configuration
    - Create `public/js/modules/module9.js`
    - Define Main Lab (Build): purpose (500), platform (200), design description (1000), build status (select: Not Started/In Progress/Completed), testing notes (1000)
    - Define Mini-lab (Risk Review): risk checklist with 4 categories (data privacy, failure modes, unintended outputs, access control), each with level (Low/Medium/High) + notes (500)
    - Implement prerequisite check: Mini-lab disabled until Main Lab submitted
    - Implement round-robin partner assignment for risk review exchange
    - Register in ModuleRegistry
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 14.2 Define Module 10 (Capstone) configuration
    - Create `public/js/modules/module10.js`
    - Define Team Capstone Task: 4 sections (research output, draft document, visual asset, presentation summary), each up to 5000 chars
    - Define Team Peer Review: rubric with 4 dimensions (accuracy, clarity, visual quality, completeness), rated 1-5, plus feedback (2000 chars)
    - Define Individual Close: 3 fields (Tools to Adopt, Use Cases to Explore, Personal Guidelines), each up to 2000 chars, min 50 chars for completion
    - Implement prerequisite: peer review disabled until all 4 capstone sections submitted
    - Implement peer review group assignment (bijective mapping)
    - Register in ModuleRegistry
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 14.3 Write property test for capstone peer review assignment
    - **Property 17: Capstone peer review assignment is one-to-one**
    - **Validates: Requirements 14.6**

- [x] 15. Checkpoint — All module definitions complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Facilitator Dashboard
  - [x] 16.1 Implement DashboardView
    - Create `public/js/views/dashboard-view.js`
    - Display session-level overview: total participants, total groups, overall completion percentage
    - Show all groups with current module, activity progress percentage, active participant count
    - Provide lock/unlock controls for each of the 10 modules (all locked by default)
    - Subscribe to real-time updates; progress indicators update within 2 seconds
    - _Requirements: 15.1, 15.2, 15.3, 15.5_

  - [x] 16.2 Implement facilitator drill-down and session management
    - Allow facilitator to view individual group responses for any unlocked activity
    - Send lock notifications to affected participants (toast notification + read-only switch)
    - Implement session creation flow from dashboard (calls SessionManager.createSession)
    - Implement session deletion with confirmation
    - _Requirements: 15.4, 15.6, 15.7, 1.5, 1.6, 18.5_

- [x] 17. Export and Print
  - [x] 17.1 Implement ExportView
    - Create `public/js/views/export-view.js`
    - Generate print-friendly HTML document: single-column layout, no interactive elements
    - Include header with group name, participant name, session name, and date
    - Support per-module export (participant) and session-wide export (facilitator, organised by group then activity)
    - Handle empty state: display "no completed work available" if no submissions
    - Add retry button on export generation failure; timeout at 30 seconds with progress indicator
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 18. Privacy and data cleanup
  - [x] 18.1 Implement privacy controls and session cleanup
    - Ensure no PII beyond display names is collected; no third-party analytics
    - Store all data under `/sessions/{passcode}/` namespace only
    - On session delete: remove all associated Firebase data
    - On session end / participant leave: clear sessionStorage; no localStorage or cookie persistence of participant data
    - Generate participant IDs as UUIDs per browser session (not persisted)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

- [x] 19. Accessibility audit pass
  - [x] 19.1 Verify and fix accessibility across all views
    - Ensure all form inputs have associated `<label>` elements
    - Add ARIA live regions for dynamic content (route changes, real-time updates, error messages)
    - Add landmark roles (main, nav, banner, contentinfo)
    - Verify Tab order is logical; all interactive elements reachable and activatable
    - Add alt text to non-decorative images; verify focus indicators throughout
    - _Requirements: 17.3, 17.4, 17.5_

- [x] 20. Final checkpoint — Full integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. AI Chat — Cloud Function proxy
  - [x] 21.1 Create Firebase Cloud Function project structure
    - Create `functions/` directory with `package.json`, `index.js`
    - Add dependencies: firebase-functions, openai, @anthropic-ai/sdk, @google/generative-ai
    - Configure CORS, environment variables for API keys
    - Set up local emulator configuration
    - _Requirements: 22.2_

  - [x] 21.2 Implement chat proxy endpoint `/api/chat`
    - Request validation (passcode, participantId, model, prompt)
    - Rate limiting: 1 request per 2 seconds per participant
    - API key retrieval from Firebase RTDB (server-only path)
    - Token budget check before forwarding
    - Provider routing (OpenAI, Anthropic, Google)
    - Response + token count extraction per provider
    - Message storage in RTDB
    - Token usage counter update
    - Error handling (timeouts, provider errors, budget exceeded)
    - _Requirements: 20.3, 22.2, 25.1, 25.6_

  - [x] 21.3 Implement comparison mode in Cloud Function
    - Accept `isComparison` flag and `comparisonModel` in request
    - Make parallel API calls to both models
    - Handle partial failure (one succeeds, one fails)
    - Store comparison entry in RTDB
    - Return both responses in a single payload
    - _Requirements: 24.3, 24.5_

- [x] 22. AI Chat — Client-side components
  - [x] 22.1 Implement ChatService (Cloud Function client)
    - Create `public/js/chat/chat-service.js`
    - `sendPrompt({ prompt, model, context, participantId, passcode })` → calls Cloud Function
    - `sendComparisonPrompt({ prompt, models, context, participantId, passcode })` → comparison call
    - `canSendPrompt()` — client-side rate limit check (2s cooldown)
    - Handle response parsing, error mapping
    - _Requirements: 20.3, 24.3_

  - [x] 22.2 Implement AIModelRegistry (chat)
    - Create `public/js/chat/ai-model-registry.js`
    - `getAvailableModels(passcode)` — reads enabled models from Firebase config
    - `onModelsChanged(passcode, callback)` — subscribes to model availability
    - `getModelsForProvider(provider)` — static mapping
    - `isModelAvailable(passcode, modelId)` — checks current config
    - `getDefaultModel(passcode)` — first available model
    - _Requirements: 21.1, 21.2, 21.5, 22.3, 22.4_

  - [x] 22.3 Implement ContextDocumentManager
    - Create `public/js/chat/context-document-manager.js`
    - `upload(file, participantId, passcode)` — validate format (.txt, .pdf, .md), extract text, check 50KB limit, store in RTDB
    - `getContextText(participantId, passcode)` — read from RTDB
    - `removeDocument(participantId, passcode)` — clear from RTDB
    - PDF text extraction using a lightweight library or FileReader approach
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [x] 22.4 Implement TokenTracker
    - Create `public/js/chat/token-tracker.js`
    - `recordUsage(participantId, passcode, tokens)` — write to RTDB
    - `getParticipantUsage(participantId, passcode)` — read total
    - `getSessionUsage(passcode)` — sum all participants
    - `checkBudget(passcode)` — check against configured budget
    - `onUsageChanged(passcode, callback)` — subscribe for dashboard
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_

- [x] 23. AI Chat — Chat Panel UI
  - [x] 23.1 Implement ChatPanel component
    - Create `public/js/chat/chat-panel.js`
    - Resizable sidebar (300-800px width) with drag handle
    - Open/close/minimize functionality with state persistence in sessionStorage
    - Chat message thread (scrollable, auto-scroll to bottom on new message)
    - Message input with send button (disable during pending request)
    - Model selector dropdown (populated from AIModelRegistry)
    - Compare toggle button (switches to dual-model dropdowns)
    - Rate limit cooldown indicator
    - Display token count per message (subtle, below response)
    - Display model name with each response
    - _Requirements: 20.1, 20.2, 20.5, 20.6, 21.2, 21.3, 21.4, 24.1, 24.2, 25.3_

  - [x] 23.2 Implement chat history persistence and restoration
    - Store messages in RTDB at `/sessions/{passcode}/chat/{participantId}/messages/`
    - Load full history on panel open
    - Real-time updates (new messages append to thread)
    - Comparison messages stored as single entries with both responses
    - _Requirements: 20.4, 20.6, 24.6_

  - [x] 23.3 Implement context document upload UI
    - Add "Context" section in chat panel header or settings area
    - Upload button with file picker (accepts .txt, .pdf, .md)
    - Display current document filename and size
    - View, replace, and remove buttons
    - Error messages for invalid format or size exceeded
    - _Requirements: 23.1, 23.3, 23.5, 23.6_

  - [x] 23.4 Implement token budget warnings and blocking
    - Subscribe to session token usage
    - Display warning banner at 80% usage
    - Block input + display message at 100% usage
    - No warnings when no budget configured
    - _Requirements: 25.5, 25.6, 25.7_

- [x] 24. AI Chat — Facilitator dashboard additions
  - [x] 24.1 Add API key configuration to facilitator dashboard
    - Add "AI Models" section to dashboard
    - Input fields for OpenAI, Anthropic, Google API keys (masked input)
    - Save to Firebase (server-only path)
    - Individual model enable/disable toggles
    - Token budget configuration field
    - _Requirements: 22.1, 22.3, 22.4, 25.4_

  - [x] 24.2 Add token usage monitoring to facilitator dashboard
    - Token usage summary table (per group, per participant)
    - Total session usage with percentage of budget (if configured)
    - Real-time updates via Firebase subscription
    - _Requirements: 25.2, 25.4_

- [x] 25. AI Chat — Integration and testing
  - [x] 25.1 Integrate ChatPanel into ActivityView
    - Add chat panel toggle button to activity header
    - Pass current moduleId/activityId as context
    - Ensure chat panel doesn't obscure activity content on mobile (collapse below on narrow viewports)
    - _Requirements: 20.1, 20.2, 17.1_

  - [ ]* 25.2 Integration tests for AI chat flow
    - Test full flow: open panel → select model → send prompt → receive response
    - Test comparison mode flow
    - Test context document: upload → verify in prompt → remove
    - Test budget enforcement: at 80% warning, at 100% block
    - Test model switch mid-conversation
    - _Requirements: 20-25_

- [x] 26. Final checkpoint — AI Chat feature complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 27. UI Redesign — AI-themed colour scheme
  - [x] 27.1 Redesign CSS with AI-friendly colours
    - Replace current blue/grey corporate palette with an AI-inspired colour scheme (deep purples, electric teals, soft gradients, neural-network-inspired accents)
    - Update all CSS custom properties in `public/css/styles.css`
    - Keep WCAG 2.1 AA contrast compliance
    - Modernise card styles, buttons, and form inputs with subtle AI-themed touches (glow effects, gradient borders)
    - Update status colours to match the new palette while remaining distinct
    - Add subtle background patterns or gradient overlays that evoke AI/neural networks
    - Test across all views for consistency

- [x] 28. Facilitator content preview
  - [x] 28.1 Add "Preview as Student" mode to dashboard
    - Add a "Preview Content" button on the dashboard that enters a read-only student view
    - Facilitator can browse modules and activities, see all content and form fields
    - Fields are interactive (facilitator can type in them to test) but clearly marked as "Preview Mode"
    - Add a floating "Back to Dashboard" button to exit preview
    - No data is saved to Firebase during preview mode
    - Preview mode shows all modules regardless of lock state

- [x] 29. Slide-based lesson delivery with Reveal.js
  - [x] 29.1 Integrate Reveal.js and create slide presentation engine
    - Embed Reveal.js within the module content view (not full-page — embedded in the #app container)
    - Add fullscreen toggle button
    - Use the AI colour palette (purple/teal/dark theme)
    - Support slide types: content, quiz, activity, chapter divider
    - Progressive reveal animations (fragments)
    - Slide navigation via arrows/click/keyboard
    - Slide progress bar

  - [x] 29.2 Fix Module 1 slide deck — fullscreen overflow and content spacing
    - Fix all slides that overflow in fullscreen mode (slides 2, 5, 7, 10, 11, 17, 20, 21)
    - Ensure every slide fits within 1280x720 viewport without any content being cut off
    - Test in fullscreen on a standard laptop screen
    - Add more animations and infographics where space allows
    - Make content fill available space properly (no large empty areas)
    - Consider splitting dense slides into two slides if content cannot be compacted enough

  - [x] 29.3 Create Module 2 slide deck content
    - Convert Module 2 sections into Reveal.js slides
    - Add 3-4 interactive quizzes (LLM knowledge, prompt engineering, failure patterns)
    - Include Email Clinic, Template Builder as interactive exercise slides
    - Include peer review and writing clinic scenario slides

- [ ] 30. AI Skills Studio — Branding & Identity
  - [ ] 30.1 Rebrand to "AI Skills Studio"
    - Update header nav brand text and icon
    - Update page title and meta description in index.html
    - Create a simple logo/wordmark for the header
    - Add favicon (AI-themed icon)
    - Update footer text
  - [ ] 30.2 Create landing page
    - Public-facing page before login explaining what AI Skills Studio is
    - Feature highlights: interactive exercises, AI chat, real-time collaboration
    - "Enter Session" CTA button leading to passcode login
    - Professional design matching the purple/teal theme
  - [ ] 30.3 Custom domain setup
    - Register and configure custom domain (e.g., aiskillsstudio.com)
    - Configure DNS and SSL via Firebase Hosting

- [ ] 31. Student Experience — Data Persistence & Progress
  - [ ] 31.1 Wire form inputs to Firebase sync
    - Connect all textarea/checkbox/select inputs in module-content-view to SyncEngine.debouncedWrite
    - Load saved responses on page load (restore previous work)
    - Show "Saved ✓" indicator near fields when data is persisted
  - [ ] 31.2 Module completion tracking
    - Calculate completion percentage per module based on filled fields
    - Show visual "completed" badge on module cards when all required fields are filled
    - Persist completion state in Firebase
  - [ ] 31.3 Student onboarding flow
    - First-time user sees a brief "how this works" overlay or intro screen
    - Explain: exercises, AI chat, progress tracking, group collaboration
    - Dismissable, doesn't show again after first visit
  - [ ] 31.4 Skill badges / completion certificates
    - Generate a simple completion certificate (PDF or HTML) when all modules are done
    - Show earned badges on the module list view
    - Include participant name, completion date, modules completed

- [ ] 32. AI Chat — Learning Coach Enhancement
  - [ ] 32.1 Context-aware AI prompts
    - Pass current module title, activity description, and section context to the AI system prompt
    - AI responses are tailored to the specific exercise the student is working on
    - Add a system prompt prefix: "You are an AI learning coach helping a professional learn about [current topic]..."
  - [ ] 32.2 Structured AI exercises
    - Add "Try with AI" buttons on specific activities that open the chat with a pre-filled prompt
    - Student completes the AI interaction, then records observations in the activity fields
  - [ ] 32.3 Prompt history view
    - Show a chronological log of all prompts the student has sent during this session
    - Allow students to revisit and reflect on their prompt evolution

- [ ] 33. Facilitator Experience Enhancements
  - [ ] 33.1 "Launch Slides" button per module
    - Add a button on the dashboard next to each module that opens the slide deck in a new tab
    - Only show for modules that have a slide deck available
  - [ ] 33.2 Live activity tracker
    - Real-time view of which students are active and which module/activity they're on
    - Show last-active timestamps per participant
  - [ ] 33.3 Push notifications to students
    - Allow facilitator to send a text message/announcement to all connected students
    - Appears as a toast notification on student screens
  - [ ] 33.4 Per-participant PDF export
    - Generate a formatted PDF of each participant's completed work
    - Include all responses, quiz scores, and reflection notes

- [ ] 34. Platform Polish
  - [ ] 34.1 Mobile-responsive testing and fixes
    - Test all views on phone/tablet viewports
    - Fix any layout breaks, touch targets, or overflow issues
    - Ensure chat panel works on mobile (full-width overlay)
  - [ ] 34.2 Loading states and skeleton screens
    - Show skeleton placeholders while content loads
    - Add loading spinners for async operations
  - [ ] 34.3 Error boundaries
    - Catch JavaScript errors gracefully without breaking the entire page
    - Show user-friendly error messages with retry options
  - [ ] 34.4 Offline support improvements
    - Show clear offline/online indicator
    - Queue form changes when offline, flush when reconnected
    - Warn user before closing browser with unsaved queued changes

- [ ] 35. Deployment & Access
  - [ ] 35.1 Deploy to Firebase Hosting
    - Run `firebase deploy` to publish the public/ directory
    - Verify the live URL works (https://synaptic-ai-4491b.web.app)
    - Test login flow, module access, and chat on the deployed version
  - [ ] 35.2 Deploy Cloud Functions
    - Deploy the functions/ directory for the AI chat proxy
    - Test the /api/chat endpoint on the live deployment
    - Configure API keys in Firebase environment config
  - [ ] 35.3 Environment separation
    - Set up dev vs production Firebase projects (or use emulators for dev)
    - Ensure API keys and configs are not hardcoded in client-side code for production

- [ ] 36. Content — Modules 3-10 Student Experiences
  - [ ] 36.1 Build Module 3 student experience (AI as Notetaker)
    - Add sections array with rich instructional content
    - Add quiz and feedback activities
  - [ ] 36.2 Build Module 4 student experience (Privacy & Responsible Use)
  - [ ] 36.3 Build Module 5 student experience (Data Analysis)
  - [ ] 36.4 Build Module 6 student experience (Document Review)
  - [ ] 36.5 Build Module 7 student experience (Research & Grounded Answers)
  - [ ] 36.6 Build Module 8 student experience (Visualisation & Presentation)
  - [ ] 36.7 Build Module 9 student experience (Building Without Coding)
  - [ ] 36.8 Build Module 10 student experience (Capstone)

- [ ] 37. Slide Deck Enhancements — Dialogues & Quality Upgrades
  - [ ] 37.1 Add 2-3 comic dialogue slides to Module 1 deck
    - Use recurring characters (Priya, Amit, Kenji, Rachel)
    - DiceBear avataaars with comic speech bubbles (white/coloured, triangular tails)
    - Topics: hallucination discovery, tool selection mistake, verification save
  - [ ] 37.2 Add 2-3 comic dialogue slides to Module 2 deck
    - Topics: weak vs strong prompt consequences, constraint saving the day, iteration success
  - [ ] 37.3 Add recap slides (summary + 3-4 quiz questions) to Module 2 deck opening
    - Recap of Module 1 key concepts before Module 2 content begins
  - [ ] 37.4 Replace any software engineering examples in Module 1 & 2 slides with generic business scenarios
    - Use finance, HR, admin, law, teaching examples
    - Ensure recurring characters are used where dialogues/scenarios appear
  - [ ] 37.5 Build Module 4-10 slide decks with full quality standard
    - Apply all checklist criteria: recaps, dialogues, bigger fonts, speaker notes, practical exercises
    - Each deck: ~28-33 slides, 75 min, 40/60 theory/practical ratio
    - Include 2-3 comic dialogue slides per module
    - Include recap + 3-4 quiz questions from prior modules at start
    - Industry-agnostic examples throughout

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The platform uses vanilla JS with no build step — all source files are directly served via Firebase Hosting
- Firebase Security Rules should be configured separately to enforce passcode-based access (not a coding task in this scope)
- Vitest is used as the test runner with fast-check for property-based tests; tests run via `npx vitest --run`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["3.3", "5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3", "6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "7.1", "7.2"] },
    { "id": 7, "tasks": ["7.3", "7.4", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["10.1", "10.3", "11.1", "11.2", "21.1"] },
    { "id": 10, "tasks": ["10.2", "10.4", "12.1", "12.2", "21.2"] },
    { "id": 11, "tasks": ["13.1", "13.2", "14.1", "14.2", "21.3"] },
    { "id": 12, "tasks": ["14.3", "22.1", "22.2", "22.3", "22.4"] },
    { "id": 13, "tasks": ["16.1", "17.1", "23.1", "23.2"] },
    { "id": 14, "tasks": ["16.2", "18.1", "23.3", "23.4"] },
    { "id": 15, "tasks": ["19.1", "24.1", "24.2"] },
    { "id": 16, "tasks": ["25.1"] },
    { "id": 17, "tasks": ["25.2"] }
  ]
}
```
