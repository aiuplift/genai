/**
 * Unit tests for TokenTracker
 * Tests token usage recording, retrieval, budget checking, and subscriptions.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  recordUsage,
  getParticipantUsage,
  getSessionUsage,
  checkBudget,
  onUsageChanged,
  getUsageBreakdown
} from '../../public/js/chat/token-tracker.js';
import SyncEngine from '../../public/js/core/sync-engine.js';

// --- Mock SyncEngine ---

/**
 * Creates a mock SyncEngine with in-memory data store.
 * Mimics subscribe (one-shot reads) and immediateWrite.
 */
function setupMockSyncEngine(initialData = {}) {
  const data = { ...initialData };
  const subscriptions = new Map(); // path -> [callback]

  vi.spyOn(SyncEngine, 'subscribe').mockImplementation((path, callback) => {
    // Simulate Firebase: call the callback immediately with current value
    const value = _getValueAtPath(path, data);
    // Use microtask to simulate async-like behavior but still synchronous for tests
    callback(value);

    // Track subscription for onUsageChanged tests
    if (!subscriptions.has(path)) {
      subscriptions.set(path, []);
    }
    subscriptions.get(path).push(callback);

    return () => {
      const cbs = subscriptions.get(path);
      if (cbs) {
        const idx = cbs.indexOf(callback);
        if (idx >= 0) cbs.splice(idx, 1);
      }
    };
  });

  vi.spyOn(SyncEngine, 'immediateWrite').mockImplementation((path, value) => {
    _setValueAtPath(path, value, data);
    // Notify active subscribers for ancestor paths
    _notifySubscribers(path, data, subscriptions);
    return Promise.resolve();
  });

  return {
    data,
    subscriptions,
    simulateChange(path, value) {
      _setValueAtPath(path, value, data);
      const cbs = subscriptions.get(path) || [];
      cbs.forEach(cb => cb(value));
    }
  };
}

/**
 * Get a value from a nested data object by path.
 */
function _getValueAtPath(path, data) {
  const segments = path.split('/').filter(Boolean);
  let current = data;
  for (const seg of segments) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return null;
    }
    current = current[seg];
  }
  return current !== undefined ? current : null;
}

/**
 * Set a value in a nested data object by path.
 */
function _setValueAtPath(path, value, data) {
  const segments = path.split('/').filter(Boolean);
  let current = data;
  for (let i = 0; i < segments.length - 1; i++) {
    if (!current[segments[i]] || typeof current[segments[i]] !== 'object') {
      current[segments[i]] = {};
    }
    current = current[segments[i]];
  }
  current[segments[segments.length - 1]] = value;
}

/**
 * Notify subscribers for a path and its ancestor paths.
 */
function _notifySubscribers(changedPath, data, subscriptions) {
  // Notify the exact path
  const cbs = subscriptions.get(changedPath) || [];
  const value = _getValueAtPath(changedPath, data);
  cbs.forEach(cb => cb(value));

  // Notify parent paths (for onUsageChanged which subscribes to /tokenUsage)
  const segments = changedPath.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 1; i--) {
    const parentPath = '/' + segments.slice(0, i).join('/');
    const parentCbs = subscriptions.get(parentPath) || [];
    if (parentCbs.length > 0) {
      const parentValue = _getValueAtPath(parentPath, data);
      parentCbs.forEach(cb => cb(parentValue));
    }
  }
}

