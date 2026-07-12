/**
 * ExportView — Print-friendly export of completed activity responses
 *
 * Supports two modes:
 *   - Participant: export responses for a selected module (own group)
 *   - Facilitator: export all groups' responses for a selected module
 *
 * The export is rendered as a print-friendly HTML document in a new
 * window/tab, using the print CSS from styles.css.
 *
 * Routes: #export
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
 */

import { getAllModules, getModule } from '../core/module-registry.js';
import { subscribe } from '../core/sync-engine.js';
import { getActiveSession } from '../core/session-manager.js';
import { registerView } from '../core/router.js';

// --- Constants ---

/** Maximum time (ms) to wait for data before showing a timeout error */
const EXPORT_TIMEOUT_MS = 30000;

// --- Internal State ---

/** @type {function[]} Active Firebase unsubscribe functions */
let _unsubscribers = [];

/** @type {HTMLElement|null} Reference to the main container */
let _container = null;

/** @type {AbortController|null} For cancelling an export in progress */
let _abortController = null;

// --- View Lifecycle ---

/**
 * Render the Export view into the app container.
 * @param {object} params - Route parameters (unused)
 * @param {HTMLElement} container - The app container to render into
 */
function render(params, container) {
  _cleanup();
  _container = container;
  container.innerHTML = '';

  const session = getActiveSession();
  const isFacilitator = session && session.role === 'facilitator';

  const section = document.createElement('section');
  section.setAttribute('aria-label', 'Export');

  const heading = document.createElement('h1');
  heading.textContent = 'Export Work';
  section.appendChild(heading);

  const description = document.createElement('p');
  description.textContent = isFacilitator
    ? 'Select a module to export all groups\u2019 submitted responses.'
    : 'Select a module to export your group\u2019s completed work for printing.';
  section.appendChild(description);

  // Module selector
  const selectorGroup = document.createElement('div');
  selectorGroup.className = 'form-group';

  const selectorLabel = document.createElement('label');
  selectorLabel.className = 'form-label';
  selectorLabel.setAttribute('for', 'export-module-select');
  selectorLabel.textContent = 'Module';
  selectorGroup.appendChild(selectorLabel);

  const select = document.createElement('select');
  select.id = 'export-module-select';
  select.className = 'form-select';
  select.setAttribute('aria-label', 'Select module to export');

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- Select a module --';
  defaultOpt.disabled = true;
  defaultOpt.selected = true;
  select.appendChild(defaultOpt);

  const modules = getAllModules();
  modules.forEach((mod) => {
    const opt = document.createElement('option');
    opt.value = mod.id;
    opt.textContent = mod.title;
    select.appendChild(opt);
  });

  selectorGroup.appendChild(select);
  section.appendChild(selectorGroup);

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn btn--primary';
  exportBtn.textContent = 'Generate Export';
  exportBtn.disabled = true;
  exportBtn.setAttribute('aria-label', 'Generate export document');
  section.appendChild(exportBtn);

  // Progress/status area
  const statusArea = document.createElement('div');
  statusArea.className = 'export-status';
  statusArea.setAttribute('aria-live', 'polite');
  statusArea.setAttribute('role', 'status');
  section.appendChild(statusArea);

  container.appendChild(section);

  // Enable button when a module is selected
  select.addEventListener('change', () => {
    exportBtn.disabled = !select.value;
  });

  // Export button handler
  exportBtn.addEventListener('click', () => {
    const selectedModuleId = select.value;
    if (!selectedModuleId) return;

    if (isFacilitator) {
      _generateFacilitatorExport(selectedModuleId, statusArea, section);
    } else {
      _generateParticipantExport(selectedModuleId, statusArea, section);
    }
  });
}

/**
 * Clean up subscriptions and internal state.
 */
function _cleanup() {
  _unsubscribers.forEach((unsub) => unsub());
  _unsubscribers = [];
  _container = null;
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
}

// --- Participant Export ---

/**
 * Generate export for a participant (their group's responses for one module).
 * @param {string} moduleId
 * @param {HTMLElement} statusArea
 * @param {HTMLElement} section
 */
