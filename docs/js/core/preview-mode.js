/**
 * Preview Mode — Facilitator content preview without saving
 *
 * Allows facilitators to browse all modules and activities as if they were
 * a student, with interactive form fields, but nothing is persisted to Firebase.
 *
 * Exports:
 *   - isPreviewMode() — check if preview mode is active
 *   - enterPreviewMode() — activate preview mode and navigate to modules
 *   - exitPreviewMode() — deactivate preview mode and return to dashboard
 *
 * Requirements: 28.1
 */

import { navigate, setPreviewCheck } from './router.js';

// --- Internal State ---

/** @type {boolean} Whether preview mode is currently active */
let _previewActive = false;

/** @type {HTMLElement|null} The floating preview banner element */
let _bannerElement = null;

// Register preview check with the router (breaks circular dependency)
setPreviewCheck(() => _previewActive);

// --- Public API ---

/**
 * Check whether preview mode is currently active.
 * @returns {boolean}
 */
export function isPreviewMode() {
  return _previewActive;
}

/**
 * Enter preview mode — sets the flag, shows the banner, and navigates to modules.
 */
export function enterPreviewMode() {
  _previewActive = true;
  _showPreviewBanner();
  navigate('#modules');
}

/**
 * Exit preview mode — clears the flag, removes the banner, and navigates to dashboard.
 */
export function exitPreviewMode() {
  _previewActive = false;
  _removePreviewBanner();
  navigate('#dashboard');
}

// --- Preview Banner ---

/**
 * Show a fixed banner at the top indicating preview mode is active.
 */
function _showPreviewBanner() {
  if (typeof document === 'undefined') return;

  // Remove any existing banner first
  _removePreviewBanner();

  const banner = document.createElement('div');
  banner.id = 'preview-mode-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 10px 16px;
    background: #dbeafe;
    color: #1e40af;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    border-bottom: 2px solid #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  `;

  const label = document.createElement('span');
  label.textContent = '📋 Preview Mode — Changes are not saved';

  const exitBtn = document.createElement('button');
  exitBtn.type = 'button';
  exitBtn.textContent = 'Back to Dashboard';
  exitBtn.style.cssText = `
    padding: 4px 12px;
    background: #1e40af;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  `;
  exitBtn.setAttribute('aria-label', 'Exit preview mode and return to dashboard');
  exitBtn.addEventListener('click', () => {
    exitPreviewMode();
  });

  banner.appendChild(label);
  banner.appendChild(exitBtn);
  document.body.prepend(banner);
  _bannerElement = banner;

  // Push content down so the banner doesn't overlap
  document.body.style.paddingTop = '44px';
}

/**
 * Remove the preview banner from the DOM.
 */
function _removePreviewBanner() {
  if (_bannerElement) {
    _bannerElement.remove();
    _bannerElement = null;
  } else if (typeof document !== 'undefined') {
    const existing = document.getElementById('preview-mode-banner');
    if (existing) existing.remove();
  }

  if (typeof document !== 'undefined') {
    document.body.style.paddingTop = '';
  }
}

export default { isPreviewMode, enterPreviewMode, exitPreviewMode };
