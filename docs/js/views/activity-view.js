/**
 * ActivityView — Dynamic activity form rendering
 *
 * Renders activity forms based on field definitions from ModuleRegistry.
 * Handles real-time sync via SyncEngine, read-only mode when module is locked,
 * presence indicators via AvatarGroup, and completion status computation.
 *
 * Routes: #activity/:moduleId/:activityId
 * Requirements: 2.3, 2.4, 2.6, 4.1, 4.2, 4.3, 17.4, 17.5
 */

import { getActivity } from '../core/module-registry.js';
import { subscribe, debouncedWrite, immediateWrite } from '../core/sync-engine.js';
import { getActiveSession } from '../core/session-manager.js';
import { validateField } from '../core/validation.js';
import { createAvatarGroup, updateAvatarGroup } from '../components/avatar-group.js';
import { getActivityStatus } from '../components/activity-card.js';
import { registerView, navigate } from '../core/router.js';
import { isPreviewMode } from '../core/preview-mode.js';

// --- Internal State ---

/** @type {function[]} Active Firebase unsubscribe functions */
let _unsubscribers = [];

/** @type {boolean} Whether the current module is locked (read-only) */
let _isReadOnly = false;

/** @type {object|null} Current activity definition */
let _activityDef = null;

/** @type {object} Current responses for this group/activity */
let _responses = {};

/** @type {string|null} Current module ID */
let _moduleId = null;

/** @type {string|null} Current activity ID */
let _activityId = null;

/** @type {HTMLElement|null} Reference to the form container */
let _formContainer = null;

/** @type {HTMLElement|null} Reference to the avatar group container */
let _avatarContainer = null;

/** @type {HTMLElement|null} Reference to the status element */
let _statusElement = null;

/** @type {HTMLElement|null} Reference to the read-only banner */
let _readOnlyBanner = null;

// --- View Lifecycle ---

/**
 * Render the Activity view into the app container.
 * @param {object} params - Route parameters { moduleId, activityId }
 * @param {HTMLElement} container - The app container to render into
 */
function render(params, container) {
  _cleanup();

  _moduleId = params.moduleId;
  _activityId = params.activityId;

  const session = getActiveSession();
  const passcode = session ? session.passcode : null;
  const groupId = session ? session.groupId : null;
  const participantId = session ? session.participantId : null;

  // Get activity definition from ModuleRegistry
  _activityDef = getActivity(_moduleId, _activityId);

  container.innerHTML = '';

  const section = document.createElement('section');
  section.setAttribute('aria-label', _activityDef ? _activityDef.title : 'Activity');

  // Back navigation
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Activity navigation');
  const backLink = document.createElement('a');
  backLink.href = '#modules';
  backLink.className = 'back-link';
  backLink.textContent = '← Back to Modules';
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('#modules');
  });
  nav.appendChild(backLink);
  section.appendChild(nav);

  // Activity header
  const header = document.createElement('header');
  header.className = 'activity-header';

  const title = document.createElement('h1');
  title.textContent = _activityDef ? _activityDef.title : 'Activity Not Found';
  header.appendChild(title);

  // Presence indicators (AvatarGroup)
  _avatarContainer = createAvatarGroup([]);
  _avatarContainer.className += ' activity-header__presence';
  header.appendChild(_avatarContainer);

  section.appendChild(header);

  // Read-only banner (hidden initially)
  _readOnlyBanner = document.createElement('div');
  _readOnlyBanner.className = 'activity-readonly-banner';
  _readOnlyBanner.setAttribute('role', 'alert');
  _readOnlyBanner.setAttribute('aria-live', 'assertive');
  _readOnlyBanner.textContent = 'This module is locked. Viewing in read-only mode.';
  _readOnlyBanner.hidden = true;
  section.appendChild(_readOnlyBanner);

  // Completion status indicator
  _statusElement = document.createElement('div');
  _statusElement.className = 'activity-status';
  _statusElement.setAttribute('aria-live', 'polite');
  section.appendChild(_statusElement);

  // Form container for dynamic fields
  _formContainer = document.createElement('form');
  _formContainer.className = 'activity-form';
  _formContainer.setAttribute('aria-label', 'Activity fields');
  _formContainer.addEventListener('submit', (e) => e.preventDefault());
  section.appendChild(_formContainer);

  container.appendChild(section);

  // If activity definition not found, show error
  if (!_activityDef) {
    _formContainer.innerHTML = '<p class="error-message">Activity not found.</p>';
    return;
  }

  // Render fields initially (empty state)
  // In preview mode, fields are interactive (not read-only)
  _renderFields(_activityDef, {}, false);

  // Subscribe to data if we have a session (skip in preview mode)
  if (isPreviewMode()) {
    // In preview mode: fields are interactive, no Firebase subscriptions,
    // read-only banner stays hidden, no presence updates
    return;
  }

  if (passcode && groupId) {
    _subscribeToLockState(passcode);
    _subscribeToResponses(passcode, groupId);
    _subscribeToPresence(passcode, participantId);
    _updatePresence(passcode, participantId);
  }
}

