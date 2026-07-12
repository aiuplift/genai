/**
 * Unit tests for SyncEngine
 * Tests debounced writes, immediate writes, subscriptions, and connection monitoring.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
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
  CONSTANTS
} from '../../public/js/core/sync-engine.js';

// --- Mock Firebase Database ---

function createMockDatabase() {
  const listeners = new Map(); // path -> { event -> [callbacks] }
  const data = {};

  function getListeners(path, event) {
    const key = `${path}::${event}`;
    if (!listeners.has(key)) {
      listeners.set(key, []);
    }
    return listeners.get(key);
  }

  function createSnapshot(value, key) {
    return {
      val: () => value,
      exists: () => value !== null && value !== undefined,
      key: key || null
    };
  }

  const db = {
    ref(path) {
      return {
        set(value) {
          // Store the value
          data[path] = value;
          return Promise.resolve();
        },
        on(event, callback) {
          getListeners(path, event).push(callback);
          // For .info/connected, fire immediately with true
          if (path === '.info/connected' && event === 'value') {
            callback(createSnapshot(true, 'connected'));
          }
        },
        off(event, callback) {
          const cbs = getListeners(path, event);
          const idx = cbs.indexOf(callback);
          if (idx >= 0) cbs.splice(idx, 1);
        }
      };
    },
    // Test helper: simulate a value change at a path
    _simulateValue(path, value, key) {
      const cbs = getListeners(path, 'value');
      const snapshot = createSnapshot(value, key);
      cbs.forEach(cb => cb(snapshot));
    },
    // Test helper: simulate a child_changed event
    _simulateChildChanged(path, childKey, childValue) {
      const cbs = getListeners(path, 'child_changed');
      const snapshot = createSnapshot(childValue, childKey);
      cbs.forEach(cb => cb(snapshot));
    },
    // Test helper: get stored data
    _getData() { return { ...data }; },
    // Test helper: get listener count for a path/event
    _getListenerCount(path, event) {
      return getListeners(path, event).length;
    }
  };

  return db;
}

describe('SyncEngine', () => {
  let mockDb;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDb = createMockDatabase();
    init(mockDb);
  });

  afterEach(() => {
    destroy();
    vi.useRealTimers();
  });

  describe('init and getDatabase', () => {
    it('stores the database reference', () => {
      expect(getDatabase()).toBe(mockDb);
    });

    it('sets up connection monitoring on init', () => {
      // Connection listener should have been registered on .info/connected
      expect(mockDb._getListenerCount('.info/connected', 'value')).toBe(1);
    });

    it('reports connected state after init', () => {
      expect(isConnected()).toBe(true);
    });
  });

  describe('debouncedWrite', () => {
    it('does not write immediately', () => {
      debouncedWrite('/test/path', 'hello');
      expect(mockDb._getData()['/test/path']).toBeUndefined();
    });

    it('writes after 2-second debounce delay', () => {
      debouncedWrite('/test/path', 'hello');
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(mockDb._getData()['/test/path']).toBe('hello');
    });

    it('resets the timer on subsequent calls to the same path', () => {
      debouncedWrite('/test/path', 'first');
      vi.advanceTimersByTime(1500); // 1.5s — not yet triggered
      debouncedWrite('/test/path', 'second');
      vi.advanceTimersByTime(1500); // 1.5s more from second call (3s total, but only 1.5s from last)
      expect(mockDb._getData()['/test/path']).toBeUndefined();

      vi.advanceTimersByTime(500); // Now 2s from last call
      expect(mockDb._getData()['/test/path']).toBe('second');
    });

    it('only writes the last value when called multiple times', () => {
      debouncedWrite('/test/path', 'a');
      debouncedWrite('/test/path', 'b');
      debouncedWrite('/test/path', 'c');
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(mockDb._getData()['/test/path']).toBe('c');
    });

    it('maintains independent timers per path', () => {
      debouncedWrite('/path/1', 'one');
      vi.advanceTimersByTime(1000);
      debouncedWrite('/path/2', 'two');
      vi.advanceTimersByTime(1000); // path/1 should fire, path/2 not yet

      expect(mockDb._getData()['/path/1']).toBe('one');
      expect(mockDb._getData()['/path/2']).toBeUndefined();

      vi.advanceTimersByTime(1000); // Now path/2 fires
      expect(mockDb._getData()['/path/2']).toBe('two');
    });

    it('does nothing for empty path', () => {
      debouncedWrite('', 'value');
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(mockDb._getData()).toEqual({});
    });

    it('tracks pending writes', () => {
      expect(hasPendingWrite('/test')).toBe(false);
      debouncedWrite('/test', 'x');
      expect(hasPendingWrite('/test')).toBe(true);
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(hasPendingWrite('/test')).toBe(false);
    });

    it('reports correct pending write count', () => {
      expect(getPendingWriteCount()).toBe(0);
      debouncedWrite('/a', 1);
      debouncedWrite('/b', 2);
      expect(getPendingWriteCount()).toBe(2);
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(getPendingWriteCount()).toBe(0);
    });
  });

  describe('immediateWrite', () => {
    it('writes to Firebase immediately', async () => {
      await immediateWrite('/test/immediate', 'now');
      expect(mockDb._getData()['/test/immediate']).toBe('now');
    });

    it('returns a promise', () => {
      const result = immediateWrite('/test/promise', 42);
      expect(result).toBeInstanceOf(Promise);
    });

    it('does nothing for empty path', async () => {
      await immediateWrite('', 'value');
      expect(mockDb._getData()).toEqual({});
    });

    it('can write objects', async () => {
      const obj = { name: 'test', value: 123 };
      await immediateWrite('/test/obj', obj);
      expect(mockDb._getData()['/test/obj']).toEqual(obj);
    });
  });

  describe('subscribe', () => {
    it('registers a listener on the Firebase path', () => {
      const cb = vi.fn();
      subscribe('/some/path', cb);
      expect(mockDb._getListenerCount('/some/path', 'value')).toBe(1);
    });

    it('calls callback when value changes', () => {
      const cb = vi.fn();
      subscribe('/some/path', cb);

      mockDb._simulateValue('/some/path', 'new-value', 'path');
      expect(cb).toHaveBeenCalledWith('new-value', 'path');
    });

    it('calls callback with null for non-existent values', () => {
      const cb = vi.fn();
      subscribe('/some/path', cb);

      mockDb._simulateValue('/some/path', null, 'path');
      expect(cb).toHaveBeenCalledWith(null, 'path');
    });

    it('returns an unsubscribe function that removes the listener', () => {
      const cb = vi.fn();
      const unsub = subscribe('/some/path', cb);

      expect(mockDb._getListenerCount('/some/path', 'value')).toBe(1);
      unsub();
      expect(mockDb._getListenerCount('/some/path', 'value')).toBe(0);
    });

    it('returns a no-op unsubscribe when db is null', () => {
      destroy(); // Clear the db
      const cb = vi.fn();
      const unsub = subscribe('/some/path', cb);
      expect(unsub).toBeInstanceOf(Function);
      unsub(); // Should not throw
    });

    it('handles errors in subscriber callbacks gracefully', () => {
      const errorCb = vi.fn(() => { throw new Error('test error'); });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      subscribe('/some/path', errorCb);
      mockDb._simulateValue('/some/path', 'value', 'path');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToChildChanges', () => {
    it('registers a child_changed listener', () => {
      const cb = vi.fn();
      subscribeToChildChanges('/parent', cb);
      expect(mockDb._getListenerCount('/parent', 'child_changed')).toBe(1);
    });

    it('calls callback with child key and value', () => {
      const cb = vi.fn();
      subscribeToChildChanges('/parent', cb);

      mockDb._simulateChildChanged('/parent', 'child1', { text: 'hello' });
      expect(cb).toHaveBeenCalledWith('child1', { text: 'hello' });
    });

    it('returns an unsubscribe function', () => {
      const cb = vi.fn();
      const unsub = subscribeToChildChanges('/parent', cb);

      unsub();
      expect(mockDb._getListenerCount('/parent', 'child_changed')).toBe(0);
    });
  });

  describe('onConnectionChange', () => {
    it('calls callback immediately with current state', () => {
      const cb = vi.fn();
      onConnectionChange(cb);
      expect(cb).toHaveBeenCalledWith(true);
    });

    it('notifies when connection drops', () => {
      const cb = vi.fn();
      onConnectionChange(cb);
      cb.mockClear();

      // Simulate disconnection
      mockDb._simulateValue('.info/connected', false, 'connected');
      expect(cb).toHaveBeenCalledWith(false);
      expect(isConnected()).toBe(false);
    });

    it('notifies when connection restores', () => {
      const cb = vi.fn();

      // First go offline
      mockDb._simulateValue('.info/connected', false, 'connected');
      onConnectionChange(cb);
      cb.mockClear();

      // Then reconnect
      mockDb._simulateValue('.info/connected', true, 'connected');
      expect(cb).toHaveBeenCalledWith(true);
      expect(isConnected()).toBe(true);
    });

    it('returns an unsubscribe function', () => {
      const cb = vi.fn();
      const unsub = onConnectionChange(cb);
      cb.mockClear();

      unsub();

      // Should not receive further updates
      mockDb._simulateValue('.info/connected', false, 'connected');
      expect(cb).not.toHaveBeenCalled();
    });

    it('does not notify if state has not actually changed', () => {
      const cb = vi.fn();
      onConnectionChange(cb);
      cb.mockClear();

      // Simulate same state (true -> true)
      mockDb._simulateValue('.info/connected', true, 'connected');
      expect(cb).not.toHaveBeenCalled();
    });

    it('handles non-function callbacks gracefully', () => {
      const unsub = onConnectionChange(null);
      expect(unsub).toBeInstanceOf(Function);
      unsub(); // Should not throw
    });
  });

  describe('cancelAllPendingWrites', () => {
    it('clears all pending debounce timers', () => {
      debouncedWrite('/a', 1);
      debouncedWrite('/b', 2);
      debouncedWrite('/c', 3);
      expect(getPendingWriteCount()).toBe(3);

      cancelAllPendingWrites();
      expect(getPendingWriteCount()).toBe(0);

      // Advancing time should not trigger writes
      vi.advanceTimersByTime(CONSTANTS.DEBOUNCE_DELAY_MS);
      expect(mockDb._getData()).toEqual({});
    });
  });

  describe('destroy', () => {
    it('removes connection listener', () => {
      const initialCount = mockDb._getListenerCount('.info/connected', 'value');
      destroy();
      expect(mockDb._getListenerCount('.info/connected', 'value')).toBe(initialCount - 1);
    });

    it('cancels all pending writes', () => {
      debouncedWrite('/test', 'value');
      destroy();
      expect(getPendingWriteCount()).toBe(0);
    });

    it('clears the database reference', () => {
      destroy();
      expect(getDatabase()).toBeNull();
    });

    it('resets connection state to true', () => {
      mockDb._simulateValue('.info/connected', false, 'connected');
      expect(isConnected()).toBe(false);
      destroy();
      expect(isConnected()).toBe(true);
    });
  });

  describe('CONSTANTS', () => {
    it('exposes the debounce delay', () => {
      expect(CONSTANTS.DEBOUNCE_DELAY_MS).toBe(2000);
    });
  });
});
