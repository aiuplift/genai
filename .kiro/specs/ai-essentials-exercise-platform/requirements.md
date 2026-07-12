# Requirements Document

## Introduction

The AI Essentials Exercise Platform is an interactive web application that supports the 10 modules of the "AI Essentials for Professionals (2026)" training course. The platform provides a real-time collaborative environment where participants work in small groups through hands-on AI exercises during facilitator-led sessions. The system follows the same architectural approach as the existing QE Training platform: Firebase-based, group-oriented, passcode-gated, with a facilitator dashboard for monitoring and control.

The course targets beginner-level professionals (admin staff, general office staff, HR, small business owners) and requires no coding. Each of the 10 modules (2 hours each) contains structured activities that participants complete collaboratively using the platform.

## Glossary

- **Platform**: The AI Essentials Exercise Platform web application
- **Facilitator**: The instructor who manages sessions, unlocks modules, and monitors participant progress
- **Participant**: A learner enrolled in a session who completes exercises within a group
- **Group**: A small team of participants (typically 3–5) who collaborate on exercises within a session
- **Session**: A single delivery instance of the course, identified by a unique passcode
- **Module**: One of the 10 lesson units, each containing one or more activities
- **Activity**: A discrete exercise or task within a module that participants complete
- **Activity_Card**: A UI component representing a single activity, displaying instructions, input fields, and completion status
- **Tool_Map**: A personal reference document created in Module 1 cataloguing AI tools by category, strengths, weaknesses, and data restrictions
- **Facilitator_Dashboard**: The administrative interface for managing sessions, unlocking modules, and monitoring group progress
- **Firebase_Database**: The Firebase Realtime Database used for data persistence and real-time synchronisation
- **Passcode**: A short alphanumeric code that gates access to a specific session
- **Seven_Cs_Framework**: A writing quality framework (Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous) used in Module 2
- **Export**: The action of generating a downloadable or printable version of completed work
- **AI_Chat**: The embedded chat panel that allows participants to send prompts to AI models and receive responses, displayed alongside activities
- **Model_Provider**: A third-party AI service (OpenAI, Anthropic, or Google) that supplies language model capabilities via API
- **Context_Document**: A personal text document uploaded by a participant that is automatically included as context in all AI chat prompts for that participant
- **Token_Budget**: A facilitator-configured limit on the total number of input and output tokens a session may consume, enforced as a soft limit with warnings

## Requirements

### Requirement 1: Session Creation and Passcode Gating

**User Story:** As a facilitator, I want to create sessions protected by a unique passcode, so that only authorised participants can access the course materials.

#### Acceptance Criteria

1. WHEN a facilitator creates a new session, THE Platform SHALL generate a unique alphanumeric passcode of exactly 6 characters using uppercase letters (A–Z) and digits (0–9), ensuring the passcode does not match any currently active session's passcode
2. WHEN a participant enters a passcode that matches an active session's passcode using a case-insensitive comparison, THE Platform SHALL grant access to the session and display the module list
3. IF a participant enters a passcode that does not match any active session, THEN THE Platform SHALL display an error message indicating the passcode is invalid, deny access to session content, and retain the passcode input field for retry
4. IF a participant enters an invalid passcode 5 consecutive times within a 15-minute window, THEN THE Platform SHALL temporarily block further passcode attempts from that participant for 5 minutes and display a message indicating the lockout duration
5. THE Platform SHALL allow a facilitator to create up to 20 concurrent sessions, each with a distinct passcode
6. WHEN a session is created, THE Platform SHALL store session metadata (name, creation date, passcode, facilitator identifier) in the Firebase_Database

### Requirement 2: Module Unlocking and Sequencing

**User Story:** As a facilitator, I want to control which modules are available to participants at any given time, so that I can pace the course delivery during live sessions.

#### Acceptance Criteria

