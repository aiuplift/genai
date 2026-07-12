/**
 * SyncEngine — Firebase Realtime Database operations
 *
 * Handles debounced writes, immediate writes, path subscriptions,
 * connection state monitoring, and offline queue management.
 * Designed for dependency injection of the Firebase database reference
 * for testability.
 *
 * Requirements: 4.1, 4.2, 4.4, 4.5, 4.6
 */

import {
  initQueue,
  queueChange,
  flushQueue,
  getQueueSize,
  isQueueFull,
  clearQueue,
  destroyQueue,
  QUEUE_CONSTANTS
} from './offline-queue.js';

// --- Constants ---
const DEBOUNCE_DELAY_MS = 2000; // 2-second debounce after last keystroke

// --- Internal State ---

/** @type {Map<string, number>} Active debounce timers keyed by path */
const debounceTimers = new Map();

/** @type {object|null} Firebase database reference */
let _db = null;

/** @type {boolean} Current connection state */
let _isConnected = true;

/** @type {Set<function>} Connection state change callbacks */
const connectionCallbacks = new Set();

/** @type {function|null} Firebase connection listener unsubscribe */
let _connectionUnsub = null;

/** @type {object|null} Mock provider for demo/testing (overrides Firebase operations) */
let _mockProvider = null;

/**
 * Set a mock provider that overrides subscribe/write operations.
 * Used by demo mode to provide in-memory data without Firebase.
 * @param {{ subscribe?: function, write?: function }} provider
 */
export function setMockProvider(provider) {
  _mockProvider = provider;
}

// --- Initialization ---

/**
 * Initialize the SyncEngine with a Firebase database reference.
 * Sets up connection state monitoring and offline queue.
 * @param {object} database - Firebase database reference (firebase.database())
 */
export function init(database) {
  _db = database;
  if (_db) {
    _setupConnectionMonitor();
    // Initialize offline queue with the Firebase write function
    initQueue(_writeToFirebase);
  }
}

/**
 * Get the current database reference.
 * @returns {object|null}
 */
export function getDatabase() {
  return _db;
}

/**
 * Check if the engine is currently connected to Firebase.
 * @returns {boolean}
 */
export function isConnected() {
  return _isConnected;
}

// --- Write Operations ---

/**
 * Write a value to a Firebase path with a 2-second debounce.
 * Multiple calls to the same path within 2 seconds will cancel
 * previous pending writes — only the last value is written.
 *
 * When offline, the write is queued locally instead of being
 * sent to Firebase. The queue is flushed on reconnection.
 *
 * Debounce timers are maintained per-path, so writes to different
 * paths are independent of each other.
 *
 * @param {string} path - Firebase database path
 * @param {*} value - Value to write
 */
export function debouncedWrite(path, value) {
  if (!path) return;

  // If mock provider is set (demo mode), use it
  if (_mockProvider && _mockProvider.write) {
    _mockProvider.write(path, value);
    return;
  }

  // Cancel any existing timer for this path
  if (debounceTimers.has(path)) {
    clearTimeout(debounceTimers.get(path));
  }

  // Set a new timer
  const timerId = setTimeout(() => {
    debounceTimers.delete(path);
    if (!_isConnected) {
      // Offline: queue the change instead of writing to Firebase
      queueChange(path, value);
    } else {
      _writeToFirebase(path, value);
    }
  }, DEBOUNCE_DELAY_MS);

  debounceTimers.set(path, timerId);
}

/**
 * Write a value to a Firebase path immediately (no debounce).
 * Use for operations that must persist right away, such as
 * session joins, module lock changes, or completion status updates.
 *
 * @param {string} path - Firebase database path
 * @param {*} value - Value to write
 * @returns {Promise<void>}
 */
export function immediateWrite(path, value) {
  if (!path) return Promise.resolve();

  // If mock provider is set (demo mode), use it
  if (_mockProvider && _mockProvider.write) {
    _mockProvider.write(path, value);
    return Promise.resolve();
  }

  return _writeToFirebase(path, value);
}

// --- Subscriptions ---

/**
 * Subscribe to changes at a Firebase path.
 * Wraps Firebase onValue listener for real-time updates.
 *
 * @param {string} path - Firebase database path to subscribe to
 * @param {function} callback - Called with snapshot value on each change
 * @returns {function} Unsubscribe function to remove the listener
 */
export function subscribe(path, callback) {
  // If mock provider is set (demo mode), use it instead of Firebase
  if (_mockProvider && _mockProvider.subscribe) {
    return _mockProvider.subscribe(path, callback);
  }

  if (!_db || !path) {
    // Return a no-op unsubscribe if no database is available
    return () => {};
  }

  const ref = _db.ref(path);

  const listener = (snapshot) => {
    const value = snapshot.exists() ? snapshot.val() : null;
    try {
      callback(value, snapshot.key);
    } catch (err) {
      console.error(`SyncEngine: Error in subscriber callback for path "${path}":`, err);
    }
  };

  ref.on('value', listener);

  // Return unsubscribe function
  return () => {
    ref.off('value', listener);
  };
}