function _generateParticipantExport(moduleId, statusArea, section) {
  const session = getActiveSession();
  if (!session) {
    _showError(statusArea, section, 'No active session found.', moduleId, false);
    return;
  }

  const { passcode, groupId, displayName } = session;
  const moduleDef = getModule(moduleId);
  if (!moduleDef) {
    _showError(statusArea, section, 'Module not found.', moduleId, false);
    return;
  }

  _showProgress(statusArea, 'Fetching responses\u2026');
  _abortController = new AbortController();

  const path = `/sessions/${passcode}/activities/${moduleId}`;
  let resolved = false;

  // Timeout handler
  const timeoutId = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      _cleanupSubscriptions();
      _showError(statusArea, section, 'Export generation timed out. Please try again.', moduleId, false);
    }
  }, EXPORT_TIMEOUT_MS);

  const unsub = subscribe(path, (data) => {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeoutId);
    _cleanupSubscriptions();

    // Gather responses for this group
    const groupResponses = _extractGroupResponses(data, groupId, moduleDef);

    if (_isEmptyResponses(groupResponses)) {
      _clearProgress(statusArea);
      _showEmptyState(statusArea);
      return;
    }

    const sessionName = session.sessionName || session.name || 'Session';
    const groupName = groupId || 'Unknown Group';
    const participantName = displayName || 'Participant';

    const htmlContent = _buildExportHtml({
      title: moduleDef.title,
      sessionName,
      groupName,
      participantName,
      date: new Date().toLocaleDateString(),
      sections: groupResponses,
      isFacilitator: false
    });

    _clearProgress(statusArea);
    _openExportWindow(htmlContent);
  });

  _unsubscribers.push(unsub);
}

// --- Facilitator Export ---

/**
 * Generate export for a facilitator (all groups' responses for one module, organised by group then activity).
 * @param {string} moduleId
 * @param {HTMLElement} statusArea
 * @param {HTMLElement} section
 */
function _generateFacilitatorExport(moduleId, statusArea, section) {
  const session = getActiveSession();
  if (!session) {
    _showError(statusArea, section, 'No active session found.', moduleId, true);
    return;
  }

  const { passcode } = session;
  const moduleDef = getModule(moduleId);
  if (!moduleDef) {
    _showError(statusArea, section, 'Module not found.', moduleId, true);
    return;
  }

  _showProgress(statusArea, 'Fetching all group responses\u2026');
  _abortController = new AbortController();

  const path = `/sessions/${passcode}/activities/${moduleId}`;
  let resolved = false;

  const timeoutId = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      _cleanupSubscriptions();
      _showError(statusArea, section, 'Export generation timed out. Please try again.', moduleId, true);
    }
  }, EXPORT_TIMEOUT_MS);

  const unsub = subscribe(path, (data) => {
    if (resolved) return;
    resolved = true;
    clearTimeout(timeoutId);
    _cleanupSubscriptions();

    // Gather all groups' responses
    const allGroupResponses = _extractAllGroupResponses(data, moduleDef);

    if (Object.keys(allGroupResponses).length === 0) {
      _clearProgress(statusArea);
      _showEmptyState(statusArea);
      return;
    }

    const sessionName = session.sessionName || session.name || 'Session';

    const htmlContent = _buildFacilitatorExportHtml({
      title: moduleDef.title,
      sessionName,
      date: new Date().toLocaleDateString(),
      groupsData: allGroupResponses,
      moduleDef
    });

    _clearProgress(statusArea);
    _openExportWindow(htmlContent);
  });

  _unsubscribers.push(unsub);
}

// --- Data Extraction ---

/**
 * Extract a specific group's responses for all activities in a module.
 * @param {object|null} moduleData - Firebase data at /activities/{moduleId}
 * @param {string} groupId
 * @param {object} moduleDef - Module definition
 * @returns {Array<{activityTitle: string, fields: Array<{label: string, value: string}>}>}
 */