describe('TokenTracker', () => {
  let mockEngine;

  beforeEach(() => {
    mockEngine = setupMockSyncEngine();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recordUsage', () => {
    it('writes total tokens (input + output) to RTDB path', async () => {
      await recordUsage('user1', 'ABC123', { input: 100, output: 50 });

      const stored = _getValueAtPath(
        '/sessions/ABC123/chat/tokenUsage/user1',
        mockEngine.data
      );
      expect(stored).toBe(150);
    });

    it('adds to existing usage (cumulative)', async () => {
      // First interaction
      await recordUsage('user1', 'ABC123', { input: 100, output: 50 });
      // Second interaction
      await recordUsage('user1', 'ABC123', { input: 200, output: 100 });

      const stored = _getValueAtPath(
        '/sessions/ABC123/chat/tokenUsage/user1',
        mockEngine.data
      );
      expect(stored).toBe(450); // 150 + 300
    });

    it('handles zero input tokens', async () => {
      await recordUsage('user1', 'ABC123', { input: 0, output: 50 });

      const stored = _getValueAtPath(
        '/sessions/ABC123/chat/tokenUsage/user1',
        mockEngine.data
      );
      expect(stored).toBe(50);
    });

    it('handles zero output tokens', async () => {
      await recordUsage('user1', 'ABC123', { input: 100, output: 0 });

      const stored = _getValueAtPath(
        '/sessions/ABC123/chat/tokenUsage/user1',
        mockEngine.data
      );
      expect(stored).toBe(100);
    });

    it('does nothing for null participantId', async () => {
      await recordUsage(null, 'ABC123', { input: 100, output: 50 });
      expect(SyncEngine.immediateWrite).not.toHaveBeenCalled();
    });

    it('does nothing for empty passcode', async () => {
      await recordUsage('user1', '', { input: 100, output: 50 });
      expect(SyncEngine.immediateWrite).not.toHaveBeenCalled();
    });

    it('does nothing for null tokens', async () => {
      await recordUsage('user1', 'ABC123', null);
      expect(SyncEngine.immediateWrite).not.toHaveBeenCalled();
    });

    it('does nothing when total tokens is zero', async () => {
      await recordUsage('user1', 'ABC123', { input: 0, output: 0 });
      expect(SyncEngine.immediateWrite).not.toHaveBeenCalled();
    });

    it('writes to the correct path', async () => {
      await recordUsage('participant-xyz', 'PASS99', { input: 10, output: 20 });

      expect(SyncEngine.immediateWrite).toHaveBeenCalledWith(
        '/sessions/PASS99/chat/tokenUsage/participant-xyz',
        30
      );
    });
  });

  describe('getParticipantUsage', () => {
    it('returns 0 when no usage recorded', async () => {
      const usage = await getParticipantUsage('user1', 'ABC123');
      expect(usage).toBe(0);
    });

    it('returns recorded usage for a participant', async () => {
      // Pre-populate data
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage/user1', 500, mockEngine.data);

      const usage = await getParticipantUsage('user1', 'ABC123');
      expect(usage).toBe(500);
    });

    it('returns 0 for empty participantId', async () => {
      const usage = await getParticipantUsage('', 'ABC123');
      expect(usage).toBe(0);
    });

    it('returns 0 for empty passcode', async () => {
      const usage = await getParticipantUsage('user1', '');
      expect(usage).toBe(0);
    });
  });

  describe('getSessionUsage', () => {
    it('returns 0 when no participants have usage', async () => {
      const usage = await getSessionUsage('ABC123');
      expect(usage).toBe(0);
    });

    it('sums usage across all participants', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', {
        user1: 100,
        user2: 200,
        user3: 350
      }, mockEngine.data);

      const usage = await getSessionUsage('ABC123');
      expect(usage).toBe(650);
    });

    it('handles single participant', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', {
        user1: 999
      }, mockEngine.data);

      const usage = await getSessionUsage('ABC123');
      expect(usage).toBe(999);
    });

    it('returns 0 for empty passcode', async () => {
      const usage = await getSessionUsage('');
      expect(usage).toBe(0);
    });

    it('handles null values in usage data', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', {
        user1: 100,
        user2: null,
        user3: 200
      }, mockEngine.data);

      const usage = await getSessionUsage('ABC123');
      expect(usage).toBe(300);
    });
  });

  describe('checkBudget', () => {
    it('returns allowed=true with no budget configured (null)', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 500 }, mockEngine.data);
      // No tokenBudget set — defaults to null

      const result = await checkBudget('ABC123');
      expect(result).toEqual({
        allowed: true,
        usage: 500,
        budget: null,
        percentage: 0
      });
    });

    it('returns allowed=true when usage is below budget', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 400 }, mockEngine.data);
      _setValueAtPath('/sessions/ABC123/chat/config/tokenBudget', 1000, mockEngine.data);

      const result = await checkBudget('ABC123');
      expect(result).toEqual({
        allowed: true,
        usage: 400,
        budget: 1000,
        percentage: 40
      });
    });

    it('returns allowed=false when usage equals budget', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 1000 }, mockEngine.data);
      _setValueAtPath('/sessions/ABC123/chat/config/tokenBudget', 1000, mockEngine.data);

      const result = await checkBudget('ABC123');
      expect(result).toEqual({
        allowed: false,
        usage: 1000,
        budget: 1000,
        percentage: 100
      });
    });

    it('returns allowed=false when usage exceeds budget', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 1200 }, mockEngine.data);
      _setValueAtPath('/sessions/ABC123/chat/config/tokenBudget', 1000, mockEngine.data);

      const result = await checkBudget('ABC123');
      expect(result).toEqual({
        allowed: false,
        usage: 1200,
        budget: 1000,
        percentage: 120
      });
    });

    it('returns percentage >= 80 when at warning threshold', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 800 }, mockEngine.data);
      _setValueAtPath('/sessions/ABC123/chat/config/tokenBudget', 1000, mockEngine.data);

      const result = await checkBudget('ABC123');
      expect(result.allowed).toBe(true);
      expect(result.percentage).toBe(80);
    });

    it('returns defaults for empty passcode', async () => {
      const result = await checkBudget('');
      expect(result).toEqual({
        allowed: true,
        usage: 0,
        budget: null,
        percentage: 0
      });
    });

    it('rounds percentage to nearest whole number', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', { user1: 333 }, mockEngine.data);
      _setValueAtPath('/sessions/ABC123/chat/config/tokenBudget', 1000, mockEngine.data);

      const result = await checkBudget('ABC123');
      expect(result.percentage).toBe(33); // 33.3 rounds to 33
    });
  });

  describe('onUsageChanged', () => {
    it('subscribes to the token usage path', () => {
      const callback = vi.fn();
      onUsageChanged('ABC123', callback);

      expect(SyncEngine.subscribe).toHaveBeenCalledWith(
        '/sessions/ABC123/chat/tokenUsage',
        expect.any(Function)
      );
    });

    it('calls callback with current usage data immediately', () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', {
        user1: 100,
        user2: 200
      }, mockEngine.data);

      const callback = vi.fn();
      onUsageChanged('ABC123', callback);

      expect(callback).toHaveBeenCalledWith({ user1: 100, user2: 200 });
    });

    it('calls callback with empty object when no data exists', () => {
      const callback = vi.fn();
      onUsageChanged('ABC123', callback);

      expect(callback).toHaveBeenCalledWith({});
    });

    it('returns an unsubscribe function', () => {
      const callback = vi.fn();
      const unsub = onUsageChanged('ABC123', callback);

      expect(typeof unsub).toBe('function');
      unsub(); // Should not throw
    });

    it('returns no-op for empty passcode', () => {
      const callback = vi.fn();
      const unsub = onUsageChanged('', callback);

      expect(typeof unsub).toBe('function');
      expect(callback).not.toHaveBeenCalled();
    });

    it('returns no-op for non-function callback', () => {
      const unsub = onUsageChanged('ABC123', null);
      expect(typeof unsub).toBe('function');
    });

    it('receives updates when usage changes', () => {
      const callback = vi.fn();
      onUsageChanged('ABC123', callback);
      callback.mockClear();

      // Simulate a usage change
      mockEngine.simulateChange('/sessions/ABC123/chat/tokenUsage', {
        user1: 100,
        user2: 300
      });

      expect(callback).toHaveBeenCalledWith({ user1: 100, user2: 300 });
    });
  });

  describe('getUsageBreakdown', () => {
    it('returns empty object when no usage data', async () => {
      const breakdown = await getUsageBreakdown('ABC123');
      expect(breakdown).toEqual({});
    });

    it('returns usage per participant', async () => {
      _setValueAtPath('/sessions/ABC123/chat/tokenUsage', {
        user1: 100,
        user2: 250,
        user3: 400
      }, mockEngine.data);

      const breakdown = await getUsageBreakdown('ABC123');
      expect(breakdown).toEqual({
        user1: 100,
        user2: 250,
        user3: 400
      });
    });

    it('returns empty object for empty passcode', async () => {
      const breakdown = await getUsageBreakdown('');
      expect(breakdown).toEqual({});
    });
  });

  describe('integration: recordUsage + getParticipantUsage + getSessionUsage', () => {
    it('accumulates across multiple participants', async () => {
      await recordUsage('user1', 'SESS01', { input: 50, output: 30 });
      await recordUsage('user2', 'SESS01', { input: 100, output: 70 });
      await recordUsage('user1', 'SESS01', { input: 20, output: 10 });

      const user1Usage = await getParticipantUsage('user1', 'SESS01');
      const user2Usage = await getParticipantUsage('user2', 'SESS01');
      const sessionUsage = await getSessionUsage('SESS01');

      expect(user1Usage).toBe(110); // (50+30) + (20+10)
      expect(user2Usage).toBe(170); // (100+70)
      expect(sessionUsage).toBe(280); // 110 + 170
    });

    it('budget check reflects accumulated usage', async () => {
      _setValueAtPath('/sessions/SESS01/chat/config/tokenBudget', 300, mockEngine.data);

      await recordUsage('user1', 'SESS01', { input: 100, output: 50 });
      await recordUsage('user2', 'SESS01', { input: 80, output: 40 });

      const budget = await checkBudget('SESS01');
      expect(budget.usage).toBe(270); // 150 + 120
      expect(budget.allowed).toBe(true);
      expect(budget.percentage).toBe(90); // 270/300 = 90%

      // One more interaction pushes over budget
      await recordUsage('user1', 'SESS01', { input: 20, output: 20 });
      const budgetAfter = await checkBudget('SESS01');
      expect(budgetAfter.usage).toBe(310);
      expect(budgetAfter.allowed).toBe(false);
      expect(budgetAfter.percentage).toBe(103);
    });
  });
});
