/**
 * LoginView — Passcode entry form
 *
 * Renders a passcode input form with:
 *   - 6-character alphanumeric passcode field
 *   - Submit button
 *   - Error message area (ARIA live)
 *   - Lockout countdown timer
 *   - Focus management on mount and on error
 *
 * Requirements: 1.2, 1.3, 1.4, 17.4, 17.5
 */

import SessionManager from '../core/session-manager.js';
import { navigate } from '../core/router.js';

// --- Client ID Management ---

/**
 * Get or create a unique client ID for lockout tracking.
 * Uses sessionStorage to persist across page navigations within a tab.
 * @returns {string}
 */
function getClientId() {
  const STORAGE_KEY = 'aie_client_id';
  try {
    let clientId = sessionStorage.getItem(STORAGE_KEY);
    if (!clientId) {
      clientId = _generateClientId();
      sessionStorage.setItem(STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    // Fallback if sessionStorage is unavailable
    return _generateClientId();
  }
}

/**
 * Generate a unique client ID.
 * Uses crypto.randomUUID when available, otherwise a simple fallback.
 * @returns {string}
 */
function _generateClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random segment
  return 'client-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// --- Lockout countdown state ---
let _countdownInterval = null;

/**
 * Clear any active lockout countdown interval.
 */
function _clearCountdown() {
  if (_countdownInterval !== null) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
}

/**
 * Format seconds into MM:SS display.
 * @param {number} totalSeconds
 * @returns {string}
 */
function _formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// --- Render ---

/**
 * Render the login view into the provided container.
 * Called by the Router via registerView('login', render).
 *
 * @param {object} params - Route params (unused for login)
 * @param {HTMLElement} container - The #app container element
 */
export function render(params, container) {
  // Clean up any previous countdown
  _clearCountdown();

  const clientId = getClientId();

  container.innerHTML = `
    <section class="login-view" aria-labelledby="login-heading">
      <div class="login-card card">
        <h1 id="login-heading" class="card__title">Join a Session</h1>
        <p class="card__subtitle">Enter the 6-character passcode provided by your facilitator.</p>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="passcode-input" class="form-label form-label--required">
              Session Passcode
            </label>
            <input
              type="text"
              id="passcode-input"
              class="form-input"
              maxlength="6"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="e.g. ABC123"
              aria-describedby="passcode-help passcode-error"
              aria-required="true"
            />
            <span id="passcode-help" class="form-help">
              6 characters: letters A–Z and digits 0–9
            </span>
            <span
              id="passcode-error"
              class="form-error"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            ></span>
          </div>

          <button type="submit" id="login-submit" class="btn btn--primary btn--full">
            Join Session
          </button>
        </form>

        <div
          id="lockout-message"
          class="login-lockout"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          hidden
        >
          <p class="login-lockout__text">
            Too many failed attempts. Please wait
            <span id="lockout-countdown" aria-live="polite">--:--</span>
            before trying again.
          </p>
        </div>
      </div>
    </section>
  `;

  // --- Element references ---
  const form = container.querySelector('#login-form');
  const input = container.querySelector('#passcode-input');
  const errorEl = container.querySelector('#passcode-error');
  const submitBtn = container.querySelector('#login-submit');
  const lockoutMsg = container.querySelector('#lockout-message');
  const countdownEl = container.querySelector('#lockout-countdown');

  // --- Focus passcode input on mount ---
  requestAnimationFrame(() => {
    input.focus();
  });

  // --- Check initial lockout state ---
  _checkAndShowLockout(clientId, input, submitBtn, lockoutMsg, countdownEl);

  // --- Form submission handler ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error
    _setError(errorEl, input, '');

    // Check lockout before attempting validation
    const lockoutStatus = SessionManager.isLockedOut(clientId);
    if (lockoutStatus.locked) {
      _showLockout(lockoutStatus.remainingSeconds, input, submitBtn, lockoutMsg, countdownEl, clientId);
      return;
    }

    const rawValue = input.value;

    // Client-side format validation
    const normalized = SessionManager.normalizePasscode(rawValue);
    if (!SessionManager.isValidPasscodeFormat(normalized)) {
      _setError(errorEl, input, 'Please enter a valid 6-character passcode (A–Z, 0–9).');
      input.focus();
      return;
    }

    // Disable form during async validation
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking…';

    let isNowLockedOut = false;

    try {
      const result = await SessionManager.validatePasscode(rawValue);

      if (result.valid) {
        // Store active session data
        SessionManager.setActiveSession(result.sessionData);
        // Store passcode in sessionStorage for other views
        try {
          sessionStorage.setItem('aie_session_passcode', result.sessionData.passcode);
        } catch {}
        // Navigate based on role
        if (result.sessionData.role === 'facilitator') {
          navigate('#dashboard');
        } else {
          navigate('#join');
        }
      } else {
        // Record failed attempt
        SessionManager.recordFailedAttempt(clientId);

        // Check if now locked out
        const newLockout = SessionManager.isLockedOut(clientId);
        if (newLockout.locked) {
          isNowLockedOut = true;
          _showLockout(newLockout.remainingSeconds, input, submitBtn, lockoutMsg, countdownEl, clientId);
        } else {
          _setError(errorEl, input, 'Invalid passcode. Please check the code and try again.');
          input.focus();
        }
      }
    } catch (err) {
      _setError(errorEl, input, 'Unable to verify passcode. Please check your connection and try again.');
      input.focus();
    } finally {
      if (!isNowLockedOut) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join Session';
      }
    }
  });
}

// --- Private helpers ---

/**
 * Display an error message and style the input as invalid.
 * @param {HTMLElement} errorEl
 * @param {HTMLInputElement} input
 * @param {string} message - Empty string clears the error
 */
function _setError(errorEl, input, message) {
  errorEl.textContent = message;

  if (message) {
    input.classList.add('form-input--error');
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.classList.remove('form-input--error');
    input.removeAttribute('aria-invalid');
  }
}

/**
 * Check initial lockout state and display lockout if active.
 */
function _checkAndShowLockout(clientId, input, submitBtn, lockoutMsg, countdownEl) {
  const lockoutStatus = SessionManager.isLockedOut(clientId);
  if (lockoutStatus.locked) {
    _showLockout(lockoutStatus.remainingSeconds, input, submitBtn, lockoutMsg, countdownEl, clientId);
  }
}

/**
 * Show lockout state: disable form, display countdown timer.
 * @param {number} remainingSeconds
 * @param {HTMLInputElement} input
 * @param {HTMLButtonElement} submitBtn
 * @param {HTMLElement} lockoutMsg
 * @param {HTMLElement} countdownEl
 * @param {string} clientId
 */
function _showLockout(remainingSeconds, input, submitBtn, lockoutMsg, countdownEl, clientId) {
  _clearCountdown();

  // Disable form interaction
  input.disabled = true;
  submitBtn.disabled = true;

  // Show lockout message
  lockoutMsg.hidden = false;
  countdownEl.textContent = _formatCountdown(remainingSeconds);

  let remaining = remainingSeconds;

  _countdownInterval = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      _clearCountdown();
      _hideLockout(input, submitBtn, lockoutMsg, countdownEl);
      return;
    }

    countdownEl.textContent = _formatCountdown(remaining);
  }, 1000);
}

/**
 * Hide lockout state and re-enable the form.
 */
function _hideLockout(input, submitBtn, lockoutMsg, countdownEl) {
  input.disabled = false;
  submitBtn.disabled = false;
  lockoutMsg.hidden = true;
  countdownEl.textContent = '--:--';

  // Focus the input so user can retry
  input.focus();
}

export default { render };
