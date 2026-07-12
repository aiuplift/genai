/**
 * Unit tests for DashboardView
 *
 * Tests session overview rendering, group progress display,
 * module lock/unlock controls, and real-time subscription handling.
 *
 * Requirements: 15.1, 15.2, 15.3, 15.5
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('../../public/js/core/module-registry.js', () => ({
  getAllModules: vi.fn(() => []),
  getActivity: vi.fn(() => null),
  default: { getAllModules: vi.fn(() => []), getActivity: vi.fn(() => null) }
}));

vi.mock('../../public/js/core/sync-engine.js', () => ({
  subscribe: vi.fn(() => () => {}),
  immediateWrite: vi.fn(() => Promise.resolve()),
  default: { subscribe: vi.fn(() => () => {}), immediateWrite: vi.fn(() => Promise.resolve()) }
}));

vi.mock('../../public/js/core/session-manager.js', () => ({
  getActiveSession: vi.fn(() => null),
  setActiveSession: vi.fn(),
  createSession: vi.fn(() => Promise.resolve({ passcode: 'NEW123', sessionRef: {} })),
  deleteSession: vi.fn(() => Promise.resolve()),
  default: { getActiveSession: vi.fn(() => null), setActiveSession: vi.fn(), createSession: vi.fn(), deleteSession: vi.fn() }
}));

vi.mock('../../public/js/components/progress-bar.js', () => ({
  createProgressBar: vi.fn((completed, total, options) => {
    const el = document.createElement('div');
    el.className = 'progress-bar-container';
    el.dataset.completed = String(completed);
    el.dataset.total = String(total);
    return el;
  }),
  calculateProgress: vi.fn((c, t) => t > 0 ? Math.round((c / t) * 100) : 0)
}));

vi.mock('../../public/js/core/router.js', () => ({
  navigate: vi.fn(),
  registerView: vi.fn(),
  default: { navigate: vi.fn(), registerView: vi.fn() }
}));

import { getAllModules } from '../../public/js/core/module-registry.js';
import { subscribe, immediateWrite } from '../../public/js/core/sync-engine.js';
import { getActiveSession, setActiveSession, createSession, deleteSession } from '../../public/js/core/session-manager.js';
import { createProgressBar } from '../../public/js/components/progress-bar.js';
import { registerView, navigate } from '../../public/js/core/router.js';
import {
  render,
  _cleanup,
  _renderOverview,
  _renderModuleControls,
  _renderGroups,
  _createModuleControlCard,
  _createGroupCard,
  _toggleModuleLock,
  _getGroupCurrentModule,
  _getGroupActivityProgress,
  _calculateOverallCompletion,
  _createStatItem,
  _createSessionManagementSection,
  _handleCreateSession,
  _handleDeleteSession,
  _openDrillDown,
  _closeDrillDown,
  _getGroupActivityResponses
} from '../../public/js/views/dashboard-view.js';

// --- Test fixtures ---

function createMockModules(count = 10) {
  const modules = [];
  for (let i = 1; i <= count; i++) {
    modules.push({
      id: `module${i}`,
      title: `Module ${i}: Test Module`,
      activities: [
        { id: `activity-${i}-1`, title: `Activity ${i}.1` },
        { id: `activity-${i}-2`, title: `Activity ${i}.2` }
      ]
    });
  }
  return modules;
}

describe('DashboardView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('main');
    container.id = 'app';
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    _cleanup();
    document.body.removeChild(container);
  });

  describe('render', () => {
    it('renders dashboard with heading', () => {
      getAllModules.mockReturnValue(createMockModules(10));
      getActiveSession.mockReturnValue({ passcode: 'ABC123' });

      render({}, container);

      const heading = container.querySelector('h1');
      expect(heading.textContent).toBe('Facilitator Dashboard');
    });

    it('renders section with aria-label', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const section = container.querySelector('section');
      expect(section.getAttribute('aria-label')).toBe('Facilitator Dashboard');
    });

    it('renders session overview section', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const overview = container.querySelector('.dashboard-overview');
      expect(overview).not.toBeNull();
    });

    it('renders module controls section with heading', () => {
      getAllModules.mockReturnValue(createMockModules(3));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const headings = container.querySelectorAll('h2');
      const controlsHeading = Array.from(headings).find(h => h.textContent === 'Module Controls');
      expect(controlsHeading).not.toBeUndefined();
    });

    it('renders groups section with heading', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const headings = container.querySelectorAll('h2');
      const groupsHeading = Array.from(headings).find(h => h.textContent === 'Groups');
      expect(groupsHeading).not.toBeUndefined();
    });

    it('subscribes to session data when passcode is available', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'TEST01' });

      render({}, container);

      // Should subscribe to modules, groups, and activities (3 subscriptions)
      expect(subscribe).toHaveBeenCalledTimes(3);
      expect(subscribe).toHaveBeenCalledWith('/sessions/TEST01/modules', expect.any(Function));
      expect(subscribe).toHaveBeenCalledWith('/sessions/TEST01/groups', expect.any(Function));
      expect(subscribe).toHaveBeenCalledWith('/sessions/TEST01/activities', expect.any(Function));
    });

    it('does not subscribe when no active session', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      expect(subscribe).not.toHaveBeenCalled();
    });
  });

  describe('session overview (Requirement 15.5)', () => {
    it('displays total participants, total groups, and completion percentage', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'OVER01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Simulate groups joining
      subscribeCallbacks['/sessions/OVER01/groups']({
        group1: { memberCount: 3, members: { p1: {}, p2: {}, p3: {} } },
        group2: { memberCount: 2, members: { p4: {}, p5: {} } }
      });

      const overview = container.querySelector('.dashboard-overview');
      expect(overview.textContent).toContain('5'); // total participants
      expect(overview.textContent).toContain('2'); // total groups
      expect(overview.textContent).toContain('0%'); // no completion yet
    });

    it('shows 0 when no groups exist', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'EMPTY1' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Simulate empty groups
      subscribeCallbacks['/sessions/EMPTY1/groups'](null);

      const overview = container.querySelector('.dashboard-overview');
      expect(overview.textContent).toContain('0');
    });
  });

  describe('module lock/unlock controls (Requirement 15.2)', () => {
    it('renders control card for each module', () => {
      const modules = createMockModules(10);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'CTRL01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Simulate modules all locked
      const modulesData = {};
      for (let i = 1; i <= 10; i++) {
        modulesData[`module${i}`] = { locked: true };
      }
      subscribeCallbacks['/sessions/CTRL01/modules'](modulesData);

      const controlCards = container.querySelectorAll('[data-module-id]');
      expect(controlCards.length).toBe(10);
    });

    it('shows "Unlock Module" button when module is locked', () => {
      const modules = createMockModules(1);
      getAllModules.mockReturnValue(modules);

      const card = _createModuleControlCard(modules[0], true);

      const btn = card.querySelector('button');
      expect(btn.textContent).toBe('Unlock Module');
      expect(btn.classList.contains('btn--primary')).toBe(true);
    });

    it('shows "Lock Module" button when module is unlocked', () => {
      const modules = createMockModules(1);
      getAllModules.mockReturnValue(modules);

      const card = _createModuleControlCard(modules[0], false);

      const btn = card.querySelector('button');
      expect(btn.textContent).toBe('Lock Module');
      expect(btn.classList.contains('btn--secondary')).toBe(true);
    });

    it('button has appropriate aria-label for locked state', () => {
      const moduleDef = { id: 'module1', title: 'AI Landscape', activities: [] };
      const card = _createModuleControlCard(moduleDef, true);

      const btn = card.querySelector('button');
      expect(btn.getAttribute('aria-label')).toBe('Unlock AI Landscape');
    });

    it('button has appropriate aria-label for unlocked state', () => {
      const moduleDef = { id: 'module1', title: 'AI Landscape', activities: [] };
      const card = _createModuleControlCard(moduleDef, false);

      const btn = card.querySelector('button');
      expect(btn.getAttribute('aria-label')).toBe('Lock AI Landscape');
    });

    it('shows Locked badge for locked modules', () => {
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };
      const card = _createModuleControlCard(moduleDef, true);

      const badge = card.querySelector('.card__status-badge');
      expect(badge.textContent).toBe('Locked');
    });

    it('shows Unlocked badge for unlocked modules', () => {
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };
      const card = _createModuleControlCard(moduleDef, false);

      const badge = card.querySelector('.card__status-badge');
      expect(badge.textContent).toBe('Unlocked');
    });

    it('defaults all modules to locked state (Requirement 15.2)', () => {
      const modules = createMockModules(10);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'DFLT01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Before any Firebase data arrives, module controls should reflect default locked state
      const buttons = container.querySelectorAll('[data-module-id] button');
      buttons.forEach((btn) => {
        expect(btn.textContent).toBe('Unlock Module');
      });
    });
  });

  describe('_toggleModuleLock', () => {
    it('calls immediateWrite to unlock a locked module', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'TOG123' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Find unlock button and click it
      const btn = container.querySelector('[data-module-id="module1"] button');
      btn.click();

      // Should write locked: false
      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/TOG123/modules/module1/locked',
        false
      );
      // Should write unlockedAt timestamp
      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/TOG123/modules/module1/unlockedAt',
        expect.any(Number)
      );
    });

    it('calls immediateWrite to lock an unlocked module', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'LOCK01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Simulate module unlocked
      subscribeCallbacks['/sessions/LOCK01/modules']({
        module1: { locked: false }
      });

      // Now click the Lock button
      const btn = container.querySelector('[data-module-id="module1"] button');
      btn.click();

      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/LOCK01/modules/module1/locked',
        true
      );
      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/LOCK01/modules/module1/lockedAt',
        expect.any(Number)
      );
    });
  });

  describe('group progress display (Requirement 15.1)', () => {
    it('displays groups with participant count', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'GRP001' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/GRP001/groups']({
        'Team Alpha': { memberCount: 4, members: { p1: {}, p2: {}, p3: {}, p4: {} } },
        'Team Beta': { memberCount: 2, members: { p5: {}, p6: {} } }
      });

      const groupCards = container.querySelectorAll('[data-group-id]');
      expect(groupCards.length).toBe(2);

      const alphaCard = container.querySelector('[data-group-id="Team Alpha"]');
      expect(alphaCard.textContent).toContain('Team Alpha');
      expect(alphaCard.textContent).toContain('4 participants');
    });

    it('shows empty state when no groups', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'NGRP01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/NGRP01/groups'](null);

      const groupsSection = container.querySelector('[aria-label="Group progress"]');
      expect(groupsSection.textContent).toContain('No groups have joined');
    });

    it('shows progress bar for each group', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'PROG01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Unlock modules
      subscribeCallbacks['/sessions/PROG01/modules']({
        module1: { locked: false },
        module2: { locked: false }
      });

      subscribeCallbacks['/sessions/PROG01/groups']({
        group1: { memberCount: 3 }
      });

      subscribeCallbacks['/sessions/PROG01/activities']({
        module1: {
          'activity-1-1': { completion: { group1: { status: 'completed' } } },
          'activity-1-2': { completion: { group1: { status: 'in_progress' } } }
        }
      });

      // A progress bar should be created for the group
      expect(createProgressBar).toHaveBeenCalled();
    });
  });

  describe('real-time updates (Requirement 15.3)', () => {
    it('updates group progress when activities complete', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'RT0001' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Unlock module
      subscribeCallbacks['/sessions/RT0001/modules']({ module1: { locked: false } });
      subscribeCallbacks['/sessions/RT0001/groups']({ group1: { memberCount: 2 } });

      // First update — no completions
      subscribeCallbacks['/sessions/RT0001/activities'](null);

      let groupCard = container.querySelector('[data-group-id="group1"]');
      expect(groupCard.textContent).toContain('0/2');

      // Second update — one activity completed
      subscribeCallbacks['/sessions/RT0001/activities']({
        module1: {
          'activity-1-1': { completion: { group1: { status: 'completed' } } },
          'activity-1-2': { completion: { group1: { status: 'in_progress' } } }
        }
      });

      groupCard = container.querySelector('[data-group-id="group1"]');
      expect(groupCard.textContent).toContain('1/2');
    });

    it('updates module controls when lock state changes', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'RT0002' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Initially all locked
      subscribeCallbacks['/sessions/RT0002/modules']({
        module1: { locked: true },
        module2: { locked: true }
      });

      let buttons = container.querySelectorAll('[data-module-id] button');
      buttons.forEach(btn => expect(btn.textContent).toBe('Unlock Module'));

      // Unlock module1
      subscribeCallbacks['/sessions/RT0002/modules']({
        module1: { locked: false },
        module2: { locked: true }
      });

      const module1Btn = container.querySelector('[data-module-id="module1"] button');
      const module2Btn = container.querySelector('[data-module-id="module2"] button');
      expect(module1Btn.textContent).toBe('Lock Module');
      expect(module2Btn.textContent).toBe('Unlock Module');
    });
  });

  describe('_createStatItem', () => {
    it('creates an element with value and label', () => {
      const item = _createStatItem('Total Groups', 5);

      expect(item.textContent).toContain('5');
      expect(item.textContent).toContain('Total Groups');
    });

    it('includes aria-label for accessibility', () => {
      const item = _createStatItem('Completion', '75%');

      const valueEl = item.querySelector('.dashboard-stat__value');
      expect(valueEl.getAttribute('aria-label')).toBe('Completion: 75%');
    });
  });

  describe('_calculateOverallCompletion', () => {
    it('returns 0 when no groups', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'CALC01' });

      render({}, container);

      expect(_calculateOverallCompletion()).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('calls all unsubscribe functions on cleanup', () => {
      const unsub1 = vi.fn();
      const unsub2 = vi.fn();
      const unsub3 = vi.fn();
      subscribe
        .mockReturnValueOnce(unsub1)
        .mockReturnValueOnce(unsub2)
        .mockReturnValueOnce(unsub3);

      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'CLN001' });

      render({}, container);
      _cleanup();

      expect(unsub1).toHaveBeenCalled();
      expect(unsub2).toHaveBeenCalled();
      expect(unsub3).toHaveBeenCalled();
    });

    it('clears internal state on cleanup', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'CLN002' });

      subscribe.mockImplementation((path, callback) => {
        return () => {};
      });

      render({}, container);
      _cleanup();

      // After cleanup, recalculation should return 0
      expect(_calculateOverallCompletion()).toBe(0);
    });
  });

  describe('registerView', () => {
    it('the render function is the exported render', () => {
      // registerView is called at module load time during import.
      // We verify the render function is correctly exported and matches what would be registered.
      expect(typeof render).toBe('function');
    });
  });

  describe('session management (Requirements 1.5, 1.6, 18.5)', () => {
    it('renders session management section with create form', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue({ passcode: 'SESS01' });

      render({}, container);

      const sessionMgmt = container.querySelector('.dashboard-session-mgmt');
      expect(sessionMgmt).not.toBeNull();
      expect(sessionMgmt.textContent).toContain('Session Management');

      const nameInput = container.querySelector('#create-session-name');
      expect(nameInput).not.toBeNull();
      expect(nameInput.getAttribute('aria-required')).toBe('true');
    });

    it('renders create session button', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'SESS02' });

      render({}, container);

      const createBtn = container.querySelector('.dashboard-session-mgmt button.btn--primary');
      expect(createBtn).not.toBeNull();
      expect(createBtn.textContent).toBe('Create Session');
    });

    it('renders delete session button when session is active', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DEL001' });

      render({}, container);

      const deleteBtn = container.querySelector('.dashboard-session-mgmt .btn--danger');
      expect(deleteBtn).not.toBeNull();
      expect(deleteBtn.textContent).toBe('Delete Current Session');
    });

    it('does not render delete button when no session is active', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const deleteBtn = container.querySelector('.dashboard-session-mgmt .btn--danger');
      expect(deleteBtn).toBeNull();
    });

    it('shows error when creating session with empty name', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'SESS03' });

      render({}, container);

      const createBtn = container.querySelector('.dashboard-session-mgmt button.btn--primary');
      createBtn.click();

      const messageArea = container.querySelector('.dashboard-session-message');
      expect(messageArea.textContent).toContain('Please enter a session name');
    });

    it('calls createSession when form is submitted with a name', async () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'SESS04' });
      createSession.mockResolvedValue({ passcode: 'XYZ789', sessionRef: {} });

      render({}, container);

      const nameInput = container.querySelector('#create-session-name');
      nameInput.value = 'My New Session';

      const createBtn = container.querySelector('.dashboard-session-mgmt button.btn--primary');
      createBtn.click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(createSession).toHaveBeenCalledWith(
        expect.stringContaining('facilitator-'),
        'My New Session'
      );
    });

    it('shows confirmation dialog when delete button is clicked', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DEL002' });

      render({}, container);

      const deleteBtn = container.querySelector('.dashboard-session-mgmt .btn--danger');
      deleteBtn.click();

      const dialog = document.querySelector('.dashboard-confirm-dialog');
      expect(dialog).not.toBeNull();
      expect(dialog.textContent).toContain('Are you sure');
      expect(dialog.textContent).toContain('DEL002');

      // Cleanup dialog from body
      dialog.remove();
    });

    it('cancels deletion when cancel button is clicked', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DEL003' });

      render({}, container);

      const deleteBtn = container.querySelector('.dashboard-session-mgmt .btn--danger');
      deleteBtn.click();

      const dialog = document.querySelector('.dashboard-confirm-dialog');
      const cancelBtn = dialog.querySelector('.btn--secondary');
      cancelBtn.click();

      expect(document.querySelector('.dashboard-confirm-dialog')).toBeNull();
    });

    it('calls deleteSession and navigates away on confirm', async () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DEL004' });
      deleteSession.mockResolvedValue();

      render({}, container);

      const deleteBtn = container.querySelector('.dashboard-session-mgmt .btn--danger');
      deleteBtn.click();

      const dialog = document.querySelector('.dashboard-confirm-dialog');
      const confirmBtn = dialog.querySelector('.btn--danger');
      confirmBtn.click();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(deleteSession).toHaveBeenCalledWith('DEL004');
      expect(setActiveSession).toHaveBeenCalledWith(null);
      expect(navigate).toHaveBeenCalledWith('#login');
    });
  });

  describe('lock notifications (Requirement 15.6)', () => {
    it('writes lock notification when locking a module', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'NOTF01' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Simulate module unlocked
      subscribeCallbacks['/sessions/NOTF01/modules']({
        module1: { locked: false }
      });

      // Click lock button
      const btn = container.querySelector('[data-module-id="module1"] button');
      btn.click();

      // Should write the lock notification
      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/NOTF01/modules/module1/lockNotification',
        expect.objectContaining({
          locked: true,
          lockedBy: 'facilitator',
          timestamp: expect.any(Number),
          message: expect.stringContaining('locked by the facilitator')
        })
      );
    });

    it('does not write lock notification when unlocking a module', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'NOTF02' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Module starts locked (default)
      // Click unlock button
      const btn = container.querySelector('[data-module-id="module1"] button');
      btn.click();

      // Should NOT write a lockNotification path when unlocking
      const lockNotifCalls = immediateWrite.mock.calls.filter(
        call => call[0].includes('lockNotification')
      );
      expect(lockNotifCalls.length).toBe(0);
    });
  });

  describe('drill-down panel (Requirement 15.4)', () => {
    it('renders "View Responses" button on group cards', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DRILL1' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/DRILL1/groups']({
        'Team A': { memberCount: 3 }
      });

      const groupCard = container.querySelector('[data-group-id="Team A"]');
      const viewBtn = groupCard.querySelector('button.btn--secondary');
      expect(viewBtn).not.toBeNull();
      expect(viewBtn.textContent).toBe('View Responses');
      expect(viewBtn.getAttribute('aria-label')).toBe('View responses for Team A');
    });

    it('opens drill-down panel when View Responses is clicked', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DRILL2' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/DRILL2/modules']({ module1: { locked: false } });
      subscribeCallbacks['/sessions/DRILL2/groups']({ 'TeamX': { memberCount: 2 } });
      subscribeCallbacks['/sessions/DRILL2/activities']({
        module1: {
          'activity-1-1': { responses: { TeamX: { field1: { value: 'hello', updatedBy: 'p1' } } } }
        }
      });

      const viewBtn = container.querySelector('[data-group-id="TeamX"] button.btn--secondary');
      viewBtn.click();

      const panel = container.querySelector('.dashboard-drilldown');
      expect(panel.hidden).toBe(false);
      expect(panel.textContent).toContain('Responses: TeamX');
      expect(panel.textContent).toContain('hello');
    });

    it('shows empty message when no responses exist', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DRILL3' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/DRILL3/modules']({ module1: { locked: false } });
      subscribeCallbacks['/sessions/DRILL3/groups']({ 'EmptyG': { memberCount: 2 } });
      subscribeCallbacks['/sessions/DRILL3/activities'](null);

      const viewBtn = container.querySelector('[data-group-id="EmptyG"] button.btn--secondary');
      viewBtn.click();

      const panel = container.querySelector('.dashboard-drilldown');
      expect(panel.textContent).toContain('No responses submitted yet');
    });

    it('only shows responses for unlocked modules', () => {
      const modules = createMockModules(2);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'DRILL4' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Only module1 is unlocked
      subscribeCallbacks['/sessions/DRILL4/modules']({
        module1: { locked: false },
        module2: { locked: true }
      });
      subscribeCallbacks['/sessions/DRILL4/groups']({ 'G1': { memberCount: 2 } });
      subscribeCallbacks['/sessions/DRILL4/activities']({
        module1: {
          'activity-1-1': { responses: { G1: { field1: { value: 'response1' } } } }
        },
        module2: {
          'activity-2-1': { responses: { G1: { field2: { value: 'hidden' } } } }
        }
      });

      const viewBtn = container.querySelector('[data-group-id="G1"] button.btn--secondary');
      viewBtn.click();

      const panel = container.querySelector('.dashboard-drilldown');
      expect(panel.textContent).toContain('response1');
      expect(panel.textContent).not.toContain('hidden');
    });

    it('closes drill-down panel when close button is clicked', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'DRILL5' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      subscribeCallbacks['/sessions/DRILL5/modules']({ module1: { locked: false } });
      subscribeCallbacks['/sessions/DRILL5/groups']({ 'G2': { memberCount: 1 } });
      subscribeCallbacks['/sessions/DRILL5/activities'](null);

      const viewBtn = container.querySelector('[data-group-id="G2"] button.btn--secondary');
      viewBtn.click();

      const panel = container.querySelector('.dashboard-drilldown');
      expect(panel.hidden).toBe(false);

      const closeBtn = panel.querySelector('button');
      closeBtn.click();

      expect(panel.hidden).toBe(true);
    });
  });
});