/**
 * Clean up subscriptions and internal state when leaving the view.
 */
function _cleanup() {
  _unsubscribers.forEach((unsub) => unsub());
  _unsubscribers = [];
  _isReadOnly = false;
  _activityDef = null;
  _responses = {};
  _moduleId = null;
  _activityId = null;
  _formContainer = null;
  _avatarContainer = null;
  _statusElement = null;
  _readOnlyBanner = null;
}

// --- Firebase Subscriptions ---

/**
 * Subscribe to the module's lock state.
 * @param {string} passcode
 */
function _subscribeToLockState(passcode) {
  const path = `/sessions/${passcode}/modules/${_moduleId}`;
  const unsub = subscribe(path, (data) => {
    const isLocked = data ? data.locked !== false : true;
    if (isLocked !== _isReadOnly) {
      _isReadOnly = isLocked;
      _onLockStateChanged(isLocked);
    }
  });
  _unsubscribers.push(unsub);
}

/**
 * Subscribe to group responses for this activity.
 * @param {string} passcode
 * @param {string} groupId
 */
function _subscribeToResponses(passcode, groupId) {
  const path = `/sessions/${passcode}/activities/${_moduleId}/${_activityId}/responses/${groupId}`;
  const unsub = subscribe(path, (data) => {
    _responses = data || {};
    _renderFields(_activityDef, _responses, _isReadOnly);
    _updateCompletionStatus();
  });
  _unsubscribers.push(unsub);
}

/**
 * Subscribe to presence data for group members on this activity.
 * @param {string} passcode
 * @param {string} participantId
 */
function _subscribeToPresence(passcode, participantId) {
  const path = `/sessions/${passcode}/presence`;
  const unsub = subscribe(path, (presenceData) => {
    if (!presenceData) {
      updateAvatarGroup(_avatarContainer, []);
      return;
    }

    // Find members currently on this activity (excluding self)
    const session = getActiveSession();
    const groupId = session ? session.groupId : null;
    const members = [];

    for (const [pid, pData] of Object.entries(presenceData)) {
      if (pid === participantId) continue;
      if (pData && pData.currentModule === _moduleId &&
          pData.currentActivity === _activityId &&
          pData.online !== false) {
        members.push({ displayName: pData.displayName || pid });
      }
    }

    updateAvatarGroup(_avatarContainer, members);
  });
  _unsubscribers.push(unsub);
}

/**
 * Update this participant's presence to reflect current activity.
 * @param {string} passcode
 * @param {string} participantId
 */
function _updatePresence(passcode, participantId) {
  if (!passcode || !participantId) return;
  const session = getActiveSession();
  const path = `/sessions/${passcode}/presence/${participantId}`;
  immediateWrite(path, {
    currentModule: _moduleId,
    currentActivity: _activityId,
    lastActive: Date.now(),
    online: true,
    displayName: session ? session.displayName : ''
  });
}

// --- Lock State Handling ---

/**
 * Handle lock state changes — switch between editable and read-only modes.
 * @param {boolean} isLocked
 */
function _onLockStateChanged(isLocked) {
  if (_readOnlyBanner) {
    _readOnlyBanner.hidden = !isLocked;
  }
  // Re-render fields in the appropriate mode
  if (_activityDef) {
    _renderFields(_activityDef, _responses, isLocked);
  }
}

// --- Completion Status ---

/**
 * Update the completion status display.
 */
function _updateCompletionStatus() {
  if (!_statusElement || !_activityDef) return;

  const status = getCompletionStatus(_activityDef, _responses);
  const labels = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  _statusElement.textContent = `Status: ${labels[status] || 'Not Started'}`;
  _statusElement.dataset.status = status;
}