1. THE Platform SHALL display all 10 modules to participants, with locked modules shown as non-interactive elements that are visually distinct from unlocked modules, and all modules SHALL default to the locked state at the start of a new session
2. WHEN a facilitator unlocks a module from the Facilitator_Dashboard, THE Platform SHALL make that module accessible to all participants in the session within 2 seconds
3. WHEN a facilitator locks a previously unlocked module, THE Platform SHALL prevent new edits to activities within that module, preserve all participant responses saved prior to the lock action, and display a read-only indicator on the module
4. IF a participant has unsaved changes in a module at the moment a facilitator locks that module, THEN THE Platform SHALL notify the participant that the module has been locked and discard the unsaved changes while preserving the last saved state
5. THE Platform SHALL allow a facilitator to unlock modules in any order
6. WHILE a module is locked, THE Platform SHALL allow participants to view previously saved responses in read-only mode
7. WHEN a module's lock state changes, THE Platform SHALL update the module's visual state on all connected participant screens within 2 seconds without requiring a page refresh

### Requirement 3: Group Formation and Management

**User Story:** As a facilitator, I want to assign participants into small groups, so that they can collaborate on exercises together.

#### Acceptance Criteria

1. WHEN a participant joins a session, THE Platform SHALL prompt the participant to enter a display name between 1 and 50 characters and a group identifier between 1 and 30 alphanumeric characters
2. THE Platform SHALL associate each participant with exactly one group within a session
3. WHEN a participant selects a group, THE Platform SHALL display the list of current group members and require the participant to explicitly confirm or cancel their group selection before joining
4. THE Platform SHALL support a minimum of 2 and a maximum of 8 participants per group
5. IF a participant attempts to join a group that has reached the maximum capacity of 8 participants, THEN THE Platform SHALL display a message indicating the group is full and prompt selection of a different group
6. IF a participant submits a display name or group identifier that does not meet the required length or character constraints, THEN THE Platform SHALL display a message indicating the validation error and prompt the participant to correct the input before proceeding

### Requirement 4: Real-Time Collaboration and Auto-Save

**User Story:** As a participant, I want to see my group members' contributions in real time and have my work saved automatically, so that no progress is lost.

#### Acceptance Criteria

1. WHEN a participant enters or modifies content in an activity, THE Platform SHALL synchronise the change to all group members within 1 second via the Firebase_Database
2. WHEN a participant's input in a field remains unchanged for 2 seconds (debounce interval), THE Platform SHALL auto-save that input to the Firebase_Database
3. WHILE a participant is editing a field, THE Platform SHALL display a visible indicator adjacent to that field showing the name of each other group member who is currently viewing or editing the same activity
4. IF a network disconnection occurs, THEN THE Platform SHALL queue unsaved changes locally (up to 50 pending changes), display an offline status indicator to the participant, and synchronise all queued changes upon reconnection in the order they were made
5. IF the local offline queue reaches its capacity of 50 pending changes, THEN THE Platform SHALL display a warning message indicating that further changes may not be saved until connectivity is restored
6. WHEN multiple participants edit the same field concurrently, THE Platform SHALL resolve conflicts by preserving the most recent write (last-write-wins) and SHALL update the display of all other participants editing that field to reflect the resolved content within 2 seconds

### Requirement 5: Module 1 — AI Landscape and Tool Survey

**User Story:** As a participant, I want to complete a guided tool survey and build a personal Tool Map, so that I understand which AI tools suit different professional tasks.

#### Acceptance Criteria

1. WHEN Module 1 is unlocked, THE Platform SHALL display two activities: "Tool Survey" and "Personal Tool Map"
2. THE Platform SHALL present the Tool Survey as a guided checklist across five categories: Chat and Generate, Search-grounded, Document Q&A, Capture-to-structure, and Creative/Visual, with each category containing at least one checklist item
3. WHEN a participant completes a checklist item in the Tool Survey, THE Platform SHALL mark the item as complete and update the group progress indicator within 3 seconds, displaying the count of completed items out of total items for the group
4. THE Platform SHALL provide structured input fields for the Tool Map with sections for each tool covering: tool purpose, strengths, weaknesses, and data restrictions, with each text field accepting between 1 and 500 characters
5. THE Platform SHALL allow participants to add and edit entries in their Tool Map, up to a maximum of 20 entries
6. WHEN a participant requests to remove an entry from their Tool Map, THE Platform SHALL prompt for confirmation before deletion and SHALL not allow removal if it is the only remaining entry
7. WHEN a participant has completed all checklist items across the five Tool Survey categories, THE Platform SHALL mark the Tool Survey activity as complete

### Requirement 6: Module 2 — Prompt Engineering and Professional Writing