/**
 * Subscribe to child changes at a Firebase path.
 * Wraps Firebase onChildChanged listener for granular updates.
 *
 * @param {string} path - Firebase database path to subscribe to
 * @param {function} callback - Called with (childKey, childValue) on each child change
 * @returns {function} Unsubscribe function to remove the listener
 */
export function subscribeToChildChanges(path, callback) {
  if (!_db || !path) {
    return () => {};
  }

  const ref = _db.ref(path);

  const listener = (snapshot) => {
    const value = snapshot.exists() ? snapshot.val() : null;
    try {
      callback(snapshot.key, value);
    } catch (err) {
      console.error(`SyncEngine: Error in child change callback for path "${path}":`, err);
    }
  };

  ref.on('child_changed', listener);

  return () => {
    ref.off('child_changed', listener);
  };
}

// --- Connection State ---

/**
 * Register a callback for connection state changes.
 * The callback is called immediately with the current state,
 * then again whenever the connection state changes.
 *
 * @param {function} callback - Called with (isConnected: boolean)
 * @returns {function} Unsubscribe function to remove the callback
 */
export function onConnectionChange(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }

  connectionCallbacks.add(callback);

  // Immediately notify with current state
  try {
    callback(_isConnected);
  } catch (err) {
    console.error('SyncEngine: Error in connection change callback:', err);
  }

  return () => {
    connectionCallbacks.delete(callback);
  };
}

// --- Cleanup ---

/**
 * Cancel all pending debounce timers.
 * Useful for cleanup when navigating away or in tests.
 */
export function cancelAllPendingWrites() {
  for (const timerId of debounceTimers.values()) {
    clearTimeout(timerId);
  }
  debounceTimers.clear();
}

/**
 * Check if there is a pending debounced write for a given path.
 * @param {string} path - Firebase database path
 * @returns {boolean}
 */
export function hasPendingWrite(path) {
  return debounceTimers.has(path);
}

/**
 * Get the number of pending debounced writes.
 * @returns {number}
 */
export function getPendingWriteCount() {
  return debounceTimers.size;
}

/**
 * Destroy the SyncEngine — remove connection listener, cancel timers, clear state.
 * Call this when tearing down the application or in tests.
 */
export function destroy() {
  cancelAllPendingWrites();

  if (_connectionUnsub) {
    _connectionUnsub();
    _connectionUnsub = null;
  }

  connectionCallbacks.clear();
  destroyQueue();
  _db = null;
  _isConnected = true;
}

// --- Private Helpers ---

/**
 * Write a value to Firebase. Returns a promise.
 * @param {string} path
 * @param {*} value
 * @returns {Promise<void>}
 * @private
 */
function _writeToFirebase(path, value) {
  if (!_db) {
    return Promise.resolve();
  }

  const ref = _db.ref(path);
  return ref.set(value).catch((err) => {
    console.error(`SyncEngine: Write failed for path "${path}":`, err);
    throw err;
  });
}

/**
 * Set up the Firebase .info/connected listener for connection state monitoring.
 * @private
 */
function _setupConnectionMonitor() {
  if (!_db) return;

  const connectedRef = _db.ref('.info/connected');

  const listener = (snapshot) => {
    const connected = snapshot.val() === true;

    if (connected !== _isConnected) {
      _isConnected = connected;
      _notifyConnectionChange(connected);
    }
  };

  connectedRef.on('value', listener);

  // Store unsubscribe for cleanup
  _connectionUnsub = () => {
    connectedRef.off('value', listener);
  };
}

/**
 * Notify all registered connection change callbacks.
 * On reconnection (false -> true), automatically flush the offline queue.
 * @param {boolean} connected
 * @private
 */
function _notifyConnectionChange(connected) {
  for (const callback of connectionCallbacks) {
    try {
      callback(connected);
    } catch (err) {
      console.error('SyncEngine: Error in connection change callback:', err);
    }
  }

  // Auto-flush the offline queue on reconnection
  if (connected) {
    flushQueue().catch((err) => {
      console.error('SyncEngine: Error flushing offline queue on reconnect:', err);
    });
  }
}

// --- Exported Constants (for testing) ---
export const CONSTANTS = {
  DEBOUNCE_DELAY_MS
};

// Re-export offline queue functions for unified SyncEngine interface
export { queueChange, flushQueue, getQueueSize, isQueueFull, clearQueue, QUEUE_CONSTANTS };

// --- Default Export (SyncEngine interface) ---
const SyncEngine = {
  init,
  getDatabase,
  isConnected,
  debouncedWrite,
  immediateWrite,
  subscribe,
  subscribeToChildChanges,
  onConnectionChange,
  cancelAllPendingWrites,
  hasPendingWrite,
  getPendingWriteCount,
  destroy,
  queueChange,
  flushQueue,
  getQueueSize,
  isQueueFull,
  clearQueue,
  CONSTANTS,
  QUEUE_CONSTANTS
};

export default SyncEngine;