// --- Field Change Handling ---

/**
 * Handle a field value change — debounce write to Firebase.
 * In preview mode, this is a no-op (nothing saves).
 * @param {string} fieldId
 * @param {*} value
 */
function _onFieldChange(fieldId, value) {
  if (_isReadOnly) return;

  // In preview mode, skip all Firebase writes
  if (isPreviewMode()) return;

  const session = getActiveSession();
  if (!session) return;

  const { passcode, groupId, participantId } = session;
  const path = `/sessions/${passcode}/activities/${_moduleId}/${_activityId}/responses/${groupId}/${fieldId}`;

  const payload = {
    value: value,
    updatedBy: participantId,
    updatedAt: Date.now()
  };

  debouncedWrite(path, payload);
}

// --- Dynamic Field Rendering ---

/**
 * Render all fields for an activity into the form container.
 * @param {object} activityDef - Activity definition
 * @param {object} responses - Current responses
 * @param {boolean} isReadOnly - Whether fields should be read-only
 */
function _renderFields(activityDef, responses, isReadOnly) {
  if (!_formContainer || !activityDef) return;

  _formContainer.innerHTML = '';

  // Handle activities with categories (e.g., checklists)
  if (Array.isArray(activityDef.categories)) {
    activityDef.categories.forEach((category) => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'activity-fieldset';

      const legend = document.createElement('legend');
      legend.textContent = category.title || category.id;
      fieldset.appendChild(legend);

      if (Array.isArray(category.items)) {
        category.items.forEach((item) => {
          const el = _renderChecklistItem(item, responses, isReadOnly);
          fieldset.appendChild(el);
        });
      }

      _formContainer.appendChild(fieldset);
    });
  }

  // Handle activities with fields array
  if (Array.isArray(activityDef.fields)) {
    activityDef.fields.forEach((field) => {
      const el = _renderFieldByType(field, responses, isReadOnly);
      _formContainer.appendChild(el);
    });
  }
}

/**
 * Render a single field based on its type.
 * @param {object} field - Field definition
 * @param {object} responses - Current responses
 * @param {boolean} isReadOnly
 * @returns {HTMLElement}
 */
function _renderFieldByType(field, responses, isReadOnly) {
  switch (field.type) {
    case 'text':
      return _renderTextField(field, responses, isReadOnly);
    case 'textarea':
      return _renderTextareaField(field, responses, isReadOnly);
    case 'checklist':
      return _renderChecklistField(field, responses, isReadOnly);
    case 'select':
      return _renderSelectField(field, responses, isReadOnly);
    case 'rating':
      return _renderRatingField(field, responses, isReadOnly);
    case 'structured_table':
      return _renderStructuredTable(field, responses, isReadOnly);
    case 'readonly_display':
      return _renderReadonlyDisplay(field);
    case 'file_upload':
      // Placeholder — handled in task 8.2
      return _renderFileUploadPlaceholder(field);
    default:
      return _renderTextField(field, responses, isReadOnly);
  }
}

/**
 * Get the current value from responses for a field.
 * @param {string} fieldId
 * @param {object} responses
 * @returns {*}
 */
function _getFieldValue(fieldId, responses) {
  const data = responses[fieldId];
  if (!data) return '';
  if (typeof data === 'object' && 'value' in data) return data.value;
  return data;
}

/**
 * Create a field wrapper with label and error area.
 * @param {object} field - Field definition
 * @returns {{ wrapper: HTMLElement, errorEl: HTMLElement }}
 */
function _createFieldWrapper(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-group';
  wrapper.dataset.fieldId = field.id;

  const label = document.createElement('label');
  label.className = 'field-label';
  label.setAttribute('for', `field-${field.id}`);
  label.textContent = field.label || field.id;
  if (field.required !== false && field.minLength > 0) {
    const required = document.createElement('span');
    required.className = 'field-required';
    required.setAttribute('aria-hidden', 'true');
    required.textContent = ' *';
    label.appendChild(required);
  }
  wrapper.appendChild(label);

  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.id = `field-${field.id}-error`;
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.hidden = true;

  return { wrapper, errorEl };
}

/**
 * Show or hide a validation error on a field.
 * @param {HTMLElement} errorEl
 * @param {object} validation - { valid, error }
 * @param {HTMLElement} inputEl
 */
