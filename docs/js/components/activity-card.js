/**
 * ActivityCard Component
 *
 * Renders an interactive card representing a single activity with colour-coded
 * status indicators. Status is computed from the activity's completion conditions
 * and participant responses.
 *
 * Requirements: 19.1, 17.4
 * Validates: Property 14 (Activity card status reflects correct state)
 */

/**
 * Determine the status of an activity based on its definition and responses.
 *
 * Status logic:
 * - "not_started": no interaction has occurred (no responses for the activity)
 * - "completed": all completion conditions for the activity are met
 * - "in_progress": anything between not_started and completed
 *
 * @param {object} activityDef - Activity definition from ModuleRegistry
 * @param {object} responses - Response data for this activity (keyed by fieldId)
 * @returns {'not_started'|'in_progress'|'completed'} The computed status
 */
export function getActivityStatus(activityDef, responses) {
  if (!activityDef) return 'not_started';
  if (!responses || typeof responses !== 'object') return 'not_started';

  // Check if there are any responses at all
  const hasAnyResponse = _hasAnyResponse(activityDef, responses);
  if (!hasAnyResponse) return 'not_started';

  // Check if all completion conditions are met
  const isComplete = _checkCompletion(activityDef, responses);
  if (isComplete) return 'completed';

  return 'in_progress';
}

/**
 * Create an ActivityCard DOM element.
 *
 * @param {object} activityDef - Activity definition from ModuleRegistry
 * @param {object} responses - Response data for this activity (keyed by fieldId)
 * @param {object} [options] - Additional options
 * @param {function} [options.onClick] - Click handler (receives activityDef)
 * @param {string} [options.href] - Navigation target (hash route)
 * @returns {HTMLElement} The card element
 */