**User Story:** As a participant, I want to practise prompt engineering and professional writing through structured clinic exercises, so that I can improve my AI-assisted communication skills.

#### Acceptance Criteria

1. WHEN Module 2 is unlocked, THE Platform SHALL display five activities: "Prompt Warm-up", "Email Clinic", "Template Builder", "Peer Review Swap", and "Writing Clinic Scenarios"
2. THE Platform SHALL present the Prompt Warm-up activity with two input sections: one for an unconstrained prompt attempt (maximum 2000 characters) and one for a structured prompt attempt (maximum 2000 characters), with a comparison notes area (maximum 1000 characters)
3. THE Platform SHALL present the Email Clinic with 3 pre-loaded short communications and for each provide input fields for the improved version (maximum 2000 characters) and a decisions log documenting which AI suggestions were accepted or rejected with rationale (maximum 1000 characters per entry)
4. THE Platform SHALL provide a template builder with structured fields for: role (maximum 200 characters), goal (maximum 200 characters), specific details (maximum 500 characters), rules and constraints (maximum 500 characters), and a QA prompt field (maximum 500 characters)
5. THE Platform SHALL enable the Peer Review Swap by allowing participants to view another group member's Email Clinic draft and provide feedback using the Seven_Cs_Framework, with a separate rating and comment field for each of the 7 criteria
6. THE Platform SHALL present Writing Clinic Scenarios with a minimum of 5 scenario options (including diplomatic feedback, angry client response, team announcements, repurposing content, and job application) and require the participant to select and complete exactly 2

### Requirement 7: Module 3 — AI as Notetaker and Operational Writing

**User Story:** As a participant, I want to produce official minutes and follow-up communications from raw meeting notes, so that I can use AI effectively for operational documentation.

#### Acceptance Criteria

1. WHEN Module 3 is unlocked, THE Platform SHALL display two activities: "Capture-to-Minutes Pack" and "QA Verification"
2. THE Platform SHALL provide the Capture-to-Minutes Pack activity with input fields for: source material description (a text area for pasting or summarising raw meeting notes), official minutes output, action table, and follow-up email
3. THE Platform SHALL render the action table with structured columns for: responsible person, action item description, due date, and status
4. THE Platform SHALL include a dedicated "Unknowns / Needs Confirmation" section as a separate input field positioned below the official minutes output within the Capture-to-Minutes Pack activity
5. THE Platform SHALL provide the QA Verification activity with an input field for the verification prompt used and a findings log where each entry contains: the item checked, the result (confirmed accurate, error found, or unable to verify), and a correction note
6. WHEN a participant completes all input fields in both activities, THE Platform SHALL mark Module 3 as complete and update group progress in real time

### Requirement 8: Module 4 — Privacy and Responsible Use

**User Story:** As a participant, I want to practise triaging workplace information for AI tool safety, so that I can handle sensitive data responsibly when using AI.

#### Acceptance Criteria

1. WHEN Module 4 is unlocked, THE Platform SHALL display two activities: "Triage Exercise" and "Safe Prompt Writing"
2. WHEN the participant starts the Triage Exercise, THE Platform SHALL present at least 5 workplace data scenarios, each with a classification selection offering three options (safe to paste, requires redaction, must avoid) and a justification text field accepting 10–500 characters
3. WHEN the participant starts the Safe Prompt Writing activity, THE Platform SHALL present at least 3 workplace snippets of 20–150 words each, each requiring a safe prompt formulation text field and a verification plan text field both accepting 10–1000 characters
4. IF the participant attempts to submit a Triage Exercise classification without selecting an option or with a justification below 10 characters, THEN THE Platform SHALL prevent submission and display an error message indicating the missing or insufficient input
5. IF the participant attempts to submit a Safe Prompt Writing response with either the prompt formulation or verification plan field below 10 characters, THEN THE Platform SHALL prevent submission and display an error message indicating the incomplete field

### Requirement 9: Module 5 — Data Analysis and Visualisation with AI

**User Story:** As a participant, I want to use AI to clean data, generate formulas, create charts, and verify results, so that I can apply AI to everyday data tasks.

#### Acceptance Criteria

