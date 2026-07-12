/**
 * DashboardView — Facilitator Dashboard
 *
 * Displays:
 *   - Session-level overview: total participants, total groups, overall completion %
 *   - All groups with current module, activity progress %, active participant count
 *   - Lock/unlock controls for each of the 10 modules (all locked by default)
 *   - Real-time updates via SyncEngine subscriptions (within 2 seconds)
 *   - Drill-down into individual group responses for unlocked activities
 *   - Session creation and deletion
 *   - Lock notifications to participants
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 1.5, 1.6, 18.5
 */

import { getAllModules, getActivity } from '../core/module-registry.js';
import { subscribe, immediateWrite } from '../core/sync-engine.js';
import { getActiveSession, setActiveSession, createSession, deleteSession } from '../core/session-manager.js';
import { createProgressBar } from '../components/progress-bar.js';
import { registerView, navigate } from '../core/router.js';
import { enterPreviewMode } from '../core/preview-mode.js';

// --- Internal State ---

/** @type {function[]} Active Firebase unsubscribe functions for cleanup */
let _unsubscribers = [];

/** @type {Map<string, boolean>} Lock state per module ID */
let _moduleLockStates = new Map();

/** @type {Map<string, object>} Group data: { members, memberCount } keyed by groupId */
let _groupsData = new Map();

/** @type {object|null} Activities data from Firebase */
let _activitiesData = null;

/** @type {HTMLElement|null} Reference to the overview section */
let _overviewContainer = null;

/** @type {HTMLElement|null} Reference to the groups section */
let _groupsContainer = null;

/** @type {HTMLElement|null} Reference to the module controls section */
let _moduleControlsContainer = null;

/** @type {string|null} Active session passcode */
let _passcode = null;

/** @type {HTMLElement|null} Reference to the drill-down panel */
let _drillDownPanel = null;

/** @type {HTMLElement|null} Reference to the session management section */
let _sessionMgmtContainer = null;

// --- View Lifecycle ---

/** @type {boolean} Whether facilitator has authenticated this browser session */
let _facilitatorAuthenticated = false;

/** Facilitator access code — change this for each deployment */
const FACILITATOR_ACCESS_CODE = 'FACILITATE2026';

/**
 * Render the Dashboard view into the app container.
 * @param {object} params - Route parameters (unused for this view)
 * @param {HTMLElement} container - The app container to render into
 */
function render(params, container) {
  // Cleanup any previous subscriptions
  _cleanup();

  // Check if facilitator is authenticated
  if (!_facilitatorAuthenticated) {
    // Check sessionStorage for persisted auth
    try {
      if (sessionStorage.getItem('aie_facilitator_auth') === 'true') {
        _facilitatorAuthenticated = true;
      }
    } catch {}
  }

  if (!_facilitatorAuthenticated) {
    _renderFacilitatorLogin(container);
    return;
  }

  const session = getActiveSession();
  _passcode = session ? session.passcode : null;

  container.innerHTML = '';

  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Facilitator Dashboard');
  section.className = 'container';

  // Heading
  const heading = document.createElement('h1');
  heading.textContent = 'Facilitator Dashboard';
  section.appendChild(heading);

  // Session management section (create/delete)
  const sessionMgmt = _createSessionManagementSection();
  _sessionMgmtContainer = sessionMgmt;
  section.appendChild(sessionMgmt);

  // Session overview section
  const overviewSection = document.createElement('div');
  overviewSection.className = 'dashboard-overview card mb-lg';
  overviewSection.setAttribute('aria-label', 'Session Overview');
  _overviewContainer = overviewSection;
  section.appendChild(overviewSection);

  // Module lock/unlock controls
  const moduleControlsHeading = document.createElement('h2');
  moduleControlsHeading.textContent = 'Module Controls';
  moduleControlsHeading.className = 'mt-lg mb-md';
  section.appendChild(moduleControlsHeading);

  const moduleControlsGrid = document.createElement('div');
  moduleControlsGrid.className = 'card-grid';
  moduleControlsGrid.setAttribute('aria-label', 'Module lock and unlock controls');
  _moduleControlsContainer = moduleControlsGrid;
  section.appendChild(moduleControlsGrid);

  // Groups progress section
  const groupsHeading = document.createElement('h2');
  groupsHeading.textContent = 'Groups';
  groupsHeading.className = 'mt-lg mb-md';
  section.appendChild(groupsHeading);

  const groupsGrid = document.createElement('div');
  groupsGrid.className = 'card-grid';
  groupsGrid.setAttribute('role', 'list');
  groupsGrid.setAttribute('aria-label', 'Group progress');
  _groupsContainer = groupsGrid;
  section.appendChild(groupsGrid);

  // Drill-down panel (hidden by default)
  _drillDownPanel = document.createElement('div');
  _drillDownPanel.className = 'dashboard-drilldown';
  _drillDownPanel.setAttribute('aria-label', 'Group responses drill-down');
  _drillDownPanel.hidden = true;
  section.appendChild(_drillDownPanel);

  container.appendChild(section);

  // Render initial states
  _renderOverview();
  _renderModuleControls();
  _renderGroups();

  // Subscribe to real-time updates if we have a session
  if (_passcode) {
    _subscribeToSessionData(_passcode);
  }
}