export function createActivityCard(activityDef, responses, options = {}) {
  const status = getActivityStatus(activityDef, responses);
  const statusLabel = _getStatusLabel(status);

  // Create the card container
  const card = document.createElement('div');
  card.className = `card card--interactive card--${status.replace('_', '-')}`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${activityDef.title} — ${statusLabel}`);
  card.dataset.activityId = activityDef.id;
  card.dataset.status = status;

  // Card header with title and status badge
  const header = document.createElement('div');
  header.className = 'card__header';

  const title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = activityDef.title;

  const badge = document.createElement('span');
  badge.className = `card__status-badge card__status-badge--${status.replace('_', '-')}`;
  badge.textContent = statusLabel;
  badge.setAttribute('aria-hidden', 'true'); // Status is already in card aria-label

  header.appendChild(title);
  header.appendChild(badge);
  card.appendChild(header);

  // Card body with description if available
  if (activityDef.description) {
    const body = document.createElement('div');
    body.className = 'card__body';
    const desc = document.createElement('p');
    desc.textContent = activityDef.description;
    body.appendChild(desc);
    card.appendChild(body);
  }

  // Wire up click handler
  const handleActivation = () => {
    if (options.onClick) {
      options.onClick(activityDef);
    } else if (options.href) {
      window.location.hash = options.href;
    }
  };

  card.addEventListener('click', handleActivation);

  // Keyboard activation: Enter or Space
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivation();
    }
  });

  return card;
}

// --- Private helpers ---

/**
 * Check if any response exists for the activity.
 * @param {object} activityDef
 * @param {object} responses
 * @returns {boolean}
 * @private
 */
function _hasAnyResponse(activityDef, responses) {
  const fieldIds = _getFieldIds(activityDef);

  // For structured entries, check the entries array
  if (activityDef.completionRule === 'min_entries_filled') {
    if (Array.isArray(responses.entries) && responses.entries.length > 0) {
      return true;
    }
  }

  // For select_exactly, check the selections array
  if (activityDef.completionRule === 'select_exactly') {
    if (Array.isArray(responses.selections) && responses.selections.length > 0) {
      return true;
    }
  }

  // Check if any known field has a response
  if (fieldIds.length > 0) {
    const hasFieldResponse = fieldIds.some(fieldId => {
      const val = responses[fieldId];
      return _hasValue(val);
    });
    if (hasFieldResponse) return true;
  }

  // Fallback: check if responses object has any keys with values
  return Object.keys(responses).some(key => {
    const val = responses[key];
    return _hasValue(val);
  });
}

/**
 * Check whether all completion conditions are met.
 * @param {object} activityDef
 * @param {object} responses
 * @returns {boolean}
 * @private
 */
function _checkCompletion(activityDef, responses) {
  const completionRule = activityDef.completionRule || 'all_fields_filled';

  switch (completionRule) {
    case 'all_checked':
      return _checkAllChecked(activityDef, responses);

    case 'min_entries_filled':
      return _checkMinEntries(activityDef, responses);

    case 'select_exactly':
      return _checkSelectExactly(activityDef, responses);

    case 'all_fields_filled':
    default:
      return _checkAllFieldsFilled(activityDef, responses);
  }
}

/**
 * Completion rule: all checklist items must be checked.
 * @private
 */
function _checkAllChecked(activityDef, responses) {
  if (!Array.isArray(activityDef.categories)) return false;

  for (const category of activityDef.categories) {
    if (!Array.isArray(category.items)) continue;
    for (const item of category.items) {
      if (!responses[item.id] || responses[item.id] !== true) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Completion rule: minimum number of structured entries are filled.
 * @private
 */
function _checkMinEntries(activityDef, responses) {
  const minEntries = activityDef.minEntries || 1;
  const entries = responses.entries;

  if (!Array.isArray(entries)) return false;

  // Count entries where all required fields have content
  const fields = activityDef.fields || [];
  const filledEntries = entries.filter(entry => {
    if (!entry || typeof entry !== 'object') return false;
    return fields.every(field => _hasValue(entry[field.id]));
  });

  return filledEntries.length >= minEntries;
}

/**
 * Completion rule: exactly N items must be selected.
 * @private
 */
function _checkSelectExactly(activityDef, responses) {
  const requiredCount = activityDef.selectCount || 2;
  const selections = responses.selections;

  if (!Array.isArray(selections)) return false;
  return selections.length === requiredCount;
}

/**
 * Completion rule: all fields must have a non-empty value.
 * @private
 */
function _checkAllFieldsFilled(activityDef, responses) {
  const fieldIds = _getFieldIds(activityDef);
  if (fieldIds.length === 0) return false;

  return fieldIds.every(fieldId => _hasValue(responses[fieldId]));
}

/**
 * Get all field IDs from an activity definition.
 * @param {object} activityDef
 * @returns {string[]}
 * @private
 */
function _getFieldIds(activityDef) {
  const ids = [];

  // Fields directly on the activity
  if (Array.isArray(activityDef.fields)) {
    for (const field of activityDef.fields) {
      if (field.id) ids.push(field.id);
    }
  }

  // Fields in categories (checklist items)
  if (Array.isArray(activityDef.categories)) {
    for (const category of activityDef.categories) {
      if (Array.isArray(category.items)) {
        for (const item of category.items) {
          if (item.id) ids.push(item.id);
        }
      }
      if (Array.isArray(category.fields)) {
        for (const field of category.fields) {
          if (field.id) ids.push(field.id);
        }
      }
    }
  }

  return ids;
}

/**
 * Check if a value is considered "filled" (non-empty).
 * @param {*} val
 * @returns {boolean}
 * @private
 */
function _hasValue(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'boolean') return val === true;
  if (typeof val === 'number') return true;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') {
    // Check for Firebase-style {value: ...} wrapper
    if ('value' in val) return _hasValue(val.value);
    return Object.keys(val).length > 0;
  }
  return Boolean(val);
}

/**
 * Get a human-readable label for a status.
 * @param {string} status
 * @returns {string}
 * @private
 */
function _getStatusLabel(status) {
  switch (status) {
    case 'not_started': return 'Not started';
    case 'in_progress': return 'In progress';
    case 'completed': return 'Completed';
    default: return 'Not started';
  }
}

export default { createActivityCard, getActivityStatus };
