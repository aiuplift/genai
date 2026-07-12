/**
 * OfflineQueue — Manages offline change queuing with cap and FIFO flush
 *
 * When the connection drops, writes are queued locally (in memory with
 * sessionStorage fallback for crash recovery). On reconnection, the queue
 * is flushed in insertion (FIFO) order. The queue is capped at 50 entries.
 *
 * Requirements: 4.4, 4.5, 4.6
 */

// --- Constants ---
const MAX_QUEUE_SIZE = 50;
const STORAGE_KEY = 'aie_offline_queue';

// --- Internal State ---

/** @type {Array<{path: string, value: *, timestamp: number, retryCount: number}>} */
let _queue = [];

/** @type {boolean} Whether we are currently flushing */
let _isFlushing = false;

/** @type {function|null} Write function injected from SyncEngine */
let _writeFn = null;

// --- Initialization ---

/**
 * Initialize the offline queue. Attempts to recover any previously
 * queued changes from sessionStorage (crash recovery).
 *
 * @param {function} writeFn - Function that writes to Firebase: (path, value) => Promise<void>
 */
export function initQueue(writeFn) {
  _writeFn = writeFn;
  _recoverFromStorage();
}

/**
 * Queue a change for later synchronisation.
 * Adds to queue if capacity allows; rejects if queue size >= 50.
 *
 * The value should include a timestamp for last-write-wins resolution
 * (Firebase default behaviour uses the timestamp embedded in the value).
 *
 * @param {string} path - Firebase database path
 * @param {*} value - Value to write (should include updatedAt timestamp)
 * @returns {{ queued: boolean, queueSize: number }} Result of the queue attempt
 */
export function queueChange(path, value) {
  if (_queue.length >= MAX_QUEUE_SIZE) {
    return { queued: false, queueSize: _queue.length };
  }

  const entry = {
    path,
    value,
    timestamp: Date.now(),
    retryCount: 0
  };

  _queue.push(entry);
  _persistToStorage();

  return { queued: true, queueSize: _queue.length };
}

/**
 * Flush the queue by sending all queued changes in FIFO order.
 * Each write is attempted sequentially. On failure, the entry's
 * retryCount is incremented but it remains in the queue for the
 * next flush attempt.
 *
 * Last-write-wins: Firebase handles conflict resolution based on
 * the timestamp in the value. We simply write in insertion order.
 *
 * @returns {Promise<{ flushed: number, failed: number }>}
 */
export async function flushQueue() {
  if (_isFlushing || _queue.length === 0) {
    return { flushed: 0, failed: 0 };
  }

  _isFlushing = true;

  let flushed = 0;
  let failed = 0;

  // Process a snapshot of the current queue length to avoid infinite loops
  // if entries are re-queued during flush
  const entriesToFlush = _queue.length;

  for (let i = 0; i < entriesToFlush; i++) {
    const entry = _queue[0]; // Always take from front (FIFO)

    if (!entry) break;

    try {
      if (_writeFn) {
        await _writeFn(entry.path, entry.value);
      }
      // Success: remove from queue
      _queue.shift();
      flushed++;
    } catch (err) {
      // Failure: increment retry count but leave in queue
      entry.retryCount++;
      failed++;
      // Move failed entry to end to allow other entries to proceed
      _queue.shift();
      _queue.push(entry);
    }
  }

  _persistToStorage();
  _isFlushing = false;

  return { flushed, failed };
}

/**
 * Get the current number of queued changes.
 * Used by UI to display warning when queue is filling up.
 *
 * @returns {number}
 */
export function getQueueSize() {
  return _queue.length;
}

/**
 * Check if the queue is at capacity.
 * @returns {boolean}
 */
export function isQueueFull() {
  return _queue.length >= MAX_QUEUE_SIZE;
}

/**
 * Check if a flush operation is currently in progress.
 * @returns {boolean}
 */
export function isFlushing() {
  return _isFlushing;
}

/**
 * Get a copy of the current queue (for debugging/testing).
 * @returns {Array<{path: string, value: *, timestamp: number, retryCount: number}>}
 */
export function getQueueSnapshot() {
  return [..._queue];
}

/**
 * Clear the queue entirely. Use with caution.
 * Intended for cleanup on session end or in tests.
 */
export function clearQueue() {
  _queue = [];
  _isFlushing = false;
  _clearStorage();
}

/**
 * Destroy the offline queue — clear state and remove write function.
 * Call this when tearing down the application or in tests.
 */
export function destroyQueue() {
  clearQueue();
  _writeFn = null;
}

// --- Private Helpers ---

/**
 * Persist the current queue to sessionStorage for crash recovery.
 * @private
 */
function _persistToStorage() {
  try {
    const serialized = JSON.stringify(_queue);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    // sessionStorage may be unavailable (private browsing, quota exceeded)
    // Silently fail — the in-memory queue is the primary store
  }
}

/**
 * Recover queued changes from sessionStorage (crash recovery).
 * Only recovers if the in-memory queue is empty (fresh page load).
 * @private
 */
function _recoverFromStorage() {
  if (_queue.length > 0) return;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Only recover entries that look valid
        _queue = parsed.filter(entry =>
          entry &&
          typeof entry.path === 'string' &&
          typeof entry.timestamp === 'number' &&
          entry.path.length > 0
        ).slice(0, MAX_QUEUE_SIZE); // Ensure we don't exceed cap
      }
    }
  } catch (err) {
    // Recovery failed — start with empty queue
    _queue = [];
  }
}

/**
 * Clear sessionStorage entry.
 * @private
 */
function _clearStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // Silently fail
  }
}

// --- Exported Constants (for testing) ---
export const QUEUE_CONSTANTS = {
  MAX_QUEUE_SIZE,
  STORAGE_KEY
};

// --- Default Export ---
const OfflineQueue = {
  initQueue,
  queueChange,
  flushQueue,
  getQueueSize,
  isQueueFull,
  isFlushing,
  getQueueSnapshot,
  clearQueue,
  destroyQueue,
  QUEUE_CONSTANTS
};

export default OfflineQueue;