/**
 * Clean up subscriptions and internal state when leaving the view.
 */
function _cleanup() {
  _unsubscribers.forEach((unsub) => unsub());
  _unsubscribers = [];
  _moduleLockStates.clear();
  _groupsData.clear();
  _activitiesData = null;
  _overviewContainer = null;
  _groupsContainer = null;
  _moduleControlsContainer = null;
  _drillDownPanel = null;
  _sessionMgmtContainer = null;
  _passcode = null;
}

// --- Facilitator Login Gate ---

/**
 * Render a passcode form to authenticate the facilitator.
 * @param {HTMLElement} container
 */
function _renderFacilitatorLogin(container) {
  container.innerHTML = '';

  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Facilitator Login');
  section.className = 'container';
  section.style.maxWidth = '400px';
  section.style.margin = '80px auto';

  section.innerHTML = `
    <div class="card">
      <h1 class="card__title">Facilitator Access</h1>
      <p class="card__body">Enter the facilitator access code to manage sessions.</p>
      <form id="facilitator-login-form" novalidate>
        <div class="form-group">
          <label for="facilitator-code" class="form-label">Access Code</label>
          <input type="password" id="facilitator-code" class="form-input" 
                 placeholder="Enter facilitator access code" 
                 autocomplete="off" aria-required="true">
          <span id="facilitator-error" class="form-error" role="alert" aria-live="assertive"></span>
        </div>
        <button type="submit" class="btn btn--primary btn--full">Access Dashboard</button>
      </form>
    </div>
  `;

  container.appendChild(section);

  const form = section.querySelector('#facilitator-login-form');
  const input = section.querySelector('#facilitator-code');
  const errorEl = section.querySelector('#facilitator-error');

  requestAnimationFrame(() => input.focus());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim();

    if (code === FACILITATOR_ACCESS_CODE) {
      _facilitatorAuthenticated = true;
      try { sessionStorage.setItem('aie_facilitator_auth', 'true'); } catch {}
      render({}, container); // Re-render with full dashboard
    } else {
      errorEl.textContent = 'Invalid access code.';
      input.classList.add('form-input--error');
      input.focus();
    }
  });
}

// --- Firebase Subscriptions ---

/**
 * Subscribe to all relevant session data for real-time updates.
 * @param {string} passcode
 */
