/**
 * JoinView — Display name + Group selection
 *
 * Flow:
 *   1. Show form with display name and group ID inputs
 *   2. Inline validation with error messages
 *   3. Show existing groups list (from Firebase subscription) with member counts
 *   4. After entering group ID, show confirmation: "Group X has N members: [names]. Join?"
 *   5. On confirm: write to Firebase, set active participant state, navigate to #modules
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { registerView, navigate } from '../core/router.js';
import { validateDisplayName, validateGroupId } from '../core/validation.js';
import SyncEngine from '../core/sync-engine.js';

// --- Constants ---
const MAX_GROUP_SIZE = 8;

// --- Internal State ---
let _unsubscribeGroups = null;
let _groups = {};       // { groupId: { members: { pid: { displayName, joinedAt } }, memberCount } }
let _container = null;
let _confirmationGroupId = null; // Group ID currently in confirmation step

/**
 * Generate a unique participant ID (UUID v4-like).
 * @returns {string}
 */
function generateParticipantId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get the current session passcode from sessionStorage.
 * @returns {string|null}
 */
function getSessionPasscode() {
  try {
    return sessionStorage.getItem('aie_session_passcode');
  } catch {
    return null;
  }
}

/**
 * Render the JoinView into the app container.
 * @param {object} params - Route params (unused for #join)
 * @param {HTMLElement} container - The #app container element
 */
function render(params, container) {
  _container = container;
  _confirmationGroupId = null;
  _groups = {};

  container.innerHTML = `
    <section class="join-view" aria-label="Join Session">
      <div class="container">
        <h1 class="page-title">Join Your Group</h1>
        <p class="page-subtitle">Enter your display name and choose or create a group to get started.</p>

        <form id="join-form" class="join-form" novalidate>
          <div class="form-group">
            <label for="display-name" class="form-label form-label--required">
              Display Name
            </label>
            <input
              type="text"
              id="display-name"
              name="displayName"
              class="form-input"
              placeholder="Enter your display name"
              maxlength="50"
              autocomplete="off"
              required
              aria-describedby="display-name-hint display-name-error"
            />
            <span id="display-name-hint" class="form-hint">1–50 characters</span>
            <span id="display-name-error" class="form-error" role="alert" aria-live="polite"></span>
          </div>

          <div class="form-group">
            <label for="group-id" class="form-label form-label--required">
              Group Identifier
            </label>
            <input
              type="text"
              id="group-id"
              name="groupId"
              class="form-input"
              placeholder="Enter or select a group ID"
              maxlength="30"
              autocomplete="off"
              required
              aria-describedby="group-id-hint group-id-error"
            />
            <span id="group-id-hint" class="form-hint">1–30 alphanumeric characters (letters and numbers only)</span>
            <span id="group-id-error" class="form-error" role="alert" aria-live="polite"></span>
          </div>

          <button type="submit" id="join-submit-btn" class="btn btn--primary btn--full">
            Review &amp; Join Group
          </button>
        </form>

        <section id="existing-groups" class="existing-groups" aria-label="Existing Groups">
          <h2 class="section-title">Existing Groups</h2>
          <div id="groups-list" class="groups-list">
            <p class="groups-empty">No groups yet. Be the first to create one!</p>
          </div>
        </section>

        <div id="confirmation-panel" class="confirmation-panel" hidden aria-label="Group join confirmation">
          <!-- Populated dynamically -->
        </div>
      </div>
    </section>
  `;

  _attachEventListeners();
  _subscribeToGroups();
}

/**
 * Attach event listeners to the join form.
 */
function _attachEventListeners() {
  const form = document.getElementById('join-form');
  const displayNameInput = document.getElementById('display-name');
  const groupIdInput = document.getElementById('group-id');

  // Inline validation on blur
  displayNameInput.addEventListener('blur', () => {
    _validateDisplayNameField();
  });

  groupIdInput.addEventListener('blur', () => {
    _validateGroupIdField();
  });

  // Clear error on input
  displayNameInput.addEventListener('input', () => {
    const errorEl = document.getElementById('display-name-error');
    if (errorEl.textContent) {
      errorEl.textContent = '';
      displayNameInput.classList.remove('form-input--error');
    }
  });

  groupIdInput.addEventListener('input', () => {
    const errorEl = document.getElementById('group-id-error');
    if (errorEl.textContent) {
      errorEl.textContent = '';
      groupIdInput.classList.remove('form-input--error');
    }
    // Hide confirmation if group ID changes
    _hideConfirmation();
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    _handleFormSubmit();
  });
}

/**
 * Validate the display name field inline.
 * @returns {boolean}
 */
function _validateDisplayNameField() {
  const input = document.getElementById('display-name');
  const errorEl = document.getElementById('display-name-error');
  const result = validateDisplayName(input.value);

  if (!result.valid) {
    errorEl.textContent = result.error;
    input.classList.add('form-input--error');
    return false;
  }

  errorEl.textContent = '';
  input.classList.remove('form-input--error');
  return true;
}

/**
 * Validate the group ID field inline.
 * @returns {boolean}
 */