1. WHEN Module 5 is unlocked, THE Platform SHALL display three activities: "Formula Assistant Warm-up", "Dataset Analysis Pipeline", and "Manual Verification"
2. WHEN the participant selects the "Formula Assistant Warm-up" activity, THE Platform SHALL present input fields for: a plain language description of the desired calculation (maximum 500 characters), the AI-generated formula (maximum 200 characters), and a manual verification result (maximum 300 characters)
3. WHEN the participant selects the "Dataset Analysis Pipeline" activity, THE Platform SHALL present sections displayed in fixed order for: data cleaning notes (maximum 1000 characters), chart description (maximum 500 characters) or chart image upload (accepted formats: PNG, JPG, or PDF; maximum file size: 10 MB), insight summary (maximum 1000 characters), and stated limitations (maximum 500 characters)
4. WHEN the participant selects the "Manual Verification" activity, THE Platform SHALL present fields for: at least 1 computed value checked (maximum 500 characters per entry), at least 1 trend claim assessed (maximum 500 characters per entry), and discrepancies found (maximum 500 characters)
5. IF a chart upload fails due to unsupported format or file size exceeding 10 MB, THEN THE Platform SHALL display an error message indicating the accepted formats and maximum file size, and SHALL retain any previously entered text in the other sections
6. WHEN the participant has provided content in all required fields within an activity and submits, THE Platform SHALL mark that activity as complete and record the submission timestamp

### Requirement 10: Module 6 — Reviewing and Summarising Documents

**User Story:** As a participant, I want to synthesise documents at multiple resolutions and apply AI to screening tasks, so that I can review large volumes of information efficiently.

#### Acceptance Criteria

1. WHEN Module 6 is unlocked, THE Platform SHALL display two activities: "Document Synthesis Sprint" and "CV Screening Discussion"
2. THE Platform SHALL present the Document Synthesis Sprint as a group activity with input fields for summaries at three resolutions: one-line (maximum 150 characters), paragraph (maximum 500 characters), and full page (maximum 3000 characters), and an extracted themes section supporting up to 10 themes
3. IF a participant submits a summary that exceeds the character limit for its resolution level, THEN THE Platform SHALL reject the submission and display an error message indicating which resolution field exceeds its limit
4. THE Platform SHALL present the CV Screening Discussion with fields for: an AI-generated shortlist of up to 10 candidates, an identified gaps section supporting up to 10 entries, and a discussion log for bias and legal constraints supporting up to 50 entries
5. IF the AI-generated shortlist fails to load, THEN THE Platform SHALL display an error message indicating the shortlist is unavailable and allow the participant to retry the generation

### Requirement 11: Module 7 — Research and Grounded Answers

**User Story:** As a participant, I want to produce a manager-ready research brief and compare grounded versus ungrounded AI responses, so that I can deliver reliable AI-assisted research.

#### Acceptance Criteria

1. WHEN Module 7 is unlocked, THE Platform SHALL display two activities: "Manager-ready Brief" and "Side-by-side Comparison"
2. WHEN the participant opens the Manager-ready Brief activity, THE Platform SHALL present a form with four labeled sections: "Research Question" (text input, maximum 500 characters), "Sources Cited" (at least 1 source entry required, maximum 20 entries), "Recommendation" (text input, maximum 2000 characters), and "What We Don't Know" (text input, maximum 1000 characters)
3. WHEN the participant opens the Side-by-side Comparison activity, THE Platform SHALL present two parallel text input areas labeled "Grounded Tool Output" and "Chat Tool Output" (each maximum 3000 characters), and a "Documented Differences" section requiring the participant to record at least 1 and up to 10 identified differences between the two outputs
4. WHEN the participant has provided content in all required sections of an activity and selects submit, THE Platform SHALL mark that activity as complete and display a completion confirmation within 3 seconds
5. IF the participant selects submit without filling all required sections, THEN THE Platform SHALL display an error message indicating which sections are incomplete and SHALL NOT mark the activity as complete

### Requirement 12: Module 8 — Visualisation and Presentation

**User Story:** As a participant, I want to generate and evaluate AI-created visuals and build a short presentation, so that I can use AI for visual communication.

#### Acceptance Criteria