function _subscribeToSessionData(passcode) {
  // Subscribe to module lock states
  const modulesUnsub = subscribe(`/sessions/${passcode}/modules`, (data) => {
    if (data) {
      Object.keys(data).forEach((moduleId) => {
        const isLocked = data[moduleId] ? data[moduleId].locked !== false : true;
        _moduleLockStates.set(moduleId, isLocked);
      });
    }
    _renderModuleControls();
    _renderOverview();
  });
  _unsubscribers.push(modulesUnsub);

  // Subscribe to groups
  const groupsUnsub = subscribe(`/sessions/${passcode}/groups`, (data) => {
    _groupsData.clear();
    if (data) {
      Object.keys(data).forEach((groupId) => {
        _groupsData.set(groupId, data[groupId]);
      });
    }
    _renderGroups();
    _renderOverview();
  });
  _unsubscribers.push(groupsUnsub);

  // Subscribe to activities (for progress tracking)
  const activitiesUnsub = subscribe(`/sessions/${passcode}/activities`, (data) => {
    _activitiesData = data;
    _renderGroups();
    _renderOverview();
  });
  _unsubscribers.push(activitiesUnsub);
}

// --- Rendering ---

/**
 * Render the session-level overview: total participants, total groups, overall completion %.
 */
function _renderOverview() {
  if (!_overviewContainer) return;

  const totalGroups = _groupsData.size;
  let totalParticipants = 0;

  _groupsData.forEach((group) => {
    if (group.memberCount) {
      totalParticipants += group.memberCount;
    } else if (group.members) {
      totalParticipants += Object.keys(group.members).length;
    }
  });

  const completionPercentage = _calculateOverallCompletion();

  _overviewContainer.innerHTML = '';

  const overviewTitle = document.createElement('h2');
  overviewTitle.className = 'card__title';
  overviewTitle.textContent = 'Session Overview';
  _overviewContainer.appendChild(overviewTitle);

  const statsRow = document.createElement('div');
  statsRow.className = 'flex flex-wrap gap-lg mt-md';

  statsRow.appendChild(_createStatItem('Total Participants', totalParticipants));
  statsRow.appendChild(_createStatItem('Total Groups', totalGroups));
  statsRow.appendChild(_createStatItem('Overall Completion', `${completionPercentage}%`));

  _overviewContainer.appendChild(statsRow);

  // Overall progress bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'mt-md';
  const progressBar = createProgressBar(completionPercentage, 100, {
    ariaLabel: 'Overall session completion'
  });
  progressContainer.appendChild(progressBar);
  _overviewContainer.appendChild(progressContainer);
}

/**
 * Create a stat display item.
 * @param {string} label
 * @param {string|number} value
 * @returns {HTMLElement}
 */
function _createStatItem(label, value) {
  const item = document.createElement('div');
  item.className = 'dashboard-stat';

  const valueEl = document.createElement('span');
  valueEl.className = 'dashboard-stat__value';
  valueEl.textContent = String(value);
  valueEl.setAttribute('aria-label', `${label}: ${value}`);

  const labelEl = document.createElement('span');
  labelEl.className = 'dashboard-stat__label';
  labelEl.textContent = label;

  item.appendChild(valueEl);
  item.appendChild(labelEl);
  return item;
}

/**
 * Render module lock/unlock controls for all 10 modules.
 */
function _renderModuleControls() {
  if (!_moduleControlsContainer) return;

  _moduleControlsContainer.innerHTML = '';

  const modules = getAllModules();
  modules.forEach((moduleDef) => {
    const isLocked = _moduleLockStates.has(moduleDef.id)
      ? _moduleLockStates.get(moduleDef.id)
      : true;
    const card = _createModuleControlCard(moduleDef, isLocked);
    _moduleControlsContainer.appendChild(card);
  });
}

/**
 * Create a module control card with lock/unlock button.
 * @param {object} moduleDef
 * @param {boolean} isLocked
 * @returns {HTMLElement}
 */