function _extractGroupResponses(moduleData, groupId, moduleDef) {
  const sections = [];
  if (!moduleData || !groupId || !moduleDef) return sections;

  moduleDef.activities.forEach((activityDef) => {
    const activityData = moduleData[activityDef.id];
    if (!activityData || !activityData.responses || !activityData.responses[groupId]) return;

    const responses = activityData.responses[groupId];
    const fields = _flattenResponses(activityDef, responses);

    if (fields.length > 0) {
      sections.push({
        activityTitle: activityDef.title,
        fields
      });
    }
  });

  return sections;
}

/**
 * Extract all groups' responses for all activities in a module.
 * Organised by group, then by activity.
 * @param {object|null} moduleData
 * @param {object} moduleDef
 * @returns {object} { [groupId]: Array<{activityTitle, fields}> }
 */
function _extractAllGroupResponses(moduleData, moduleDef) {
  const groups = {};
  if (!moduleData || !moduleDef) return groups;

  moduleDef.activities.forEach((activityDef) => {
    const activityData = moduleData[activityDef.id];
    if (!activityData || !activityData.responses) return;

    Object.keys(activityData.responses).forEach((groupId) => {
      if (!groups[groupId]) groups[groupId] = [];

      const responses = activityData.responses[groupId];
      const fields = _flattenResponses(activityDef, responses);

      if (fields.length > 0) {
        groups[groupId].push({
          activityTitle: activityDef.title,
          fields
        });
      }
    });
  });

  return groups;
}

/**
 * Flatten activity responses into an array of { label, value } pairs.
 * Handles various field types: text, textarea, checklist, select, structured_table.
 * @param {object} activityDef
 * @param {object} responses
 * @returns {Array<{label: string, value: string}>}
 */
function _flattenResponses(activityDef, responses) {
  const fields = [];

  // Handle activities with fields array
  if (Array.isArray(activityDef.fields)) {
    activityDef.fields.forEach((field) => {
      const responseData = responses[field.id];
      const value = _extractValue(responseData);
      if (value !== '' && value !== null && value !== undefined) {
        fields.push({
          label: field.label || field.id,
          value: _formatValue(value, field.type)
        });
      }
    });
  }

  // Handle activities with categories (checklists)
  if (Array.isArray(activityDef.categories)) {
    activityDef.categories.forEach((category) => {
      const checkedItems = [];
      if (Array.isArray(category.items)) {
        category.items.forEach((item) => {
          const responseData = responses[item.id];
          const value = _extractValue(responseData);
          if (value === true) {
            checkedItems.push(item.label || item.id);
          }
        });
      }
      if (checkedItems.length > 0) {
        fields.push({
          label: category.title || category.id,
          value: checkedItems.join(', ')
        });
      }
    });
  }

  return fields;
}

/**
 * Extract the actual value from a response data object.
 * Responses are stored as { value, updatedBy, updatedAt } or raw values.
 * @param {*} responseData
 * @returns {*}
 */
function _extractValue(responseData) {
  if (responseData === null || responseData === undefined) return '';
  if (typeof responseData === 'object' && 'value' in responseData) return responseData.value;
  return responseData;
}

/**
 * Format a value for display in the export document.
 * @param {*} value
 * @param {string} fieldType
 * @returns {string}
 */