1. WHEN Module 8 is unlocked, THE Platform SHALL display two activities: "Image Generation Lab" and "Presentation Sprint"
2. THE Platform SHALL present the Image Generation Lab with fields for: workplace scenario description (maximum 500 characters), prompt used (maximum 1000 characters), evaluation criteria (maximum 500 characters), and evaluation notes (maximum 1000 characters)
3. THE Platform SHALL present the Presentation Sprint with fields for: presentation topic (maximum 200 characters), slide outline (between 3 and 10 slides, each with a title of maximum 100 characters and bullet points of maximum 300 characters), AI tools used (maximum 500 characters), and a peer-review feedback section where other participants can submit written feedback (maximum 500 characters per review)
4. IF a participant submits the Image Generation Lab or Presentation Sprint with any required field empty, THEN THE Platform SHALL display an error message indicating which fields must be completed and SHALL retain all previously entered content
5. WHEN a participant completes and submits the Presentation Sprint, THE Platform SHALL make that participant's slide outline and presentation topic visible to other participants for peer-review feedback

### Requirement 13: Module 9 — Building Without Coding and AI Agents

**User Story:** As a participant, I want to design a simple tool or agent using a no-code builder and conduct a risk review, so that I can build AI-powered solutions without programming.

#### Acceptance Criteria

1. WHEN Module 9 is unlocked, THE Platform SHALL display two activities: "Main Lab (Build)" and "Mini-lab (Risk Review)"
2. WHEN the participant opens the Main Lab activity, THE Platform SHALL present a submission form with the following required fields: tool or agent purpose (max 500 characters), platform or builder used (max 200 characters), design description (max 1000 characters), build status selected from "Not Started", "In Progress", or "Completed", and a testing notes section (max 1000 characters)
3. WHEN the participant opens the Mini-lab activity, THE Platform SHALL present a risk checklist requiring the participant to assess each of the following categories by selecting a risk level of "Low", "Medium", or "High" and providing notes (max 500 characters per category): data privacy, failure modes, unintended outputs, and access control
4. IF the participant has not submitted their Main Lab build design, THEN THE Platform SHALL disable access to the Mini-lab partner exchange and display a message indicating that the Main Lab must be completed first
5. WHEN the participant accesses the Mini-lab partner exchange, THE Platform SHALL display the completed Main Lab build design of one other group member, assigned in round-robin order within the participant's group, as a read-only view for conducting the risk review

### Requirement 14: Module 10 — Capstone

**User Story:** As a participant, I want to complete a team capstone that synthesises all course skills into a manager-ready deliverable, and create a personal AI use plan, so that I can demonstrate and plan ongoing AI competence.

#### Acceptance Criteria

1. WHEN Module 10 is unlocked, THE Platform SHALL display three activities: "Team Capstone Task", "Team Peer Review", and "Individual Close"
2. WHEN a participant opens the Team Capstone Task, THE Platform SHALL present a group activity with four sections displayed in fixed order — research output, draft document, visual asset, and presentation summary — where each section provides a text input area accepting up to 5,000 characters
3. THE Platform SHALL present the Team Peer Review with a rubric containing four dimensions — accuracy, clarity, visual quality, and completeness — each rated on a scale of 1 to 5, plus a free-text feedback field accepting up to 2,000 characters
4. IF the participant's group has not submitted all four capstone sections, THEN THE Platform SHALL disable the Team Peer Review activity for that group and display a message indicating that capstone submission is required before peer review
5. WHEN a participant opens the Individual Close, THE Platform SHALL present three labelled input areas — "Tools to Adopt", "Use Cases to Explore", and "Personal Guidelines" — each accepting up to 2,000 characters, and SHALL mark the activity complete only when all three fields contain at least 50 characters
6. THE Platform SHALL assign each group exactly one other group's capstone output for peer review within the same session, and SHALL grant read-only access to that output alongside the peer review rubric

### Requirement 15: Facilitator Dashboard

**User Story:** As a facilitator, I want a dashboard to monitor all groups' progress, manage module access, and oversee participant activity, so that I can effectively guide the course delivery.

#### Acceptance Criteria