function _showValidationState(errorEl, validation, inputEl) {
  if (validation.valid) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    if (inputEl) inputEl.setAttribute('aria-invalid', 'false');
  } else {
    errorEl.hidden = false;
    errorEl.textContent = validation.error || 'Invalid input';
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
  }
}

// --- Field Renderers ---

/**
 * Render a text input field.
 */
function _renderTextField(field, responses, isReadOnly) {
  const { wrapper, errorEl } = _createFieldWrapper(field);
  const value = _getFieldValue(field.id, responses);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = `field-${field.id}`;
  input.name = field.id;
  input.className = 'field-input';
  input.value = value || '';
  input.setAttribute('aria-describedby', errorEl.id);

  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.placeholder) input.placeholder = field.placeholder;
  if (isReadOnly) {
    input.readOnly = true;
    input.setAttribute('aria-readonly', 'true');
  }

  input.addEventListener('input', () => {
    if (isReadOnly) return;
    const rules = _getValidationRules(field);
    const validation = validateField(input.value, rules);
    _showValidationState(errorEl, validation, input);
    _onFieldChange(field.id, input.value);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(errorEl);
  return wrapper;
}

/**
 * Render a textarea field.
 */
function _renderTextareaField(field, responses, isReadOnly) {
  const { wrapper, errorEl } = _createFieldWrapper(field);
  const value = _getFieldValue(field.id, responses);

  const textarea = document.createElement('textarea');
  textarea.id = `field-${field.id}`;
  textarea.name = field.id;
  textarea.className = 'field-textarea';
  textarea.value = value || '';
  textarea.setAttribute('aria-describedby', errorEl.id);
  textarea.rows = 4;

  if (field.maxLength) textarea.maxLength = field.maxLength;
  if (field.placeholder) textarea.placeholder = field.placeholder;
  if (isReadOnly) {
    textarea.readOnly = true;
    textarea.setAttribute('aria-readonly', 'true');
  }

  textarea.addEventListener('input', () => {
    if (isReadOnly) return;
    const rules = _getValidationRules(field);
    const validation = validateField(textarea.value, rules);
    _showValidationState(errorEl, validation, textarea);
    _onFieldChange(field.id, textarea.value);
  });

  wrapper.appendChild(textarea);
  wrapper.appendChild(errorEl);
  return wrapper;
}

/**
 * Render a checklist item (single checkbox).
 */
function _renderChecklistItem(item, responses, isReadOnly) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-group field-group--checkbox';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = `field-${item.id}`;
  input.name = item.id;
  input.className = 'field-checkbox';
  input.checked = _getFieldValue(item.id, responses) === true;

  if (isReadOnly) {
    input.disabled = true;
    input.setAttribute('aria-readonly', 'true');
  }

  input.addEventListener('change', () => {
    if (isReadOnly) return;
    _onFieldChange(item.id, input.checked);
  });

  const label = document.createElement('label');
  label.setAttribute('for', `field-${item.id}`);
  label.className = 'field-label field-label--checkbox';
  label.textContent = item.label || item.title || item.id;

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  return wrapper;
}

/**
 * Render a checklist field (multiple checkboxes grouped together).
 */
function _renderChecklistField(field, responses, isReadOnly) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field-group field-group--checklist';
  wrapper.dataset.fieldId = field.id;

  const legend = document.createElement('legend');
  legend.className = 'field-label';
  legend.textContent = field.label || field.id;
  wrapper.appendChild(legend);

  const items = field.items || field.options || [];
  items.forEach((item) => {
    const itemObj = typeof item === 'string' ? { id: item, label: item } : item;
    const el = _renderChecklistItem(itemObj, responses, isReadOnly);
    wrapper.appendChild(el);
  });

  return wrapper;
}

/**
 * Render a select field (dropdown or radio buttons).
 */