function _formatValue(value, fieldType) {
  if (value === null || value === undefined) return '';

  if (fieldType === 'structured_table' && Array.isArray(value)) {
    return value.map((row, i) => {
      const entries = Object.entries(row || {}).map(([k, v]) => `${k}: ${v}`);
      return `Row ${i + 1}: ${entries.join(', ')}`;
    }).join('\n');
  }

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// --- HTML Generation ---

/**
 * Build the print-friendly HTML for a participant export.
 * @param {object} opts
 * @returns {string}
 */
function _buildExportHtml({ title, sessionName, groupName, participantName, date, sections }) {
  const header = _buildHeaderHtml({ title, sessionName, groupName, participantName, date });
  const body = sections.map((section) => _buildSectionHtml(section)).join('');

  return _wrapInDocument(`${header}${body}`, title);
}

/**
 * Build the print-friendly HTML for a facilitator export.
 * Organised by group, then by activity.
 * @param {object} opts
 * @returns {string}
 */
function _buildFacilitatorExportHtml({ title, sessionName, date, groupsData }) {
  let content = '';

  content += `<header class="export-header">
    <h1>${_escapeHtml(title)}</h1>
    <div class="export-meta">
      <p><strong>Session:</strong> ${_escapeHtml(sessionName)}</p>
      <p><strong>Date:</strong> ${_escapeHtml(date)}</p>
      <p><strong>Type:</strong> Full session export (all groups)</p>
    </div>
  </header>`;

  Object.keys(groupsData).sort().forEach((groupId) => {
    content += `<section class="export-group">
      <h2>Group: ${_escapeHtml(groupId)}</h2>`;

    groupsData[groupId].forEach((section) => {
      content += _buildSectionHtml(section);
    });

    content += `</section>`;
  });

  return _wrapInDocument(content, `${title} - All Groups`);
}

/**
 * Build the header section of the export HTML.
 * @param {object} opts
 * @returns {string}
 */
function _buildHeaderHtml({ title, sessionName, groupName, participantName, date }) {
  return `<header class="export-header">
    <h1>${_escapeHtml(title)}</h1>
    <div class="export-meta">
      <p><strong>Session:</strong> ${_escapeHtml(sessionName)}</p>
      <p><strong>Group:</strong> ${_escapeHtml(groupName)}</p>
      <p><strong>Participant:</strong> ${_escapeHtml(participantName)}</p>
      <p><strong>Date:</strong> ${_escapeHtml(date)}</p>
    </div>
  </header>`;
}

/**
 * Build an activity section of the export HTML.
 * @param {object} section - { activityTitle, fields: [{label, value}] }
 * @returns {string}
 */
function _buildSectionHtml(section) {
  let html = `<section class="export-activity">
    <h3>${_escapeHtml(section.activityTitle)}</h3>
    <dl class="export-fields">`;

  section.fields.forEach((field) => {
    html += `<dt>${_escapeHtml(field.label)}</dt>
      <dd>${_escapeHtml(field.value).replace(/\n/g, '<br>')}</dd>`;
  });

  html += `</dl></section>`;
  return html;
}

/**
 * Wrap content in a full HTML document with print-friendly styles.
 * @param {string} bodyContent
 * @param {string} title
 * @returns {string}
 */
function _wrapInDocument(bodyContent, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${_escapeHtml(title)} - Export</title>
  <style>
    /* Print-friendly export styles */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a2e;
      background: #fff;
      margin: 0;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .export-header {
      border-bottom: 2px solid #333;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .export-header h1 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem;
    }
    .export-meta p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #4a4a68;
    }
    .export-group {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }
    .export-group h2 {
      font-size: 1.25rem;
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.5rem;
      margin-top: 1.5rem;
    }
    .export-activity {
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }
    .export-activity h3 {
      font-size: 1.1rem;
      color: #1d4ed8;
      margin-bottom: 0.5rem;
    }
    .export-fields {
      margin: 0;
      padding: 0;
    }
    .export-fields dt {
      font-weight: 600;
      margin-top: 0.75rem;
      font-size: 0.9rem;
      color: #333;
    }
    .export-fields dd {
      margin: 0.25rem 0 0 0;
      padding: 0.5rem;
      background: #f8f9fa;
      border-left: 3px solid #d1d5db;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    @media print {
      body { padding: 0; max-width: none; }
      .export-fields dd { background: none; border-left: 2px solid #999; }
      .no-print { display: none !important; }
    }
    .print-btn-bar {
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background: #eff6ff;
      border-radius: 4px;
      text-align: center;
    }
    .print-btn-bar button {
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      background: #1a56db;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .print-btn-bar button:hover {
      background: #1342a8;
    }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${bodyContent}
</body>
</html>`;
}

// --- UI Helpers ---

/**
 * Show a progress indicator in the status area.
 * @param {HTMLElement} statusArea
 * @param {string} message
 */
function _showProgress(statusArea, message) {
  statusArea.innerHTML = '';
  const indicator = document.createElement('div');
  indicator.className = 'export-progress';
  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('span');
  spinner.className = 'export-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  spinner.textContent = '\u23F3';
  indicator.appendChild(spinner);

  const msg = document.createElement('span');
  msg.textContent = ` ${message}`;
  indicator.appendChild(msg);

  statusArea.appendChild(indicator);
}

/**
 * Clear the progress indicator.
 * @param {HTMLElement} statusArea
 */
function _clearProgress(statusArea) {
  statusArea.innerHTML = '';
}

/**
 * Show the empty state message (no completed work available).
 * @param {HTMLElement} statusArea
 */
function _showEmptyState(statusArea) {
  statusArea.innerHTML = '';
  const msg = document.createElement('p');
  msg.className = 'export-empty';
  msg.setAttribute('role', 'status');
  msg.textContent = 'No completed work available for export in the selected module.';
  statusArea.appendChild(msg);
}

/**
 * Show an error message with a retry button.
 * @param {HTMLElement} statusArea
 * @param {HTMLElement} section
 * @param {string} message
 * @param {string} moduleId
 * @param {boolean} isFacilitator
 */
function _showError(statusArea, section, message, moduleId, isFacilitator) {
  statusArea.innerHTML = '';
  const errorDiv = document.createElement('div');
  errorDiv.className = 'export-error';
  errorDiv.setAttribute('role', 'alert');

  const errorMsg = document.createElement('p');
  errorMsg.textContent = message;
  errorDiv.appendChild(errorMsg);

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'btn btn--secondary';
  retryBtn.textContent = 'Retry';
  retryBtn.setAttribute('aria-label', 'Retry export generation');
  retryBtn.addEventListener('click', () => {
    if (isFacilitator) {
      _generateFacilitatorExport(moduleId, statusArea, section);
    } else {
      _generateParticipantExport(moduleId, statusArea, section);
    }
  });
  errorDiv.appendChild(retryBtn);

  statusArea.appendChild(errorDiv);
}

/**
 * Open the export HTML in a new window/tab for printing.
 * @param {string} htmlContent
 */
function _openExportWindow(htmlContent) {
  const exportWindow = window.open('', '_blank');
  if (exportWindow) {
    exportWindow.document.open();
    exportWindow.document.write(htmlContent);
    exportWindow.document.close();
  } else {
    // Fallback: render in an iframe within the current page
    _renderExportInIframe(htmlContent);
  }
}

/**
 * Fallback: render export content in an inline iframe.
 * @param {string} htmlContent
 */
function _renderExportInIframe(htmlContent) {
  if (!_container) return;

  let iframe = _container.querySelector('.export-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.className = 'export-iframe';
    iframe.setAttribute('title', 'Export preview');
    iframe.style.cssText = 'width:100%;min-height:600px;border:1px solid #ccc;margin-top:1rem;border-radius:4px;';
    _container.appendChild(iframe);
  }

  iframe.srcdoc = htmlContent;
}

/**
 * Clean up active subscriptions.
 */
function _cleanupSubscriptions() {
  _unsubscribers.forEach((unsub) => unsub());
  _unsubscribers = [];
}

// --- Utility ---

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if responses are empty (no real content submitted).
 * @param {Array} groupResponses
 * @returns {boolean}
 */
function _isEmptyResponses(groupResponses) {
  return !groupResponses || groupResponses.length === 0;
}

// --- Register with Router ---

registerView('export', render);

// --- Exports ---

export {
  render,
  _cleanup,
  _generateParticipantExport,
  _generateFacilitatorExport,
  _extractGroupResponses,
  _extractAllGroupResponses,
  _flattenResponses,
  _extractValue,
  _formatValue,
  _buildExportHtml,
  _buildFacilitatorExportHtml,
  _buildHeaderHtml,
  _buildSectionHtml,
  _wrapInDocument,
  _escapeHtml,
  _isEmptyResponses,
  _showProgress,
  _clearProgress,
  _showEmptyState,
  _showError,
  _openExportWindow,
  EXPORT_TIMEOUT_MS
};

export default { render };