1. THE Facilitator_Dashboard SHALL display a summary view showing all groups in the session with their current module, activity progress percentage, and number of participants who have submitted at least one response within the current session
2. THE Facilitator_Dashboard SHALL provide controls to lock and unlock each of the 10 modules individually, with all modules set to locked state by default at session creation
3. WHEN a group completes an activity, THE Facilitator_Dashboard SHALL update the progress indicator for that group within 2 seconds
4. THE Facilitator_Dashboard SHALL allow a facilitator to view the individual responses submitted by any group for any unlocked activity, including each participant's text inputs and selected choices
5. THE Facilitator_Dashboard SHALL provide a session-level overview showing total participants, total groups, and overall completion percentage
6. IF a facilitator locks a module while a group has incomplete activities in that module, THEN THE Facilitator_Dashboard SHALL prevent the group from submitting new responses in that module and SHALL display a notification to affected participants indicating that the module has been locked by the facilitator
7. IF a facilitator attempts to unlock a module, THEN THE Facilitator_Dashboard SHALL make all activities within that module accessible to all groups within 3 seconds of the unlock action

### Requirement 16: Export and Print Capabilities

**User Story:** As a participant, I want to export or print my completed work from any module, so that I have a permanent record of my learning outputs.

#### Acceptance Criteria

1. WHEN a participant requests an export, THE Platform SHALL generate an HTML document containing all submitted activity responses for the selected module within 10 seconds
2. THE Platform SHALL support export in print-friendly HTML format rendered as a single-column layout without interactive elements or navigation controls
3. THE Platform SHALL include group name, participant name, session name, and date in the exported document header
4. WHEN a facilitator requests a session export from the Facilitator_Dashboard, THE Platform SHALL generate a report containing all groups' submitted responses for the selected module, organized by group and then by activity order
5. THE Platform SHALL apply print-friendly CSS for browser-based printing that excludes UI navigation elements, background images, and non-content interactive components
6. IF the participant has no submitted activities for the selected module, THEN THE Platform SHALL display a message indicating that no completed work is available for export and SHALL not generate a document
7. IF export generation fails, THEN THE Platform SHALL display an error message indicating the failure and SHALL allow the participant to retry the export

### Requirement 17: Responsive Design and Accessibility

**User Story:** As a participant, I want to use the platform on any device including mobile phones and tablets, so that I can participate regardless of the device available to me.

#### Acceptance Criteria

1. THE Platform SHALL render all content and input fields on viewports from 320px width to 2560px width such that no horizontal scrolling is required to access any interactive element, all text remains visible without truncation of meaningful content, and all tap targets measure at least 44×44 CSS pixels
2. WHILE the viewport width is below 768px, THE Platform SHALL display cards in a single-column vertical stack, and WHILE the viewport width is 768px or above, THE Platform SHALL display cards in a multi-column grid layout
3. THE Platform SHALL meet WCAG 2.1 Level AA contrast requirements (minimum 4.5:1 ratio for normal text, 3:1 for large text and UI components) for all text and interactive elements
4. THE Platform SHALL support keyboard navigation such that all interactive elements are reachable via the Tab key in a logical reading order, activatable via Enter or Space keys, and display a visible focus indicator that meets a minimum 3:1 contrast ratio against adjacent colors
5. THE Platform SHALL use semantic HTML elements and ARIA attributes such that all form inputs have associated text labels, all non-decorative images have descriptive alt text, all page regions use landmark roles, and dynamic content updates are announced via ARIA live regions

### Requirement 18: Data Privacy and No Personal Data Collection

**User Story:** As a facilitator, I want the platform to avoid collecting personal data beyond display names, so that participant privacy is protected and no data governance burden is created.

#### Acceptance Criteria

1. THE Platform SHALL collect only display names as identifying information, where display names are free-form text between 1 and 50 characters chosen by participants with no requirement to use real names
2. THE Platform SHALL NOT require email addresses, phone numbers, or other personally identifiable information for access
3. THE Platform SHALL NOT use third-party analytics or tracking services that collect participant data, where participant data is defined as any information attributable to a specific participant including display names, votes, and responses
4. THE Platform SHALL store all session data exclusively in the Firebase_Database under the session's passcode namespace
5. WHEN a facilitator deletes a session, THE Platform SHALL remove all associated data from the Firebase_Database within 24 hours, including participant display names, votes, responses, and session configuration
6. WHEN a session ends or a participant leaves, THE Platform SHALL NOT persist participant-attributable data in client-side storage such as cookies or local storage beyond the active browser session

