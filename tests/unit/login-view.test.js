/**
 * Unit tests for LoginView
 *
 * Tests: rendering, form submission, error display, lockout, accessibility
 * Requirements: 1.2, 1.3, 1.4, 17.4, 17.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '../../public/js/views/login-view.js';

// Mock SessionManager
vi.mock('../../public/js/core/session-manager.js', () => {
  const mockSessionManager = {
    validatePasscode: vi.fn(),
    normalizePasscode: vi.fn((input) => (typeof input === 'string' ? input.trim().toUpperCase() : '')),
    isValidPasscodeFormat: vi.fn((p) => /^[A-Z0-9]{6}$/.test(p)),
    isLockedOut: vi.fn(() => ({ locked: false })),
    recordFailedAttempt: vi.fn(),
    setActiveSession: vi.fn(),
    getActiveSession: vi.fn(() => null),
  };
  return { default: mockSessionManager };
});

// Mock router navigate
vi.mock('../../public/js/core/router.js', () => ({
  navigate: vi.fn(),
}));

import SessionManager from '../../public/js/core/session-manager.js';
import { navigate } from '../../public/js/core/router.js';

describe('LoginView', () => {
  let container;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('main');
    container.id = 'app';
    document.body.appendChild(container);

    // Reset mocks
    vi.clearAllMocks();
    SessionManager.isLockedOut.mockReturnValue({ locked: false });
    SessionManager.validatePasscode.mockResolvedValue({ valid: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('renders the login form with required elements', () => {
      render({}, container);

      expect(container.querySelector('#login-form')).not.toBeNull();
      expect(container.querySelector('#passcode-input')).not.toBeNull();
      expect(container.querySelector('#login-submit')).not.toBeNull();
      expect(container.querySelector('#passcode-error')).not.toBeNull();
      expect(container.querySelector('#lockout-message')).not.toBeNull();
    });

    it('renders heading with correct text', () => {
      render({}, container);

      const heading = container.querySelector('#login-heading');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toBe('Join a Session');
    });

    it('hides lockout message initially when not locked out', () => {
      render({}, container);

      const lockoutMsg = container.querySelector('#lockout-message');
      expect(lockoutMsg.hidden).toBe(true);
    });
  });

  describe('Accessibility (Requirements 17.4, 17.5)', () => {
    it('passcode input has an associated label', () => {
      render({}, container);

      const label = container.querySelector('label[for="passcode-input"]');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Session Passcode');
    });

    it('passcode input has aria-required attribute', () => {
      render({}, container);

      const input = container.querySelector('#passcode-input');
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('passcode input is described by help and error elements', () => {
      render({}, container);

      const input = container.querySelector('#passcode-input');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('passcode-help');
      expect(describedBy).toContain('passcode-error');
    });

    it('error area has role=alert for screen reader announcements', () => {
      render({}, container);

      const errorEl = container.querySelector('#passcode-error');
      expect(errorEl.getAttribute('role')).toBe('alert');
      expect(errorEl.getAttribute('aria-live')).toBe('assertive');
    });

    it('lockout message has role=alert', () => {
      render({}, container);

      const lockoutMsg = container.querySelector('#lockout-message');
      expect(lockoutMsg.getAttribute('role')).toBe('alert');
    });

    it('focuses the passcode input on mount', () => {
      render({}, container);

      // requestAnimationFrame is used; advance timers
      vi.runAllTimers();

      const input = container.querySelector('#passcode-input');
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Form Submission — Valid Passcode (Requirement 1.2)', () => {
    it('navigates to #join on valid passcode', async () => {
      SessionManager.validatePasscode.mockResolvedValue({
        valid: true,
        sessionData: { passcode: 'ABC123', name: 'Test Session', facilitatorId: 'fac1' },
      });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'abc123';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      // Wait for async validation
      await vi.runAllTimersAsync();

      expect(SessionManager.setActiveSession).toHaveBeenCalledWith(
        expect.objectContaining({ passcode: 'ABC123' })
      );
      expect(navigate).toHaveBeenCalledWith('#join');
    });
  });

  describe('Form Submission — Invalid Passcode (Requirement 1.3)', () => {
    it('displays error message when passcode is invalid', async () => {
      SessionManager.validatePasscode.mockResolvedValue({ valid: false });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'XXXXXX';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      const errorEl = container.querySelector('#passcode-error');
      expect(errorEl.textContent).toContain('Invalid passcode');
    });

    it('adds error styling to input on invalid passcode', async () => {
      SessionManager.validatePasscode.mockResolvedValue({ valid: false });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'XXXXXX';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      expect(input.classList.contains('form-input--error')).toBe(true);
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('records failed attempt on invalid passcode', async () => {
      SessionManager.validatePasscode.mockResolvedValue({ valid: false });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'XXXXXX';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      expect(SessionManager.recordFailedAttempt).toHaveBeenCalled();
    });

    it('shows client-side validation error for invalid format', async () => {
      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'AB'; // Too short
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      const errorEl = container.querySelector('#passcode-error');
      expect(errorEl.textContent).toContain('valid 6-character passcode');
      // Should NOT call validatePasscode for invalid format
      expect(SessionManager.validatePasscode).not.toHaveBeenCalled();
    });
  });

  describe('Lockout Display (Requirement 1.4)', () => {
    it('shows lockout message when locked out on initial render', () => {
      SessionManager.isLockedOut.mockReturnValue({ locked: true, remainingSeconds: 120 });

      render({}, container);

      const lockoutMsg = container.querySelector('#lockout-message');
      expect(lockoutMsg.hidden).toBe(false);

      const countdown = container.querySelector('#lockout-countdown');
      expect(countdown.textContent).toBe('2:00');
    });

    it('disables input and submit button during lockout', () => {
      SessionManager.isLockedOut.mockReturnValue({ locked: true, remainingSeconds: 60 });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const submit = container.querySelector('#login-submit');
      expect(input.disabled).toBe(true);
      expect(submit.disabled).toBe(true);
    });

    it('counts down the lockout timer', () => {
      SessionManager.isLockedOut.mockReturnValue({ locked: true, remainingSeconds: 3 });

      render({}, container);

      const countdown = container.querySelector('#lockout-countdown');
      expect(countdown.textContent).toBe('0:03');

      vi.advanceTimersByTime(1000);
      expect(countdown.textContent).toBe('0:02');

      vi.advanceTimersByTime(1000);
      expect(countdown.textContent).toBe('0:01');
    });

    it('re-enables form when lockout expires', () => {
      SessionManager.isLockedOut.mockReturnValue({ locked: true, remainingSeconds: 2 });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const submit = container.querySelector('#login-submit');
      const lockoutMsg = container.querySelector('#lockout-message');

      vi.advanceTimersByTime(2000);

      expect(input.disabled).toBe(false);
      expect(submit.disabled).toBe(false);
      expect(lockoutMsg.hidden).toBe(true);
    });

    it('triggers lockout after 5 failed attempts', async () => {
      SessionManager.validatePasscode.mockResolvedValue({ valid: false });
      // Mock isLockedOut calls in sequence:
      // 1. render → _checkAndShowLockout (not locked)
      // 2. form submit pre-check (not locked)
      // 3. after recordFailedAttempt check (now locked)
      let callCount = 0;
      SessionManager.isLockedOut.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return { locked: false };
        }
        return { locked: true, remainingSeconds: 300 };
      });

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'XXXXXX';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      // Flush the resolved promise from validatePasscode
      await new Promise(process.nextTick);
      // Advance timers for any setInterval/setTimeout
      vi.advanceTimersByTime(0);

      const lockoutMsg = container.querySelector('#lockout-message');
      expect(lockoutMsg.hidden).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('shows connection error when validation throws', async () => {
      SessionManager.validatePasscode.mockRejectedValue(new Error('Network error'));

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');

      input.value = 'ABC123';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      const errorEl = container.querySelector('#passcode-error');
      expect(errorEl.textContent).toContain('connection');
    });

    it('re-enables submit button after error', async () => {
      SessionManager.validatePasscode.mockRejectedValue(new Error('fail'));

      render({}, container);

      const input = container.querySelector('#passcode-input');
      const form = container.querySelector('#login-form');
      const submit = container.querySelector('#login-submit');

      input.value = 'ABC123';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await vi.runAllTimersAsync();

      expect(submit.disabled).toBe(false);
      expect(submit.textContent).toBe('Join Session');
    });
  });
});