function _createModuleControlCard(moduleDef, isLocked) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.moduleId = moduleDef.id;

  const header = document.createElement('div');
  header.className = 'card__header';

  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = moduleDef.title;
  header.appendChild(title);

  // Status badge
  const badge = document.createElement('span');
  badge.className = isLocked
    ? 'card__status-badge card__status-badge--not-started'
    : 'card__status-badge card__status-badge--completed';
  badge.textContent = isLocked ? 'Locked' : 'Unlocked';
  header.appendChild(badge);

  card.appendChild(header);

  // Lock/unlock button
  const body = document.createElement('div');
  body.className = 'card__body';

  const btn = document.createElement('button');
  btn.className = isLocked ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm';
  btn.textContent = isLocked ? 'Unlock Module' : 'Lock Module';
  btn.setAttribute('aria-label', isLocked
    ? `Unlock ${moduleDef.title}`
    : `Lock ${moduleDef.title}`);

  btn.addEventListener('click', () => {
    _toggleModuleLock(moduleDef.id, isLocked);
  });

  body.appendChild(btn);
  card.appendChild(body);

  return card;
}

/**
 * Toggle a module's lock state via SyncEngine immediateWrite.
 * When locking a module, also writes a lock notification event for participants.
 * @param {string} moduleId
 * @param {boolean} currentlyLocked
 */
function _toggleModuleLock(moduleId, currentlyLocked) {
  if (!_passcode) return;

  const newLocked = !currentlyLocked;
  const path = `/sessions/${_passcode}/modules/${moduleId}/locked`;
  immediateWrite(path, newLocked);

  // Also write the timestamp
  const timestampPath = newLocked
    ? `/sessions/${_passcode}/modules/${moduleId}/lockedAt`
    : `/sessions/${_passcode}/modules/${moduleId}/unlockedAt`;
  immediateWrite(timestampPath, Date.now());

  // When locking a module, write a lock notification event for affected participants
  if (newLocked) {
    const notificationPath = `/sessions/${_passcode}/modules/${moduleId}/lockNotification`;
    immediateWrite(notificationPath, {
      locked: true,
      lockedBy: 'facilitator',
      timestamp: Date.now(),
      message: 'This module has been locked by the facilitator. Your work has been saved.'
    });
  }
}

/**
 * Render all group cards with progress info.
 */
function _renderGroups() {
  if (!_groupsContainer) return;

  _groupsContainer.innerHTML = '';

  if (_groupsData.size === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'card__body';
    emptyMsg.textContent = 'No groups have joined this session yet.';
    _groupsContainer.appendChild(emptyMsg);
    return;
  }

  _groupsData.forEach((groupData, groupId) => {
    const card = _createGroupCard(groupId, groupData);
    _groupsContainer.appendChild(card);
  });
}

/**
 * Create a group progress card.
 * Includes a "View Responses" button that opens the drill-down panel.
 * @param {string} groupId
 * @param {object} groupData - { members, memberCount }
 * @returns {HTMLElement}
 */
