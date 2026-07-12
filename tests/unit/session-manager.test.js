/**
 * Unit tests for SessionManager
 * Tests passcode generation, validation, lockout logic, and session CRUD.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generatePasscode,
  normalizePasscode,
  isValidPasscodeFormat,
  isLockedOut,
  recordFailedAttempt,
  getLockoutState,
  saveLockoutState,
  createSession,
  validatePasscode,
  deleteSession,
  getActiveSession,
  setActiveSession,
  CONSTANTS
} from '../../public/js/core/session-manager.js';

// --- In-memory storage mock for sessionStorage ---
function createMockStorage() {
  const store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = value; },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); }
  };
}

// --- Mock Firebase database ---
function createMockDatabase(initialData = {}) {
  const data = { ...initialData };

  function refAt(path) {
    const parts = path.replace(/^\//, '').split('/');
    let current = data;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }
    return current;
  }

  function setAt(path, value) {
    const parts = path.replace(/^\//, '').split('/');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  function removeAt(path) {
    const parts = path.replace(/^\//, '').split('/');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) return;
      current = current[parts[i]];
    }
    delete current[parts[parts.length - 1]];
  }

  return {
    ref(path) {
      return {
        once() {
          const val = refAt(path);
          return Promise.resolve({
            exists() { return val !== undefined && val !== null; },
            val() { return val; }
          });
        },
        set(value) {
          setAt(path, value);
          return Promise.resolve();
        },
        child(childPath) {
          return this._db.ref(`${path}/${childPath}`);
        },
        remove() {
          removeAt(path);
          return Promise.resolve();
        },
        _db: null
      };
    },
    _data: data
  };
}

// Fix circular ref helper
function fixMockDb(db) {
  const originalRef = db.ref.bind(db);
  db.ref = (path) => {
    const r = originalRef(path);
    r._db = db;
    r.child = (childPath) => db.ref(`${path}/${childPath}`);
    return r;
  };
  return db;
}

// --- Tests ---

describe('SessionManager - Passcode Generation', () => {
  it('generates a 6-character passcode', () => {
    const code = generatePasscode();
    expect(code).toHaveLength(6);
  });

  it('generates passcodes with only valid characters [A-Z0-9]', () => {
    for (let i = 0; i < 50; i++) {
      const code = generatePasscode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  it('generates different passcodes (non-deterministic)', () => {
    const codes = new Set();
    for (let i = 0; i < 20; i++) {
      codes.add(generatePasscode());
    }
    // With 36^6 possibilities, 20 codes should be unique
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('SessionManager - Passcode Normalization', () => {
  it('converts lowercase to uppercase', () => {
    expect(normalizePasscode('abc123')).toBe('ABC123');
  });

  it('trims whitespace', () => {
    expect(normalizePasscode('  ABC123  ')).toBe('ABC123');
  });

  it('handles mixed case', () => {
    expect(normalizePasscode('aBc1d2')).toBe('ABC1D2');
  });

  it('returns empty string for non-string input', () => {
    expect(normalizePasscode(null)).toBe('');
    expect(normalizePasscode(undefined)).toBe('');
    expect(normalizePasscode(123)).toBe('');
  });
});

describe('SessionManager - Passcode Format Validation', () => {
  it('accepts valid 6-char alphanumeric passcode', () => {
    expect(isValidPasscodeFormat('ABC123')).toBe(true);
    expect(isValidPasscodeFormat('ZZZZZ9')).toBe(true);
    expect(isValidPasscodeFormat('000000')).toBe(true);
  });

  it('rejects passcodes with wrong length', () => {
    expect(isValidPasscodeFormat('ABC12')).toBe(false);
    expect(isValidPasscodeFormat('ABC1234')).toBe(false);
    expect(isValidPasscodeFormat('')).toBe(false);
  });

  it('rejects passcodes with invalid characters', () => {
    expect(isValidPasscodeFormat('abc123')).toBe(false); // lowercase
    expect(isValidPasscodeFormat('AB-123')).toBe(false); // special char
    expect(isValidPasscodeFormat('AB 123')).toBe(false); // space
  });

  it('rejects non-string input', () => {
    expect(isValidPasscodeFormat(null)).toBe(false);
    expect(isValidPasscodeFormat(undefined)).toBe(false);
    expect(isValidPasscodeFormat(123456)).toBe(false);
  });
});

describe('SessionManager - Lockout Logic', () => {
  let storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('initially not locked out', () => {
    const result = isLockedOut('client1', { storage });
    expect(result.locked).toBe(false);
  });

  it('not locked after fewer than 5 attempts', () => {
    const now = 1000000;
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt('client1', { storage, now: now + i * 1000 });
    }
    const result = isLockedOut('client1', { storage, now: now + 4000 });
    expect(result.locked).toBe(false);
  });

  it('locked after 5 failed attempts within 15-minute window', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('client1', { storage, now: now + i * 1000 });
    }
    const result = isLockedOut('client1', { storage, now: now + 5000 });
    expect(result.locked).toBe(true);
    expect(result.remainingSeconds).toBeGreaterThan(0);
    expect(result.remainingSeconds).toBeLessThanOrEqual(300);
  });

  it('lockout duration is 5 minutes', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('client1', { storage, now: now + i * 1000 });
    }
    // Check right after 5th attempt
    const result = isLockedOut('client1', { storage, now: now + 4000 + 1 });
    expect(result.locked).toBe(true);

    // Check after lockout expires (5 min = 300000 ms from 5th attempt)
    const afterLockout = isLockedOut('client1', { storage, now: now + 4000 + CONSTANTS.LOCKOUT_DURATION_MS + 1 });
    expect(afterLockout.locked).toBe(false);
  });

  it('resets window if attempts are spread beyond 15 minutes', () => {
    const now = 1000000;
    // 4 attempts in first window
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt('client1', { storage, now: now + i * 1000 });
    }
    // 5th attempt after 15-minute window expires — resets counter
    const afterWindow = now + CONSTANTS.LOCKOUT_WINDOW_MS + 1000;
    recordFailedAttempt('client1', { storage, now: afterWindow });

    const result = isLockedOut('client1', { storage, now: afterWindow + 100 });
    expect(result.locked).toBe(false);

    // Verify state was reset — should be at 1 attempt now
    const state = getLockoutState('client1', storage);
    expect(state.attempts).toBe(1);
  });

  it('does not record attempts while locked out', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('client1', { storage, now: now + i * 1000 });
    }
    // Try to record while locked
    recordFailedAttempt('client1', { storage, now: now + 6000 });

    const state = getLockoutState('client1', storage);
    expect(state.attempts).toBe(5); // Should not increment
  });

  it('tracks different clients independently', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('clientA', { storage, now: now + i * 1000 });
    }
    recordFailedAttempt('clientB', { storage, now });

    expect(isLockedOut('clientA', { storage, now: now + 5000 }).locked).toBe(true);
    expect(isLockedOut('clientB', { storage, now: now + 5000 }).locked).toBe(false);
  });
});

describe('SessionManager - Session CRUD', () => {
  let db;

  beforeEach(() => {
    db = fixMockDb(createMockDatabase({ sessions: {} }));
  });

  it('creates a session with metadata and modules', async () => {
    const result = await createSession('facilitator1', 'Test Session', { db });

    expect(result.passcode).toMatch(/^[A-Z0-9]{6}$/);
    expect(db._data.sessions[result.passcode].meta).toMatchObject({
      name: 'Test Session',
      facilitatorId: 'facilitator1',
      passcode: result.passcode
    });
    expect(db._data.sessions[result.passcode].meta.createdAt).toBeTypeOf('number');
    // All 10 modules should be locked
    const modules = db._data.sessions[result.passcode].modules;
    for (let i = 1; i <= 10; i++) {
      expect(modules[`module${i}`].locked).toBe(true);
    }
  });

  it('validates a correct passcode (case-insensitive)', async () => {
    // Pre-populate a session
    db._data.sessions = {
      'ABC123': {
        meta: { name: 'My Session', passcode: 'ABC123', facilitatorId: 'f1', createdAt: 1000 }
      }
    };

    const result = await validatePasscode('abc123', { db });
    expect(result.valid).toBe(true);
    expect(result.sessionData.name).toBe('My Session');
  });

  it('rejects an invalid passcode', async () => {
    db._data.sessions = {
      'ABC123': {
        meta: { name: 'My Session', passcode: 'ABC123', facilitatorId: 'f1', createdAt: 1000 }
      }
    };

    const result = await validatePasscode('XYZ999', { db });
    expect(result.valid).toBe(false);
    expect(result.sessionData).toBeUndefined();
  });

  it('rejects malformed passcode input', async () => {
    const result = await validatePasscode('ab', { db });
    expect(result.valid).toBe(false);
  });

  it('deletes a session', async () => {
    db._data.sessions = {
      'DEL001': {
        meta: { name: 'To Delete', passcode: 'DEL001', facilitatorId: 'f1', createdAt: 1000 },
        modules: {},
        groups: {}
      }
    };

    await deleteSession('DEL001', { db });
    expect(db._data.sessions['DEL001']).toBeUndefined();
  });

  it('throws on max concurrent sessions', async () => {
    // Create 20 sessions
    const sessions = {};
    for (let i = 0; i < 20; i++) {
      const code = `AA${String(i).padStart(4, '0')}`;
      sessions[code] = { meta: { passcode: code } };
    }
    db._data.sessions = sessions;

    await expect(
      createSession('f1', 'Too Many', { db })
    ).rejects.toThrow(/Maximum of 20 concurrent sessions/);
  });

  it('throws when Firebase is not available', async () => {
    await expect(
      createSession('f1', 'No Firebase', { db: null })
    ).rejects.toThrow('Firebase database not available');
  });
});

describe('SessionManager - Active Session', () => {
  beforeEach(() => {
    setActiveSession(null);
  });

  it('returns null when no active session', () => {
    expect(getActiveSession()).toBeNull();
  });

  it('stores and retrieves active session', () => {
    const session = { passcode: 'ABC123', name: 'Test' };
    setActiveSession(session);
    expect(getActiveSession()).toEqual(session);
  });

  it('clears active session', () => {
    setActiveSession({ passcode: 'ABC123', name: 'Test' });
    setActiveSession(null);
    expect(getActiveSession()).toBeNull();
  });
});