function _validateGroupIdField() {
  const input = document.getElementById('group-id');
  const errorEl = document.getElementById('group-id-error');
  const result = validateGroupId(input.value);

  if (!result.valid) {
    errorEl.textContent = result.error;
    input.classList.add('form-input--error');
    return false;
  }

  errorEl.textContent = '';
  input.classList.remove('form-input--error');
  return true;
}

/**
 * Handle form submission — validate, check capacity, show confirmation.
 */
function _handleFormSubmit() {
  const nameValid = _validateDisplayNameField();
  const groupValid = _validateGroupIdField();

  if (!nameValid || !groupValid) {
    // Focus first invalid field
    if (!nameValid) {
      document.getElementById('display-name').focus();
    } else {
      document.getElementById('group-id').focus();
    }
    return;
  }

  const groupId = document.getElementById('group-id').value.trim();
  const group = _groups[groupId];

  // Check group capacity
  if (group && group.memberCount >= MAX_GROUP_SIZE) {
    const errorEl = document.getElementById('group-id-error');
    errorEl.textContent = `This group is full (${MAX_GROUP_SIZE}/${MAX_GROUP_SIZE} members). Please choose a different group.`;
    document.getElementById('group-id').classList.add('form-input--error');
    document.getElementById('group-id').focus();
    return;
  }

  // Show confirmation step
  _showConfirmation(groupId);
}

/**
 * Show the confirmation panel with current group members.
 * @param {string} groupId
 */
