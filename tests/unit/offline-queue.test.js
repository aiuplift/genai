/**
 * Unit tests for OfflineQueue
 * Tests queue operations, cap enforcement, FIFO flush, and sessionStorage recovery.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
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
} from '../../public/js/core/offline-queue.js';

describe('OfflineQueue', () => {
  let mockWriteFn;

  beforeEach(() => {
    mockWriteFn = vi.fn().mockResolvedValue(undefined);
    // Clear sessionStorage before each test
    sessionStorage.clear();
    initQueue(mockWriteFn);
  });

  afterEach(() => {
    destroyQueue();
  });

  describe('QUEUE_CONSTANTS', () => {
    it('has a max queue size of 50', () => {
      expect(QUEUE_CONSTANTS.MAX_QUEUE_SIZE).toBe(50);
    });

    it('has a defined storage key', () => {
      expect(QUEUE_CONSTANTS.STORAGE_KEY).toBe('aie_offline_queue');
    });
  });

  describe('queueChange', () => {
    it('adds an entry to the queue and returns queued: true', () => {
      const result = queueChange('/test/path', { value: 'hello' });
      expect(result.queued).toBe(true);
      expect(result.queueSize).toBe(1);
    });

    it('increments queue size with each addition', () => {
      queueChange('/path/1', 'a');
      queueChange('/path/2', 'b');
      queueChange('/path/3', 'c');
      expect(getQueueSize()).toBe(3);
    });

    it('stores entries with correct structure', () => {
      const value = { value: 'test', updatedBy: 'user1', updatedAt: 1234567890 };
      queueChange('/test/path', value);

      const snapshot = getQueueSnapshot();
      expect(snapshot).toHaveLength(1);
      expect(snapshot[0].path).toBe('/test/path');
      expect(snapshot[0].value).toEqual(value);
      expect(snapshot[0].timestamp).toBeTypeOf('number');
      expect(snapshot[0].retryCount).toBe(0);
    });

    it('preserves insertion order', () => {
      queueChange('/path/1', 'first');
      queueChange('/path/2', 'second');
      queueChange('/path/3', 'third');

      const snapshot = getQueueSnapshot();
      expect(snapshot[0].path).toBe('/path/1');
      expect(snapshot[1].path).toBe('/path/2');
      expect(snapshot[2].path).toBe('/path/3');
    });

    it('rejects when queue is at capacity (50 entries)', () => {
      // Fill the queue to capacity
      for (let i = 0; i < 50; i++) {
        queueChange(`/path/${i}`, `value-${i}`);
      }
      expect(getQueueSize()).toBe(50);

      // Attempt to add one more
      const result = queueChange('/path/overflow', 'rejected');
      expect(result.queued).toBe(false);
      expect(result.queueSize).toBe(50);
      expect(getQueueSize()).toBe(50);
    });

    it('persists to sessionStorage', () => {
      queueChange('/test/path', 'stored');

      const stored = sessionStorage.getItem(QUEUE_CONSTANTS.STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].path).toBe('/test/path');
    });
  });

  describe('getQueueSize', () => {
    it('returns 0 for empty queue', () => {
      expect(getQueueSize()).toBe(0);
    });

    it('returns correct count after additions', () => {
      queueChange('/a', 1);
      queueChange('/b', 2);
      expect(getQueueSize()).toBe(2);
    });
  });

  describe('isQueueFull', () => {
    it('returns false when queue is not at capacity', () => {
      expect(isQueueFull()).toBe(false);
      queueChange('/a', 1);
      expect(isQueueFull()).toBe(false);
    });

    it('returns true when queue reaches capacity', () => {
      for (let i = 0; i < 50; i++) {
        queueChange(`/path/${i}`, i);
      }
      expect(isQueueFull()).toBe(true);
    });
  });

  describe('flushQueue', () => {
    it('sends queued changes in FIFO order', async () => {
      queueChange('/path/1', 'first');
      queueChange('/path/2', 'second');
      queueChange('/path/3', 'third');

      const result = await flushQueue();

      expect(result.flushed).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockWriteFn).toHaveBeenCalledTimes(3);

      // Verify FIFO order
      expect(mockWriteFn.mock.calls[0]).toEqual(['/path/1', 'first']);
      expect(mockWriteFn.mock.calls[1]).toEqual(['/path/2', 'second']);
      expect(mockWriteFn.mock.calls[2]).toEqual(['/path/3', 'third']);
    });

    it('empties the queue after successful flush', async () => {
      queueChange('/path/1', 'a');
      queueChange('/path/2', 'b');

      await flushQueue();

      expect(getQueueSize()).toBe(0);
    });

    it('returns {flushed: 0, failed: 0} for empty queue', async () => {
      const result = await flushQueue();
      expect(result).toEqual({ flushed: 0, failed: 0 });
      expect(mockWriteFn).not.toHaveBeenCalled();
    });

    it('handles write failures gracefully', async () => {
      mockWriteFn.mockRejectedValue(new Error('Network error'));

      queueChange('/path/1', 'a');
      queueChange('/path/2', 'b');

      const result = await flushQueue();

      expect(result.flushed).toBe(0);
      expect(result.failed).toBe(2);
      // Failed entries remain in the queue (moved to end with incremented retryCount)
      expect(getQueueSize()).toBe(2);
    });

    it('increments retryCount on failure', async () => {
      mockWriteFn.mockRejectedValue(new Error('fail'));

      queueChange('/path/1', 'a');
      await flushQueue();

      const snapshot = getQueueSnapshot();
      expect(snapshot[0].retryCount).toBe(1);
    });

    it('partially succeeds when some writes fail', async () => {
      let callCount = 0;
      mockWriteFn.mockImplementation(() => {
        callCount++;
        if (callCount === 2) return Promise.reject(new Error('fail'));
        return Promise.resolve();
      });

      queueChange('/path/1', 'a');
      queueChange('/path/2', 'b');
      queueChange('/path/3', 'c');

      const result = await flushQueue();

      expect(result.flushed).toBe(2);
      expect(result.failed).toBe(1);
      expect(getQueueSize()).toBe(1); // Only the failed one remains
    });

    it('does not flush concurrently (prevents re-entrancy)', async () => {
      // Create a slow write function
      mockWriteFn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      queueChange('/path/1', 'a');

      // Start two flushes simultaneously
      const flush1 = flushQueue();
      const flush2 = flushQueue();

      const [result1, result2] = await Promise.all([flush1, flush2]);

      // Second flush should be a no-op since first is already running
      expect(result2).toEqual({ flushed: 0, failed: 0 });
    });

    it('clears sessionStorage after successful flush', async () => {
      queueChange('/path/1', 'a');
      expect(sessionStorage.getItem(QUEUE_CONSTANTS.STORAGE_KEY)).not.toBeNull();

      await flushQueue();

      const stored = sessionStorage.getItem(QUEUE_CONSTANTS.STORAGE_KEY);
      // After flush, queue is empty so storage should reflect that
      expect(JSON.parse(stored)).toEqual([]);
    });
  });

  describe('crash recovery from sessionStorage', () => {
    it('recovers queue from sessionStorage on init', () => {
      // Destroy the current queue first without clearing storage
      destroyQueue();

      // Set up recovery data in sessionStorage
      const entries = [
        { path: '/recovered/1', value: 'data1', timestamp: 1000, retryCount: 0 },
        { path: '/recovered/2', value: 'data2', timestamp: 2000, retryCount: 1 }
      ];
      sessionStorage.setItem(QUEUE_CONSTANTS.STORAGE_KEY, JSON.stringify(entries));

      // Re-init to trigger recovery
      initQueue(mockWriteFn);

      expect(getQueueSize()).toBe(2);
      const snapshot = getQueueSnapshot();
      expect(snapshot[0].path).toBe('/recovered/1');
      expect(snapshot[1].path).toBe('/recovered/2');
    });

    it('ignores invalid entries during recovery', () => {
      destroyQueue();

      const entries = [
        { path: '/valid', value: 'ok', timestamp: 1000, retryCount: 0 },
        { path: '', value: 'bad', timestamp: 2000, retryCount: 0 }, // Empty path
        null, // Null entry
        { value: 'no-path', timestamp: 3000, retryCount: 0 } // Missing path
      ];
      sessionStorage.setItem(QUEUE_CONSTANTS.STORAGE_KEY, JSON.stringify(entries));

      initQueue(mockWriteFn);

      expect(getQueueSize()).toBe(1);
      expect(getQueueSnapshot()[0].path).toBe('/valid');
    });

    it('handles corrupt sessionStorage data gracefully', () => {
      sessionStorage.setItem(QUEUE_CONSTANTS.STORAGE_KEY, 'not-valid-json{{{');

      destroyQueue();
      initQueue(mockWriteFn);

      expect(getQueueSize()).toBe(0);
    });

    it('caps recovered entries at MAX_QUEUE_SIZE', () => {
      destroyQueue();

      const entries = [];
      for (let i = 0; i < 60; i++) {
        entries.push({ path: `/path/${i}`, value: i, timestamp: i * 1000, retryCount: 0 });
      }
      sessionStorage.setItem(QUEUE_CONSTANTS.STORAGE_KEY, JSON.stringify(entries));

      initQueue(mockWriteFn);

      expect(getQueueSize()).toBe(50);
    });
  });

  describe('clearQueue', () => {
    it('removes all entries from the queue', () => {
      queueChange('/a', 1);
      queueChange('/b', 2);
      clearQueue();
      expect(getQueueSize()).toBe(0);
    });

    it('clears sessionStorage', () => {
      queueChange('/a', 1);
      clearQueue();
      expect(sessionStorage.getItem(QUEUE_CONSTANTS.STORAGE_KEY)).toBeNull();
    });
  });

  describe('destroyQueue', () => {
    it('clears queue and nullifies write function', () => {
      queueChange('/a', 1);
      destroyQueue();
      expect(getQueueSize()).toBe(0);
    });
  });
});
