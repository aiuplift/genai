/**
 * ModuleListView — displays all 10 modules as interactive cards
 *
 * Locked modules are visually distinct (🔒 icon, non-interactive, greyed out).
 * Unlocked modules show a ProgressBar and are clickable/keyboard-navigable.
 * Lock state is updated in real-time via SyncEngine Firebase subscriptions.
 *
 * Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 19.2
 */

import { getAllModules } from '../core/module-registry.js';
import { subscribe } from '../core/sync-engine.js';
import { getActiveSession } from '../core/session-manager.js';
import { createProgressBar } from '../components/progress-bar.js';
import { navigate, registerView } from '../core/router.js';
import { isPreviewMode } from '../core/preview-mode.js';

// --- Internal State ---

/** @type {function[]} Active Firebase unsubscribe functions for cleanup */
let _unsubscribers = [];

/** @type {Map<string, boolean>} Lock state per module ID */
let _lockStates = new Map();

/** @type {Map<string, { completed: number, total: number }>} Progress per module */
let _progressData = new Map();

/** @type {HTMLElement|null} Reference to the card grid container */
let _gridContainer = null;

// --- View Lifecycle ---

/**
 * Render the Module List view into the app container.
 * @param {object} params - Route parameters (unused for this view)
 * @param {HTMLElement} container - The app container to render into
 */
function render(params, container) {
  // Cleanup any previous subscriptions
  _cleanup();

  const session = getActiveSession();
  const passcode = session ? session.passcode : null;

  // Build the view structure
  container.innerHTML = '';

  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Module List');

  const heading = document.createElement('h1');
  heading.textContent = 'Modules';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  grid.setAttribute('role', 'list');
  section.appendChild(grid);

  _gridContainer = grid;
  container.appendChild(section);

  // Get all module definitions and render initial cards
  const modules = getAllModules();
  modules.forEach((moduleDef) => {
    // In preview mode, all modules are unlocked; otherwise default to locked
    const initialLocked = isPreviewMode() ? false : true;
    _lockStates.set(moduleDef.id, initialLocked);
    _progressData.set(moduleDef.id, { completed: 0, total: moduleDef.activities.length });
    const card = _createModuleCard(moduleDef, initialLocked, 0, moduleDef.activities.length);
    grid.appendChild(card);
  });

  // Subscribe to Firebase lock state and progress if we have a session
  // In preview mode, skip subscriptions — all modules stay unlocked
  if (passcode && !isPreviewMode()) {
    _subscribeLockStates(passcode, modules);
    _subscribeProgress(passcode, modules);
  }
}

/**
 * Clean up subscriptions and internal state when leaving the view.
 */
function _cleanup() {
  _unsubscribers.forEach((unsub) => unsub());
  _unsubscribers = [];
  _lockStates.clear();
  _progressData.clear();
  _gridContainer = null;
}

// --- Firebase Subscriptions ---

/**
 * Subscribe to lock state changes for all modules.
 * Path: /sessions/{passcode}/modules/{moduleId}
 * @param {string} passcode
 * @param {Array} modules
 */
function _subscribeLockStates(passcode, modules) {
  modules.forEach((moduleDef) => {
    const path = `/sessions/${passcode}/modules/${moduleDef.id}`;
    const unsub = subscribe(path, (data) => {
      // data is { locked: boolean, lockedAt, unlockedAt } or null
      const isLocked = data ? data.locked !== false : true;
      const previousState = _lockStates.get(moduleDef.id);
      _lockStates.set(moduleDef.id, isLocked);

      // Re-render this specific card if state changed
      if (previousState !== isLocked) {
        _updateModuleCard(moduleDef);
      }
    });
    _unsubscribers.push(unsub);
  });
}

/**
 * Subscribe to activity completion data for progress calculation.
 * Path: /sessions/{passcode}/activities/{moduleId}/
 * We watch the completion status for the active group.
 * @param {string} passcode
 * @param {Array} modules
 */
function _subscribeProgress(passcode, modules) {
  const session = getActiveSession();
  const groupId = session ? session.groupId : null;

  modules.forEach((moduleDef) => {
    // Subscribe to completion data for this module
    const path = `/sessions/${passcode}/activities/${moduleDef.id}`;
    const unsub = subscribe(path, (data) => {
      // Count completed activities for the group
      const completed = _countCompletedActivities(data, groupId, moduleDef);
      const total = moduleDef.activities.length;
      _progressData.set(moduleDef.id, { completed, total });

      // Re-render card with updated progress
      _updateModuleCard(moduleDef);
    });
    _unsubscribers.push(unsub);
  });
}