function _createGroupCard(groupId, groupData) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'listitem');
  card.dataset.groupId = groupId;

  // Header with group name and participant count
  const header = document.createElement('div');
  header.className = 'card__header';

  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = groupId;
  header.appendChild(title);

  // Active participant count
  const participantCount = groupData.memberCount
    || (groupData.members ? Object.keys(groupData.members).length : 0);
  const countBadge = document.createElement('span');
  countBadge.className = 'card__status-badge card__status-badge--in-progress';
  countBadge.textContent = `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
  header.appendChild(countBadge);

  card.appendChild(header);

  // Body with module progress
  const body = document.createElement('div');
  body.className = 'card__body';

  // Current module (find the most recent unlocked module with activity)
  const currentModule = _getGroupCurrentModule(groupId);
  if (currentModule) {
    const moduleInfo = document.createElement('p');
    moduleInfo.innerHTML = `<strong>Current Module:</strong> ${currentModule}`;
    body.appendChild(moduleInfo);
  }

  // Activity progress percentage
  const { completed, total } = _getGroupActivityProgress(groupId);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progressLabel = document.createElement('p');
  progressLabel.className = 'mt-sm';
  progressLabel.innerHTML = `<strong>Progress:</strong> ${completed}/${total} activities (${percentage}%)`;
  body.appendChild(progressLabel);

  const progressBar = createProgressBar(completed, total, {
    ariaLabel: `${groupId} activity progress`
  });
  body.appendChild(progressBar);

  // View Responses button
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn btn--secondary btn--sm mt-sm';
  viewBtn.textContent = 'View Responses';
  viewBtn.setAttribute('aria-label', `View responses for ${groupId}`);
  viewBtn.addEventListener('click', () => {
    _openDrillDown(groupId);
  });
  body.appendChild(viewBtn);

  card.appendChild(body);

  return card;
}

/**
 * Determine which module a group is currently working on.
 * Uses the most recently active unlocked module with responses.
 * @param {string} groupId
 * @returns {string|null} Module title or null
 */
function _getGroupCurrentModule(groupId) {
  if (!_activitiesData) return null;

  const modules = getAllModules();

  // Find the last unlocked module that has responses from this group
  let currentModule = null;
  for (const moduleDef of modules) {
    const isLocked = _moduleLockStates.has(moduleDef.id)
      ? _moduleLockStates.get(moduleDef.id)
      : true;
    if (isLocked) continue;

    const moduleActivities = _activitiesData[moduleDef.id];
    if (!moduleActivities) continue;

    // Check if this group has any responses in this module
    for (const activityDef of moduleDef.activities) {
      const activityData = moduleActivities[activityDef.id];
      if (activityData && activityData.responses && activityData.responses[groupId]) {
        currentModule = moduleDef.title;
      }
    }
  }

  return currentModule;
}

/**
 * Get the completed/total activity counts for a group across all unlocked modules.
 * @param {string} groupId
 * @returns {{ completed: number, total: number }}
 */
function _getGroupActivityProgress(groupId) {
  const modules = getAllModules();
  let completed = 0;
  let total = 0;

  for (const moduleDef of modules) {
    const isLocked = _moduleLockStates.has(moduleDef.id)
      ? _moduleLockStates.get(moduleDef.id)
      : true;
    if (isLocked) continue;

    total += moduleDef.activities.length;

    if (_activitiesData && _activitiesData[moduleDef.id]) {
      for (const activityDef of moduleDef.activities) {
        const activityData = _activitiesData[moduleDef.id][activityDef.id];
        if (activityData && activityData.completion && activityData.completion[groupId]) {
          if (activityData.completion[groupId].status === 'completed') {
            completed++;
          }
        }
      }
    }
  }

  return { completed, total };
}

/**
 * Calculate overall session completion percentage across all groups and modules.
 * @returns {number} Percentage 0-100
 */
function _calculateOverallCompletion() {
  if (_groupsData.size === 0) return 0;

  const modules = getAllModules();
  let totalActivities = 0;
  let totalCompleted = 0;

  _groupsData.forEach((_, groupId) => {
    for (const moduleDef of modules) {
      const isLocked = _moduleLockStates.has(moduleDef.id)
        ? _moduleLockStates.get(moduleDef.id)
        : true;
      if (isLocked) continue;

      totalActivities += moduleDef.activities.length;

      if (_activitiesData && _activitiesData[moduleDef.id]) {
        for (const activityDef of moduleDef.activities) {
          const activityData = _activitiesData[moduleDef.id][activityDef.id];
          if (activityData && activityData.completion && activityData.completion[groupId]) {
            if (activityData.completion[groupId].status === 'completed') {
              totalCompleted++;
            }
          }
        }
      }
    }
  });

  if (totalActivities === 0) return 0;
  return Math.round((totalCompleted / totalActivities) * 100);
}

// --- Session Management ---

/**
 * Create the session management section with create and delete controls.
 * @returns {HTMLElement}
 */
function _createSessionManagementSection() {
  const section = document.createElement('div');
  section.className = 'dashboard-session-mgmt card mb-lg';
  section.setAttribute('aria-label', 'Session Management');

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = 'Session Management';
  section.appendChild(title);

  const body = document.createElement('div');
  body.className = 'card__body';

  // Create session form
  const createForm = document.createElement('form');
  createForm.className = 'dashboard-create-session';
  createForm.setAttribute('aria-label', 'Create new session');
  createForm.addEventListener('submit', (e) => e.preventDefault());

  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'create-session-name');
  nameLabel.className = 'field-label';
  nameLabel.textContent = 'Session Name';
  createForm.appendChild(nameLabel);

  const inputRow = document.createElement('div');
  inputRow.className = 'flex gap-sm mt-sm';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'create-session-name';
  nameInput.className = 'field-input';
  nameInput.placeholder = 'Enter session name...';
  nameInput.maxLength = 100;
  nameInput.setAttribute('aria-required', 'true');
  inputRow.appendChild(nameInput);

  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.className = 'btn btn--primary btn--sm';
  createBtn.textContent = 'Create Session';
  createBtn.addEventListener('click', () => {
    _handleCreateSession(nameInput);
  });
  inputRow.appendChild(createBtn);

  createForm.appendChild(inputRow);

  // Error/success message area
  const messageArea = document.createElement('div');
  messageArea.className = 'dashboard-session-message mt-sm';
  messageArea.setAttribute('role', 'status');
  messageArea.setAttribute('aria-live', 'polite');
  createForm.appendChild(messageArea);

  body.appendChild(createForm);

  // Delete session button (only shown if there's an active session)
  if (_passcode) {
    const deleteSection = document.createElement('div');
    deleteSection.className = 'mt-md';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn--danger btn--sm';
    deleteBtn.textContent = 'Delete Current Session';
    deleteBtn.setAttribute('aria-label', 'Delete the current session');
    deleteBtn.addEventListener('click', () => {
      _handleDeleteSession();
    });
    deleteSection.appendChild(deleteBtn);

    body.appendChild(deleteSection);
  }

  // Preview Content button
  const previewSection = document.createElement('div');
  previewSection.className = 'mt-md';
  previewSection.style.borderTop = '1px solid #e5e7eb';
  previewSection.style.paddingTop = '12px';

  const previewBtn = document.createElement('button');
  previewBtn.type = 'button';
  previewBtn.className = 'btn btn--secondary btn--sm';
  previewBtn.textContent = '📋 Preview Content';
  previewBtn.setAttribute('aria-label', 'Preview all modules and activities as a student');
  previewBtn.addEventListener('click', () => {
    enterPreviewMode();
  });
  previewSection.appendChild(previewBtn);

  const previewHint = document.createElement('p');
  previewHint.style.cssText = 'margin-top: 4px; font-size: 12px; color: #6b7280;';
  previewHint.textContent = 'Browse all modules and test activities without saving any data.';
  previewSection.appendChild(previewHint);

  body.appendChild(previewSection);

  section.appendChild(body);
  return section;
}

/**
 * Handle creating a new session.
 * @param {HTMLInputElement} nameInput - The session name input element
 */
async function _handleCreateSession(nameInput) {
  const sessionName = nameInput.value.trim();
  const messageArea = nameInput.closest('form').querySelector('.dashboard-session-message');

  if (!sessionName) {
    if (messageArea) {
      messageArea.textContent = 'Please enter a session name.';
      messageArea.className = 'dashboard-session-message mt-sm error-message';
    }
    nameInput.focus();
    return;
  }

  try {
    if (messageArea) {
      messageArea.textContent = 'Creating session...';
      messageArea.className = 'dashboard-session-message mt-sm';
    }

    const facilitatorId = 'facilitator-' + Date.now();
    const result = await createSession(facilitatorId, sessionName);

    // Set the active session
    setActiveSession({
      passcode: result.passcode,
      sessionName: sessionName,
      role: 'facilitator',
      facilitatorId: facilitatorId
    });

    if (messageArea) {
      messageArea.textContent = `Session created! Passcode: ${result.passcode}`;
      messageArea.className = 'dashboard-session-message mt-sm success-message';
    }

    // Clear the input
    nameInput.value = '';

    // Update passcode and re-subscribe
    _passcode = result.passcode;
    _subscribeToSessionData(_passcode);
    _renderOverview();
    _renderModuleControls();
    _renderGroups();

  } catch (err) {
    if (messageArea) {
      messageArea.textContent = err.message || 'Failed to create session.';
      messageArea.className = 'dashboard-session-message mt-sm error-message';
    }
  }
}

/**
 * Handle deleting the current session with confirmation dialog.
 */
function _handleDeleteSession() {
  if (!_passcode) return;

  // Create confirmation dialog
  const existingDialog = document.querySelector('.dashboard-confirm-dialog');
  if (existingDialog) existingDialog.remove();

  const overlay = document.createElement('div');
  overlay.className = 'dashboard-confirm-dialog';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'confirm-delete-title');

  const dialog = document.createElement('div');
  dialog.className = 'dashboard-confirm-dialog__content card';

  const dialogTitle = document.createElement('h3');
  dialogTitle.id = 'confirm-delete-title';
  dialogTitle.className = 'card__title';
  dialogTitle.textContent = 'Delete Session';
  dialog.appendChild(dialogTitle);

  const dialogBody = document.createElement('div');
  dialogBody.className = 'card__body';

  const message = document.createElement('p');
  message.textContent = `Are you sure you want to delete this session (${_passcode})? This will permanently remove all session data including participant responses.`;
  dialogBody.appendChild(message);

  const buttonRow = document.createElement('div');
  buttonRow.className = 'flex gap-sm mt-md';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn--secondary btn--sm';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
  });
  buttonRow.appendChild(cancelBtn);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn--danger btn--sm';
  confirmBtn.textContent = 'Delete Session';
  confirmBtn.addEventListener('click', async () => {
    try {
      await deleteSession(_passcode);
      setActiveSession(null);
      overlay.remove();
      navigate('#login');
    } catch (err) {
      message.textContent = `Error: ${err.message || 'Failed to delete session.'}`;
    }
  });
  buttonRow.appendChild(confirmBtn);

  dialogBody.appendChild(buttonRow);
  dialog.appendChild(dialogBody);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Focus the cancel button for accessibility
  cancelBtn.focus();
}

// --- Drill-Down Panel ---

/**
 * Open the drill-down panel to view a specific group's responses.
 * Shows responses for all unlocked activities.
 * @param {string} groupId
 */
function _openDrillDown(groupId) {
  if (!_drillDownPanel || !_passcode) return;

  _drillDownPanel.hidden = false;
  _drillDownPanel.innerHTML = '';

  // Header with close button
  const header = document.createElement('div');
  header.className = 'dashboard-drilldown__header';

  const title = document.createElement('h3');
  title.textContent = `Responses: ${groupId}`;
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn--secondary btn--sm';
  closeBtn.textContent = 'Close';
  closeBtn.setAttribute('aria-label', 'Close responses panel');
  closeBtn.addEventListener('click', () => {
    _closeDrillDown();
  });
  header.appendChild(closeBtn);

  _drillDownPanel.appendChild(header);

  // Content area for responses
  const content = document.createElement('div');
  content.className = 'dashboard-drilldown__content';

  const modules = getAllModules();
  let hasResponses = false;

  modules.forEach((moduleDef) => {
    const isLocked = _moduleLockStates.has(moduleDef.id)
      ? _moduleLockStates.get(moduleDef.id)
      : true;

    // Only show responses for unlocked activities (Req 15.4)
    if (isLocked) return;

    const moduleSection = document.createElement('div');
    moduleSection.className = 'dashboard-drilldown__module';

    const moduleTitle = document.createElement('h4');
    moduleTitle.textContent = moduleDef.title;
    moduleSection.appendChild(moduleTitle);

    // Show responses for each activity in this module
    moduleDef.activities.forEach((activityDef) => {
      const activityResponses = _getGroupActivityResponses(moduleDef.id, activityDef.id, groupId);
      if (!activityResponses) return;

      hasResponses = true;

      const activitySection = document.createElement('div');
      activitySection.className = 'dashboard-drilldown__activity card mb-sm';

      const activityTitle = document.createElement('h5');
      activityTitle.className = 'card__title';
      activityTitle.textContent = activityDef.title;
      activitySection.appendChild(activityTitle);

      const responsesList = document.createElement('dl');
      responsesList.className = 'dashboard-drilldown__responses';

      Object.entries(activityResponses).forEach(([fieldId, fieldData]) => {
        const dt = document.createElement('dt');
        dt.textContent = fieldId;
        responsesList.appendChild(dt);

        const dd = document.createElement('dd');
        if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
          dd.textContent = typeof fieldData.value === 'object'
            ? JSON.stringify(fieldData.value, null, 2)
            : String(fieldData.value);
          if (fieldData.updatedBy) {
            const meta = document.createElement('small');
            meta.className = 'dashboard-drilldown__meta';
            meta.textContent = ` (by: ${fieldData.updatedBy})`;
            dd.appendChild(meta);
          }
        } else {
          dd.textContent = typeof fieldData === 'object'
            ? JSON.stringify(fieldData, null, 2)
            : String(fieldData || '—');
        }
        responsesList.appendChild(dd);
      });

      activitySection.appendChild(responsesList);
      moduleSection.appendChild(activitySection);
    });

    if (moduleSection.querySelectorAll('.dashboard-drilldown__activity').length > 0) {
      content.appendChild(moduleSection);
    }
  });

  if (!hasResponses) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'mt-sm';
    emptyMsg.textContent = 'No responses submitted yet for unlocked activities.';
    content.appendChild(emptyMsg);
  }

  _drillDownPanel.appendChild(content);

  // Subscribe to real-time response updates for this group
  const responseSub = subscribe(`/sessions/${_passcode}/activities`, (data) => {
    _activitiesData = data;
    // Only re-render if the panel is still open for this group
    if (!_drillDownPanel.hidden && _drillDownPanel.querySelector('h3')?.textContent.includes(groupId)) {
      _openDrillDown(groupId);
    }
  });
  _unsubscribers.push(responseSub);
}

/**
 * Close the drill-down panel.
 */
function _closeDrillDown() {
  if (!_drillDownPanel) return;
  _drillDownPanel.hidden = true;
  _drillDownPanel.innerHTML = '';
}

/**
 * Get a specific group's responses for a specific activity.
 * @param {string} moduleId
 * @param {string} activityId
 * @param {string} groupId
 * @returns {object|null}
 */
function _getGroupActivityResponses(moduleId, activityId, groupId) {
  if (!_activitiesData) return null;
  const moduleData = _activitiesData[moduleId];
  if (!moduleData) return null;
  const activityData = moduleData[activityId];
  if (!activityData || !activityData.responses) return null;
  return activityData.responses[groupId] || null;
}

// --- Register with Router ---

registerView('dashboard', render);

// --- Exports (for testing) ---

export {
  render,
  _cleanup,
  _renderOverview,
  _renderModuleControls,
  _renderGroups,
  _createModuleControlCard,
  _createGroupCard,
  _toggleModuleLock,
  _getGroupCurrentModule,
  _getGroupActivityProgress,
  _calculateOverallCompletion,
  _createStatItem,
  _createSessionManagementSection,
  _handleCreateSession,
  _handleDeleteSession,
  _openDrillDown,
  _closeDrillDown,
  _getGroupActivityResponses
};

export default { render };
