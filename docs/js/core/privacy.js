/**
 * Privacy Module — Data privacy controls and session cleanup
 *
 * Provides utilities for:
 * - Clearing participant data from sessionStorage on session end / tab close
 * - Verifying all Firebase paths are scoped to /sessions/{passcode}/
 * - Centralised UUID generation for participant IDs
 * - Tab close / visibility change cleanup
 *
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

// --- Constants ---
const AIE_KEY_PREFIX = 'aie_';
const SESSION_PATH_PREFIX = '/sessions/';

/**
 * Clear all participant-related data from sessionStorage.
 * Removes all keys prefixed with 'aie_' to ensure no participant data
 * persists beyond the active browser session.
 */
export function clearParticipantData() {
  try {
    if (typeof sessionStorage === 'undefined') return;

    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(AIE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // sessionStorage may be unavailable — silently fail
  }
}

/**
 * Verify that a Firebase database path is scoped to the session namespace.
 * All data paths must start with /sessions/{passcode}/ to ensure isolation.
 *
 * @param {string} path - The Firebase database path to validate
 * @param {string} passcode - The session passcode (6-char alphanumeric)
 * @returns {boolean} True if the path is correctly scoped to the session
 */
export function isDataScopedToSession(path, passcode) {
  if (typeof path !== 'string' || typeof passcode !== 'string') {
    return false;
  }

  if (!path || !passcode) {
    return false;
  }

  const expectedPrefix = `${SESSION_PATH_PREFIX}${passcode}/`;
  return path.startsWith(expectedPrefix);
}

/**
 * Generate a unique participant ID (UUID v4).
 * Uses crypto.randomUUID() when available, falls back to manual generation.
 * Participant IDs are per browser session and NOT persisted across sessions.
 *
 * @returns {string} A UUID v4 string
 */
export function generateParticipantId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check whether any localStorage is being used for participant data.
 * Returns true if no participant data exists in localStorage (compliant).
 *
 * @returns {boolean} True if localStorage is free of participant data
 */
export function verifyNoLocalStoragePersistence() {
  try {
    if (typeof localStorage === 'undefined') return true;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(AIE_KEY_PREFIX)) {
        return false;
      }
    }
    return true;
  } catch {
    // localStorage unavailable — no persistence, so compliant
    return true;
  }
}

/**
 * Check that no third-party analytics or tracking scripts are loaded
 * beyond the Firebase SDK. Inspects all <script> elements on the page.
 *
 * @returns {{ compliant: boolean, violations: string[] }}
 */
export function verifyNoThirdPartyAnalytics() {
  const violations = [];

  if (typeof document === 'undefined') {
    return { compliant: true, violations };
  }

  const allowedDomains = [
    'www.gstatic.com',       // Firebase SDK CDN
    'apis.google.com',       // Firebase Auth (if needed)
    ''                        // Relative/local scripts (no src or same-origin)
  ];

  const scripts = document.querySelectorAll('script[src]');
  for (const script of scripts) {
    try {
      const url = new URL(script.src, window.location.origin);
      const hostname = url.hostname;

      // Allow same-origin scripts
      if (hostname === window.location.hostname) continue;

      // Allow known Firebase-related domains
      if (allowedDomains.includes(hostname)) continue;

      // Flag anything else as a potential analytics/tracking violation
      violations.push(script.src);
    } catch {
      // Malformed URL — skip
    }
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}

/**
 * Initialize privacy cleanup listeners.
 * Registers a `beforeunload` listener to clear participant data when the tab closes.
 * Also listens for `visibilitychange` to handle mobile tab closing.
 */
export function initPrivacyCleanup() {
  if (typeof window === 'undefined') return;

  // Clear participant data when the tab/window is being closed
  window.addEventListener('beforeunload', () => {
    clearParticipantData();
  });

  // Also handle visibilitychange for mobile browsers that may not fire beforeunload
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearParticipantData();
    }
  });
}

// --- Exported Constants (for testing) ---
export const PRIVACY_CONSTANTS = {
  AIE_KEY_PREFIX,
  SESSION_PATH_PREFIX
};

// --- Default Export ---
const Privacy = {
  clearParticipantData,
  isDataScopedToSession,
  generateParticipantId,
  verifyNoLocalStoragePersistence,
  verifyNoThirdPartyAnalytics,
  initPrivacyCleanup,
  PRIVACY_CONSTANTS
};

export default Privacy;