function _renderSelectField(field, responses, isReadOnly) {
  const { wrapper, errorEl } = _createFieldWrapper(field);
  const value = _getFieldValue(field.id, responses);
  const options = field.options || [];

  const select = document.createElement('select');
  select.id = `field-${field.id}`;
  select.name = field.id;
  select.className = 'field-select';
  select.setAttribute('aria-describedby', errorEl.id);

  if (isReadOnly) {
    select.disabled = true;
    select.setAttribute('aria-readonly', 'true');
  }

  // Default empty option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- Select --';
  defaultOpt.disabled = true;
  defaultOpt.selected = !value;
  select.appendChild(defaultOpt);

  options.forEach((opt) => {
    const option = document.createElement('option');
    const optValue = typeof opt === 'string' ? opt : opt.value || opt.id;
    const optLabel = typeof opt === 'string' ? opt : opt.label || opt.value || opt.id;
    option.value = optValue;
    option.textContent = optLabel;
    option.selected = value === optValue;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    if (isReadOnly) return;
    _onFieldChange(field.id, select.value);
  });

  wrapper.appendChild(select);
  wrapper.appendChild(errorEl);
  return wrapper;
}

/**
 * Render a rating field (number scale).
 */
function _renderRatingField(field, responses, isReadOnly) {
  const { wrapper, errorEl } = _createFieldWrapper(field);
  const value = _getFieldValue(field.id, responses);
  const min = field.min || 1;
  const max = field.max || 5;

  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'field-rating';
  ratingContainer.setAttribute('role', 'radiogroup');
  ratingContainer.setAttribute('aria-labelledby', `field-${field.id}-label`);

  // Update the label to use an ID for aria-labelledby
  const label = wrapper.querySelector('.field-label');
  if (label) label.id = `field-${field.id}-label`;

  for (let i = min; i <= max; i++) {
    const radioWrapper = document.createElement('span');
    radioWrapper.className = 'field-rating__option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `field-${field.id}`;
    radio.id = `field-${field.id}-${i}`;
    radio.value = String(i);
    radio.checked = Number(value) === i;
    radio.className = 'field-rating__radio';

    if (isReadOnly) {
      radio.disabled = true;
    }

    radio.addEventListener('change', () => {
      if (isReadOnly) return;
      _onFieldChange(field.id, Number(radio.value));
    });

    const radioLabel = document.createElement('label');
    radioLabel.setAttribute('for', `field-${field.id}-${i}`);
    radioLabel.className = 'field-rating__label';
    radioLabel.textContent = String(i);
    radioLabel.title = `${i} of ${max}`;

    radioWrapper.appendChild(radio);
    radioWrapper.appendChild(radioLabel);
    ratingContainer.appendChild(radioWrapper);
  }

  wrapper.appendChild(ratingContainer);
  wrapper.appendChild(errorEl);
  return wrapper;
}

/**
 * Render a structured table field (dynamic rows).
 */