### Requirement 19: Visual Design and Status Indicators

**User Story:** As a participant, I want a clean, modern interface with clear visual indicators of progress and status, so that I can easily navigate the platform and understand my completion state.

#### Acceptance Criteria

1. THE Platform SHALL display each activity as an Activity_Card with a colour-coded status indicator: not started (grey) when the participant has not opened the activity, in progress (blue) when the participant has opened and interacted with the activity but not fulfilled all completion conditions, and completed (green) when all completion conditions for that activity are fulfilled
2. THE Platform SHALL display module-level progress as a percentage bar showing the proportion of completed activities within that module, rendered as a whole-number percentage from 0% to 100%
3. THE Platform SHALL apply a single defined colour scheme uniformly across all modules, activities, and platform pages
4. THE Platform SHALL display avatar indicators of group members currently viewing or editing an Activity_Card, updated within 5 seconds of a member joining or leaving, showing up to 5 individual avatars with a numeric count indicator for any additional members beyond 5


### Requirement 20: Embedded AI Chat Interface

**User Story:** As a participant, I want to access an AI chat panel alongside any activity, so that I can practise prompting and receive AI-generated responses in the context of my current exercise.

#### Acceptance Criteria

1. THE Platform SHALL display an AI_Chat panel that a participant can open alongside any unlocked activity, positioned adjacent to the activity content without obscuring interactive elements
2. WHEN a participant opens the AI_Chat panel, THE Platform SHALL automatically associate the chat context with the current module and activity the participant is viewing, including the module name and activity title
3. WHEN a participant submits a prompt in the AI_Chat panel, THE Platform SHALL send the prompt to the selected AI model and display the response in the chat thread within 30 seconds
4. THE Platform SHALL persist all AI_Chat messages (prompts and responses) per participant per session in the Firebase_Database, maintaining chronological order and associating each message with the participant identifier and session passcode
5. THE Platform SHALL allow participants to resize the AI_Chat panel width between 300px and 800px, minimise the panel to a collapsed icon, and expand the panel to its previous width, with the panel state persisting across activity navigation within the same browser session
6. WHEN a participant reopens the AI_Chat panel after minimising or navigating between activities, THE Platform SHALL restore the full chat history for that participant and session from the Firebase_Database

### Requirement 21: Multi-Model Selection

**User Story:** As a participant, I want to choose from multiple AI models when using the chat, so that I can compare how different models respond and learn about model differences.

#### Acceptance Criteria

1. THE Platform SHALL support the following six AI models for selection: GPT-4o, GPT-4o-mini, Claude Sonnet, Claude Haiku, Gemini Pro, and Gemini Flash
2. THE Platform SHALL display a model selection dropdown within the AI_Chat panel, listing only models that have valid API keys configured by the facilitator for the current session
3. WHEN a participant selects a different model from the dropdown, THE Platform SHALL use the newly selected model for all subsequent prompts in that chat session without clearing the existing chat history
4. THE Platform SHALL display the name of the model that generated each response directly adjacent to that response message in the chat thread
5. IF no models are available for the current session due to missing API key configuration, THEN THE Platform SHALL display a message in the AI_Chat panel indicating that no AI models are currently configured and prompt the participant to notify the facilitator

### Requirement 22: Facilitator API Key Configuration

**User Story:** As a facilitator, I want to configure API keys for each AI model provider per session, so that I can control which models are available and manage costs.

#### Acceptance Criteria

1. THE Facilitator_Dashboard SHALL provide a configuration interface for entering API keys for each Model_Provider (OpenAI, Anthropic, Google) per session, with separate input fields for each provider
2. THE Platform SHALL store API keys exclusively in server-side configuration within the Firebase_Database, encrypted at rest, and SHALL NOT transmit API keys to client-side code or expose them in browser network requests
3. WHEN a facilitator provides a valid API key for a Model_Provider, THE Platform SHALL enable all models associated with that provider (OpenAI: GPT-4o and GPT-4o-mini; Anthropic: Claude Sonnet and Claude Haiku; Google: Gemini Pro and Gemini Flash) for participant use within 5 seconds
4. THE Facilitator_Dashboard SHALL provide a toggle control for each individual model allowing the facilitator to disable a specific model without removing the associated API key
5. WHEN a facilitator disables a model that a participant currently has selected, THE Platform SHALL notify the participant that the model is no longer available and automatically switch the participant's selection to the first available model in the dropdown list
6. IF a facilitator removes an API key for a Model_Provider while participants are using models from that provider, THEN THE Platform SHALL immediately disable those models, notify affected participants, and prevent further prompts to those models