function _showConfirmation(groupId) {
  _confirmationGroupId = groupId;
  const panel = document.getElementById('confirmation-panel');
  const displayName = document.getElementById('display-name').value.trim();
  const group = _groups[groupId];
  const memberCount = group ? group.memberCount : 0;
  const members = group && group.members ? Object.values(group.members) : [];
  const memberNames = members.map(m => m.displayName).filter(Boolean);

  let membersHtml = '';
  if (memberNames.length > 0) {
    membersHtml = `
      <p class="confirmation-members">
        <strong>Current members (${memberCount}):</strong>
        ${memberNames.join(', ')}
      </p>
    `;
  } else {
    membersHtml = `<p class="confirmation-members">This will be a new group with no current members.</p>`;
  }

  panel.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h3 class="card__title">Confirm Join</h3>
      </div>
      <div class="card__body">
        <p>You are about to join <strong>Group "${groupId}"</strong> as <strong>"${_escapeHtml(displayName)}"</strong>.</p>
        ${membersHtml}
      </div>
      <div class="card__footer">
        <button type="button" id="confirm-join-btn" class="btn btn--primary">
          Confirm &amp; Join
        </button>
        <button type="button" id="cancel-join-btn" class="btn btn--secondary">
          Cancel
        </button>
      </div>
    </div>
  `;

  panel.hidden = false;
  if (panel.scrollIntoView) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Attach confirmation button listeners
  document.getElementById('confirm-join-btn').addEventListener('click', _handleConfirmJoin);
  document.getElementById('cancel-join-btn').addEventListener('click', _hideConfirmation);

  // Focus the confirm button for accessibility
  document.getElementById('confirm-join-btn').focus();
}

/**
 * Hide the confirmation panel.
 */
function _hideConfirmation() {
  _confirmationGroupId = null;
  const panel = document.getElementById('confirmation-panel');
  if (panel) {
    panel.hidden = true;
    panel.innerHTML = '';
  }
}

/**
 * Handle confirm join — write participant data to Firebase and navigate.
 */
async function _handleConfirmJoin() {
  const passcode = getSessionPasscode();
  if (!passcode) {
    navigate('#login');
    return;
  }

  const displayName = document.getElementById('display-name').value.trim();
  const groupId = _confirmationGroupId;

  if (!groupId || !displayName) return;

  // Re-check capacity before writing
  const group = _groups[groupId];
  if (group && group.memberCount >= MAX_GROUP_SIZE) {
    _hideConfirmation();
    const errorEl = document.getElementById('group-id-error');
    errorEl.textContent = `This group just reached capacity (${MAX_GROUP_SIZE} members). Please choose a different group.`;
    document.getElementById('group-id').classList.add('form-input--error');
    return;
  }

  // Disable buttons while writing
  const confirmBtn = document.getElementById('confirm-join-btn');
  const cancelBtn = document.getElementById('cancel-join-btn');
  if (confirmBtn) confirmBtn.disabled = true;
  if (cancelBtn) cancelBtn.disabled = true;

  const participantId = generateParticipantId();
  const now = Date.now();

  try {
    // Write participant to group
    const memberPath = `/sessions/${passcode}/groups/${groupId}/members/${participantId}`;
    await SyncEngine.immediateWrite(memberPath, {
      displayName: displayName,
      joinedAt: now,
      lastSeen: now
    });

    // Update member count (increment)
    const countPath = `/sessions/${passcode}/groups/${groupId}/memberCount`;
    const currentCount = group ? group.memberCount : 0;
    await SyncEngine.immediateWrite(countPath, currentCount + 1);

    // Set active participant state in sessionStorage
    try {
      sessionStorage.setItem('aie_participant_id', participantId);
      sessionStorage.setItem('aie_display_name', displayName);
      sessionStorage.setItem('aie_group_id', groupId);
    } catch {
      // Storage unavailable — continue anyway
    }

    // Clean up subscription before navigating
    _cleanup();

    // Navigate to modules list
    navigate('#modules');
  } catch (err) {
    console.error('JoinView: Error joining group:', err);
    if (confirmBtn) confirmBtn.disabled = false;
    if (cancelBtn) cancelBtn.disabled = false;

    // Show error in confirmation panel
    const panel = document.getElementById('confirmation-panel');
    if (panel) {
      const errorMsg = document.createElement('p');
      errorMsg.className = 'form-error';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.textContent = 'Failed to join the group. Please try again.';
      panel.querySelector('.card__body').appendChild(errorMsg);
    }
  }
}

/**
 * Subscribe to the groups path in Firebase for real-time group data.
 */
function _subscribeToGroups() {
  const passcode = getSessionPasscode();
  if (!passcode) return;

  const groupsPath = `/sessions/${passcode}/groups`;
  _unsubscribeGroups = SyncEngine.subscribe(groupsPath, (value) => {
    _groups = value || {};
    _renderGroupsList();

    // If confirmation is showing, re-check capacity
    if (_confirmationGroupId) {
      const group = _groups[_confirmationGroupId];
      if (group && group.memberCount >= MAX_GROUP_SIZE) {
        _hideConfirmation();
        const errorEl = document.getElementById('group-id-error');
        if (errorEl) {
          errorEl.textContent = `Group "${_confirmationGroupId}" just reached capacity.`;
          document.getElementById('group-id').classList.add('form-input--error');
        }
      }
    }
  });
}

/**
 * Render the existing groups list.
 */
function _renderGroupsList() {
  const listEl = document.getElementById('groups-list');
  if (!listEl) return;

  const groupIds = Object.keys(_groups);

  if (groupIds.length === 0) {
    listEl.innerHTML = '<p class="groups-empty">No groups yet. Be the first to create one!</p>';
    return;
  }

  const groupCards = groupIds.map((groupId) => {
    const group = _groups[groupId];
    const memberCount = group.memberCount || 0;
    const members = group.members ? Object.values(group.members) : [];
    const memberNames = members.map(m => m.displayName).filter(Boolean);
    const isFull = memberCount >= MAX_GROUP_SIZE;

    return `
      <div class="card group-card ${isFull ? 'card--locked' : 'card--interactive'}"
           role="button"
           tabindex="${isFull ? '-1' : '0'}"
           aria-label="Group ${_escapeHtml(groupId)}, ${memberCount} of ${MAX_GROUP_SIZE} members${isFull ? ', full' : ''}"
           data-group-id="${_escapeHtml(groupId)}"
           ${isFull ? 'aria-disabled="true"' : ''}>
        <div class="card__header">
          <span class="card__title">${_escapeHtml(groupId)}</span>
          ${isFull
            ? '<span class="card__status-badge card__status-badge--not-started">Full</span>'
            : `<span class="card__status-badge card__status-badge--in-progress">${memberCount}/${MAX_GROUP_SIZE}</span>`
          }
        </div>
        <div class="card__body">
          ${memberNames.length > 0
            ? `<p class="group-members">${memberNames.map(n => _escapeHtml(n)).join(', ')}</p>`
            : '<p class="group-members group-members--empty">No members yet</p>'
          }
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = groupCards;

  // Add click/keyboard listeners to group cards for quick selection
  listEl.querySelectorAll('.group-card[data-group-id]').forEach((card) => {
    if (card.getAttribute('aria-disabled') === 'true') return;

    card.addEventListener('click', () => {
      _selectGroupFromCard(card.dataset.groupId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _selectGroupFromCard(card.dataset.groupId);
      }
    });
  });
}

/**
 * Select a group from clicking on a group card.
 * @param {string} groupId
 */
function _selectGroupFromCard(groupId) {
  const groupInput = document.getElementById('group-id');
  if (groupInput) {
    groupInput.value = groupId;
    // Clear any error
    const errorEl = document.getElementById('group-id-error');
    if (errorEl) errorEl.textContent = '';
    groupInput.classList.remove('form-input--error');

    // Scroll to and focus the display name if empty, otherwise the form submit
    const displayNameInput = document.getElementById('display-name');
    if (!displayNameInput.value.trim()) {
      displayNameInput.focus();
    } else {
      document.getElementById('join-submit-btn').focus();
    }
  }
}

/**
 * Clean up Firebase subscription.
 */
function _cleanup() {
  if (_unsubscribeGroups) {
    _unsubscribeGroups();
    _unsubscribeGroups = null;
  }
  _groups = {};
  _container = null;
  _confirmationGroupId = null;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = str;
    return div.innerHTML;
  }
  // Fallback for non-browser environments
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Register with Router ---
registerView('join', render);

// --- Exports (for testing) ---
export {
  render,
  generateParticipantId,
  _escapeHtml,
  MAX_GROUP_SIZE
};

export default { render };
