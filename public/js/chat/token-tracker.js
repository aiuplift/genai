/**
 * TokenTracker — Tracks and reports token usage per participant and session.
 *
 * Stores usage at /sessions/{passcode}/chat/tokenUsage/{participantId} (number).
 * Budget config at /sessions/{passcode}/chat/config/tokenBudget (number|null).
 *
 * Uses SyncEngine for Firebase RTDB read/write operations.
 *
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7
 */

import SyncEngine from '../core/sync-engine.js';

/**
 * Record token usage for a participant by adding to existing total.
 * Reads current usage, adds new tokens, and writes back.
 *
 * @param {string} participantId - The participant's ID
 * @param {string} passcode - The session passcode
 * @param {{ input: number, output: number }} tokens - Token counts for the interaction
 * @returns {Promise<void>}
 */
export async function recordUsage(participantId, passcode, tokens) {
  if (!participantId || !passcode || !tokens) return;

  const totalNewTokens = (tokens.input || 0) + (tokens.output || 0);
  if (totalNewTokens <= 0) return;

  const path = `/sessions/${passcode}/chat/tokenUsage/${participantId}`;

  // Read current usage
  const currentUsage = await _readValue(path);
  const updatedUsage = (currentUsage || 0) + totalNewTokens;

  // Write updated total
  await SyncEngine.immediateWrite(path, updatedUsage);
}

/**
 * Get a single participant's total token usage.
 *
 * @param {string} participantId - The participant's ID
 * @param {string} passcode - The session passcode
 * @returns {Promise<number>} Total tokens consumed by this participant
 */
export async function getParticipantUsage(participantId, passcode) {
  if (!participantId || !passcode) return 0;

  const path = `/sessions/${passcode}/chat/tokenUsage/${participantId}`;
  const value = await _readValue(path);
  return value || 0;
}

/**
 * Get session-wide total token usage (sum of all participants).
 *
 * @param {string} passcode - The session passcode
 * @returns {Promise<number>} Total tokens consumed across all participants
 */
export async function getSessionUsage(passcode) {
  if (!passcode) return 0;

  const path = `/sessions/${passcode}/chat/tokenUsage`;
  const usageData = await _readValue(path);

  if (!usageData || typeof usageData !== 'object') return 0;

  return Object.values(usageData).reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Check if the session's token budget allows another request.
 *
 * @param {string} passcode - The session passcode
 * @returns {Promise<{ allowed: boolean, usage: number, budget: number|null, percentage: number }>}
 *   - allowed: whether further requests are permitted
 *   - usage: current total token usage
 *   - budget: configured budget (null if unlimited)
 *   - percentage: usage as percentage of budget (0 if no budget)
 */
export async function checkBudget(passcode) {
  if (!passcode) {
    return { allowed: true, usage: 0, budget: null, percentage: 0 };
  }

  const usage = await getSessionUsage(passcode);
  const budgetPath = `/sessions/${passcode}/chat/config/tokenBudget`;
  const budget = await _readValue(budgetPath);

  // No budget configured — always allowed, percentage 0
  if (budget === null || budget === undefined) {
    return { allowed: true, usage, budget: null, percentage: 0 };
  }

  // Budget is configured
  const percentage = budget > 0 ? Math.round((usage / budget) * 100) : 0;
  const allowed = usage < budget;

  return { allowed, usage, budget, percentage };
}

/**
 * Subscribe to token usage changes for real-time dashboard updates.
 *
 * @param {string} passcode - The session passcode
 * @param {function} callback - Called with usage data whenever it changes
 * @returns {function} Unsubscribe function
 */
export function onUsageChanged(passcode, callback) {
  if (!passcode || typeof callback !== 'function') {
    return () => {};
  }

  const path = `/sessions/${passcode}/chat/tokenUsage`;
  return SyncEngine.subscribe(path, (value) => {
    callback(value || {});
  });
}

/**
 * Get usage breakdown per participant (for facilitator dashboard).
 *
 * @param {string} passcode - The session passcode
 * @returns {Promise<Object<string, number>>} Map of participantId to total tokens
 */
export async function getUsageBreakdown(passcode) {
  if (!passcode) return {};

  const path = `/sessions/${passcode}/chat/tokenUsage`;
  const usageData = await _readValue(path);

  if (!usageData || typeof usageData !== 'object') return {};

  return { ...usageData };
}

// --- Private Helpers ---

/**
 * Read a value from Firebase using a one-shot subscription.
 * Returns a promise that resolves with the current value at the path.
 *
 * Handles the case where subscribe fires callback synchronously
 * (before the unsub variable is assigned) by deferring the unsubscribe.
 *
 * @param {string} path - Firebase database path
 * @returns {Promise<*>} The value at the path (or null)
 * @private
 */
function _readValue(path) {
  return new Promise((resolve) => {
    let resolved = false;
    let unsub = null;

    unsub = SyncEngine.subscribe(path, (value) => {
      if (!resolved) {
        resolved = true;
        // Defer unsub in case subscribe called callback synchronously
        if (unsub) {
          unsub();
        }
        resolve(value);
      }
    });

    // If callback was already called synchronously, clean up
    if (resolved && unsub) {
      unsub();
    }

    // If subscribe returned but callback was never called (no db),
    // resolve with null on next microtask
    if (!resolved) {
      Promise.resolve().then(() => {
        if (!resolved) {
          resolved = true;
          if (unsub) unsub();
          resolve(null);
        }
      });
    }
  });
}

// --- Default Export ---
const TokenTracker = {
  recordUsage,
  getParticipantUsage,
  getSessionUsage,
  checkBudget,
  onUsageChanged,
  getUsageBreakdown
};

export default TokenTracker;