### Requirement 23: Personal Context Document

**User Story:** As a participant, I want to upload a personal context document that is included in all my AI prompts, so that I can personalise AI responses to my specific work context.

#### Acceptance Criteria

1. THE Platform SHALL allow each participant to upload one Context_Document in text (.txt), PDF (.pdf), or Markdown (.md) format per session
2. WHEN a participant uploads a Context_Document, THE Platform SHALL extract the text content and include the extracted text as context in all subsequent AI_Chat prompts sent by that participant, prepended to the user's prompt with a clear delimiter
3. THE Platform SHALL allow participants to view the extracted text of their current Context_Document, replace the document by uploading a new file, or remove the document entirely at any time during the session
4. THE Platform SHALL store the extracted text of each participant's Context_Document in the Firebase_Database under the participant's session namespace
5. IF a participant uploads a Context_Document whose extracted text exceeds 50 KB (51,200 characters), THEN THE Platform SHALL reject the upload, display an error message indicating the maximum allowed size of 50 KB of extracted text, and retain the previously uploaded document if one exists
6. IF a participant uploads a file in an unsupported format (not .txt, .pdf, or .md), THEN THE Platform SHALL reject the upload and display an error message listing the accepted file formats

### Requirement 24: Side-by-Side Model Comparison

**User Story:** As a participant, I want to send the same prompt to two models simultaneously and compare their responses side by side, so that I can understand how different models handle the same input.

#### Acceptance Criteria

1. THE Platform SHALL provide a "Compare" toggle within the AI_Chat panel that switches between single-model mode and comparison mode
2. WHEN comparison mode is active, THE Platform SHALL display two model selection dropdowns allowing the participant to select two different models from the available models configured for the session
3. WHEN a participant submits a prompt in comparison mode, THE Platform SHALL send the identical prompt text (including any Context_Document) to both selected models simultaneously and display both responses in a side-by-side layout with the model name clearly labelled above each response
4. IF a participant selects the same model in both comparison dropdowns, THEN THE Platform SHALL display a validation message indicating that two different models must be selected and SHALL prevent prompt submission until two distinct models are chosen
5. IF one of the two selected models fails to respond within 30 seconds or returns an error, THEN THE Platform SHALL display the successful response alongside an error indicator for the failed model, without blocking the display of the available response
6. THE Platform SHALL persist comparison responses in the AI_Chat history with both model responses stored as a single comparison entry, maintaining the side-by-side display when the history is reviewed

### Requirement 25: Token Usage Tracking

**User Story:** As a facilitator, I want to track and optionally limit token usage across the session, so that I can monitor costs and ensure fair resource distribution among participants.

#### Acceptance Criteria

1. THE Platform SHALL record the token count (input tokens plus output tokens) for each AI_Chat interaction and store the count per participant per session in the Firebase_Database
2. THE Facilitator_Dashboard SHALL display a token usage summary showing total tokens consumed per group and per individual participant, updated within 10 seconds of each AI_Chat interaction
3. THE Platform SHALL display the token count for each message (input tokens and output tokens separately) as a subtle text indicator below each AI_Chat response message
4. THE Facilitator_Dashboard SHALL provide an optional Token_Budget field where the facilitator can set a maximum total token count for the session, applicable to all participants collectively
5. WHEN the session's cumulative token usage reaches 80% of the configured Token_Budget, THE Platform SHALL display a warning notification to all participants indicating that the session is approaching its token limit
6. WHEN the session's cumulative token usage reaches 100% of the configured Token_Budget, THE Platform SHALL display a notification to all participants indicating that the token budget has been reached, and SHALL prevent further AI_Chat prompts until the facilitator increases or removes the budget
7. IF no Token_Budget is configured for the session, THEN THE Platform SHALL allow unlimited AI_Chat interactions without displaying budget-related warnings