/**
 * Count completed activities for a group within a module.
 * @param {object|null} moduleActivitiesData - Firebase data at /activities/{moduleId}
 * @param {string|null} groupId
 * @param {object} moduleDef
 * @returns {number}
 */
function _countCompletedActivities(moduleActivitiesData, groupId, moduleDef) {
  if (!moduleActivitiesData || !groupId) return 0;

  let completed = 0;
  moduleDef.activities.forEach((activityDef) => {
    const activityData = moduleActivitiesData[activityDef.id];
    if (activityData && activityData.completion && activityData.completion[groupId]) {
      if (activityData.completion[groupId].status === 'completed') {
        completed++;
      }
    }
  });
  return completed;
}

// --- Card Rendering ---

/**
 * Create a module card element.
 * @param {object} moduleDef - Module definition from registry
 * @param {boolean} isLocked - Whether the module is locked
 * @param {number} completed - Number of completed activities
 * @param {number} total - Total activities in module
 * @returns {HTMLElement}
 */
function _createModuleCard(moduleDef, isLocked, completed, total) {
  const card = document.createElement('div');
  card.setAttribute('role', 'listitem');
  card.dataset.moduleId = moduleDef.id;

  _populateCard(card, moduleDef, isLocked, completed, total);

  return card;
}

/**
 * Populate or re-populate a card element with current state.
 * @param {HTMLElement} card
 * @param {object} moduleDef
 * @param {boolean} isLocked
 * @param {number} completed
 * @param {number} total
 */
function _populateCard(card, moduleDef, isLocked, completed, total) {
  // Clear existing content
  card.innerHTML = '';

  if (isLocked) {
    card.className = 'card card--locked';
    card.setAttribute('aria-disabled', 'true');
    card.removeAttribute('tabindex');
    card.onclick = null;
    card.onkeydown = null;
  } else {
    card.className = 'card card--interactive';
    card.removeAttribute('aria-disabled');
    card.setAttribute('tabindex', '0');

    // Click handler: navigate to first activity
    card.onclick = () => _navigateToModule(moduleDef);

    // Keyboard handler: Enter or Space to activate
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _navigateToModule(moduleDef);
      }
    };
  }

  // Card header
  const header = document.createElement('div');
  header.className = 'card__header';

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = moduleDef.title;
  header.appendChild(title);

  // Lock indicator for locked modules
  if (isLocked) {
    const lockIndicator = document.createElement('span');
    lockIndicator.className = 'lock-indicator';
    lockIndicator.setAttribute('aria-label', 'Locked');

    const lockIcon = document.createElement('span');
    lockIcon.className = 'lock-indicator__icon';
    lockIndicator.appendChild(lockIcon);

    header.appendChild(lockIndicator);
  }

  card.appendChild(header);

  // Card body — show progress bar for unlocked modules
  const body = document.createElement('div');
  body.className = 'card__body';

  if (!isLocked) {
    const progressBar = createProgressBar(completed, total, {
      ariaLabel: `${moduleDef.title} progress`
    });
    body.appendChild(progressBar);
  } else {
    const lockedMsg = document.createElement('p');
    lockedMsg.textContent = 'This module is locked by the facilitator.';
    body.appendChild(lockedMsg);
  }

  card.appendChild(body);
}

/**
 * Update a single module card in place without re-rendering the entire grid.
 * @param {object} moduleDef
 */
function _updateModuleCard(moduleDef) {
  if (!_gridContainer) return;

  const existingCard = _gridContainer.querySelector(`[data-module-id="${moduleDef.id}"]`);
  if (!existingCard) return;

  const isLocked = _lockStates.get(moduleDef.id);
  const progress = _progressData.get(moduleDef.id) || { completed: 0, total: moduleDef.activities.length };

  _populateCard(existingCard, moduleDef, isLocked, progress.completed, progress.total);
}

/**
 * Navigate to the module content view (exercises and worksheets).
 * Students see only the interactive activities — slides are facilitator-only.
 * @param {object} moduleDef
 */
function _navigateToModule(moduleDef) {
  navigate(`#module/${moduleDef.id}`);
}

// --- Register with Router ---

registerView('modules', render);

// --- Exports (for testing) ---

export {
  render,
  _cleanup,
  _createModuleCard,
  _countCompletedActivities,
  _navigateToModule,
  _populateCard
};

export default { render };
