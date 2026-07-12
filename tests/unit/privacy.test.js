/**
 * Unit tests for Privacy module
 * Tests: clearParticipantData, isDataScopedToSession, generateParticipantId,
 * verifyNoLocalStoragePersistence, verifyNoThirdPartyAnalytics, initPrivacyCleanup
 *
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  clearParticipantData,
  isDataScopedToSession,
  generateParticipantId,
  verifyNoLocalStoragePersistence,
  verifyNoThirdPartyAnalytics,
  initPrivacyCleanup,
  PRIVACY_CONSTANTS
} from '../../public/js/core/privacy.js';

describe('Privacy Module', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('clearParticipantData', () => {
    it('removes all aie_ prefixed keys from sessionStorage', () => {
      sessionStorage.setItem('aie_session_passcode', 'ABC123');
      sessionStorage.setItem('aie_participant_id', 'uuid-123');
      sessionStorage.setItem('aie_display_name', 'Alice');
      sessionStorage.setItem('aie_group_id', 'teamA');
      sessionStorage.setItem('aie_client_id', 'client-xyz');

      clearParticipantData();

      expect(sessionStorage.getItem('aie_session_passcode')).toBeNull();
      expect(sessionStorage.getItem('aie_participant_id')).toBeNull();
      expect(sessionStorage.getItem('aie_display_name')).toBeNull();
      expect(sessionStorage.getItem('aie_group_id')).toBeNull();
      expect(sessionStorage.getItem('aie_client_id')).toBeNull();
    });

    it('does not remove non-aie_ keys from sessionStorage', () => {
      sessionStorage.setItem('aie_session_passcode', 'ABC123');
      sessionStorage.setItem('other_key', 'some value');

      clearParticipantData();

      expect(sessionStorage.getItem('aie_session_passcode')).toBeNull();
      expect(sessionStorage.getItem('other_key')).toBe('some value');
    });

    it('handles empty sessionStorage gracefully', () => {
      expect(() => clearParticipantData()).not.toThrow();
    });

    it('handles sessionStorage with no aie_ keys', () => {
      sessionStorage.setItem('unrelated', 'value');

      clearParticipantData();

      expect(sessionStorage.getItem('unrelated')).toBe('value');
    });
  });

  describe('isDataScopedToSession', () => {
    it('returns true for paths correctly scoped to the session', () => {
      expect(isDataScopedToSession('/sessions/ABC123/groups/teamA', 'ABC123')).toBe(true);
      expect(isDataScopedToSession('/sessions/XYZ789/activities/module1/tool-survey', 'XYZ789')).toBe(true);
      expect(isDataScopedToSession('/sessions/TEST01/meta', 'TEST01')).toBe(true);
    });

    it('returns false for paths not scoped to the session', () => {
      expect(isDataScopedToSession('/other/path', 'ABC123')).toBe(false);
      expect(isDataScopedToSession('/sessions/DIFFERENT/groups', 'ABC123')).toBe(false);
      expect(isDataScopedToSession('/admin/settings', 'ABC123')).toBe(false);
    });

    it('returns false for root-level paths', () => {
      expect(isDataScopedToSession('/sessions', 'ABC123')).toBe(false);
      expect(isDataScopedToSession('/', 'ABC123')).toBe(false);
    });

    it('returns false for empty or invalid inputs', () => {
      expect(isDataScopedToSession('', 'ABC123')).toBe(false);
      expect(isDataScopedToSession('/sessions/ABC123/data', '')).toBe(false);
      expect(isDataScopedToSession(null, 'ABC123')).toBe(false);
      expect(isDataScopedToSession('/sessions/ABC123/data', null)).toBe(false);
      expect(isDataScopedToSession(undefined, 'ABC123')).toBe(false);
      expect(isDataScopedToSession(123, 'ABC123')).toBe(false);
    });

    it('requires exact passcode match (no partial matches)', () => {
      // Path for ABC12 should not match passcode ABC123
      expect(isDataScopedToSession('/sessions/ABC12/data', 'ABC123')).toBe(false);
      // Path must include trailing slash after passcode
      expect(isDataScopedToSession('/sessions/ABC123', 'ABC123')).toBe(false);
    });
  });

  describe('generateParticipantId', () => {
    it('generates a valid UUID v4 format string', () => {
      const id = generateParticipantId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(id).toMatch(uuidRegex);
    });

    it('generates unique IDs on successive calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateParticipantId());
      }
      expect(ids.size).toBe(100);
    });

    it('does not persist the ID anywhere', () => {
      generateParticipantId();
      // Check nothing was stored
      expect(sessionStorage.length).toBe(0);
      expect(localStorage.length).toBe(0);
    });
  });

  describe('verifyNoLocalStoragePersistence', () => {
    it('returns true when localStorage has no aie_ keys', () => {
      expect(verifyNoLocalStoragePersistence()).toBe(true);
    });

    it('returns true when localStorage has unrelated keys', () => {
      localStorage.setItem('some_other_app', 'data');
      expect(verifyNoLocalStoragePersistence()).toBe(true);
    });

    it('returns false when localStorage has aie_ prefixed keys', () => {
      localStorage.setItem('aie_participant_id', 'should-not-be-here');
      expect(verifyNoLocalStoragePersistence()).toBe(false);
    });
  });

  describe('verifyNoThirdPartyAnalytics', () => {
    beforeEach(() => {
      // Clean up any script tags from previous tests
      document.querySelectorAll('script[data-test]').forEach(s => s.remove());
    });

    afterEach(() => {
      document.querySelectorAll('script[data-test]').forEach(s => s.remove());
    });

    it('returns compliant when only Firebase SDK scripts are present', () => {
      const result = verifyNoThirdPartyAnalytics();
      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('detects third-party analytics scripts', () => {
      const script = document.createElement('script');
      script.src = 'https://www.google-analytics.com/analytics.js';
      script.setAttribute('data-test', 'true');
      document.head.appendChild(script);

      const result = verifyNoThirdPartyAnalytics();
      expect(result.compliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain('google-analytics.com');
    });

    it('allows Firebase SDK from gstatic.com', () => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
      script.setAttribute('data-test', 'true');
      document.head.appendChild(script);

      const result = verifyNoThirdPartyAnalytics();
      expect(result.compliant).toBe(true);
    });
  });

  describe('initPrivacyCleanup', () => {
    it('registers beforeunload listener that clears data', () => {
      sessionStorage.setItem('aie_participant_id', 'test-uuid');
      sessionStorage.setItem('aie_display_name', 'TestUser');

      initPrivacyCleanup();

      // Simulate beforeunload event
      const event = new Event('beforeunload');
      window.dispatchEvent(event);

      expect(sessionStorage.getItem('aie_participant_id')).toBeNull();
      expect(sessionStorage.getItem('aie_display_name')).toBeNull();
    });

    it('registers visibilitychange listener that clears data when hidden', () => {
      sessionStorage.setItem('aie_group_id', 'teamA');

      initPrivacyCleanup();

      // Simulate visibilitychange to hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(sessionStorage.getItem('aie_group_id')).toBeNull();

      // Restore visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true
      });
    });
  });

  describe('Session deletion removes all Firebase data', () => {
    it('deleteSession removes entire /sessions/{passcode} subtree', async () => {
      // This tests that the existing SessionManager.deleteSession
      // removes all data under the passcode namespace
      const { deleteSession } = await import('../../public/js/core/session-manager.js');

      const removeMock = vi.fn().mockResolvedValue(undefined);
      const mockDb = {
        ref: vi.fn(() => ({ remove: removeMock }))
      };

      await deleteSession('ABC123', { db: mockDb });

      expect(mockDb.ref).toHaveBeenCalledWith('/sessions/ABC123');
      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe('Data scoping verification', () => {
    it('all sessionStorage keys used by the app use aie_ prefix', () => {
      // Known keys used by the application
      const appKeys = [
        'aie_session_passcode',
        'aie_participant_id',
        'aie_display_name',
        'aie_group_id',
        'aie_client_id'
      ];

      for (const key of appKeys) {
        expect(key.startsWith(PRIVACY_CONSTANTS.AIE_KEY_PREFIX)).toBe(true);
      }
    });
  });
});
