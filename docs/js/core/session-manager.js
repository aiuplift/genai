/**
 * SessionManager - manages session lifecycle
 *
 * Handles passcode generation, session creation/deletion,
 * passcode validation, and lockout tracking.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

// --- Constants ---
const PASSCODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PASSCODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CONCURRENT_SESSIONS = 20;
const LOCKOUT_STORAGE_PREFIX = 'lockout_';

// --- Pure Logic (testable without Firebase) ---

/**
 * Generate a 6-character alphanumeric passcode [A-Z0-9].
 * Uses crypto.getRandomValues when available, falls back to Math.random.
 * @returns {string} A 6-character uppercase alphanumeric passcode
 */
export function generatePasscode() {
  let passcode = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(PASSCODE_LENGTH);
    crypto.getRandomValues(values);
    for (let i = 0; i < PASSCODE_LENGTH; i++) {
      passcode += PASSCODE_CHARS.charAt(values[i] % PASSCODE_CHARS.length);
    }
  } else {
    for (let i = 0; i < PASSCODE_LENGTH; i++) {
      passcode += PASSCODE_CHARS.charAt(Math.floor(Math.random() * PASSCODE_CHARS.length));
    }
  }
  return passcode;
}

/**
 * Normalize a passcode input for case-insensitive comparison.
 * Trims whitespace and converts to uppercase.
 * @param {string} input - Raw passcode input
 * @returns {string} Normalized passcode
 */
export function normalizePasscode(input) {
  if (typeof input !== 'string') return '';
  return input.trim().toUpperCase();
}

/**
 * Check if a passcode matches the expected format: exactly 6 chars from [A-Z0-9].
 * @param {string} passcode - The passcode to validate
 * @returns {boolean}
 */
export function isValidPasscodeFormat(passcode) {
  if (typeof passcode !== 'string') return false;
  return /^[A-Z0-9]{6}$/.test(passcode);
}

// --- Lockout Logic (uses sessionStorage) ---

/**
 * Get the lockout state for a given clientId from sessionStorage.
 * @param {string} clientId - Client identifier
 * @param {object} [storage] - Storage interface (defaults to sessionStorage)
 * @returns {{ attempts: number, firstAttemptTime: number, lockedUntil: number|null }}
 */
export function getLockoutState(clientId, storage) {
  const store = storage || _getStorage();
  if (!store) {
    return { attempts: 0, firstAttemptTime: 0, lockedUntil: null };
  }
  try {
    const raw = store.getItem(LOCKOUT_STORAGE_PREFIX + clientId);
    if (!raw) {
      return { attempts: 0, firstAttemptTime: 0, lockedUntil: null };
    }
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, firstAttemptTime: 0, lockedUntil: null };
  }
}

/**
 * Save lockout state for a given clientId.
 * @param {string} clientId
 * @param {{ attempts: number, firstAttemptTime: number, lockedUntil: number|null }} state
 * @param {object} [storage] - Storage interface (defaults to sessionStorage)
 */