function _renderStructuredTable(field, responses, isReadOnly) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-group field-group--table';
  wrapper.dataset.fieldId = field.id;

  const label = document.createElement('label');
  label.className = 'field-label';
  label.textContent = field.label || field.id;
  wrapper.appendChild(label);

  const columns = field.columns || [];
  const tableData = _getFieldValue(field.id, responses);
  const rows = Array.isArray(tableData) ? tableData : [];

  const table = document.createElement('table');
  table.className = 'field-table';
  table.setAttribute('aria-label', field.label || field.id);

  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((col) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = col.label || col.id;
    headerRow.appendChild(th);
  });
  if (!isReadOnly) {
    const actionTh = document.createElement('th');
    actionTh.scope = 'col';
    actionTh.textContent = 'Actions';
    headerRow.appendChild(actionTh);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');
  rows.forEach((row, rowIndex) => {
    const tr = _createTableRow(field, columns, row, rowIndex, isReadOnly);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);

  // Add row button
  if (!isReadOnly) {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--secondary btn--small';
    addBtn.textContent = '+ Add Row';
    addBtn.setAttribute('aria-label', `Add row to ${field.label || field.id}`);
    addBtn.addEventListener('click', () => {
      const newRows = [...rows, {}];
      _onFieldChange(field.id, newRows);
    });
    wrapper.appendChild(addBtn);
  }

  return wrapper;
}

/**
 * Create a single table row with inputs for each column.
 * @param {object} field - Table field definition
 * @param {Array} columns - Column definitions
 * @param {object} rowData - Data for this row
 * @param {number} rowIndex - Row index
 * @param {boolean} isReadOnly
 * @returns {HTMLElement}
 */
function _createTableRow(field, columns, rowData, rowIndex, isReadOnly) {
  const tr = document.createElement('tr');

  columns.forEach((col) => {
    const td = document.createElement('td');
    const cellValue = rowData && rowData[col.id] ? rowData[col.id] : '';

    if (isReadOnly) {
      td.textContent = cellValue;
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'field-input field-input--table-cell';
      input.value = cellValue;
      input.setAttribute('aria-label', `${col.label || col.id}, row ${rowIndex + 1}`);
      if (col.maxLength) input.maxLength = col.maxLength;

      input.addEventListener('input', () => {
        const tableData = _getFieldValue(field.id, _responses);
        const currentRows = Array.isArray(tableData) ? [...tableData] : [];
        if (!currentRows[rowIndex]) currentRows[rowIndex] = {};
        currentRows[rowIndex] = { ...currentRows[rowIndex], [col.id]: input.value };
        _onFieldChange(field.id, currentRows);
      });

      td.appendChild(input);
    }
    tr.appendChild(td);
  });

  // Remove button for editable rows
  if (!isReadOnly) {
    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--danger btn--small';
    removeBtn.textContent = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove row ${rowIndex + 1}`);
    removeBtn.addEventListener('click', () => {
      const tableData = _getFieldValue(field.id, _responses);
      const currentRows = Array.isArray(tableData) ? [...tableData] : [];
      currentRows.splice(rowIndex, 1);
      _onFieldChange(field.id, currentRows);
    });
    actionTd.appendChild(removeBtn);
    tr.appendChild(actionTd);
  }

  return tr;
}

/**
 * Render a readonly display field (static content).
 */
function _renderReadonlyDisplay(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-group field-group--readonly';
  wrapper.dataset.fieldId = field.id;

  if (field.label) {
    const label = document.createElement('h3');
    label.className = 'field-label';
    label.textContent = field.label;
    wrapper.appendChild(label);
  }

  const content = document.createElement('div');
  content.className = 'field-readonly-content';
  content.innerHTML = field.content || '';
  wrapper.appendChild(content);

  return wrapper;
}

/**
 * Render a file upload placeholder (handled in task 8.2).
 */
function _renderFileUploadPlaceholder(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-group field-group--file-upload';
  wrapper.dataset.fieldId = field.id;

  if (field.label) {
    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = field.label;
    wrapper.appendChild(label);
  }

  const placeholder = document.createElement('div');
  placeholder.className = 'field-file-placeholder';
  placeholder.textContent = 'File upload will be available soon.';
  placeholder.setAttribute('aria-label', `${field.label || field.id} - file upload coming soon`);
  wrapper.appendChild(placeholder);

  return wrapper;
}

// --- Validation Helpers ---

/**
 * Extract validation rules from a field definition for use with validateField.
 * @param {object} field
 * @returns {object}
 */
function _getValidationRules(field) {
  const rules = {};
  if (field.minLength != null) rules.minLength = field.minLength;
  if (field.maxLength != null) rules.maxLength = field.maxLength;
  if (field.required !== undefined) rules.required = field.required;
  if (field.pattern) rules.pattern = field.pattern;
  if (field.min != null) rules.min = field.min;
  if (field.max != null) rules.max = field.max;
  return rules;
}

// --- Public API ---

/**
 * Validate a field value against its rules.
 * @param {string} fieldId
 * @param {*} value
 * @param {object} rules
 * @returns {{ valid: boolean, error?: string }}
 */
function activityValidateField(fieldId, value, rules) {
  return validateField(value, rules);
}

/**
 * Compute the completion status of an activity given its definition and responses.
 * @param {object} activityDef - Activity definition
 * @param {object} responses - Current responses
 * @returns {'not_started'|'in_progress'|'completed'}
 */
function getCompletionStatus(activityDef, responses) {
  return getActivityStatus(activityDef, responses);
}

// --- Register with Router ---

registerView('activity', render);

// --- Exports ---

export {
  render,
  activityValidateField as validateField,
  getCompletionStatus,
  _cleanup,
  _renderFields,
  _renderFieldByType,
  _renderTextField,
  _renderTextareaField,
  _renderChecklistItem,
  _renderChecklistField,
  _renderSelectField,
  _renderRatingField,
  _renderStructuredTable,
  _renderReadonlyDisplay,
  _renderFileUploadPlaceholder,
  _getFieldValue,
  _onFieldChange,
  _getValidationRules,
  _createFieldWrapper
};

const ActivityView = {
  render,
  validateField: activityValidateField,
  getCompletionStatus
};

export default ActivityView;
