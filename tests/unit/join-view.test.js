import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the router module before importing the view
vi.mock('../../public/js/core/router.js', () => ({
  registerView: vi.fn(),
  navigate: vi.fn()
}));

// Mock SyncEngine
vi.mock('../../public/js/core/sync-engine.js', () => ({
  default: {
    subscribe: vi.fn(() => vi.fn()),
    immediateWrite: vi.fn(() => Promise.resolve())
  }
}));

import { render, generateParticipantId, _escapeHtml, MAX_GROUP_SIZE } from '../../public/js/views/join-view.js';
import { registerView, navigate } from '../../public/js/core/router.js';
import SyncEngine from '../../public/js/core/sync-engine.js';

describe('JoinView', () => {
  let container;

  beforeEach(() => {
    // Set up DOM
    container = document.createElement('main');
    container.id = 'app';
    document.body.appendChild(container);

    // Set up sessionStorage with a passcode
    sessionStorage.setItem('aie_session_passcode', 'ABC123');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('registration', () => {
    it('registers with the router as "join" view', () => {
      expect(registerView).toHaveBeenCalledWith('join', expect.any(Function));
    });
  });

  describe('render', () => {
    it('renders the join form with display name and group ID inputs', () => {
      render({}, container);

      expect(container.querySelector('#display-name')).not.toBeNull();
      expect(container.querySelector('#group-id')).not.toBeNull();
      expect(container.querySelector('#join-submit-btn')).not.toBeNull();
    });

    it('renders display name input with correct attributes', () => {
      render({}, container);

      const input = container.querySelector('#display-name');
      expect(input.getAttribute('maxlength')).toBe('50');
      expect(input.getAttribute('required')).not.toBeNull();
      expect(input.getAttribute('aria-describedby')).toContain('display-name-error');
    });

    it('renders group ID input with correct attributes', () => {
      render({}, container);

      const input = container.querySelector('#group-id');
      expect(input.getAttribute('maxlength')).toBe('30');
      expect(input.getAttribute('required')).not.toBeNull();
      expect(input.getAttribute('aria-describedby')).toContain('group-id-error');
    });

    it('renders existing groups section', () => {
      render({}, container);

      const section = container.querySelector('#existing-groups');
      expect(section).not.toBeNull();
      expect(section.getAttribute('aria-label')).toBe('Existing Groups');
    });

    it('subscribes to Firebase groups path on render', () => {
      render({}, container);

      expect(SyncEngine.subscribe).toHaveBeenCalledWith(
        '/sessions/ABC123/groups',
        expect.any(Function)
      );
    });

    it('shows empty state when no groups exist', () => {
      render({}, container);

      const emptyMsg = container.querySelector('.groups-empty');
      expect(emptyMsg).not.toBeNull();
      expect(emptyMsg.textContent).toContain('No groups yet');
    });
  });

  describe('inline validation', () => {
    it('shows error for empty display name on blur', () => {
      render({}, container);

      const input = container.querySelector('#display-name');
      input.value = '';
      input.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#display-name-error');
      expect(error.textContent).toBe('Display name is required');
      expect(input.classList.contains('form-input--error')).toBe(true);
    });

    it('shows error for invalid group ID on blur', () => {
      render({}, container);

      const input = container.querySelector('#group-id');
      input.value = 'invalid-group!';
      input.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#group-id-error');
      expect(error.textContent).toBe('Group ID must contain only letters and numbers');
      expect(input.classList.contains('form-input--error')).toBe(true);
    });

    it('clears error on input for display name', () => {
      render({}, container);

      const input = container.querySelector('#display-name');
      const error = container.querySelector('#display-name-error');

      // Trigger error first
      input.value = '';
      input.dispatchEvent(new Event('blur'));
      expect(error.textContent).not.toBe('');

      // Type something
      input.value = 'Alice';
      input.dispatchEvent(new Event('input'));
      expect(error.textContent).toBe('');
      expect(input.classList.contains('form-input--error')).toBe(false);
    });

    it('clears error on input for group ID', () => {
      render({}, container);

      const input = container.querySelector('#group-id');
      const error = container.querySelector('#group-id-error');

      // Trigger error first
      input.value = 'bad!';
      input.dispatchEvent(new Event('blur'));
      expect(error.textContent).not.toBe('');

      // Type something valid
      input.value = 'team1';
      input.dispatchEvent(new Event('input'));
      expect(error.textContent).toBe('');
      expect(input.classList.contains('form-input--error')).toBe(false);
    });
  });

  describe('form submission', () => {
    it('prevents submission with empty fields', () => {
      render({}, container);

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      // Errors should be shown
      const nameError = container.querySelector('#display-name-error');
      expect(nameError.textContent).not.toBe('');
    });

    it('prevents submission with invalid group ID', () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'bad group!';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const groupError = container.querySelector('#group-id-error');
      expect(groupError.textContent).not.toBe('');
    });

    it('shows confirmation panel with valid inputs', () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'teamA';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const panel = container.querySelector('#confirmation-panel');
      expect(panel.hidden).toBe(false);
      expect(panel.textContent).toContain('teamA');
      expect(panel.textContent).toContain('Alice');
    });

    it('shows full group error when group is at max capacity', () => {
      render({}, container);

      // Simulate groups data from Firebase subscription
      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        fullGroup: {
          memberCount: 8,
          members: {
            p1: { displayName: 'M1' },
            p2: { displayName: 'M2' },
            p3: { displayName: 'M3' },
            p4: { displayName: 'M4' },
            p5: { displayName: 'M5' },
            p6: { displayName: 'M6' },
            p7: { displayName: 'M7' },
            p8: { displayName: 'M8' }
          }
        }
      });

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'fullGroup';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const groupError = container.querySelector('#group-id-error');
      expect(groupError.textContent).toContain('full');
      expect(container.querySelector('#confirmation-panel').hidden).toBe(true);
    });
  });

  describe('confirmation panel', () => {
    it('shows member list for existing group', () => {
      render({}, container);

      // Set up group data
      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        teamA: {
          memberCount: 2,
          members: {
            p1: { displayName: 'Bob' },
            p2: { displayName: 'Carol' }
          }
        }
      });

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'teamA';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const panel = container.querySelector('#confirmation-panel');
      expect(panel.textContent).toContain('Bob');
      expect(panel.textContent).toContain('Carol');
      expect(panel.textContent).toContain('2');
    });

    it('shows new group message for non-existing group', () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'newGroup';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const panel = container.querySelector('#confirmation-panel');
      expect(panel.textContent).toContain('new group');
    });

    it('hides on cancel button click', () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'teamA';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const cancelBtn = container.querySelector('#cancel-join-btn');
      cancelBtn.click();

      expect(container.querySelector('#confirmation-panel').hidden).toBe(true);
    });

    it('writes to Firebase and navigates on confirm', async () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'teamA';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const confirmBtn = container.querySelector('#confirm-join-btn');
      confirmBtn.click();

      // Wait for async operations (navigate is called after awaiting immediateWrite)
      await vi.waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('#modules');
      });

      expect(SyncEngine.immediateWrite).toHaveBeenCalled();
    });

    it('saves participant data to sessionStorage on confirm', async () => {
      render({}, container);

      container.querySelector('#display-name').value = 'Alice';
      container.querySelector('#group-id').value = 'teamA';

      const form = container.querySelector('#join-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const confirmBtn = container.querySelector('#confirm-join-btn');
      confirmBtn.click();

      await vi.waitFor(() => {
        expect(sessionStorage.getItem('aie_display_name')).toBe('Alice');
      });

      expect(sessionStorage.getItem('aie_group_id')).toBe('teamA');
      expect(sessionStorage.getItem('aie_participant_id')).not.toBeNull();
    });
  });

  describe('groups list rendering', () => {
    it('renders group cards when groups data arrives', () => {
      render({}, container);

      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        teamA: { memberCount: 3, members: { p1: { displayName: 'A' }, p2: { displayName: 'B' }, p3: { displayName: 'C' } } },
        teamB: { memberCount: 1, members: { p1: { displayName: 'D' } } }
      });

      const cards = container.querySelectorAll('.group-card');
      expect(cards.length).toBe(2);
    });

    it('marks full groups with locked styling and disables interaction', () => {
      render({}, container);

      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        fullGroup: { memberCount: 8, members: {} }
      });

      const card = container.querySelector('.group-card');
      expect(card.classList.contains('card--locked')).toBe(true);
      expect(card.getAttribute('aria-disabled')).toBe('true');
      expect(card.getAttribute('tabindex')).toBe('-1');
    });

    it('shows Full badge for groups at capacity', () => {
      render({}, container);

      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        fullGroup: { memberCount: 8, members: {} }
      });

      const badge = container.querySelector('.card__status-badge');
      expect(badge.textContent).toBe('Full');
    });

    it('clicking a group card populates the group ID input', () => {
      render({}, container);

      const subscribeCallback = SyncEngine.subscribe.mock.calls[0][1];
      subscribeCallback({
        teamA: { memberCount: 2, members: { p1: { displayName: 'Bob' } } }
      });

      const card = container.querySelector('.group-card[data-group-id="teamA"]');
      card.click();

      expect(container.querySelector('#group-id').value).toBe('teamA');
    });
  });

  describe('generateParticipantId', () => {
    it('returns a non-empty string', () => {
      const id = generateParticipantId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('returns unique IDs on multiple calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateParticipantId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('_escapeHtml', () => {
    it('escapes angle brackets', () => {
      expect(_escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes ampersands', () => {
      expect(_escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('leaves normal text unchanged', () => {
      expect(_escapeHtml('hello world')).toBe('hello world');
    });
  });

  describe('MAX_GROUP_SIZE', () => {
    it('equals 8 per requirements', () => {
      expect(MAX_GROUP_SIZE).toBe(8);
    });
  });
});