export function saveLockoutState(clientId, state, storage) {
  const store = storage || _getStorage();
  if (!store) return;
  try {
    store.setItem(LOCKOUT_STORAGE_PREFIX + clientId, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Check if a client is currently locked out.
 * @param {string} clientId - Client identifier
 * @param {object} [options] - Options for testing (storage, now)
 * @param {object} [options.storage] - Storage interface
 * @param {number} [options.now] - Current timestamp override
 * @returns {{ locked: boolean, remainingSeconds?: number }}
 */
export function isLockedOut(clientId, options = {}) {
  const now = options.now || Date.now();
  const state = getLockoutState(clientId, options.storage);

  if (state.lockedUntil && now < state.lockedUntil) {
    const remainingMs = state.lockedUntil - now;
    return { locked: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
  }

  // If lockout has expired, clear it
  if (state.lockedUntil && now >= state.lockedUntil) {
    saveLockoutState(clientId, { attempts: 0, firstAttemptTime: 0, lockedUntil: null }, options.storage);
  }

  return { locked: false };
}

/**
 * Record a failed passcode attempt for a client.
 * If 5 attempts within a 15-minute window, triggers a 5-minute lockout.
 * @param {string} clientId - Client identifier
 * @param {object} [options] - Options for testing (storage, now)
 * @param {object} [options.storage] - Storage interface
 * @param {number} [options.now] - Current timestamp override
 */
export function recordFailedAttempt(clientId, options = {}) {
  const now = options.now || Date.now();
  let state = getLockoutState(clientId, options.storage);

  // If currently locked, don't record new attempts
  if (state.lockedUntil && now < state.lockedUntil) {
    return;
  }

  // If the window has expired, reset
  if (state.firstAttemptTime && (now - state.firstAttemptTime) > LOCKOUT_WINDOW_MS) {
    state = { attempts: 0, firstAttemptTime: 0, lockedUntil: null };
  }

  // Record the attempt
  if (state.attempts === 0) {
    state.firstAttemptTime = now;
  }
  state.attempts += 1;

  // Check if lockout threshold reached
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  saveLockoutState(clientId, state, options.storage);
}

// --- Firebase Integration ---

/**
 * Get a reference to the Firebase database.
 * Returns null if Firebase is not initialized.
 * @returns {object|null}
 */
function _getDatabase() {
  if (typeof firebase !== 'undefined' && firebase.database) {
    return firebase.database();
  }
  return null;
}

/**
 * Get sessionStorage (or null if unavailable).
 * @returns {Storage|null}
 */
function _getStorage() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage;
    }
  } catch {
    // Private browsing or security restrictions
  }
  return null;
}

/**
 * Fetch all active session passcodes from Firebase.
 * @param {object} [db] - Firebase database reference (for testing)
 * @returns {Promise<string[]>} Array of active passcodes
 */
export async function getActivePasscodes(db) {
  const database = db || _getDatabase();
  if (!database) return [];

  const snapshot = await database.ref('/sessions').once('value');
  if (!snapshot.exists()) return [];

  return Object.keys(snapshot.val());
}

/**
 * Create a new session.
 * Generates a unique passcode, checks against active sessions, writes metadata.
 * @param {string} facilitatorId - Facilitator identifier
 * @param {string} sessionName - Display name for the session
 * @param {object} [options] - Options for testing (db)
 * @param {object} [options.db] - Firebase database reference
 * @returns {Promise<{ passcode: string, sessionRef: object }>}
 * @throws {Error} If max concurrent sessions reached or passcode generation fails
 */
export async function createSession(facilitatorId, sessionName, options = {}) {
  const database = options.db || _getDatabase();
  if (!database) {
    throw new Error('Firebase database not available');
  }

  // Check session limit
  const activePasscodes = await getActivePasscodes(database);
  if (activePasscodes.length >= MAX_CONCURRENT_SESSIONS) {
    throw new Error(`Maximum of ${MAX_CONCURRENT_SESSIONS} concurrent sessions reached`);
  }

  // Generate unique passcode with collision check
  let passcode;
  let attempts = 0;
  const maxGenerationAttempts = 100; // Safety limit

  do {
    passcode = generatePasscode();
    attempts++;
    if (attempts > maxGenerationAttempts) {
      throw new Error('Failed to generate unique passcode after maximum attempts');
    }
  } while (activePasscodes.includes(passcode));

  // Write session metadata to Firebase
  const sessionRef = database.ref(`/sessions/${passcode}`);
  const metadata = {
    name: sessionName,
    createdAt: Date.now(),
    facilitatorId: facilitatorId,
    passcode: passcode
  };

  await sessionRef.child('meta').set(metadata);

  // Initialize all 10 modules as locked
  const modules = {};
  for (let i = 1; i <= 10; i++) {
    modules[`module${i}`] = {
      locked: true,
      lockedAt: null,
      unlockedAt: null
    };
  }
  await sessionRef.child('modules').set(modules);

  return { passcode, sessionRef };
}

/**
 * Validate a passcode against active sessions.
 * Case-insensitive comparison.
 * @param {string} input - The passcode to validate
 * @param {object} [options] - Options for testing (db)
 * @param {object} [options.db] - Firebase database reference
 * @returns {Promise<{ valid: boolean, sessionData?: object }>}
 */
export async function validatePasscode(input, options = {}) {
  const database = options.db || _getDatabase();
  if (!database) {
    return { valid: false };
  }

  const normalized = normalizePasscode(input);
  if (!isValidPasscodeFormat(normalized)) {
    return { valid: false };
  }

  // Look up session by normalized passcode
  const snapshot = await database.ref(`/sessions/${normalized}/meta`).once('value');
  if (!snapshot.exists()) {
    return { valid: false };
  }

  return { valid: true, sessionData: snapshot.val() };
}

/**
 * Get the active session data (stored in memory during a browser session).
 * @returns {object|null} Session data or null if no active session
 */
let _activeSession = null;

export function getActiveSession() {
  return _activeSession;
}

/**
 * Set the active session (called after successful passcode validation).
 * @param {object|null} sessionData
 */
export function setActiveSession(sessionData) {
  _activeSession = sessionData;
}

/**
 * Delete a session and all its associated data from Firebase.
 * @param {string} passcode - The session passcode to delete
 * @param {object} [options] - Options for testing (db)
 * @param {object} [options.db] - Firebase database reference
 * @returns {Promise<void>}
 */
export async function deleteSession(passcode, options = {}) {
  const database = options.db || _getDatabase();
  if (!database) {
    throw new Error('Firebase database not available');
  }

  const normalized = normalizePasscode(passcode);
  if (!isValidPasscodeFormat(normalized)) {
    throw new Error('Invalid passcode format');
  }

  await database.ref(`/sessions/${normalized}`).remove();

  // Clear active session if it matches
  if (_activeSession && _activeSession.passcode === normalized) {
    _activeSession = null;
  }
}

// --- Exported Constants (for testing) ---
export const CONSTANTS = {
  PASSCODE_CHARS,
  PASSCODE_LENGTH,
  MAX_ATTEMPTS,
  LOCKOUT_WINDOW_MS,
  LOCKOUT_DURATION_MS,
  MAX_CONCURRENT_SESSIONS,
  LOCKOUT_STORAGE_PREFIX
};

// --- Default Export (SessionManager interface) ---
const SessionManager = {
  createSession,
  validatePasscode,
  getActiveSession,
  setActiveSession,
  deleteSession,
  isLockedOut,
  recordFailedAttempt,
  generatePasscode,
  normalizePasscode,
  isValidPasscodeFormat,
  getActivePasscodes,
  getLockoutState,
  saveLockoutState,
  CONSTANTS
};

export default SessionManager;
